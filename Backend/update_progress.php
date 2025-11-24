<?php  
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");

include "config.php";

$data = json_decode(file_get_contents("php://input"));

$user_id = $data->user_id;
$course_id = $data->course_id;
$completed = $data->completed_lessons;
$total = $data->total_lessons;

//      
if ($total == 0) {
    echo json_encode(["success" => false, "error" => "No lessons found"]);
    exit;
}

//   
$progress = round(($completed / $total) * 100);

$check = $pdo->prepare("
    SELECT id FROM user_courses 
    WHERE user_id = ? AND course_id = ?
");
$check->execute([$user_id, $course_id]);

if ($check->rowCount() == 0) {

    $insert = $pdo->prepare("
        INSERT INTO user_courses (user_id, course_id, total_lessons, completed_lessons, progress, last_accessed)
        VALUES (?, ?, ?, ?, ?, NOW())
    ");

    $insert->execute([$user_id, $course_id, $total, $completed, $progress]);

    echo json_encode([
        "success" => true,
        "message" => "Progress created",
        "progress" => $progress
    ]);
    exit;

} else {

    $update = $pdo->prepare("
        UPDATE user_courses
        SET total_lessons = ?, 
            completed_lessons = ?, 
            progress = ?, 
            last_accessed = NOW()
        WHERE user_id = ? AND course_id = ?
    ");

    $update->execute([$total, $completed, $progress, $user_id, $course_id]);

    echo json_encode([
        "success" => true,
        "message" => "Progress updated",
        "progress" => $progress,
        "total" => $total,
        "completed" => $completed,
        "user_id" => $user_id,
        "course_id" => $course_id,

    ]);
    exit;
}
?>
