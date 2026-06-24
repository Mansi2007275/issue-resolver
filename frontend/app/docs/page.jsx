'use client'

import PageHeader from '../components/PageHeader'
import CodeBlock from '../components/CodeBlock'
import { FileText, Cpu, Check, AlertTriangle, Link2, ExternalLink } from 'lucide-react'

export default function DocsPage() {
  const qvacFeatures = [
    {
      name: 'completion()',
      badge: 'function',
      desc: 'Runs the Qwen3 4B model on-device to generate the structured JSON analysis from the issue context + skills',
    },
    {
      name: 'loadModel()',
      badge: 'function',
      desc: 'Loads QWEN3_4B_INST_Q4_K_M with ctx_size: 4096 configuration to handle full issue context prompts',
    },
    {
      name: 'unloadModel()',
      badge: 'function',
      desc: 'Releases the model from memory after each analysis request to free up RAM',
    },
    {
      name: 'QWEN3_4B_INST_Q4_K_M',
      badge: 'constant',
      desc: 'The model constant referencing the Qwen3 4B Q4_K_M quantized model — ~2.5GB download, runs on CPU',
    },
  ]

  const apiRoutes = [
    {
      method: 'POST',
      route: '/api/analyze',
      input: `{ url: "github issue url", skills: ["React", "Node.js"] }`,
      output: `{ workspace, issue, analysis: { canSolve, confidence... } }`,
    },
    {
      method: 'POST',
      route: '/api/chat',
      input: `{ message, workspace, skills, history }`,
      output: `{ reply: "AI response text" }`,
    },
    {
      method: 'GET',
      route: '/api/breakdown',
      input: `None`,
      output: `{ error: "Breakdown unavailable" }`,
      note: 'Coming in next version',
    },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px 80px 24px', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader
        title="Documentation"
        subtitle="Everything you need to run PrivateBounty AI locally"
      />

      {/* Section 1: Quick Start */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#14532d', marginBottom: '16px', fontWeight: 'bold' }}>
          Quick Start
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Step 1 */}
          <div style={{ border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#14532d', fontSize: '14px' }}>Clone the repository</span>
                <CodeBlock code={`git clone https://github.com/Mansi2007275/issue-resolver\ncd issue-resolver`} />
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div style={{ border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#14532d', fontSize: '14px' }}>Install backend dependencies</span>
                <CodeBlock code={`cd backend\nnpm install`} />
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div style={{ border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#14532d', fontSize: '14px' }}>Start the backend server</span>
                <CodeBlock code={`node server.js`} />
                <p style={{ fontSize: '11px', color: '#4b7a5a', margin: '4px 0 0 0' }}>
                  Note: First time running the Analyze feature will download the Qwen3 4B model (~2.5GB). This is cached after first download.
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div style={{ border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                4
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#14532d', fontSize: '14px' }}>Install and start frontend</span>
                <CodeBlock code={`cd ../frontend\nnpm install\nnpm run dev`} />
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div style={{ border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px', backgroundColor: '#ffffff' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                5
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, color: '#14532d', fontSize: '14px' }}>Open in browser</span>
                <CodeBlock code={`http://localhost:3000`} />
                <p style={{ fontSize: '11px', color: '#4b7a5a', margin: '4px 0 0 0' }}>
                  Note: Paste any public GitHub issue URL and click Analyze!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Hardware Requirements */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#14532d', marginBottom: '16px', fontWeight: 'bold' }}>
          Hardware Requirements
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #bbf7d0', backgroundColor: '#ffffff' }}>
            <thead>
              <tr style={{ backgroundColor: '#ffffff', borderBottom: '2px solid #bbf7d0' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#14532d', borderRight: '1px solid #bbf7d0' }}>Component</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#14532d', borderRight: '1px solid #bbf7d0' }}>Minimum</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#14532d' }}>Recommended</th>
              </tr>
            </thead>
            <tbody>
              {[
                { component: 'CPU', min: 'Any modern CPU', rec: '4+ cores' },
                { component: 'RAM', min: '8GB', rec: '16GB' },
                { component: 'Storage', min: '5GB free', rec: '10GB free' },
                { component: 'GPU', min: 'Not required', rec: 'Optional (speeds up inference)' },
                { component: 'OS', min: 'Win/Mac/Linux', rec: 'Windows 11 tested' },
                { component: 'Node.js', min: 'v22.17+', rec: 'v22.17+' },
              ].map((row, i) => (
                <tr
                  key={i}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#f0fdf4' : '#ffffff',
                    borderBottom: '1px solid #bbf7d0',
                  }}
                >
                  <td style={{ padding: '12px', color: '#14532d', borderRight: '1px solid #bbf7d0', fontWeight: 'bold' }}>{row.component}</td>
                  <td style={{ padding: '12px', color: '#4b7a5a', borderRight: '1px solid #bbf7d0' }}>{row.min}</td>
                  <td style={{ padding: '12px', color: '#4b7a5a' }}>{row.rec}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 3: QVAC SDK Features Used */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#14532d', marginBottom: '16px', fontWeight: 'bold' }}>
          QVAC SDK Features Used
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {qvacFeatures.map((item, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderLeft: '3px solid #16a34a',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 'bold', color: '#14532d' }}>
                  {item.name}
                </span>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '2px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {item.badge}
                </span>
              </div>
              <p style={{ color: '#4b7a5a', fontSize: '12px', margin: 0, lineHeight: 1.4 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: API Routes */}
      <section style={{ marginBottom: '40px' }}>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#14532d', marginBottom: '16px', fontWeight: 'bold' }}>
          API Routes
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {apiRoutes.map((route, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                padding: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span
                  style={{
                    backgroundColor: route.method === 'GET' ? '#e2e8f0' : '#16a34a',
                    color: route.method === 'GET' ? '#475569' : '#ffffff',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    padding: '3px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {route.method}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '14px', fontWeight: 'bold', color: '#14532d' }}>
                  {route.route}
                </span>
                {route.note && (
                  <span style={{ fontSize: '11px', color: '#d97706', fontStyle: 'italic', marginLeft: 'auto' }}>
                    {route.note}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#86efac', fontWeight: 600 }}>Input:</span>
                  <pre style={{ margin: '4px 0 0 0', backgroundColor: '#f0fdf4', padding: '6px', borderRadius: '4px', overflowX: 'auto', fontFamily: 'monospace' }}>{route.input}</pre>
                </div>
                <div>
                  <span style={{ color: '#16a34a', fontWeight: 600 }}>Output:</span>
                  <pre style={{ margin: '4px 0 0 0', backgroundColor: '#f0fdf4', padding: '6px', borderRadius: '4px', overflowX: 'auto', fontFamily: 'monospace' }}>{route.output}</pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: Useful Links */}
      <section>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#14532d', marginBottom: '16px', fontWeight: 'bold' }}>
          Useful Links
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {[
            { label: 'QVAC SDK Docs', url: 'https://docs.qvac.tether.io' },
            { label: 'QVAC Models on HuggingFace', url: 'https://huggingface.co/collections/qvac/medpsy' },
            { label: 'GitHub Repository', url: 'https://github.com/Mansi2007275/issue-resolver' },
            { label: 'DoraHacks Hackathon', url: 'https://dorahacks.io/hackathon/qvac-unleach-edge-ai-i/detail' },
          ].map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#14532d',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dcfce7'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link2 size={16} style={{ color: '#16a34a' }} />
                <span style={{ fontWeight: 500, fontSize: '13px' }}>{link.label}</span>
              </div>
              <ExternalLink size={14} style={{ color: '#86efac' }} />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
