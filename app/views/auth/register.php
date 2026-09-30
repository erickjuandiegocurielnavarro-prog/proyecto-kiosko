<?php require __DIR__ . '/../layouts/header.php'; ?>

<section class="auth-box">
    <h1>Crear cuenta</h1>
    <form method="POST" action="<?= $config['base_url'] ?>/register" class="form-grid">
        <label>Nombre
            <input type="text" name="nombre" required>
        </label>
        <label>Email
            <input type="email" name="email" required>
        </label>
        <label>Password
            <input type="password" name="password" minlength="6" required>
        </label>
        <button type="submit" class="btn primary">Registrarme</button>
    </form>
    <p>Ya tienes cuenta? <a href="<?= $config['base_url'] ?>/login">Inicia sesion</a></p>
</section>

<?php require __DIR__ . '/../layouts/footer.php'; ?>
