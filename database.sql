CREATE DATABASE IF NOT EXISTS rifas_vehiculos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rifas_vehiculos;

DROP TABLE IF EXISTS detalle_venta;
DROP TABLE IF EXISTS ventas;
DROP TABLE IF EXISTS boletos;
DROP TABLE IF EXISTS rifas;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    rol ENUM('admin', 'usuario') NOT NULL DEFAULT 'usuario',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE rifas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(180) NOT NULL,
    descripcion TEXT NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    total_boletos INT UNSIGNED NOT NULL,
    fecha_sorteo DATE NOT NULL,
    imagen VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE boletos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    numero INT UNSIGNED NOT NULL,
    id_rifa INT UNSIGNED NOT NULL,
    estado ENUM('disponible', 'vendido') NOT NULL DEFAULT 'disponible',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_boletos_rifa FOREIGN KEY (id_rifa) REFERENCES rifas(id) ON DELETE CASCADE,
    CONSTRAINT uq_boletos_numero_rifa UNIQUE (numero, id_rifa)
) ENGINE=InnoDB;

CREATE TABLE ventas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT UNSIGNED NOT NULL,
    id_rifa INT UNSIGNED NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ventas_usuario FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    CONSTRAINT fk_ventas_rifa FOREIGN KEY (id_rifa) REFERENCES rifas(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE detalle_venta (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_venta INT UNSIGNED NOT NULL,
    id_boleto INT UNSIGNED NOT NULL UNIQUE,
    CONSTRAINT fk_detalle_venta FOREIGN KEY (id_venta) REFERENCES ventas(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_boleto FOREIGN KEY (id_boleto) REFERENCES boletos(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Usuario administrador de ejemplo: admin@rifa.com / admin123
INSERT INTO usuarios (nombre, email, password, rol)
VALUES ('Administrador', 'admin@rifa.com', '$2y$10$NK9S.HqHT5DsGIBUVruRNu3JYRv551Mjgq/hikXUPZc6iWv6t/xTW', 'admin');
