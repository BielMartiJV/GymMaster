import mysql from 'mysql2/promise';
import 'dotenv/config';

// Pool de connexions MySQL2 amb Promises
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'gymmaster',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
});

// Verificació de connexió en arrancar
pool.getConnection()
  .then((conn) => {
    console.log('✅ Connexió a MySQL establerta correctament');
    conn.release();
  })
  .catch((err) => {
    console.error('❌ Error connectant a MySQL:', err.message);
    process.exit(1);
  });

export default pool;
