const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

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
app.use(cors());
app.use(express.json());

// Serve static files from docs directory
app.use(express.static(path.join(__dirname, 'docs')));

app.get('/', (req, res) => {
  res.send('Quality Data Backend is running on port 3000. API endpoints: /api/qualities');
});

app.get('/api/qualities', (req, res) => {
  db.all('SELECT * FROM qualities ORDER BY ROWID DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to fetch qualities.' });
    }
    res.json(rows);
  });
});

app.put('/api/qualities/bulk', (req, res) => {
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
  console.log(`Quality Data backend listening on http://localhost:${PORT}`);
});
