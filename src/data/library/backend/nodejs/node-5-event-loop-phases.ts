import type { NoteContent } from '../../../types';
import eventLoopPhasesSvg from '../../../../assets/diagrams/backend/nodejs/event-loop-phases.svg?raw';

export const content: NoteContent = {
  id: 'node-5',
  moduleId: 'node',
  order: 100,
  group: 'Node.js Core',
  title: 'Event Loop Phases',
  description: 'Deep dive into the 6 execution phases of the Node.js Event Loop. Learn the sequential mechanics of Timers, Pending, Idle/Prepare, Poll, Check, and Close Callbacks, and how the loop blocks during I/O.',
  sections: [
    {
      type: 'diagram',
      content: eventLoopPhasesSvg
    },
    {
      type: 'text',
      content: 'The **Event Loop** is the orchestrator of Node.js\'s asynchronous runtime, built entirely within the **libuv** C library. When Node.js starts, it initializes the event loop, processes the provided input script (which may make async API calls), and then begins looping.\n\nThe event loop is not a simple, single queue. It is composed of **six distinct execution phases** that run in a continuous circle. Each phase has a First-In, First-Out (FIFO) queue of callbacks to execute. When the event loop enters a phase, it will execute all callbacks in that phase\'s queue (or up to a system-defined limit) before moving to the next phase.'
    },
    {
      type: 'heading',
      content: '1. The Six Phases Explained',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Here is the precise sequence of the six phases of the event loop:\n\n1. **Timers**: The loop checks if the thresholds of active `setTimeout()` and `setInterval()` timers have been passed and executes their callbacks.\n2. **Pending Callbacks**: Executes I/O callbacks that were deferred from the previous iteration. For example, if a TCP socket connection attempts to write and receives a system error (like `ECONNREFUSED`), the callback to handle the error is queued here.\n3. **Idle, Prepare**: Used strictly internally by libuv for scheduling internal tasks (e.g. preparing event loop tick updates).\n4. **Poll**: The critical core phase. The loop retrieves new I/O events. If there are callbacks in the poll queue (like incoming network connections or file read completions), they are executed sequentially. If the poll queue is empty, the loop will **block and wait** for incoming I/O events, unless there are active `setImmediate` scripts or completed timers.\n5. **Check**: Executes callbacks registered with `setImmediate()`. This phase runs immediately after the Poll phase completes.\n6. **Close Callbacks**: Executes close events and cleanup handlers, such as `socket.on(\'close\', ...)` or `destroy()` callbacks.'
    },
    {
      type: 'heading',
      content: '2. Timing Mechanics: setTimeout vs. setImmediate',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The order in which `setTimeout` (with a delay of 0ms) and `setImmediate` execute is highly dependent on the **context** of execution:\n\n* **In an I/O Cycle**: If both are called inside an I/O callback (e.g., inside an `fs.readFile` callback), `setImmediate` **always runs first**. This is because the filesystem callback runs in the Poll phase. Once the Poll phase completes, the loop immediately transitions to the **Check** phase (where `setImmediate` resides) before returning to the **Timers** phase on the next loop iteration.\n* **In the Main Thread**: If called in the main script scope, the execution order is non-deterministic (it depends on process timing and how quickly the V8 execution started).'
    },
    {
      type: 'code',
      content: `import fs from 'fs';

// 1. Inside an Asynchronous I/O Callback
fs.readFile('package.json', () => {
  setTimeout(() => {
    console.log('1. setTimeout (Timer Phase) executed!');
  }, 0);

  setImmediate(() => {
    console.log('2. setImmediate (Check Phase) executed!');
  });
});

// Output WILL ALWAYS BE:
// 2. setImmediate (Check Phase) executed!
// 1. setTimeout (Timer Phase) executed!`,
      metadata: { language: 'javascript', title: 'Deterministic setImmediate Execution in I/O Context' }
    },
    {
      type: 'callout',
      content: 'The event loop will not run forever. When there are no longer any active timers, pending callbacks, network handles, or file listeners registered (known as active references or "refs"), the loop exits, and the Node.js process terminates.',
      metadata: { type: 'architecture', title: 'Event Loop Exit Condition' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: What are the main phases of the Node.js event loop, and what runs in the "Check" phase?\nA: The six phases in order are: **Timers** (setTimeout/setInterval callbacks), **Pending Callbacks** (system/socket errors), **Idle/Prepare** (internal libuv operations), **Poll** (incoming network and file I/O callbacks), **Check** (setImmediate callbacks), and **Close Callbacks** (socket.on(\'close\')). The "Check" phase is dedicated to running `setImmediate()` scripts.'
    },
    {
      type: 'faq',
      content: 'Q: Why does setImmediate() always run before setTimeout(..., 0) inside an I/O callback?\nA: Inside an I/O callback, the execution is currently sitting in the **Poll** phase. When the Poll phase finishes, the loop proceeds directly to the next adjacent phase in the cycle, which is the **Check** phase (where `setImmediate` is executed). The **Timers** phase (where `setTimeout` resides) is only checked at the beginning of the next tick, ensuring `setImmediate` executes first.'
    },
    {
      type: 'faq',
      content: 'Q: What happens during the Poll phase if the poll queue is empty?\nA: If the poll queue is empty, the loop will check if any `setImmediate()` callbacks are scheduled. If yes, it immediately leaves the Poll phase and goes to the Check phase. If there are no `setImmediate()` callbacks, it checks if any timers have finished. If yes, it returns to the Timers phase. If no, the loop **blocks and sleeps** in the Poll phase, waiting for I/O events (like network arrivals) to prevent wasting CPU cycles.'
    }
  ]
};
