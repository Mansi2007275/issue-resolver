/**
 * ingest.js — PrivateBounty AI
 * Fetches a GitHub issue, chunks its content,
 * and stores the texts in a local SQLite file via @sqliteai/sqlite-wasm.
 *
 * Export: async function ingestIssue(owner, repo, issueNumber)
 */

import sqlite3InitModule from '@sqliteai/sqlite-wasm';
import { writeFile, readFile, access } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync, mkdirSync } from 'node:fs';

// ── Helpers ────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Split a long string into overlapping chunks.
 * @param {string} text       Full text to chunk
 * @param {number} chunkSize  Target tokens/chars per chunk (default 250)
 * @param {number} overlap    Overlap chars between consecutive chunks (default 40)
 * @returns {string[]}
 */
function chunkText(text, chunkSize = 250, overlap = 40) {
  if (!text || text.trim().length === 0) return [];

  // Simple word-boundary chunker
  const words = text.split(/\s+/);
  const chunks = [];
  let start = 0;

  while (start < words.length) {
    const end = Math.min(start + chunkSize, words.length);
    const chunk = words.slice(start, end).join(' ').trim();
    if (chunk.length > 0) chunks.push(chunk);
    if (end >= words.length) break;
    // Slide forward by (chunkSize - overlap) words, but at least 1
    const stride = Math.max(1, chunkSize - overlap);
    start += stride;
  }

  return chunks;
}

/**
 * Fetch a GitHub issue (public API, no auth).
 * @param {string} owner
 * @param {string} repo
 * @param {number|string} issueNumber
 */
async function fetchGitHubIssue(owner, repo, issueNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;
  console.log(`\n🌐 [ingest] Fetching issue from: ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PrivateBountyAI/1.0',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    throw new Error(
      `GitHub API returned ${res.status} ${res.statusText} for ${url}`
    );
  }

  return res.json();
}

/**
 * Fetch comments for an issue.
 */
async function fetchIssueComments(owner, repo, issueNumber) {
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}/comments?per_page=10`;
  console.log(`💬 [ingest] Fetching comments from: ${url}`);

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'PrivateBountyAI/1.0',
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!res.ok) {
    console.warn(`⚠️  [ingest] Could not fetch comments: ${res.status}`);
    return [];
  }

  return res.json();
}

// ── Main Export ────────────────────────────────────────────────────────────

/**
 * Ingest a GitHub issue into the local SQLite database.
 *
 * @param {string} owner        GitHub repo owner (e.g. "facebook")
 * @param {string} repo         GitHub repo name  (e.g. "react")
 * @param {number|string} issueNumber  Issue number
 * @returns {Promise<{workspace: string, chunks: number, metaPath: string}>}
 */
