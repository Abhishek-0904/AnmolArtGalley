import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { DEFAULT_ARTWORKS, DEFAULT_SETTINGS, DEFAULT_REVIEWS } from './defaults.js';

dotenv.config();

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') ? { rejectUnauthorized: false } : undefined,
};

const DB_NAME = process.env.DB_NAME || 'anmol_art_db';

let pool = null;
let isConnected = false;
let isConnecting = false;

export async function initDatabase() {
  if (isConnecting) return false;
  isConnecting = true;

  try {
    // 1. Try to ensure database exists (Works on localhost, cloud DBs usually already exist)
    try {
      const adminConnection = await mysql.createConnection({
        ...DB_CONFIG,
      });

      await adminConnection.query(
        `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
      );
      await adminConnection.end();
    } catch {
      // Cloud databases like TiDB/Aiven might restrict CREATE DATABASE, safe to proceed
    }

    // 2. Create pool connected to the database
    if (!pool) {
      pool = mysql.createPool({
        ...DB_CONFIG,
        database: DB_NAME,
      });
    }

    // Test connection
    const conn = await pool.getConnection();
    isConnected = true;
    conn.release();
    console.log(`[MySQL] Connected successfully to database: ${DB_NAME}`);

    // 3. Create tables if they do not exist
    await createTables();

    // 4. Seed initial data if tables are empty
    await seedInitialData();

    isConnecting = false;
    return true;
  } catch (err) {
    isConnected = false;
    isConnecting = false;
    console.error(`[MySQL Error] Failed to connect to MySQL:`, err.message);
    console.error(`[MySQL Hint] Make sure XAMPP is running and MySQL service is started on port ${DB_CONFIG.port}.`);
    return false;
  }
}

// Ensure database connection is active or retry connecting
export async function ensureDbConnection() {
  if (pool && isConnected) return pool;
  await initDatabase();
  return isConnected ? pool : null;
}

async function createTables() {
  if (!pool) return;

  // Settings table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`settings\` (
      \`id\` INT AUTO_INCREMENT PRIMARY KEY,
      \`studio_name\` VARCHAR(255) NOT NULL DEFAULT 'Anmol Art',
      \`tagline\` VARCHAR(255) DEFAULT 'Sketch Studio',
      \`logo_letter\` VARCHAR(10) DEFAULT 'A',
      \`whatsapp_number\` VARCHAR(32) DEFAULT '916352700572',
      \`instagram_handle\` VARCHAR(255) DEFAULT 'anmolart_gallery',
      \`instagram_url\` VARCHAR(255) DEFAULT 'https://www.instagram.com/anmolart_gallery/',
      \`artist_name\` VARCHAR(255) DEFAULT 'Anmol',
      \`artist_title\` VARCHAR(255) DEFAULT 'Lead Fine Artist & Charcoal Specialist',
      \`artist_bio\` TEXT,
      \`announcement\` TEXT,
      \`admin_password\` VARCHAR(255) DEFAULT 'AnmolArtGallery',
      \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Artworks table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`artworks\` (
      \`id\` VARCHAR(100) PRIMARY KEY,
      \`title\` VARCHAR(255) NOT NULL,
      \`category\` VARCHAR(64) DEFAULT 'sketching',
      \`medium\` VARCHAR(255) DEFAULT NULL,
      \`paper\` VARCHAR(255) DEFAULT NULL,
      \`dimensions\` VARCHAR(128) DEFAULT NULL,
      \`price\` INT NOT NULL DEFAULT 0,
      \`image\` MEDIUMTEXT NOT NULL,
      \`description\` TEXT DEFAULT NULL,
      \`is_original\` TINYINT(1) DEFAULT 1,
      \`tag\` VARCHAR(100) DEFAULT NULL,
      \`listing_type\` VARCHAR(32) NOT NULL DEFAULT 'sale',
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Orders table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`orders\` (
      \`id\` VARCHAR(100) PRIMARY KEY,
      \`order_date\` VARCHAR(100) DEFAULT NULL,
      \`customer_name\` VARCHAR(255) NOT NULL,
      \`phone\` VARCHAR(64) NOT NULL,
      \`address\` TEXT NOT NULL,
      \`items\` JSON NOT NULL,
      \`total\` INT NOT NULL DEFAULT 0,
      \`status\` VARCHAR(64) NOT NULL DEFAULT 'New',
      \`order_type\` VARCHAR(32) NOT NULL DEFAULT 'ready',
      \`custom_details\` JSON DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Reviews table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS \`reviews\` (
      \`id\` VARCHAR(100) PRIMARY KEY,
      \`name\` VARCHAR(255) NOT NULL,
      \`city\` VARCHAR(255) DEFAULT NULL,
      \`stars\` INT NOT NULL DEFAULT 5,
      \`quote\` TEXT NOT NULL,
      \`item\` VARCHAR(255) DEFAULT NULL,
      \`review_date\` VARCHAR(100) DEFAULT NULL,
      \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  console.log('[MySQL] Tables verified / ready.');
}

async function seedInitialData() {
  if (!pool) return;

  // 1. Check Settings
  const [settingsRows] = await pool.query('SELECT COUNT(*) as count FROM `settings`');
  if (settingsRows[0].count === 0) {
    await pool.query(
      `INSERT INTO \`settings\` (
        studio_name, tagline, logo_letter, whatsapp_number, 
        instagram_handle, instagram_url, artist_name, artist_title, 
        artist_bio, announcement, admin_password
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        DEFAULT_SETTINGS.studioName,
        DEFAULT_SETTINGS.tagline,
        DEFAULT_SETTINGS.logoLetter,
        DEFAULT_SETTINGS.whatsappNumber,
        DEFAULT_SETTINGS.instagramHandle,
        DEFAULT_SETTINGS.instagramUrl,
        DEFAULT_SETTINGS.artistName,
        DEFAULT_SETTINGS.artistTitle,
        DEFAULT_SETTINGS.artistBio,
        DEFAULT_SETTINGS.announcement,
        'AnmolArtGallery',
      ]
    );
    console.log('[MySQL Seed] Default settings inserted.');
  }

  // 2. Check Artworks
  const [artworkRows] = await pool.query('SELECT COUNT(*) as count FROM `artworks`');
  if (artworkRows[0].count === 0) {
    for (const art of DEFAULT_ARTWORKS) {
      await pool.query(
        `INSERT INTO \`artworks\` (
          id, title, category, medium, paper, dimensions, price, 
          image, description, is_original, tag, listing_type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          art.id,
          art.title,
          art.category || 'sketching',
          art.medium || '',
          art.paper || '',
          art.dimensions || '',
          art.price || 0,
          art.image || '',
          art.description || '',
          art.isOriginal ? 1 : 0,
          art.tag || '',
          art.listingType || 'sale',
        ]
      );
    }
    console.log(`[MySQL Seed] ${DEFAULT_ARTWORKS.length} default artworks inserted.`);
  }

  // 3. Check Reviews
  const [reviewRows] = await pool.query('SELECT COUNT(*) as count FROM `reviews`');
  if (reviewRows[0].count === 0) {
    for (const rev of DEFAULT_REVIEWS) {
      await pool.query(
        `INSERT INTO \`reviews\` (id, name, city, stars, quote, item, review_date) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          rev.id,
          rev.name,
          rev.city || '',
          rev.stars || 5,
          rev.quote || '',
          rev.item || '',
          rev.date || '',
        ]
      );
    }
    console.log(`[MySQL Seed] ${DEFAULT_REVIEWS.length} default reviews inserted.`);
  }
}

export function getPool() {
  return pool;
}

export function isDbConnected() {
  return isConnected;
}
