import sqlite3InitModule from '@sqliteai/sqlite-wasm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'bounty-index.db');

console.log('Testing c (create) mode with backslash:', dbPath);
try {
  const sqlite3 = await sqlite3InitModule();
  const db = new sqlite3.oo1.DB(dbPath, 'c');
  console.log('Success with c mode!');
  db.close();
} catch (err) {
  console.error('Failed with c mode:', err);
}

console.log('\nTesting r (read-only) mode with backslash:', dbPath);
try {
  const sqlite3 = await sqlite3InitModule();
  const db = new sqlite3.oo1.DB(dbPath, 'r');
  console.log('Success with r mode!');
  db.close();
} catch (err) {
  console.error('Failed with r mode:', err);
}

console.log('\nTesting w (write/read-write) mode with backslash:', dbPath);
try {
  const sqlite3 = await sqlite3InitModule();
  const db = new sqlite3.oo1.DB(dbPath, 'w');
  console.log('Success with w mode!');
  db.close();
} catch (err) {
  console.error('Failed with w mode:', err);
}
