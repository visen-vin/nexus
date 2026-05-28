import type { NoteContent } from '../../../types';
import workerThreadsSvg from '../../../../assets/diagrams/backend/nodejs/worker-threads.svg?raw';

export const content: NoteContent = {
  id: 'node-13',
  moduleId: 'node',
  order: 108,
  group: 'Node.js Core',
  title: 'Worker Threads',
  description: 'Master multi-threaded concurrency in Node.js. Explore the worker_threads module, learn how V8 engine isolates operate, and master fast inter-thread communication using MessagePorts and SharedArrayBuffers.',
  sections: [
    {
      type: 'diagram',
      content: workerThreadsSvg
    },
    {
      type: 'text',
      content: "Node.js runs your JavaScript code on a single thread. This makes standard web operations extremely fast and eliminates standard multi-threading synchronization bugs. However, if your application needs to perform heavy CPU-bound tasks (like rendering video, parsing gigantic JSON strings, or running machine learning algorithms), this single thread will block, halting all other client requests.\n\nTo solve this, Node.js 10.5.0 introduced the **`worker_threads`** module. Unlike child processes or clustering, worker threads allow you to run CPU-heavy JavaScript code in parallel on **separate operating system threads** inside the same process, maximizing CPU utilization."
    },
    {
      type: 'heading',
      content: '1. Thread Isolation: V8 Isolations',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Each Worker Thread spawned by the main thread is not just a basic sub-routine. Each worker operates with complete **V8 Isolation**:\n\n* Its own **V8 Engine instance**\n* Its own **isolated V8 heap** (variables and memory are not shared by default)\n* Its own **libuv Event Loop**\n\nThis means threads cannot directly mutate variables in another thread's space, preserving thread safety. However, V8 isolation introduces a small boot overhead (around 10-20ms and 10-20MB RAM per thread), which is why workers should be kept alive in a **Worker Pool** rather than being spawned and destroyed dynamically on every incoming HTTP request."
    },
    {
      type: 'heading',
      content: '2. Inter-Thread Communication (IPC)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Since heaps are isolated, threads must communicate using messaging channels. Node.js provides three main ways to transfer data between threads:\n\n1. **MessagePort (`postMessage`)**: The default option. Data sent via `postMessage()` is serialized using the HTML5 **Structured Clone Algorithm**, passed through C++ bounds, and deserialized in the receiving thread's heap. This is extremely safe but introduces a small copying cost for huge objects.\n2. **Transfer Lists**: You can transfer ownership of resources (like `ArrayBuffer` or `MessagePort`) from one thread to another. Once transferred, the resource becomes completely inaccessible (cleared) on the sender's thread. This achieves **zero-copy** transfer speed!\n3. **SharedArrayBuffer**: Allows both threads to read and write to the **same raw physical RAM segment** directly. To avoid data races (threads writing to the same byte simultaneously), you must synchronize memory updates using JavaScript's native **`Atomics`** API."
    },
    {
      type: 'code',
      content: `// Unified Worker Example (main.ts and worker.ts in a single file)
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';

if (isMainThread) {
  console.log('--- Main Thread starting CPU Task ---');
  
  // 1. Spawn a worker thread, passing workerData initialization values
  const worker = new Worker(__filename, {
    workerData: { num: 40 }
  });

  // 2. Listen for messages from the worker thread
  worker.on('message', (result) => {
    console.log(\`Result received from Worker: Fibonacci(40) = \${result}\`);
  });

  worker.on('error', (err) => console.error('Worker crashed:', err));
  worker.on('exit', (code) => console.log(\`Worker thread exited with code \${code}\`));
  
} else {
  // --- WORKER THREAD CODE SPACE ---
  const { num } = workerData;
  
  // CPU-heavy calculation: Recursive Fibonacci
  function fib(n: number): number {
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);
  }

  const result = fib(num);
  
  // Send result back to the main thread
  parentPort?.postMessage(result);
}`,
      metadata: { language: 'typescript', title: 'Worker Thread Creation and Communication' }
    },
    {
      type: 'callout',
      content: "Do not use Worker Threads for standard filesystem or network I/O operations. Node's internal libuv APIs already handle I/O asynchronously and far more efficiently on the system level. Spawning worker threads for I/O tasks only adds V8 boot overhead and slows down your application.",
      metadata: { type: 'warning', title: 'Worker Threads Anti-Pattern' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: When should you use Worker Threads instead of the Cluster module in Node.js?\nA: Use **Worker Threads** for CPU-bound computational tasks (e.g., image resizing, cryptography, data processing) inside a single application. Use **Clustering** to scale web servers across multiple CPU cores to handle higher volumes of concurrent I/O requests, since clustering spawns completely separate processes sharing the same TCP port."
    },
    {
      type: 'faq',
      content: "Q: What is V8 Isolation, and what are its memory implications for Worker Threads?\nA: V8 Isolation means that each spawned worker thread gets its own completely isolated V8 engine instance, heap space, and libuv event loop. Variables created in the main thread cannot be accessed directly by the worker thread. Because spawning an isolation instance requires 10-20MB RAM and boot overhead, workers should be managed in a persistent worker pool."
    },
    {
      type: 'faq',
      content: "Q: How does transferring an ArrayBuffer via a transfer list differ from sending it via standard postMessage?\nA: Standard `postMessage` uses the Structured Clone Algorithm to copy the data, creating a duplicate in the target thread's heap (memory-expensive for large arrays). Passing the ArrayBuffer inside a **transfer list** performs a zero-copy transfer of ownership: the raw memory pointer is redirected to the worker, and the array instantly becomes empty and unusable on the main thread."
    }
  ]
};
