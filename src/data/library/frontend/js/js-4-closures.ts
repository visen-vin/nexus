import type { NoteContent } from '../../../types';
import closureSvg from '../../../../assets/diagrams/frontend/js/closure.svg?raw';

export const content: NoteContent = {
  id: 'js-4',
  moduleId: 'js',
  order: 6,
  group: 'Functions & Objects',
  title: 'Closures',
  description: 'How functions retain access to their lexical scope after execution.',
  sections: [
    {
      type: 'text',
      content: 'A **Closure** is the combination of a function and the **Lexical Environment** in which it was declared. In simpler terms: when a function is created, it carries an invisible backpack containing all the variables from its outer scope at the time of its creation. This backpack persists even after the outer function has returned and its **Execution Context** has been popped off the Call Stack.'
    },
    {
      type: 'diagram',
      content: closureSvg
    },
    {
      type: 'callout',
      content: 'Every function in JavaScript is a closure. Even a top-level function closes over the **Global Lexical Environment**. The concept only becomes visible and useful when an inner function references variables from an outer function.',
      metadata: { type: 'architecture', title: 'Universal Closures' }
    },
    {
      type: 'heading',
      content: 'How Closures Work Internally',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When the JS Engine creates a function object, it attaches a hidden `[[Environment]]` property to it. This property holds a reference to the **Lexical Environment** of the scope in which the function was defined — not where it is called. When the function executes and needs to resolve a variable, it first checks its own scope, then follows `[[Environment]]` up the chain.'
    },
    {
      type: 'code',
      content: 'function outer() {\n  var a = 7;\n  function inner() {\n    console.log(a); // "a" resolved via [[Environment]]\n  }\n  return inner;\n}\n\nconst z = outer(); // outer() is done — popped from stack\nz(); // Output: 7 — "a" still accessible via closure',
      metadata: { language: 'javascript' }
    },
    {
      type: 'callout',
      content: 'The **Garbage Collector** cannot reclaim the memory of `a` as long as `inner` (or `z`) is alive and holds a reference to its outer Lexical Environment. This is why closures can cause **memory leaks** if not managed carefully.',
      metadata: { type: 'warning', title: 'Memory Implications' }
    },
    {
      type: 'heading',
      content: 'Real-World Use Cases',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Closures are the backbone of many powerful JavaScript patterns:\n\n- **Data Encapsulation / Private Variables**: Simulate private state that cannot be accessed from outside.\n- **Function Factories**: Generate specialised functions with pre-configured behaviour.\n- **Memoization**: Cache expensive computation results in the outer scope.\n- **Event Handlers & Callbacks**: Retain access to loop variables or component state.'
    },
    {
      type: 'code',
      content: '// 1. Data Encapsulation (Module Pattern)\nfunction createCounter() {\n  let count = 0; // private — not accessible directly\n  return {\n    increment: () => ++count,\n    decrement: () => --count,\n    value: () => count\n  };\n}\nconst counter = createCounter();\ncounter.increment(); // 1\ncounter.increment(); // 2\nconsole.log(counter.value()); // 2\n// console.log(count); // ReferenceError — truly private\n\n// 2. Function Factory\nfunction multiplier(factor) {\n  return (number) => number * factor;\n}\nconst double = multiplier(2);\nconst triple = multiplier(3);\nconsole.log(double(5));  // 10\nconsole.log(triple(5));  // 15',
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The Classic Closure Trap: Loops',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The most common closure interview question involves `var` inside a loop. Because `var` is **function-scoped**, all callbacks share the same single binding of `i`. By the time any callback runs, the loop has completed and `i` is its final value.'
    },
    {
      type: 'code',
      content: '// THE TRAP — var is function-scoped, all share same "i"\nfor (var i = 1; i <= 3; i++) {\n  setTimeout(() => console.log(i), 1000);\n}\n// Output: 4, 4, 4 (not 1, 2, 3!)\n\n// FIX 1 — let creates a NEW binding per iteration\nfor (let i = 1; i <= 3; i++) {\n  setTimeout(() => console.log(i), 1000);\n}\n// Output: 1, 2, 3\n\n// FIX 2 — IIFE to create a new scope manually\nfor (var i = 1; i <= 3; i++) {\n  ((j) => setTimeout(() => console.log(j), 1000))(i);\n}\n// Output: 1, 2, 3',
      metadata: { language: 'javascript' }
    },
    {
      type: 'callout',
      content: 'React\'s **stale closure** bug is the same trap in disguise. Inside a `useEffect` with an empty dependency array `[]`, the callback closes over the initial render\'s state value and never updates. Always list dependencies correctly.',
      metadata: { type: 'runtime', title: 'React Connection' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Closure Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is a closure in JavaScript?\nA: A closure is a function that retains access to its **Lexical Environment** (outer scope variables) even after the outer function has returned. It is formed when an inner function references variables from an outer function.'
    },
    {
      type: 'faq',
      content: 'Q: What is the output of the classic loop-closure bug with var?\nA: All callbacks print the same final value of `i` (e.g., 4 if the loop runs to 3). This is because `var` is function-scoped — all callbacks share one binding. Fix: use `let` (block-scoped, new binding per iteration) or an IIFE.'
    },
    {
      type: 'faq',
      content: 'Q: Can closures cause memory leaks? How?\nA: Yes. If a closure holds a reference to a large outer scope, the Garbage Collector cannot free that memory as long as the closure is alive. Common case: event listeners attached to DOM nodes that hold references to entire component scopes. Always remove listeners when done.'
    }
  ]
};
