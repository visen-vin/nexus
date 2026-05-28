import type { NoteContent } from '../../../types';
import clusterModuleSvg from '../../../../assets/diagrams/backend/nodejs/cluster-module.svg?raw';

export const content: NoteContent = {
  id: 'node-15',
  moduleId: 'node',
  order: 110,
  group: 'Node.js Core',
  title: 'Cluster Module',
  description: 'Scale Node.js horizontally across all physical CPU cores. Understand the native cluster module, how parent/child processes communicate to share the same TCP port, and round-robin load balancing.',
  sections: [
    {
      type: 'diagram',
      content: clusterModuleSvg
    },
    {
      type: 'text',
      content: "Because JavaScript execution runs on a single main thread, a Node.js application process utilizes only a **single physical CPU core**. In the era of multi-core servers (where even basic servers have 4, 8, or 64 cores), leaving the remaining cores idle is an massive waste of compute power.\n\nThe native **`cluster`** module resolves this by allowing you to easily spin up a network of child processes that **all share the exact same TCP port**, distributing incoming user traffic horizontally across all available cores."
    },
    {
      type: 'heading',
      content: '1. Process Orchestration: Primary vs. Workers',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "When using the `cluster` module, your application operates under a parent-child topology:\n\n* **The Primary Process (Master)**: This process does not execute your actual application routing or API logic. Its sole responsibility is to identify the number of CPU cores, spin up child worker processes (using `cluster.fork()`), monitor their health, and automatically restart them if they crash.\n* **The Worker Processes**: These are completely separate operating system processes, each running its own isolated V8 engine, V8 heap, and event loop. This is where your actual Express/HTTP application resides."
    },
    {
      type: 'heading',
      content: '2. Port Sharing Mechanics (How do they not clash?)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Under standard operating system rules, if Process A binds to Port 3000, Process B attempting to bind to Port 3000 will crash with an `EADDRINUSE` (Address already in use) error. How then can multiple cluster workers share Port 3000?\n\nThey achieve this through C++ file descriptor passing under the hood:\n\n1. The **Primary process** binds to the TCP port (e.g. 3000) and spawns the socket listener.\n2. When a client request arrives, the Primary process accepts the network socket descriptor.\n3. Using round-robin load balancing (default on Unix), the Primary process distributes the raw network socket handler directly to one of the child **worker processes** using the internal process IPC pipe.\n4. The chosen worker receives the socket handler, wraps it in Node's HTTP interface, processes the request, and responds directly to the client."
    },
    {
      type: 'code',
      content: `import cluster from 'cluster';
import http from 'http';
import os from 'os';

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(\`[Primary] Process \${process.pid} is running, spawning \${numCPUs} workers...\`);

  // Fork a worker process for every CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Monitor worker exits and restart them (Self-Healing Architecture)
  cluster.on('exit', (worker, code, signal) => {
    console.warn(\`[Primary] Worker \${worker.process.pid} crashed! Spawning a replacement...\`);
    cluster.fork();
  });

} else {
  // --- WORKER PROCESSES SPACE ---
  // Each worker runs a completely isolated HTTP server sharing Port 8000
  http.createServer((req, res) => {
    res.writeHead(200);
    res.end(\`Response handled by Worker Process PID: \${process.pid}\\n\`);
  }).listen(8000);

  console.log(\`[Worker] Process \${process.pid} started.\`);
}`,
      metadata: { language: 'typescript', title: 'Orchestrating a clustered self-healing server' }
    },
    {
      type: 'callout',
      content: "Clustered workers are completely separate OS processes. They do not share global variables, caches, or memory space. If you store session data in a local variable or a Map inside one worker, other workers will have no access to it, resulting in broken session states. Always use an external centralized store like Redis for sessions and caches when running clustered applications.",
      metadata: { type: 'warning', title: 'Shared State Cache Pitfall' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: How can multiple Node.js worker processes listen on the exact same port without Address-in-Use errors?\nA: They do not actually bind to the port directly. The Primary process binds to the TCP port and creates the master socket listener. When connection requests arrive, the Primary accepts the connection and hands off the raw network socket handler (file descriptor) directly to a worker process via IPC, bypassing OS binding conflicts."
    },
    {
      type: 'faq',
      content: "Q: What load balancing strategy does the cluster module use by default, and how does it work?\nA: On Unix-based systems (Linux, macOS), Node.js uses **Round-Robin** load balancing by default. The Primary process accepts all incoming TCP connections and sequentially distributes them across the active child worker processes, ensuring an even distribution of CPU load."
    },
    {
      type: 'faq',
      content: "Q: If a worker process in a cluster crashes, how does the application maintain high availability?\nA: The Primary process listens to the `'exit'` event of the `cluster` object. When a worker process crashes and exits, the Primary callback fires, allowing it to log the failure and immediately invoke `cluster.fork()` to spin up a new replacement worker process, ensuring no reduction in compute capacity."
    }
  ]
};
