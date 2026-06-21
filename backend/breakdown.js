/**
 * breakdown.js — PrivateBounty AI
 * Retrieves context chunks and runs LLaMA 3.2 1B to produce a
 * genuine AI-scored confidence breakdown, subtask list, and PR draft.
 *
 * Export: async function breakdownIssue(workspace, issueTitle, userSkills)
 */

import { loadModel, unloadModel, completion, QWEN3_4B_INST_Q4_K_M } from '@qvac/sdk';
import sqlite3InitModule from '@sqliteai/sqlite-wasm';
import { existsSync, readFileSync } from 'node:fs';

const DB_PATH = 'C:\\Users\\yadav\\AppData\\Local\\PrivateBountyAI\\bounty-index.db';

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Strip <think>...</think> blocks that Qwen3 emits in thinking mode.
 */
function stripThinkTags(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

function extractJSON(text) {
  try {
    return JSON.parse(text.trim());
  } catch (_) {}
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch (_) {}
  }
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
  const contextChunks = [];
  try {
    db.exec({
      sql: `SELECT text FROM "${safeWorkspace}" ORDER BY chunk_idx ASC`,
      rowMode: 'object',
      callback: (row) => contextChunks.push(row),
    });
  } catch (err) {
    console.warn('⚠️  [breakdown] Could not retrieve chunks:', err.message);
  }
  db.close();
  return contextChunks;
}

async function runCompletion(llmModelId, systemPrompt, userPrompt) {
  const run = completion({
    modelId: llmModelId,
    history: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });
  let fullText = '';
  process.stdout.write('🤖 [breakdown] LLM output: ');
  for await (const e of run.events) {
    if (e.type === 'contentDelta') {
      process.stdout.write(e.text);
      fullText += e.text;
    }
  }
  console.log('\n✅ [breakdown] Completion finished');
  return fullText;
}

// ── Main Export ────────────────────────────────────────────────────────────

/**
 * Generate a full AI-scored confidence breakdown for a GitHub issue.
 *
 * @param {string}   workspace    Workspace name
 * @param {string}   issueTitle   Issue title
 * @param {string[]} userSkills   Developer skill list
 * @returns {Promise<object>}     Breakdown object with scores, subtasks, prDraft
 */
