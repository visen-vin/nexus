import type { NoteContent } from '../../../types';
import usestateDeepdiveSvg from '../../../../assets/diagrams/frontend/react/usestate-deepdive.svg?raw';

export const content: NoteContent = {
  id: 'react-5',
  moduleId: 'react',
  order: 5,
  group: 'Core Philosophy',
  title: 'useState Deep Dive',
  description: 'Deep dive into React\'s state management engine: hook linked list internals, closure staleness, automatic batching rules, and lazy initialization performance.',
  sections: [
    {
      type: 'text',
      content: 'At the runtime level, React hooks are not backed by magic or compiler magic. Instead, React represents a component\'s stateful memory using a **singly linked list of hooks** attached to the component\'s **Fiber Node**. Every time you invoke `useState` or another hook, React traverses to the next pointer in this linked list based on the invocation order.'
    },
    {
      type: 'diagram',
      content: usestateDeepdiveSvg
    },
    {
      type: 'callout',
      content: 'Because React relies strictly on the order of hook calls to match the state across renders, you **MUST NEVER** invoke hooks inside conditionals, loops, or nested functions. Doing so shifts the linked list index offsets, causing React to mount incorrect state values to hooks.',
      metadata: { type: 'warning', title: 'Rules of Hooks: The Linked List Contract' }
    },
    {
      type: 'heading',
      content: 'The Stale Closure Pitfall',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Because React components are functions that execute on every render, they capture state values within a **JavaScript Closure**. When scheduling asynchronous code (like `setTimeout` or Promises) that reads state directly, it captures the state from the *render frame when the closure was created*, leading to stale values.'
    },
    {
      type: 'code',
      content: `import React, { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  const handleIncorrectClick = () => {
    // captures "count" as 0 at the time of click
    setTimeout(() => {
      setCount(count + 1); 
    }, 2000);
  };

  const handleCorrectClick = () => {
    // uses a functional updater callback
    // receives the absolute latest state from the reconciler queue
    setTimeout(() => {
      setCount(prev => prev + 1); 
    }, 2000);
  };

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={handleIncorrectClick}>Stale Update</button>
      <button onClick={handleCorrectClick}>Stable Update</button>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Lazy Initialization',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'If the initial state of a component is computed via an expensive calculation (such as reading from `localStorage` or parsing a massive JSON payload), passing it as a direct value means it will execute **on every single render pass**, even though React only utilizes the result during the mount phase.'
    },
    {
      type: 'code',
      content: `// SLOW: expensiveCompute runs on EVERY render pass
const [data, setData] = useState(expensiveCompute());

// FAST (Lazy Initialization): expensiveCompute runs ONLY ONCE during mount
const [data, setData] = useState(() => expensiveCompute());`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Automatic Batching (React 18)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'React optimizes rendering by grouping multiple state updates together into a single render pass, a process known as **Batching**. In React 17, batching only occurred inside native React event handlers. \n\nReact 18 introduces **Automatic Batching**—grouping updates regardless of where they originate: inside Promises, fetch requests, timeouts, or native browser events. Updates are queued and processed asynchronously in a single microtask.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'State Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: How does React keep track of state if hooks do not have custom IDs?\nA: React maps hooks strictly using a singly linked list structure stored on the active Fiber node\'s `memoizedState` property. Because mapping relies solely on the static execution order of hook calls, any conditional branching that changes this order will cause the hook pointer offsets to misalign, resulting in severe runtime exceptions.'
    },
    {
      type: 'faq',
      content: 'Q: Why is passing a function to setState (setX(prev => prev + 1)) safer than setX(x + 1)?\nA: Because React state updates are scheduled asynchronously, multiple sequential `setX(x + 1)` calls in a single batch will read the same stale value of `x` from the current closure, resulting in only a single increment. A functional updater receives the absolute latest computed state in the reconciler queue, resolving the stale closure problem.'
    },
    {
      type: 'faq',
      content: 'Q: What is Lazy Initialization in useState and when should you use it?\nA: Lazy initialization is passing a function `() => initialValue` instead of a direct value to `useState`. React executes this function only once on mount. You should use it when initializing state requires expensive operations (like parsing complex stringified cookies, reading localStorage, or performing heavy array calculations) to avoid running them on subsequent renders.'
    }
  ]
};
