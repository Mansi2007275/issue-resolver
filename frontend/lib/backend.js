import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '../../backend');

const BACKEND_URL = 'http://127.0.0.1:3002';

/**
 * Fetch wrapper that converts ECONNREFUSED / "fetch failed" errors into
 * a human-readable message telling the user to start the backend server.
 */
export async function backendFetch(path, init) {
  try {
    return await fetch(`${BACKEND_URL}${path}`, init);
  } catch (err) {
    console.error('[backendFetch error details]', {
      message: err.message,
      code: err.code,
      cause: err.cause,
      stack: err.stack,
    });
    const isNetworkErr =
      err.cause?.code === 'ECONNREFUSED' ||
      err.message?.includes('fetch failed') ||
      err.message?.includes('ECONNREFUSED');
    if (isNetworkErr) {
      throw new Error(
        'Backend server is not running. Please start it with: npm run dev (from the project root). ' +
        'The backend must be running on port 3002.'
      );
    }
    throw err;
  }
}

export async function loadBackendModules() {
  return {
    ingestIssue: async (owner, repo, issueNumber) => {
      const response = await backendFetch('/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, issueNumber }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Ingest failed (HTTP ${response.status})`);
      }
      return response.json();
    },
    analyzeIssue: async (workspace, issueTitle, userSkills) => {
      const response = await backendFetch('/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace, issueTitle, userSkills }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (HTTP ${response.status})`);
      }
      return response.json();
    },
  };
}

export async function readMetaFile(metaPath) {
  try {
    const content = await readFile(metaPath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error(`[readMetaFile] error reading ${metaPath}:`, err);
    return {};
  }
}

export function metaToIssue(meta, url) {
  const labels = meta.labels
    ? String(meta.labels)
        .split(',')
        .map((l) => l.trim())
        .filter(Boolean)
    : [];

  return {
    title: meta.title || '',
    url: url || `https://github.com/${meta.owner}/${meta.repo}/issues/${meta.issueNumber}`,
    repo: meta.owner && meta.repo ? `${meta.owner}/${meta.repo}` : '',
    state: meta.state || 'open',
    labels,
    commentsCount: meta.commentsCount ?? 0,
  };
}

export async function findMetaByWorkspace(workspace) {
  try {
    // workspace format: "issue-{owner}-{repo}-{issueNumber}"
    // issueNumber is the last segment after the final "-"
    const segments = workspace.split('-');
    const issueNumber = segments[segments.length - 1];
    
    if (!issueNumber) return null;
    
    const metaPath = path.join(BACKEND_DIR, `issue-${issueNumber}-meta.json`);
    const content = await readFile(metaPath, 'utf-8');
    return JSON.parse(content);
  } catch (_) {
    return null;
  }
}
