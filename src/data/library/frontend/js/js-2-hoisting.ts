import type { NoteContent } from '../../../types';
import hoistingSvg from '../../../../assets/diagrams/frontend/js/hoisting.svg?raw';

export const content: NoteContent = {
  id: 'js-2',
  moduleId: 'js',
  order: 2,
  group: 'Core Foundations',
  title: 'Hoisting in JavaScript',
  description: 'Deep-dive into memory allocation for variables and function declarations.',
  sections: [
    { 
      type: 'text', 
      content: 'Hoisting is often incorrectly defined as "moving declarations to the top of the code." Physically, your code stays exactly where it is. Technically, **Hoisting** is the process where the JS Engine allocates memory for variables and functions during the **Memory Creation Phase**, before any code execution begins.' 
    },
    {
      type: 'diagram',
      content: hoistingSvg
    },
    { 
      type: 'callout', 
      content: 'Hoisting is a direct manifestation of the Two-Phase Execution Cycle. It allows JavaScript to be resilient and flexible, enabling patterns like mutual recursion.', 
      metadata: { type: 'architecture', title: 'Virtual Movement' } 
    },
    {
      type: 'heading',
      content: 'The Hoisting Hierarchy',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'Not all declarations are hoisted equally. The JS Engine follows a strict priority: **Function Declarations** take precedence over **Variable Declarations**. If a variable and a function share the same identifier, the function body will occupy that memory slot initially.' 
    },
    { 
      type: 'code', 
      content: 'console.log(typeof myName); // Output: "function" (Hoisted First)\n\nvar myName = "Vin";\nfunction myName() {\n  console.log("I am a function");\n}\n\nconsole.log(typeof myName); // Output: "string" (Overwritten in Execution Phase)', 
      metadata: { language: 'javascript' } 
    },
    {
      type: 'heading',
      content: 'Execution vs Creation Phase',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'In the **Creation Phase**, the engine looks for `var` and `function` keywords. In the **Execution Phase**, it starts executing code line by line. This distinction is critical for understanding why functions can be called before they are declared, but variables return `undefined`.'
    },
    {
      type: 'heading',
      content: 'Declaration Types & Behavior',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'The behavior of hoisting depends heavily on the keyword used:\n\n- **var**: Hoisted and initialized to `undefined`.\n- **let & const**: Hoisted but remain **uninitialized**. They are trapped in the **Temporal Dead Zone (TDZ)**.\n- **Function Declarations**: Hoisted with the **entire body**.\n- **Function Expressions / Arrow Functions**: Treated like variables (hoisted as `undefined` if using `var`).' 
    },
    { 
      type: 'callout', 
      content: 'Attempting to call a `var` function expression before its definition throws a `TypeError` (e.g., `undefined is not a function`), while accessing a `let` variable throws a `ReferenceError` (TDZ).', 
      metadata: { type: 'warning', title: 'The Error Trap' } 
    },
    { 
      type: 'code', 
      content: '// Case 1: Function Expression (var)\ntry { \n  getData(); \n} catch(e) { \n  console.log(e.name); // TypeError \n}\nvar getData = () => {};\n\n// Case 2: TDZ (let)\ntry { \n  console.log(x); \n} catch(e) { \n  console.log(e.name); // ReferenceError \n}\nlet x = 10;', 
      metadata: { language: 'javascript' } 
    },
    {
      type: 'heading',
      content: 'Advanced Hoisting: Classes & Imports',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'Even **ES6 Classes** and **Modules** are subject to hoisting:\n- **Classes**: Like `let/const`, they are hoisted but remain in the TDZ. You cannot instantiate a class before its declaration.\n- **Imports**: `import` statements are **fully hoisted**. They are evaluated before any other code in the module, regardless of their position in the file.' 
    },
    { 
      type: 'code', 
      content: '// Imports work even at the bottom (not recommended practice)\nconsole.log(add(2, 2));\nimport { add } from "./math.js"; \n\n// Classes will fail\n// const car = new Car(); // ReferenceError\nclass Car {}', 
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
      metadata: { type: 'architecture', title: 'Hoisting Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: Why do let and const throw a ReferenceError if they are hoisted?\nA: Because the JS Engine places them in a "Temporal Dead Zone." It reserves memory but forbids access until the initialization is complete to prevent usage of uninitialized data.'
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between "undefined" and "not defined" in the context of hoisting?\nA: "undefined" is a value assigned to a hoisted `var`. "not defined" means the variable was never declared (doesn\'t exist in memory).'
    },
    {
      type: 'faq',
      content: 'Q: Do arrow functions hoist?\nA: Arrow functions are treated as variables. If declared with `var`, they are hoisted as `undefined`. If declared with `let/const`, they are in the TDZ.'
    }
  ]
};
