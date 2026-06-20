import http from 'node:http';
import { ingestIssue } from './ingest.js';
import { analyzeIssue } from './analyze.js';

const PORT = 3002;

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => {
      reject(err);
    });
  });
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', port: PORT }));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/ingest') {
      const body = await parseJsonBody(req);
      const { owner, repo, issueNumber } = body;

      if (!owner || !repo || !issueNumber) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing owner, repo, or issueNumber' }));
        return;
      }

      const result = await ingestIssue(owner, repo, parseInt(issueNumber, 10));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/analyze') {
      const body = await parseJsonBody(req);
      const { workspace, issueTitle, userSkills } = body;

      if (!workspace || !issueTitle) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing workspace or issueTitle' }));
        return;
      }

      const result = await analyzeIssue(workspace, issueTitle, userSkills || []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(result));
      return;
    }

    // 404 Route Not Found
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  } catch (err) {
    console.error('[server error]', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
  }
});

server.listen(PORT, () => {
  console.clear();
  console.log(`==================================================`);
  console.log(` PrivateBounty AI Standalone Server Running`);
  console.log(` Port: ${PORT}`);
  console.log(` URL : http://localhost:${PORT}`);
  console.log(`==================================================`);
  console.log(` Routes:`);
  console.log(`   GET  /health`);
  console.log(`   POST /ingest`);
  console.log(`   POST /analyze`);
  console.log(`==================================================`);
});
