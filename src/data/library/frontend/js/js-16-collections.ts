import type { NoteContent } from '../../../types';
import collectionsSvg from '../../../../assets/diagrams/frontend/js/collections.svg?raw';

export const content: NoteContent = {
  id: 'js-16',
  moduleId: 'js',
  order: 16,
  group: 'Modern Standards',
  title: 'Map, Set, WeakMap & WeakSet',
  description: 'Mastering modern collection types for efficient data storage and automatic memory management.',
  sections: [
    {
      type: 'text',
      content: 'While plain Objects and Arrays are the workhorses of JavaScript, they have limitations when it comes to complex data structures and memory management. ES6 introduced **Map**, **Set**, **WeakMap**, and **WeakSet** to provide specialized collections that are more performant and feature-rich for specific engineering use cases.'
    },
    {
      type: 'diagram',
      content: collectionsSvg
    },
    {
      type: 'callout',
      content: 'The primary advantage of Map over Object is that Map keys can be of any type—including objects and functions—and it preserves the insertion order of its elements.',
      metadata: { type: 'architecture', title: 'The Collection Advantage' }
    },
    {
      type: 'heading',
      content: 'Map & Set: The Strong Collections',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A **Map** is a collection of keyed data, while a **Set** is a collection of unique values. Both maintain a "strong" reference to their contents, meaning as long as the collection exists, its items will not be garbage collected.'
    },
    {
      type: 'code',
      content: `// Map: Keys as Objects
const visits = new Map();
const user = { name: "Alice" };

visits.set(user, 10);
console.log(visits.get(user)); // 10

// Set: Unique Values
const tags = new Set(["js", "ts", "js"]);
console.log(tags.size); // 2 (duplicate "js" removed)`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'WeakMap & WeakSet: Memory Efficiency',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The "Weak" versions of these collections only accept objects as keys (or values) and hold them **weakly**. If there are no other references to an object stored in a WeakMap/WeakSet, the engine will automatically garbage collect it, preventing memory leaks in complex applications.'
    },
    {
      type: 'callout',
      content: 'Because they allow garbage collection at any time, WeakMap and WeakSet are NOT iterable and do not have a \\`size\\` property. They are designed for private metadata and caching, not for general-purpose storage.',
      metadata: { type: 'runtime', title: 'GC Implications' }
    },
    {
      type: 'code',
      content: `// Use Case: Caching results for objects
const cache = new WeakMap();

function process(obj) {
  if (!cache.has(obj)) {
    const result = heavyCalculation(obj);
    cache.set(obj, result);
    return result;
  }
  return cache.get(obj);
}

// When 'obj' is nullified elsewhere, it will be automatically 
// removed from the cache by the Garbage Collector.`,
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
      content: 'Q: When should I use a Map instead of a plain Object?\\nA: Use a \\`Map\\` when you need non-string keys, when you require the \\`.size\\` property, or when your code performs frequent additions and removals of key-value pairs (Map is optimized for this).'
    },
    {
      type: 'faq',
      content: 'Q: How does WeakMap prevent memory leaks?\\nA: It holds "weak" references. If a key object has no other strong references in the app, it and its associated value in the \\`WeakMap\\` are eligible for garbage collection, preventing the map from growing indefinitely.'
    },
    {
      type: 'faq',
      content: 'Q: Can I use a Symbol as a key in a WeakMap?\\nA: In modern JavaScript (ES2023+), you can use non-registered symbols as keys in a \\`WeakMap\\`, similar to how objects are used.'
    }
  ]
};
