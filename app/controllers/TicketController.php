<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Raffle.php';
require_once __DIR__ . '/../models/Ticket.php';
require_once __DIR__ . '/../models/Sale.php';

class TicketController extends BaseController
{
    public function purchase(): void
    {
        $this->requireAuth();

        $input = json_decode(file_get_contents('php://input'), true);
        $raffleId = (int) ($input['raffle_id'] ?? 0);
        $numbers = $input['numbers'] ?? [];

        if ($raffleId <= 0 || !is_array($numbers) || $numbers === []) {
            $this->json(['ok' => false, 'message' => 'Datos invalidos'], 422);
        }

        $numbers = array_values(array_unique(array_map('intval', $numbers)));
        $raffle = (new Raffle())->find($raffleId);
        if (!$raffle) {
            $this->json(['ok' => false, 'message' => 'Rifa no encontrada'], 404);
        }

        $ticketModel = new Ticket();
        $available = $ticketModel->getAvailableByNumbers($raffleId, $numbers);

        if (count($available) !== count($numbers)) {
            $this->json([
                'ok' => false,
                'message' => 'Algunos boletos ya fueron vendidos. Recarga e intenta nuevamente.',
            ], 409);
        }

        $ticketIds = array_map(static function (array $t): int {
            return (int) $t['id'];
        }, $available);
        $total = count($ticketIds) * (float) $raffle['precio'];

        $saleModel = new Sale();
        $saleModel->create((int) $_SESSION['user']['id'], $raffleId, $total, $ticketIds);
        $ticketModel->markSold($ticketIds);

        $this->json([
            'ok' => true,
            'message' => 'Compra realizada con exito',
            'total' => $total,
            'tickets' => array_values($numbers),
        ]);
    }
}
