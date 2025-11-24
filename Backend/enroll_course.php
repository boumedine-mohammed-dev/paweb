<?php 
// =================== CORS ===================
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// =================== Include DB ===================
include "config.php";
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// =================== Check Token ===================
if (!isset($_COOKIE['token'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: Token not found']);
    exit;
}

$token = $_COOKIE['token'];

try {
    //     
    $stmt = $pdo->prepare("SELECT id FROM users WHERE token = ?");
    $stmt->execute([$token]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }

    $user_id = $user['id'];

    // =================== Get course_id ===================
    $data = json_decode(file_get_contents("php://input"), true);
    $course_id = isset($data['course_id']) ? intval($data['course_id']) : 0;

    if (!$course_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid course_id']);
        exit;
    }

    // =================== Get first lesson id ===================
    $stmt = $pdo->prepare("SELECT id FROM course_details WHERE course_id = ? ORDER BY id ASC LIMIT 1");
    $stmt->execute([$course_id]);
    $lesson = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$lesson) {
        http_response_code(500);
        echo json_encode(['error' => 'No lessons found for this course']);
        exit;
    }

    $lesson_id = $lesson['id'];

    // =================== Check if user is already enrolled ===================
    $stmt = $pdo->prepare("SELECT * FROM user_courses WHERE user_id = ? AND course_id = ?");
    $stmt->execute([$user_id, $course_id]);
    $user_course = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user_course) {
        //     enrolled
        if ($user_course['enrolled'] !== 'yes') {
            $stmt = $pdo->prepare("UPDATE user_courses 
                                   SET enrolled = 'yes' 
                                   WHERE user_id = ? AND course_id = ?");
            $stmt->execute([$user_id, $course_id]);
        }
    } else {
        //    
$stmt = $pdo->prepare("
    INSERT INTO user_courses (user_id, course_id, lesson_id, enrolled, progress)
    VALUES (?, ?, ?, 'yes', 0)
");
$stmt->execute([$user_id, $course_id, $lesson_id]);


    }

    echo json_encode([
        'success' => true,
        'course_id' => $course_id,
        'lesson_id' => $lesson_id
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
