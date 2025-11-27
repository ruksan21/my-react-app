<?php
// api/status.php
// Returns JSON stats for the frontend Status component.
// Adjust DB credentials and table/column names to your schema.

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *'); // Adjust for production (specific domain)

$DB_HOST = 'localhost';
$DB_USER = 'root';
$DB_PASS = ''; // Set your password
$DB_NAME = 'ward_portal';

$mysqli = new mysqli($DB_HOST, $DB_USER, $DB_PASS, $DB_NAME);
if ($mysqli->connect_errno) {
  http_response_code(500);
  echo json_encode(['error' => 'DB connection failed']);
  exit;
}

// Example schema assumptions:
// works(id INT, title VARCHAR, status ENUM('pending','completed'), created_at DATETIME)
// ratings(id INT, work_id INT, rating_value DECIMAL(2,1))
// followers(id INT, profile_id INT, user_id INT)
// If you store rating on works table directly, adjust queries accordingly.

// Total works
$totalWorks = 0;
$res = $mysqli->query("SELECT COUNT(*) AS c FROM works");
if ($res) { $row = $res->fetch_assoc(); $totalWorks = (int)$row['c']; }

// Completed works
$completedWorks = 0;
$res = $mysqli->query("SELECT COUNT(*) AS c FROM works WHERE status='completed'");
if ($res) { $row = $res->fetch_assoc(); $completedWorks = (int)$row['c']; }

// Average rating (join ratings) - if no ratings, stays 0
$averageRating = 0.0;
$res = $mysqli->query("SELECT AVG(rating_value) AS avgRating FROM ratings");
if ($res) { $row = $res->fetch_assoc(); $averageRating = $row['avgRating'] !== null ? round((float)$row['avgRating'], 2) : 0.0; }

// Followers (assuming single profile_id = 1 for now; adjust as needed)
$profileId = 1; // You will set dynamically (e.g., query param)
$followers = 0;
$stmt = $mysqli->prepare("SELECT COUNT(*) AS c FROM followers WHERE profile_id = ?");
if ($stmt) {
  $stmt->bind_param('i', $profileId);
  $stmt->execute();
  $result = $stmt->get_result();
  if ($result) { $row = $result->fetch_assoc(); $followers = (int)$row['c']; }
  $stmt->close();
}

$mysqli->close();

echo json_encode([
  'totalWorks' => $totalWorks,
  'completedWorks' => $completedWorks,
  'averageRating' => $averageRating,
  'followers' => $followers,
]);
