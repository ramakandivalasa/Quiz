<?php
session_start();
include "db_connect.php";

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "User not logged in"]);
    exit;
}

// Decode JSON input safely
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    echo json_encode(["error" => "Invalid request data"]);
    exit;
}

$category_id = isset($data['category_id']) ? intval($data['category_id']) : 0;
$answers = isset($data['answers']) ? $data['answers'] : [];

if ($category_id == 0 || empty($answers)) {
    echo json_encode(["error" => "Invalid category or answers"]);
    exit;
}

$user_id = $_SESSION['user_id'];
$score = 0;

// Fetch correct answers using prepared statement
$query = "SELECT id, correct_option FROM questions WHERE category_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $category_id);
$stmt->execute();
$result = $stmt->get_result();

$correct_answers = [];
while ($row = $result->fetch_assoc()) {
    $correct_answers[$row['id']] = $row['correct_option'];
}
$stmt->close();

// Calculate score
foreach ($answers as $question_id => $user_answer) {
    if (isset($correct_answers[$question_id]) && $correct_answers[$question_id] === $user_answer) {
        $score++;
    }
}

// Insert score into `scores` table using prepared statement
$insertQuery = "INSERT INTO scores (user_id, category_id, score) VALUES (?, ?, ?)";
$stmt = $conn->prepare($insertQuery);
$stmt->bind_param("iii", $user_id, $category_id, $score);
$stmt->execute();
$stmt->close();

// Return response
echo json_encode(["success" => true, "score" => $score]);

$conn->close();
?>
