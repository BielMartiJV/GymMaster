import pool from './db.js';

async function tableExists(tableName) {
  const [[row]] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?`,
    [tableName]
  );

  return row.total > 0;
}

export async function ensureSchema() {
  if (await tableExists('soci')) {
    await pool.execute('ALTER TABLE soci ADD COLUMN IF NOT EXISTS data_baixa DATETIME NULL');
  }

  if (await tableExists('entrenador')) {
    await pool.execute('ALTER TABLE entrenador ADD COLUMN IF NOT EXISTS data_baixa DATETIME NULL');
  }

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
