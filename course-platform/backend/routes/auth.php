<?php
require_once __DIR__ . '/../db.php';

$method = $_SERVER['REQUEST_METHOD'];
$path = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $path);
$action = end($segments);

$db = getDB();

switch ($action) {
    case 'register':
        if ($method !== 'POST') {
            errorResponse('Method not allowed', 405);
        }

        $data = getJsonInput();
        
        if (empty($data['username']) || empty($data['email']) || empty($data['password'])) {
            errorResponse('Username, email, and password are required');
        }

        $username = trim($data['username']);
        $email = trim($data['email']);
        $password = $data['password'];

        // Validate email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            errorResponse('Invalid email format');
        }

        // Check if username exists
        $stmt = $db->prepare("SELECT id FROM users WHERE username = ?");
        $stmt->execute([$username]);
        if ($stmt->fetch()) {
            errorResponse('Username already exists');
        }

        // Check if email exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            errorResponse('Email already exists');
        }

        // Hash password
        $passwordHash = password_hash($password, PASSWORD_BCRYPT);

        // Insert user
        $stmt = $db->prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)");
        $stmt->execute([$username, $email, $passwordHash]);
        $userId = $db->lastInsertId();

        // Set session
        $_SESSION['user_id'] = $userId;

        jsonResponse([
            'id' => $userId,
            'username' => $username,
            'email' => $email
        ], 201);
        break;

    case 'login':
        if ($method !== 'POST') {
            errorResponse('Method not allowed', 405);
        }

        $data = getJsonInput();
        
        if (empty($data['email']) || empty($data['password'])) {
            errorResponse('Email and password are required');
        }

        $email = trim($data['email']);
        $password = $data['password'];

        // Find user by email
        $stmt = $db->prepare("SELECT id, username, email, password_hash FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password_hash'])) {
            errorResponse('Invalid email or password', 401);
        }

        // Set session
        $_SESSION['user_id'] = $user['id'];

        jsonResponse([
            'id' => $user['id'],
            'username' => $user['username'],
            'email' => $user['email']
        ]);
        break;

    case 'logout':
        if ($method !== 'POST') {
            errorResponse('Method not allowed', 405);
        }

        session_destroy();
        jsonResponse(['message' => 'Logged out successfully']);
        break;

    case 'me':
        if ($method !== 'GET') {
            errorResponse('Method not allowed', 405);
        }

        $userId = requireAuth();

        $stmt = $db->prepare("SELECT id, username, email, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();

        if (!$user) {
            errorResponse('User not found', 404);
        }

        jsonResponse($user);
        break;

    default:
        errorResponse('Not found', 404);
}
