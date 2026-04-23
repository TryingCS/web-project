<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $path);

$db = getDB();

if (count($segments) < 2 || $segments[0] !== 'pages') {
    errorResponse('Not found', 404);
}

$pageId = intval($segments[1]);

// Check if page exists with ownership info
$stmt = $db->prepare("
    SELECT p.*, s.course_id, c.creator_id 
    FROM pages p 
    JOIN sections s ON p.section_id = s.id 
    JOIN courses c ON s.course_id = c.id 
    WHERE p.id = ?
");
$stmt->execute([$pageId]);
$page = $stmt->fetch();

if (!$page) {
    errorResponse('Page not found', 404);
}

// Handle /pages/:id/complete
if (count($segments) === 3 && $segments[2] === 'complete') {
    if ($method !== 'POST') {
        errorResponse('Method not allowed', 405);
    }

    $userId = requireAuth();

    // Mark page as completed
    $stmt = $db->prepare("
        INSERT INTO user_progress (user_id, page_id, completed, completed_at) 
        VALUES (?, ?, 1, NOW()) 
        ON DUPLICATE KEY UPDATE completed = 1, completed_at = NOW()
    ");
    $stmt->execute([$userId, $pageId]);

    jsonResponse(['message' => 'Page marked as completed']);
    exit;
}

// Handle /pages/:id/blocks
if (count($segments) === 3 && $segments[2] === 'blocks') {
    switch ($method) {
        case 'GET':
            $stmt = $db->prepare("SELECT * FROM blocks WHERE page_id = ? ORDER BY position, id");
            $stmt->execute([$pageId]);
            $blocks = $stmt->fetchAll();
            
            // Decode JSON content
            foreach ($blocks as &$block) {
                $block['content'] = json_decode($block['content'], true);
            }
            
            jsonResponse($blocks);
            break;

        case 'POST':
            $userId = requireAuth();
            
            if ($page['creator_id'] != $userId) {
                errorResponse('Forbidden', 403);
            }

            $data = getJsonInput();
            if (empty($data['type']) || empty($data['content'])) {
                errorResponse('Type and content are required');
            }

            $type = $data['type'];
            $content = $data['content'];
            $position = $data['position'] ?? 0;

            // Validate block type
            $validTypes = ['text', 'prediction', 'quiz', 'fill_blank', 'image_hotspots'];
            if (!in_array($type, $validTypes)) {
                errorResponse('Invalid block type');
            }

            $stmt = $db->prepare("INSERT INTO blocks (page_id, type, content, position) VALUES (?, ?, ?, ?)");
            $stmt->execute([$pageId, $type, json_encode($content), $position]);
            $blockId = $db->lastInsertId();

            jsonResponse([
                'id' => $blockId,
                'page_id' => $pageId,
                'type' => $type,
                'content' => $content,
                'position' => $position
            ], 201);
            break;

        default:
            errorResponse('Method not allowed', 405);
    }
    exit;
}

// Handle /pages/:id (single page)
switch ($method) {
    case 'GET':
        // Get page with blocks
        $stmt = $db->prepare("SELECT * FROM blocks WHERE page_id = ? ORDER BY position, id");
        $stmt->execute([$pageId]);
        $blocks = $stmt->fetchAll();
        
        // Decode JSON content
        foreach ($blocks as &$block) {
            $block['content'] = json_decode($block['content'], true);
        }
        
        $page['blocks'] = $blocks;
        jsonResponse($page);
        break;

    case 'PUT':
        $userId = requireAuth();
        
        if ($page['creator_id'] != $userId) {
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

        $params[] = $pageId;
        $stmt = $db->prepare("UPDATE pages SET " . implode(', ', $updates) . " WHERE id = ?");
        $stmt->execute($params);

        jsonResponse(['message' => 'Page updated']);
        break;

    case 'DELETE':
        $userId = requireAuth();
        
        if ($page['creator_id'] != $userId) {
            errorResponse('Forbidden', 403);
        }

        $stmt = $db->prepare("DELETE FROM pages WHERE id = ?");
        $stmt->execute([$pageId]);

        jsonResponse(['message' => 'Page deleted']);
        break;

    default:
        errorResponse('Method not allowed', 405);
}
