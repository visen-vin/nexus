import type { NoteContent } from '../../../types';
import thisSvg from '../../../../assets/diagrams/frontend/js/this.svg?raw';

export const content: NoteContent = {
  id: 'js-10',
  moduleId: 'js',
  order: 10,
  group: 'Functions & Objects',
  title: 'The "this" Keyword',
  description: 'Mastering dynamic execution context and the "this" binding rules in JavaScript.',
  sections: [
    {
      type: 'text',
      content: 'The \`this\` keyword is one of the most misunderstood aspects of JavaScript. Unlike many other languages where \`this\` is strictly bound to an instance, in JavaScript, **\`this\` is dynamic**. Its value is determined not by where a function is defined, but by **how the function is called**.'
    },
    {
      type: 'diagram',
      content: thisSvg
    },
    {
      type: 'callout',
      content: 'Mental Model: The value of \`this\` is usually the object "before the dot" at the moment of invocation.',
      metadata: { type: 'architecture', title: 'The Call-Site Rule' }
    },
    {
      type: 'heading',
      content: 'Dynamic Binding: "this" is Free',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'In JavaScript, \`this\` is not bound to an object at declaration time. It is "evaluated" at runtime. This allows a single function to be shared across multiple objects, behaving differently depending on its caller.'
    },
    {
      type: 'code',
      content: `function introduce() {
  console.log(\`I am \${this.name}\`);
}

const user = { name: "Alice", f: introduce };
const admin = { name: "Bob", f: introduce };

user.f();  // "I am Alice" (this is user)
admin.f(); // "I am Bob"   (this is admin)`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Arrow Functions and Lexical "this"',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Arrow functions do not have their own \`this\`. Instead, they capture the \`this\` value of the enclosing lexical context. This makes them ideal for callbacks (like \`setTimeout\` or event listeners) where you want to preserve the outer context.'
    },
    {
      type: 'callout',
      content: 'Because arrow functions don\'t have their own \`this\`, they cannot be used as constructors (you cannot call them with \`new\`) and they don\'t have an \`arguments\` object.',
      metadata: { type: 'runtime', title: 'Arrow Function Constraints' }
    },
    {
      type: 'code',
      content: `const group = {
  title: "Engineering",
  members: ["Alice", "Bob"],
  showList() {
    this.members.forEach((member) => {
      // Arrow function uses 'this' from showList()
      console.log(\`\${this.title}: \${member}\`);
    });
  }
};
group.showList(); // "Engineering: Alice", "Engineering: Bob"`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The "Lost This" Problem',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A common bug occurs when a method is passed as a reference (e.g., as a callback). The "before the dot" connection is broken, and \`this\` defaults to \`undefined\` (in strict mode) or the global object.'
    },
    {
      type: 'code',
      content: `const user = {
  name: "Alice",
  sayHi() { console.log(this.name); }
};

setTimeout(user.sayHi, 1000); // undefined (this is lost)

// FIX 1: Wrapper function
setTimeout(() => user.sayHi(), 1000);

// FIX 2: Explicit binding
setTimeout(user.sayHi.bind(user), 1000);`,
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
      content: 'Q: What determines the value of "this" in a regular function?\\nA: The "call-site" determines it. If called as a method (\\`obj.func()\\`), it\'s the object. If called standalone (\\`func()\\`), it\'s \\`undefined\\` in strict mode or \\`window/global\\` in non-strict mode.'
    },
    {
      type: 'faq',
      content: 'Q: How do call(), apply(), and bind() differ?\\nA: \\`call()\\` and \\`apply()\\` invoke the function immediately with a specified \\`this\\`. \\`bind()\\` returns a new function with the \\`this\\` context permanently locked, for later execution.'
    },
    {
      type: 'faq',
      content: 'Q: Why should you avoid using arrow functions for object methods?\\nA: Since arrow functions don\'t have their own \\`this\\`, they will look up the scope chain and likely resolve \\`this\\` to the global object, leading to \\`undefined\\` when trying to access other object properties.'
    }
  ]
};
