<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../db_connect.php';

// Filter by ward ID or specific location details
$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
$province = $_GET['province'] ?? null;
$municipality = $_GET['municipality'] ?? null;
$ward_number = $_GET['ward'] ?? null;
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
$source_role = isset($_GET['source']) ? $_GET['source'] : null; // 'citizen', 'officer', 'admin_view'

$sql = "SELECT c.*, u.role as user_role, w.municipality, w.ward_number, w.province
        FROM complaints c 
        LEFT JOIN users u ON c.complainant_user_id = u.id 
        LEFT JOIN wards w ON c.ward_id = w.id
        WHERE 1=1";

if ($ward_id) {
    $sql .= " AND c.ward_id = $ward_id";
}

if ($user_id) {
    $sql .= " AND c.complainant_user_id = $user_id";
}

if ($province) {
    $sql .= " AND w.province = '" . $conn->real_escape_string($province) . "'";
}

if ($municipality) {
    $sql .= " AND w.municipality = '" . $conn->real_escape_string($municipality) . "'";
}

if ($ward_number) {
    $sql .= " AND w.ward_number = " . intval($ward_number);
}

if ($source_role === 'officer') {
    // Reports MADE BY officers (for Admin to see)
    $sql .= " AND u.role = 'officer'";
} elseif ($source_role === 'citizen') {
    // Complaints MADE BY citizens (for Officer to see)
    $sql .= " AND (u.role = 'citizen' OR u.role IS NULL)";
} elseif ($source_role === 'admin_view') {
    // Admin sees everything, but can filter by role in frontend
}

$sql .= " ORDER BY c.created_at DESC";

$result = $conn->query($sql);

$complaints = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $complaints[] = $row;
    }
}

echo json_encode([
    "success" => true,
    "data" => $complaints,
    "total" => count($complaints)
]);

$conn->close();
?>
