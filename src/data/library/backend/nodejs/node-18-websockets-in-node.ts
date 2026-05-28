import type { NoteContent } from '../../../types';
import websocketsSvg from '../../../../assets/diagrams/backend/nodejs/websockets.svg?raw';

export const content: NoteContent = {
  id: 'node-18',
  moduleId: 'node',
  order: 113,
  group: 'Node.js Core',
  title: 'WebSockets in Node',
  description: 'Master full-duplex persistent real-time networking. Understand the HTTP 101 upgrade handshake, WS framing protocols, connection heartbeat cycles, and horizontal scaling strategies.',
  sections: [
    {
      type: 'diagram',
      content: websocketsSvg
    },
    {
      type: 'text',
      content: "Traditional HTTP is strictly unidirectional and stateless—the client sends a request, the server responds, and the network connection is closed. This request-response cycle is highly inefficient for real-time applications (like chat rooms, live dashboards, or multiplayer games) which require continuous bidirectional communication.\n\n**WebSockets (WS)** solve this by establishing a **single, persistent full-duplex connection** over a single TCP socket, allowing both client and server to push data frames to each other at any millisecond."
    },
    {
      type: 'heading',
      content: '1. The Handshake: HTTP Upgrade',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A WebSocket connection does not start as a raw WebSocket socket. It begins as a standard HTTP connection. \n\nThe client sends an HTTP GET request containing specialized headers requesting an upgrade. The Node.js server receives this request, parses the headers, validates the upgrade security key (`Sec-WebSocket-Key`), and responds with an **`HTTP/1.1 101 Switching Protocols`** response.\n\nUpon sending this status code, the HTTP parser is turned off, the connection bypasses the traditional HTTP request-response engine, and the raw underlying TCP socket is kept open. This socket is now wrapped in a WebSocket framing layer."
    },
    {
      type: 'heading',
      content: '2. Connection Heartbeats (Ping/Pong)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Because WebSockets are persistent, they face a silent threat: **Dead Connections**. If a client disconnects abruptly (e.g. mobile loses signal, laptop goes to sleep), the operating system might not close the TCP socket immediately. The server will keep the socket open in its memory pool, slowly leading to port exhaustion.\n\nTo prevent this, servers must implement a **Heartbeat (Ping/Pong)** cycle. The server periodically (e.g., every 30 seconds) sends a small `Ping` frame to every active client socket. If the client does not respond with a `Pong` frame within a specific timeout, the server terminates the socket, cleaning up RAM."
    },
    {
      type: 'code',
      content: `import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';

interface HeartbeatWebSocket extends WebSocket {
  isAlive?: boolean;
}

const server = http.createServer();
const wss = new WebSocketServer({ noServer: true });

// 1. Intercept HTTP Upgrade request manually
server.on('upgrade', (req, socket, head) => {
  console.log('Incoming upgrade handshake request...');
  
  // Perform authentication check before upgrade
  const authorized = true; 
  if (!authorized) {
    socket.write('HTTP/1.1 401 Unauthorized\\r\\n\\r\\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws: HeartbeatWebSocket) => {
  ws.isAlive = true;
  console.log('Client connected successfully!');

  // Handle client incoming text frames
  ws.on('message', (message) => {
    console.log('Received frame:', message.toString());
    ws.send(\`Echo: \${message}\`);
  });

  // Client responds with pong to remain active
  ws.on('pong', () => {
    ws.isAlive = true; 
  });
});

// 2. Periodic Heartbeat verification (Ping/Pong)
const interval = setInterval(() => {
  wss.clients.forEach((ws: HeartbeatWebSocket) => {
    if (ws.isAlive === false) {
      console.log('Dead connection detected. Terminating socket...');
      return ws.terminate(); // Terminate dead socket
    }
    
    ws.isAlive = false; // Speculatively set false
    ws.ping(); // Send Ping frame
  });
}, 30000); // Trigger every 30 seconds

wss.on('close', () => clearInterval(interval));
server.listen(8080);`,
      metadata: { language: 'typescript', title: 'Robust WebSocket Server with manual upgrade and heartbeats' }
    },
    {
      type: 'callout',
      content: "When running WebSockets in a clustered multi-core environment, you must use a sticky session balancer or a centralized pub/sub adapter (like Redis Adapter for Socket.io). If Client A connects to Core 1 and Client B connects to Core 2, they cannot communicate directly because their TCP socket instances are completely isolated in separate processes. Redis bridges this gap.",
      metadata: { type: 'architecture', title: 'Scaling WebSockets horizontally' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: Explain the exact mechanism of a WebSocket upgrade handshake.\nA: A WebSocket connection begins as a standard HTTP GET request with the headers `Upgrade: websocket` and `Connection: Upgrade`. The server processes this handshake, hashes the client's `Sec-WebSocket-Key` with a standard UUID using SHA-1, and returns an `HTTP/1.1 101 Switching Protocols` status code, upgrading the TCP socket."
    },
    {
      type: 'faq',
      content: "Q: Why is a Heartbeat (Ping/Pong) system crucial for production WebSocket servers?\nA: WebSocket connections reside over persistent TCP sockets. If a client abruptly loses connection without sending a close frame, the socket remains open in an idle, ghost state on the server. Heartbeats ensure the server periodically pings active sockets, automatically terminating unresponsive ones to prevent resource exhaustion."
    },
    {
      type: 'faq',
      content: "Q: How do you scale WebSocket servers horizontally across a multi-instance Kubernetes cluster?\nA: Standard WebSockets maintain persistent memory references to TCP sockets on a specific machine. To scale horizontally, you must use a centralized **Pub/Sub event bus (like Redis or RabbitMQ)**. When an instance needs to send a message, it publishes the event to Redis, which broadcasts it to all other server nodes so the target client receives it."
    }
  ]
};
