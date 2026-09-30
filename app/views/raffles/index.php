<?php require __DIR__ . '/../layouts/header.php'; ?>

<section>
    <h1>Rifas disponibles</h1>
    <?php if (empty($_SESSION['user'])): ?>
        <p>Para comprar boletos debes iniciar sesion.</p>
    <?php endif; ?>

    <div class="raffles-grid">
        <?php foreach ($raffles as $raffle): ?>
            <article class="card">
                <img src="<?= htmlspecialchars($raffle['imagen'] ?: 'https://placehold.co/600x340?text=Rifa') ?>" alt="Imagen rifa">
                <div class="card-body">
                    <h3><?= htmlspecialchars($raffle['nombre']) ?></h3>
                    <p><?= htmlspecialchars($raffle['descripcion']) ?></p>
                    <p><strong>Precio boleto:</strong> $<?= number_format((float) $raffle['precio'], 2) ?></p>
                    <p><strong>Total boletos:</strong> <?= (int) $raffle['total_boletos'] ?></p>
                    <p><strong>Fecha sorteo:</strong> <?= htmlspecialchars($raffle['fecha_sorteo']) ?></p>
                    <div class="card-actions">
                        <?php if (!empty($_SESSION['user'])): ?>
                            <button
                                class="btn primary open-modal-btn"
                                data-raffle-id="<?= (int) $raffle['id'] ?>"
                                data-raffle-name="<?= htmlspecialchars($raffle['nombre']) ?>"
                                data-price="<?= (float) $raffle['precio'] ?>"
                            >Comprar boletos</button>
                        <?php endif; ?>
                        <?php if (($_SESSION['user']['rol'] ?? '') === 'admin'): ?>
                            <a class="btn" href="<?= $config['base_url'] ?>/raffles/edit/<?= (int) $raffle['id'] ?>">Editar</a>
                            <form method="POST" action="<?= $config['base_url'] ?>/raffles/delete/<?= (int) $raffle['id'] ?>" onsubmit="return confirm('Eliminar rifa?')">
                                <button type="submit" class="btn danger">Eliminar</button>
                            </form>
                        <?php endif; ?>
                    </div>
                </div>
            </article>
        <?php endforeach; ?>
    </div>
</section>

<div id="buyModal" class="modal hidden">
    <div class="modal-content">
        <button class="close-modal" id="closeModalBtn">&times;</button>
        <h2 id="modalRaffleName">Compra de boletos</h2>
        <p id="selectedSummary">Seleccionados: 0</p>
        <p id="totalSummary">Total: $0.00</p>
        <div id="ticketsContainer" class="tickets-grid"></div>
        <button id="confirmPurchaseBtn" class="btn primary">Confirmar compra</button>
        <p id="modalMessage"></p>
    </div>
</div>

<?php require __DIR__ . '/../layouts/footer.php'; ?>
