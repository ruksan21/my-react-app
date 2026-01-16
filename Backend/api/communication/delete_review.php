<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../db_connect.php';

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->review_id)) {
    echo json_encode(["success" => false, "message" => "Review ID is required"]);
    exit();
}

$review_id = intval($data->review_id);

// Start transaction to delete related data as well
$conn->begin_transaction();

try {
    // 1. Delete feedback_replies (if any)
    $stmt1 = $conn->prepare("DELETE FROM feedback_replies WHERE review_id = ?");
    $stmt1->bind_param("i", $review_id);
    $stmt1->execute();
    $stmt1->close();

    // 2. Delete feedback_votes (if any)
    $stmt2 = $conn->prepare("DELETE FROM feedback_votes WHERE review_id = ?");
    $stmt2->bind_param("i", $review_id);
    $stmt2->execute();
    $stmt2->close();

    // 3. Delete the review itself
    $stmt3 = $conn->prepare("DELETE FROM reviews WHERE id = ?");
    $stmt3->bind_param("i", $review_id);
    $stmt3->execute();

    if ($stmt3->affected_rows > 0) {
        $conn->commit();
        echo json_encode(["success" => true, "message" => "Review deleted successfully"]);
    } else {
        $conn->rollback();
        echo json_encode(["success" => false, "message" => "Review not found or already deleted"]);
    }
    $stmt3->close();

} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}

$conn->close();
?>
