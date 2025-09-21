const express = require('express');
const cors = require('cors');
const path = require('path');
const { readDB, writeDB } = require('./utils/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_prod';
const TOKEN_EXPIRY = '8h';

// Root friendly page
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Supermarket API</title>
      <meta name="viewport" content="width=device-width,initial-scale=1" />
      <style>body{font-family:system-ui,Arial;padding:24px;background:#f7fafc}.card{max-width:900px;margin:24px auto;background:white;padding:20px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.06)}</style>
    </head>
    <body>
      <div class="card">
        <h1>🛒 Supermarket — API (with JWT auth)</h1>
        <p>Quick links:</p>
        <ul>
          <li><a href="/api/products" target="_blank">GET /api/products</a></li>
          <li><a href="/api/sales" target="_blank">GET /api/sales</a></li>
          <li><a href="/api/stats" target="_blank">GET /api/stats</a></li>
        </ul>
        <p>Auth endpoints: POST /api/auth/register (optional), POST /api/auth/login</p>
      </div>
    </body>
    </html>
  `);
});

/*
  Data shape (db.json):
  {
    "products": [ { id, name, sku, category, price, quantity, imageUrl, createdAt } ],
    "sales": [ { id, items:[{productId, name, sku, qty, price, lineTotal}], totalAmount, createdAt } ],
    "users": [ { id, username, passwordHash, role, createdAt } ]
  }
*/

// Utility: ensure there's at least one admin user (password: admin) if users empty
async function ensureDefaultAdmin() {
  const db = await readDB();
  db.users = db.users || [];
  if (db.users.length === 0) {
    const passwordHash = await bcrypt.hash('admin', 10);
    const admin = { id: uuidv4(), username: 'admin', passwordHash, role: 'admin', createdAt: new Date().toISOString() };
    db.users.push(admin);
    await writeDB(db);
    console.log('Default admin created -> username: admin password: admin (please change)');
  }
}
ensureDefaultAdmin().catch(console.error);

// Auth helpers
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

async function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.auth = payload; // contains id, username, role
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Role check middleware (optional)
function requireRole(role) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: 'Not authenticated' });
    if (req.auth.role !== role) return res.status(403).json({ error: 'Insufficient role' });
    next();
  };
}

// --- AUTH ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const db = await readDB();
  db.users = db.users || [];
  if (db.users.find(u => u.username === username)) return res.status(400).json({ error: 'username exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: uuidv4(), username, passwordHash, role: role || 'staff', createdAt: new Date().toISOString() };
  db.users.push(user);
  await writeDB(db);
  res.status(201).json({ id: user.id, username: user.username, role: user.role });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });

  const db = await readDB();
  db.users = db.users || [];
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});

// --- PRODUCTS ---
// GET all products (public)
app.get('/api/products', async (req, res) => {
  const db = await readDB();
  res.json({ products: db.products || [] });
});

// POST add product (protected)
app.post('/api/products', requireAuth, async (req, res) => {
  // only allow staff or admin to add
  const db = await readDB();
  const { name, sku, category, price, quantity, imageUrl } = req.body;
  if (!name || price == null || quantity == null) return res.status(400).json({ error: 'name, price and quantity required' });

  const newProduct = {
    id: uuidv4(),
    name,
    sku: sku || `SKU-${Math.random().toString(36).slice(2,8).toUpperCase()}`,
    category: category || 'General',
    price: Number(price),
    quantity: Number(quantity),
    imageUrl: imageUrl || '',
    createdAt: new Date().toISOString()
  };

  db.products = db.products || [];
  db.products.push(newProduct);
  await writeDB(db);
  res.status(201).json(newProduct);
});

// PUT update product (protected)
app.put('/api/products/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const updates = req.body;
  const db = await readDB();
  db.products = db.products || [];
  const p = db.products.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: 'Product not found' });

  ['name','price','quantity','category','imageUrl','sku'].forEach(k => {
    if (updates[k] !== undefined) p[k] = (k === 'price' || k === 'quantity') ? Number(updates[k]) : updates[k];
  });
  await writeDB(db);
  res.json(p);
});

// DELETE product (protected)
app.delete('/api/products/:id', requireAuth, async (req, res) => {
  const id = req.params.id;
  const db = await readDB();
  db.products = db.products || [];
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });
  const [deleted] = db.products.splice(idx,1);
  await writeDB(db);
  res.json({ success: true, deleted });
});

// --- SALES ---
// POST checkout / create sale (protected)
app.post('/api/sales', requireAuth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: 'items are required' });

  const db = await readDB();
  db.products = db.products || [];
  db.sales = db.sales || [];

  // Build sale items and validate stock
  const saleItems = [];
  for (const it of items) {
    const product = db.products.find(p => p.id === it.productId);
    if (!product) return res.status(400).json({ error: `Product ${it.productId} not found` });
    const qty = Number(it.qty);
    if (qty <= 0) return res.status(400).json({ error: 'Quantity must be > 0' });
    if (product.quantity < qty) return res.status(400).json({ error: `Insufficient stock for ${product.name}` });

    saleItems.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      qty,
      price: product.price,
      lineTotal: Number((product.price * qty).toFixed(2))
    });
  }

  // Deduct stock
  for (const sIt of saleItems) {
    const product = db.products.find(p => p.id === sIt.productId);
    product.quantity -= sIt.qty;
  }

  const totalAmount = saleItems.reduce((s, i) => s + i.lineTotal, 0);
  const sale = {
    id: uuidv4(),
    items: saleItems,
    totalAmount: Number(totalAmount.toFixed(2)),
    createdAt: new Date().toISOString(),
    staffId: req.auth.id,
    staffUsername: req.auth.username
  };
  db.sales.push(sale);
  await writeDB(db);
  res.status(201).json(sale);
});

// GET sales history (protected)
app.get('/api/sales', requireAuth, async (req, res) => {
  const db = await readDB();
  res.json({ sales: db.sales || [] });
});

// --- STATS ---
app.get('/api/stats', async (req, res) => {
  const db = await readDB();
  db.products = db.products || [];
  db.sales = db.sales || [];

  const totalProducts = db.products.length;
  const totalStockUnits = db.products.reduce((s,p) => s + (p.quantity || 0), 0);
  const totalStockValue = db.products.reduce((s,p) => s + ((p.quantity || 0) * (p.price || 0)), 0);
  const totalEarnings = db.sales.reduce((s,sale) => s + (sale.totalAmount || 0), 0);

  res.json({
    totalProducts,
    totalStockUnits,
    totalStockValue: Number(totalStockValue.toFixed(2)),
    totalEarnings: Number(totalEarnings.toFixed(2))
  });
});

// Fallback
app.use((req,res) => res.status(404).json({ error: 'Not Found' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
