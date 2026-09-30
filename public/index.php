<?php

declare(strict_types=1);

session_start();

require_once __DIR__ . '/../app/controllers/AuthController.php';
require_once __DIR__ . '/../app/controllers/RaffleController.php';
require_once __DIR__ . '/../app/controllers/TicketController.php';
require_once __DIR__ . '/../app/controllers/AdminController.php';

$routes = require __DIR__ . '/../routes/web.php';
$method = $_SERVER['REQUEST_METHOD'];
$requestPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: '/';
$basePath = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$basePath = $basePath === '/' ? '' : rtrim($basePath, '/');

if ($basePath !== '' && str_starts_with($requestPath, $basePath)) {
    $requestPath = substr($requestPath, strlen($basePath));
}
$requestPath = $requestPath === '' ? '/' : $requestPath;

foreach ($routes as [$httpMethod, $routePath, $handler]) {
    if ($httpMethod !== $method) {
        continue;
    }

    $pattern = preg_replace('#\{[a-zA-Z_]+\}#', '([0-9]+)', $routePath);
    $pattern = '#^' . $pattern . '$#';

    if (!preg_match($pattern, $requestPath, $matches)) {
        continue;
    }

    array_shift($matches);
    [$controllerName, $action] = explode('@', $handler);
    $controller = new $controllerName();
    $controller->$action(...array_map('intval', $matches));
    exit;
}

http_response_code(404);
echo '404 - Ruta no encontrada';
