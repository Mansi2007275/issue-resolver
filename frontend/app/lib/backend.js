import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { readdir, readFile } from 'node:fs/promises'

export function getBackendDir() {
  return path.join(process.cwd(), '..', 'backend')
}

export async function loadBackendModules() {
  const backendRoot = getBackendDir()
  const ingestMod = await import(
    pathToFileURL(path.join(backendRoot, 'ingest.js')).href
  )
  const analyzeMod = await import(
    pathToFileURL(path.join(backendRoot, 'analyze.js')).href
  )
  return {
    ingestIssue: ingestMod.ingestIssue,
    analyzeIssue: analyzeMod.analyzeIssue,
  }
}

export async function readMetaFile(metaPath) {
  const raw = await readFile(metaPath, 'utf8')
  return JSON.parse(raw)
}

export async function findMetaByWorkspace(workspace) {
  const backendRoot = getBackendDir()
  const files = await readdir(backendRoot)
  for (const file of files) {
    if (!file.startsWith('issue-') || !file.endsWith('-meta.json')) continue
    try {
      const meta = await readMetaFile(path.join(backendRoot, file))
      if (meta.workspace === workspace) return meta
    } catch (_) {
      // skip invalid meta files
    }
  }
  return null
}

export function metaToIssue(meta, url) {
  const labels = meta.labels
    ? String(meta.labels)
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)
    : []

  return {
    title: meta.title,
    url: url || `https://github.com/${meta.owner}/${meta.repo}/issues/${meta.issueNumber}`,
    repo: `${meta.owner}/${meta.repo}`,
    state: meta.state,
    labels,
    commentsCount: meta.commentsCount ?? 0,
  }
}
export async function backendFetch(path, options = {}) {
  const res = await fetch(`http://127.0.0.1:3002${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `Backend error: ${res.status}`)
  }
  return res
}
