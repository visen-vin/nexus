import type { NoteContent } from '../../../types';
import streamsMentalModelSvg from '../../../../assets/diagrams/backend/nodejs/streams-mental-model.svg?raw';

export const content: NoteContent = {
  id: 'node-10',
  moduleId: 'node',
  order: 105,
  group: 'Node.js Core',
  title: 'The Stream Mental Model',
  description: 'Grasp the core philosophy of Node.js Streams. Learn why chunk-by-chunk piping achieves O(1) space complexity, how backpressure feedback loops prevent server memory exhaustion, and why pipe() is so powerful.',
  sections: [
    {
      type: 'diagram',
      content: streamsMentalModelSvg
    },
    {
      type: 'text',
      content: 'Imagine a server hosting a 5GB video file. If a client requests that video, and the server reads the entire file into memory using `fs.readFile()` before sending it, the V8 execution heap will immediately overflow and crash the entire process. V8 simply cannot allocate 5GB on its heap.\n\n**Streams** solve this limitation by shifting the processing model from "all-at-once buffering" to **sequential chunk-by-chunk processing**. Instead of holding the entire file in RAM, the server holds only a tiny, fixed-size chunk (e.g., 64KB) in memory at any given millisecond. This reduces the spatial complexity of the operation from **O(N)** (where N is the file size) to **O(1)** (constant memory overhead).'
    },
    {
      type: 'heading',
      content: '1. The Concept of Backpressure',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'While streaming solves memory capacity issues, it introduces a synchronization challenge. What happens when data is being read from a fast source (e.g., a local NVMe solid-state drive pumping data at 2GB/s) and piped to a slow destination (e.g., a client on a slow 3G mobile network consuming data at 100KB/s)?\n\nIf the readable stream keeps reading at full speed, the incoming chunks must accumulate somewhere. They will queue up in the server\'s RAM, waiting to be sent to the network adapter. If this queue grows unchecked, the server will quickly run out of memory and crash.\n\nThis bottleneck is resolved using **Backpressure**. Backpressure is the feedback mechanism where a slow Writable stream signals the fast Readable stream to **stop sending data** until the slow destination catches up.'
    },
    {
      type: 'heading',
      content: '2. The Backpressure Event Loop Lifecycle',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Both Readable and Writable streams have an internal buffer limit called **`highWaterMark`** (default is **16KB** for standard objects, or **64KB** for file system streams). \n\nHere is how the backpressure event lifecycle controls flow:\n\n1. **Writing**: The reader pumps chunks into the writer using `writable.write(chunk)`.\n2. **Threshold Exceeded**: If the writer's internal buffer grows larger than `highWaterMark`, `writable.write()` returns **`false`**. This is the backpressure warning signal.\n3. **Pause**: Upon receiving `false`, the readable stream halts its reading pipeline by calling **`readable.pause()`**.\n4. **Drain Event**: The writable stream continues sending its buffered chunks to the OS kernel. Once its queue is fully cleared, it emits a **`'drain'`** event.\n5. **Resume**: The readable stream listens for the `'drain'` event. Once received, it resumes reading by calling **`readable.resume()`**."
    },
    {
      type: 'code',
      content: `import fs from 'fs';

const readable = fs.createReadStream('source-large.mov');
const writable = fs.createWriteStream('destination.mov');

// The manual backpressure loop (for educational reference):
readable.on('data', (chunk) => {
  // Write to destination and check if buffer threshold is exceeded
  const canContinue = writable.write(chunk);
  
  if (!canContinue) {
    console.log('--- Backpressure detected! Pausing reader ---');
    readable.pause(); 
  }
});

writable.on('drain', () => {
  console.log('--- Destination buffer cleared! Resuming reader ---');
  readable.resume();
});

// The beauty of .pipe():
// readable.pipe(writable); // ← Automatically handles the entire pause/drain cycle under the hood!`,
      metadata: { language: 'javascript', title: 'Manual vs. Automatic pipe() Backpressure' }
    },
    {
      type: 'callout',
      content: 'In modern Node.js, it is highly recommended to use the asynchronous `pipeline` helper from the `stream/promises` module instead of raw `.pipe()`. Unlike `.pipe()`, `pipeline()` automatically handles cleanup, closes open file descriptors, and properly forwards errors from all pipeline segments.',
      metadata: { type: 'architecture', title: 'Piping Best Practice: pipeline()' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: Why are streams critical for handling large files in Node.js, and what is their spatial complexity?\nA: If you load a large file (e.g. 2GB) all at once, the server must allocate 2GB of buffer RAM on the V8 heap, which can cause process out-of-memory crashes. Streams process files sequentially in small, fixed-size chunks (e.g. 64KB), keeping the memory usage completely constant. The spatial complexity is reduced from **O(N)** to **O(1)**.'
    },
    {
      type: 'faq',
      content: 'Q: What is backpressure, and what happens if it is ignored in a streaming pipeline?\nA: Backpressure is the flow-control feedback mechanism that occurs when a writable stream is slower than the readable stream feeding it. If ignored, the incoming chunks will continue to accumulate unchecked in the server\'s RAM waiting to be written, leading to a memory leak and eventual application memory crashes.'
    },
    {
      type: 'faq',
      content: "Q: Explain how highWaterMark, write() returning false, and the \"drain\" event implement flow control.\nA: When chunks are written via `write()`, they queue in the writable buffer. If this buffer exceeds the `highWaterMark` limit, `write()` returns `false` (signaling backpressure), prompting the reader to call `pause()`. Once the writable stream empties its queue, it emits a 'drain' event, signaling the reader to call `resume()` and continue feeding data."
    }
  ]
};
