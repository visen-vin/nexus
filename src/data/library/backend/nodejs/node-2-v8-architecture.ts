import type { NoteContent } from '../../../types';
import v8ArchitectureSvg from '../../../../assets/diagrams/backend/nodejs/v8-architecture.svg?raw';

export const content: NoteContent = {
  id: 'node-2',
  moduleId: 'node',
  order: 97,
  group: 'Node.js Core',
  title: 'V8 Architecture in Node vs Chrome',
  description: 'Uncover the mechanics of Google V8 inside Node.js compared to Chrome. Understand the JIT compiler pipeline (Ignition & Turbofan), garbage collection differences, heap structures, and environmental capability injections.',
  sections: [
    {
      type: 'diagram',
      content: v8ArchitectureSvg
    },
    {
      type: 'text',
      content: 'The **V8 engine** is Google’s open-source high-performance JavaScript and WebAssembly engine, written in C++. It compiles JavaScript code directly into native machine code before executing it, rather than relying on real-time interpretation. Both Google Chrome and Node.js use the **same core V8 engine** to execute JavaScript, which is why their core ECMAScript behavior is identical.\n\nHowever, V8 is only an execution engine—it has no knowledge of HTML elements, network adapters, or filesystems. To become a functioning environment, V8 must be wrapped. Google Chrome wraps V8 and exposes **Web APIs** (DOM, fetch, localStorage). Node.js wraps V8 and exposes **C++ Bindings** and **libuv** (fs, child_process, crypto, TCP sockets).'
    },
    {
      type: 'heading',
      content: '1. The V8 Execution Pipeline: Ignition & Turbofan',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'V8 uses a **Just-In-Time (JIT)** compiler to achieve near-native execution speed. It does this through a two-tiered compiler pipeline:\n\n1. **Parser & AST**: The raw JS source code is parsed into an **Abstract Syntax Tree (AST)**.\n2. **Ignition (Bytecode Interpreter)**: Ignition reads the AST and generates platform-independent **bytecode**. This allows JavaScript to start running almost instantly without waiting for a full compilation phase.\n3. **Turbofan (Optimizing Compiler)**: As the code runs, V8 profiles execution statistics (identifying "hot" functions that run frequently). Turbofan takes this bytecode along with type feedback and compiles it into highly optimized **native machine code**. If type assumptions change later (e.g. a hot function that always received integers suddenly receives a string), a **deoptimization** occurs, and V8 falls back to Ignition\'s bytecode.'
    },
    {
      type: 'code',
      content: `// How V8 JIT optimizes functions based on type stability
function add(a, b) {
  return a + b;
}

// 1. Ignition executes add() by interpreting bytecode
add(1, 2); 
add(5, 10); // Function becomes "hot" and is flagged

// 2. Turbofan compiles add() to native machine code assuming a and b are integers
// Execution speed becomes incredibly fast!
for(let i=0; i<100000; i++) add(i, i+1);

// 3. Deoptimization: a string is passed instead of an integer
add("hello", "world"); // Turbofan detects shape mismatch, throws away native code, falls back to bytecode`,
      metadata: { language: 'javascript', title: 'V8 Optimization & Deoptimization Cycle' }
    },
    {
      type: 'heading',
      content: '2. V8 Memory Architecture: Heap & Stack',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'V8 divides system memory into two primary zones:\n\n* **The Stack**: Stores primitive values (numbers, booleans, pointers to objects) and local execution frames. Allocation and deallocation are handled automatically via LIFO (Last-In, First-Out) stack pointers.\n* **The Heap**: A large, unstructured memory segment used for storing reference types (objects, arrays, function closures). The heap is dynamically allocated and managed by the V8 **Garbage Collector**.'
    },
    {
      type: 'callout',
      content: 'Unlike the browser, where each tab runs in its own sandboxed OS process with a fresh V8 heap instance, Node.js runs as a single-process server. A memory leak in Node.js can easily exhaust the server\'s entire RAM. You can configure the V8 heap limit in Node.js using the command line flag: `--max-old-space-size=4096` (sets heap limit to 4GB).',
      metadata: { type: 'warning', title: 'Process Limits & Memory Leaks' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: How does the V8 engine achieve JIT compilation, and what is Turbofan\'s role?\nA: V8 uses a multi-tier compilation pipeline. First, code is parsed into an AST and compiled into bytecode by the **Ignition** interpreter, ensuring fast startup. As the code executes, V8 profiles execution paths. "Hot" functions are compiled into native machine code by **Turbofan**, applying aggressive optimizations. If runtime types change, it deoptimizes back to bytecode.'
    },
    {
      type: 'faq',
      content: 'Q: Why can Node.js access the operating system while Google Chrome cannot, even though both run V8?\nA: V8 is just a JavaScript execution engine and has no capabilities of its own. Chrome embeds V8 inside a sandboxed browser environment and injects Web APIs. Node.js embeds V8 in a desktop environment and binds it to C++ wrappers (via `V8::Addon` and C++ templates) connected to the system core and `libuv` APIs.'
    },
    {
      type: 'faq',
      content: 'Q: What causes deoptimization in V8, and how can engineers write V8-friendly code?\nA: Deoptimization occurs when Turbofan\'s speculative optimizations (based on observed types) are invalidated by a change in types (e.g. passing a string to a function that previously only received integers). To write V8-friendly code, developers should maintain type-stability (monomorphic functions/objects) and avoid dynamically changing object shapes (adding/deleting fields at runtime).'
    }
  ]
};
