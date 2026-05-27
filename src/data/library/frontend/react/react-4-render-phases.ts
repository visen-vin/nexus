import type { NoteContent } from '../../../types';
import renderPhasesSvg from '../../../../assets/diagrams/frontend/react/render-phases.svg?raw';

export const content: NoteContent = {
  id: 'react-4',
  moduleId: 'react',
  order: 4,
  group: 'Core Philosophy',
  title: 'React Render Phases',
  description: 'Deep dive into React\'s two-phase execution cycle: the pure, asynchronous Render Phase and the synchronous, side-effectual Commit Phase.',
  sections: [
    {
      type: 'text',
      content: 'A very common mental model error among frontend developers is assuming that a component rendering immediately changes the DOM layout on the screen. \n\nReact operates on a strict **two-phase architecture** that decouples tree diffing calculations from actual painting. This separation enables React Concurrency features (like Time-Slicing and Suspense) by making the complex math of rendering pauseable and interruptible.'
    },
    {
      type: 'diagram',
      content: renderPhasesSvg
    },
    {
      type: 'callout',
      content: 'The overall process consists of three main steps: (1) **Triggering** the render (initial mount or state update), (2) **Rendering** the component tree (diffing), and (3) **Committing** changes to the DOM. Finally, the browser handles the layout **Paint** step.',
      metadata: { type: 'architecture', title: 'The Complete Render Flow' }
    },
    {
      type: 'heading',
      content: 'Phase 1: The Render Phase (The Computation)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'During the **Render Phase**, React recurses down the component tree to compute the target virtual representation. React invokes component functions, runs hooks (like `useMemo` and `useCallback`), diffs elements, and builds the `workInProgress` tree.\n\n* **Asynchronous & Non-Blocking**: In Concurrent mode, React can split this work into chunks and pause to let the browser handle highly critical frame animations (Time-Slicing).\n* **The Strict Pure Rule**: This phase **MUST BE PURE**. It should have absolutely zero side effects. Running AJAX requests, mutating globals, or editing the DOM in this phase causes catastrophic, hard-to-debug layout bugs.'
    },
    {
      type: 'heading',
      content: 'Phase 2: The Commit Phase (The Application)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Once the math is complete, React enters the **Commit Phase**. This is where React applies updates directly to the physical DOM.\n\n* **Synchronous & Blocking**: This phase is entirely synchronous and cannot be aborted. To prevent "visual tearing" (the user seeing half-rendered frames), React commits all DOM updates in a single, atomic operation.\n* **Safe Side-Effects**: This phase is where React runs lifecycle hooks (like `componentDidMount`), ref pointer assignments, and side-effect hooks (`useEffect` is scheduled here, `useLayoutEffect` runs synchronously before painting).'
    },
    {
      type: 'code',
      content: `// React Component demonstrating phase behavior
import React, { useState, useEffect } from 'react';

export function TrackerComponent() {
  const [count, setCount] = useState(0);

  // RENDER PHASE: This code executes immediately when the function runs.
  // CRITICAL RULE: NEVER run side effects here!
  // console.log("Render Phase: Computing tree..."); // PURE ONLY
  
  // COMMIT PHASE: useEffect schedules side-effects safely.
  // Runs asynchronously AFTER the DOM has committed and screen painted.
  useEffect(() => {
    // console.log("Commit Phase Side-Effect: Runs safely here");
    // fetchAnalyticsData(count);
  }, [count]);

  return (
    <button onClick={() => setCount(prev => prev + 1)}>
      Count: {count}
    </button>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Invoking state setters (e.g. `setState`) directly in the body of a component (outside of an effect or handler) schedules a nested render phase immediately. If not guarded by a conditional, this triggers an infinite rendering loop, causing browser crashes.',
      metadata: { type: 'warning', title: 'Infinite Loop Pitfall' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Render Phase Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the main difference between Render Phase and Commit Phase in React?\nA: The Render Phase computes virtual tree diffs, is asynchronous/interruptible, and must be pure and free of side effects. The Commit Phase applies updates to the physical DOM, is synchronous/uninterruptible, and allows safe execution of side-effects (like layout effects and ref bindings).'
    },
    {
      type: 'faq',
      content: 'Q: Why did React deprecate lifecycles like componentWillMount in React 16.3?\nA: In classic React, rendering was synchronous. With Fiber\'s concurrent rendering, the Render Phase can be paused, aborted, and restarted multiple times before committing. Lifecycles like `componentWillMount` ran during the Render Phase. As a result, they would run multiple times for a single render, causing duplicate API requests or unexpected side effects.'
    },
    {
      type: 'faq',
      content: 'Q: When exactly do useLayoutEffect and useEffect execute in the cycle?\nA: Both hooks are scheduled in the Commit Phase. However, `useLayoutEffect` runs **synchronously** after DOM mutations are committed but **before** the browser paints screen pixels. `useEffect` is deferred and runs **asynchronously** after the browser has finished painting.'
    }
  ]
};
