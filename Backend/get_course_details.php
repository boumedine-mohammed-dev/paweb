<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

include "config.php";

// ID   GET
$course_id = isset($_GET["id"]) ? intval($_GET["id"]) : 0;
//   user_id     
$user_id = isset($_GET["user_id"]) ? intval($_GET["user_id"]) : 0;

  
$stmt0 = $pdo->prepare("SELECT title FROM courses WHERE id=?");
$stmt0->execute([$course_id]);
$course = $stmt0->fetch(PDO::FETCH_ASSOC);
$course_name = $course ? $course["title"] : "";


$stmt = $pdo->prepare("SELECT id, lesson_title FROM course_details WHERE course_id=? ORDER BY id ASC");
$stmt->execute([$course_id]);
$lessons = $stmt->fetchAll(PDO::FETCH_ASSOC);

$stmt2 = $pdo->prepare("
    SELECT progress, total_lessons, completed_lessons
    FROM user_courses
    WHERE user_id=? AND course_id=?
");
$stmt2->execute([$user_id, $course_id]);
$user_course = $stmt2->fetch(PDO::FETCH_ASSOC);

$progress = $user_course ? intval($user_course["progress"]) : 0;
$total_lessons = $user_course ? intval($user_course["total_lessons"]) : count($lessons);
$completed_lessons = $user_course ? intval($user_course["completed_lessons"]) : 0;

foreach ($lessons as &$lesson) {
    $lesson["completed"] = 0; 
}

// JSON 
echo json_encode([
    "course_id" => $course_id,
    "course_name" => $course_name,
    "progress" => $progress,
    "total_lessons" => $total_lessons,
    "completed_lessons" => $completed_lessons,
    "lessons" => $lessons
]);
