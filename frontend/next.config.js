/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep QVAC SDK and SQLite out of Next.js bundler — they're native/WASM
  serverExternalPackages: ['@qvac/sdk', '@sqliteai/sqlite-wasm'],
  // Include backend scripts in server bundle tracing (production deploys)
  outputFileTracingIncludes: {
    '/api/analyze': ['./../backend/**/*'],
    '/api/chat': ['./../backend/**/*'],
    '/api/breakdown': ['./../backend/**/*'],
  },
  // Allow cross-origin images from GitHub
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'github.com' },
    ],
  },
}

export default nextConfig
