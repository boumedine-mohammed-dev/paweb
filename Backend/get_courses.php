<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

include "config.php";

//  user_id  Angular
$user_id = isset($_GET["user_id"]) ? intval($_GET["user_id"]) : 0;

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

$stmt = $pdo->prepare("
    SELECT 
        c.id,
        c.title,
        c.level,
        c.semester,
        c.thumbnail,
        c.created_at,
        uc.enrolled,
        uc.progress
    FROM courses c
    LEFT JOIN user_courses uc
        ON uc.course_id = c.id AND uc.user_id = ?
");

$stmt->execute([$user_id]);

$courses = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    
    //    Base64
    $thumbnail_base64 = null;
    if (!empty($row['thumbnail'])) {
        $thumbnail_base64 = "data:image/jpeg;base64," . base64_encode($row['thumbnail']);
    }

    //    
    $courses[] = [
        "id" => (int)$row["id"],
        "title" => $row["title"],
        "level" => $row["level"],
        "semester" => $row["semester"],
        "thumbnail" => $thumbnail_base64,
        "created_at" => $row["created_at"],
        "enrolled" => $row["enrolled"] ?? "no",
        "progress" => isset($row["progress"]) ? (int)$row["progress"] : 0
    ];
}

echo json_encode($courses);
?>
