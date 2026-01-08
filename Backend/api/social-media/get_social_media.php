<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once "../db_connect.php";

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Get filter parameters
    $province = $_GET['province'] ?? null;
    $district = $_GET['district'] ?? null;
    $municipality = $_GET['municipality'] ?? null;
    $ward = $_GET['ward'] ?? null;

    // Build query
    $query = "SELECT facebook_url, instagram_url, twitter_url, whatsapp_url 
              FROM wards 
              WHERE 1=1";
    
    $params = [];
    $types = "";

    if ($province) {
        $query .= " AND province = ?";
        $params[] = $province;
        $types .= "s";
    }
    if ($district) {
        $query .= " AND district = ?";
        $params[] = $district;
        $types .= "s";
    }
    if ($municipality) {
        $query .= " AND municipality = ?";
        $params[] = $municipality;
        $types .= "s";
    }
    if ($ward) {
        $query .= " AND ward_number = ?";
        $params[] = $ward;
        $types .= "s";
    }

    $query .= " LIMIT 1";

    $stmt = $conn->prepare($query);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        echo json_encode([
            "success" => true,
            "data" => [
                "facebook" => $row['facebook_url'] ?? "",
                "instagram" => $row['instagram_url'] ?? "",
                "twitter" => $row['twitter_url'] ?? "",
                "whatsapp" => $row['whatsapp_url'] ?? ""
            ]
        ]);
    } else {
        echo json_encode([
            "success" => true,
            "data" => [
                "facebook" => "",
                "instagram" => "",
                "twitter" => "",
                "whatsapp" => ""
            ]
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
