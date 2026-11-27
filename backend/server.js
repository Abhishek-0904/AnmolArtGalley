import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, ensureDbConnection, getPool, isDbConnected } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS & Large Payload limits for base64 artwork images
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging middleware for live Render debugging
app.use((req, res, next) => {
  console.log(`[API ${req.method}] ${req.url}`);
  next();
});

// Welcome / Status Root Route
app.get('/', (req, res) => {
  res.json({
    message: '🎨 Anmol Art Gallery Backend API is Online & Running Successfully!',
    status: 'online',
    mysql: isDbConnected(),
    db_host: process.env.DB_HOST || 'NOT SET',
    db_user: process.env.DB_USER || 'NOT SET',
    db_name: process.env.DB_NAME || 'NOT SET',
    db_port: process.env.DB_PORT || 'NOT SET',
    db_ssl: process.env.DB_SSL || 'NOT SET',
    endpoints: {
      health: '/api/health',
      settings: '/api/settings',
      artworks: '/api/artworks',
      orders: '/api/orders',
      reviews: '/api/reviews'
    }
  });
});

// Middleware to ensure DB connection is ready (auto-retries if MySQL was started late)
app.use(async (req, res, next) => {
  req.pool = await ensureDbConnection();
  next();
});

// ==========================================
// 1. HEALTH CHECK ROUTE
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    mysql: isDbConnected(),
    database: process.env.DB_NAME || 'test',
    port: PORT,
  });
});

// DB Debug/Test Route - shows exact connection error
app.get('/api/db-test', async (req, res) => {
  const mysql = await import('mysql2/promise');
  try {
    const conn = await mysql.default.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'test',
      ssl: (process.env.DB_SSL === 'true' || process.env.DB_SSL === '1') ? { rejectUnauthorized: false } : undefined,
      connectTimeout: 10000,
    });
    await conn.query('SELECT 1');
    await conn.end();
    res.json({ success: true, message: 'DB Connected!', user: process.env.DB_USER, host: process.env.DB_HOST, db: process.env.DB_NAME });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, code: err.code, user: process.env.DB_USER, host: process.env.DB_HOST, db: process.env.DB_NAME });
  }
});

