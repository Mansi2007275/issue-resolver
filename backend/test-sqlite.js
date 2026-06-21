import sqlite3InitModule from '@sqliteai/sqlite-wasm';
import { readFileSync } from 'node:fs';

async function test() {
  const sqlite3 = await sqlite3InitModule();
  const dbPath = 'C:\\Users\\yadav\\AppData\\Local\\PrivateBountyAI\\bounty-index.db';
  console.log('Reading file...');
  const buf = readFileSync(dbPath);
  console.log('Buffer type:', buf.constructor.name);
  console.log('BYTES_PER_ELEMENT:', buf.BYTES_PER_ELEMENT);
  
  try {
    const p1 = sqlite3.wasm.allocFromTypedArray(buf);
    console.log('p1 allocated!');
  } catch (err) {
    console.error('Error with Buffer:', err.message);
  }

  try {
    const uint8 = new Uint8Array(buf);
    console.log('Uint8Array type:', uint8.constructor.name);
    const p2 = sqlite3.wasm.allocFromTypedArray(uint8);
    console.log('p2 allocated!');
  } catch (err) {
    console.error('Error with Uint8Array:', err.message);
  }
}

test();
