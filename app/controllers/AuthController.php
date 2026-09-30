<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/User.php';

class AuthController extends BaseController
{
    public function showLogin(): void
    {
        $this->view('auth/login', ['title' => 'Iniciar sesion']);
    }

    public function showRegister(): void
    {
        $this->view('auth/register', ['title' => 'Registro']);
    }

    public function register(): void
    {
        $nombre = trim($_POST['nombre'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = (string) ($_POST['password'] ?? '');

        if ($nombre === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
            $_SESSION['error'] = 'Datos invalidos. Verifica nombre, email y password (min 6).';
            $this->redirect('/register');
        }

        $userModel = new User();
        if ($userModel->findByEmail($email)) {
            $_SESSION['error'] = 'El email ya esta registrado.';
            $this->redirect('/register');
        }

        $userModel->create($nombre, $email, $password);
        $_SESSION['success'] = 'Registro exitoso. Ahora puedes iniciar sesion.';
        $this->redirect('/login');
    }

    public function login(): void
    {
        $email = trim($_POST['email'] ?? '');
        $password = (string) ($_POST['password'] ?? '');

        $userModel = new User();
        $user = $userModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            $_SESSION['error'] = 'Credenciales invalidas.';
            $this->redirect('/login');
        }

        unset($user['password']);
        $_SESSION['user'] = $user;
        $this->redirect('/');
    }

    public function logout(): void
    {
        session_destroy();
        $this->redirect('/login');
    }
}
