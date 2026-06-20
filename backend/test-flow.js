/**
 * test-flow.js — PrivateBounty AI
 *
 * CLI end-to-end test runner.
 *
 * Usage:
 *   node test-flow.js <github-issue-url> "<skills>"
 *
 * Examples:
 *   node test-flow.js https://github.com/facebook/react/issues/1 "JavaScript,React"
 *   node test-flow.js https://github.com/expressjs/express/issues/3 "Node.js,JavaScript"
 */

import { ingestIssue } from './ingest.js';
import { analyzeIssue } from './analyze.js';

// ── Argument Parsing ───────────────────────────────────────────────────────

function printUsage() {
  console.log('\nUsage:');
  console.log('  node test-flow.js <github-issue-url> "<comma-separated-skills>"\n');
  console.log('Examples:');
  console.log('  node test-flow.js https://github.com/facebook/react/issues/1 "JavaScript,React"');
  console.log('  node test-flow.js https://github.com/expressjs/express/issues/3 "Node.js,JavaScript"\n');
}

/**
 * Parse a GitHub issue URL and extract owner, repo, issueNumber.
 * Supports:
 *   https://github.com/owner/repo/issues/123
 *   github.com/owner/repo/issues/123
 * @param {string} url
 * @returns {{ owner: string, repo: string, issueNumber: number }}
 */
function parseGitHubIssueURL(url) {
  // Normalise — strip protocol if present
  const clean = url.replace(/^https?:\/\//, '').replace(/^github\.com\//, '');
  // Expected shape: owner/repo/issues/number
  const match = clean.match(/^([^/]+)\/([^/]+)\/issues\/(\d+)/);
  if (!match) {
    throw new Error(
      `Cannot parse GitHub issue URL: "${url}"\n` +
      'Expected format: https://github.com/<owner>/<repo>/issues/<number>'
    );
  }
  return {
    owner: match[1],
    repo: match[2],
    issueNumber: parseInt(match[3], 10),
  };
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1 || args[0] === '--help' || args[0] === '-h') {
    printUsage();
    process.exit(args.length < 1 ? 1 : 0);
  }

  const issueUrl = args[0];
  const rawSkills = args[1] || 'JavaScript';

  // Parse skills — accept comma, semicolon or space separated
  const userSkills = rawSkills
    .split(/[,;]+/)
    .map(s => s.trim())
    .filter(Boolean);

  // Parse GitHub URL
  let owner, repo, issueNumber;
  try {
    ({ owner, repo, issueNumber } = parseGitHubIssueURL(issueUrl));
  } catch (err) {
    console.error(`❌ URL parse error: ${err.message}`);
    printUsage();
    process.exit(1);
  }

  console.log('\n🚀 PrivateBounty AI — End-to-End Test Flow');
  console.log('═'.repeat(50));
  console.log(`   GitHub URL    : ${issueUrl}`);
  console.log(`   Owner         : ${owner}`);
  console.log(`   Repo          : ${repo}`);
  console.log(`   Issue Number  : ${issueNumber}`);
  console.log(`   User Skills   : ${userSkills.join(', ')}`);
  console.log('═'.repeat(50));

  // ── Phase 1: Ingest ──────────────────────────────────────────────────────
  console.log('\n[Phase 1] Ingesting issue into local vector index…\n');
  let ingestResult;
  try {
    ingestResult = await ingestIssue(owner, repo, issueNumber);
  } catch (err) {
    console.error(`\n❌ Ingest failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }

  console.log(`\n✅ Ingest complete — workspace: "${ingestResult.workspace}", chunks: ${ingestResult.chunks}`);

  // ── Phase 2: Analyze ─────────────────────────────────────────────────────
  console.log('\n[Phase 2] Analyzing issue against your skills…\n');

  // Load issue title from meta file for the query
  let issueTitle = `Issue #${issueNumber} from ${owner}/${repo}`;
  try {
    const { readFile } = await import('node:fs/promises');
    const metaRaw = await readFile(ingestResult.metaPath, 'utf8');
    const meta = JSON.parse(metaRaw);
    if (meta.title) issueTitle = meta.title;
  } catch (_) {
    // Best-effort; title fallback is fine
  }

  let analysis;
  try {
    analysis = await analyzeIssue(ingestResult.workspace, issueTitle, userSkills);
  } catch (err) {
    console.error(`\n❌ Analysis failed: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  }

  // ── Final Output ─────────────────────────────────────────────────────────
  console.log('\n╔═══════════════════════════════════════════════════════╗');
  console.log('║          PrivateBounty AI — Final Analysis Result       ║');
  console.log('╚═══════════════════════════════════════════════════════╝\n');
  console.log(JSON.stringify(analysis, null, 2));
  console.log('\n✅ Test flow complete. 100% on-device. No cloud. No API keys.\n');
}

main().catch(err => {
  console.error('\n💥 Unexpected error:', err);
  process.exit(1);
});
