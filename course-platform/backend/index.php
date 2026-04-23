<?php
require_once 'config.php';
require_once 'db.php';

// Get the request path
$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/api';
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace($basePath, '', $path);
$path = trim($path, '/');
$segments = explode('/', $path);

$method = $_SERVER['REQUEST_METHOD'];

// Route handling
switch ($segments[0] ?? '') {
    case '':
        jsonResponse(['message' => 'Course Platform API']);
        break;

    // Auth routes
    case 'register':
        if ($method === 'POST') require 'routes/auth.php';
        else errorResponse('Method not allowed', 405);
        break;
    case 'login':
        if ($method === 'POST') require 'routes/auth.php';
        else errorResponse('Method not allowed', 405);
        break;
    case 'logout':
        if ($method === 'POST') require 'routes/auth.php';
        else errorResponse('Method not allowed', 405);
        break;
    case 'me':
        if ($method === 'GET') require 'routes/auth.php';
        else errorResponse('Method not allowed', 405);
        break;

    // Course routes
    case 'courses':
        require 'routes/courses.php';
        break;

    // Section routes
    case 'sections':
        require 'routes/sections.php';
        break;

    // Page routes
    case 'pages':
        require 'routes/pages.php';
        break;

    // Block routes
    case 'blocks':
        require 'routes/blocks.php';
        break;

    // Progress routes
    case 'progress':
        require 'routes/progress.php';
        break;

    default:
        errorResponse('Not found', 404);
}
