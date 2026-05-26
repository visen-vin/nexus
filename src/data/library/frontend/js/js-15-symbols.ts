import type { NoteContent } from '../../../types';
import symbolsSvg from '../../../../assets/diagrams/frontend/js/symbols.svg?raw';

export const content: NoteContent = {
  id: 'js-15',
  moduleId: 'js',
  order: 15,
  group: 'Modern Standards',
  title: 'Symbols & Iterators',
  description: 'Exploring unique identifiers and the iteration protocol that powers for..of loops and custom object behavior.',
  sections: [
    {
      type: 'text',
      content: 'Introduced in ES6, **Symbols** provide a way to create truly unique property keys that are guaranteed never to collide. Coupled with **Iterators**, they define a standardized way for objects to expose their data to loops and other consumer APIs, enabling a high degree of customization in object behavior.'
    },
    {
      type: 'diagram',
      content: symbolsSvg
    },
    {
      type: 'callout',
      content: 'A Symbol is a primitive value that is guaranteed to be unique. Even if you create two symbols with the same description, they are fundamentally different identifiers.',
      metadata: { type: 'architecture', title: 'The Symbol Primitive' }
    },
    {
      type: 'heading',
      content: 'Hidden Properties & Collision Avoidance',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Symbols are primarily used to add "hidden" properties to objects. These properties are not accessible via standard \`for..in\` loops or \`Object.keys()\`, making them perfect for internal library state or metadata that shouldn\'t interfere with user code.'
    },
    {
      type: 'code',
      content: `const user = { name: "Alice" };
const ID = Symbol("id");

user[ID] = 101; // Hidden property

console.log(user[ID]); // 101
console.log(Object.keys(user)); // ["name"] (ID is skipped)

// Third-party libraries can use their own Symbols on your objects
// without ever worrying about naming collisions.`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The Iterator Protocol',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'An object is considered an **Iterable** if it implements the \`Symbol.iterator\` method. This method must return an **Iterator**: an object with a \`next()\` method that returns the current value and a \`done\` status.'
    },
    {
      type: 'callout',
      content: 'The \`for..of\` loop, the spread operator (\`...\`), and \`Array.from()\` all rely on the \`Symbol.iterator\` protocol under the hood.',
      metadata: { type: 'runtime', title: 'Protocol Ubiquity' }
    },
    {
      type: 'code',
      content: `const range = {
  from: 1,
  to: 3,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    
    return {
      next() {
        if (current <= last) {
          return { done: false, value: current++ };
        } else {
          return { done: true };
        }
      }
    };
  }
};

for (let num of range) {
  console.log(num); // 1, 2, 3
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Well-Known Symbols',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'JavaScript provides several "well-known" symbols that allow you to tap into internal engine behaviors. For example, \`Symbol.toStringTag\` allows you to customize the output of \`Object.prototype.toString()\`, and \`Symbol.toPrimitive\` defines how an object is converted to a primitive value (string or number).'
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
      content: 'Q: Are Symbols truly private?\nA: No. While they are hidden from standard iteration, they can still be accessed via \`Object.getOwnPropertySymbols(obj)\`. They provide "uniqueness" and "encapsulation," but not "security-level privacy."'
    },
    {
      type: 'faq',
      content: 'Q: What is the Global Symbol Registry?\nA: You can create symbols that are shared across your entire environment (including different scripts or iframes) using \`Symbol.for(key)\`. This is useful for cross-context communication.'
    },
    {
      type: 'faq',
      content: 'Q: Why use Symbol.iterator instead of a standard method like .forEach()?\nA: The iterator protocol is a low-level standard that makes your object compatible with built-in language features like \`for..of\`, destructuring, and the spread operator, providing a more "native" feel to your custom collections.'
    }
  ]
};
