<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';
require_once '../wards/verify_ward_access.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch all departments for a ward
if ($method === 'GET') {
    $ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;
    
    // Officer work location filters
    $work_province = isset($_GET['work_province']) ? $conn->real_escape_string($_GET['work_province']) : null;
    $work_district = isset($_GET['work_district']) ? $conn->real_escape_string($_GET['work_district']) : null;
    $work_municipality = isset($_GET['work_municipality']) ? $conn->real_escape_string($_GET['work_municipality']) : null;
    $work_ward = isset($_GET['work_ward']) ? intval($_GET['work_ward']) : null;

    if ($ward_id === 0) {
        if ($work_province && $work_district && $work_municipality && $work_ward) {
            require_once '../wards/find_ward_by_location.php';
            $ward_id = resolveWardIdStrict($conn, $work_province, $work_district, $work_municipality, $work_ward);
            if ($ward_id === 0) {
                http_response_code(422);
                echo json_encode(["success" => false, "message" => "Ward not found for work location."]);
                exit();
            }
        } else {
            echo json_encode(["success" => false, "message" => "Ward ID or work location required"]);
            exit();
        }
    }
    
    $sql = "SELECT * FROM ward_departments WHERE ward_id = ? ORDER BY created_at DESC";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $ward_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $departments = [];
    while ($row = $result->fetch_assoc()) {
        $departments[] = $row;
    }
    
    echo json_encode(["success" => true, "data" => $departments, "ward_id" => $ward_id]);
    $stmt->close();
}

// POST - Create new department
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $ward_id = isset($data['ward_id']) ? intval($data['ward_id']) : 0;
    $officer_id = isset($data['officer_id']) ? intval($data['officer_id']) : 0;
    
    if ($ward_id === 0) {
        $work_province = $data['work_province'] ?? null;
        $work_district = $data['work_district'] ?? null;
        $work_municipality = $data['work_municipality'] ?? null;
        $work_ward = $data['work_ward'] ?? null;
        
        if ($work_province && $work_district && $work_municipality && $work_ward) {
            require_once '../wards/find_ward_by_location.php';
            $ward_id = resolveWardIdStrict($conn, $work_province, $work_district, $work_municipality, $work_ward);
        }
    }

    $name = isset($data['name']) ? $conn->real_escape_string($data['name']) : '';
    $head_name = isset($data['headName']) ? $conn->real_escape_string($data['headName']) : '';
    $phone = isset($data['phone']) ? $conn->real_escape_string($data['phone']) : '';
    $email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
    $icon = isset($data['icon']) ? $conn->real_escape_string($data['icon']) : '🏢';
    
    if ($ward_id === 0 || $officer_id === 0 || empty($name)) {
        echo json_encode(["success" => false, "message" => "Ward ID/location, Officer ID, and Department Name are required"]);
        exit();
    }

    // Verify access
    if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
        sendUnauthorizedResponse();
    }
    
    $sql = "INSERT INTO ward_departments (ward_id, officer_id, name, head_name, phone, email, icon) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iisssss", $ward_id, $officer_id, $name, $head_name, $phone, $email, $icon);
    
    if ($stmt->execute()) {
        $dept_id = $conn->insert_id;
        echo json_encode([
            "success" => true, 
            "message" => "Department added successfully",
            "id" => $dept_id
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Error adding department: " . $conn->error]);
    }
    
    $stmt->close();
}

// PUT - Update department
else if ($method === 'PUT') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $id = isset($data['id']) ? intval($data['id']) : 0;
    $officer_id = isset($data['officer_id']) ? intval($data['officer_id']) : 0;
    $name = isset($data['name']) ? $conn->real_escape_string($data['name']) : '';
    $head_name = isset($data['headName']) ? $conn->real_escape_string($data['headName']) : '';
    $phone = isset($data['phone']) ? $conn->real_escape_string($data['phone']) : '';
    $email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
    $icon = isset($data['icon']) ? $conn->real_escape_string($data['icon']) : '🏢';
    
    if ($id === 0 || $officer_id === 0 || empty($name)) {
        echo json_encode(["success" => false, "message" => "Department ID, Officer ID, and Name are required"]);
        exit();
    }

    // First, resolve the ward_id for this department to verify access
    $ward_q = "SELECT ward_id FROM ward_departments WHERE id = ?";
    $stmt_w = $conn->prepare($ward_q);
    $stmt_w->bind_param("i", $id);
    $stmt_w->execute();
    $res_w = $stmt_w->get_result();
    $ward_id = ($res_w && $row = $res_w->fetch_assoc()) ? $row['ward_id'] : 0;
    $stmt_w->close();

    if ($ward_id === 0) {
        echo json_encode(["success" => false, "message" => "Department not found."]);
        exit();
    }

    // Verify access
    if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
        sendUnauthorizedResponse();
    }
    
    $sql = "UPDATE ward_departments SET name = ?, head_name = ?, phone = ?, email = ?, icon = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssi", $name, $head_name, $phone, $email, $icon, $id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Department updated successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error updating department: " . $conn->error]);
    }
    
    $stmt->close();
}

// DELETE - Remove a department
else if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $dept_id = isset($data['id']) ? intval($data['id']) : 0;
    $officer_id = isset($data['officer_id']) ? intval($data['officer_id']) : 0;
    
    if ($dept_id === 0 || $officer_id === 0) {
        echo json_encode(["success" => false, "message" => "Department ID and Officer ID required"]);
        exit();
    }

    // Resolve ward_id to verify access
    $ward_q = "SELECT ward_id FROM ward_departments WHERE id = ?";
    $stmt_w = $conn->prepare($ward_q);
    $stmt_w->bind_param("i", $dept_id);
    $stmt_w->execute();
    $res_w = $stmt_w->get_result();
    $ward_id = ($res_w && $row = $res_w->fetch_assoc()) ? $row['ward_id'] : 0;
    $stmt_w->close();

    if ($ward_id > 0) {
        if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
            sendUnauthorizedResponse();
        }
    }
    
    $sql = "DELETE FROM ward_departments WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $dept_id);
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Department deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error deleting department: " . $conn->error]);
    }
    
    $stmt->close();
}

$conn->close();
?>
