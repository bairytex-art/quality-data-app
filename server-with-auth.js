const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const dbFile = path.join(dataDir, 'qualities.db');

const db = new sqlite3.Database(dbFile, err => {
  if (err) {
    console.error('Could not open database:', err.message);
    process.exit(1);
  }
});

const createTableSql = `CREATE TABLE IF NOT EXISTS qualities (
  id TEXT PRIMARY KEY,
  factory TEXT,
  location TEXT,
  loom INTEGER,
  startDate TEXT,
  qualityName TEXT,
  motherName TEXT,
  design TEXT,
  beamType TEXT,
  warpYarn TEXT,
  weftYarn TEXT,
  ends TEXT,
  reedCount TEXT,
  pickLoom TEXT,
  pickTable TEXT,
  width TEXT,
  qualityWeight TEXT,
  nameTextYarn TEXT,
  selBgYarn TEXT
);`;

db.serialize(() => {
  db.run(createTableSql);
});

const app = express();

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'quality-data-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.authenticated) {
    return next();
  }
  res.status(401).json({ error: 'Authentication required' });
}

app.get('/', (req, res) => {
  res.send('Quality Data Backend with Authentication is running. API endpoints: /api/qualities, /api/auth/*');
});

// Authentication endpoints
app.post('/api/auth/login', async (req, res) => {
  const { password } = req.body;
  
  // Default password - you should change this in production
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'grace1588@';
  
  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }
  
  if (password === ADMIN_PASSWORD) {
    req.session.authenticated = true;
    req.session.save(err => {
      if (err) {
        return res.status(500).json({ error: 'Session save failed' });
      }
      res.json({ success: true, message: 'Authentication successful' });
    });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/api/auth/status', (req, res) => {
  res.json({ authenticated: !!(req.session && req.session.authenticated) });
});

// Protected API endpoints
app.get('/api/qualities', requireAuth, (req, res) => {
  db.all('SELECT * FROM qualities ORDER BY ROWID DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch qualities.' });
    }
    res.json(rows);
  });
});

app.put('/api/qualities/bulk', requireAuth, (req, res) => {
  const qualities = Array.isArray(req.body.qualities) ? req.body.qualities : [];

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');
    db.run('DELETE FROM qualities');

    const insertSql = `INSERT INTO qualities (
      id, factory, location, loom, startDate, qualityName, motherName, design,
      beamType, warpYarn, weftYarn, ends, reedCount, pickLoom, pickTable,
      width, qualityWeight, nameTextYarn, selBgYarn
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const stmt = db.prepare(insertSql);
    qualities.forEach(item => {
      stmt.run(
        item.id,
        item.factory,
        item.location,
        item.loom,
        item.startDate,
        item.qualityName,
        item.motherName,
        item.design,
        item.beamType,
        item.warpYarn,
        item.weftYarn,
        item.ends,
        item.reedCount,
        item.pickLoom,
        item.pickTable,
        item.width,
        item.qualityWeight,
        item.nameTextYarn,
        item.selBgYarn
      );
    });

    stmt.finalize(err => {
      if (err) {
        db.run('ROLLBACK');
        return res.status(500).json({ error: 'Unable to save data.' });
      }
      db.run('COMMIT', commitErr => {
        if (commitErr) {
          return res.status(500).json({ error: 'Unable to commit transaction.' });
        }
        res.json({ success: true });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Quality Data backend with authentication listening on http://localhost:${PORT}`);
});
