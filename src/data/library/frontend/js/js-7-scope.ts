import type { NoteContent } from '../../../types';
import scopeSvg from '../../../../assets/diagrams/frontend/js/scope.svg?raw';

export const content: NoteContent = {
  id: 'js-7',
  moduleId: 'js',
  order: 4,
  group: 'Core Foundations',
  title: 'Lexical Scope & Scope Chain',
  description: 'How the JavaScript engine resolves variable identifiers using physical placement.',
  sections: [
    { 
      type: 'text', 
      content: '**Lexical Scope** (also known as Static Scope) refers to the ability of a function scope to access variables from its parent scope based on where that function was physically defined in the source code. The word "lexical" refers to the fact that lexical scoping uses the location where a variable is declared within the source code to determine where that variable is available.' 
    },
    {
      type: 'diagram',
      content: scopeSvg
    },
    { 
      type: 'callout', 
      content: 'JavaScript looks for variables in the current scope. If it doesn\'t find them, it moves up to the outer lexical environment. this persistent link is what we call the **Scope Chain**.', 
      metadata: { type: 'architecture', title: 'The Resolution Path' } 
    },
    {
      type: 'heading',
      content: 'Lexical Environment',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'A **Lexical Environment** is a data structure that holds **identifier-variable mapping**. (here identifier refers to the name of variables/functions, and the variable is the reference to actual object or primitive value). It consists of two parts:\n1. **Environment Record**: The actual place where variable and function declarations are stored.\n2. **Reference to the Outer Environment**: A link to the parent lexical environment.' 
    },
    { 
      type: 'code', 
      content: 'function a() {\n  var b = 10;\n  c();\n  function c() {\n    // "c" is lexically inside "a"\n    // It can access "b" via the scope chain\n    console.log(b); \n  }\n}\n\na(); // Output: 10', 
      metadata: { language: 'javascript' } 
    },
    {
      type: 'heading',
      content: 'Scope Chain traversal',
      metadata: { level: 2 }
    },
    { 
      type: 'text', 
      content: 'When the engine encounters a variable `x`, it follows these steps:\n1. Check the local Environment Record.\n2. If not found, follow the `outer` reference to the parent environment.\n3. Repeat until the variable is found or the Global Environment is reached.\n4. If still not found, throw a `ReferenceError` (in strict mode).' 
    },
    { 
      type: 'callout', 
      content: 'The "Outer" reference of a function is determined entirely by where the function is **written**, not where it is **called**. This is why it is called Static Scoping.', 
      metadata: { type: 'runtime', title: 'Static vs Dynamic' } 
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between Scope and Lexical Environment?\nA: Scope is a conceptual boundary of where a variable is accessible. Lexical Environment is the actual internal implementation (data structure) used by the JS engine to manage those boundaries.'
    },
    {
      type: 'faq',
      content: 'Q: Does the scope chain work downwards?\nA: No. A parent scope cannot access variables defined inside its child functions. The chain is strictly bottom-up (Inner -> Outer -> Global).'
    },
    {
      type: 'faq',
      content: 'Q: What happens if a variable is not found even in the Global Scope?\nA: In non-strict mode, assigning to an undeclared variable creates a global property. In strict mode, it throws a `ReferenceError`. Accessing an undeclared variable always throws a `ReferenceError`.'
    }
  ]
};
