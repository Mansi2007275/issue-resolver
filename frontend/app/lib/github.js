/**
 * Parse a GitHub issue URL into owner, repo, issueNumber.
 */
export function parseGitHubIssueURL(url) {
  const clean = String(url || '')
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/^github\.com\//, '')

  const match = clean.match(/^([^/]+)\/([^/]+)\/issues\/(\d+)/)
  if (!match) {
    throw new Error(
      'Invalid GitHub issue URL. Expected: https://github.com/owner/repo/issues/123'
    )
  }

  return {
    owner: match[1],
    repo: match[2],
    issueNumber: parseInt(match[3], 10),
  }
}
