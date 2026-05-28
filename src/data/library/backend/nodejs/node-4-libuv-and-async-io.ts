import type { NoteContent } from '../../../types';
import libuvAsyncIoSvg from '../../../../assets/diagrams/backend/nodejs/libuv-async-io.svg?raw';

export const content: NoteContent = {
  id: 'node-4',
  moduleId: 'node',
  order: 99,
  group: 'Node.js Core',
  title: 'libuv and Async I/O',
  description: 'Demystify the C library powering Node.js concurrency. Learn the difference between OS kernel-level asynchronous execution (epoll, kqueue) and the libuv worker thread pool, including zlib, crypto, and filesystem thread routing.',
  sections: [
    {
      type: 'diagram',
      content: libuvAsyncIoSvg
    },
    {
      type: 'text',
      content: 'Node.js is frequently described as a **single-threaded** runtime environment, yet it excels at handling thousands of concurrent I/O operations. This high concurrency is not magic—it is made possible by **libuv**, a multi-platform C library originally developed for Node.js that abstract event-driven, asynchronous I/O.\n\nWhile JavaScript execution in Node.js runs on a single main thread, libuv provides a hybrid concurrency model: it leverages the **operating system kernel** for true non-blocking asynchronous execution whenever possible, and falls back to an internal **Worker Thread Pool** for operations that are fundamentally blocking.'
    },
    {
      type: 'heading',
      content: '1. Kernel-Level Non-Blocking I/O (No Threads Needed)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'For network sockets (TCP, UDP, HTTP), modern operating systems provide native asynchronous event notifications. In these cases, **no threads are created** by libuv. Instead, libuv registers the network socket descriptor with the OS kernel and asks to be notified when data arrives or is ready to write. \n\nThe mechanism used is platform-specific:\n* **Linux**: `epoll`\n* **macOS / BSD**: `kqueue`\n* **Windows**: `IOCP` (Input/Output Completion Ports)\n\nThis is incredibly efficient. A single thread (the main event loop thread) can monitor thousands of active network connections simultaneously, as the OS kernel handles the heavy lifting in its own space.'
    },
    {
      type: 'heading',
      content: '2. The libuv Worker Thread Pool',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Some operations are fundamentally blocking because the operating system does not support asynchronous kernel-level APIs for them. For these operations, libuv routes tasks to an internal C++ **Worker Thread Pool**.\n\nBy default, the thread pool size is **4**. You can customize this by setting the environment variable `UV_THREADPOOL_SIZE` before launching your Node.js process (up to a maximum of 1024 threads).\n\nThe following APIs run on the libuv Thread Pool:\n* **File System (`fs`)**: All asynchronous filesystem operations (like `fs.readFile` or `fs.writeFile`) are synchronous at the OS level, so libuv routes them to a worker thread.\n* **Cryptography (`crypto`)**: CPU-heavy tasks like `crypto.pbkdf2()`, `crypto.randomBytes()`, or `crypto.scrypt()` run on threads to avoid blocking the main JS thread.\n* **Compression (`zlib`)**: Compression algorithms (e.g. gzip, brotli) run on worker threads.\n* **DNS Lookup**: Calling `dns.lookup()` translates a hostname to an IP address by calling the blocking getaddrinfo() system call under the hood, running it on the thread pool.'
    },
    {
      type: 'code',
      content: `// Configuring Thread Pool size programmatically (must be set before any I/O calls)
process.env.UV_THREADPOOL_SIZE = '8'; 

import fs from 'fs';
import crypto from 'crypto';

// 1. Thread Pool Task: Cryptography (CPU Heavy)
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, derivedKey) => {
  if (err) throw err;
  console.log('Password Hashed on Worker Thread!');
});

// 2. Thread Pool Task: Asynchronous Filesystem Reading
fs.readFile('large-file.log', 'utf-8', (err, data) => {
  if (err) throw err;
  console.log('File Read Completed on Worker Thread!');
});`,
      metadata: { language: 'javascript', title: 'Routing tasks to the libuv Thread Pool' }
    },
    {
      type: 'callout',
      content: 'Using `dns.lookup` resolves hosts using `/etc/hosts` and blocking OS APIs, running on the thread pool. However, `dns.resolve` uses network queries directly, running completely asynchronously at the kernel level without using any libuv worker threads! Always use `dns.resolve` if thread-pool starvation is a concern.',
      metadata: { type: 'architecture', title: 'DNS Performance gotcha: lookup vs resolve' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: Is Node.js truly single-threaded? Explain the thread model under the hood.\nA: JavaScript execution in Node.js is indeed single-threaded (running on the V8 main event loop thread). However, the underlying Node.js runtime is **multi-threaded**. The C library **libuv** manages a default pool of **4 worker threads** for handling heavy operations like filesystem I/O, cryptography, and compression, while leveraging OS kernel-level loops (epoll/kqueue) for highly concurrent network I/O.'
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between epoll/kqueue and the libuv Thread Pool?\nA: `epoll` (Linux) and `kqueue` (macOS) are OS kernel mechanisms that allow non-blocking asynchronous multiplexing of **network sockets**, running without spawning any threads. The **libuv Thread Pool** is a set of OS-level C++ worker threads used for operations that do not support non-blocking OS APIs, such as filesystem operations, DNS hostname queries, and heavy cryptographic functions.'
    },
    {
      type: 'faq',
      content: 'Q: What is thread-pool starvation, and how can it be resolved?\nA: Thread-pool starvation occurs when all threads in the libuv pool (default 4) are occupied by long-running synchronous/blocking tasks (e.g. hashing 4 passwords simultaneously). This blocks any subsequent filesystem or crypto operations from executing, creating a bottleneck. It can be resolved by increasing the pool size using the environment variable `process.env.UV_THREADPOOL_SIZE` or offloading CPU tasks to Worker Threads.'
    }
  ]
};
