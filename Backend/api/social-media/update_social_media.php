<?php
// Prevent any output before JSON
ob_start();

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../db_connect.php";

// Clear any output that might have occurred
ob_clean();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
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
        if (!isset($data[$field])) {
            ob_clean();
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

    // First, try to find the ward
    $findQuery = "SELECT id, province, municipality, ward_number, 
                         facebook_url, instagram_url, twitter_url, whatsapp_url 
                  FROM wards 
                  WHERE LOWER(TRIM(province)) = LOWER(TRIM(?)) 
                    AND LOWER(TRIM(municipality)) = LOWER(TRIM(?)) 
                    AND ward_number = ?";
    
    $findStmt = $conn->prepare($findQuery);
    $findStmt->bind_param("sss", $data['province'], $data['municipality'], $data['ward']);
    $findStmt->execute();
    $findResult = $findStmt->get_result();
    
    if ($findResult->num_rows === 0) {
        ob_clean();
        echo json_encode([
            "success" => false,
            "message" => "Ward not found. Please check province, municipality, and ward number.",
            "debug" => [
                "province" => $data['province'],
                "municipality" => $data['municipality'],
                "ward" => $data['ward']
            ]
        ]);
        exit();
    }
    
    $wardData = $findResult->fetch_assoc();
    $wardId = $wardData['id'];
    
    // Check if values are actually different
    if ($wardData['facebook_url'] === $facebook && 
        $wardData['instagram_url'] === $instagram && 
        $wardData['twitter_url'] === $twitter && 
        $wardData['whatsapp_url'] === $whatsapp) {
        ob_clean();
        echo json_encode([
            "success" => true,
            "message" => "No changes needed - values are already up to date"
        ]);
        exit();
    }

    // Update ward social media links using ward ID
    $updateQuery = "UPDATE wards 
                    SET facebook_url = ?, 
                        instagram_url = ?, 
                        twitter_url = ?, 
                        whatsapp_url = ?,
                        updated_at = NOW()
                    WHERE id = ?";

    $stmt = $conn->prepare($updateQuery);
    $stmt->bind_param("ssssi", $facebook, $instagram, $twitter, $whatsapp, $wardId);

    if ($stmt->execute()) {
        ob_clean();
        echo json_encode([
            "success" => true,
            "message" => "Social media links updated successfully"
        ]);
    } else {
        ob_clean();
        echo json_encode([
            "success" => false,
            "message" => "Failed to update social media links: " . $stmt->error
        ]);
    }

    $stmt->close();
    $findStmt->close();
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}

$conn->close();
ob_end_flush();
?>
