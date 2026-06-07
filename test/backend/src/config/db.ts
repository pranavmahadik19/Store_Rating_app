import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const {
  DB_HOST = '127.0.0.1',
  DB_PORT = '3306',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'store_rating_db',
} = process.env;

let pool: mysql.Pool;

export async function initDB() {
  // First, connect to MySQL without a database to ensure it exists
  const connection = await mysql.createConnection({
    host: DB_HOST,
    port: parseInt(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
  await connection.end();

  // Create the pool with the database selected
  pool = mysql.createPool({
    host: DB_HOST,
    port: parseInt(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  // Create tables if they do not exist
  await createTables();

  // Seed default admin if table is empty
  await seedDefaultAdmin();

  console.log('Database initialized successfully.');
}

async function createTables() {
  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(60) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      address VARCHAR(400) NOT NULL,
      role ENUM('ADMIN', 'NORMAL', 'STORE_OWNER') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `;

  const storesTable = `
    CREATE TABLE IF NOT EXISTS stores (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      address VARCHAR(400) NOT NULL,
      owner_id INT UNIQUE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `;

  const ratingsTable = `
    CREATE TABLE IF NOT EXISTS ratings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      store_id INT NOT NULL,
      rating TINYINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_user_store (user_id, store_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
    ) ENGINE=InnoDB;
  `;

  await pool.query(usersTable);
  await pool.query(storesTable);
  await pool.query(ratingsTable);
}

async function seedDefaultAdmin() {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT COUNT(*) as count FROM users');
  const count = rows[0]?.count || 0;

  if (count === 0) {
    const adminPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    const adminName = 'System Administrator Main'; // 26 chars (>= 20 chars requirement)
    const adminEmail = 'admin@storerating.com';
    const adminAddress = 'System Admin Head Office, NY';
    const adminRole = 'ADMIN';

    await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      [adminName, adminEmail, hashedPassword, adminAddress, adminRole]
    );

    console.log('Seeded default Admin user:');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDB first.');
  }
  return pool;
}

// Helper query function
export async function query<T = any>(sql: string, params?: any[]): Promise<T> {
  const [results] = await getPool().query(sql, params);
  return results as T;
}
