import type { NoteContent } from '../../../types';
import garbageCollectionSvg from '../../../../assets/diagrams/backend/nodejs/garbage-collection.svg?raw';

export const content: NoteContent = {
  id: 'node-19',
  moduleId: 'node',
  order: 114,
  group: 'Node.js Core',
  title: 'V8 Garbage Collection',
  description: 'Grasp the memory reclamation engine of V8. Master the generational heap architecture, compare Scavenge copying with Mark-Sweep-Compact major collection, and learn to write GC-friendly code.',
  sections: [
    {
      type: 'diagram',
      content: garbageCollectionSvg
    },
    {
      type: 'text',
      content: "JavaScript is a garbage-collected language, meaning developers do not have to manually allocate and free memory blocks as they do in languages like C or C++. Instead, the **V8 engine's Garbage Collector (GC)** monitors the memory heap, identifies objects that are no longer accessible from the application root, and automatically reclaims their memory space.\n\nTo do this with minimal disruption to application execution, V8 uses a **Generational Heap** architecture based on the weak generational hypothesis: most objects die young."
    },
    {
      type: 'heading',
      content: '1. V8 Heap Spaces: New Space vs. Old Space',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "V8 divides its dynamic memory heap into two primary generations:\n\n* **Young Generation (New Space)**: A highly active, small segment of memory (typically 8MB to 64MB) where all **newly created objects** are placed. Because most temporary objects (like local variables in functions) are discarded quickly, this space is cleared frequently by an extremely fast GC algorithm called the **Scavenger**.\n* **Old Generation (Old Space)**: A much larger memory segment where objects that have **survived multiple Scavenger cycles** are promoted. Because these objects are considered long-lived, this space is cleared less frequently using a heavier major GC algorithm called **Mark-Sweep-Compact**."
    },
    {
      type: 'heading',
      content: '2. GC Algorithms Deep Dive',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "V8 uses two entirely different collection systems to maintain memory speed:\n\n1. **The Scavenger Algorithm (Minor GC)**: The New Space is divided into two equal-sized semi-spaces: **From Space** and **To Space**. New objects are allocated in the From Space. When it fills up, V8 runs the Scavenger: it pauses execution, traces active references, copies the surviving active objects into the To Space (compacting them to avoid fragmentation), and discards the dead objects. Crucially, the From and To spaces swap roles, and the cycle repeats. Objects that survive two swaps are **promoted** to the Old Space.\n2. **Mark-Sweep-Compact (Major GC)**: When the Old Space fills up, V8 runs a major collection cycle:\n   * **Marking**: V8 traverses the object reference tree starting from GC Roots (global variables, active execution stacks) and marks all reachable objects as active.\n   * **Sweeping**: V8 traverses the heap, identifying un-marked objects and reclaiming their memory slots.\n   * **Compacting**: V8 shifts surviving objects together to eliminate memory fragmentation, preventing allocation failures."
    },
    {
      type: 'code',
      content: `// Demonstrating how object allocation transitions between heap spaces
function allocateTemporary() {
  const temp = { id: Math.random() }; // Placed in Young Generation (New Space)
  return temp.id; // Once function returns, temp becomes unreachable (dead)
}

// 1. Millions of temporary objects are generated and discarded instantly
// Scavenger Minor GC cleans this up in under 1ms without blocking the loop!
for(let i=0; i<100000; i++) {
  allocateTemporary();
}

// 2. Promotion to Old Space
const longLivedCache = new Map(); // Allocated in New Space first
for(let i=0; i<5000; i++) {
  longLivedCache.set(i, { data: "long_lived" });
}
// After surviving multiple Minor GC passes, longLivedCache is promoted to Old Space!`,
      metadata: { language: 'typescript', title: 'Generational memory lifecycle' }
    },
    {
      type: 'callout',
      content: "A major Mark-Sweep GC cycle can be expensive and requires pausing V8 execution (Stop-the-World). To prevent stuttering, modern V8 uses **Incremental Marking**—interleaving small steps of marking between normal JS execution ticks, dividing the pause overhead into tiny fractions.",
      metadata: { type: 'architecture', title: 'Incremental Marking Optimization' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: Explain the Weak Generational Hypothesis and how V8 leverages it.\nA: The Weak Generational Hypothesis states that **most objects die shortly after allocation** (e.g. temporary variables inside functions). V8 leverages this by dividing the heap into a **New Space** (optimized for fast, frequent Scavenger collections of short-lived objects) and an **Old Space** (optimized for less frequent Major collections of promoted, long-lived objects)."
    },
    {
      type: 'faq',
      content: "Q: How does the Scavenger algorithm clean V8's New Space?\nA: The New Space is divided into two semi-spaces: **From Space** and **To Space**. When From Space fills up, V8 pauses execution, traces references, and copies only active objects to the To Space (compacting them sequentially). The From Space memory is wiped, the two spaces swap roles, and objects surviving multiple swaps are promoted to the Old Space."
    },
    {
      type: 'faq',
      content: "Q: What is the Mark-Sweep-Compact algorithm and when does it run?\nA: It is V8's major garbage collection algorithm. It runs when the Old Space is close to capacity. First, it **marks** all reachable objects starting from GC Roots. Next, it **sweeps** the heap to reclaim memory from unmarked objects. Finally, it **compacts** active objects together to eliminate fragmentation, preventing allocation failures."
    }
  ]
};
