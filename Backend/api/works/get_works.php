<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../db_connect.php';

$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
$ward_number = isset($_GET['ward_number']) ? intval($_GET['ward_number']) : null;
$municipality = isset($_GET['municipality']) ? $conn->real_escape_string($_GET['municipality']) : null;

// Officer work location filters
$work_province = isset($_GET['work_province']) ? $conn->real_escape_string($_GET['work_province']) : null;
$work_district = isset($_GET['work_district']) ? $conn->real_escape_string($_GET['work_district']) : null;
$work_municipality = isset($_GET['work_municipality']) ? $conn->real_escape_string($_GET['work_municipality']) : null;
$work_ward = isset($_GET['work_ward']) ? intval($_GET['work_ward']) : null;

// Build the query - Use ward_id directly from development_works table
$sql = "SELECT dw.*, w.ward_number, d.name as district_name, d.province, w.municipality 
        FROM development_works dw 
        LEFT JOIN wards w ON dw.ward_id = w.id
        LEFT JOIN districts d ON w.district_id = d.id
        WHERE 1=1";

if ($ward_id) {
    // Exact ID match - use ward_id from development_works table
    $sql .= " AND dw.ward_id = $ward_id";
} elseif ($ward_number) {
    // Filter by Ward Number
    $sql .= " AND w.ward_number = $ward_number";
    // Optional Municipality filter
    if ($municipality) {
        $sql .= " AND w.municipality = '$municipality'";
    }
} elseif ($work_province || $work_district || $work_municipality || $work_ward) {
    // Officer work location filtering
    if ($work_province) {
        $sql .= " AND d.province = '$work_province'";
    }
    if ($work_district) {
        $sql .= " AND d.name = '$work_district'";
    }
    if ($work_municipality) {
        $sql .= " AND w.municipality = '$work_municipality'";
    }
    if ($work_ward) {
        $sql .= " AND w.ward_number = $work_ward";
    }
} else {
    // If NO filters provided, show all works
    // For public facing pages showing recent works
}

$sql .= " ORDER BY dw.created_at DESC";

$result = $conn->query($sql);

$works = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Add a formatted location if not present
        if (empty($row['location'])) {
            $ward_num = $row['ward_number'] ? $row['ward_number'] : 'N/A';
            $district = $row['district_name'] ? $row['district_name'] : 'Unknown';
            $muni = $row['municipality'] ? $row['municipality'] : '';
            $row['location'] = "Ward No. " . $ward_num . ($muni ? ", $muni" : "") . ", " . $district;
        }
        // Ensure required fields for display
        if (empty($row['ward'])) {
            $row['ward'] = $row['ward_number'] ? "Ward " . $row['ward_number'] : 'Ward N/A';
        }
        if (empty($row['municipality'])) {
            // Fallback to district if muni is empty in DB
            $row['municipality'] = $row['district_name'] ? $row['district_name'] : 'Unknown';
        }
        $works[] = $row;
    }
}

echo json_encode($works);

$conn->close();
?>
