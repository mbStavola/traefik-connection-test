import http from 'http';
import os from 'os';

const port = process.env.SERVICE_PORT ?? 3000;
const proxyHost = process.env.SERVICE_PROXY_HOST ?? 'traefik';
const proxyPath = process.env.SERVICE_PROXY_PATH ?? '/tracker';

const getDateString = () => new Date().toUTCString();

const server = http.createServer((req, res) => {
    const currentDate = getDateString();
    console.log(`[${currentDate}] Received request`);

    const options = {
        hostname: proxyHost,
        path: proxyPath,
        headers: {
            'server-name': os.hostname(),
        },
    };

    const proxyReq = http.get(options, (proxyRes) => {
        let body = '';
        proxyRes.on('data', (chunk) => {
            body += chunk;
        });

        proxyRes.on('end', () => {
            res.statusCode = proxyRes.statusCode;
            res.setHeader('content-type', proxyRes.headers['content-type']);
            res.end(body);
        });
    });

    proxyReq.on('error', (err) => {
        const currentDate = getDateString();
        console.log(`[${currentDate}] Error: ${err.toString()}`);
        res.statusCode = 500;
        res.setHeader('content-type', 'text/plain');
        res.end('ERROR');
    });
});

server.listen(port, '0.0.0.0', () => {
    const currentDate = getDateString();
    console.log(`[${currentDate}] Server started`);
});