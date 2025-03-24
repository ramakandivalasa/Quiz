<?php
session_start();
include "db_connect.php";

header('Content-Type: application/json');

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Fetch leaderboard with category names
$sql = "SELECT users.username, categories.name AS category, scores.score 
        FROM scores 
        JOIN users ON scores.user_id = users.id 
        JOIN categories ON scores.category_id = categories.id 
        ORDER BY scores.score DESC LIMIT 10";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $leaderboard = [];
    while ($row = $result->fetch_assoc()) {
        $leaderboard[] = [
            "username" => $row["username"],
            "category" => $row["category"],  // Ensure this column exists
            "score" => $row["score"]
        ];
    }
    echo json_encode($leaderboard);
} else {
    echo json_encode(["error" => "No scores available."]);
}

$conn->close();
?>
