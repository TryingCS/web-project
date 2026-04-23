<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $path);

$db = getDB();

if (count($segments) < 2 || $segments[0] !== 'blocks') {
    errorResponse('Not found', 404);
}

$blockId = intval($segments[1]);

// Check if block exists with ownership info
$stmt = $db->prepare("
    SELECT b.*, p.section_id, s.course_id, c.creator_id 
    FROM blocks b 
    JOIN pages p ON b.page_id = p.id 
    JOIN sections s ON p.section_id = s.id 
    JOIN courses c ON s.course_id = c.id 
    WHERE b.id = ?
");
$stmt->execute([$blockId]);
$block = $stmt->fetch();

if (!$block) {
    errorResponse('Block not found', 404);
}

// Decode JSON content
$block['content'] = json_decode($block['content'], true);

// Handle /blocks/:id/attempt (for quiz attempts)
if (count($segments) === 3 && $segments[2] === 'attempt') {
    if ($method !== 'POST') {
        errorResponse('Method not allowed', 405);
    }

    $userId = requireAuth();
    $data = getJsonInput();

    $answers = $data['answers'] ?? null;
    $score = 0;

    // Calculate score based on block type
    if ($block['type'] === 'prediction' || $block['type'] === 'quiz') {
        $correctAnswer = $block['content']['correct'] ?? null;
        if ($answers === $correctAnswer) {
            $score = 1;
        }
    } elseif ($block['type'] === 'fill_blank') {
        $correctAnswers = $block['content']['answers'] ?? [];
        $userAnswers = is_array($answers) ? $answers : [$answers];
        $correctCount = 0;
        foreach ($correctAnswers as $i => $correct) {
            if (isset($userAnswers[$i]) && strtolower(trim($userAnswers[$i])) === strtolower(trim($correct))) {
                $correctCount++;
            }
        }
        $score = count($correctAnswers) > 0 ? round(($correctCount / count($correctAnswers)) * 100) : 0;
    }

    // Store attempt
    $stmt = $db->prepare("INSERT INTO quiz_attempts (user_id, block_id, answers, score) VALUES (?, ?, ?, ?)");
    $stmt->execute([$userId, $blockId, json_encode($answers), $score]);

    jsonResponse([
        'score' => $score,
        'correct' => $score > 0
    ]);
    exit;
}

// Handle /blocks/:id/position
if (count($segments) === 3 && $segments[2] === 'position') {
    if ($method !== 'PATCH') {
        errorResponse('Method not allowed', 405);
    }

    $userId = requireAuth();
    
    if ($block['creator_id'] != $userId) {
        errorResponse('Forbidden', 403);
    }

    $data = getJsonInput();
    if (!isset($data['position'])) {
        errorResponse('Position is required');
    }

    $position = intval($data['position']);
    $stmt = $db->prepare("UPDATE blocks SET position = ? WHERE id = ?");
    $stmt->execute([$position, $blockId]);

    jsonResponse(['message' => 'Position updated']);
    exit;
}

// Handle /blocks/:id (single block)
switch ($method) {
    case 'GET':
        jsonResponse($block);
        break;

    case 'PUT':
        $userId = requireAuth();
        
        if ($block['creator_id'] != $userId) {
            errorResponse('Forbidden', 403);
        }

        $data = getJsonInput();
        $updates = [];
        $params = [];

        if (isset($data['content'])) {
            $updates[] = 'content = ?';
            $params[] = json_encode($data['content']);
        }
        if (isset($data['position'])) {
            $updates[] = 'position = ?';
            $params[] = intval($data['position']);
        }

        if (empty($updates)) {
            errorResponse('No fields to update');
        }

        $params[] = $blockId;
        $stmt = $db->prepare("UPDATE blocks SET " . implode(', ', $updates) . " WHERE id = ?");
        $stmt->execute($params);

        jsonResponse(['message' => 'Block updated']);
        break;

    case 'DELETE':
        $userId = requireAuth();
        
        if ($block['creator_id'] != $userId) {
            errorResponse('Forbidden', 403);
        }

        $stmt = $db->prepare("DELETE FROM blocks WHERE id = ?");
        $stmt->execute([$blockId]);

        jsonResponse(['message' => 'Block deleted']);
        break;

    default:
        errorResponse('Method not allowed', 405);
}
