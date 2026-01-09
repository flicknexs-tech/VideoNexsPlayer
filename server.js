const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// In-memory store for historical usage
const usageLogs = [];

// Endpoint to receive telemetry pings
app.post('/ping', (req, res) => {
  const data = req.body;
  
  usageLogs.unshift({
    ...data,
    receivedAt: Date.now()
  });

  // Keep only last 1000 logs
  if (usageLogs.length > 1000) usageLogs.pop();

  console.log(`[Usage] Ping from ${data.domain} (${data.platform})`);
  res.status(204).send();
});

// Basic Dashboard UI
app.get('/dashboard', (req, res) => {
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
        <h1>Framework Usage History</h1>
        <p>Total Pings (Last 1000): ${usageLogs.length}</p>
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
            ${usageLogs.map(u => `
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
});

app.listen(PORT, () => {
  console.log(`Telemetry server running at http://localhost:${PORT}`);
  console.log(`Dashboard available at http://localhost:${PORT}/dashboard`);
});
