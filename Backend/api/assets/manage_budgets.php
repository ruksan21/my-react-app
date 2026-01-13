<?php
// Prevent warnings/notices from breaking JSON
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    ob_end_flush();
    exit();
}

require_once '../db_connect.php';
require_once '../utils/ward_utils.php';

// Clear any prior output
ob_clean();

// Using shared verifyWardAccess from utils

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch budget data for a ward
if ($method === 'GET') {
    $ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;
    
    // Officer work location filters
    $work_province = isset($_GET['work_province']) ? $conn->real_escape_string($_GET['work_province']) : null;
    $work_district = isset($_GET['work_district']) ? $conn->real_escape_string($_GET['work_district']) : null;
    $work_municipality = isset($_GET['work_municipality']) ? $conn->real_escape_string($_GET['work_municipality']) : null;
    $work_ward = isset($_GET['work_ward']) ? intval($_GET['work_ward']) : null;
    
    if ($ward_id === 0 && !($work_province || $work_district || $work_municipality || $work_ward)) {
        echo json_encode(["success" => false, "message" => "Ward ID or work location required"]);
        exit();
    }
    
    if ($ward_id > 0) {
        $sql = "SELECT * FROM ward_budgets WHERE ward_id = ? ORDER BY created_at DESC LIMIT 1";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $ward_id);
    } else {
        // Filter by work location
        $sql = "SELECT wb.* FROM ward_budgets wb
                INNER JOIN wards w ON wb.ward_id = w.id
                INNER JOIN districts d ON w.district_id = d.id
                WHERE 1=1";
        
        $params = [];
        $types = "";
        
        if ($work_province) {
            $sql .= " AND d.province = ?";
            $params[] = $work_province;
            $types .= "s";
        }
        if ($work_district) {
            $sql .= " AND d.name = ?";
            $params[] = $work_district;
            $types .= "s";
        }
        if ($work_municipality) {
            $sql .= " AND w.municipality = ?";
            $params[] = $work_municipality;
            $types .= "s";
        }
        if ($work_ward) {
            $sql .= " AND w.ward_number = ?";
            $params[] = $work_ward;
            $types .= "i";
        }
        
        $sql .= " ORDER BY wb.created_at DESC LIMIT 1";
        $stmt = $conn->prepare($sql);
        
        if (!empty($params)) {
            $stmt->bind_param($types, ...$params);
        }
    }
    
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
    
    // Allow resolving ward by officer work location if ward_id is missing
    if ($ward_id === 0 && $officer_id > 0) {
        $ward_id = getOfficerWardIdOrError($conn, $officer_id, true);
    }

    if ($ward_id === 0 || $officer_id === 0) {
        ob_clean();
        echo json_encode(["success" => false, "message" => "Ward ID/Work location and Officer ID required"]);
        ob_end_flush();
        exit();
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
        // Fetch location details for the notification source safely
        $w_sql = "SELECT province, district_name, municipality, ward_number FROM wards WHERE id = ?";
        $w_stmt = $conn->prepare($w_sql);
        $w_stmt->bind_param("i", $ward_id);
        $w_stmt->execute();
        $w_res = $w_stmt->get_result();
        $w_data = $w_res ? $w_res->fetch_assoc() : null;
        $w_stmt->close();

        $notif_title = "💰 Budget Update";
        $notif_msg = $fiscal_year ? ("Budget saved for fiscal year: " . $fiscal_year) : "Budget details updated.";

        /*
        // Commented out as requested - redundant
        if ($w_data) {
            $notif_sql = "INSERT INTO notifications (ward_id, title, message, type, source_province, source_district, source_municipality, source_ward, is_read, created_at) VALUES (?, ?, ?, 'budget', ?, ?, ?, ?, 0, NOW())";
            if ($notif_stmt = $conn->prepare($notif_sql)) {
                $notif_stmt->bind_param("isssssi", $ward_id, $notif_title, $notif_msg, $w_data['province'], $w_data['district_name'], $w_data['municipality'], $w_data['ward_number']);
                $notif_stmt->execute();
                $notif_stmt->close();
            }
        }
        */

        ob_clean();
        echo json_encode(["success" => true, "message" => "Budget saved successfully"]);
    } else {
        ob_clean();
        echo json_encode(["success" => false, "message" => "Error saving budget: " . $conn->error]);
    }
    
    $stmt->close();
    $check_stmt->close();
}

$conn->close();
ob_end_flush();
?>
