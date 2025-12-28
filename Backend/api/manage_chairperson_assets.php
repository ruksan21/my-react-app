<?php
/**
 * Manage Chairperson Personal Assets API
 * Handles CRUD operations for chairperson's personal property declaration
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

// GET - Fetch personal assets for a ward/chairperson
if ($method === 'GET') {
    $ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;
    
    if ($ward_id === 0) {
        echo json_encode(array("success" => false, "message" => "Ward ID required."));
        exit();
    }
    
    $query = "SELECT * FROM chairperson_personal_assets WHERE ward_id = $ward_id ORDER BY created_at DESC";
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

// POST - Add or Update personal asset
if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"));
    
    // Update existing asset
    if (isset($data->id)) {
        $asset_id = intval($data->id);
        $updates = array();
        
        if (isset($data->asset_type)) $updates[] = "asset_type = '" . $conn->real_escape_string($data->asset_type) . "'";
        if (isset($data->asset_name)) $updates[] = "asset_name = '" . $conn->real_escape_string($data->asset_name) . "'";
        if (isset($data->description)) $updates[] = "description = '" . $conn->real_escape_string($data->description) . "'";
        if (isset($data->location)) $updates[] = "location = '" . $conn->real_escape_string($data->location) . "'";
        if (isset($data->value)) $updates[] = "value = " . floatval($data->value);
        if (isset($data->acquired_date)) $updates[] = "acquired_date = '" . $conn->real_escape_string($data->acquired_date) . "'";
        if (isset($data->ownership_type)) $updates[] = "ownership_type = '" . $conn->real_escape_string($data->ownership_type) . "'";
        
        if (empty($updates)) {
            echo json_encode(array("success" => false, "message" => "No fields to update."));
            exit();
        }
        
        $query = "UPDATE chairperson_personal_assets SET " . implode(", ", $updates) . " WHERE id = $asset_id";
        
        if ($conn->query($query)) {
            echo json_encode(array("success" => true, "message" => "Personal asset updated successfully."));
        } else {
            echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
        }
    }
    // Add new personal asset
    else {
        if (!isset($data->ward_id) || !isset($data->asset_type) || !isset($data->asset_name)) {
            echo json_encode(array("success" => false, "message" => "Required fields missing."));
            exit();
        }
        
        $ward_id = intval($data->ward_id);
        $asset_type = $conn->real_escape_string($data->asset_type);
        $asset_name = $conn->real_escape_string($data->asset_name);
        $description = isset($data->description) ? $conn->real_escape_string($data->description) : '';
        $location = isset($data->location) ? $conn->real_escape_string($data->location) : '';
        $value = isset($data->value) ? floatval($data->value) : 0;
        $acquired_date = isset($data->acquired_date) ? $conn->real_escape_string($data->acquired_date) : NULL;
        $ownership_type = isset($data->ownership_type) ? $conn->real_escape_string($data->ownership_type) : 'self';
        
        $query = "INSERT INTO chairperson_personal_assets (ward_id, asset_type, asset_name, description, location, value, acquired_date, ownership_type) 
                  VALUES ($ward_id, '$asset_type', '$asset_name', '$description', '$location', $value, " . 
                  ($acquired_date ? "'$acquired_date'" : "NULL") . ", '$ownership_type')";
        
        if ($conn->query($query)) {
            echo json_encode(array("success" => true, "message" => "Personal asset added successfully.", "id" => $conn->insert_id));
        } else {
            echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
        }
    }
    exit();
}

// DELETE - Remove personal asset
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->id)) {
        echo json_encode(array("success" => false, "message" => "Asset ID required."));
        exit();
    }
    
    $asset_id = intval($data->id);
    $query = "DELETE FROM chairperson_personal_assets WHERE id = $asset_id";
    
    if ($conn->query($query)) {
        echo json_encode(array("success" => true, "message" => "Personal asset deleted successfully."));
    } else {
        echo json_encode(array("success" => false, "message" => "Database error: " . $conn->error));
    }
    exit();
}

echo json_encode(array("success" => false, "message" => "Invalid request method."));
?>
