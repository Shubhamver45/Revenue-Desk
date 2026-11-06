/**
 * Revenue Desk — Node.js Application Server
 * Serves the React.js frontend and coordinates the Switch multi-agent backend.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { spawn } = require('child_process');

const PORT = parseInt(process.env.PORT, 10) || 3000;
const PYTHON_PORT = parseInt(process.env.PYTHON_PORT, 10) || 8000;
const STATIC_DIR = path.join(__dirname, 'src', 'ui');

let pythonProcess = null;

// MIME types for static assets
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.jsx': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.m4a': 'audio/mp4',
    '.wav': 'audio/wav',
    '.webm': 'video/webm',
    '.mp4': 'video/mp4'
};

/**
 * Proxy an API request to the Python backend on localhost:8000
 */
function proxyToPython(req, res) {
    const options = {
        hostname: '127.0.0.1',
        port: PYTHON_PORT,
        path: req.url,
        method: req.method,
        headers: req.headers
    };

    // Remove host header to avoid host matching conflicts
    delete options.headers['host'];

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
        console.warn(`[Node Proxy Warning] Python backend at 127.0.0.1:${PYTHON_PORT} not reached (${err.message}).`);
        // Fallback for health check
        if (req.url.startsWith('/api/health')) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'ok', node_runtime: process.version, react: '18.3.1', python_bridge: 'waiting' }));
            return;
        }
        res.writeHead(502, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Python backend unavailable on 127.0.0.1:' + PYTHON_PORT, details: err.message }));
    });

    req.pipe(proxyReq);
}

/**
 * Serve static files for the React.js client
 */
function serveStaticFile(req, res, pathname) {
    let filePath;
    if (pathname === '/' || pathname === '/index.html' || pathname === '/dashboard') {
        filePath = path.join(STATIC_DIR, 'index.html');
    } else if (pathname === '/video' || pathname === '/video.html' || pathname === '/demo') {
        filePath = path.join(STATIC_DIR, 'video.html');
    } else if (pathname === '/landing' || pathname === '/landing.html') {
        filePath = path.join(STATIC_DIR, 'landing.html');
    } else {
        filePath = path.join(STATIC_DIR, pathname.replace(/^\//, ''));
    }

    // Check if file exists
    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            // Fallback to index.html for SPA routing
            filePath = path.join(STATIC_DIR, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        fs.readFile(filePath, (readErr, data) => {
            if (readErr) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('500 Internal Server Error');
                return;
            }
            res.writeHead(200, {
                'Content-Type': contentType,
                'Cache-Control': 'no-cache',
                'X-Powered-By': 'Node.js ' + process.version + ' / React.js 18'
            });
            res.end(data);
        });
    });
}

// Create HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // CORS headers for modern dev tooling
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 1. Node runtime health endpoint
    if (pathname === '/node/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            service: 'Revenue Desk Node.js Gateway',
            node_version: process.version,
            react_client: 'React 18.3.1 (SPA)',
            uptime_seconds: process.uptime()
        }));
        return;
    }

    // 2. API requests -> proxy to Python Switch backend
    if (pathname.startsWith('/api/')) {
        proxyToPython(req, res);
        return;
    }

    // 3. Static UI assets (React SPA)
    serveStaticFile(req, res, pathname);
});

// Auto-spawn Python backend if needed
function startPythonBackend() {
    console.log('[Node] Checking Python Switch multi-agent backend...');
    const testReq = http.get(`http://127.0.0.1:${PYTHON_PORT}/api/health`, (res) => {
        console.log(`[Node] Existing Python backend detected on port ${PYTHON_PORT} (HTTP ${res.statusCode}).`);
    });

    testReq.on('error', () => {
        console.log(`[Node] Spawning Python Switch backend (python3 app.py) on port ${PYTHON_PORT}...`);
        try {
            pythonProcess = spawn('python3', ['app.py'], {
                cwd: __dirname,
                stdio: 'inherit',
                env: process.env
            });

            pythonProcess.on('error', (err) => {
                console.warn('[Node] Could not auto-spawn Python backend:', err.message);
            });
        } catch (e) {
            console.warn('[Node] Python spawn exception:', e.message);
        }
    });
}

// Graceful shutdown
function shutdown() {
    console.log('\n[Node] Gracefully shutting down Revenue Desk server...');
    if (pythonProcess) {
        pythonProcess.kill('SIGINT');
    }
    server.close(() => {
        console.log('[Node] Server terminated.');
        process.exit(0);
    });
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

server.listen(PORT, '0.0.0.0', () => {
    console.log('================================================================');
    console.log(`⚡ Revenue Desk — React.js + Node.js Server Active`);
    console.log(`🌐 Local URL:     http://localhost:${PORT}`);
    console.log(`🚀 Runtime:       Node.js ${process.version}`);
    console.log(`⚛️  UI Framework:  React 18.3.1 (Modern Declarative Component SPA)`);
    console.log(`🔌 Backend API:   http://127.0.0.1:${PYTHON_PORT}`);
    console.log('================================================================');
    startPythonBackend();
});

