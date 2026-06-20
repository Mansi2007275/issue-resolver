import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_DIR = path.resolve(__dirname, '../../backend');

export async function loadBackendModules() {
  return {
    ingestIssue: async (owner, repo, issueNumber) => {
      const response = await fetch('http://localhost:3002/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, repo, issueNumber })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    analyzeIssue: async (workspace, issueTitle, userSkills) => {
      const response = await fetch('http://localhost:3002/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace, issueTitle, userSkills })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error! status: ${response.status}`);
      }
      return response.json();
    }
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
