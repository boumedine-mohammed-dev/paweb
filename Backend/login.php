<?php
//   Angular 
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

$stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
$stmt->execute([$email]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    $token = md5($email . time());
     // 
        $stmt = $pdo->prepare("UPDATE users SET token = ? WHERE id = ?");
    $stmt->execute([$token, $user['id']]);
setcookie("token", $token, [
    "expires" => time() + 3600*24,
    "path" => "/",
    "domain" => "localhost",
    "secure" => false,
    "httponly" => true,
    "samesite" => "Lax"
]);

     echo json_encode([
        "success" => true,
        "token" => $token,
        "name" => $user['name']
    ]);
} else {
    echo json_encode(["success" => false]);
}
