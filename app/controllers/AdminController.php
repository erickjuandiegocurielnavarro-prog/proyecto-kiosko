<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../models/Sale.php';
require_once __DIR__ . '/../models/Raffle.php';
require_once __DIR__ . '/../models/Ticket.php';

class AdminController extends BaseController
{
    public function dashboard(): void
    {
        $this->requireAdmin();

        $userModel = new User();
        $saleModel = new Sale();
        $raffleModel = new Raffle();
        $ticketModel = new Ticket();
        $raffles = $raffleModel->all();

        $soldByRaffle = [];
        foreach ($raffles as $raffle) {
            $soldByRaffle[$raffle['id']] = $ticketModel->soldCountByRaffle((int) $raffle['id']);
        }

        $this->view('admin/dashboard', [
            'title' => 'Panel de administracion',
            'stats' => $saleModel->stats(),
            'users' => $userModel->all(),
            'sales' => $saleModel->allWithDetails(),
            'raffles' => $raffles,
            'soldByRaffle' => $soldByRaffle,
        ]);
    }
}
