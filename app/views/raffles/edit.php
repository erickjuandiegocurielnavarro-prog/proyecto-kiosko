<?php require __DIR__ . '/../layouts/header.php'; ?>

<section class="panel">
    <h1>Editar rifa</h1>
    <form class="form-grid" method="POST" action="<?= $config['base_url'] ?>/raffles/update/<?= (int) $raffle['id'] ?>">
        <label>Nombre
            <input type="text" name="nombre" value="<?= htmlspecialchars($raffle['nombre']) ?>" required>
        </label>
        <label>Descripcion
            <textarea name="descripcion" rows="4" required><?= htmlspecialchars($raffle['descripcion']) ?></textarea>
        </label>
        <label>Precio por boleto
            <input type="number" name="precio" min="1" step="0.01" value="<?= (float) $raffle['precio'] ?>" required>
        </label>
        <label>Fecha sorteo
            <input type="date" name="fecha_sorteo" value="<?= htmlspecialchars($raffle['fecha_sorteo']) ?>" required>
        </label>
        <label>URL imagen
            <input type="url" name="imagen" value="<?= htmlspecialchars($raffle['imagen']) ?>">
        </label>
        <button class="btn primary" type="submit">Guardar cambios</button>
    </form>
</section>

<?php require __DIR__ . '/../layouts/footer.php'; ?>
