<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseModel.php';

class Ticket extends BaseModel
{
    public function getByRaffle(int $raffleId): array
    {
        $stmt = $this->db->prepare('SELECT id, numero, estado FROM boletos WHERE id_rifa = :id_rifa ORDER BY numero ASC');
        $stmt->execute([':id_rifa' => $raffleId]);
        return $stmt->fetchAll();
    }

    public function getAvailableByNumbers(int $raffleId, array $numbers): array
    {
        if ($numbers === []) {
            return [];
        }

        $placeholders = implode(',', array_fill(0, count($numbers), '?'));
        $sql = "SELECT id, numero FROM boletos WHERE id_rifa = ? AND estado = 'disponible' AND numero IN ($placeholders)";
        $stmt = $this->db->prepare($sql);
        $params = array_merge([$raffleId], $numbers);
        $stmt->execute($params);

        return $stmt->fetchAll();
    }

    public function markSold(array $ticketIds): void
    {
        if ($ticketIds === []) {
            return;
        }

        $placeholders = implode(',', array_fill(0, count($ticketIds), '?'));
        $sql = "UPDATE boletos SET estado = 'vendido' WHERE id IN ($placeholders)";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($ticketIds);
    }

    public function soldCountByRaffle(int $raffleId): int
    {
        $stmt = $this->db->prepare("SELECT COUNT(*) as total FROM boletos WHERE id_rifa = :id_rifa AND estado = 'vendido'");
        $stmt->execute([':id_rifa' => $raffleId]);
        return (int) $stmt->fetch()['total'];
    }
}
