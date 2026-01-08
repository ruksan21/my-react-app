<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $data = json_decode(file_get_contents("php://input"), true);
    $work_id = $data['id'] ?? 0;
    $officer_id = $data['officer_id'] ?? 0;

    if ($work_id == 0 || $officer_id == 0) {
        echo json_encode(["status" => "error", "message" => "Work ID and Officer ID required."]);
        exit();
    }

    // First, get the image path before deleting
    $image_query = "SELECT image FROM development_works WHERE id = ? AND officer_id = ?";
    $stmt_image = $conn->prepare($image_query);
    $stmt_image->bind_param("ii", $work_id, $officer_id);
    $stmt_image->execute();
    $result = $stmt_image->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(["status" => "error", "message" => "Work not found or you don't have permission to delete it."]);
        $stmt_image->close();
        exit();
    }

    $work_data = $result->fetch_assoc();
    $image_path = $work_data['image'];
    $stmt_image->close();

    // Delete the work from database
    $stmt = $conn->prepare("DELETE FROM development_works WHERE id = ? AND officer_id = ?");
    $stmt->bind_param("ii", $work_id, $officer_id);

    if ($stmt->execute()) {
        // Delete the image file if it exists
        if (!empty($image_path) && file_exists("../" . $image_path)) {
            unlink("../" . $image_path);
        }

        echo json_encode(["success" => true, "message" => "Work deleted successfully"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to delete work: " . $stmt->error]);
    }

    $stmt->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}

$conn->close();
?>
