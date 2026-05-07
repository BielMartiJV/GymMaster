-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 17-04-2026 a las 09:25:15
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `gymmaster`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administrador`
--

CREATE TABLE `administrador` (
  `id_admin` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `cognoms` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefon` varchar(15) DEFAULT NULL,
  `rol` varchar(20) NOT NULL DEFAULT 'admin',
  `data_alta` date DEFAULT NULL,
  `actiu` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `classe`
--

CREATE TABLE `classe` (
  `id_classe` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `descripcio` text DEFAULT NULL,
  `id_entrenador` int(11) NOT NULL,
  `dia_setmana` int(11) NOT NULL,
  `hora_inici` time NOT NULL,
  `data_classe` date DEFAULT NULL,
  `durada` int(11) NOT NULL,
  `aforament_max` int(11) NOT NULL,
  `places_ocupades` int(11) NOT NULL DEFAULT 0,
  `sala` varchar(50) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `entrenador`
--

CREATE TABLE `entrenador` (
  `id_entrenador` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `cognoms` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefon` varchar(15) DEFAULT NULL,
  `especialitats` text DEFAULT NULL,
  `biografia` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `data_alta` date DEFAULT NULL,
  `actiu` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificacio`
--

CREATE TABLE `notificacio` (
  `id_notificacio` int(11) NOT NULL,
  `id_soci` int(11) NOT NULL,
  `id_admin` int(11) DEFAULT NULL,
  `titol` varchar(100) NOT NULL,
  `missatge` text NOT NULL,
  `data_enviament` datetime NOT NULL DEFAULT current_timestamp(),
  `llegida` tinyint(1) NOT NULL DEFAULT 0,
  `tipus` varchar(20) NOT NULL DEFAULT 'informativa'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagament`
--

CREATE TABLE `pagament` (
  `id_pagament` int(11) NOT NULL,
  `id_soci_sub` int(11) NOT NULL,
  `import` decimal(6,2) NOT NULL,
  `data_pagament` date NOT NULL,
  `metode` varchar(20) NOT NULL,
  `estat` varchar(20) NOT NULL DEFAULT 'pendent',
  `referencia` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reserva`
--

CREATE TABLE `reserva` (
  `id_reserva` int(11) NOT NULL,
  `id_soci` int(11) NOT NULL,
  `id_classe` int(11) NOT NULL,
  `data_reserva` datetime NOT NULL DEFAULT current_timestamp(),
  `data_classe` date NOT NULL,
  `assistit` tinyint(1) DEFAULT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `data_cancelacio` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `soci`
--

CREATE TABLE `soci` (
  `id_soci` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `cognoms` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `telefon` varchar(15) DEFAULT NULL,
  `data_naixement` date NOT NULL,
  `dni` varchar(20) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `data_alta` date NOT NULL,
  `data_baixa` date DEFAULT NULL,
  `actiu` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `soci_subscripcio`
--

CREATE TABLE `soci_subscripcio` (
  `id_soci_sub` int(11) NOT NULL,
  `id_soci` int(11) NOT NULL,
  `id_subscripcio` int(11) NOT NULL,
  `data_inici` date NOT NULL,
  `data_fi` date NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `renovacio_automatica` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subscripcio`
--

CREATE TABLE `subscripcio` (
  `id_subscripcio` int(11) NOT NULL,
  `nom` varchar(50) NOT NULL,
  `descripcio` text DEFAULT NULL,
  `preu` decimal(6,2) NOT NULL,
  `durada_dies` int(11) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administrador`
--
ALTER TABLE `administrador`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `uq_admin_email` (`email`);

--
-- Indices de la tabla `classe`
--
ALTER TABLE `classe`
  ADD PRIMARY KEY (`id_classe`),
  ADD KEY `fk_classe_entrenador` (`id_entrenador`);

--
-- Indices de la tabla `entrenador`
--
ALTER TABLE `entrenador`
  ADD PRIMARY KEY (`id_entrenador`),
  ADD UNIQUE KEY `uq_entrenador_email` (`email`);

--
-- Indices de la tabla `notificacio`
--
ALTER TABLE `notificacio`
  ADD PRIMARY KEY (`id_notificacio`),
  ADD KEY `fk_notif_soci` (`id_soci`),
  ADD KEY `fk_notif_admin` (`id_admin`);

--
-- Indices de la tabla `pagament`
--
ALTER TABLE `pagament`
  ADD PRIMARY KEY (`id_pagament`),
  ADD KEY `fk_pagament_socisub` (`id_soci_sub`);

--
-- Indices de la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD PRIMARY KEY (`id_reserva`),
  ADD UNIQUE KEY `uq_reserva_soci_classe_dia` (`id_soci`,`id_classe`,`data_classe`),
  ADD KEY `fk_reserva_classe` (`id_classe`);

--
-- Indices de la tabla `soci`
--
ALTER TABLE `soci`
  ADD PRIMARY KEY (`id_soci`),
  ADD UNIQUE KEY `uq_soci_email` (`email`),
  ADD UNIQUE KEY `dni` (`dni`);

--
-- Indices de la tabla `soci_subscripcio`
--
ALTER TABLE `soci_subscripcio`
  ADD PRIMARY KEY (`id_soci_sub`),
  ADD KEY `fk_socisub_soci` (`id_soci`),
  ADD KEY `fk_socisub_subscripcio` (`id_subscripcio`);

--
-- Indices de la tabla `subscripcio`
--
ALTER TABLE `subscripcio`
  ADD PRIMARY KEY (`id_subscripcio`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administrador`
--
ALTER TABLE `administrador`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `classe`
--
ALTER TABLE `classe`
  MODIFY `id_classe` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `entrenador`
--
ALTER TABLE `entrenador`
  MODIFY `id_entrenador` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `notificacio`
--
ALTER TABLE `notificacio`
  MODIFY `id_notificacio` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagament`
--
ALTER TABLE `pagament`
  MODIFY `id_pagament` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reserva`
--
ALTER TABLE `reserva`
  MODIFY `id_reserva` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `soci`
--
ALTER TABLE `soci`
  MODIFY `id_soci` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `soci_subscripcio`
--
ALTER TABLE `soci_subscripcio`
  MODIFY `id_soci_sub` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `subscripcio`
--
ALTER TABLE `subscripcio`
  MODIFY `id_subscripcio` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `classe`
--
ALTER TABLE `classe`
  ADD CONSTRAINT `fk_classe_entrenador` FOREIGN KEY (`id_entrenador`) REFERENCES `entrenador` (`id_entrenador`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificacio`
--
ALTER TABLE `notificacio`
  ADD CONSTRAINT `fk_notif_admin` FOREIGN KEY (`id_admin`) REFERENCES `administrador` (`id_admin`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_notif_soci` FOREIGN KEY (`id_soci`) REFERENCES `soci` (`id_soci`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `pagament`
--
ALTER TABLE `pagament`
  ADD CONSTRAINT `fk_pagament_socisub` FOREIGN KEY (`id_soci_sub`) REFERENCES `soci_subscripcio` (`id_soci_sub`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reserva`
--
ALTER TABLE `reserva`
  ADD CONSTRAINT `fk_reserva_classe` FOREIGN KEY (`id_classe`) REFERENCES `classe` (`id_classe`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reserva_soci` FOREIGN KEY (`id_soci`) REFERENCES `soci` (`id_soci`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `soci_subscripcio`
--
ALTER TABLE `soci_subscripcio`
  ADD CONSTRAINT `fk_socisub_soci` FOREIGN KEY (`id_soci`) REFERENCES `soci` (`id_soci`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_socisub_subscripcio` FOREIGN KEY (`id_subscripcio`) REFERENCES `subscripcio` (`id_subscripcio`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
