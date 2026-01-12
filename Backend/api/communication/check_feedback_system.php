<?php
/**
 * Check complete feedback system - including feedback and replies
 */

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require_once '../db_connect.php';

$response = [
    "status" => "checking",
    "timestamp" => date('Y-m-d H:i:s'),
    "checks" => []
];

try {
    // Check 1: work_feedback table exists?
    $check1 = $conn->query("SHOW TABLES LIKE 'work_feedback'");
    $response["checks"]["work_feedback_table"] = [
        "exists" => $check1->num_rows > 0
    ];
    
    if ($check1->num_rows > 0) {
        // Get total feedback count
        $count = $conn->query("SELECT COUNT(*) as cnt FROM work_feedback");
        $row = $count->fetch_assoc();
        $response["checks"]["work_feedback_table"]["total_records"] = $row['cnt'];
        
        // Get sample feedback
        $sample = $conn->query("SELECT id, work_id, user_id, user_name, comment, created_at FROM work_feedback LIMIT 3");
        $feedbacks = [];
        while ($f = $sample->fetch_assoc()) {
            $feedbacks[] = $f;
        }
        $response["checks"]["work_feedback_table"]["sample_records"] = $feedbacks;
    }
    
    // Check 2: feedback_replies table exists?
    $check2 = $conn->query("SHOW TABLES LIKE 'feedback_replies'");
    $response["checks"]["feedback_replies_table"] = [
        "exists" => $check2->num_rows > 0
    ];
    
    if ($check2->num_rows > 0) {
        // Get total replies count
        $count2 = $conn->query("SELECT COUNT(*) as cnt FROM feedback_replies");
        $row2 = $count2->fetch_assoc();
        $response["checks"]["feedback_replies_table"]["total_records"] = $row2['cnt'];
        
        // Get sample replies
        $sample2 = $conn->query("SELECT id, feedback_id, officer_id, officer_name, reply_text, created_at FROM feedback_replies LIMIT 3");
        $replies = [];
        while ($r = $sample2->fetch_assoc()) {
            $replies[] = $r;
        }
        $response["checks"]["feedback_replies_table"]["sample_records"] = $replies;
        
        // Check table structure
        $cols = $conn->query("SHOW COLUMNS FROM feedback_replies");
        $columns = [];
        while ($col = $cols->fetch_assoc()) {
            $columns[] = [
                "field" => $col['Field'],
                "type" => $col['Type'],
                "null" => $col['Null'],
                "key" => $col['Key']
            ];
        }
        $response["checks"]["feedback_replies_table"]["columns"] = $columns;
    }
    
    // Check 3: Are there any feedbacks that have replies?
    if ($check1->num_rows > 0 && $check2->num_rows > 0) {
        $linked = $conn->query("
            SELECT 
                wf.id as feedback_id,
                wf.comment as feedback_comment,
                wf.user_name as citizen_name,
                COUNT(fr.id) as reply_count
            FROM work_feedback wf
            LEFT JOIN feedback_replies fr ON fr.feedback_id = wf.id
            GROUP BY wf.id
            HAVING reply_count > 0
            LIMIT 5
        ");
        
        $linked_data = [];
        while ($l = $linked->fetch_assoc()) {
            $linked_data[] = $l;
        }
        
        $response["checks"]["linked_feedback_replies"] = [
            "count" => count($linked_data),
            "samples" => $linked_data
        ];
    }
    
    // Check 4: Officers who have replied
    if ($check2->num_rows > 0) {
        $officers = $conn->query("
            SELECT DISTINCT 
                fr.officer_id,
                fr.officer_name,
                COUNT(fr.id) as total_replies
            FROM feedback_replies fr
            GROUP BY fr.officer_id, fr.officer_name
        ");
        
        $officer_list = [];
        while ($o = $officers->fetch_assoc()) {
            $officer_list[] = $o;
        }
        $response["checks"]["officers_with_replies"] = $officer_list;
    }
    
    // Check 5: Check if there are any orphaned replies (feedback_id doesn't exist)
    if ($check1->num_rows > 0 && $check2->num_rows > 0) {
        $orphaned = $conn->query("
            SELECT fr.id, fr.feedback_id, fr.officer_name, fr.reply_text
            FROM feedback_replies fr
            LEFT JOIN work_feedback wf ON wf.id = fr.feedback_id
            WHERE wf.id IS NULL
        ");
        
        $orphaned_list = [];
        while ($orph = $orphaned->fetch_assoc()) {
            $orphaned_list[] = $orph;
        }
        
        $response["checks"]["orphaned_replies"] = [
            "count" => count($orphaned_list),
            "data" => $orphaned_list
        ];
    }
    
    $response["status"] = "success";
    
} catch (Exception $e) {
    $response["status"] = "error";
    $response["error"] = $e->getMessage();
}

echo json_encode($response, JSON_PRETTY_PRINT);
$conn->close();
?>
