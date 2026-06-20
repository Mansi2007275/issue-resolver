/**
 * analyze.js — PrivateBounty AI
 * Retrieves context chunks, and runs LLaMA 3.2 1B
 * to generate a structured JSON analysis of a GitHub issue.
 *
 * Export: async function analyzeIssue(workspace, issueTitle, userSkills)
 */

import { loadModel, unloadModel, completion, LLAMA_3_2_1B_INST_Q4_0 } from '@qvac/sdk';
import sqlite3InitModule from '@sqliteai/sqlite-wasm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Extract a JSON object from a string that may contain extra prose.
 * @param {string} text
 * @returns {object|null}
 */
function extractJSON(text) {
  // Try direct parse first
  try {
    return JSON.parse(text.trim());
  } catch (_) { }

  // Try finding the first {...} block
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) { }
  }

  return null;
}

/**
 * Return a graceful fallback result when JSON parsing fails.
 * @param {string} rawText Raw LLM output
 */
function buildFallback(rawText) {
  return {
    canSolve: false,
    confidence: 0,
    difficulty: 'Unknown',
    estimatedHours: 0,
    approach: rawText.trim().substring(0, 500) || 'Could not parse LLM response.',
    requiredSkills: [],
    missingSkills: [],
    firstStep: 'Review the issue description manually.',
    warningFlags: 'JSON parse failed — raw LLM output returned in "approach" field.',
    _raw: rawText,
  };
}

// ── Main Export ────────────────────────────────────────────────────────────

/**
 * Analyze a previously-ingested GitHub issue and score it against user skills.
 *
 * @param {string}   workspace    Workspace name (e.g. "issue-facebook-react-1")
 * @param {string}   issueTitle   The issue title
 * @param {string[]} userSkills   Array of skill strings (e.g. ["JavaScript","React"])
 * @returns {Promise<object>}     Structured analysis object
 */
