<?php
include "config.php";

//    
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

//     
$lesson_id = $_GET['id'] ?? null;
if (!$lesson_id) {
    echo json_encode(["success" => false, "message" => "Lesson ID missing"]);
    exit();
}

//     
$token = $_COOKIE['token'] ?? null;
if (!$token) {
    echo json_encode(["success" => false, "message" => "User not logged in"]);
    exit();
}

//   
$stmt = $pdo->prepare("SELECT pdf_file, lesson_title, course_id FROM course_details WHERE id=?");
$stmt->execute([$lesson_id]);
$lesson = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$lesson) {
    echo json_encode(["success" => false, "message" => "Lesson not found"]);
    exit();
}

//   
header("Content-Type: application/pdf");
header("Content-Disposition: attachment; filename=\"" . $lesson['lesson_title'] . ".pdf\"");
echo $lesson['pdf_file'];

//   student_progress
$user_id = $token; 
$stmt = $pdo->prepare("
    INSERT INTO student_progress (user_id, course_id, detail_id, downloaded, progress)
    VALUES (?, ?, ?, 'yes', 100)
    ON DUPLICATE KEY UPDATE downloaded='yes', progress=100
");
$stmt->execute([$user_id, $lesson['course_id'], $lesson_id]);
?>
