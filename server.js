const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin123';

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'stockline.json');

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Sessions (in-memory) ----------
const SESSION_TTL = 12 * 60 * 60 * 1000; // 12 hours
const sessions = new Map();

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = sessions.get(token);
  if (!session || session.expires < Date.now()) {
    sessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized' });
  }
  req.token = token;
  next();
}

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (safeEqual(username ?? '', ADMIN_USER) && safeEqual(password ?? '', ADMIN_PASS)) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, { user: ADMIN_USER, expires: Date.now() + SESSION_TTL });
    return res.json({ token, username: ADMIN_USER });
  }
  res.status(401).json({ error: 'Incorrect username or password.' });
});

app.post('/api/logout', requireAuth, (req, res) => {
  sessions.delete(req.token);
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ username: sessions.get(req.token).user });
});

// ---------- Data ----------
app.get('/api/data', requireAuth, (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json({});
    res.json(JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')));
  } catch (err) {
    console.error('Read failed:', err);
    res.status(500).json({ error: 'Could not read data.' });
  }
});

app.put('/api/data', requireAuth, (req, res) => {
  const { products, nextId, jobOrders, nextJoId, nextJoNum } = req.body || {};
  if (!Array.isArray(products) || !Array.isArray(jobOrders)) {
    return res.status(400).json({ error: 'Invalid payload.' });
  }
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = DATA_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify({ products, nextId, jobOrders, nextJoId, nextJoNum }, null, 2));
    fs.renameSync(tmp, DATA_FILE);
    res.json({ ok: true });
  } catch (err) {
    console.error('Write failed:', err);
    res.status(500).json({ error: 'Could not save data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Stockline running on http://localhost:${PORT}`);
  if (ADMIN_PASS === 'admin123') {
    console.warn('WARNING: using the default password. Set ADMIN_USER and ADMIN_PASS environment variables.');
  }
});
