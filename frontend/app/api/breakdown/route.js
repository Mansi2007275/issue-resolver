// import { NextResponse } from 'next/server'
// import { findMetaByWorkspace, backendFetch } from '../../../lib/backend.js'

// export const runtime = 'nodejs'
// export const dynamic = 'force-dynamic'
// export const maxDuration = 300

// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url)
//     const workspace = searchParams.get('workspace')
//     const skills = searchParams.get('skills')
//     const issueTitle = searchParams.get('issueTitle')

//     if (!workspace) {
//       return NextResponse.json({ error: 'Missing workspace' }, { status: 400 })
//     }

//     // Resolve the issue title from meta if not supplied in query
//     let resolvedTitle = issueTitle || ''
//     if (!resolvedTitle) {
//       try {
//         const meta = await findMetaByWorkspace(workspace)
//         resolvedTitle = meta?.title || workspace
//       } catch (_) {
//         resolvedTitle = workspace
//       }
//     }

//     // Resolve skills list
//     const userSkills = skills
//       ? skills.split(',').map((s) => s.trim()).filter(Boolean)
//       : []

//     // Proxy to backend — NEVER fall back to hardcoded numbers
//     const backendRes = await backendFetch('/breakdown', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         workspace,
//         issueTitle: resolvedTitle,
//         userSkills,
//       }),
//     })

//     if (!backendRes.ok) {
//       let errMsg = 'Could not generate breakdown, please try again'
//       try {
//         const errData = await backendRes.json()
//         errMsg = errData.error || errMsg
//       } catch (_) {}
//       return NextResponse.json({ error: errMsg }, { status: backendRes.status })
//     }

//     const data = await backendRes.json()
//     return NextResponse.json(data)
//   } catch (err) {
//     console.error('[api/breakdown]', err)
//     return NextResponse.json(
//       { error: err.message || 'Could not generate breakdown, please try again' },
//       { status: 500 }
//     )
//   }
// }

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ error: 'Breakdown unavailable' }, { status: 503 })
}

export async function POST() {
  return NextResponse.json({ error: 'Breakdown unavailable' }, { status: 503 })
}