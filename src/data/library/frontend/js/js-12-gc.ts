import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-12',
  moduleId: 'js',
  order: 12,
  group: 'Asynchrony & Runtime',
  title: 'Garbage Collection',
  description: 'How the JavaScript engine manages memory automatically through reachability and the Mark-and-Sweep algorithm.',
  sections: [
    {
      type: 'text',
      content: 'In JavaScript, memory management is performed automatically and invisibly. The engine monitors all objects and reclaims the memory used by those that have become unreachable. This process is known as **Garbage Collection (GC)**, and while it is automatic, understanding its internal mechanics is vital for building memory-efficient applications.'
    },
    {
      type: 'callout',
      content: 'The core concept of memory management in JavaScript is **Reachability**. A value is reachable if it is accessible or usable from a "Root" (e.g., the global object or the current execution stack).',
      metadata: { type: 'architecture', title: 'The Reachability Principle' }
    },
    {
      type: 'heading',
      content: 'The Mark-and-Sweep Algorithm',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Modern JavaScript engines use the **Mark-and-Sweep** algorithm. It works in cycles: first, it marks all "roots," then it recursively marks all objects referenced by them. Any object left unmarked at the end of this process is deemed unreachable and is "swept" away to free up memory.'
    },
    {
      type: 'code',
      content: `// Reachability Example
let user = { name: "Alice" }; // { name: "Alice" } is reachable via 'user'

user = null; // The object is now unreachable and will be garbage collected

// Multiple references
let admin = { name: "Bob" };
let superuser = admin;

admin = null; // Object is still reachable via 'superuser'`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Internal Optimizations',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To prevent GC from causing "jank" or UI freezes (the "Stop-the-World" problem), engines implement advanced strategies like **Generational Collection** (splitting objects into "New" and "Old" sets) and **Incremental Collection** (performing marking in small chunks over time).'
    },
    {
      type: 'callout',
      content: 'Generational collection takes advantage of the "Infant Mortality" observation: most objects are created, used, and become unreachable very quickly.',
      metadata: { type: 'runtime', title: 'Performance Insight' }
    },
    {
      type: 'heading',
      content: 'Common Memory Leaks',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A memory leak occurs when an object is no longer needed but remains reachable due to a lingering reference. Common culprits include forgotten global variables, uncleared timers (\\`setInterval\\`), and closures that capture large objects unnecessarily.'
    },
    {
      type: 'code',
      content: `// Potential Memory Leak: Forgotten Timer
function startSync() {
  const largeData = new Array(1000000).fill("data");
  
  // This interval will keep largeData in memory forever!
  setInterval(() => {
    console.log(largeData.length);
  }, 1000);
}

// FIX: Always store and clear intervals
let syncId = setInterval(...);
clearInterval(syncId);`,
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
      content: 'Q: What is a "Root" in the context of Garbage Collection?\\nA: Roots are values that are inherently reachable and never deleted. They include the global object (\\`window\\` or \\`global\\`), local variables and parameters of the currently executing function, and functions on the current call stack.'
    },
    {
      type: 'faq',
      content: 'Q: Can circular references prevent garbage collection?\\nA: In modern Mark-and-Sweep engines, no. As long as the "island" of circular references is unreachable from any root, the entire island will be collected. Older engines using "Reference Counting" did struggle with this.'
    },
    {
      type: 'faq',
      content: 'Q: How does generational collection improve performance?\\nA: It splits memory into two generations. The "New Generation" is small and cleared very frequently. Objects that survive become part of the "Old Generation," which is cleared much less often, reducing the overall CPU overhead of memory management.'
    }
  ]
};
