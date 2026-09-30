<?php

declare(strict_types=1);

abstract class BaseController
{
    /** @var array */
    protected $config;

    public function __construct()
    {
        $this->config = require __DIR__ . '/../../config/config.php';
    }

    protected function view(string $view, array $data = []): void
    {
        extract($data);
        $config = $this->config;
        require __DIR__ . '/../views/' . $view . '.php';
    }

    protected function redirect(string $path): void
    {
        header('Location: ' . $this->config['base_url'] . $path);
        exit;
    }

    protected function json(array $data, int $statusCode = 200): void
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    protected function requireAuth(): void
    {
        if (empty($_SESSION['user'])) {
            $this->redirect('/login');
        }
    }

    protected function requireAdmin(): void
    {
        $this->requireAuth();
        if (($_SESSION['user']['rol'] ?? '') !== 'admin') {
            $this->redirect('/');
        }
    }
}
