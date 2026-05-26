import type { NoteContent } from '../../../types';
import inheritanceSvg from '../../../../assets/diagrams/frontend/js/inheritance.svg?raw';

export const content: NoteContent = {
  id: 'js-11',
  moduleId: 'js',
  order: 11,
  group: 'Functions & Objects',
  title: 'Prototypal Inheritance',
  description: 'Understanding the prototype chain, the [[Prototype]] internal property, and how JavaScript objects inherit behaviors.',
  sections: [
    {
      type: 'text',
      content: 'Unlike class-based languages like Java or C++, JavaScript uses **Prototypal Inheritance**. Every object in JavaScript has a hidden link to another object called its **Prototype**. When you access a property that doesn\'t exist on an object, JavaScript automatically looks for it in the prototype, forming a **Prototype Chain**.'
    },
    {
      type: 'diagram',
      content: inheritanceSvg
    },
    {
      type: 'callout',
      content: 'The prototype chain is the mechanism that enables "behavior delegation" in JavaScript. Objects don\'t copy methods from their classes; they delegate property lookups to their prototypes.',
      metadata: { type: 'architecture', title: 'Delegation vs. Inheritance' }
    },
    {
      type: 'heading',
      content: 'The [[Prototype]] vs. __proto__',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Every object has an internal hidden property called \\`[[Prototype]]\\`. The \\`__proto__\\` property is a historical getter/setter for this internal link. While widely supported, modern code should use \\`Object.getPrototypeOf()\\` and \\`Object.setPrototypeOf()\\` for cleaner and more performant interactions.'
    },
    {
      type: 'code',
      content: `const animal = {
  eats: true,
  walk() { console.log("Animal walks"); }
};

const rabbit = {
  jumps: true,
  __proto__: animal // rabbit inherits from animal
};

console.log(rabbit.eats); // true (found in prototype)
rabbit.walk();           // "Animal walks" (delegated to animal)`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The Search Algorithm: Property Lookup',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When reading a property, the engine first checks the object itself. If not found, it traverses the prototype chain upward until it finds the property or reaches \\`null\\`. Crucially, **Write/Delete operations** skip the prototype chain and always operate directly on the target object.'
    },
    {
      type: 'callout',
      content: 'When calling an inherited method, \\`this\\` still refers to the object "before the dot." This allows inherited methods to modify the state of the child object without affecting the shared prototype.',
      metadata: { type: 'runtime', title: 'State Preservation' }
    },
    {
      type: 'code',
      content: `const user = {
  name: "Anonymous",
  set(val) { this.name = val; }
};

const admin = { __proto__: user };

admin.set("Alice"); // 'this' is admin
console.log(admin.name); // "Alice" (own property created)
console.log(user.name);  // "Anonymous" (prototype unchanged)`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Performance and the Chain',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'While long prototype chains might seem expensive, modern engines like V8 use **Hidden Classes** and **Inline Caching** to optimize lookups. Accessing an inherited property is often nearly as fast as accessing an own property. However, dynamically changing prototypes with \\`Object.setPrototypeOf()\\` can break these optimizations and should be avoided in hot code paths.'
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
      content: 'Q: What is the difference between .prototype and [[Prototype]]?\\nA: \\`[[Prototype]]\\` is the internal link on **every object**. \\`.prototype\\` is a special property that exists **only on functions** and is used to set the \\`[[Prototype]]\\` of new objects created with the \\`new\\` keyword.'
    },
    {
      type: 'faq',
      content: 'Q: How can you check if a property is "own" or inherited?\\nA: Use the \\`obj.hasOwnProperty(prop)\\` method. It returns \\`true\\` only if the property is defined directly on the object itself, not its prototype chain.'
    },
    {
      type: 'faq',
      content: 'Q: What happens at the end of the prototype chain?\\nA: The top-most prototype is \\`Object.prototype\\`. Its prototype is \\`null\\`. If a property is not found even in \\`Object.prototype\\`, the search returns \\`undefined\\`.'
    }
  ]
};
