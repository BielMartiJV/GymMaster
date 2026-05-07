/**
 * Script per crear la base de dades i la taula d'usuaris.
 * Executar: node init-db.js
 */
const mysql = require("mysql2/promise");

async function initDatabase() {
  // Connexió sense especificar BD per poder crear-la
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    port: 3306,
  });

  try {
    // Crear la base de dades si no existeix
    await connection.execute(
      "CREATE DATABASE IF NOT EXISTS `gymmaster` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
    );
    console.log("✅ Base de dades 'gymmaster' creada o ja existia.");

    // Seleccionar la BD
    await connection.changeUser({ database: "gymmaster" });

    // Crear la taula d'usuaris
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log("✅ Taula 'users' creada o ja existia.");

    console.log("\n🎉 Base de dades inicialitzada correctament!");
    console.log("   Pots veure-la a phpMyAdmin: http://localhost/phpmyadmin");
  } catch (error) {
    console.error("❌ Error inicialitzant la BD:", error.message);
  } finally {
    await connection.end();
  }
}

initDatabase();
