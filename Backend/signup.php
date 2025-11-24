<?php
//   Angular 
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$name       = $data['name'] ?? '';
$email      = $data['email'] ?? '';
$password   = $data['password'] ?? '';
$phone      = $data['phone'] ?? '';
$student_id = $data['student_id'] ?? '';
$level      = $data['level'] ?? '';

if (!$name || !$email || !$password || !$phone || !$student_id || !$level) {
    echo json_encode(["success" => false, "message" => "Missing fields"]);
    exit();
}



$stmt = $pdo->prepare("SELECT * FROM users WHERE email=?");
$stmt->execute([$email]);

if ($stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Email already exists"]);
    exit();
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$token = bin2hex(random_bytes(16));

$stmt = $pdo->prepare("
    INSERT INTO users (name, email, password, phone, student_id, level, token) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
");

if ($stmt->execute([$name, $email, $hash, $phone, $student_id, $level, $token])) {

    setcookie("token", $token, [
        "expires"  => time() + 3600 * 24,   //  
        "path"     => "/",
        "secure"   => false,                //    
        "httponly" => true,
        "samesite" => "Lax"
    ]);

    echo json_encode(["success" => true, "message" => "Account created successfully"]);
    exit();
} 
else {
    echo json_encode(["success" => false, "message" => "Database error"]);
    exit();
}
