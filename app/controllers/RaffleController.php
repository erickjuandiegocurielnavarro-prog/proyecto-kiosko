<?php

declare(strict_types=1);

require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Raffle.php';
require_once __DIR__ . '/../models/Ticket.php';

class RaffleController extends BaseController
{
    public function index(): void
    {
        $raffles = (new Raffle())->all();
        $this->view('raffles/index', [
            'title' => 'Rifas disponibles',
            'raffles' => $raffles,
        ]);
    }

    public function createForm(): void
    {
        $this->requireAdmin();
        $this->view('raffles/create', ['title' => 'Crear rifa']);
    }

    public function store(): void
    {
        $this->requireAdmin();
        $nombre = trim($_POST['nombre'] ?? '');
        $descripcion = trim($_POST['descripcion'] ?? '');
        $precio = (float) ($_POST['precio'] ?? 0);
        $totalBoletos = (int) ($_POST['total_boletos'] ?? 0);
        $fecha = trim($_POST['fecha_sorteo'] ?? '');
        $imagen = trim($_POST['imagen'] ?? '');

        if ($nombre === '' || $descripcion === '' || $precio <= 0 || $totalBoletos <= 0 || $fecha === '') {
            $_SESSION['error'] = 'Completa correctamente todos los campos.';
            $this->redirect('/raffles/create');
        }

        (new Raffle())->create([
            'nombre' => $nombre,
            'descripcion' => $descripcion,
            'precio' => $precio,
            'total_boletos' => $totalBoletos,
            'fecha_sorteo' => $fecha,
            'imagen' => $imagen,
        ]);

        $_SESSION['success'] = 'Rifa creada y boletos generados automaticamente.';
        $this->redirect('/');
    }

    public function editForm(int $id): void
    {
        $this->requireAdmin();
        $raffle = (new Raffle())->find($id);
        if (!$raffle) {
            $this->redirect('/');
        }

        $this->view('raffles/edit', [
            'title' => 'Editar rifa',
            'raffle' => $raffle,
        ]);
    }

    public function update(int $id): void
    {
        $this->requireAdmin();
        (new Raffle())->update($id, [
            'nombre' => trim($_POST['nombre'] ?? ''),
            'descripcion' => trim($_POST['descripcion'] ?? ''),
            'precio' => (float) ($_POST['precio'] ?? 0),
            'fecha_sorteo' => trim($_POST['fecha_sorteo'] ?? ''),
            'imagen' => trim($_POST['imagen'] ?? ''),
        ]);
        $_SESSION['success'] = 'Rifa actualizada.';
        $this->redirect('/');
    }

    public function delete(int $id): void
    {
        $this->requireAdmin();
        (new Raffle())->delete($id);
        $_SESSION['success'] = 'Rifa eliminada.';
        $this->redirect('/');
    }

    public function tickets(int $raffleId): void
    {
        $this->requireAuth();
        $tickets = (new Ticket())->getByRaffle($raffleId);
        $this->json(['ok' => true, 'tickets' => $tickets]);
    }
}
