<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $path);

$db = getDB();

// Handle /courses and /courses/:id
if (count($segments) === 1 && $segments[0] === 'courses') {
    // List all courses or create new
    switch ($method) {
        case 'GET':
            // Get all courses with creator info
            $stmt = $db->query("
                SELECT c.*, u.username as creator_name 
                FROM courses c 
                JOIN users u ON c.creator_id = u.id 
                ORDER BY c.created_at DESC
            ");
            $courses = $stmt->fetchAll();
            jsonResponse($courses);
            break;

        case 'POST':
            $userId = requireAuth();
            $data = getJsonInput();

            if (empty($data['title'])) {
                errorResponse('Title is required');
            }

            $title = trim($data['title']);
            $description = $data['description'] ?? '';
            $imageUrl = $data['image_url'] ?? null;

            $stmt = $db->prepare("INSERT INTO courses (title, description, creator_id, image_url) VALUES (?, ?, ?, ?)");
            $stmt->execute([$title, $description, $userId, $imageUrl]);
            $courseId = $db->lastInsertId();

            jsonResponse([
                'id' => $courseId,
                'title' => $title,
                'description' => $description,
                'creator_id' => $userId,
                'image_url' => $imageUrl
            ], 201);
            break;

        default:
            errorResponse('Method not allowed', 405);
    }
} elseif (count($segments) >= 2 && $segments[0] === 'courses') {
    $courseId = intval($segments[1]);

    // Check if course exists
    $stmt = $db->prepare("SELECT * FROM courses WHERE id = ?");
    $stmt->execute([$courseId]);
    $course = $stmt->fetch();

    if (!$course) {
        errorResponse('Course not found', 404);
    }

    // Handle /courses/:id/sections
    if (count($segments) === 3 && $segments[2] === 'sections') {
        switch ($method) {
            case 'GET':
                $stmt = $db->prepare("SELECT * FROM sections WHERE course_id = ? ORDER BY position, id");
                $stmt->execute([$courseId]);
                $sections = $stmt->fetchAll();
                jsonResponse($sections);
                break;

            case 'POST':
                $userId = requireAuth();
                
                // Check ownership
                if ($course['creator_id'] != $userId) {
                    errorResponse('Forbidden', 403);
                }

                $data = getJsonInput();
                if (empty($data['title'])) {
                    errorResponse('Title is required');
                }

                $title = trim($data['title']);
                $position = $data['position'] ?? 0;

                $stmt = $db->prepare("INSERT INTO sections (course_id, title, position) VALUES (?, ?, ?)");
                $stmt->execute([$courseId, $title, $position]);
                $sectionId = $db->lastInsertId();

                jsonResponse([
                    'id' => $sectionId,
                    'course_id' => $courseId,
                    'title' => $title,
                    'position' => $position
                ], 201);
                break;

            default:
                errorResponse('Method not allowed', 405);
        }
        exit;
    }

    // Handle /courses/:id/progress
    if (count($segments) === 3 && $segments[2] === 'progress') {
        if ($method !== 'GET') {
            errorResponse('Method not allowed', 405);
        }

        $userId = requireAuth();

        // Get all pages in this course
        $stmt = $db->prepare("
            SELECT p.id 
            FROM pages p 
            JOIN sections s ON p.section_id = s.id 
            WHERE s.course_id = ?
        ");
        $stmt->execute([$courseId]);
        $pages = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Get completed pages for this user
        $stmt = $db->prepare("
            SELECT page_id FROM user_progress 
            WHERE user_id = ? AND page_id IN (" . implode(',', $pages ?: [0]) . ") AND completed = 1
        ");
        $stmt->execute([$userId]);
        $completedPages = $stmt->fetchAll(PDO::FETCH_COLUMN);

        jsonResponse([
            'completed_pages' => $completedPages,
            'total_pages' => count($pages),
            'completed_count' => count($completedPages),
            'percentage' => count($pages) > 0 ? round((count($completedPages) / count($pages)) * 100) : 0
        ]);
        exit;
    }

    // Handle /courses/:id (single course)
    switch ($method) {
        case 'GET':
            // Get course with all sections, pages, and blocks
            $stmt = $db->prepare("
                SELECT c.*, u.username as creator_name 
                FROM courses c 
                JOIN users u ON c.creator_id = u.id 
                WHERE c.id = ?
            ");
            $stmt->execute([$courseId]);
            $course = $stmt->fetch();

            // Get sections with pages
            $stmt = $db->prepare("SELECT * FROM sections WHERE course_id = ? ORDER BY position, id");
            $stmt->execute([$courseId]);
            $sections = $stmt->fetchAll();

            foreach ($sections as &$section) {
                $stmt = $db->prepare("SELECT * FROM pages WHERE section_id = ? ORDER BY position, id");
                $stmt->execute([$section['id']]);
                $section['pages'] = $stmt->fetchAll();
            }

            $course['sections'] = $sections;
            jsonResponse($course);
            break;

        case 'PUT':
            $userId = requireAuth();
            
            if ($course['creator_id'] != $userId) {
                errorResponse('Forbidden', 403);
            }

            $data = getJsonInput();
            $updates = [];
            $params = [];

            if (isset($data['title'])) {
                $updates[] = 'title = ?';
                $params[] = trim($data['title']);
            }
            if (isset($data['description'])) {
                $updates[] = 'description = ?';
                $params[] = $data['description'];
            }
            if (isset($data['image_url'])) {
                $updates[] = 'image_url = ?';
                $params[] = $data['image_url'];
            }

            if (empty($updates)) {
                errorResponse('No fields to update');
            }

            $params[] = $courseId;
            $stmt = $db->prepare("UPDATE courses SET " . implode(', ', $updates) . " WHERE id = ?");
            $stmt->execute($params);

            jsonResponse(['message' => 'Course updated']);
            break;

        case 'DELETE':
            $userId = requireAuth();
            
            if ($course['creator_id'] != $userId) {
                errorResponse('Forbidden', 403);
            }

            $stmt = $db->prepare("DELETE FROM courses WHERE id = ?");
            $stmt->execute([$courseId]);

            jsonResponse(['message' => 'Course deleted']);
            break;

        default:
            errorResponse('Method not allowed', 405);
    }
} else {
    errorResponse('Not found', 404);
}