export async function ingestIssue(owner, repo, issueNumber) {
  const workspaceName = `issue-${owner}-${repo}-${issueNumber}`;
  const dbPath = 'C:\\Users\\yadav\\AppData\\Local\\PrivateBountyAI\\bounty-index.db';
  const metaPath = path.join(__dirname, `issue-${issueNumber}-meta.json`);

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  PrivateBounty AI — Ingest Pipeline Starting  ║');
  console.log('╚══════════════════════════════════════════════╝\n');
  console.log(`📌 Workspace  : ${workspaceName}`);
  console.log(`💾 DB Path    : ${dbPath}`);
  console.log(`📝 Meta Path  : ${metaPath}\n`);

  // ── Step 1: Fetch issue ──────────────────────────────────────────────────
  console.log('─── Step 1/5: Fetching GitHub issue ───');
  const issue = await fetchGitHubIssue(owner, repo, issueNumber);
  console.log(`✅ Issue fetched: "#${issue.number} — ${issue.title}"`);
  console.log(`   State: ${issue.state} | Labels: ${(issue.labels || []).map(l => l.name).join(', ') || 'none'}`);

  // Fetch comments
  const comments = await fetchIssueComments(owner, repo, issueNumber);
  console.log(`✅ Comments fetched: ${comments.length} comments`);

  // ── Step 2: Build fullText ───────────────────────────────────────────────
  console.log('\n─── Step 2/5: Building fullText ───');
  const labelNames = (issue.labels || []).map(l => l.name).join(', ');
  const commentTexts = comments
    .map(c => `Comment by @${c.user?.login || 'unknown'}: ${c.body || ''}`)
    .join('\n\n');

  const fullText = [
    `Title: ${issue.title}`,
    `State: ${issue.state}`,
    `Labels: ${labelNames || 'none'}`,
    `Comments count: ${issue.comments}`,
    '',
    'Body:',
    issue.body || '(no body)',
    '',
    commentTexts ? 'Comments:\n' + commentTexts : '',
  ]
    .join('\n')
    .trim();

  console.log(`✅ fullText built — ${fullText.length} characters`);

  // ── Step 3: Chunk the text ───────────────────────────────────────────────
  console.log('\n─── Step 3/5: Chunking text (chunkSize=250, overlap=40) ───');
  const chunks = chunkText(fullText, 250, 40);
  console.log(`✅ ${chunks.length} chunks created`);
  chunks.forEach((c, i) =>
    console.log(`   Chunk[${i}]: "${c.substring(0, 60).replace(/\n/g, ' ')}…" (${c.length} chars)`)
  );

  if (chunks.length === 0) {
    throw new Error('No chunks produced — the issue may have no content.');
  }

  // ── Step 4: Initialize SQLite + store ────────────────────────────
  console.log('\n─── Step 4/5: Initializing SQLite DB and storing chunks ───');
  const sqlite3 = await sqlite3InitModule();

  // Use file-backed DB; ":memory:" for pure in-memory (not persistent)
  // @sqliteai/sqlite-wasm supports file paths on Node
  const db = new sqlite3.oo1.DB(dbPath, 'c');

  // Create workspace-namespaced table if it doesn't already exist
  const safeWorkspace = workspaceName.replace(/[^a-zA-Z0-9_]/g, '_');
  db.exec(`
    CREATE TABLE IF NOT EXISTS "${safeWorkspace}" (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      chunk_idx INTEGER NOT NULL,
      text      TEXT    NOT NULL
    )
  `);

  // Clear any existing data for this workspace (re-ingest is idempotent)
  db.exec(`DELETE FROM "${safeWorkspace}"`);
  console.log(`✅ Table "${safeWorkspace}" ready, existing rows cleared`);

  // Insert each chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    process.stdout.write(`\r   Storing chunk ${i + 1}/${chunks.length}…   `);

    db.exec({
      sql: `INSERT INTO "${safeWorkspace}" (chunk_idx, text) VALUES (?, ?)`,
      bind: [i, chunk],
    });
  }
  console.log(`\n✅ All ${chunks.length} chunks stored`);

  const exportedDb = sqlite3.capi.sqlite3_js_db_export(db.pointer);

  db.close();
  console.log('✅ SQLite DB closed');
  mkdirSync('C:\\Users\\yadav\\AppData\\Local\\PrivateBountyAI', { recursive: true });
  writeFileSync(dbPath, Buffer.from(exportedDb));
  console.log(`✅ DB written to disk: ${dbPath} (${exportedDb.byteLength} bytes)`);

  // ── Step 5: Save metadata ────────────────────────────────────────────────
  console.log('\n─── Step 5/5: Saving metadata ───');
  const meta = {
    workspace: workspaceName,
    owner,
    repo,
    issueNumber: Number(issueNumber),
    title: issue.title,
    state: issue.state,
    labels: labelNames,
    commentsCount: issue.comments,
    chunksCount: chunks.length,
    dbPath,
    ingestedAt: new Date().toISOString(),
  };

  await writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
  console.log(`✅ Metadata saved to: ${metaPath}\n`);

  console.log('╔══════════════════════════════════════════╗');
  console.log('║  Ingest Complete!                         ║');
  console.log(`║  Workspace : ${workspaceName.padEnd(28)} ║`);
  console.log(`║  Chunks    : ${String(chunks.length).padEnd(28)} ║`);
  console.log('╚══════════════════════════════════════════╝\n');

  return { workspace: workspaceName, chunks: chunks.length, metaPath };
}
