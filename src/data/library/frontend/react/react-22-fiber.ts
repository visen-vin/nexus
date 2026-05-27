import type { NoteContent } from '../../../types';
import fiberSvg from '../../../../assets/diagrams/frontend/react/fiber.svg?raw';

export const content: NoteContent = {
  id: 'react-22',
  moduleId: 'react',
  order: 22,
  group: 'Fiber Reconciliation',
  title: 'React Fiber & Reconciliation',
  description: 'Deep dive into React\'s fiber architecture, virtual DOM reconciliation, the two phases of rendering, and modern concurrency features.',
  sections: [
    {
      type: 'text',
      content: 'In standard frontend development, updating the DOM is expensive. **React Fiber** is the reconciliation engine behind React 16+. Its primary goal is to enable **incremental rendering**—the ability to split rendering work into chunks and spread it over multiple frames. This solves the thread-blocking issues of the stack reconciler, keeping interfaces smooth and interactive.'
    },
    {
      type: 'diagram',
      content: fiberSvg
    },
    {
      type: 'callout',
      content: 'A **Fiber** is a plain JavaScript object that represents a unit of work. It matches React elements and contains technical metadata (like `child`, `sibling`, and `return` pointers) that form a doubly linked list tree structure.',
      metadata: { type: 'architecture', title: 'The Fiber Node Blueprint' }
    },
    {
      type: 'heading',
      content: 'Reconciler vs. Renderer',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'It is vital to distinguish between the two key components of React\'s architecture:\n1. **Reconciler**: Computes which parts of the tree have changed. This is the **Fiber Reconciler** (`react-reconciler`), which works in a platform-agnostic way.\n2. **Renderer**: Takes the computed changes and updates the host environment. Examples include `react-dom` (for browsers), `react-native` (for mobile), and `react-three-fiber` (for 3D environments).'
    },
    {
      type: 'heading',
      content: 'The Two Phases of Reconciliation',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To prevent visual inconsistencies, React splits reconciliation into two distinct phases:'
    },
    {
      type: 'heading',
      content: 'Phase 1: Render Phase (Asynchronous)',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'React traverses the fiber tree and computes changes. This phase is completely **non-blocking** and **asynchronous**. React can pause, abort, or reuse work in this phase based on priority levels (like user inputs vs. network responses).'
    },
    {
      type: 'heading',
      content: 'Phase 2: Commit Phase (Synchronous)',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'React applies the computed changes to the host environment (the real DOM). This phase is **synchronous** and **cannot be interrupted** to ensure a consistent, tear-free UI state.'
    },
    {
      type: 'callout',
      content: 'Because the Render phase can be paused and executed multiple times before committing, lifecycle methods like `componentWillMount` or side effects inside render-phase execution were highly unsafe, leading to their deprecation in React 16.3+.',
      metadata: { type: 'warning', title: 'Side Effects Precaution' }
    },
    {
      type: 'heading',
      content: 'The Double-Buffering Strategy',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To optimize rendering, React Fiber uses a graphics-like technique called **Double-Buffering**. React maintains two trees simultaneously:\n- **current**: Represents the tree currently visible on the screen.\n- **workInProgress**: The tree being constructed asynchronously in memory during the render phase.\n\nOnce the `workInProgress` tree is fully prepared, React swaps the root pointer, making `workInProgress` the new `current` tree in a single atomic pointer update.'
    },
    {
      type: 'code',
      content: `// Conceptual rendering flow inside React Fiber
function performUnitOfWork(fiber) {
  // 1. Begin work (compute changes, hooks, etc.)
  let next = beginWork(fiber);
  
  // 2. If no child, complete work for this unit
  if (!next) {
    next = completeUnitOfWork(fiber);
  }
  
  return next; // returns next fiber unit or null
}`,
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
      metadata: { type: 'architecture', title: 'Core Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: Why did React shift from stack-based reconciliation to Fiber?\nA: The stack reconciler was synchronous and recursive, meaning once it started updating the tree, it could not pause. In heavy apps, this blocked the main thread, dropping frames. Fiber acts as a custom call stack on top of linked lists, allowing React to yield control back to the browser\'s scheduler.'
    },
    {
      type: 'faq',
      content: 'Q: What is the role of key prop in Fiber reconciliation?\nA: React uses keys to match existing fiber nodes to new JSX elements. During reconciliation, keys enable React to reuse existing fibers, reordering them instead of completely destroying and recreating DOM nodes, which immensely boosts performance.'
    },
    {
      type: 'faq',
      content: 'Q: What are the main pointers in a Fiber node that establish the tree?\nA: Fiber nodes don\'t store an array of children. Instead, they use three pointers: `child` (points to the first immediate child), `sibling` (points to the next sibling), and `return` (points to the parent fiber node).'
    }
  ]
};
