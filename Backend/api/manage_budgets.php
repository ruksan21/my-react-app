<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';
require_once 'verify_ward_access.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch budget data for a ward
if ($method === 'GET') {
    $ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;
    
    if ($ward_id === 0) {
        echo json_encode(["success" => false, "message" => "Ward ID required"]);
        exit();
    }
    
    $sql = "SELECT * FROM ward_budgets WHERE ward_id = ? ORDER BY created_at DESC LIMIT 1";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $ward_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $budget = $result->fetch_assoc();
        echo json_encode(["success" => true, "data" => $budget]);
    } else {
        echo json_encode(["success" => true, "data" => null]);
    }
    
    $stmt->close();
}

// POST - Create or update budget
else if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $ward_id = isset($data['ward_id']) ? intval($data['ward_id']) : 0;
    $officer_id = isset($data['officer_id']) ? intval($data['officer_id']) : 0;
    $total_allocated = isset($data['total_allocated']) ? floatval($data['total_allocated']) : 0;
    $total_spent = isset($data['total_spent']) ? floatval($data['total_spent']) : 0;
    $total_beneficiaries = isset($data['total_beneficiaries']) ? intval($data['total_beneficiaries']) : 0;
    $direct_beneficiaries = isset($data['direct_beneficiaries']) ? intval($data['direct_beneficiaries']) : 0;
    $indirect_beneficiaries = isset($data['indirect_beneficiaries']) ? intval($data['indirect_beneficiaries']) : 0;
    $fiscal_year = isset($data['fiscal_year']) ? $conn->real_escape_string($data['fiscal_year']) : '';
    
    if ($ward_id === 0 || $officer_id === 0) {
        echo json_encode(["success" => false, "message" => "Ward ID and Officer ID required"]);
        exit();
    }

    // Verify access
    if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
        sendUnauthorizedResponse();
    }
    
    // Check if budget exists for this ward
    $check_sql = "SELECT id FROM ward_budgets WHERE ward_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("i", $ward_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        // Update existing budget
        $sql = "UPDATE ward_budgets SET 
                total_allocated = ?, 
                total_spent = ?, 
                total_beneficiaries = ?, 
                direct_beneficiaries = ?, 
                indirect_beneficiaries = ?, 
                fiscal_year = ?
                WHERE ward_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ddiiisi", $total_allocated, $total_spent, $total_beneficiaries, 
                         $direct_beneficiaries, $indirect_beneficiaries, $fiscal_year, $ward_id);
    } else {
        // Insert new budget
        $sql = "INSERT INTO ward_budgets (ward_id, officer_id, total_allocated, total_spent, 
                total_beneficiaries, direct_beneficiaries, indirect_beneficiaries, fiscal_year) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("iiddiiis", $ward_id, $officer_id, $total_allocated, $total_spent, 
                         $total_beneficiaries, $direct_beneficiaries, $indirect_beneficiaries, $fiscal_year);
    }
    
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Budget saved successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Error saving budget: " . $conn->error]);
    }
    
    $stmt->close();
    $check_stmt->close();
}

$conn->close();
?>
