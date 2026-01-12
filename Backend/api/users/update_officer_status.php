<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->id) && !empty($data->status)) {
    $id = intval($data->id);
    $status = $conn->real_escape_string($data->status); // 'active' for approve, 'rejected' for reject

    // If approving an officer, verify their work ward exists
    if ($status === 'active') {
        // Get officer's work location
        $officer_query = "SELECT work_province, work_district, work_municipality, work_ward 
                         FROM users 
                         WHERE id = $id AND role = 'officer'";
        $officer_result = $conn->query($officer_query);
        
        if ($officer_result && $officer_result->num_rows > 0) {
            $officer = $officer_result->fetch_assoc();
            $work_province = $officer['work_province'];
            $work_district = $officer['work_district'];
            $work_municipality = $officer['work_municipality'];
            $work_ward = $officer['work_ward'];
            // Extract number from ward string (e.g., "Ward 1" -> 1)
            $work_ward_num = intval(preg_replace('/[^0-9]/', '', $work_ward));
            if ($work_ward_num == 0 && is_numeric($work_ward)) $work_ward_num = intval($work_ward);
            
            // Check if ward exists with robust matching (handle NULLs and fuzzy match)
            // STRICT MATCH
            $ward_query = "SELECT id FROM wards 
                          WHERE ward_number = $work_ward_num
                          AND (
                              province IS NULL OR province = '' 
                              OR TRIM(province) LIKE TRIM('$work_province')
                              OR TRIM(province) LIKE CONCAT('%', TRIM('$work_province'), '%')
                              OR '$work_province' LIKE CONCAT('%', TRIM(province), '%')
                          )
                          AND (
                              district IS NULL OR district = '' 
                              OR TRIM(district) LIKE TRIM('$work_district')
                              OR TRIM(district) LIKE CONCAT('%', TRIM('$work_district'), '%')
                              OR '$work_district' LIKE CONCAT('%', TRIM(district), '%')
                          )
                          AND (
                              TRIM(municipality) LIKE TRIM('$work_municipality')
                              OR TRIM(municipality) LIKE CONCAT('%', TRIM('$work_municipality'), '%')
                              OR '$work_municipality' LIKE CONCAT('%', TRIM(municipality), '%')
                          )
                          LIMIT 1";
            $ward_result = $conn->query($ward_query);

            // RELAXED MATCH (Fallback)
            if (!$ward_result || $ward_result->num_rows == 0) {
                 $ward_query = "SELECT id FROM wards 
                                  WHERE ward_number = $work_ward_num
                                  AND (
                                      TRIM(municipality) LIKE TRIM('$work_municipality')
                                      OR TRIM(municipality) LIKE CONCAT('%', TRIM('$work_municipality'), '%')
                                      OR '$work_municipality' LIKE CONCAT('%', TRIM(municipality), '%')
                                  )
                                  LIMIT 1";
                 $ward_result = $conn->query($ward_query);
            }

            
            if ($ward_result && $ward_result->num_rows > 0) {
                // Ward exists - approve officer and assign ward_id
                $ward = $ward_result->fetch_assoc();
                $ward_id = $ward['id'];
                
                $query = "UPDATE users 
                         SET status = '$status', assigned_ward_id = $ward_id 
                         WHERE id = $id AND role = 'officer'";
                
                if ($conn->query($query)) {
                    echo json_encode([
                        "success" => true, 
                        "message" => "Officer approved and assigned to ward",
                        "ward_id" => $ward_id
                    ]);
                } else {
                    echo json_encode([
                        "success" => false, 
                        "message" => "Error updating officer: " . $conn->error
                    ]);
                }
            } else {
                // Ward doesn't exist - cannot approve
                echo json_encode([
                    "success" => false, 
                    "message" => "Cannot approve officer. Ward $work_ward ($work_ward_num) in $work_municipality, $work_district has not been created yet. Please create the ward first. DB Error: " . $conn->error,
                    "ward_missing" => true,
                    "debug_query" => $ward_query
                ]);
            }
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Officer not found"
            ]);
        }
    } else {
        // Rejecting officer - no ward check needed
        $query = "UPDATE users SET status = '$status' WHERE id = $id AND role = 'officer'";
        
        if ($conn->query($query)) {
            echo json_encode([
                "success" => true, 
                "message" => "Officer status updated to $status"
            ]);
        } else {
            echo json_encode([
                "success" => false, 
                "message" => "Error: " . $conn->error
            ]);
        }
    }
} else {
    echo json_encode(array("success" => false, "message" => "Incomplete data."));
}
?>
