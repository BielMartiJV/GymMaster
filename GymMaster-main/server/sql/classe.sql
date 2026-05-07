-- GymMaster - Taula de classes
-- Executa aquest script a la BD `gymmaster`

CREATE TABLE IF NOT EXISTS classe (
  id_classe INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(120) NOT NULL,
  descripcio TEXT NULL,
  id_entrenador INT NOT NULL,
  dia_setmana VARCHAR(20) NOT NULL,
  hora_inici TIME NOT NULL,
  data_classe DATE NULL,
  durada SMALLINT UNSIGNED NOT NULL,
  aforament_max SMALLINT UNSIGNED NOT NULL,
  places_ocupades SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  sala VARCHAR(80) NOT NULL,
  activa TINYINT(1) NOT NULL DEFAULT 1,
  CONSTRAINT fk_classe_entrenador
    FOREIGN KEY (id_entrenador) REFERENCES entrenador(id_entrenador)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_classe_durada
    CHECK (durada > 0),
  CONSTRAINT chk_classe_aforament
    CHECK (aforament_max > 0),
  CONSTRAINT chk_classe_places_ocupades
    CHECK (places_ocupades >= 0 AND places_ocupades <= aforament_max)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_classe_entrenador ON classe(id_entrenador);
CREATE INDEX idx_classe_data ON classe(data_classe);
CREATE INDEX idx_classe_dia ON classe(dia_setmana);
CREATE INDEX idx_classe_activa ON classe(activa);

-- Insercions d'exemple
-- IMPORTANT: Assegura't que aquests id_entrenador existeixen a la teva taula entrenador.
INSERT INTO classe (
  nom,
  descripcio,
  id_entrenador,
  dia_setmana,
  hora_inici,
  data_classe,
  durada,
  aforament_max,
  places_ocupades,
  sala,
  activa
) VALUES
('Cross Training', 'Entrenament funcional d\'alta intensitat per millorar força i resistència.', 1, 'Dilluns', '18:00:00', '2026-04-27', 60, 20, 8, 'Sala Funcional', 1),
('Pilates Core', 'Treball de core, estabilitat i mobilitat.', 2, 'Dimarts', '19:00:00', '2026-04-28', 50, 16, 6, 'Sala 2', 1),
('HIIT Express', 'Sessió curta i intensa de treball cardiovascular i muscular.', 1, 'Dimecres', '07:30:00', '2026-04-29', 30, 18, 10, 'Sala Funcional', 1),
('Ioga Flow', 'Classe de ioga dinàmic per flexibilitat i control respiratori.', 3, 'Dijous', '20:00:00', '2026-04-30', 60, 14, 5, 'Sala Mind&Body', 1),
('Spinning', 'Treball cardiovascular en bicicleta indoor amb canvis de ritme.', 4, 'Divendres', '18:30:00', '2026-05-01', 45, 24, 12, 'Sala Cycling', 1),
('Força Tren Superior', 'Rutina guiada centrada en espatlla, pit i esquena.', 2, 'Dissabte', '11:00:00', '2026-05-02', 55, 15, 7, 'Sala Pesos', 1),
('Mobility Recovery', 'Sessió suau per descarregar musculatura i recuperar mobilitat.', 3, 'Diumenge', '10:00:00', '2026-05-03', 40, 12, 4, 'Sala Mind&Body', 1);

-- Plantilla per inserir noves classes
-- INSERT INTO classe (
--   nom, descripcio, id_entrenador, dia_setmana, hora_inici, data_classe,
--   durada, aforament_max, places_ocupades, sala, activa
-- ) VALUES (
--   'Nom classe',
--   'Descripció',
--   1,
--   'Dilluns',
--   '18:00:00',
--   '2026-05-10',
--   60,
--   20,
--   0,
--   'Sala 1',
--   1
-- );
