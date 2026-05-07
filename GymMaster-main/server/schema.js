const pool = require("./db");

async function ensureSchema() {
  const [[sociTable]] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = 'soci'`
  );

  if (sociTable.total > 0) {
    await pool.execute(
      "ALTER TABLE soci ADD COLUMN IF NOT EXISTS data_baixa DATETIME NULL"
    );
  }

  const [[trainerTable]] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = 'entrenador'`
  );

  if (trainerTable.total > 0) {
    await pool.execute(
      "ALTER TABLE entrenador ADD COLUMN IF NOT EXISTS data_baixa DATETIME NULL"
    );
  }

  // Taula de notificacions
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS notificacio (
      id_notificacio INT AUTO_INCREMENT PRIMARY KEY,
      id_soci INT NOT NULL,
      id_admin INT,
      titol VARCHAR(255) NOT NULL,
      missatge TEXT NOT NULL,
      data_enviament DATETIME DEFAULT CURRENT_TIMESTAMP,
      llegida TINYINT(1) DEFAULT 0,
      tipus ENUM('informativa', 'reserva', 'pagament', 'urgent') DEFAULT 'informativa',
      FOREIGN KEY (id_soci) REFERENCES soci(id_soci) ON DELETE CASCADE,
      FOREIGN KEY (id_admin) REFERENCES administrador(id_admin) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

module.exports = { ensureSchema };
