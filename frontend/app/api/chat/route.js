import {
  completion,
  loadModel,
  unloadModel,
  LLAMA_3_2_1B_INST_Q4_0,
} from '@qvac/sdk'
import { findMetaByWorkspace } from '../../../lib/backend.js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

const PRESET_HINTS = {
  files: 'Focus on which specific files and directories to inspect first.',
  test: 'Focus on a practical testing strategy and test cases.',
  subtasks: 'Break the work into ordered subtasks with time estimates.',
  pr: 'Write a complete pull request description with title, problem, solution, and testing sections.',
}

export async function POST(request) {
  let modelId = null

  try {
    const body = await request.json()
    const {
      message,
      preset = null,
      workspace,
      skills = [],
      history = [],
    } = body

    if (!message?.trim()) {
      return new Response('Missing message', { status: 400 })
    }

    const meta = workspace ? await findMetaByWorkspace(workspace) : null
    const skillsStr = Array.isArray(skills) ? skills.join(', ') : ''
    const presetHint = preset ? PRESET_HINTS[preset] || '' : ''

    const issueContext = meta
      ? `Issue: "${meta.title}" (${meta.owner}/${meta.repo}#${meta.issueNumber})
State: ${meta.state}
Labels: ${meta.labels || 'none'}`
      : 'No issue context available.'

    const systemPrompt = `You are PrivateBounty AI — an expert software engineer assistant running 100% on-device via QVAC SDK.
Help the developer understand and solve a GitHub issue. Be specific, practical, and concise.
${presetHint}

${issueContext}
Developer skills: ${skillsStr || 'not specified'}`

    const chatHistory = [
      { role: 'system', content: systemPrompt },
      ...history
        .filter((m) => m.role && m.content)
        .map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message.trim() },
    ]

    modelId = await loadModel({ modelSrc: LLAMA_3_2_1B_INST_Q4_0 })
    const result = completion({ modelId, history: chatHistory })

    const encoder = new TextEncoder()
    const currentModelId = modelId

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const token of result.tokenStream) {
            controller.enqueue(encoder.encode(token))
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(`\n\n[Error: ${err.message || 'Generation failed'}]`)
          )
        } finally {
          try {
            await unloadModel({ modelId: currentModelId })
          } catch (_) {}
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[api/chat]', err)
    if (modelId) {
      try {
        await unloadModel({ modelId })
      } catch (_) {}
    }
    return new Response(err.message || 'Chat failed', { status: 500 })
  }
}
