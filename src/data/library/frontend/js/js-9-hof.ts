import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-9',
  moduleId: 'js',
  order: 9,
  group: 'Functions & Objects',
  title: 'First Class & HOF',
  description: 'How functions as first-class citizens enable functional programming patterns in JavaScript.',
  sections: [
    {
      type: 'text',
      content: 'In JavaScript, functions are **First-Class Citizens**. This means they are treated like any other variable: they can be assigned to values, passed as arguments, and returned from other functions. This core characteristic is what makes **Higher-Order Functions (HOFs)** possible, forming the backbone of modern functional-style JavaScript.'
    },
    {
      type: 'callout',
      content: 'A Higher-Order Function is a function that does at least one of the following: takes one or more functions as arguments, or returns a function as its result.',
      metadata: { type: 'architecture', title: 'The HOF Definition' }
    },
    {
      type: 'heading',
      content: 'Functions are Objects',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Under the hood, functions in JavaScript are actually special types of objects (specifically, "Action Objects"). Because they are objects, they possess built-in properties like \\`name\\` and \\`length\\`, and you can even attach custom properties to them.'
    },
    {
      type: 'code',
      content: `function sayHi(name) {
  console.log(\`Hi, \${name}\`);
  sayHi.counter++; // Custom property on a function object
}
sayHi.counter = 0;

sayHi("Alice");
console.log(sayHi.name);    // "sayHi"
console.log(sayHi.length);  // 1 (number of parameters)
console.log(sayHi.counter); // 1`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Common HOF Patterns',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'You likely use HOFs every day through Array methods like \\`map\\`, \\`filter\\`, and \\`reduce\\`. Another powerful pattern is the **Decorator**, a HOF that wraps another function to enhance its behavior without modifying the original code.'
    },
    {
      type: 'callout',
      content: 'Decorators are excellent for cross-cutting concerns like logging, caching (memoization), or access control.',
      metadata: { type: 'runtime', title: 'The Decorator Pattern' }
    },
    {
      type: 'code',
      content: `// A simple caching (memoization) HOF
function withCache(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

const expensiveAdd = (a, b) => {
  console.log("Computing...");
  return a + b;
};

const cachedAdd = withCache(expensiveAdd);
console.log(cachedAdd(2, 3)); // "Computing...", 5
console.log(cachedAdd(2, 3)); // 5 (returned from cache)`,
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
      metadata: { type: 'architecture', title: 'Mastery Check' }
    },
    {
      type: 'faq',
      content: 'Q: Why are functions called "First-Class Citizens" in JS?\\nA: Because they can be assigned to variables, passed as arguments to other functions, and returned from functions, just like any other data type (strings, numbers, objects).'
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between a Callback and a Higher-Order Function?\\nA: They are two sides of the same coin. The function being **passed in** is the Callback, while the function **receiving** it (and potentially calling it) is the Higher-Order Function.'
    },
    {
      type: 'faq',
      content: 'Q: Can you explain the "length" property of a function object?\\nA: The \\`length\\` property returns the number of formal parameters defined in the function signature, excluding rest parameters (\\`...args\\`). It is often used for function introspection in library development.'
    }
  ]
};
