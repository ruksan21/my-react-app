<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../db_connect.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        "success" => false,
        "message" => "Only POST method is allowed"
    ]);
    exit();
}

try {
    $data = json_decode(file_get_contents("php://input"), true);
    
    // Validate required fields (district is optional as it might be empty in database)
    $requiredFields = ['province', 'municipality', 'ward'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            echo json_encode([
                "success" => false,
                "message" => "Missing required field: $field"
            ]);
            exit();
        }
    }

    // Get social media URLs (optional)
    $facebook = $data['facebook'] ?? "";
    $instagram = $data['instagram'] ?? "";
    $twitter = $data['twitter'] ?? "";
    $whatsapp = $data['whatsapp'] ?? "";

    // Update ward social media links
    // Note: District field might be empty in database, so we only check province, municipality, and ward
    $query = "UPDATE wards 
              SET facebook_url = ?, 
                  instagram_url = ?, 
                  twitter_url = ?, 
                  whatsapp_url = ?
              WHERE province = ? 
                AND municipality = ? 
                AND ward_number = ?";

    $stmt = $conn->prepare($query);
    $stmt->bind_param(
        "sssssss",
        $facebook,
        $instagram,
        $twitter,
        $whatsapp,
        $data['province'],
        $data['municipality'],
        $data['ward']
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode([
                "success" => true,
                "message" => "Social media links updated successfully"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "message" => "Ward not found or no changes made"
            ]);
        }
    } else {
        echo json_encode([
            "success" => false,
            "message" => "Failed to update social media links"
        ]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
?>
