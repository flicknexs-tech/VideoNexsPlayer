require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = 2881;
const DOMAIN = process.env.DOMAIN || 'localhost';

app.use(cors());
app.use(bodyParser.json());

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_DATABASE_NAME || 'telemetry_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Initialize database table
async function initDB() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        domain VARCHAR(255),
        platform VARCHAR(50),
        version VARCHAR(20),
        receivedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
    connection.release();
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
}

initDB();

// Endpoint to receive telemetry pings
app.post('/ping', async (req, res) => {
  const data = req.body;
  
  try {
    await pool.query(
      'INSERT INTO usage_logs (domain, platform, version) VALUES (?, ?, ?)',
      [data.domain, data.platform, data.version]
    );

    console.log(`[Usage] Ping from ${data.domain} (${data.platform}) saved to DB`);
    res.status(204).send();
  } catch (err) {
    console.error('Error saving ping to database:', err);
    res.status(500).send({ error: 'Database error' });
  }
});

// Basic Dashboard UI
app.get('/dashboard', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM usage_logs ORDER BY receivedAt DESC LIMIT 1000');
    
    const html = `
      <html>
        <head>
          <title>Framework Usage Dashboard</title>
          <style>
            body { font-family: -apple-system, sans-serif; background: #1a1a1a; color: #fff; padding: 40px; }
            h1 { color: #00ff88; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; background: #2a2a2a; border-radius: 8px; overflow: hidden; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #333; }
            th { background: #333; }
            tr:hover { background: #3a3a3a; }
          </style>
        </head>
        <body>
          <h1>Framework Usage History (MySQL Persistent)</h1>
          <p>Total Pings (Last 1000): ${rows.length}</p>
          <table>
            <thead>
              <tr>
                <th>Domain</th>
                <th>Platform</th>
                <th>Version</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(u => `
                <tr>
                  <td>${u.domain}</td>
                  <td>${u.platform}</td>
                  <td>${u.version}</td>
                  <td>${new Date(u.receivedAt).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    res.send(html);
  } catch (err) {
    console.error('Error fetching logs from database:', err);
    res.status(500).send('<h1>Error loading dashboard</h1>');
  }
});

app.listen(PORT, () => {
  console.log(`Telemetry server running at http://${DOMAIN}:${PORT}`);
  console.log(`Dashboard available at http://${DOMAIN}:${PORT}/dashboard`);
  console.log(`Ping endpoint: http://${DOMAIN}:${PORT}/ping`);
});
