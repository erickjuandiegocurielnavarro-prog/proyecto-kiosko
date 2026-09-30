<?php
/** @var array $config */
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title ?? $config['app_name']) ?></title>
    <link rel="stylesheet" href="<?= $config['base_url'] ?>/css/styles.css">
</head>
<body>
<header class="topbar">
    <div class="container topbar-content">
        <a class="brand" href="<?= $config['base_url'] ?>/">Rifas Vehiculos</a>
        <nav class="nav">
            <?php if (!empty($_SESSION['user'])): ?>
                <span class="welcome">Hola, <?= htmlspecialchars($_SESSION['user']['nombre']) ?></span>
                <?php if (($_SESSION['user']['rol'] ?? '') === 'admin'): ?>
                    <a href="<?= $config['base_url'] ?>/raffles/create">Nueva rifa</a>
                    <a href="<?= $config['base_url'] ?>/admin">Admin</a>
                <?php endif; ?>
                <a href="<?= $config['base_url'] ?>/logout">Salir</a>
            <?php else: ?>
                <a href="<?= $config['base_url'] ?>/login">Login</a>
                <a href="<?= $config['base_url'] ?>/register">Registro</a>
            <?php endif; ?>
        </nav>
    </div>
</header>
<main class="container main-content">
    <?php if (!empty($_SESSION['error'])): ?>
        <div class="alert error"><?= htmlspecialchars($_SESSION['error']) ?></div>
        <?php unset($_SESSION['error']); ?>
    <?php endif; ?>
    <?php if (!empty($_SESSION['success'])): ?>
        <div class="alert success"><?= htmlspecialchars($_SESSION['success']) ?></div>
        <?php unset($_SESSION['success']); ?>
    <?php endif; ?>
