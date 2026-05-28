import type { NoteContent } from '../../../types';
import eventEmitterSvg from '../../../../assets/diagrams/backend/nodejs/event-emitter.svg?raw';

export const content: NoteContent = {
  id: 'node-8',
  moduleId: 'node',
  order: 103,
  group: 'Node.js Core',
  title: 'The EventEmitter',
  description: 'Master Node.js\'s native Publish/Subscribe pattern. Understand the synchronous execution of event listeners, the fatal consequences of unhandled error events, and how to detect and prevent memory leaks.',
  sections: [
    {
      type: 'diagram',
      content: eventEmitterSvg
    },
    {
      type: 'text',
      content: 'Much of the Node.js core architecture is built around an **idiomatic event-driven design**. Core modules like HTTP servers, file streams, and child processes all inherit from a single foundational class: the **`EventEmitter`** from the native `events` module.\n\nThe `EventEmitter` implements the **Publisher/Subscriber (Pub/Sub)** pattern in JavaScript. It provides a structured way to bind listener functions to specific named event channels, allowing decoupled components to communicate by emitting and reacting to events.'
    },
    {
      type: 'heading',
      content: '1. Synchronous Listener Execution (The Big Misconception)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A very common misconception is that the `EventEmitter` is asynchronous. In reality, **`EventEmitter` executes all listeners synchronously** in the exact order they were registered.\n\nWhen you call `emitter.emit(\'event\')`, the emitter loops through its internal array of bound callback functions and executes them one by one on the main execution thread. Because execution is synchronous, if Listener A throws an unhandled exception or performs a heavy blocking CPU calculation, it will prevent subsequent listeners from executing and can block the event loop.'
    },
    {
      type: 'code',
      content: `import { EventEmitter } from 'events';

const myEmitter = new EventEmitter();

// 1. Register multiple synchronous listeners
myEmitter.on('greet', () => {
  console.log('1. Listener A executed synchronously');
});

myEmitter.on('greet', () => {
  console.log('2. Listener B executed synchronously');
});

console.log('--- Emitting Greet Event ---');
myEmitter.emit('greet');
console.log('--- Emission Completed ---');

// Output order:
// --- Emitting Greet Event ---
// 1. Listener A executed synchronously
// 2. Listener B executed synchronously
// --- Emission Completed ---`,
      metadata: { language: 'javascript', title: 'Synchronous EventEmitter Dispatch Flow' }
    },
    {
      type: 'heading',
      content: '2. Critical Safety: The Fatal "error" Event',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Node.js treats the string **`'error'`** as a special reserved event channel. If an 'error' event is emitted on an `EventEmitter` and there is **no listener currently registered to handle it**, Node.js will treat the error as an unhandled exception. It will print the stack trace to `stderr` and **instantly terminate the entire Node.js process**.\n\nAlways ensure that any emitter that can experience an error (like a stream, network socket, or database client) has a `.on('error', ...)` listener attached."
    },
    {
      type: 'code',
      content: `import { EventEmitter } from 'events';
const worker = new EventEmitter();

// Unhandled error event crashes the entire server process!
// worker.emit('error', new Error('Something went wrong!')); // BOOM! Process exits.

// Safe event emitter pattern:
worker.on('error', (err) => {
  console.error('Safely caught error event:', err.message);
});

worker.emit('error', new Error('Database connection failed!')); // Process survives!`,
      metadata: { language: 'javascript', title: 'The reserved error event crash prevention' }
    },
    {
      type: 'heading',
      content: '3. Memory Leaks & Listener Limits',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Every time you call `.on()`, a reference to the callback is added to the emitter\'s internal listeners hash map. If the emitter lives for the lifetime of the application (e.g. a global event bus or database client) but you attach listeners dynamically inside request-response closures, **a memory leak occurs**. The emitter holds onto the closures, preventing V8 from garbage collecting the request scopes.\n\nTo help detect this, V8 will print a memory leak warning if more than **10 listeners** are added to a single event on one emitter. You can adjust this limit via `setMaxListeners(n)`, but you should always clean up listeners using `.off()` or `removeListener()` when they are no longer needed, or use `.once()` for one-time events.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: Is the EventEmitter asynchronous by default? How does it execute callbacks?\nA: No, the EventEmitter is **strictly synchronous by default**. When `emit()` is called, the emitter loops through its registered array of listener callbacks and executes them sequentially on the main JavaScript thread, blocking the loop until all callbacks have completed.'
    },
    {
      type: 'faq',
      content: "Q: What happens if you emit an \"error\" event on an emitter that has no listener bound to it?\nA: If an 'error' event is emitted and there are no active listeners bound to handle it, Node.js treats this as a fatal unhandled exception. The runtime will print the stack trace to `stderr` and **terminate the entire Node.js OS process** immediately."
    },
    {
      type: 'faq',
      content: 'Q: Why does Node.js limit the number of event listeners on a single emitter to 10 by default?\nA: The limit of 10 is a built-in safety net designed to help developers identify **memory leaks**. In long-running processes, dynamically registering event listeners without removing them is a common source of leaks. Exceeding 10 listeners triggers a warning to alert engineers that event bindings may be accumulating.'
    }
  ]
};
