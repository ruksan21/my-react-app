<?php
// Prevent any output before JSON
ob_start();

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require_once '../db_connect.php';
require_once '../utils/ward_utils.php';

// Clear any output that might have occurred
ob_clean();

$data = json_decode(file_get_contents("php://input"));

if (!empty($data->title) && (!empty($data->officer_id) || !empty($data->ward_id))) {
    // Resolve Ward ID: use provided ward_id or derive from officer_id
    if (!empty($data->ward_id)) {
        $ward_id = intval($data->ward_id);
    } else {
        $ward_id = getOfficerWardIdOrError($conn, intval($data->officer_id), true);
    }

    // Prepare data
    $title = $conn->real_escape_string($data->title);
    $subtitle = isset($data->subtitle) ? $conn->real_escape_string($data->subtitle) : '';
    $description = isset($data->description) ? $conn->real_escape_string($data->description) : '';
    $activity_date = isset($data->activity_date) ? $data->activity_date : date('Y-m-d');
    $activity_time = isset($data->activity_time) ? $data->activity_time : date('H:i');
    $icon = isset($data->icon) ? $conn->real_escape_string($data->icon) : '📅';
    $icon_bg = isset($data->icon_bg) ? $conn->real_escape_string($data->icon_bg) : '#E8F5E9';

    // Check if this is an UPDATE (id provided)
    if (!empty($data->id)) {
        $activity_id = intval($data->id);
        
        $sql = "UPDATE ward_activities SET 
                    title = ?, 
                    subtitle = ?, 
                    description = ?, 
                    activity_date = ?, 
                    activity_time = ?, 
                    icon = ?, 
                    icon_bg = ?
                WHERE id = ? AND ward_id = ?";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("sssssssii", $title, $subtitle, $description, $activity_date, $activity_time, $icon, $icon_bg, $activity_id, $ward_id);
        
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                ob_clean();
                echo json_encode(["success" => true, "message" => "Activity updated successfully.", "id" => $activity_id]);
            } else {
                ob_clean();
                echo json_encode(["success" => false, "message" => "No changes made or activity not found."]);
            }
        } else {
            ob_clean();
            echo json_encode(["success" => false, "message" => "Error updating activity: " . $stmt->error]);
        }
    } else {
        // 2. Insert Activity
        $sql = "INSERT INTO ward_activities (ward_id, title, subtitle, description, activity_date, activity_time, icon, icon_bg)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("isssssss", $ward_id, $title, $subtitle, $description, $activity_date, $activity_time, $icon, $icon_bg);
        
        if ($stmt->execute()) {
            $activity_id = $stmt->insert_id;

            // 3. Create Notifications (System Alerts)
            // User Notification
            $msg_user = "New Activity: $title - $subtitle";
            $type = 'info';
            $status = 'unread';
            
            try {
                // Notify Users
                $sql_alert_user = "INSERT INTO system_alerts (ward_id, type, title, message, status, target_role) VALUES (?, ?, ?, ?, ?, 'user')";
                $stmt_u = $conn->prepare($sql_alert_user);
                if ($stmt_u) {
                    $alert_title = "New Activity";
                    $stmt_u->bind_param("issss", $ward_id, $type, $alert_title, $msg_user, $status);
                    $stmt_u->execute();
                    $stmt_u->close();
                }

                // Notify Officers
                $sql_alert_officer = "INSERT INTO system_alerts (ward_id, type, title, message, status, target_role) VALUES (?, ?, ?, ?, ?, 'officer')";
                $stmt_o = $conn->prepare($sql_alert_officer);
                if ($stmt_o) {
                    $stmt_o->bind_param("issss", $ward_id, $type, $alert_title, $msg_user, $status);
                    $stmt_o->execute();
                    $stmt_o->close();
                }

                // Also add to notifications table for ward feed
                $notif_title = "📅 Work Activity";
                $notif_msg = "New activity added: " . $title;
                
                // Fetch location details for the notification source
                $w_sql = "SELECT w.province, d.name AS district_name, w.municipality, w.ward_number FROM wards w LEFT JOIN districts d ON w.district_id = d.id WHERE w.id = ?";
                $w_stmt = $conn->prepare($w_sql);
                if ($w_stmt) {
                    $w_stmt->bind_param("i", $ward_id);
                    $w_stmt->execute();
                    $w_res = $w_stmt->get_result();
                    $w_data = $w_res->fetch_assoc();
                    $w_stmt->close();

                    if ($w_data) {
                        $notif_sql = "INSERT INTO notifications (ward_id, title, message, type, source_province, source_district, source_municipality, source_ward, is_read, created_at) VALUES (?, ?, ?, 'activity', ?, ?, ?, ?, 0, NOW())";
                        $notif_stmt = $conn->prepare($notif_sql);
                        if ($notif_stmt) {
                            $notif_stmt->bind_param("isssssi", $ward_id, $notif_title, $notif_msg, $w_data['province'], $w_data['district_name'], $w_data['municipality'], $w_data['ward_number']);
                            $notif_stmt->execute();
                            $notif_stmt->close();
                        }
                    }
                }
            } catch (Exception $e) {
                // Notifications failed but activity was saved - don't fail the whole operation
                error_log("Notification creation failed: " . $e->getMessage());
            }

            // Clear output buffer and send only JSON
            ob_clean();
            echo json_encode(["success" => true, "message" => "Activity added and notifications sent.", "id" => $activity_id]);
        } else {
            ob_clean();
            echo json_encode(["success" => false, "message" => "Error adding activity: " . $stmt->error]);
        }
    }
} else {
    ob_clean();
    echo json_encode(["success" => false, "message" => "Incomplete data."]);
}

// End output buffering and flush
ob_end_flush();
?>
