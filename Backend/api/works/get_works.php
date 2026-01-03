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

// Build the query
$sql = "SELECT dw.*, w.ward_number, d.name as district_name, w.municipality 
        FROM development_works dw 
        LEFT JOIN users u ON dw.officer_id = u.id 
        LEFT JOIN wards w ON u.assigned_ward = w.id
        LEFT JOIN districts d ON w.district_id = d.id
        WHERE 1=1";

if ($ward_id) {
    // Exact ID match
    $sql .= " AND u.assigned_ward = $ward_id";
} elseif ($ward_number) {
    // Filter by Ward Number
    $sql .= " AND w.ward_number = $ward_number";
    // Optional Municipality filter
    if ($municipality) {
        $sql .= " AND w.municipality = '$municipality'";
    } else {
         // Should we filter by district if known? 
         // For now, if only ward_number is given, it might be ambiguous, but better than "ALL".
    }
} else {
    // If NO filters provided, and we are public facing...
    // The previous behavior was "Show ALL".
    // Is this desired? Maybe for "Recent Works" across the country.
    // So we leave WHERE 1=1
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
