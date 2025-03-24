<?php
include "db_connect.php";

if (!isset($_GET["category_id"])) {
    echo json_encode(["error" => "Category ID is required"]);
    exit;
}

$category_id = intval($_GET["category_id"]);

$query = "SELECT id, question_text, option_a, option_b, option_c, option_d FROM questions WHERE category_id=? LIMIT 5";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $category_id);
$stmt->execute();
$result = $stmt->get_result();

$questions = [];
while ($row = $result->fetch_assoc()) {
    $questions[] = $row;
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($questions);
?>
