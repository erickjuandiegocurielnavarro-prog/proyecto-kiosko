<?php require __DIR__ . '/../layouts/header.php'; ?>

<section class="panel">
    <h1>Crear rifa de vehiculo</h1>
    <form class="form-grid" method="POST" action="<?= $config['base_url'] ?>/raffles">
        <label>Nombre
            <input type="text" name="nombre" required>
        </label>
        <label>Descripcion
            <textarea name="descripcion" rows="4" required></textarea>
        </label>
        <label>Precio por boleto
            <input type="number" name="precio" min="1" step="0.01" required>
        </label>
        <label>Total boletos
            <input type="number" name="total_boletos" min="1" step="1" required>
        </label>
        <label>Fecha sorteo
            <input type="date" name="fecha_sorteo" required>
        </label>
        <label>URL imagen
            <input type="url" name="imagen" placeholder="https://...">
        </label>
        <button class="btn primary" type="submit">Crear rifa</button>
    </form>
</section>

<?php require __DIR__ . '/../layouts/footer.php'; ?>
