// analyze.js — PrivateBounty AI
// Retrieves context chunks and runs on-device LLM to analyse a GitHub issue.

import { loadModel, unloadModel, completion, QWEN3_4B_INST_Q4_K_M } from '@qvac/sdk';
import sqlite3InitModule from '@sqliteai/sqlite-wasm';
import { readFileSync } from 'node:fs';

// ── Config ────────────────────────────────────────────────────────────────────
const DB_PATH = 'C:\\Users\\yadav\\AppData\\Local\\PrivateBountyAI\\bounty-index.db';

// ── Keep model loaded between calls so sequential compare requests
//    don't trigger SDK auto-shutdown between the first and second analysis.
let globalModelId = null;

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJSON(text) {
  // Strip <think>…</think> blocks that Qwen3 emits
  text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  try { return JSON.parse(text); } catch (_) {}
  // Try to find a JSON object anywhere in the text
  const match = text.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
  return null;
}

async function loadContextChunks(safeWorkspace) {
  const sqlite3 = await sqlite3InitModule();
  const dbFileData = new Uint8Array(readFileSync(DB_PATH));
  const p = sqlite3.wasm.allocFromTypedArray(dbFileData);
  const db = new sqlite3.oo1.DB();
  sqlite3.capi.sqlite3_deserialize(
    db.pointer, 'main', p, dbFileData.byteLength, dbFileData.byteLength,
    sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
  );
  const chunks = [];
  try {
    db.exec({
      sql: `SELECT text FROM "${safeWorkspace}" ORDER BY chunk_idx ASC`,
      rowMode: 'object',
      callback: row => chunks.push(row.text),
    });
  } catch (e) {
    console.warn('⚠️ Could not retrieve chunks:', e.message);
  }
  db.close();
  return chunks;
}

async function ensureModel() {
  if (globalModelId) {
    console.log('♻️  Reusing cached model:', globalModelId);
    return globalModelId;
  }
  console.log('⏳ Loading model (ctx_size 4096)…');
  globalModelId = await loadModel({
    modelSrc: QWEN3_4B_INST_Q4_K_M,
    modelConfig: { ctx_size: 4096 },
    onProgress: p => {
      const pct = Math.floor(p.percentage);
      if (pct % 20 === 0) process.stdout.write(`\r  Loading: ${pct}%   `);
    },
  });
  console.log('\n✅ Model loaded:', globalModelId);
  return globalModelId;
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function analyzeIssue(workspace, issueTitle, userSkills) {
  const safeWorkspace = workspace.replace(/[^a-zA-Z0-9_]/g, '_');

  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║  PrivateBounty AI — Analysis Starting     ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log(`📌 Workspace : ${workspace}`);
  console.log(`📋 Title     : ${issueTitle}`);
  console.log(`🛠  Skills   : ${Array.isArray(userSkills) ? userSkills.join(', ') : userSkills}\n`);

  // ── Step 1: Fetch context from SQLite ─────────────────────────────────────
  console.log('─── Step 1/3: Fetching context from SQLite ───');
  const contextChunks = await loadContextChunks(safeWorkspace);
  console.log(`✅ Retrieved ${contextChunks.length} chunks`);
  const context = contextChunks.join(' ').substring(0, 600);

  // ── Step 2: Build prompt ──────────────────────────────────────────────────
  console.log('─── Step 2/3: Building prompt ───');
  const skillsStr = Array.isArray(userSkills) ? userSkills.join(', ') : (userSkills || '');

  const userPrompt = `GitHub Issue: ${issueTitle}

Issue details: ${context}

Developer skills: ${skillsStr}

Analyze this issue and fill in the JSON below with REAL values specific to this issue.
Do NOT copy the example values — compute new ones based on the actual issue content.
Output ONLY the JSON object, nothing else:

{
  "canSolve": true,
  "confidence": 75,
  "difficulty": "Intermediate",
  "estimatedHours": 8,
  "approach": "Step 1: ... Step 2: ... Step 3: ...",
  "requiredSkills": ["skill1", "skill2"],
  "missingSkills": [],
  "firstStep": "specific first action",
  "warningFlags": ""
}`;

  const history = [
    {
      role: 'system',
      content: 'You are a JSON API. You ONLY output valid JSON objects. Never output explanations, markdown, or <think> tags. Analyze the GitHub issue provided and compute REAL values — do not copy placeholder values from the template.',
    },
    { role: 'user', content: userPrompt },
  ];
  console.log('✅ Prompt built');

  // ── Step 3: Load model (cached) and run completion ────────────────────────
  console.log('─── Step 3/3: Running LLM completion ───');
  let llmModelId;
  try {
    llmModelId = await ensureModel();
  } catch (e) {
    // Model may have been evicted — clear cache and retry once
    console.warn('⚠️ Model load failed, retrying fresh:', e.message);
    globalModelId = null;
    llmModelId = await ensureModel();
  }

  let rawText = '';
  let completionOk = false;
  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`\n─── Attempt ${attempt}/2 ───`);
    rawText = '';
    try {
      const run = completion({ modelId: llmModelId, history });
      process.stdout.write('🤖 LLM: ');
      // Use the correct .events API (NOT .tokenStream)
      for await (const e of run.events) {
        if (e.type === 'contentDelta') {
          process.stdout.write(e.text);
          rawText += e.text;
        }
      }
      console.log('\n✅ Completion finished');
      completionOk = true;
      break;
    } catch (err) {
      console.warn(`⚠️ Completion error (attempt ${attempt}):`, err.message);
      // If model was invalidated, reload and retry
      globalModelId = null;
      try { llmModelId = await ensureModel(); } catch (_) {}
    }
  }

  if (!completionOk || !rawText) {
    throw new Error('LLM completion failed after 2 attempts.');
  }

  // ── Parse result ──────────────────────────────────────────────────────────
  const parsed = extractJSON(rawText);
  if (!parsed) {
    console.error('❌ JSON parse failed. Raw output:', rawText.substring(0, 300));
    throw new Error('LLM did not return valid JSON. Please try again.');
  }

  const analysis = {
    canSolve: Boolean(parsed.canSolve ?? false),
    confidence: Number(parsed.confidence ?? 0),
    difficulty: parsed.difficulty || 'Unknown',
    estimatedHours: Number(parsed.estimatedHours ?? 0),
    approach: parsed.approach || '',
    requiredSkills: Array.isArray(parsed.requiredSkills) ? parsed.requiredSkills : [],
    missingSkills: Array.isArray(parsed.missingSkills) ? parsed.missingSkills : [],
    firstStep: parsed.firstStep || '',
    warningFlags: parsed.warningFlags || '',
  };

  console.log('\n╔═════════════════════════════════════════════╗');
  console.log('║  Analysis Complete!                         ║');
  console.log(`║  canSolve  : ${String(analysis.canSolve).padEnd(28)} ║`);
  console.log(`║  confidence: ${String(analysis.confidence + '%').padEnd(28)} ║`);
  console.log(`║  difficulty: ${String(analysis.difficulty).padEnd(28)} ║`);
  console.log(`║  est. hours: ${String(analysis.estimatedHours + 'h').padEnd(28)} ║`);
  console.log('╚═════════════════════════════════════════════╝\n');

  // NOTE: We intentionally do NOT unload the model here.
  // Keeping it loaded means:
  //   a) Comparison (second analyze call) reuses the model instantly
  //   b) The SDK never auto-shuts-down between the two calls
  //   c) No WORKER_SHUTDOWN errors propagate up to the server

  return analysis;
}