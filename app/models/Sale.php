<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseModel.php';

class Sale extends BaseModel
{
    public function create(int $userId, int $raffleId, float $total, array $ticketIds): int
    {
        $this->db->beginTransaction();

        try {
            $stmt = $this->db->prepare(
                'INSERT INTO ventas (id_usuario, id_rifa, total, fecha) VALUES (:id_usuario, :id_rifa, :total, NOW())'
            );
            $stmt->execute([
                ':id_usuario' => $userId,
                ':id_rifa' => $raffleId,
                ':total' => $total,
            ]);

            $saleId = (int) $this->db->lastInsertId();
            $detailStmt = $this->db->prepare(
                'INSERT INTO detalle_venta (id_venta, id_boleto) VALUES (:id_venta, :id_boleto)'
            );

            foreach ($ticketIds as $ticketId) {
                $detailStmt->execute([
                    ':id_venta' => $saleId,
                    ':id_boleto' => $ticketId,
                ]);
            }

            $this->db->commit();
            return $saleId;
        } catch (Throwable $e) {
            $this->db->rollBack();
            throw $e;
        }
    }

    public function allWithDetails(): array
    {
        $sql = "SELECT v.id, v.total, v.fecha, u.nombre as usuario, r.nombre as rifa
                FROM ventas v
                INNER JOIN usuarios u ON u.id = v.id_usuario
                INNER JOIN rifas r ON r.id = v.id_rifa
                ORDER BY v.id DESC";

        return $this->db->query($sql)->fetchAll();
    }

    public function stats(): array
    {
        $stats = [];
        $stats['usuarios'] = (int) $this->db->query('SELECT COUNT(*) as c FROM usuarios')->fetch()['c'];
        $stats['rifas'] = (int) $this->db->query('SELECT COUNT(*) as c FROM rifas')->fetch()['c'];
        $stats['ventas'] = (int) $this->db->query('SELECT COUNT(*) as c FROM ventas')->fetch()['c'];
        $stats['ingresos'] = (float) $this->db->query('SELECT IFNULL(SUM(total), 0) as s FROM ventas')->fetch()['s'];

        return $stats;
    }
}