export async function breakdownIssue(workspace, issueTitle, userSkills) {
  if (!existsSync(DB_PATH)) {
    throw new Error(`Database not found at ${DB_PATH}. Run ingest first.`);
  }

  const safeWorkspace = workspace.replace(/[^a-zA-Z0-9_]/g, '_');

  console.log('\n╔═══════════════════════════════════════════════════╗');
  console.log('║  PrivateBounty AI — Breakdown Pipeline Starting   ║');
  console.log('╚═══════════════════════════════════════════════════╝\n');
  console.log(`📌 Workspace   : ${workspace}`);
  console.log(`📋 Issue Title : ${issueTitle}`);
  console.log(`🛠  User Skills : ${Array.isArray(userSkills) ? userSkills.join(', ') : userSkills}\n`);

  // Step 1: Load context chunks
  console.log('─── Step 1/3: Loading context chunks from SQLite ───');
  const contextChunks = await loadContextChunks(safeWorkspace);
  console.log(`✅ Retrieved ${contextChunks.length} context chunks`);

  const context = contextChunks.map((c, i) => `[Context ${i + 1}]\n${c.text}`).join('\n\n');
  const skillsStr = Array.isArray(userSkills) ? userSkills.join(', ') : userSkills;

  // Step 2: Build prompt
  console.log('─── Step 2/3: Building breakdown prompt ───');

  const systemPrompt = `You are an expert software engineering mentor evaluating a GitHub issue for a developer.
You MUST respond ONLY with a valid JSON object — no markdown, no code fences, no explanatory text.
Base every single score and every piece of text ONLY on the issue content provided.`;

  const buildPrompt = (strict = false) => {
    const strictNote = strict
      ? `\n\nIMPORTANT: Your previous response was rejected for containing generic, templated, or placeholder text. You MUST produce real, specific content derived entirely from the issue context above. No placeholders, no generic phrases.`
      : '';

    return `ISSUE TITLE: ${issueTitle}

ISSUE CONTEXT:
${context}

DEVELOPER SKILLS: ${skillsStr}

Base every score and every piece of text on the ACTUAL issue context provided above. Do not use generic, templated, or placeholder values. Reason about the SPECIFIC content of this issue.

Respond with ONLY a valid JSON object in this exact shape:

{
  "skillMatch": <0-100 integer: genuinely assess how well the developer's listed skills match what THIS specific issue requires. Consider the actual technologies, domain, and tasks described.>,
  "issueClarity": <0-100 integer: genuinely assess how clearly and completely THIS specific issue is written. High = well-specified with steps to reproduce, expected behavior, and clear scope. Low = vague.>,
  "codebaseComplexity": <0-100 integer: genuinely assess how complex the codebase changes implied by THIS issue likely are. Consider the scope, number of files, and technical depth described.>,
  "priorArtNeeded": <0-100 integer: genuinely assess how much solving this requires understanding of the EXISTING codebase vs being a fresh addition. High = needs deep understanding of existing code.>,
  "subtasks": [
    {
      "task": "<a REAL specific subtask derived from what this issue actually asks for — reference actual actions, files, or components from the issue>",
      "hours": <realistic integer hours for this subtask>
    }
  ],
  "prDraft": {
    "title": "<a real, specific PR title that describes the actual change needed for this issue>",
    "problem": "<2-3 sentences describing the actual problem stated in this issue context — be specific>",
    "solution": "<2-3 sentences describing the actual proposed solution based on what this issue asks for — be specific>",
    "testing": "<specific testing approach for THIS issue — reference actual components, endpoints, or behaviors from the issue>"
  }
}

Rules:
- subtasks array must have 3-5 items, each one specific to this issue
- All text fields must reference real details from the issue context
- No generic phrases like "fix the bug" or "implement the feature" without specifics
- skillMatch, issueClarity, codebaseComplexity, priorArtNeeded must each be independently reasoned integers${strictNote}`.trim();
  };

  console.log('✅ Prompt constructed');

  // Step 3: Load LLM and run with retry
  console.log('─── Step 3/3: Loading QWEN3 4B LLM and running breakdown ───');
  console.log('⏳ Loading QWEN3 4B model — this is a larger model, first download may take 5-10+ minutes depending on internet speed. Please wait...');
  let cachedModelId = null;

  // Helper to unload any previously loaded model to ensure new config takes effect
  async function reloadModel() {
    if (cachedModelId) {
      try { await unloadModel({ modelId: cachedModelId }); console.log('🔄 Unloaded previous model'); } catch (e) {
        console.warn('⚠️ Could not unload previous model (ignored):', e.message || e);
      }
      cachedModelId = null;
    }
    const modelId = await loadModel({
      modelSrc: QWEN3_4B_INST_Q4_K_M,
      modelConfig: { ctx_size: 4096 },
      onProgress: (p) => {
        const pct = Math.floor(p.percentage);
        if (pct % 10 === 0) process.stdout.write(`\r Loading: ${pct}% `);
      },
    });
    cachedModelId = modelId;
    console.log('\n✅ Model loaded');
    return modelId;
  }

  const llmModelId = await reloadModel();

  let breakdown = null;
  let attempt = 0;

  while (attempt < 2 && !breakdown) {
    attempt++;
    console.log(`\n─── Breakdown attempt ${attempt}/2 ───`);
    const rawText = await runCompletion(llmModelId, systemPrompt, buildPrompt(attempt > 1));
    if (!rawText || rawText.trim().length === 0) {
      console.warn('⚠️ Empty LLM output, retrying');
      continue;
    }
    const cleaned = stripThinkTags(rawText);
    const parsed = extractJSON(cleaned);

    if (!parsed) {
      console.warn(`⚠️  Attempt ${attempt}: Could not parse JSON`);
      continue;
    }

    // Validate all required scoring fields are present as numbers
    const hasScores =
      typeof parsed.skillMatch === 'number' &&
      typeof parsed.issueClarity === 'number' &&
      typeof parsed.codebaseComplexity === 'number' &&
      typeof parsed.priorArtNeeded === 'number';

    if (!hasScores) {
      console.warn(`⚠️  Attempt ${attempt}: Missing required scoring fields`);
      if (attempt < 2) continue;
    }

    breakdown = {
      skillMatch: Math.min(100, Math.max(0, Number(parsed.skillMatch ?? 0))),
      issueClarity: Math.min(100, Math.max(0, Number(parsed.issueClarity ?? 0))),
      codebaseComplexity: Math.min(100, Math.max(0, Number(parsed.codebaseComplexity ?? 0))),
      priorArtNeeded: Math.min(100, Math.max(0, Number(parsed.priorArtNeeded ?? 0))),
      subtasks: Array.isArray(parsed.subtasks)
        ? parsed.subtasks.slice(0, 5).map((s, i) => ({
            id: i + 1,
            text: String(s.task || s.text || ''),
            hours: Math.max(1, Number(s.hours ?? 2)),
          }))
        : [],
      prDraft: {
        title: String(parsed.prDraft?.title || ''),
        problem: String(parsed.prDraft?.problem || ''),
        solution: String(parsed.prDraft?.solution || ''),
        testing: String(parsed.prDraft?.testing || ''),
      },
    };
    console.log('✅ Breakdown JSON parsed successfully');
    console.log(`   skillMatch       : ${breakdown.skillMatch}`);
    console.log(`   issueClarity     : ${breakdown.issueClarity}`);
    console.log(`   codebaseComplexity: ${breakdown.codebaseComplexity}`);
    console.log(`   priorArtNeeded   : ${breakdown.priorArtNeeded}`);
    console.log(`   subtasks         : ${breakdown.subtasks.length} items`);
  }

  try {
    await unloadModel({ modelId: llmModelId });
    console.log('✅ LLM model unloaded');
  } catch (e) {
    console.warn('⚠️ Could not unload model after breakdown (ignored):', e.message || e);
  }

  if (!breakdown) {
    throw new Error('LLM failed to produce a valid breakdown after 2 attempts.');
  }

  return breakdown;
}
