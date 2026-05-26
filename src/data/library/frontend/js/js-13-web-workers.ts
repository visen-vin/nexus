import type { NoteContent } from '../../../types';
import webWorkersSvg from '../../../../assets/diagrams/frontend/js/web-workers.svg?raw';

export const content: NoteContent = {
  id: 'js-13',
  moduleId: 'js',
  order: 13,
  group: 'Asynchrony & Runtime',
  title: 'Web Workers',
  description: 'Running heavy computations in background threads to keep the main UI thread responsive.',
  sections: [
    {
      type: 'text',
      content: 'JavaScript is single-threaded, meaning long-running tasks can block the main thread and freeze the UI. **Web Workers** provide a way to run scripts in the background, in a separate execution thread. This allows you to perform heavy calculations or data processing without compromising the user experience.'
    },
    {
      type: 'diagram',
      content: webWorkersSvg
    },
    {
      type: 'callout',
      content: 'Web Workers do not have access to the DOM, the \\`window\\` object, or the \\`parent\\` object. They communicate with the main thread strictly through message passing.',
      metadata: { type: 'architecture', title: 'Isolated Execution' }
    },
    {
      type: 'heading',
      content: 'Communication: The postMessage API',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Communication between the main thread and a worker is asynchronous and event-driven. You use \\`postMessage()\\` to send data and the \\`onmessage\\` event handler to receive it.'
    },
    {
      type: 'code',
      content: `// main.js
const worker = new Worker('worker.js');

worker.postMessage({ type: 'start', data: 42 });

worker.onmessage = (event) => {
  console.log("Result from worker:", event.data);
};

// worker.js
self.onmessage = (event) => {
  const result = heavyCalculation(event.data);
  self.postMessage(result);
};`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Data Transfer: Structured Cloning',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When data is sent to a worker, it is not shared by reference. Instead, it is copied using the **Structured Clone Algorithm**. For massive datasets, you can use **Transferable Objects** (like \\`ArrayBuffer\\`) to transfer ownership, which is a zero-copy operation that significantly boosts performance.'
    },
    {
      type: 'callout',
      content: 'Once an object is transferred, it becomes unusable in the original thread. This prevents race conditions and ensures thread safety.',
      metadata: { type: 'runtime', title: 'Zero-Copy Transfer' }
    },
    {
      type: 'heading',
      content: 'Dedicated vs. Shared Workers',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Most workers are **Dedicated Workers**, used by a single script. However, **Shared Workers** can be accessed by multiple scripts from different windows or iframes (as long as they are on the same origin), allowing for cross-tab communication and shared state.'
    },
    {
      type: 'code',
      content: `// Creating a Shared Worker
const myWorker = new SharedWorker("worker.js");

// Communication happens via ports
myWorker.port.start();
myWorker.port.postMessage("Hello from main!");

myWorker.port.onmessage = (e) => {
  console.log("Message received from worker", e.data);
};`,
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
      content: 'Q: Why can\'t Web Workers access the DOM?\\nA: JavaScript engines are not designed to handle concurrent DOM access from multiple threads. Restricting workers to message-passing prevents complex race conditions and deadlocks that would occur if two threads tried to modify the same DOM element simultaneously.'
    },
    {
      type: 'faq',
      content: 'Q: What is a Transferable Object?\\nA: It is an object (like \\`ArrayBuffer\\`, \\`MessagePort\\`, or \\`ImageBitmap\\`) that can be transferred between threads rather than copied. This is much faster for large data because it moves memory ownership rather than serializing and deserializing data.'
    },
    {
      type: 'faq',
      content: 'Q: When should you NOT use a Web Worker?\\nA: Don\'t use them for small tasks. The overhead of creating a worker and the latency of message passing can outweigh the benefits of parallelization for simple calculations. They are best reserved for tasks taking >50ms.'
    }
  ]
};
