// --- FILE: js-19-array-methods.ts ---
import type { NoteContent } from '../../../types';
import arrayMethodsSvg from '../../../../assets/diagrams/frontend/js/array-methods.svg?raw';

export const content: NoteContent = {
  id: 'js-19',
  moduleId: 'js',
  order: 19,
  group: 'Modern Standards',
  title: 'New Immutable Array Methods',
  description: 'ES2023 additions for non-destructive array manipulation and functional programming.',
  sections: [
    {
      type: 'text',
      content: 'Historically, many JavaScript array methods like \\`sort()\\`, \\`reverse()\\`, and \\`splice()\\` mutated the original array in-place. ES2023 introduced **Immutable Array Methods**, allowing developers to perform these operations while returning a new array, aligning JavaScript closer to functional programming principles.'
    },
    {
      type: 'diagram',
      content: arrayMethodsSvg
    },
    {
      type: 'callout',
      content: 'These methods are essential for React and other state management systems where immutability is required to detect changes and trigger UI updates efficiently.',
      metadata: { type: 'architecture', title: 'Immutability by Default' }
    },
    {
      type: 'heading',
      content: 'The Change-by-Copy Standard',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Four new methods were added to the \\`Array.prototype\\`: \\`toSorted()\\`, \\`toReversed()\\`, \\`toSpliced()\\`, and \\`with()\\`. Each mirrors a destructive counterpart but leaves the source data untouched.'
    },
    {
      type: 'code',
      content: `const base = [3, 1, 2];

// Destructive (OLD)
// base.sort(); // base is now [1, 2, 3]

// Immutable (NEW)
const sorted = base.toSorted(); 
console.log(base);   // [3, 1, 2] (Original preserved)
console.log(sorted); // [1, 2, 3] (New array)

// The .with() method replaces a single element
const updated = base.with(1, 99); // [3, 99, 2]`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Deep vs. Shallow Immutability',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'It is critical to remember that these methods perform a **shallow copy**. If the array contains objects, the new array will contain references to the same objects. Modifying a property of an object inside the new array will still reflect in the original.'
    },
    {
      type: 'callout',
      content: 'While these methods return new arrays, they do not "deep clone" contents. Use them for structural changes (adding/removing/reordering), not for deep state updates.',
      metadata: { type: 'warning', title: 'SHALLOW COPY WARNING' }
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
      content: 'Q: How is .toSpliced() different from .slice()?\nA: \\`slice()\\` is used to extract a portion of an array. \\`toSpliced()\\` is used to **insert, remove, or replace** elements at any index while returning a new array, mirroring the full functionality of the destructive \\`splice()\\`.'
    },
    {
      type: 'faq',
      content: 'Q: What was the common workaround before these methods existed?\nA: Developers typically used the spread operator to clone the array first: \\`const sorted = [...arr].sort()\\`. The new methods are more concise and potentially more performant as they are optimized at the engine level.'
    },
    {
      type: 'faq',
      content: 'Q: Do these methods work on TypedArrays?\nA: Yes. \\`toSorted()\\`, \\`toReversed()\\`, and \\`with()\\` are also available on TypedArray prototypes (like \\`Int32Array\\`), though \\`toSpliced()\\` is not available there as TypedArrays have fixed lengths.'
    }
  ]
};
