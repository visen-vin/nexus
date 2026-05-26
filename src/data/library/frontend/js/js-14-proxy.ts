import type { NoteContent } from '../../../types';
import proxySvg from '../../../../assets/diagrams/frontend/js/proxy.svg?raw';

export const content: NoteContent = {
  id: 'js-14',
  moduleId: 'js',
  order: 14,
  group: 'Functions & Objects',
  title: 'Proxies & Reflect API',
  description: 'Unlocking meta-programming capabilities to intercept and customize fundamental object operations.',
  sections: [
    {
      type: 'text',
      content: 'The **Proxy** object allows you to create a wrapper for another object, which can intercept and redefine fundamental operations for that object, such as property lookup, assignment, enumeration, and function invocation. Paired with the **Reflect API**, it provides a powerful toolkit for meta-programming in JavaScript.'
    },
    {
      type: 'diagram',
      content: proxySvg
    },
    {
      type: 'callout',
      content: 'A Proxy is composed of two parts: the **Target** (the original object being wrapped) and the **Handler** (an object containing "traps" that define the intercepted behavior).',
      metadata: { type: 'architecture', title: 'The Proxy Architecture' }
    },
    {
      type: 'heading',
      content: 'Understanding Traps',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A **trap** is a method in the handler that corresponds to an internal operation. Common traps include \\`get\\` (property access), \\`set\\` (property assignment), \\`has\\` (the \\`in\\` operator), and \\`deleteProperty\\`.'
    },
    {
      type: 'code',
      content: `const user = { name: "Alice", _secret: "12345" };

const handler = {
  get(target, prop) {
    if (prop.startsWith('_')) {
      throw new Error("Access Denied to private property");
    }
    return target[prop];
  },
  set(target, prop, value) {
    if (prop === 'age' && typeof value !== 'number') {
      throw new TypeError("Age must be a number");
    }
    target[prop] = value;
    return true; // Success indicator
  }
};

const proxy = new Proxy(user, handler);
console.log(proxy.name); // "Alice"
// console.log(proxy._secret); // Throws Error`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The Reflect API: Correct Forwarding',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The \\`Reflect\\` object provides static methods that match Proxy traps. Its primary purpose is to make it easier to forward operations to the target object while correctly handling edge cases, specifically the \\`this\\` context (the "receiver") during inheritance.'
    },
    {
      type: 'callout',
      content: 'Always use \\`Reflect\\` methods inside your traps instead of manual property access. This ensures that getters/setters in the target object use the correct \\`this\\` (the proxy, not the target).',
      metadata: { type: 'runtime', title: 'Reflect Best Practice' }
    },
    {
      type: 'code',
      content: `const handler = {
  get(target, prop, receiver) {
    console.log(\`Reading property: \${prop}\`);
    // Correct way to forward the operation
    return Reflect.get(target, prop, receiver);
  }
};`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Real-World Use Case: Reactivity',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Proxies are the foundation of modern reactivity systems (like Vue 3). By intercepting \\`set\\` operations, frameworks can automatically trigger UI updates whenever the underlying data changes.'
    },
    {
      type: 'code',
      content: `function createObservable(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const result = Reflect.set(target, prop, value, receiver);
      if (result) onChange(prop, value);
      return result;
    }
  });
}

const state = createObservable({ count: 0 }, (prop, val) => {
  console.log(\`State updated: \${prop} is now \${val}\`);
});

state.count++; // "State updated: count is now 1"`,
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
      content: 'Q: What is the "receiver" argument in get and set traps?\\nA: The \\`receiver\\` is either the proxy itself or an object that inherits from the proxy. Passing it to \\`Reflect.get/set\\` ensures that if the property is a getter/setter, its \\`this\\` points correctly to the object that initiated the operation.'
    },
    {
      type: 'faq',
      content: 'Q: Can a Proxy be revoked?\\nA: Yes. Using \\`Proxy.revocable(target, handler)\\` returns an object with a \\`proxy\\` and a \\`revoke\\` function. Once \\`revoke()\\` is called, any further operations on the proxy will throw a TypeError, effectively "killing" the access.'
    },
    {
      type: 'faq',
      content: 'Q: What are Proxy Invariants?\\nA: These are rules that proxies must follow to maintain internal consistency (e.g., if a property is non-configurable and non-writable on the target, the proxy MUST return the same value as the target). If an invariant is violated, the proxy will throw a TypeError.'
    }
  ]
};
