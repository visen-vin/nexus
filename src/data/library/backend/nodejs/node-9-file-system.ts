import type { NoteContent } from '../../../types';
import fileSystemSvg from '../../../../assets/diagrams/backend/nodejs/file-system.svg?raw';

export const content: NoteContent = {
  id: 'node-9',
  moduleId: 'node',
  order: 104,
  group: 'Node.js Core',
  title: 'File System API',
  description: 'Master the Node.js fs module. Compare blocking synchronous calls, asynchronous callbacks, and Promise wrappers. Learn low-level file descriptor lifecycle management and how to prevent system file handle leaks.',
  sections: [
    {
      type: 'diagram',
      content: fileSystemSvg
    },
    {
      type: 'text',
      content: 'Interacting with files on a storage drive is one of the most common tasks for a backend server. Node.js provides a robust native **`fs` (File System)** module to handle file operations.\n\nBecause filesystem operations are fundamentally blocking at the operating system level, libuv routes all asynchronous `fs` calls to its **Worker Thread Pool** under the hood. To give engineers maximum control over concurrency and code readability, Node.js provides three distinct paradigms to interact with the file system: **Synchronous**, **Callback-based**, and **Promise-based** APIs.'
    },
    {
      type: 'heading',
      content: '1. The Three FS Paradigms',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Here is how the three paradigms differ in operation:\n\n* **Synchronous (e.g. `fs.readFileSync`)**: Blocks the main V8 execution thread completely while the storage drive reads the file. This blocks the event loop entirely. It is highly useful and safe during application **initialization** (e.g., reading configuration files or SSL keys at startup), but must never be used inside active HTTP request-response handlers.\n* **Callback-based (e.g. `fs.readFile`)**: The traditional asynchronous approach. It dispatches the operation to a libuv worker thread and returns immediately, executing a provided callback function when completed. It uses the standard Node.js **error-first callback** pattern `(err, data) => {}`.\n* **Promise-based (e.g. `fsPromises.readFile`)**: A modern wrapper introduced in Node.js 10 that exposes standard JavaScript Promises. This allows developers to write clean, synchronous-looking asynchronous code using `async/await` and traditional `try/catch` error blocks.'
    },
    {
      type: 'code',
      content: `// 1. Synchronous (Blocking) - Use ONLY during bootstrap/startup!
import fs from 'fs';
const config = JSON.parse(fs.readFileSync('config.json', 'utf-8'));

// 2. Callback-based (Asynchronous, Traditional)
fs.readFile('data.txt', 'utf-8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }
  console.log('Callback file content:', data);
});

// 3. Promises & Async/Await (Asynchronous, Modern)
import fsPromises from 'fs/promises';

async function readFileModern() {
  try {
    const data = await fsPromises.readFile('data.txt', 'utf-8');
    console.log('Promises file content:', data);
  } catch (err) {
    console.error('Modern reading caught error:', err.message);
  }
}
readFileModern();`,
      metadata: { language: 'javascript', title: 'The Three File System Paradigms' }
    },
    {
      type: 'heading',
      content: '2. Low-Level Operations & File Descriptors',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'High-level methods like `fs.readFile()` read the entire file into a buffer in memory. For extremely large files (e.g., gigabyte log files), this will exhaust the server\'s heap space. In these cases, you must use low-level operations using **File Descriptors (FD)**.\n\nA File Descriptor is a unique numeric integer assigned by the operating system representing an active handle to an open file. You open a file using `fs.open()`, read/write small chunks using the FD pointer with `fs.read()` or `fs.write()`, and critically, **close** the file using `fs.close()` when finished. Failing to close active file descriptors leads to system-level **resource leaks**, eventually throwing a fatal OS error: `EMFILE: too many open files`.'
    },
    {
      type: 'code',
      content: `import fsPromises from 'fs/promises';

async function processFileManual() {
  let fileHandle;
  try {
    // 1. Open file and retrieve a FileHandle (which wraps the numeric File Descriptor)
    fileHandle = await fsPromises.open('large-log.txt', 'r');
    
    const buffer = Buffer.alloc(1024); // Allocate a small 1KB chunk read buffer
    
    // 2. Read exactly 1KB from the file starting at offset 0
    const { bytesRead } = await fileHandle.read(buffer, 0, 1024, 0);
    console.log(\`Read \${bytesRead} bytes: \`, buffer.subarray(0, bytesRead).toString());
    
  } catch (err) {
    console.error('Low level open failure:', err);
  } finally {
    // 3. CRITICAL: Always close the file descriptor in a finally block to prevent leakage!
    if (fileHandle) {
      await fileHandle.close();
      console.log('File descriptor closed safely.');
    }
  }
}
processFileManual();`,
      metadata: { language: 'javascript', title: 'Managing the File Descriptor lifecycle' }
    },
    {
      type: 'callout',
      content: 'For large file processing or transferring data between files and networks, do not read entire files using low-level buffers manually. Instead, use the native **Streams API** (e.g., `fs.createReadStream()`) which automates chunk buffering and backpressure.',
      metadata: { type: 'architecture', title: 'Streams vs. Raw File Descriptors' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: When is it appropriate to use synchronous fs methods like fs.readFileSync()?\nA: Synchronous methods should only be used during the **initialization/bootstrapping phase** of an application (e.g., reading static config files, parsing SSL certificates on server start). Using them inside request handlers will block the single main execution thread, causing all concurrent user requests to stall.'
    },
    {
      type: 'faq',
      content: 'Q: What is a File Descriptor (FD), and why is closing them critical?\nA: A File Descriptor is a unique, non-negative integer returned by the operating system kernel when opening a file. It acts as an active reference pointer. If you open files using low-level methods and forget to close them, you create a resource leak. The OS has a hard process limit on open handles; exceeding this crashes the server with an `EMFILE` error.'
    },
    {
      type: 'faq',
      content: 'Q: How does fs.readFile differ from fs.createReadStream under the hood?\nA: `fs.readFile()` reads the **entire file** into system RAM, allocating a buffer equal to the file\'s complete size before triggering its callback. This is prone to memory crashes with large files. `fs.createReadStream()` reads files in small sequential chunks (default 64KB) over time, keeping the memory footprint constant (O(1) space complexity).'
    }
  ]
};
