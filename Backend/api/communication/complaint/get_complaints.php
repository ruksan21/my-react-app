<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

require_once '../../db_connect.php';

// One-time fix for status column
$conn->query("ALTER TABLE complaints MODIFY COLUMN status ENUM('Open', 'Resolved', 'Pending', 'Rejected') DEFAULT 'Open'");

// 1. Get Inputs
$ward_id = isset($_GET['ward_id']) ? intval($_GET['ward_id']) : null;
$ward_number = $_GET['ward'] ?? null;
$municipality = $_GET['municipality'] ?? null;
$province = $_GET['province'] ?? null;
$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : null;
$source_role = $_GET['source'] ?? null;

// Resolve ward_id if MISSING but location is provided
if (!$ward_id && $municipality && $ward_number) {
    $muni_safe = $conn->real_escape_string($municipality);
    $ward_num = intval($ward_number);
    // Strict match for resolution fallback
    $res_w = $conn->query("SELECT id FROM wards WHERE ward_number = $ward_num AND TRIM(municipality) = TRIM('$muni_safe') LIMIT 1");
    if ($res_w && $res_w->num_rows > 0) {
        $ward_id = $res_w->fetch_assoc()['id'];
    }
}

// 2. Build Base Query
$sql = "SELECT c.*, 
               IF(c.status IS NULL OR c.status = '', 'Open', c.status) as status,
               u.role as user_role, u.first_name, u.last_name, u.contact_number, u.email, 
               w.municipality, w.ward_number, w.province, w.district_name,
               c.complainant_email, c.complainant_phone
        FROM complaints c 
        LEFT JOIN users u ON c.complainant_user_id = u.id 
        LEFT JOIN wards w ON c.ward_id = w.id
        WHERE 1=1";

// 3. Apply Filters
if ($ward_id) {
    $sql .= " AND c.ward_id = $ward_id";
} elseif ($municipality && $ward_number) {
    // If we couldn't resolve ward_id, filter by location fields on the join
    $m_safe = $conn->real_escape_string($municipality);
    $w_num = intval($ward_number);
    $sql .= " AND w.ward_number = $w_num AND (w.municipality LIKE '%$m_safe%' OR '$m_safe' LIKE CONCAT('%', w.municipality, '%'))";
}

if ($user_id) {
    $sql .= " AND c.complainant_user_id = $user_id";
}

/*
if ($source_role === 'officer') {
    // Reports MADE BY officers
    $sql .= " AND u.role = 'officer'";
} elseif ($source_role === 'citizen') {
    // Complaints MADE BY citizens (anything not officer, or guest)
    $sql .= " AND (u.role != 'officer' OR u.role IS NULL)";
}
*/

$sql .= " ORDER BY c.id DESC";

file_put_contents('sql_log.txt', "[" . date('Y-m-d H:i:s') . "] " . $sql . "\n", FILE_APPEND);

$result = $conn->query($sql);
$data = [];
$count = 0;
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
        $count++;
    }
} else {
    // Return DB error for debugging
    file_put_contents('sql_log.txt', "[" . date('Y-m-d H:i:s') . "] ERROR: " . $conn->error . "\n", FILE_APPEND);
    echo json_encode(["status" => "error", "message" => $conn->error, "sql" => $sql]);
    exit;
}

file_put_contents('sql_log.txt', "[" . date('Y-m-d H:i:s') . "] Results found: $count for WardID: $ward_id\n", FILE_APPEND);

$total_res = $conn->query("SELECT COUNT(*) as total FROM complaints");
$total_in_db = $total_res ? $total_res->fetch_assoc()['total'] : 0;

$current_user_details = null;
if ($user_id && $source_role === 'officer') {
    $u_res = $conn->query("SELECT * FROM users WHERE id = $user_id");
    $current_user_details = $u_res ? $u_res->fetch_assoc() : null;
}

$dump_res = $conn->query("SELECT * FROM complaints ORDER BY id DESC LIMIT 5");
$db_dump = [];
if ($dump_res) {
    while($row = $dump_res->fetch_assoc()) $db_dump[] = $row;
}

echo json_encode([
    "success" => true, 
    "data" => $data, 
    "debug_sql" => $sql, 
    "resolved_ward_id" => $ward_id,
    "input_params" => $_GET,
    "total_db_count" => $total_in_db,
    "current_user_debug" => $current_user_details,
    "db_dump" => $db_dump
]);
$conn->close();
exit;
?>
