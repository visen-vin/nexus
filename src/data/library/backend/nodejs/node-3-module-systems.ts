import type { NoteContent } from '../../../types';
import moduleSystemsSvg from '../../../../assets/diagrams/backend/nodejs/module-systems.svg?raw';

export const content: NoteContent = {
  id: 'node-3',
  moduleId: 'node',
  order: 98,
  group: 'Node.js Core',
  title: 'Module Systems',
  description: 'Master the architectural differences between CommonJS (CJS) and ECMAScript Modules (ESM). Deep dive into module resolution, synchronous runtime loads, static compilation, live bindings, caching strategies, and interoperability.',
  sections: [
    {
      type: 'diagram',
      content: moduleSystemsSvg
    },
    {
      type: 'text',
      content: 'For years, Node.js operated exclusively under the **CommonJS (CJS)** module system, which was designed for server-side environments where module files are stored locally and loaded synchronously. However, the browser environment required a standardized, asynchronous module spec, which led to **ECMAScript Modules (ESM)**. ESM is now the official standard for JavaScript, and Node.js fully supports both.\n\nUnderstanding the foundational design divergence between CJS and ESM is vital for managing dependency trees, resolving runtime bugs, and optimizing production bundle sizes.'
    },
    {
      type: 'heading',
      content: '1. CommonJS (CJS): Synchronous Runtime Loading',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'In CommonJS, module loading is **synchronous and dynamic**. When you call `require(\'./module\')`:\n\n1. **Resolution**: Node.js resolves the exact filepath using its resolution algorithm (checking extensions, `package.json` main fields, or `node_modules`).\n2. **Loading**: The file is read from disk synchronously.\n3. **Wrapping**: Node.js wraps the module code inside an IIFE closure providing `exports`, `require`, `module`, `__filename`, and `__dirname` context.\n4. **Execution**: The wrapped script is executed. The exported object is captured on `module.exports` and then cached.\n\nBecause loading is synchronous and happens at runtime, you can write dynamic requires (e.g. inside `if` statements or using variable paths).'
    },
    {
      type: 'code',
      content: `// Dynamic runtime requiring is allowed in CJS
const modulePath = process.env.NODE_ENV === 'development' ? './dev-logger' : './prod-logger';
const logger = require(modulePath); // Synchronous and dynamic!

// Value copying behavior
// config.js
let count = 10;
module.exports = { count, increment: () => count++ };

// main.js
const { count, increment } = require('./config');
console.log(count); // 10
increment();
console.log(count); // Still 10! The exported count was a primitive value copy.`,
      metadata: { language: 'javascript', title: 'CJS Dynamic Loading & Value Copying' }
    },
    {
      type: 'heading',
      content: '2. ES Modules (ESM): Static Analysis & Asynchronous Resolution',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'ECMAScript Modules operate in a three-phase cycle that separates parsing from execution: **Construction (parsing & fetching) -> Linking -> Evaluation**.\n\nBecause the first two phases are **static**, ESM does not execute any module code until the entire dependency graph is constructed and linked. This means you **cannot** write standard dynamic imports inside conditionals (though you can use the asynchronous `import()` function). Additionally, ESM exports are **live bindings** (references to the original memory locations), and ESM supports **Top-Level Await**.'
    },
    {
      type: 'code',
      content: `// Live Bindings in ESM
// config.js
export let count = 10;
export const increment = () => count++;

// main.js
import { count, increment } from './config.js';
console.log(count); // 10
increment();
console.log(count); // 11! ESM provides a live binding (direct read-only reference to memory)

// Top-Level Await (ESM Exclusive)
const data = await fetch('https://api.example.com').then(r => r.json());
export { data };`,
      metadata: { language: 'javascript', title: 'ESM Live Bindings & Top-Level Await' }
    },
    {
      type: 'heading',
      content: '3. Interoperability Rules in Node.js',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Node.js enforces strict rules when mixing CJS and ESM:\n* **CJS in ESM**: ESM files can import CommonJS modules, but only using a default import or by importing the dynamic exports object. Direct named imports of CJS properties will fail static analysis.\n* **ESM in CJS**: CommonJS modules **cannot** use `require()` to import an ESM module, because ESM resolution is asynchronous. Instead, CommonJS must load ESM modules dynamically using the async `import()` function.\n* **File Extensions**: Node treats `.mjs` as ESM, `.cjs` as CJS, and `.js` depends on the `"type"` field in the closest `package.json` ("module" forces ESM).'
    },
    {
      type: 'callout',
      content: 'Because ESM is resolved statically, build tools like Webpack and Rollup can analyze which parts of a module are actually imported and discard unused code. This process is called **tree-shaking** and is not possible with CommonJS modules due to their dynamic nature.',
      metadata: { type: 'architecture', title: 'Tree-Shaking Support' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: What is the core execution difference between CommonJS require() and ES Modules import?\nA: CommonJS `require()` is **synchronous and executes at runtime**, returning a copy of `module.exports` and blocking the thread while reading the file. ES Modules `import` is resolved via **static analysis** before execution. The dependency graph is parsed and linked asynchronously first, and only after linking is the module code evaluated, presenting live memory bindings rather than value snapshots.'
    },
    {
      type: 'faq',
      content: 'Q: Why can\'t you use require() to load an ESM module in a CommonJS context?\nA: `require()` is strictly synchronous, whereas ES Modules resolve asynchronously and can contain asynchronous features like Top-Level Await. If `require()` was allowed to load ESM, it would force the event loop to block synchronously on asynchronous loading. To load ESM inside CommonJS, you must use dynamic import: `import(\'esm-module\')` which returns a Promise.'
    },
    {
      type: 'faq',
      content: 'Q: What are live bindings in ES Modules, and how do they differ from CommonJS exports?\nA: CommonJS exports copy the exported value at the moment of evaluation. If a module variable updates inside the exporter, the importer still holds the old snapshot value. In ESM, imported variables are **live bindings** (read-only references to the exporter\'s actual heap memory slot). When the exporter modifies the variable, the importer sees the change instantly.'
    }
  ]
};
