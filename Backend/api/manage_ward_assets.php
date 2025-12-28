<?php
/**
 * Manage Ward Assets API
 * Handles CRUD operations for ward assets
 */
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch assets for a ward
if ($method === 'GET') {
    $ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;
    
    if ($ward_id === 0) {
        echo json_encode(array("success" => false, "message" => "Ward ID required."));
        exit();
    }
    
    $query = "SELECT * FROM ward_assets WHERE ward_id = $ward_id ORDER BY created_at DESC";
    $result = $conn->query($query);
    
    $assets = array();
    if ($result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $assets[] = $row;
        }
    }
    
    echo json_encode(array("success" => true, "data" => $assets));
    exit();
}

// POST - Add or Update asset
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Update existing asset
    if (isset($data->id)) {
        $asset_id = intval($data->id);
        $updates = array();
        
        if (isset($data->asset_type)) $updates[] = "asset_type = '" . $conn->real_escape_string($data->asset_type) . "'";
        if (isset($data->asset_name)) $updates[] = "asset_name = '" . $conn->real_escape_string($data->asset_name) . "'";
        if (isset($data->description)) $updates[] = "description = '" . $conn->real_escape_string($data->description) . "'";
        if (isset($data->value)) $updates[] = "value = " . floatval($data->value);
        if (isset($data->acquisition_date)) $updates[] = "acquisition_date = '" . $conn->real_escape_string($data->acquisition_date) . "'";
        if (isset($data->status)) $updates[] = "status = '" . $conn->real_escape_string($data->status) . "'";
        
        if (empty($updates)) {
            echo json_encode(array("success" => false, "message" => "No fields to update."));
            exit();
        }
        
        $query = "UPDATE ward_assets SET " . implode(", ", $updates) . " WHERE id = $asset_id";
        
        if ($conn->query($query)) {
            echo json_encode(array("success" => true, "message" => "Asset updated successfully."));
        } else {
            echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
        }
    }
    // Add new asset
    else {
        if (!isset($data->ward_id) || !isset($data->asset_type) || !isset($data->asset_name)) {
            echo json_encode(array("success" => false, "message" => "Required fields missing."));
            exit();
        }
        
        $ward_id = intval($data->ward_id);
        $asset_type = $conn->real_escape_string($data->asset_type);
        $asset_name = $conn->real_escape_string($data->asset_name);
        $description = isset($data->description) ? $conn->real_escape_string($data->description) : '';
        $value = isset($data->value) ? floatval($data->value) : 0;
        $acquisition_date = isset($data->acquisition_date) ? $conn->real_escape_string($data->acquisition_date) : NULL;
        $status = isset($data->status) ? $conn->real_escape_string($data->status) : 'active';
        
        $query = "INSERT INTO ward_assets (ward_id, asset_type, asset_name, description, value, acquisition_date, status) 
                  VALUES ($ward_id, '$asset_type', '$asset_name', '$description', $value, " . 
                  ($acquisition_date ? "'$acquisition_date'" : "NULL") . ", '$status')";
        
        if ($conn->query($query)) {
            echo json_encode(array("success" => true, "message" => "Asset added successfully.", "id" => $conn->insert_id));
        } else {
            echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
        }
    }
    exit();
}

// DELETE - Remove asset
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->id)) {
        echo json_encode(array("success" => false, "message" => "Asset ID required."));
        exit();
    }
    
    $asset_id = intval($data->id);
    $query = "DELETE FROM ward_assets WHERE id = $asset_id";
    
    if ($conn->query($query)) {
        echo json_encode(array("success" => true, "message" => "Asset deleted successfully."));
    } else {
        echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
    }
    exit();
}

echo json_encode(array("success" => false, "message" => "Invalid request method."));
?>
