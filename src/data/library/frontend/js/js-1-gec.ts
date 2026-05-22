import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-1',
  moduleId: 'js',
  order: 1,
  group: 'Core Foundations',
  title: 'How JS Works & GEC',
  description: 'Internal mechanics of the V8 Engine and the Call Stack lifecycle.',
  sections: [
    { 
      type: 'text', 
      content: 'JavaScript is defined as a **synchronous, single-threaded** language. This means it has exactly one **Call Stack** and can execute only one command at a time in a specific order. To manage this process, the **JS Engine** creates a wrapper called the **Execution Context (EC)**.' 
    },
    {
      type: 'heading',
      content: 'Interactive GEC Lifecycle',
      metadata: { level: 2 }
    },
    { 
      type: 'interactive', 
      content: 'ExecutionContextVisualizer' 
    },
    { 
      type: 'heading',
      content: 'Internal Components',
      metadata: { level: 3 }
    },
    { 
      type: 'text', 
      content: 'An **Execution Context** is logically divided into two distinct components:\n1. **Memory Component** (also known as the *Variable Environment*): This is where variables and functions are stored as key-value pairs.\n2. **Code Component** (also known as the *Thread of Execution*): This is the place where code is processed line-by-line.' 
    },
    {
      type: 'heading',
      content: 'The Two-Phase Execution Cycle',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'When you run a script, the **Global Execution Context (GEC)** is created in two distinct phases:' 
    },
    {
      type: 'heading',
      content: 'Phase 1: Memory Creation',
      metadata: { level: 3 }
    },
    { 
      type: 'text', 
      content: 'The engine scans the code and allocates memory for all variables and functions. Variables are initialized with the special value `undefined`, while function declarations are stored in their entirety.' 
    },
    {
      type: 'heading',
      content: 'Phase 2: Code Execution',
      metadata: { level: 3 }
    },
    { 
      type: 'text', 
      content: 'The engine traverses the code again, this time assigning actual values to variables and invoking functions.' 
    },
    { 
      type: 'callout', 
      content: 'In the **Global Context**, the JS engine automatically creates two artifacts: a `window` object (in browsers) and the `this` keyword, which initially points to `window`.', 
      metadata: { type: 'runtime', title: 'Global Artifacts' } 
    },
    { 
      type: 'code', 
      content: '// Global Scope Demonstration\nvar x = 10;\nfunction getName() {\n  console.log("Nexus");\n}\n\nconsole.log(window.x); // Output: 10\nconsole.log(this.x);   // Output: 10\ngetName();             // Output: "Nexus"', 
      metadata: { language: 'javascript' } 
    },
    {
      type: 'heading',
      content: 'Strict Mode & The Global Object',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'A critical corner case is **"Strict Mode"**. When `"use strict"` is enabled, the behavior of the `this` keyword changes. Inside a traditional function in the global scope, `this` will be `undefined` instead of `window`. This prevents developers from accidentally polluting the **Global Object**.' 
    },
    { 
      type: 'code', 
      content: '"use strict";\nfunction checkThis() {\n  console.log(this); \n}\ncheckThis(); // Result: undefined', 
      metadata: { language: 'javascript' } 
    },
    { 
      type: 'callout', 
      content: 'For every function invocation, a brand new **Function Execution Context** is created. Once the function returns, its entire context is **popped off** the **Call Stack** and immediately garbage collected.', 
      metadata: { type: 'warning', title: 'Memory Lifecycle' } 
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Context Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: Is JavaScript truly single-threaded?\nA: Yes, at its core JS engine has only one **Call Stack**. However, it can handle asynchronous tasks by offloading them to **Browser Web APIs**, which then use the **Event Loop** to return results.'
    },
    {
      type: 'faq',
      content: 'Q: What is stored in the Memory Component during Phase 1?\nA: All variable declarations (initialized to `undefined`) and full function definitions are stored here.'
    }
  ]
};
