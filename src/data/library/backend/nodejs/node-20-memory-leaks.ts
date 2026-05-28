import type { NoteContent } from '../../../types';
import memoryLeaksSvg from '../../../../assets/diagrams/backend/nodejs/memory-leaks.svg?raw';

export const content: NoteContent = {
  id: 'node-20',
  moduleId: 'node',
  order: 115,
  group: 'Node.js Core',
  title: 'Memory Leaks in Node.js',
  description: 'Master memory leak diagnostics in Node.js. Discover the typical leak scenarios (accidental globals, unclosed event listeners, retained closures), and learn to analyze heap snapshots.',
  sections: [
    {
      type: 'diagram',
      content: memoryLeaksSvg
    },
    {
      type: 'text',
      content: "A memory leak occurs when V8 allocates memory in the heap for an object, but your application maintains an active, unintentional reference path to it even after the object is no longer needed. Because the object is still reachable from a **GC Root** (global scope, active stacks), V8's Garbage Collector cannot reclaim its memory space.\n\nOver time, as the leak expands, the Node.js process consumes more and more RAM, eventually triggering V8's memory limits and crashing the server with a fatal `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory` exception."
    },
    {
      type: 'heading',
      content: '1. Typical Leak Scenarios in Node.js',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Here are the most common ways developers introduce memory leaks in long-running Node.js processes:\n\n* **Accidental Globals**: Assigning a value to an undeclared variable attaches it to the global namespace (`globalThis`), keeping it permanently in memory. Always write code in strict mode (`\"use strict\"`) or TypeScript to prevent this.\n* **Unclosed Event Listeners**: Registering an event listener (like `.on()`) on a long-lived emitter (e.g. a database socket or global bus) inside an ephemeral closure (like an Express request route). The event bus will maintain a reference to the request closure forever, leaking the entire request scope. Always clean up listeners using `.off()` or `removeListener()`.\n* **Retained Closures (The Meteor Leak)**: A closure retains a reference to its outer scope variables. If an outer variable holds onto a large object, it can keep it trapped in memory even if the inner function is never called, due to V8's shared parent scope bindings."
    },
    {
      type: 'code',
      content: `import express from 'express';
const app = express();

// Leak Scenario A: The Infinite Global Cache Leak
const requestCache = new Map(); // Global variable is a GC Root!

app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  
  // Leaking memory: This map grows indefinitely on every HTTP request!
  requestCache.set(userId, {
    timestamp: Date.now(),
    headers: req.headers, // Heavy context leak!
    meta: "large_payload"
  });

  res.send('User loaded');
});

// Leak Scenario B: The Unclosed Event Listener Leak
const databaseSocket = new EventEmitter();

app.get('/status', (req, res) => {
  const handler = () => {
    console.log('Status requested');
  };

  // Leaking memory: Every request registers a new handler!
  // DatabaseSocket lives forever, trapping req/res scopes.
  databaseSocket.on('update', handler);

  // Fix: Always clean up in res finish/close event:
  /*
  res.on('finish', () => {
    databaseSocket.off('update', handler); 
  });
  */

  res.send('OK');
});`,
      metadata: { language: 'typescript', title: 'Typical Memory Leak Anti-Patterns' }
    },
    {
      type: 'heading',
      content: '2. Memory Leak Diagnostics & Analysis',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To diagnose a memory leak in production, you must analyze **Heap Snapshots**:\n\n1. **Take Heap Snapshots**: Use the command line flag `--inspect` to connect Chrome DevTools, or import the native `v8` module to write snapshots dynamically.\n2. **Compare Snapshots**: Take multiple heap snapshots under different intervals (e.g., Snapshot 1: Startup, Snapshot 2: After 1000 requests, Snapshot 3: After 5000 requests).\n3. **Analyze Retainers**: Load the snapshots in Chrome DevTools under the **Memory** panel. Filter by **Comparison** to see which objects grew in count, and inspect the **Retainers** tree at the bottom to trace the exact reference path leading to the GC Root."
    },
    {
      type: 'callout',
      content: "Never deploy third-party memory leak detection libraries that parse the heap dynamically in production. Generating a heap snapshot is extremely CPU-heavy and blocks the main thread, temporarily freezing your production server. Always run memory diagnostic workloads in a staging/sandbox replica under artificial traffic load.",
      metadata: { type: 'warning', title: 'Production Profiling Warning' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: Why do unclosed event listeners on global event buses cause memory leaks in Node.js?\nA: Global objects or long-lived modules act as GC Roots and are never collected. When you attach a listener callback on them from within a request handler, the global event bus adds that callback reference to its internal array. Because the callback encloses request/response scopes (variables), V8 is forced to keep the entire request context in memory, causing a leak."
    },
    {
      type: 'faq',
      content: "Q: Explain how you would generate and analyze a heap snapshot to diagnose a memory leak in Node.js.\nA: I would start the Node process with the `--inspect` flag and connect Chrome DevTools. Next, I would take three sequential heap snapshots: at startup, after loading traffic, and after another wave of traffic. In DevTools, I would compare the snapshots to identify which constructors are growing in memory count and trace their **Retainer paths** to find which GC Root is holding the reference."
    },
    {
      type: 'faq',
      content: "Q: How do you prevent memory leaks when using dynamic caches or Maps inside Node.js?\nA: Do not use unlimited standard global Maps or Objects as caches. To prevent memory leaks, you should: (1) use a **WeakMap** if the keys are object instances (allowing V8 to garbage collect values if keys are deleted), (2) enforce size limits (like LRU - Least Recently Used caching algorithms), or (3) offload caches entirely to external specialized databases like **Redis**."
    }
  ]
};
