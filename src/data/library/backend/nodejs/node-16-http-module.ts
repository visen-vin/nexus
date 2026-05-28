import type { NoteContent } from '../../../types';
import httpModuleSvg from '../../../../assets/diagrams/backend/nodejs/http-module.svg?raw';

export const content: NoteContent = {
  id: 'node-16',
  moduleId: 'node',
  order: 111,
  group: 'Node.js Core',
  title: 'Native HTTP Module',
  description: 'Deep dive into Node.js web server foundations. Master the http module, understand how raw TCP sockets wrap into IncomingMessage and ServerResponse streams, and learn to manage keep-alive states.',
  sections: [
    {
      type: 'diagram',
      content: httpModuleSvg
    },
    {
      type: 'text',
      content: "When you build an Express, NestJS, or Fastify web server, your framework of choice hides a core Node.js primitive under the hood: the native **`http`** module.\n\nThe `http` module is a high-performance wrapper around Node's **TCP Socket (`net.Socket`)** engine. It translates raw network buffer streams into structured JavaScript objects, parsing request headers and managing keep-alive socket lifecycles."
    },
    {
      type: 'heading',
      content: '1. TCP Socket to HTTP Wrapper Mapping',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "When a new TCP client connects to your server, Node.js fires up a socket connection. An internal C/C++ parser called **`llhttp`** reads incoming binary data from this socket. Once the headers are parsed, Node.js instantiates two key stream objects and invokes your server's request listener callback:\n\n* **`http.IncomingMessage` (The Request)**: This represents the incoming request. Critically, it inherits from **`Readable Stream`**. It contains metadata properties (like `req.headers`, `req.url`, `req.method`) and streams the incoming HTTP request body (e.g. POST JSON payload) sequentially in chunks.\n* **`http.ServerResponse` (The Response)**: This represents the outgoing response. It inherits from **`Writable Stream`**. It provides utility helper methods (like `res.writeHead()`) and streams response bytes back into the raw underlying TCP socket via `res.write()` and `res.end()`."
    },
    {
      type: 'heading',
      content: '2. Keep-Alive and Socket Reuse',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Establishing a new TCP connection requires a 3-way handshake, which introduces performance latency. To solve this, HTTP/1.1 introduced **Keep-Alive**, which allows multiple request-response cycles to reuse the **same physical TCP socket**.\n\nIn Node.js, native keep-alive is managed automatically by the **`http.Agent`** class. Setting `keepAlive: true` instructs Node.js to keep socket connections open in a centralized connection pool rather than closing them immediately after `res.end()` executes, allowing rapid subsequent requests to bypass TCP handshakes."
    },
    {
      type: 'code',
      content: `import http from 'http';

// Create a native HTTP server
const server = http.createServer((req, res) => {
  // 1. req (IncomingMessage) is a Readable Stream
  console.log(\`Received Request: \${req.method} \${req.url}\`);
  
  let body = '';
  req.on('data', (chunk) => {
    body += chunk.toString(); // Assemble request body chunks
  });

  req.on('end', () => {
    // 2. res (ServerResponse) is a Writable Stream
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Connection': 'keep-alive' // Keep TCP socket open
    });
    
    res.write(JSON.stringify({
      received: true,
      dataSize: body.length
    }));
    
    res.end(); // CRITICAL: Signal completion to flush headers/data and release the socket
  });
});

// Configure server TCP socket timeouts
server.keepAliveTimeout = 5000; // Hold idle keep-alive sockets for 5 seconds
server.listen(3000, () => {
  console.log('HTTP Server listening on port 3000');
});`,
      metadata: { language: 'typescript', title: 'Building a Native HTTP Server' }
    },
    {
      type: 'callout',
      content: "Always ensure that `res.end()` is invoked in every execution path of your request listener. If a path fails (e.g. database error) and returns early without calling `res.end()`, the client request will hang indefinitely, and the underlying TCP socket will remain pinned open, leading to memory leaks and port exhaustion.",
      metadata: { type: 'warning', title: 'Hanging Socket Threat' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: Explain why req (http.IncomingMessage) is a Readable stream and how it impacts large payload handling.\nA: `req` is a **Readable stream** because HTTP request bodies (like uploaded files or large JSON arrays) can be larger than V8's heap space. By streaming the payload in sequential chunks (via `on('data')`), Node.js processes the data incrementally with O(1) memory overhead, preventing server-side memory exhaustion crashes."
    },
    {
      type: 'faq',
      content: "Q: What is the role of the http.Agent class in Node.js?\nA: The `http.Agent` class manages TCP socket connection pooling and reuse for HTTP clients. By default, it manages a pool of active connection sockets. It implements **HTTP Keep-Alive**, ensuring that subsequent client requests to the same remote host reuse active TCP sockets, bypassing the overhead of handshakes."
    },
    {
      type: 'faq',
      content: "Q: What is the significance of the Connection: keep-alive header, and how does server.keepAliveTimeout manage it?\nA: The `Connection: keep-alive` header instructs the server and client to keep the physical TCP connection open for subsequent requests. `server.keepAliveTimeout` sets the maximum duration (in milliseconds) of inactivity the server will tolerate before closing an idle TCP socket, preventing idle sockets from starving system resources."
    }
  ]
};
