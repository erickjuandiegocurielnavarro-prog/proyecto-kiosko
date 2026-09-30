<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseModel.php';

class Raffle extends BaseModel
{
    public function all(): array
    {
        return $this->db->query('SELECT * FROM rifas ORDER BY id DESC')->fetchAll();
    }

    public function find(int $id): ?array
    {
        $stmt = $this->db->prepare('SELECT * FROM rifas WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();

        return $row ?: null;
    }

    public function create(array $data): int
    {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare(
                'INSERT INTO rifas (nombre, descripcion, precio, total_boletos, fecha_sorteo, imagen)
                 VALUES (:nombre, :descripcion, :precio, :total_boletos, :fecha_sorteo, :imagen)'
            );
            $stmt->execute([
                ':nombre' => $data['nombre'],
                ':descripcion' => $data['descripcion'],
                ':precio' => $data['precio'],
                ':total_boletos' => $data['total_boletos'],
                ':fecha_sorteo' => $data['fecha_sorteo'],
                ':imagen' => $data['imagen'],
            ]);

            $raffleId = (int) $this->db->lastInsertId();

            // Genera boletos automaticamente para evitar carga manual.
            $ticketStmt = $this->db->prepare(
                'INSERT INTO boletos (numero, id_rifa, estado) VALUES (:numero, :id_rifa, :estado)'
            );

            for ($i = 1; $i <= (int) $data['total_boletos']; $i++) {
                $ticketStmt->execute([
                    ':numero' => $i,
                    ':id_rifa' => $raffleId,
                    ':estado' => 'disponible',
                ]);
            }

            $this->db->commit();
            return $raffleId;
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function update(int $id, array $data): bool
    {
        $stmt = $this->db->prepare(
            'UPDATE rifas
             SET nombre = :nombre, descripcion = :descripcion, precio = :precio, fecha_sorteo = :fecha_sorteo, imagen = :imagen
             WHERE id = :id'
        );

        return $stmt->execute([
            ':id' => $id,
            ':nombre' => $data['nombre'],
            ':descripcion' => $data['descripcion'],
            ':precio' => $data['precio'],
            ':fecha_sorteo' => $data['fecha_sorteo'],
            ':imagen' => $data['imagen'],
        ]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->db->prepare('DELETE FROM rifas WHERE id = :id');
        return $stmt->execute([':id' => $id]);
    }
}
