import type { NoteContent } from '../../../types';
import tdzSvg from '../../../../assets/diagrams/frontend/js/tdz.svg?raw';

export const content: NoteContent = {
  id: 'js-8',
  moduleId: 'js',
  order: 5,
  group: 'Core Foundations',
  title: 'let, const & Temporal Dead Zone',
  description: 'Block-scoped variables and the phase where they are uninitialized.',
  sections: [
    { 
      type: 'text', 
      content: 'Introduced in ES6, `let` and `const` were designed to overcome the limitations of `var`, specifically its lack of block-scoping and its unpredictable hoisting behavior. The fundamental difference lies in where the JavaScript engine stores these variables during the Memory Creation Phase.' 
    },
    { 
      type: 'callout', 
      content: 'Variables declared with "var" are attached to the Global Object (window/this). However, "let" and "const" are stored in a separate memory space called the Script Scope.', 
      metadata: { type: 'architecture', title: 'Memory Isolation' } 
    },
    { 
      type: 'diagram', 
      content: tdzSvg 
    },
    { 
      type: 'text', 
      content: 'The Temporal Dead Zone (TDZ) is the duration between the start of the block and the actual line where the variable is initialized. If you try to access a `let` or `const` variable inside its TDZ, the engine throws a `ReferenceError`.' 
    },
    { 
      type: 'code', 
      content: '// 1. The TDZ in Action\n// console.log(a); // Uncaught ReferenceError\nlet a = 10;\nconsole.log(a); // 10\n\n// 2. var behaves differently\nconsole.log(b); // undefined (No TDZ for var)\nvar b = 20;', 
      metadata: { language: 'javascript' } 
    },
    { 
      type: 'text', 
      content: '`const` is even stricter than `let`. It requires immediate initialization during declaration and prevents any reassignment of the binding. Note that for objects and arrays declared with `const`, the reference is fixed, but the internal properties can still be mutated.' 
    },
    { 
      type: 'code', 
      content: 'const user = { name: "Vin" };\nuser.name = "Nexus"; // Works! (Mutation)\n\n// user = { name: "Other" }; // TypeError: Assignment to constant variable', 
      metadata: { language: 'javascript' } 
    },
    { 
      type: 'callout', 
      content: 'Temporal Dead Zone exists even for functions if they are assigned to let/const variables (Function Expressions). Always declare your variables at the top of their scope to minimize the TDZ surface area.', 
      metadata: { type: 'warning', title: 'TDZ Best Practice' } 
    },
    { 
      type: 'text', 
      content: 'Corner Case: SyntaxError vs ReferenceError. If you declare two variables with the same name using `let` in the same scope, JS will throw a SyntaxError during the parsing phase itself, before even executing a single line. This is different from the TDZ ReferenceError which occurs during execution.' 
    },
    { 
      type: 'code', 
      content: 'let x = 10;\n// let x = 20; // Uncaught SyntaxError: Identifier "x" has already been declared', 
      metadata: { language: 'javascript' } 
    },
    {
      type: 'callout',
      content: 'INTERVIEW HQ (FAQs)',
      metadata: { type: 'architecture', title: 'Preparation Zone' }
    },
    {
      type: 'faq',
      content: 'Q: Why is let/const not attached to the window object?\nA: For security and memory isolation. They live in a "Script" scope to prevent accidental global property collisions.'
    },
    {
      type: 'faq',
      content: 'Q: If I declare an object with "const", can I change its values?\nA: Yes. const prevents "reassignment" of the reference, but it does not make the object value "immutable".'
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between ReferenceError and SyntaxError in TDZ?\nA: SyntaxError happens during the parsing phase (e.g., re-declaring let). ReferenceError happens during the execution phase (e.g., accessing before initialization).'
    }
  ]
};
