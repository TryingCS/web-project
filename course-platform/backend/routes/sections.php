<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $path);

$db = getDB();

if (count($segments) < 2 || $segments[0] !== 'sections') {
    errorResponse('Not found', 404);
}

$sectionId = intval($segments[1]);

// Check if section exists
$stmt = $db->prepare("SELECT s.*, c.creator_id FROM sections s JOIN courses c ON s.course_id = c.id WHERE s.id = ?");
$stmt->execute([$sectionId]);
$section = $stmt->fetch();

if (!$section) {
    errorResponse('Section not found', 404);
}

// Handle /sections/:id/pages
if (count($segments) === 3 && $segments[2] === 'pages') {
    switch ($method) {
        case 'GET':
            $stmt = $db->prepare("SELECT * FROM pages WHERE section_id = ? ORDER BY position, id");
            $stmt->execute([$sectionId]);
            $pages = $stmt->fetchAll();
            jsonResponse($pages);
            break;

        case 'POST':
            $userId = requireAuth();
            
            if ($section['creator_id'] != $userId) {
                errorResponse('Forbidden', 403);
            }

            $data = getJsonInput();
            if (empty($data['title'])) {
                errorResponse('Title is required');
            }

            $title = trim($data['title']);
            $position = $data['position'] ?? 0;

            $stmt = $db->prepare("INSERT INTO pages (section_id, title, position) VALUES (?, ?, ?)");
            $stmt->execute([$sectionId, $title, $position]);
            $pageId = $db->lastInsertId();

            jsonResponse([
                'id' => $pageId,
                'section_id' => $sectionId,
                'title' => $title,
                'position' => $position
            ], 201);
            break;

        default:
            errorResponse('Method not allowed', 405);
    }
    exit;
}

// Handle /sections/:id (single section)
switch ($method) {
    case 'GET':
        jsonResponse($section);
        break;

    case 'PUT':
        $userId = requireAuth();
        
        if ($section['creator_id'] != $userId) {
            errorResponse('Forbidden', 403);
        }

        $data = getJsonInput();
        $updates = [];
        $params = [];

        if (isset($data['title'])) {
            $updates[] = 'title = ?';
            $params[] = trim($data['title']);
        }
        if (isset($data['position'])) {
            $updates[] = 'position = ?';
            $params[] = intval($data['position']);
        }

        if (empty($updates)) {
            errorResponse('No fields to update');
        }

        $params[] = $sectionId;
        $stmt = $db->prepare("UPDATE sections SET " . implode(', ', $updates) . " WHERE id = ?");
        $stmt->execute($params);

        jsonResponse(['message' => 'Section updated']);
        break;

    case 'DELETE':
        $userId = requireAuth();
        
        if ($section['creator_id'] != $userId) {
            errorResponse('Forbidden', 403);
        }

        $stmt = $db->prepare("DELETE FROM sections WHERE id = ?");
        $stmt->execute([$sectionId]);

        jsonResponse(['message' => 'Section deleted']);
        break;

    default:
        errorResponse('Method not allowed', 405);
}
