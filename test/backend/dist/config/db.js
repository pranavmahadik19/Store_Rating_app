"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDB = initDB;
exports.getPool = getPool;
exports.query = query;
const promise_1 = __importDefault(require("mysql2/promise"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { DB_HOST = '127.0.0.1', DB_PORT = '3306', DB_USER = 'root', DB_PASSWORD = '', DB_NAME = 'store_rating_db', } = process.env;
let pool;
async function initDB() {
    // First, connect to MySQL without a database to ensure it exists
    const connection = await promise_1.default.createConnection({
        host: DB_HOST,
        port: parseInt(DB_PORT),
        user: DB_USER,
        password: DB_PASSWORD,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
    // Create the pool with the database selected
    pool = promise_1.default.createPool({
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
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users');
    const count = rows[0]?.count || 0;
    if (count === 0) {
        const adminPassword = 'Password123!';
        const hashedPassword = await bcryptjs_1.default.hash(adminPassword, 10);
        const adminName = 'System Administrator Main'; // 26 chars (>= 20 chars requirement)
        const adminEmail = 'admin@storerating.com';
        const adminAddress = 'System Admin Head Office, NY';
        const adminRole = 'ADMIN';
        await pool.query('INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)', [adminName, adminEmail, hashedPassword, adminAddress, adminRole]);
        console.log('Seeded default Admin user:');
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
    }
}
function getPool() {
    if (!pool) {
        throw new Error('Database pool not initialized. Call initDB first.');
    }
    return pool;
}
// Helper query function
async function query(sql, params) {
    const [results] = await getPool().query(sql, params);
    return results;
}
