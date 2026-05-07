-- =============================================================
-- GymMaster — Seed de dades inicials
-- Executar DESPRÉS d'importar gymmaster.sql a phpMyAdmin
-- =============================================================

USE gymmaster;

-- -------------------------------------------------------------
-- ENTRENADORS (4)
-- -------------------------------------------------------------
INSERT INTO entrenador (nom, cognoms, email, especialitats, biografia, data_alta, actiu) VALUES
(
  'Anna', 'Garcia Puigdomènech',
  'anna.garcia@gymmaster.cat',
  'Yoga, Pilates, Meditació',
  'Instructora certificada de Yoga amb més de 8 anys d\'experiència. Especialitzada en ioga restauratiu i meditació mindfulness.',
  CURDATE(), 1
),
(
  'Marc', 'Puig Rovira',
  'marc.puig@gymmaster.cat',
  'Spinning, CrossFit, Entrenament Funcional',
  'Entrenador personal amb 10 anys d\'experiència en disciplines d\'alta intensitat. Campió regional de CrossFit 2021.',
  CURDATE(), 1
),
(
  'Laia', 'Torres Sabater',
  'laia.torres@gymmaster.cat',
  'Zumba, Aeròbic, Ball Llatí',
  'Professora de Zumba certificada Zumba Fitness LLC. Especialitzada en ritmes llatins i coreografies grupals.',
  CURDATE(), 1
),
(
  'Jordi', 'Mas Ferrer',
  'jordi.mas@gymmaster.cat',
  'Musculació, Powerlifting, Nutrició esportiva',
  'Llicenciat en CAFE (Ciències de l\'Activitat Física i l\'Esport). Especialista en musculació i planificació de dietes esportives.',
  CURDATE(), 1
);

-- -------------------------------------------------------------
-- CLASSES (10) — dia_setmana: 1=Dl, 2=Dm, 3=Dc, 4=Dj, 5=Dv, 6=Ds, 7=Dg
-- -------------------------------------------------------------
INSERT INTO classe (nom, descripcio, id_entrenador, dia_setmana, hora_inici, durada, aforament_max, places_ocupades, sala, activa) VALUES

-- Yoga (Dl, Dc, Dv)
('Yoga', 'Millora la teva flexibilitat, equilibri i pau mental amb les nostres sessions de ioga guiades per instructors certificats.',
  1, 1, '07:00:00', 60, 20, 0, 'Sala Zen', 1),
('Yoga', 'Millora la teva flexibilitat, equilibri i pau mental amb les nostres sessions de ioga guiades per instructors certificats.',
  1, 3, '07:00:00', 60, 20, 0, 'Sala Zen', 1),
('Yoga', 'Millora la teva flexibilitat, equilibri i pau mental amb les nostres sessions de ioga guiades per instructors certificats.',
  1, 5, '07:00:00', 60, 20, 0, 'Sala Zen', 1),

-- Spinning (Dl, Dc, Dv matí i tarda)
('Spinning', 'Crema calories i millora la teva resistència cardiovascular amb sessions de spinning enèrgiques al ritme de la millor música.',
  2, 1, '06:00:00', 45, 25, 0, 'Sala Spinning', 1),
('Spinning', 'Crema calories i millora la teva resistència cardiovascular amb sessions de spinning enèrgiques al ritme de la millor música.',
  2, 3, '06:00:00', 45, 25, 0, 'Sala Spinning', 1),
('Spinning', 'Crema calories i millora la teva resistència cardiovascular amb sessions de spinning enèrgiques al ritme de la millor música.',
  2, 5, '06:00:00', 45, 25, 0, 'Sala Spinning', 1),

-- CrossFit (Dm, Dj, Ds)
('CrossFit', 'Entrenament funcional d\'alta intensitat que combina aixecament de peses, exercicis aeròbics i gimnàstica.',
  2, 2, '08:00:00', 60, 15, 0, 'Sala CrossFit', 1),
('CrossFit', 'Entrenament funcional d\'alta intensitat que combina aixecament de peses, exercicis aeròbics i gimnàstica.',
  2, 4, '08:00:00', 60, 15, 0, 'Sala CrossFit', 1),
('CrossFit', 'Entrenament funcional d\'alta intensitat que combina aixecament de peses, exercicis aeròbics i gimnàstica.',
  2, 6, '08:00:00', 60, 15, 0, 'Sala CrossFit', 1),

-- Musculació (Dl, Dc, Dv tarda)
('Musculació', 'Classes grupals enfocades en el desenvolupament muscular amb tècniques adequades i supervisió professional.',
  4, 1, '17:00:00', 75, 12, 0, 'Sala Peses', 1),
('Musculació', 'Classes grupals enfocades en el desenvolupament muscular amb tècniques adequades i supervisió professional.',
  4, 3, '17:00:00', 75, 12, 0, 'Sala Peses', 1),
('Musculació', 'Classes grupals enfocades en el desenvolupament muscular amb tècniques adequades i supervisió professional.',
  4, 5, '17:00:00', 75, 12, 0, 'Sala Peses', 1),

-- Zumba (Dm, Dj)
('Zumba', 'Balla i crema calories amb ritmes llatins en un ambient divertit i energètic.',
  3, 2, '18:00:00', 50, 30, 0, 'Sala Gran', 1),
('Zumba', 'Balla i crema calories amb ritmes llatins en un ambient divertit i energètic.',
  3, 4, '18:00:00', 50, 30, 0, 'Sala Gran', 1);

-- -------------------------------------------------------------
-- PLANS DE SUBSCRIPCIÓ (3)
-- -------------------------------------------------------------
INSERT INTO subscripcio (nom, descripcio, preu, durada_dies, activa) VALUES
(
  'Bàsic',
  'Accés a la sala de fitness i vestuaris. Ideal per a qui vol entrenar de forma autònoma.',
  29.99, 30, 1
),
(
  'Estàndard',
  'Accés complet + 8 classes dirigides al mes. La millor relació qualitat-preu per a socis actius.',
  49.99, 30, 1
),
(
  'Premium',
  'Accés il·limitat a totes les classes + 2 sessions d\'entrenament personal al mes. La màxima experiència GymMaster.',
  79.99, 30, 1
);

-- -------------------------------------------------------------
-- ADMINISTRADOR INICIAL
-- password: Admin1234! (hash bcrypt generat amb cost 10)
-- -------------------------------------------------------------
INSERT INTO administrador (nom, cognoms, email, password_hash, telefon, rol, data_alta, actiu) VALUES
(
  'Admin', 'GymMaster',
  'admin@gymmaster.cat',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  '600000000',
  'admin',
  CURDATE(), 1
);
