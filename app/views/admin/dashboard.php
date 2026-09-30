<?php require __DIR__ . '/../layouts/header.php'; ?>

<section>
    <h1>Panel admin</h1>
    <div class="stats-grid">
        <div class="stat-card"><h3>Usuarios</h3><p><?= (int) $stats['usuarios'] ?></p></div>
        <div class="stat-card"><h3>Rifas</h3><p><?= (int) $stats['rifas'] ?></p></div>
        <div class="stat-card"><h3>Ventas</h3><p><?= (int) $stats['ventas'] ?></p></div>
        <div class="stat-card"><h3>Ingresos</h3><p>$<?= number_format((float) $stats['ingresos'], 2) ?></p></div>
    </div>

    <h2>Boletos vendidos por rifa</h2>
    <div class="table-wrap">
        <table>
            <thead><tr><th>Rifa</th><th>Vendidos</th><th>Total boletos</th></tr></thead>
            <tbody>
            <?php foreach ($raffles as $raffle): ?>
                <tr>
                    <td><?= htmlspecialchars($raffle['nombre']) ?></td>
                    <td><?= (int) ($soldByRaffle[$raffle['id']] ?? 0) ?></td>
                    <td><?= (int) $raffle['total_boletos'] ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <h2>Ventas</h2>
    <div class="table-wrap">
        <table>
            <thead><tr><th>ID</th><th>Usuario</th><th>Rifa</th><th>Total</th><th>Fecha</th></tr></thead>
            <tbody>
            <?php foreach ($sales as $sale): ?>
                <tr>
                    <td><?= (int) $sale['id'] ?></td>
                    <td><?= htmlspecialchars($sale['usuario']) ?></td>
                    <td><?= htmlspecialchars($sale['rifa']) ?></td>
                    <td>$<?= number_format((float) $sale['total'], 2) ?></td>
                    <td><?= htmlspecialchars($sale['fecha']) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <h2>Usuarios</h2>
    <div class="table-wrap">
        <table>
            <thead><tr><th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th></tr></thead>
            <tbody>
            <?php foreach ($users as $user): ?>
                <tr>
                    <td><?= (int) $user['id'] ?></td>
                    <td><?= htmlspecialchars($user['nombre']) ?></td>
                    <td><?= htmlspecialchars($user['email']) ?></td>
                    <td><?= htmlspecialchars($user['rol']) ?></td>
                </tr>
            <?php endforeach; ?>
            </tbody>
        </table>
    </div>
</section>

<?php require __DIR__ . '/../layouts/footer.php'; ?>
