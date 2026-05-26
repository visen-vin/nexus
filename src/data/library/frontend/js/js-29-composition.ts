import type { NoteContent } from '../../../types';
import compositionSvg from '../../../../assets/diagrams/frontend/js/composition.svg?raw';

export const content: NoteContent = {
  id: 'js-29',
  moduleId: 'js',
  order: 29,
  group: 'Functions & Objects',
  title: 'Functional Composition',
  description: 'Building complex logic by combining simple, single-purpose functions into robust pipelines.',
  sections: [
    {
      type: 'text',
      content: 'In functional programming, **Composition** is the act of combining two or more functions to produce a new function. It allows you to build complex transformations from simple, reusable building blocks, adhering to the mathematical principle of $f(g(x))$. This leads to code that is more declarative, easier to test, and highly maintainable.'
    },
    {
      type: 'diagram',
      content: compositionSvg
    },
    {
      type: 'callout',
      content: 'Mental Model: Think of composition as an assembly line. Each function is a specific station that performs one task and passes the result to the next.',
      metadata: { type: 'architecture', title: 'The Pipeline Analogy' }
    },
    {
      type: 'heading',
      content: 'Compose vs. Pipe',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'There are two main ways to compose functions. **Compose** executes functions from right-to-left (mathematical order), while **Pipe** executes them from left-to-right (reading order). Modern developers usually prefer \\`pipe\\` for its readability.'
    },
    {
      type: 'code',
      content: `const pipe = (...fns) => (val) => fns.reduce((acc, fn) => fn(acc), val);
const compose = (...fns) => (val) => fns.reduceRight((acc, fn) => fn(acc), val);

const lowercase = (str) => str.toLowerCase();
const hyphenate = (str) => str.replace(/\\s+/g, '-');

// Right-to-Left (Mathematical)
const slugifyCompose = compose(hyphenate, lowercase);

// Left-to-Right (Readable)
const slugifyPipe = pipe(lowercase, hyphenate);

console.log(slugifyPipe("Nexus JS Guide")); // "nexus-js-guide"`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Currying: The Composition Glue',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To compose functions that require multiple arguments, we use **Currying**. A curried function takes one argument at a time and returns a new function until all arguments are satisfied. This allows us to "pre-configure" functions for use in a pipeline.'
    },
    {
      type: 'callout',
      content: 'Currying transforms a function from \\`f(a, b, c)\\` into \\`f(a)(b)(c)\\`. This enables **Partial Application**, where some arguments are fixed early.',
      metadata: { type: 'runtime', title: 'Functional Glue' }
    },
    {
      type: 'code',
      content: `const multiply = (a) => (b) => a * b;
const add = (a) => (b) => a + b;

const doubleAndAddFive = pipe(
  multiply(2), // Partially applied: 'a' is fixed to 2
  add(5)       // Partially applied: 'a' is fixed to 5
);

console.log(doubleAndAddFive(10)); // (10 * 2) + 5 = 25`,
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
      content: 'Q: What is a Point-Free style?\\nA: It\'s a technique where you define a function without explicitly mentioning the data it operates on (the "points"). E.g., \\`const slugify = pipe(lowercase, hyphenate)\\` is point-free, whereas \\`const slugify = (s) => hyphenate(lowercase(s))\\` is not.'
    },
    {
      type: 'faq',
      content: 'Q: Why is "reduce" or "reduceRight" used to implement pipe/compose?\\nA: Because composition is inherently a reduction: you start with an initial value and "reduce" a list of functions into a single final result by applying them sequentially.'
    },
    {
      type: 'faq',
      content: 'Q: Can you compose asynchronous functions?\\nA: Yes, but you need an async-aware version of pipe. Instead of a standard \\`reduce\\`, you would use \\`async/await\\` inside the reducer to ensure each promise resolves before the next function is called.'
    }
  ]
};
