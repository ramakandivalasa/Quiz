<?php 
session_start();
include "db_connect.php";

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = trim($_POST["username"]);
    $password = trim($_POST["password"]);

    // ✅ Use Prepared Statement to prevent SQL Injection
    $stmt = $conn->prepare("SELECT id, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $hashed_password = $row["password"];

        if (password_verify($password, $hashed_password)) {
            $_SESSION["user_id"] = $row["id"]; // Store user ID in session
            
            // ✅ Redirect to categories page on successful login
            header("Location: categories.html");
            exit;
        } else {
            echo "<script>alert('Invalid credentials!'); window.location.href='login.html';</script>";
            exit;
        }
    } else {
        echo "<script>alert('User not found!'); window.location.href='login.html';</script>";
        exit;
    }
} else {
    echo "<script>alert('Invalid request!'); window.location.href='login.html';</script>";
    exit;
}
?>
