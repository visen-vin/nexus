import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-5',
  moduleId: 'js',
  order: 7,
  group: 'Asynchrony & Runtime',
  title: 'The Event Loop',
  description: 'The orchestration mechanism enabling non-blocking asynchronous operations in JavaScript.',
  sections: [
    {
      type: 'text',
      content: 'At its core, JavaScript is a **single-threaded**, synchronous language. However, the **Event Loop** allows it to perform non-blocking I/O operations by offloading tasks to the system kernel or the browser environment. Understanding the Event Loop is the difference between writing code that works and writing code that performs at a **Senior Staff Engineer** level.'
    },
    {
      type: 'callout',
      content: 'The Event Loop is not part of the V8 engine itself; it is a feature of the **host environment** (Browser or Node.js) that coordinates between the Call Stack, Web APIs, and Task Queues.',
      metadata: { type: 'architecture', title: 'Architectural Insight' }
    },
    {
      type: 'heading',
      content: 'The Execution Algorithm',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The engine operates in a continuous cycle. Every iteration of the loop follows a strict priority sequence: execute the oldest **Macrotask**, then exhaust the entire **Microtask Queue**, and finally perform **UI Rendering** if needed.'
    },
    {
      type: 'code',
      content: `// The Simplified Event Loop Algorithm
while (true) {
  // 1. Execute oldest Macrotask (e.g., <script>, setTimeout)
  const task = macrotaskQueue.pop();
  if (task) execute(task);

  // 2. EXHAUST Microtasks (Promises, queueMicrotask)
  while (!microtaskQueue.isEmpty()) {
    execute(microtaskQueue.pop());
  }

  // 3. Render changes to the UI
  if (needsRendering()) render();

  // 4. Wait for a new Macrotask
  if (macrotaskQueue.isEmpty()) waitForTask();
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Macrotasks vs. Microtasks',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Distinguishing between these queues is critical for predicting execution order. **Macrotasks** (or simply Tasks) include events like timers, I/O, and UI events. **Microtasks** are reserved for immediate asynchronous reactions, primarily Promises and \\`MutationObserver\\` callbacks.'
    },
    {
      type: 'callout',
      content: 'A recursive microtask (e.g., a promise that resolves to itself) will **starve** the event loop, preventing rendering and macrotask execution, effectively freezing the UI.',
      metadata: { type: 'warning', title: 'RUNTIME DANGER' }
    },
    {
      type: 'heading',
      content: 'Practical Optimization: Task Splitting',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'For CPU-heavy operations, a single synchronous task can block the main thread for hundreds of milliseconds. By splitting the work into smaller chunks using \\`setTimeout(..., 0)\\`, we allow the browser to "breathe"—performing rendering and handling user input between chunks.'
    },
    {
      type: 'code',
      content: `// Blocking implementation
function heavyTask() {
  for (let i = 0; i < 1e9; i++) { /* do work */ }
}

// Non-blocking implementation via Macrotask splitting
let i = 0;
function heavyTaskSplitted() {
  do {
    i++;
    // Perform chunk of work
  } while (i % 1e6 !== 0);

  if (i < 1e9) {
    setTimeout(heavyTaskSplitted); // Schedule next chunk as a new Macrotask
  }
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Mastery Check' }
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between Macrotasks and Microtasks?\\nA: Macrotasks are executed one per loop iteration, followed by the execution of the **entire** Microtask queue. Microtasks have higher priority and must be cleared before the browser can render or move to the next Macrotask.'
    },
    {
      type: 'faq',
      content: 'Q: How does the Event Loop handle UI rendering?\\nA: Rendering is a specific step in the Event Loop that occurs **after** the Microtask queue is exhausted but **before** the next Macrotask is processed. This is why long-running synchronous code or infinite microtasks "freeze" the UI.'
    },
    {
      type: 'faq',
      content: 'Q: Why use queueMicrotask() instead of setTimeout()?\\nA: Use \\`queueMicrotask\\` when you need to execute logic asynchronously but **before** the browser renders. \\`setTimeout\\` schedules a Macrotask, which will run after the next rendering cycle and other pending Macrotasks.'
    }
  ]
};
