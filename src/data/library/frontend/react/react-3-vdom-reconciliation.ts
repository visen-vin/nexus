import type { NoteContent } from '../../../types';
import vdomReconciliationSvg from '../../../../assets/diagrams/frontend/react/vdom-reconciliation.svg?raw';

export const content: NoteContent = {
  id: 'react-3',
  moduleId: 'react',
  order: 3,
  group: 'Core Philosophy',
  title: 'Virtual DOM & Reconciliation',
  description: 'Deep dive into React\'s heuristic diffing algorithm, Virtual DOM comparisons, O(n) algorithmic complexity rules, and list keys optimization.',
  sections: [
    {
      type: 'text',
      content: 'Comparing two complete trees has a theoretical complexity of **O(n³)**. If React used traditional tree comparison, rendering a page with 1,000 elements would require billions of checks, freezing the browser. \n\nTo solve this, React implements a heuristic **O(n) Diffing Algorithm** based on two essential assumptions:\n1. Two elements of **different types** will produce completely different trees.\n2. Developers can hint at child stability across renders using a unique, stable **`key`** prop.'
    },
    {
      type: 'diagram',
      content: vdomReconciliationSvg
    },
    {
      type: 'callout',
      content: 'By diffing trees level-by-level (breadth-first traversal), React eliminates deep traversal checks. If a parent node is of a different type, React completely discards the branch without searching deeper.',
      metadata: { type: 'architecture', title: 'Breadth-First Level Traversal' }
    },
    {
      type: 'heading',
      content: 'The Heuristic Rules of Diffing',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'React\'s reconciler applies precise rules when comparing the old Virtual DOM tree with the new Virtual DOM tree:'
    },
    {
      type: 'heading',
      content: 'Rule 1: Elements of Different Types',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'Whenever root elements have different types, React tears down the old tree and builds the new tree from scratch. For example, changing `<a>` to `<img>`, or `<Header>` to `<Footer>` triggers a full unmount. Component state is entirely destroyed.'
    },
    {
      type: 'heading',
      content: 'Rule 2: DOM Elements of the Same Type',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'When comparing two DOM elements of the same type, React inspects attributes of both, keeps the underlying physical DOM node, and only updates the modified attributes (e.g. updating `className` or `style` properties in-place).'
    },
    {
      type: 'heading',
      content: 'Rule 3: Recursing On Children (The Power of Keys)',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'By default, when recursing on the children of a DOM node, React iterates over both lists of children at the same time and generates a mutation whenever there\'s a difference. Inserting an element at the beginning of a list causes React to recreate every subsequent child. The **`key` prop** solves this by establishing a stable identity between renders, allowing React to reorder elements rather than recreate them.'
    },
    {
      type: 'code',
      content: `// Anti-Pattern: Using array indices as keys
// If the list is re-ordered (e.g. sorted, inserted at index 0),
// the index maps to a DIFFERENT element, forcing React to reuse
// old state/DOM nodes incorrectly.
users.map((user, index) => (
  <UserProfile key={index} data={user} />
));

// Best Practice: Use a stable, unique identifier from data
users.map((user) => (
  <UserProfile key={user.id} data={user} />
));`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Using random values (like `Math.random()`) or timestamp generators as keys is a critical performance bottleneck. It causes React to recreate all child DOM nodes on every render, degrading UI response times.',
      metadata: { type: 'warning', title: 'Key Anti-Pattern warning' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Reconciliation Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: How does React reduce tree diffing from O(n³) to O(n)?\nA: By using two heuristics: (1) assuming two elements of different types will produce different trees, allowing React to destroy and recreate the branch immediately instead of doing deep matching; and (2) utilizing unique stable `key` props to match items in list structures across renders.'
    },
    {
      type: 'faq',
      content: 'Q: What are the exact side effects of using index as a key for dynamic lists?\nA: If the array items can be sorted, filtered, or inserted at the top, using the index as a key maps a node to an incorrect array index. React will attempt to reuse the existing DOM node and component instances for a completely different item. This leads to extremely subtle UI bugs (like input values or animations persisting on wrong list items) and poor performance.'
    },
    {
      type: 'faq',
      content: 'Q: What happens to a component state when its element type changes?\nA: The component is fully unmounted, triggering lifecycle cleanup (or useEffect cleanup). The state is completely destroyed, and a fresh new component state is initialized during the mounting phase of the new element type.'
    }
  ]
};
