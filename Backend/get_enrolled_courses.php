<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET");
header("Access-Control-Allow-Headers: Content-Type");

include "config.php";

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($user_id <= 0) {
    echo json_encode(["error" => "Invalid user_id"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT 
        c.id,
        c.title,
        c.level,
        c.thumbnail,
        uc.progress,
        uc.last_accessed
    FROM user_courses uc
    INNER JOIN courses c ON uc.course_id = c.id
    WHERE uc.user_id = ?
");

$stmt->execute([$user_id]);

$courses = [];

while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {

    $thumbnail_base64 = null;
    if (!empty($row['thumbnail'])) {
        $thumbnail_base64 = "data:image/jpeg;base64," . base64_encode($row['thumbnail']);
    }

    $courses[] = [
        "id" => (int)$row["id"],
        "title" => $row["title"],
        "progress" => (int)$row["progress"],
        "thumbnail" => $thumbnail_base64,
        "lastAccessed" => $row["last_accessed"] ?? "Unknown",
        "color" => "blue"
    ];
}

echo json_encode($courses);
?>