export async function analyzeIssue(workspace, issueTitle, userSkills) {
  const dbPath = 'C:\\Users\\yadav\\AppData\\Local\\PrivateBountyAI\\bounty-index.db';
  console.log(`🔍 Looking for DB at: ${dbPath}`);
  console.log(`🔍 DB exists: ${existsSync(dbPath)}`);
  const safeWorkspace = workspace.replace(/[^a-zA-Z0-9_]/g, '_');

  console.log('\n╔═══════════════════════════════════════════════╗');
  console.log('║  PrivateBounty AI — Analysis Pipeline Starting  ║');
  console.log('╚═══════════════════════════════════════════════╝\n');
  console.log(`📌 Workspace   : ${workspace}`);
  console.log(`📋 Issue Title : ${issueTitle}`);
  console.log(`🛠  User Skills : ${Array.isArray(userSkills) ? userSkills.join(', ') : userSkills}\n`);

  // ── Step 1: Open SQLite and retrieve chunks ────────────────────────
  console.log(`\n─── Step 1/3: Retrieving context chunks from SQLite ───`);
  const sqlite3 = await sqlite3InitModule();
  const dbFileData = readFileSync(dbPath);
  const p = sqlite3.wasm.allocFromTypedArray(dbFileData);
  const db = new sqlite3.oo1.DB();
  sqlite3.capi.sqlite3_deserialize(
    db.pointer, 'main', p, dbFileData.byteLength, dbFileData.byteLength,
    sqlite3.capi.SQLITE_DESERIALIZE_FREEONCLOSE
  );
  console.log('✅ DB loaded from disk into wasm memory');

  const contextChunks = [];
  try {
    db.exec({
      sql: `SELECT text FROM "${safeWorkspace}" ORDER BY chunk_idx ASC`,
      rowMode: 'object',
      callback: (row) => contextChunks.push(row),
    });
  } catch (err) {
    console.warn('⚠️  Could not retrieve chunks:', err.message);
  }

  db.close();
  console.log(`✅ Retrieved ${contextChunks.length} context chunks`);
  contextChunks.forEach((c, i) =>
    console.log(`   [${i + 1}] "${String(c.text).substring(0, 80).replace(/\n/g, ' ')}…"`)
  );

  // ── Step 2: Build the LLM prompt ─────────────────────────────────────────
  console.log('\n─── Step 2/3: Building LLM prompt ───');
  const context = contextChunks.map((c, i) => `[Context ${i + 1}]\n${c.text}`).join('\n\n');
  const skillsStr = Array.isArray(userSkills) ? userSkills.join(', ') : userSkills;

  const systemPrompt = `You are an expert software engineer helping developers evaluate GitHub issues.
Analyze the given issue context and the developer's skills, then respond ONLY with a valid JSON object — no markdown, no extra text.`;

  const userPrompt = `
ISSUE TITLE: ${issueTitle}

RELEVANT CONTEXT FROM ISSUE:
${context}

DEVELOPER SKILLS: ${skillsStr}

Based on the above, produce a JSON object with EXACTLY this structure:
{
  "canSolve": true or false,
  "confidence": integer 0-100,
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "estimatedHours": integer (realistic hours to solve),
  "approach": "1. First step\\n2. Second step\\n3. Third step (numbered list as a single string)",
  "requiredSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3"],
  "firstStep": "The single most important first action to take",
  "warningFlags": "Any blockers or risks, or empty string if none"
}

Reply with ONLY the JSON object.`.trim();

  console.log('✅ Prompt constructed');

  // ── Step 3: Load LLM and run completion ──────────────────────────────────
  console.log('\n─── Step 3/3: Loading LLAMA_3_2_1B_INST_Q4_0 LLM and running completion ───');
  let lastPct = -1;
  const llmModelId = await loadModel({
    modelSrc: LLAMA_3_2_1B_INST_Q4_0,
    onProgress: (progress) => {
      const pct = Math.floor(progress.percentage);
      if (pct !== lastPct && pct % 10 === 0) {
        process.stdout.write(`\r   Loading LLM: ${pct}%   `);
        lastPct = pct;
      }
    },
  });
  console.log('\n✅ LLM loaded, modelId:', llmModelId);
  console.log('\n─── Running streamed completion ───');

  const result = completion({
    modelId: llmModelId,
    history: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  let fullText = '';
  process.stdout.write('🤖 LLM output: ');

  for await (const token of result.tokenStream) {
    process.stdout.write(token);
    fullText += token;
  }

  console.log('\n✅ Completion finished\n');

  // ── Clean up & Parse JSON ───────────────────────────────────────────────────
  await unloadModel({ modelId: llmModelId });
  console.log('✅ LLM model unloaded\n');

  let analysis = extractJSON(fullText);

  if (!analysis) {
    console.warn('⚠️  Could not parse JSON from LLM output — using fallback');
    analysis = buildFallback(fullText);
  } else {
    // Ensure required fields exist with defaults
    analysis = {
      canSolve: Boolean(analysis.canSolve ?? false),
      confidence: Number(analysis.confidence ?? 0),
      difficulty: analysis.difficulty || 'Unknown',
      estimatedHours: Number(analysis.estimatedHours ?? 0),
      approach: analysis.approach || '',
      requiredSkills: Array.isArray(analysis.requiredSkills) ? analysis.requiredSkills : [],
      missingSkills: Array.isArray(analysis.missingSkills) ? analysis.missingSkills : [],
      firstStep: analysis.firstStep || '',
      warningFlags: analysis.warningFlags || '',
    };
    console.log('✅ JSON parsed successfully');
  }

  console.log('\n╔═════════════════════════════════════════════╗');
  console.log('║  Analysis Complete!                           ║');
  console.log(`║  canSolve  : ${String(analysis.canSolve).padEnd(28)} ║`);
  console.log(`║  confidence: ${String(analysis.confidence + '%').padEnd(28)} ║`);
  console.log(`║  difficulty: ${String(analysis.difficulty).padEnd(28)} ║`);
  console.log(`║  est. hours: ${String(analysis.estimatedHours + 'h').padEnd(28)} ║`);
  console.log('╚═════════════════════════════════════════════╝\n');

  return analysis;
}
