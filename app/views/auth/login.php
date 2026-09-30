<?php require __DIR__ . '/../layouts/header.php'; ?>

<section class="auth-box">
    <h1>Iniciar sesion</h1>
    <form method="POST" action="<?= $config['base_url'] ?>/login" class="form-grid">
        <label>Email
            <input type="email" name="email" required>
        </label>
        <label>Password
            <input type="password" name="password" minlength="6" required>
        </label>
        <button type="submit" class="btn primary">Entrar</button>
    </form>
    <p>Sin cuenta? <a href="<?= $config['base_url'] ?>/register">Registrate aqui</a></p>
</section>

<?php require __DIR__ . '/../layouts/footer.php'; ?>
