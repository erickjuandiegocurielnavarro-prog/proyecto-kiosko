<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseModel.php';

class User extends BaseModel
{
    public function create(string $nombre, string $email, string $password, string $rol = 'usuario'): bool
    {
        $sql = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (:nombre, :email, :password, :rol)';
        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':nombre' => $nombre,
            ':email' => $email,
            ':password' => password_hash($password, PASSWORD_DEFAULT),
            ':rol' => $rol,
        ]);
    }

    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM usuarios WHERE email = :email LIMIT 1');
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch();

        return $user ?: null;
    }

    public function all(): array
    {
        return $this->db->query('SELECT id, nombre, email, rol FROM usuarios ORDER BY id DESC')->fetchAll();
    }
}