// ==========================================
// 2. SETTINGS ROUTES
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const [rows] = await pool.query('SELECT * FROM `settings` LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    const s = rows[0];
    res.json({
      id: s.id,
      studioName: s.studio_name,
      tagline: s.tagline,
      logoLetter: s.logo_letter,
      whatsappNumber: s.whatsapp_number,
      instagramHandle: s.instagram_handle,
      instagramUrl: s.instagram_url,
      artistName: s.artist_name,
      artistTitle: s.artist_title,
      artistBio: s.artist_bio,
      announcement: s.announcement,
      adminPassword: s.admin_password,
      upiId: s.upi_id || 'dilipbhai-bhargav@ptyes',
      upiName: s.upi_name || 'ANMOL ARTS GALLERY',
    });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const s = req.body;
    try {
      await pool.query(
        `UPDATE \`settings\` SET 
          studio_name = ?, tagline = ?, logo_letter = ?, whatsapp_number = ?, 
          instagram_handle = ?, instagram_url = ?, artist_name = ?, artist_title = ?, 
          artist_bio = ?, announcement = ?, upi_id = ?, upi_name = ?
         WHERE id = 1`,
        [
          s.studioName,
          s.tagline,
          s.logoLetter,
          s.whatsappNumber,
          s.instagramHandle,
          s.instagramUrl,
          s.artistName,
          s.artistTitle,
          s.artistBio,
          s.announcement,
          s.upiId || 'dilipbhai-bhargav@ptyes',
          s.upiName || 'ANMOL ARTS GALLERY',
        ]
      );
    } catch {
      await pool.query(
        `UPDATE \`settings\` SET 
          studio_name = ?, tagline = ?, logo_letter = ?, whatsapp_number = ?, 
          instagram_handle = ?, instagram_url = ?, artist_name = ?, artist_title = ?, 
          artist_bio = ?, announcement = ?
         WHERE id = 1`,
        [
          s.studioName,
          s.tagline,
          s.logoLetter,
          s.whatsappNumber,
          s.instagramHandle,
          s.instagramUrl,
          s.artistName,
          s.artistTitle,
          s.artistBio,
          s.announcement,
        ]
      );
    }

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 3. ARTWORKS ROUTES
// ==========================================
app.get('/api/artworks', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const [rows] = await pool.query('SELECT * FROM `artworks` ORDER BY `created_at` ASC');
    const artworks = rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      medium: r.medium,
      paper: r.paper,
      dimensions: r.dimensions,
      price: Number(r.price),
      image: r.image,
      description: r.description,
      isOriginal: Boolean(r.is_original),
      tag: r.tag,
      listingType: r.listing_type || 'sale',
      createdAt: r.created_at,
    }));

    res.json(artworks);
  } catch (err) {
    console.error('Error fetching artworks:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/artworks', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const art = req.body;
    const id = art.id || `art-${Date.now()}`;

    await pool.query(
      `INSERT INTO \`artworks\` (
        id, title, category, medium, paper, dimensions, price, 
        image, description, is_original, tag, listing_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        category = VALUES(category),
        medium = VALUES(medium),
        paper = VALUES(paper),
        dimensions = VALUES(dimensions),
        price = VALUES(price),
        image = VALUES(image),
        description = VALUES(description),
        is_original = VALUES(is_original),
        tag = VALUES(tag),
        listing_type = VALUES(listing_type)`,
      [
        id,
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

    console.log(`[MySQL] Artwork saved: ${id} - ${art.title}`);
    res.status(201).json({ success: true, id, message: 'Artwork created' });
  } catch (err) {
    console.error('Error creating artwork:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/artworks/:id', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const { id } = req.params;
    const art = req.body;

    await pool.query(
      `UPDATE \`artworks\` SET 
        title = ?, category = ?, medium = ?, paper = ?, dimensions = ?, 
        price = ?, image = ?, description = ?, is_original = ?, tag = ?, listing_type = ?
       WHERE id = ?`,
      [
        art.title,
        art.category,
        art.medium,
        art.paper,
        art.dimensions,
        art.price,
        art.image,
        art.description,
        art.isOriginal ? 1 : 0,
        art.tag,
        art.listingType || 'sale',
        id,
      ]
    );

    res.json({ success: true, message: 'Artwork updated' });
  } catch (err) {
    console.error('Error updating artwork:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/artworks/:id/listing-type', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const { id } = req.params;
    const { listingType } = req.body; // 'sale' | 'completed'

    await pool.query('UPDATE `artworks` SET listing_type = ? WHERE id = ?', [listingType, id]);
    res.json({ success: true, message: `Artwork moved to ${listingType}` });
  } catch (err) {
    console.error('Error changing listing type:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/artworks/:id', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const { id } = req.params;
    await pool.query('DELETE FROM `artworks` WHERE id = ?', [id]);
    res.json({ success: true, message: 'Artwork deleted' });
  } catch (err) {
    console.error('Error deleting artwork:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. ORDERS ROUTES
// ==========================================
app.get('/api/orders', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const [rows] = await pool.query('SELECT * FROM `orders` ORDER BY `created_at` DESC');
    const orders = rows.map((r) => {
      let items = [];
      let customDetails = null;
      try {
        items = typeof r.items === 'string' ? JSON.parse(r.items) : r.items;
      } catch (e) {
        items = [];
      }
      try {
        customDetails = typeof r.custom_details === 'string' ? JSON.parse(r.custom_details) : r.custom_details;
      } catch (e) {
        customDetails = null;
      }

      return {
        id: r.id,
        date: r.order_date,
        customerName: r.customer_name,
        phone: r.phone,
        address: r.address,
        items,
        total: Number(r.total),
        status: r.status,
        type: r.order_type,
        customDetails,
        createdAt: r.created_at,
      };
    });

    res.json(orders);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const o = req.body;
    const id = o.id || `ORD-${Date.now().toString().slice(-6)}`;
    const orderDate = o.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    await pool.query(
      `INSERT INTO \`orders\` (
        id, order_date, customer_name, phone, address, items, total, 
        status, order_type, custom_details
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        status = VALUES(status),
        custom_details = VALUES(custom_details),
        total = VALUES(total)`,
      [
        id,
        orderDate,
        o.customerName || o.name || 'Anonymous',
        o.customerPhone || o.phone || '',
        o.customerCity || o.address || '',
        JSON.stringify(o.items || []),
        o.total || 0,
        o.status || 'New',
        o.type || o.orderType || 'ready',
        JSON.stringify(o.customDetails || o.paymentDetails || null),
      ]
    );

    console.log(`[MySQL] Order received: ${id} by ${o.customerName || o.name} (Total: ₹${o.total})`);
    res.status(201).json({ success: true, id, message: 'Order created' });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const { id } = req.params;
    const { status } = req.body;

    await pool.query('UPDATE `orders` SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const { id } = req.params;
    await pool.query('DELETE FROM `orders` WHERE id = ?', [id]);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    console.error('Error deleting order:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 5. REVIEWS ROUTES
// ==========================================
app.get('/api/reviews', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const [rows] = await pool.query('SELECT * FROM `reviews` ORDER BY `created_at` DESC');
    const reviews = rows.map((r) => ({
      id: r.id,
      name: r.name,
      city: r.city,
      stars: Number(r.stars),
      quote: r.quote,
      item: r.item,
      date: r.review_date,
      createdAt: r.created_at,
    }));

    res.json(reviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const rev = req.body;
    const id = rev.id || `rev-${Date.now()}`;
    const reviewDate = rev.date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const quote = rev.quote || rev.comment || '';

    await pool.query(
      `INSERT INTO \`reviews\` (id, name, city, stars, quote, item, review_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         name = VALUES(name),
         city = VALUES(city),
         stars = VALUES(stars),
         quote = VALUES(quote),
         item = VALUES(item),
         review_date = VALUES(review_date)`,
      [
        id,
        rev.name,
        rev.city || '',
        rev.stars || 5,
        quote,
        rev.item || 'Custom Artwork',
        reviewDate,
      ]
    );

    console.log(`[MySQL] Review saved: ${id} by ${rev.name}`);
    res.status(201).json({ success: true, id, message: 'Review saved' });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const pool = req.pool;
    if (!pool) return res.status(503).json({ error: 'Database not connected' });

    const { id } = req.params;
    await pool.query('DELETE FROM `reviews` WHERE id = ?', [id]);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    console.error('Error deleting review:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// START SERVER
// ==========================================
async function start() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`[Server] Anmol Art Backend running at http://localhost:${PORT}`);
    console.log(`[Server] Health check available at http://localhost:${PORT}/api/health`);
  });
}

start();
