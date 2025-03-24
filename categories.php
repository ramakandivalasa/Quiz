<?php
session_start();
include "db_connect.php";

header("Content-Type: application/json"); // Ensure JSON response
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT); // Show MySQL errors

// Check if database connection is successful
if (!$conn) {
    echo json_encode(["error" => "Database connection failed"]);
    exit();
}

// Fetch categories from the database
$query = "SELECT id, name FROM categories";
$result = $conn->query($query);

if (!$result) {
    echo json_encode(["error" => "Query failed: " . $conn->error]);
    exit();
}

// Store categories in an array
$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode($categories); // Send JSON response
exit();
?>
