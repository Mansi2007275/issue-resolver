import { NextResponse } from 'next/server'
import { findMetaByWorkspace } from '../../../lib/backend.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const workspace = searchParams.get('workspace')

    if (!workspace) {
      return NextResponse.json({ error: 'Missing workspace' }, { status: 400 })
    }

    const meta = await findMetaByWorkspace(workspace)
    if (!meta) {
      return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
    }

    const chunks = meta.chunksCount || 4
    const skillMatch = 75
    const issueClarity = meta.title && meta.title.length > 20 ? 70 : 55
    const codebaseSize = chunks > 6 ? 45 : chunks > 3 ? 65 : 80
    const priorExperience = 50

    const steps = [
      `Read issue #${meta.issueNumber} and reproduce the described problem`,
      'Identify relevant source files in the repository',
      'Implement the fix following project conventions',
      'Add or update tests and verify locally',
    ]

    return NextResponse.json({
      breakdown: {
        skillMatch,
        issueClarity,
        codebaseSize,
        priorExperience,
      },
      subtasks: steps.map((text, i) => ({
        id: i + 1,
        text,
        hours: Math.max(1, Math.round(8 / steps.length)),
      })),
      prDraft: {
        title: `fix: ${meta.title}`,
        problem: meta.title,
        solution:
          'Address the root cause described in the issue with a minimal, focused change.',
        testing:
          'Run the existing test suite. Add regression tests covering the fixed behavior.',
      },
    })
  } catch (err) {
    console.error('[api/breakdown]', err)
    return NextResponse.json(
      { error: err.message || 'Breakdown failed' },
      { status: 500 }
    )
  }
}
