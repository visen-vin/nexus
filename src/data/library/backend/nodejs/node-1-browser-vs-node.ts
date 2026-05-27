import type { NoteContent } from '../../../types';
import browserVsNodeSvg from '../../../../assets/diagrams/backend/nodejs/browser-vs-node.svg?raw';

export const content: NoteContent = {
  id: 'node-1',
  moduleId: 'node',
  order: 96,
  group: 'Node.js Core',
  title: 'Browser vs. Node.js',
  description: 'Detailed comparison of JavaScript runtime environments. Contrast the sandboxed browser client (window, DOM, storage) with the powerful Node.js server (global, process, fs, path, libuv).',
  sections: [
    {
      type: 'diagram',
      content: browserVsNodeSvg
    },
    {
      type: 'text',
      content: 'JavaScript is a language defined by the ECMAScript specification, but the language itself does not dictate *where* or *how* it executes. To run, JavaScript requires a **runtime environment**. The two most dominant runtime environments in the world are the **Browser** (client-side) and **Node.js** (server-side).\n\nBoth runtimes share the exact same core language engine (e.g., Google\'s **V8 Engine** in Chrome and Node.js), meaning they compile and execute core ECMAScript syntax (variables, functions, classes, promises) identically. However, the **host APIs** they bind to the runtime are completely different, resulting in distinct sandboxing models, global boundaries, and architectural purposes.'
    },
    {
      type: 'callout',
      content: 'Because Node.js does not run inside a browser, host objects like `window`, `document`, and standard HTML DOM elements do not exist. Attempting to execute code that references `window` (e.g., inside server-side rendering or SSR layouts) will cause Node.js to throw a fatal "window is not defined" ReferenceError.',
      metadata: { type: 'warning', title: 'Global Object Boundaries' }
    },
    {
      type: 'heading',
      content: '1. Global Namespaces: window vs. global',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'In the browser, the top-level global execution object is **`window`** (or `self` inside Web Workers). In Node.js, the global namespace is named **`global`**. To write environment-agnostic libraries, modern JavaScript introduced **`globalThis`**, which automatically resolves to `window` in the client and `global` in the server.'
    },
    {
      type: 'code',
      content: `// 1. Browser Client Environment
// window.location.href, document.getElementById() are accessible

// 2. Node.js Server Environment
// console.log(global);
// console.log(process.env); // Direct environment access

// 3. Environment Agnostic
const globalObject = globalThis; // Resolves correctly on both sides`,
      metadata: { language: 'javascript', title: 'Global Namespace resolution' }
    },
    {
      type: 'heading',
      content: '2. Security & Sandboxing Modifiers',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The core philosophical difference is security:\n\n* **Browser Sandbox**: Highly restricted to protect users. You cannot access a user\'s local filesystem directly, execute operating system shell commands, or manage arbitrary raw TCP sockets.\n* **Node.js Environment**: Fully trusted server environment. You have absolute access to the local machine, including reading and writing files via the **`fs`** module, executing binaries via **`child_process`**, and reading environment variables via **`process.env`**.'
    },
    {
      type: 'code',
      content: `// Node.js direct filesystem access
import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), "config.json");

// Read file directly from server disk
fs.readFile(filePath, "utf-8", (err, data) => {
  if (err) throw err;
  console.log(data);
});`,
      metadata: { language: 'javascript', title: 'Server File Reading (Node.js Exclusive)' }
    },
    {
      type: 'callout',
      content: 'Node.js utilizes a non-blocking, event-driven architecture powered under the hood by **libuv** (written in C), whereas browser event loops are heavily optimized around UI rendering frame synchronization and user interaction responsiveness.',
      metadata: { type: 'architecture', title: 'Architectural Event Loop Differences' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Runtime Mastery Prep' }
    },
    {
      type: 'faq',
      content: 'Q: What is globalThis, and what problem does it solve in modern universal JavaScript codebases?\nA: `globalThis` is a standard global property introduced in ES2020 that provides a unified, environment-agnostic way to access the global object. Previously, accessing the global object required environment-specific checks (e.g. checking `typeof window !== "undefined"` in browsers vs `typeof global !== "undefined"` in Node). `globalThis` resolves to the correct global object regardless of the runtime.'
    },
    {
      type: 'faq',
      content: 'Q: Why is there no DOM (Document Object Model) inside Node.js, and what error occurs if you call document.getElementById()?\nA: The DOM is an API provided by web browser clients to represent and render HTML documents. Since Node.js is a server-side runtime designed for server execution, data processing, and scripting, it has no graphical user interface or document viewer. Calling `document.getElementById()` inside Node.js throws a fatal `ReferenceError: document is not defined` because `document` is not bound to Node\'s global scope.'
    },
    {
      type: 'faq',
      content: 'Q: Does Node.js share the same V8 engine as Google Chrome? If so, why are their capabilities so distinct?\nA: Yes, both run on Google\'s high-performance **V8 Engine**, which compiles and executes raw JavaScript code. However, V8 only handles language execution (variables, arrays, loops). The extended capabilities are provided by the surrounding host runtime environments. Chrome wraps V8 with browser-specific APIs (Web APIs like DOM and fetch), while Node.js wraps V8 with system-level C++ bindings (using `libuv` for asynchronous file and network I/O).'
    }
  ]
};
