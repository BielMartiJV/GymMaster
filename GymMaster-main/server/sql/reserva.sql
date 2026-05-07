-- GymMaster - Taula de reserves
-- Executa aquest script a la BD `gymmaster`

CREATE TABLE IF NOT EXISTS reserva (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_soci INT NOT NULL,
  id_classe INT NOT NULL,
  data_reserva DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_classe DATE NOT NULL,
  assistit TINYINT(1) NOT NULL DEFAULT 0,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  data_cancelacio DATETIME NULL,
  CONSTRAINT fk_reserva_soci
    FOREIGN KEY (id_soci) REFERENCES soci(id_soci)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_classe
    FOREIGN KEY (id_classe) REFERENCES classe(id_classe)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_reserva_assistit
    CHECK (assistit IN (0, 1)),
  CONSTRAINT chk_reserva_activa
    CHECK (activa IN (0, 1))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_reserva_soci ON reserva(id_soci);
CREATE INDEX idx_reserva_classe ON reserva(id_classe);
CREATE INDEX idx_reserva_data_classe ON reserva(data_classe);
CREATE INDEX idx_reserva_activa ON reserva(activa);

-- Exemple d'inserció
-- IMPORTANT: Assegura't que id_soci i id_classe existeixen.
INSERT INTO reserva (
  id_soci,
  id_classe,
  data_reserva,
  data_classe,
  assistit,
  activa,
  data_cancelacio
) VALUES
(1, 1, NOW(), '2026-04-27', 0, 1, NULL),
(2, 2, NOW(), '2026-04-28', 1, 1, NULL),
(3, 3, NOW(), '2026-04-29', 0, 0, NOW());

-- Plantilla per inserir noves reserves
-- INSERT INTO reserva (
--   id_soci, id_classe, data_reserva, data_classe, assistit, activa, data_cancelacio
-- ) VALUES (
--   1, 1, NOW(), '2026-05-10', 0, 1, NULL
-- );
