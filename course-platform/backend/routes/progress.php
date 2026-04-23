<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $path);

$db = getDB();

$userId = requireAuth();

// Handle /progress - get all progress for current user
if (count($segments) === 1 && $segments[0] === 'progress') {
    if ($method !== 'GET') {
        errorResponse('Method not allowed', 405);
    }

    // Get all completed pages with course info
    $stmt = $db->prepare("
        SELECT up.*, p.title as page_title, p.section_id, s.title as section_title, 
               s.course_id, c.title as course_title
        FROM user_progress up
        JOIN pages p ON up.page_id = p.id
        JOIN sections s ON p.section_id = s.id
        JOIN courses c ON s.course_id = c.id
        WHERE up.user_id = ? AND up.completed = 1
        ORDER BY up.completed_at DESC
    ");
    $stmt->execute([$userId]);
    $progress = $stmt->fetchAll();

    jsonResponse($progress);
    exit;
}

errorResponse('Not found', 404);
