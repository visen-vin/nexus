import type { NoteContent } from '../../../types';
import buffersSvg from '../../../../assets/diagrams/backend/nodejs/buffers.svg?raw';

export const content: NoteContent = {
  id: 'node-7',
  moduleId: 'node',
  order: 102,
  group: 'Node.js Core',
  title: 'Buffers and Raw Memory',
  description: 'Deep dive into binary memory in Node.js. Master the Buffer class, binary data manipulation, slab memory allocation, and the critical security differences between Buffer.alloc() and Buffer.allocUnsafe().',
  sections: [
    {
      type: 'diagram',
      content: buffersSvg
    },
    {
      type: 'text',
      content: 'Historically, JavaScript was designed to run inside browsers where it only dealt with strings, numbers, and basic objects. It had no native way to handle raw binary streams of data, such as images, compressed archives, or raw TCP network packets.\n\nTo solve this, Node.js introduced the **`Buffer`** class. A Buffer represents a **fixed-length sequence of bytes** allocated in raw, physical memory **outside the V8 JavaScript heap**. In modern JavaScript, `Buffer` is built on top of the ES6 `Uint8Array` typed array, but it includes extensive optimized Node-specific C++ bindings for high-performance I/O.'
    },
    {
      type: 'heading',
      content: '1. Memory Allocation: alloc vs. allocUnsafe',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When allocating a new Buffer of a specific size, Node.js provides two primary allocation methods with completely different safety profiles:\n\n* **`Buffer.alloc(size)`**: Allocates a segment of memory of the specified size and **completely fills it with zeros**. This ensures that the buffer is "clean" and contains no residual data, making it highly secure but slightly slower due to the initialization pass.\n* **`Buffer.allocUnsafe(size)`**: Allocates a segment of raw memory **without initializing it**. This is extremely fast because it bypasses zero-filling. However, it is labeled **unsafe** because the allocated memory segment may contain sensitive "garbage" data (like passwords, environmental variables, or database payloads) left behind by previous operating system actions or other applications. If this buffer is leaked to a client, it creates a major security vulnerability.'
    },
    {
      type: 'code',
      content: `// 1. Safe Allocation (initialized to zeros)
const safeBuf = Buffer.alloc(10);
console.log(safeBuf); // <Buffer 00 00 00 00 00 00 00 00 00 00>

// 2. Unsafe Allocation (extremely fast, but contains active garbage memory)
const unsafeBuf = Buffer.allocUnsafe(10);
console.log(unsafeBuf); // May show random residual byte sequences (e.g. <Buffer a3 1f 00 24 5e ...>)

// Crucial: ALWAYS overwrite or fill unsafe buffers before exposing them!
unsafeBuf.fill(0); // Manually cleaning the memory`,
      metadata: { language: 'javascript', title: 'Buffer Allocation Safety Comparison' }
    },
    {
      type: 'heading',
      content: '2. Slab Allocation & The Buffer Pool',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To avoid the high overhead of making frequent operating system system calls to allocate tiny chunks of raw C++ memory, Node.js pre-allocates a single large **8KB (8192 bytes)** block of memory called a **Slab**.\n\nWhen you request a small buffer (e.g., `< 4KB` via `Buffer.allocUnsafe`), Node.js slices out a small window from this pre-allocated 8KB slab rather than allocating fresh system RAM. This optimization (slab allocation) makes buffer operations extremely fast, but it means that a tiny, active buffer slice can keep a large 8KB parent slab pinned in memory, preventing garbage collection.'
    },
    {
      type: 'code',
      content: `// String to Buffer Conversion with encoding
const buf = Buffer.from('Hello World', 'utf-8');

console.log(buf); // <Buffer 48 65 6c 6c 6f 20 57 6f 72 6c 64> (Raw Hex Bytes!)
console.log(buf.toString('hex')); // "48656c6c6f20576f726c64"
console.log(buf.toString('base64')); // "SGVsbG8gV29ybGQ="

// Slicing Buffers creates a new window on the SAME memory block (no copying!)
const sliced = buf.subarray(0, 5); // "Hello"
sliced[0] = 0x4a; // Change 'H' (0x48) to 'J' (0x4a)

console.log(buf.toString()); // "Jello World"! The original buffer was modified.`,
      metadata: { language: 'javascript', title: 'Encoding, Base64, and Subarrays' }
    },
    {
      type: 'callout',
      content: 'When writing binary APIs, do not use `new Buffer()` constructor. It has been deprecated because calling it with a number (e.g. `new Buffer(100)`) behaves like `Buffer.allocUnsafe(100)`, introducing silent security bugs. Always use `Buffer.alloc` or `Buffer.from`.',
      metadata: { type: 'warning', title: 'Deprecated Buffer Constructor' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: What is a Buffer in Node.js, and where is its memory allocated?\nA: A Buffer is a class in Node.js designed to represent and manipulate fixed-length sequences of raw binary bytes. Unlike standard JavaScript objects or arrays, a Buffer\'s actual memory is allocated **outside the V8 JavaScript heap** in external, physical system RAM, and accessed via V8 C++ bindings.'
    },
    {
      type: 'faq',
      content: 'Q: What are the security risks associated with Buffer.allocUnsafe()?\nA: `Buffer.allocUnsafe()` allocates a block of memory without zero-filling it. Because the memory is not overwritten, it still contains whatever residual binary data was stored there previously (e.g., HTTP headers, file contents, passwords). If this uninitialized buffer is sent to a client or logged, it poses a major risk of leaking sensitive server data.'
    },
    {
      type: 'faq',
      content: 'Q: How does slicing a Buffer differ from slicing a standard JavaScript Array?\nA: Slicing a standard JS Array creates a shallow copy of the elements in new memory. Slicing a Buffer (using `subarray()`) **does not copy memory**. Instead, it creates a new Buffer wrapper that points directly to the exact same segment of raw system memory as the parent buffer. Modifying the slice will directly modify the original buffer.'
    }
  ]
};
