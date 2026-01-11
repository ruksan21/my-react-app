<?php
$files = [
    'FIX_OFFICER_STATUS.sql',
    'FIX_WARD_LOCATION_ISSUE.sql',
    'WARD_FIX_GUIDE.md',
    'auto_fix_ward_location.php',
    'check_data.php',
    'check_schema.php',
    'db_diagnostic.php',
    'diagnose_ward_issue.php',
    'fix_officer_data.php',
    'get_full_schema.php',
    'db_report.txt',
    'schema_dump.sql',
    'data_output.txt'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        if (unlink($file)) {
            echo "Deleted: $file\n";
        } else {
            echo "Failed to delete: $file\n";
        }
    }
}
// Delete itself
unlink(__FILE__);
?>
