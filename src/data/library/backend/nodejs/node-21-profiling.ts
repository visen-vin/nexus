import type { NoteContent } from '../../../types';
import profilingCpuSvg from '../../../../assets/diagrams/backend/nodejs/profiling-cpu.svg?raw';

export const content: NoteContent = {
  id: 'node-21',
  moduleId: 'node',
  order: 116,
  group: 'Node.js Core',
  title: 'Profiling & CPU',
  description: 'Diagnose performance bottlenecks in Node.js. Learn to capture V8 tick profiles, read flame graphs, identify blocking synchronous code, and optimize application throughput.',
  sections: [
    {
      type: 'diagram',
      content: profilingCpuSvg
    },
    {
      type: 'text',
      content: "Node.js applications operate inside a single-threaded execution loop. If a specific function or block of code blocks this main thread (e.g. performing heavy cryptographic operations, deep recursive calculations, or parsing gigantic files synchronously), the entire server freezes, stalling all incoming client requests.\n\nTo identify what code is blocking your event loop, you must utilize **CPU Profiling**. Profiling analyzes execution ticks and captures the active call stack at regular intervals, visualising it as a structured **Flame Graph**."
    },
    {
      type: 'heading',
      content: '1. Reading a CPU Flame Graph',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A Flame Graph is a visual representation of your server's active call stack during execution:\n\n* **Y-Axis (Vertical)**: Represents the **Call Stack Depth**. The root of the stack (the event loop itself) is at the bottom, and the top-most function currently executing is at the top.\n* **X-Axis (Horizontal)**: Represents **CPU execution time**. Crucially, the horizontal axis does not represent chronological time—instead, the **width of a function box represents its percentage of total CPU time**.\n\n*Diagnostic Goal*: Look for **wide boxes at the top of the stack** (often colored in warm orange/red). A wide box indicates a function that occupied the CPU continuously for a large percentage of ticks, pinpointing a blocking bottleneck."
    },
    {
      type: 'heading',
      content: '2. Native Profiling Tools in Node.js',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "You don't need expensive third-party wrappers to profile Node.js. The runtime includes a built-in native V8 profiler:\n\n1. **Record Ticks**: Start your server with the native tick profiler: `node --prof server.js`.\n2. **Generate Load**: Run a benchmarking tool (like `autocannon` or `wrk`) against the server to generate active requests: `autocannon -c 100 -d 10 http://localhost:3000`.\n3. **Process Logs**: The profiler writes execution logs to a file (e.g. `isolate-0xabcd-v8.log`). Process this log file into readable text: `node --prof-process isolate-*.log > processed_profile.txt`.\n4. **Analyze Output**: Open `processed_profile.txt` to see which JavaScript, C++, or system calls occupied the highest percentage of execution cycles."
    },
    {
      type: 'code',
      content: `import crypto from 'crypto';
import express from 'express';
const app = express();

// 1. Bottleneck Anti-Pattern: Synchronous blocking hashing
app.get('/hash-sync', (req, res) => {
  // Blocks the single execution thread for ~100-300ms!
  // This shows up as a massive wide box on a Flame Graph.
  const hash = crypto.pbkdf2Sync('password', 'salt', 100000, 64, 'sha512');
  res.send({ hash: hash.toString('hex') });
});

// 2. High-Performance Best Practice: Asynchronous non-blocking hashing
app.get('/hash-async', (req, res) => {
  // Dispatches hashing operation completely to the libuv thread pool!
  // Keeps main JS thread fully free to handle other requests.
  crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
    if (err) return res.status(500).send(err.message);
    res.send({ hash: derivedKey.toString('hex') });
  });
});

app.listen(3000);`,
      metadata: { language: 'typescript', title: 'Blocking CPU vs Asynchronous Offloading' }
    },
    {
      type: 'callout',
      content: "For automated modern diagnostic visualizer generation, use the native `clinic` CLI tool: `npx clinic flame -- node server.js`. It runs the profiler, handles the log processing, and generates a premium, interactive browser-viewer Flame Graph automatically.",
      metadata: { type: 'architecture', title: 'Clinic.js Integration' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: How do you read a CPU Flame Graph, and what does the width of a box indicate?\nA: In a CPU Flame Graph, the Y-axis represents the depth of the active call stack (functions calling functions). The X-axis represents CPU usage. The **width of a function box indicates the percentage of total CPU execution time** spent inside that function, rather than chronological time. Wide boxes represent performance bottlenecks."
    },
    {
      type: 'faq',
      content: "Q: What is the difference between JavaScript execution ticks and C++ system ticks in V8 profiles?\nA: V8 profiles list **JavaScript ticks** (time spent compiling and running JS code in V8) and **C++ ticks** (time spent inside C++ native bindings, system kernels, or libuv operations like cryptography, compression, or file I/O). A high C++ tick percentage often indicates heavy thread pool activity or heavy I/O."
    },
    {
      type: 'faq',
      content: "Q: How does using a synchronous cryptographical method like pbkdf2Sync impact a clustered Node.js application?\nA: Even if clustered (e.g. 4 workers on 4 CPU cores), a single worker process handling a `pbkdf2Sync` request will completely block its event loop thread. While it is blocked, it cannot accept any subsequent TCP requests allocated to it, leading to queue piling, slow response latency, and timeout failures for users."
    }
  ]
};
