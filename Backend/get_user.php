<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

include "config.php";

$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if (!isset($_COOKIE['token'])) {
    echo json_encode(["success" => false, "error" => "Token missing"]);
    exit;
}

$token = $_COOKIE['token'];

$stmt = $pdo->prepare("SELECT id, name, email FROM users WHERE token = ?");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode([
        "success" => true,
        "user_id" => $user["id"],
        "name" => $user["name"]
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Invalid token"]);
}
?>
