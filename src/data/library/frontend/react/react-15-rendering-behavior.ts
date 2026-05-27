import type { NoteContent } from '../../../types';
import renderingBehaviorSvg from '../../../../assets/diagrams/frontend/react/rendering-behavior.svg?raw';

export const content: NoteContent = {
  id: 'react-15',
  moduleId: 'react',
  order: 15,
  group: 'Core Philosophy',
  title: 'React 15 Rendering Behavior',
  description: 'Deep dive into React 15\'s rendering triggers, the synchronous Stack Reconciler engine, parent-to-child cascading updates, and transaction-driven state batching mechanics.',
  sections: [
    {
      type: 'text',
      content: 'In React 15 (and earlier), rendering was fundamentally defined by synchronous execution and the **Stack Reconciler**. Unlike modern React (v16+), which uses the Fiber architecture to perform asynchronous, cooperative scheduling (Time-Slicing), React 15 operated sequentially and recursively. Once an update triggered, React would block the JavaScript main thread entirely until it reconciled and committed the entire tree.'
    },
    {
      type: 'diagram',
      content: renderingBehaviorSvg
    },
    {
      type: 'callout',
      content: 'Under React 15\'s Stack Reconciler, there is no separation of "render" and "commit" in the asynchronous sense. The reconciliation process recursively descends the virtual tree and mutates the physical DOM in a single synchronous stack execution. This makes complex deep tree reconciliations highly prone to dropping frames (jank) if they exceed 16ms.',
      metadata: { type: 'architecture', title: 'The Stack Reconciler Paradigm' }
    },
    {
      type: 'heading',
      content: '1. Rendering Triggers in React 15',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Rendering in a React 15 component tree is initiated by one of four triggers:\n\n1. **Initial Mount (`ReactDOM.render`)**: Renders the root component and recursively mounts all child components down the tree using internal methods like `mountComponent`.\n2. **Local State Mutations (`setState`)**: The primary vehicle for dynamic state. In React 15, `setState` is asynchronous-like (batched) inside event handlers but highly synchronous outside of them.\n3. **Manual Updates (`forceUpdate`)**: Skips `shouldComponentUpdate` checks and forces the component to trigger its update lifecycle recursively for children.\n4. **Parent Re-renders**: Whenever a parent component re-renders, it invokes `receiveComponent` on its children, triggering updates down the hierarchy even if the children\'s props have not changed (unless guarded by `shouldComponentUpdate`).'
    },
    {
      type: 'heading',
      content: '2. Synchronous State Batching & Transaction Mechanics',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'One of the most widely misunderstood features of React 15 is how it batches updates. To prevent multiple re-renders when setting state multiple times in a single event handler, React wraps event listeners in a **Transaction** wrapper (`ReactDefaultBatchingStrategyTransaction`).'
    },
    {
      type: 'callout',
      content: 'A Transaction in React 15 wraps any execution block with "initialize" and "close" hooks. The default batching strategy transaction sets a global flag `isBatchingUpdates = true` on initialization and resets it to `false` upon closing, which then triggers `ReactUpdates.flushBatchedUpdates()`.',
      metadata: { type: 'architecture', title: 'Under the Hood: Transactions' }
    },
    {
      type: 'text',
      content: 'When `setState` is invoked, React checks the internal flag `isBatchingUpdates`:\n\n* **Within React\'s Context (Batched)**: If an event handler is running (like a click event handler registered via React JSX `onClick`), `isBatchingUpdates` is `true`. The component is added to a global `dirtyComponents` array. The state updates are merged, and the actual re-render is deferred until the transaction closes.\n* **Outside React\'s Context (Unbatched/Synchronous)**: If `setState` is executed asynchronously inside a `setTimeout`, native event listener, Promise callback, or an AJAX handler, the call runs outside the Transaction boundary. Thus, `isBatchingUpdates` is `false`. React immediately performs a synchronous, blocking re-render for that single `setState` invocation!'
    },
    {
      type: 'code',
      content: `// React 15 State Batching Behavior Demonstration
import React, { Component } from 'react';

interface State {
  count: number;
}

export class BatchingDemo extends Component<{}, State> {
  state: State = { count: 0 };

  handleReactClick = () => {
    // 1. INSIDE EVENT HANDLER: Batched!
    // isBatchingUpdates is true. Updates are queued.
    this.setState({ count: this.state.count + 1 });
    this.setState({ count: this.state.count + 1 });
    
    // Prints 0! State has not been applied yet.
    console.log('Inside Event Count:', this.state.count);
  };

  handleAsyncClick = () => {
    // 2. OUTSIDE EVENT HANDLER (setTimeout / Promise): Synchronous!
    // isBatchingUpdates is false.
    setTimeout(() => {
      // First setState immediately triggers a full recursive render cycle!
      this.setState({ count: this.state.count + 1 });
      console.log('Timeout State 1:', this.state.count); // Prints 1

      // Second setState immediately triggers a second recursive render cycle!
      this.setState({ count: this.state.count + 1 });
      console.log('Timeout State 2:', this.state.count); // Prints 2
    }, 0);
  };

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.handleReactClick}>React Click (Batched)</button>
        <button onClick={this.handleAsyncClick}>Async Click (Synchronous)</button>
      </div>
    );
  }
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'In React 15, sequential synchronous rendering outside of transactions can easily lead to layout thrashing if multiple sets are triggered in quick succession. To force batching outside event handlers in React 15, you had to use the internal utility `ReactDOM.unstable_batchedUpdates(() => { ... })`.',
      metadata: { type: 'warning', title: 'Synchronous Render Performance Cost' }
    },
    {
      type: 'heading',
      content: '3. Parent-to-Child Cascading Updates',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Reconciliation in React 15 is orchestrated via a recursive depth-first search (DFS) through the virtual DOM. When a component re-renders:\n\n1. It computes its new element tree by running its `render` method.\n2. It compares the returned elements with the previous elements.\n3. If an element type is identical (e.g. `<ChildComponent />`), it delegates the reconciliation recursively down to the child by invoking `receiveComponent` on the child\'s internal instance.\n4. **Cascading Cost**: By default, React 15 will recursively reconcile every child, grandchild, and descendant in the subtree, regardless of whether their props have changed. If `shouldComponentUpdate` is not implemented (or doesn\'t return `false`), React recreates virtual elements and diffs them all the way to the leaves, which causes serious overhead on large applications.'
    },
    {
      type: 'callout',
      content: 'Because reconciliation recursively invokes internal methods like `updateComponent` and `receiveComponent` directly on the JavaScript call stack, this process cannot be split, suspended, or aborted. If the stack is 50 levels deep, JavaScript will block the main thread until the entire recursion unwinds.',
      metadata: { type: 'runtime', title: 'Call Stack Dependency' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: How did state batching actually work under the hood in React 15, and why did updates inside setTimeout execute synchronously?\nA: Under the hood, React 15 wrapped user interactive handlers in a transaction boundary using `ReactDefaultBatchingStrategyTransaction`. Inside this transaction, a flag `isBatchingUpdates` was set to `true`, causing all `setState` updates to register components inside a `dirtyComponents` array without immediate execution. Because `setTimeout`, Promises, and raw callback handlers execute in a separate macrotask or microtask after the event listener call stack has completely cleared (and the Transaction has closed), the transaction is no longer active when `setState` runs. As a result, `isBatchingUpdates` is `false`, and React synchronously triggers the entire reconciliation process.'
    },
    {
      type: 'faq',
      content: 'Q: What is the React 15 Stack Reconciler, and what is its primary limitation?\nA: The Stack Reconciler is the rendering engine used up to React 15 that reconciles the virtual DOM using recursive, depth-first search traversal on the JavaScript call stack. Its primary limitation is that it is strictly synchronous and blocking. Once reconciliation begins, it cannot be interrupted or prioritized. In large trees, if reconciliation takes longer than the 16.67ms frame budget, it blocks user interactions, scroll inputs, and animations, causing noticeable "jank".'
    },
    {
      type: 'faq',
      content: 'Q: How did parent-to-child cascading updates operate in React 15, and how did developers optimize it?\nA: In React 15, whenever a parent component updated, React recursively invoked `receiveComponent` on all child components down the tree. By default, every single child recalculated its virtual DOM and performed diffing even if its props did not change. Developers optimized this behavior using `shouldComponentUpdate(nextProps, nextState)` or extending `React.PureComponent` (which performs a shallow equality check of props and state). If `shouldComponentUpdate` returned `false`, the reconciler skipped rendering that component and its entire child subtree, saving massive computation.'
    },
    {
      type: 'faq',
      content: 'Q: What is the Transaction pattern in React 15 and how was it used?\nA: The Transaction pattern is an architectural design wrapper in the React 15 source code that allows wrapping a function execution block with `initialize` and `close` life stages. The transaction maintains system state consistency. For example, during events, the batching strategy transaction initializes `isBatchingUpdates = true`, executes the user handlers, and upon closing, resets `isBatchingUpdates = false` and flushes all queued `dirtyComponents` to update the DOM atomically.'
    }
  ]
};
