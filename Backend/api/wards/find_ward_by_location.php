<?php

function resolveWardIdStrict($conn, $province, $district, $municipality, $wardNumber) {
    file_put_contents(__DIR__ . '/resolve_debug.log', "[" . date('Y-m-d H:i:s') . "] resolving: $province, $district, $municipality, $wardNumber\n", FILE_APPEND);
    if (!$municipality || !$wardNumber) {
        return 0;
    }

    $province_safe = $conn->real_escape_string($province);
    $district_safe = $conn->real_escape_string($district);
    $municipality_safe = $conn->real_escape_string($municipality);
    $wardNumber = (int)$wardNumber;

    // Use robust fuzzy matching (same as verify_ward_exists.php)
    // 1. Ward Number must match exactly
    // 2. Municipality/District/Province match loosely or are NULL in DB
    $sql = "SELECT id FROM wards 
            WHERE ward_number = $wardNumber
            AND (
                province IS NULL OR province = '' 
                OR TRIM(province) LIKE TRIM('$province_safe')
                OR TRIM(province) LIKE CONCAT('%', TRIM('$province_safe'), '%')
                OR '$province_safe' LIKE CONCAT('%', TRIM(province), '%')
            )
            AND (
                district IS NULL OR district = '' 
                OR TRIM(district) LIKE TRIM('$district_safe')
                OR TRIM(district) LIKE CONCAT('%', TRIM('$district_safe'), '%')
                OR '$district_safe' LIKE CONCAT('%', TRIM(district), '%')
            )
            AND (
                TRIM(municipality) LIKE TRIM('$municipality_safe')
                OR TRIM(municipality) LIKE CONCAT('%', TRIM('$municipality_safe'), '%')
                OR '$municipality_safe' LIKE CONCAT('%', TRIM(municipality), '%')
            )
            LIMIT 1";

    $result = $conn->query($sql);

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        return (int)$row['id'];
    }

    return 0;
}
