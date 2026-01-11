<?php
// Shared ward helpers for all APIs
// Usage: require_once __DIR__ . '/../utils/ward_utils.php';

require_once __DIR__ . '/../db_connect.php';

function resolveWardIdStrict($conn, $province, $district, $municipality, $ward_number) {
    $province = trim($province ?? '');
    $district = trim($district ?? '');
    $municipality = trim($municipality ?? '');
    $ward_number = intval($ward_number ?? 0);
    if (!$municipality || !$ward_number) return 0;

    // Prefer joining districts so string fields in wards can be empty
    $sql = "SELECT w.id
            FROM wards w
            LEFT JOIN districts d ON w.district_id = d.id
            WHERE w.ward_number = ?
              AND (d.province = ?)
              AND (d.name = ?)
              AND (w.municipality = ?)
            LIMIT 1";
    $stmt = $conn->prepare($sql);
    if (!$stmt) return 0;
    $stmt->bind_param("isss", $ward_number, $province, $district, $municipality);
    $stmt->execute();
    $res = $stmt->get_result();
    $id = ($res && $row = $res->fetch_assoc()) ? intval($row['id']) : 0;
    $stmt->close();
    return $id;
}

function resolveWardIdFlexible($conn, $province, $district, $municipality, $ward_number) {
    $province = trim($province ?? '');
    $district = trim($district ?? '');
    $municipality = trim($municipality ?? '');
    $ward_number = intval($ward_number ?? 0);
    
    if (!$province || !$district || !$municipality || !$ward_number) return 0;

    // EXACT MATCH: All 4 fields must match (case-insensitive, whitespace-tolerant)
    // province, district, municipality, ward_number
    $sql = "SELECT w.id
            FROM wards w
            LEFT JOIN districts d ON w.district_id = d.id
            WHERE w.ward_number = ?
              AND LOWER(TRIM(w.municipality)) = LOWER(TRIM(?))
              AND (
                  LOWER(TRIM(COALESCE(w.district_name, ''))) = LOWER(TRIM(?))
                  OR LOWER(TRIM(COALESCE(d.name, ''))) = LOWER(TRIM(?))
              )
              AND (
                  LOWER(TRIM(COALESCE(w.province, ''))) = LOWER(TRIM(?))
                  OR LOWER(TRIM(COALESCE(d.province, ''))) = LOWER(TRIM(?))
              )
            LIMIT 1";

    $stmt = $conn->prepare($sql);
    if ($stmt) {
        $stmt->bind_param("isssss", $ward_number, $municipality, $district, $district, $province, $province);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res && $row = $res->fetch_assoc()) {
            $stmt->close();
            return intval($row['id']);
        }
        $stmt->close();
    }

    return 0;
}

function verifyWardAccess($conn, $officer_id, $ward_id) {
    $officer_id = intval($officer_id);
    $ward_id = intval($ward_id);
    if ($officer_id <= 0 || $ward_id <= 0) return false;
    
    // 1. Check if officer is active
    $stmt = $conn->prepare("SELECT id, assigned_ward_id, work_province, work_district, work_municipality, work_ward 
                            FROM users WHERE id = ? AND role = 'officer' AND status = 'active'");
    if (!$stmt) return false;
    $stmt->bind_param("i", $officer_id);
    $stmt->execute();
    $res = $stmt->get_result();
    
    if (!$res || $res->num_rows === 0) {
        $stmt->close();
        return false;
    }
    
    $officer = $res->fetch_assoc();
    $stmt->close();
    
    // 2. Check if assigned_ward_id matches
    if (isset($officer['assigned_ward_id']) && intval($officer['assigned_ward_id']) === $ward_id) {
        return true;
    }
    
    // 3. Fallback: Resolve ward_id from location and check if it matches
    $resolved_ward_id = resolveWardIdFlexible($conn, $officer['work_province'], $officer['work_district'], $officer['work_municipality'], intval($officer['work_ward']));
    
    return $resolved_ward_id === $ward_id;
}

function getOfficerWardIdOrError($conn, $officer_id, $useFlexible = true) {
    $officer_id = intval($officer_id);
    $q = "SELECT work_province, work_district, work_municipality, work_ward, assigned_ward_id 
          FROM users WHERE id = ? AND role = 'officer' LIMIT 1";
    $stmt = $conn->prepare($q);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Server error preparing query."]); exit();
    }
    $stmt->bind_param("i", $officer_id);
    $stmt->execute();
    $res = $stmt->get_result();
    if ($res->num_rows === 0) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Officer not found"]); exit();
    }
    $o = $res->fetch_assoc();
    $stmt->close();

    // If already assigned in DB, return that immediately
    if (!empty($o['assigned_ward_id'])) {
        return intval($o['assigned_ward_id']);
    }

    if (empty($o['work_municipality']) || empty($o['work_ward'])) {
        http_response_code(422);
        echo json_encode(["success" => false, "message" => "Officer work location incomplete"]); exit();
    }

    $ward_id = $useFlexible
        ? resolveWardIdFlexible($conn, $o['work_province'], $o['work_district'], $o['work_municipality'], intval($o['work_ward']))
        : resolveWardIdStrict($conn, $o['work_province'], $o['work_district'], $o['work_municipality'], intval($o['work_ward']));

    if ($ward_id === 0) {
        http_response_code(422);
        echo json_encode([
            "success" => false,
            "message" => "Ward not found for officer's work location. Ask admin to create this ward.",
            "debug" => [
                "work_province" => $o['work_province'],
                "work_district" => $o['work_district'],
                "work_municipality" => $o['work_municipality'],
                "work_ward" => intval($o['work_ward'])
            ]
        ]); exit();
    }
    return $ward_id;
}
?>
