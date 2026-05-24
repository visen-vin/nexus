import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-3',
  moduleId: 'js',
  order: 3,
  group: 'Core Foundations',
  title: 'The Call Stack',
  description: 'The engine\'s single "brain" for managing order of execution and function lifecycle.',
  sections: [
    { 
      type: 'text', 
      content: 'JavaScript is single-threaded, meaning it has only **one Call Stack**. The Call Stack is a primitive data structure that uses the **LIFO (Last In, First Out)** principle to manage **Execution Contexts**. It tracks exactly where the program is in its execution: which function is currently running and which ones are waiting to resume.' 
    },
    { 
      type: 'callout', 
      content: 'The Call Stack doesn\'t just store function names; it stores entire **Execution Contexts** (Memory + Code). The GEC (Global Execution Context) is the first to arrive and the last to leave.', 
      metadata: { type: 'architecture', title: 'LIFO Dynamics' } 
    },
    {
      type: 'heading',
      content: 'The Push & Pop Cycle',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'When a function is **invoked**, the JS Engine creates a new context and **Pushes** it onto the stack. When the function **returns** or finishes, its context is **Popped** off, and the engine resumes execution in the context immediately below it.' 
    },
    { 
      type: 'interactive', 
      content: 'CallStackVisualizer' 
    },
    { 
      type: 'code', 
      content: 'function first() {\n  second();\n  console.log("First done");\n}\n\nfunction second() {\n  console.log("Second running");\n}\n\nfirst();\n\n// STACK TRACE:\n// 1. [GEC] pushed\n// 2. [GEC, first()] pushed\n// 3. [GEC, first(), second()] pushed -> "Second running"\n// 4. [GEC, first()] popped (second finished)\n// 5. "First done" printed\n// 6. [GEC] popped (first finished)', 
      metadata: { language: 'javascript' } 
    },
    {
      type: 'heading',
      content: 'Advanced Corner Case: Recursion & Overflows',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'Recursion is when a function calls itself. Each recursive call adds a new frame to the stack. If there is no **Base Case** (exit condition), the stack grows until it exceeds the browser\'s memory limit, triggering a **Stack Overflow**.' 
    },
    { 
      type: 'callout', 
      content: 'Modern engines (like V8) have a stack limit of roughly ~10,000 to 15,000 frames. Exceeding this throws a `RangeError: Maximum call stack size exceeded`.', 
      metadata: { type: 'runtime', title: 'Memory Boundaries' } 
    },
    { 
      type: 'code', 
      content: '// 1. Safe Recursion (Factorial)\nfunction fact(n) {\n  if (n <= 1) return 1; \n  return n * fact(n - 1);\n}\n\n// 2. The Boom (Stack Overflow)\nfunction crash() {\n  return crash(); \n}\n// crash(); // Error: Maximum call stack size exceeded', 
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
      metadata: { type: 'architecture', title: 'Stack Forensics' }
    },
    {
      type: 'faq',
      content: 'Q: What is a Stack Trace and how is it useful?\nA: A Stack Trace is a report that shows the active stack frames at a specific point in time (usually during an error). It helps developers trace back the nested function calls that led to a bug.'
    },
    {
      type: 'faq',
      content: 'Q: Does "Async" code like setTimeout run on the Call Stack?\nA: No. Async callbacks are offloaded to **Web APIs** and wait in the **Callback Queue**. They only enter the Call Stack via the **Event Loop** when the stack is completely empty.'
    },
    {
      type: 'faq',
      content: 'Q: What is Tail Call Optimization (TCO)?\nA: TCO is a feature (standard in ES6 but only fully implemented in Safari/Webkit) where the engine reuses the same stack frame for recursive calls if the call is in the "tail position," preventing stack overflows.'
    }
  ]
};
