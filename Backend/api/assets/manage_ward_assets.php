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

require_once '../db_connect.php';

// Helper function to resolve ward ID
function resolveWardIdStrict($conn, $province, $district, $municipality, $ward_number) {
    $stmt = $conn->prepare("SELECT id FROM wards WHERE province = ? AND district = ? AND municipality = ? AND ward_number = ? LIMIT 1");
    $stmt->bind_param("sssi", $province, $district, $municipality, $ward_number);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result && $row = $result->fetch_assoc()) {
        $ward_id = $row['id'];
    } else {
        $ward_id = 0;
    }
    $stmt->close();
    return $ward_id;
}

// Helper function to verify ward access
function verifyWardAccess($conn, $officer_id, $ward_id) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE id = ? AND ward_id = ? AND role = 'officer' AND status = 'approved'");
    $stmt->bind_param("ii", $officer_id, $ward_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $has_access = $result->num_rows > 0;
    $stmt->close();
    return $has_access;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET - Fetch assets for a ward
if ($method === 'GET') {
    $ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : 0;
    
    // Officer work location filters
    $work_province = isset($_GET['work_province']) ? $conn->real_escape_string($_GET['work_province']) : null;
    $work_district = isset($_GET['work_district']) ? $conn->real_escape_string($_GET['work_district']) : null;
    $work_municipality = isset($_GET['work_municipality']) ? $conn->real_escape_string($_GET['work_municipality']) : null;
    $work_ward = isset($_GET['work_ward']) ? intval($_GET['work_ward']) : null;
    
    if ($ward_id === 0 && !($work_province || $work_district || $work_municipality || $work_ward)) {
        echo json_encode(array("success" => false, "message" => "Ward ID or work location required."));
        exit();
    }
    
    if ($ward_id > 0) {
        $query = "SELECT * FROM ward_assets WHERE ward_id = $ward_id ORDER BY created_at DESC";
    } else {
        if ($work_province && $work_district && $work_municipality && $work_ward) {
            $resolvedWardId = resolveWardIdStrict($conn, $work_province, $work_district, $work_municipality, $work_ward);
            if ($resolvedWardId === 0) {
                http_response_code(422);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Ward not found for provided work location. Ask admin to create this ward.",
                    "debug" => array(
                        "work_province" => $work_province,
                        "work_district" => $work_district,
                        "work_municipality" => $work_municipality,
                        "work_ward" => $work_ward
                    )
                ));
                exit();
            }
            $query = "SELECT * FROM ward_assets WHERE ward_id = $resolvedWardId ORDER BY created_at DESC";
        } else {
            echo json_encode(array("success" => false, "message" => "Full work location (province, district, municipality, ward) required."));
            exit();
        }
    }
    
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
            // Allow creating by ward_id or by work location
            if (!isset($data->asset_type) || !isset($data->asset_name)) {
                echo json_encode(array("success" => false, "message" => "Required fields missing: asset_type and asset_name."));
                exit();
            }

            $ward_id = isset($data->ward_id) ? intval($data->ward_id) : 0;
            if ($ward_id === 0) {
                // Resolve strictly from work location
                $work_province = isset($data->work_province) && !empty($data->work_province) ? $data->work_province : null;
                $work_district = isset($data->work_district) && !empty($data->work_district) ? $data->work_district : null;
                $work_municipality = isset($data->work_municipality) && !empty($data->work_municipality) ? $data->work_municipality : null;
                $work_ward = isset($data->work_ward) && !empty($data->work_ward) ? intval($data->work_ward) : null;

                if ($work_province && $work_district && $work_municipality && $work_ward) {
                    $ward_id = resolveWardIdStrict($conn, $work_province, $work_district, $work_municipality, $work_ward);
                }
            }
            if ($ward_id === 0) {
                http_response_code(422);
                echo json_encode(array(
                    "success" => false,
                    "message" => "Ward not found for provided work location. Ask admin to create this ward.",
                    "debug" => array(
                        "work_province" => isset($work_province) ? $work_province : null,
                        "work_district" => isset($work_district) ? $work_district : null,
                        "work_municipality" => isset($work_municipality) ? $work_municipality : null,
                        "work_ward" => isset($work_ward) ? $work_ward : null
                    )
                ));
                exit();
            }

            // Optional: verify access if officer_id provided
            $officer_id = isset($data->officer_id) ? intval($data->officer_id) : 0;
            if ($officer_id > 0) {
                if (!verifyWardAccess($conn, $officer_id, $ward_id)) {
                    http_response_code(403);
                    echo json_encode(["success" => false, "message" => "Unauthorized access to this ward."]);
                    exit();
                }
            }
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
