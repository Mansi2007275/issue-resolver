import { NextResponse } from 'next/server';
import { parseGitHubIssueURL } from '../../../lib/github.js';
import {
  loadBackendModules,
  readMetaFile,
  metaToIssue,
} from '../../../lib/backend.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, skills = [] } = body;

    if (!url) {
      return NextResponse.json({ error: 'Missing issue URL' }, { status: 400 });
    }

    let owner, repo, issueNumber;
    try {
      ({ owner, repo, issueNumber } = parseGitHubIssueURL(url));
    } catch (parseErr) {
      return NextResponse.json({ error: parseErr.message }, { status: 400 });
    }

    const userSkills = Array.isArray(skills)
      ? skills.map((s) => String(s).trim()).filter(Boolean)
      : [];

    const { ingestIssue, analyzeIssue } = await loadBackendModules();

    const ingestResult = await ingestIssue(owner, repo, issueNumber);
    const meta = await readMetaFile(ingestResult.metaPath);
    const issueTitle = meta.title || `Issue #${issueNumber} from ${owner}/${repo}`;

    const analysis = await analyzeIssue(
      ingestResult.workspace,
      issueTitle,
      userSkills
    );

    return NextResponse.json({
      workspace: ingestResult.workspace,
      chunks: ingestResult.chunks,
      issue: metaToIssue(meta, url.trim()),
      analysis,
    });
  } catch (err) {
    console.error('[api/analyze]', err);
    return NextResponse.json(
      { error: err.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
