import type { NoteContent } from '../../../types';
import microtasksMacrotasksSvg from '../../../../assets/diagrams/backend/nodejs/microtasks-macrotasks.svg?raw';

export const content: NoteContent = {
  id: 'node-6',
  moduleId: 'node',
  order: 101,
  group: 'Node.js Core',
  title: 'Microtasks vs Macrotasks',
  description: 'Uncover Node.js\'s execution priority ladder. Understand the timing differences between process.nextTick(), Promise microtasks, and standard event loop macrotasks, and learn how to avoid event loop starvation.',
  sections: [
    {
      type: 'diagram',
      content: microtasksMacrotasksSvg
    },
    {
      type: 'text',
      content: 'In Node.js, asynchronous operations are categorized into three distinct execution queues with rigid priorities: **`process.nextTick`**, **Microtasks** (Promises, `queueMicrotask`), and **Macrotasks** (timers, I/O, `setImmediate`).\n\nWhen the V8 execution call stack becomes empty, Node.js does not simply proceed to the next event loop phase. Instead, it must drain its immediate asynchronous queues first. Failing to understand the precedence of these queues can lead to execution order bugs or even completely freezing the server\'s event loop via **starvation**.'
    },
    {
      type: 'heading',
      content: '1. The Execution Priority Ladder',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Whenever a synchronous block of code completes and the Call Stack is cleared, Node.js processes queues in this exact priority order:\n\n1. **`process.nextTick` Queue**: This queue is managed directly by Node.js (not libuv). It has absolute highest priority. All callbacks in the `nextTick` queue are exhausted completely before moving to the next queue.\n2. **Microtask Queue**: Contains Promise resolutions (e.g. `.then()`, `catch()`, `finally()`) and callbacks registered via `queueMicrotask()`. This queue is exhausted completely after the `nextTick` queue is drained.\n3. **Macrotasks (Event Loop Phases)**: Standard async tasks like `setTimeout()`, `setImmediate()`, and file/network I/O callbacks. These run inside their respective libuv event loop phases. \n\n*Crucial Rule*: Node.js checks and completely drains the `process.nextTick` and Microtask queues **between every single callback** of a macrotask phase.'
    },
    {
      type: 'code',
      content: `// Timing Precedence Example
setTimeout(() => console.log('1. setTimeout (Macrotask)'), 0);
setImmediate(() => console.log('2. setImmediate (Macrotask)'));

Promise.resolve().then(() => console.log('3. Promise.then (Microtask)'));
queueMicrotask(() => console.log('4. queueMicrotask (Microtask)'));

process.nextTick(() => console.log('5. process.nextTick (Tick Queue)'));

console.log('6. Synchronous Main Stack');

// Execution Output:
// 6. Synchronous Main Stack
// 5. process.nextTick (Tick Queue)
// 3. Promise.then (Microtask)
// 4. queueMicrotask (Microtask)
// 1. setTimeout (Macrotask)
// 2. setImmediate (Macrotask)`,
      metadata: { language: 'javascript', title: 'Timing Execution Sequence' }
    },
    {
      type: 'heading',
      content: '2. Event Loop Starvation',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Because Node.js will not move to the next phase of the event loop until the `nextTick` and Microtask queues are fully empty, recursively scheduling callbacks in these queues will **starve the event loop**. \n\nIf a `process.nextTick` callback recursively calls `process.nextTick`, the call stack will clear, but the loop will be trapped executing the tick queue forever. Standard I/O events, network requests, and timers will never run, rendering your server unresponsive.'
    },
    {
      type: 'code',
      content: `// Recursive process.nextTick will freeze the Event Loop!
function starve() {
  process.nextTick(starve); 
}

starve(); // Call stack returns, but the nextTick queue is never empty

// This timer will NEVER execute!
setTimeout(() => {
  console.log('This will never run!');
}, 100);`,
      metadata: { language: 'javascript', title: 'Freezing the Event Loop via nextTick Starvation' }
    },
    {
      type: 'callout',
      content: '`process.nextTick` should be used sparingly. The primary use case is to allow APIs to invoke their callbacks asynchronously *after* the current call stack completes, giving the user a chance to bind event listeners or configure handlers before execution.',
      metadata: { type: 'warning', title: 'Use Cases for process.nextTick' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between process.nextTick() and Promise.then() in terms of priority?\nA: Both schedule callbacks to run asynchronously before the event loop advances to its next phase. However, **`process.nextTick()` has a higher priority** than Promises. The `nextTick` queue is drained completely before Node.js begins executing the Promise microtask queue.'
    },
    {
      type: 'faq',
      content: 'Q: What is event loop starvation, and how can it be caused by microtasks?\nA: Event loop starvation occurs when standard event loop phases (timers, I/O, check) are blocked from running. Because Node.js processes all pending `nextTick` and Promise microtasks before advancing the event loop, a recursive chain of `nextTick` or Promise calls will trap the runtime in the microtask check phase, blocking all I/O and timers.'
    },
    {
      type: 'faq',
      content: 'Q: Why would an engineer use process.nextTick() instead of setImmediate()?\nA: `process.nextTick` is used when you want a callback to execute **immediately** after the synchronous code finishes, but *before* the event loop resumes. This is useful for emitting event handlers right after object construction, ensuring the user has had a chance to attach event listeners synchronously before the callback fires.'
    }
  ]
};
