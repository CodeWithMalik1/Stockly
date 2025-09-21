const fs = require('fs').promises;
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db.json');

async function readDB() {
  try {
    const raw = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    // if file missing or invalid, create starter
    const init = { products: [], sales: [], users: [] };
    await writeDB(init);
    return init;
  }
}

async function writeDB(db) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf8');
}

module.exports = { readDB, writeDB };
