import http from 'http';
import crypto from 'crypto';

const port = process.env.SERVICE_PORT ?? 3000;

const logConnect = process.env.SERVICE_LOG_CONNECT ?? true;
const logDisconnect = process.env.SERVICE_LOG_DISCONNECT ?? true;

const getDateString = () => new Date().toUTCString();
const getConnectionId = (socket) => {
    if (socket.__privId) return socket.__privId;
    socket.__privId = crypto.randomBytes(8).toString('hex');
    return socket.__privId;
};

const activeConnections = {};

const server = http.createServer((req, res) => {
    const currentDate = getDateString();
    console.log(`[${currentDate}] Received request`);

    const origin = req.headers['server-name'];

    const connectionId = getConnectionId(req.socket);
    const originalConnection = activeConnections[connectionId];

    if (!originalConnection) {
        const currentDate = getDateString();
        console.log(`[${currentDate}] Unregistered connection?`);
    } else if (!originalConnection.origin) {
        const currentDate = getDateString();
        console.log(`[${currentDate}] First-time connection use (${origin})`);
        originalConnection.origin = origin;
    } else if (originalConnection.origin !== origin) {
        const previousOrigin = originalConnection.origin;
        const currentDate = getDateString();
        console.log(`[${currentDate}] Reused connection (previous: ${previousOrigin}, current: ${origin})`);
    } else if (originalConnection.origin === origin) {
        const currentDate = getDateString();
        console.log(`[${currentDate}] Reused connection (same: ${origin})`);
    }

    res.statusCode = 200;
    res.setHeader('content-type', 'text/plain');
    res.end('OK');
});

server.on('connection', (socket) => {
    const connectionId = getConnectionId(socket);

    const currentDate = getDateString();
    if (logConnect) console.log(`[${currentDate}] Connection Opened (${connectionId})`);
    activeConnections[connectionId] = {
        socket,
        origin: null,
    };

    socket.on('close', () => {
        const currentDate = getDateString();
        if (logDisconnect) console.log(`[${currentDate}] Connection Closed (${connectionId})`);
        delete activeConnections[connectionId];
    });
});

server.listen(port, '0.0.0.0', () => {
    const currentDate = getDateString();
    console.log(`[${currentDate}] Server started`);
});