<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include "config.php";


$token = $_COOKIE['token'] ?? null;

if (!$token) {
    echo json_encode(["success" => false, "error" => "Token missing"]);
    exit;
}


$stmt = $pdo->prepare("
    SELECT 
        id, 
        name, 
        email,
        phone,
        student_id,
        level,
        created_at
    FROM users 
    WHERE token = ?
");
$stmt->execute([$token]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    echo json_encode([
        "success" => false, 
        "error" => "Invalid token"
    ]);
    exit;
}

//     
$stmt2 = $pdo->prepare("
    SELECT COUNT(*) as total_courses,
           SUM(CASE WHEN progress >= 100 THEN 1 ELSE 0 END) as completed_courses
    FROM user_courses
    WHERE user_id = ?
");
$stmt2->execute([$user['id']]);
$courseStats = $stmt2->fetch(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "user" => $user,
    "stats" => [
        "total_courses" => intval($courseStats['total_courses']),
        "completed_courses" => intval($courseStats['completed_courses'])
    ]
]);
