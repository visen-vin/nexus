import type { NoteContent } from '../../../types';
import userefSvg from '../../../../assets/diagrams/frontend/react/useref.svg?raw';

export const content: NoteContent = {
  id: 'react-12',
  moduleId: 'react',
  order: 12,
  group: 'Core Philosophy',
  title: 'useRef: Decoupled Persistent Memory',
  description: 'Deep dive into React\'s persistent heap container. Learn about reference stability, DOM manipulation timings, instance variables, and custom hooks like usePrevious.',
  sections: [
    {
      type: 'text',
      content: 'At its core, **`useRef`** is a functional wrapper around a stable heap reference. While state variables (`useState`) trigger reconciliation and visual re-renders when mutated, `useRef` provides a **mutable container** that is entirely decoupled from React\'s rendering scheduler.\n\nUpdating `ref.current` is a **synchronous mutation** that does not schedule a re-render. It is React\'s escape hatch for preserving mutable state across rendering cycles without triggering a UI update cycle.'
    },
    {
      type: 'diagram',
      content: userefSvg
    },
    {
      type: 'heading',
      content: 'Reference Stability & Object.is Verification',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When React renders a functional component, the entire function executes from top to bottom. Any normal local variable is re-allocated on the stack and wiped clean on every single execution. \n\n`useRef` bypasses this by storing a reference object in React\'s internal Fiber node (on the heap). Every call to `useRef()` on subsequent renders returns the **exact same object instance** by reference identity.'
    },
    {
      type: 'code',
      content: `import { useRef, useEffect, useState } from 'react';

export function ReferenceStabilityDemo() {
  const [renderCount, setRenderCount] = useState(0);
  
  // Initialize the ref
  const trackerRef = useRef<{ id: string }>({ id: 'unique-session-token' });
  
  // Store the reference from the first render
  const [initialRefInstance] = useState(() => trackerRef);

  useEffect(() => {
    // Assert that the reference object remains exactly the same across renders
    const isIdentical = Object.is(initialRefInstance, trackerRef);
    console.log(\`[Render #\${renderCount}] Is reference identical? \${isIdentical}\`);
  });

  return (
    <button onClick={() => setRenderCount(prev => prev + 1)}>
      Trigger Re-render (Current count: {renderCount})
    </button>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Because React returns the exact same object reference container across renders, Object.is(refFromRender1, refFromRender2) will evaluate to true. However, mutating the .current property does not trigger any render cycles or run effects unless the ref is in a dependency array—which is a severe anti-pattern.',
      metadata: { type: 'architecture', title: 'The Identity Stability Principle' }
    },
    {
      type: 'heading',
      content: 'Instance Variables & Bypassing Render Schedules',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A classic use case for `useRef` is acting as an **instance variable** (analogous to `this.variable` in class components). If you need to store timer IDs, websocket connections, event listeners, or cache responses, `useRef` prevents unnecessary visual updates while ensuring the value is immediately, synchronously updated.'
    },
    {
      type: 'code',
      content: `import { useRef, useEffect, useState } from 'react';

export function StopWatch() {
  const [seconds, setSeconds] = useState(0);
  
  // Timer ID is stored in a ref because it does not affect visual rendering directly
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    if (timerIdRef.current !== null) return;
    
    timerIdRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerIdRef.current === null) return;
    
    clearInterval(timerIdRef.current);
    timerIdRef.current = null; // Mutates synchronously, no re-render triggered here!
  };

  useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
    };
  }, []);

  return (
    <div>
      <h3>Elapsed: {seconds}s</h3>
      <button onClick={startTimer}>Start</button>
      <button onClick={stopTimer}>Stop</button>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'DOM Node Binding & Timing Mechanics',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When you pass a ref object to a React element using `<div ref={myRef} />`, React automates the synchronization process:\n\n1. During the **render phase**, React parses JSX and registers the ref node attachment request.\n2. During the **commit phase**, right before layout effects run, React updates `myRef.current` with the actual backing browser DOM node.\n3. During **unmount**, React cleans up the ref, setting `myRef.current` to `null` before executing cleanup effects.\n\nLet\'s build a robust, type-safe text input auto-focuser demonstrating correct DOM element constraints.'
    },
    {
      type: 'code',
      content: `import { useRef, useEffect } from 'react';

export function AutoFocusInput() {
  // Use HTMLInputElement type with a default null value
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // During mount, commit phase has attached the actual input node here
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.style.borderColor = '#10B981';
    }
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <label htmlFor="username">Username: </label>
      <input
        id="username"
        ref={inputRef}
        type="text"
        placeholder="Focusing on mount..."
        style={{ border: '1px solid #CBD5E1', padding: '6px', borderRadius: '4px' }}
      />
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Do NOT read or write ref.current during the main render function (i.e. outside of useEffect, callbacks, or layout hooks). React assumes render functions are pure projections; accessing or mutating refs during render introduces highly unpredictable side effects and breaks concurrent rendering safe states.',
      metadata: { type: 'warning', title: 'Ref Mutating During Render Phase' }
    },
    {
      type: 'heading',
      content: 'Constructing Custom Hook: usePrevious',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Sometimes you need to inspect the value of a state variable or prop from the **previous render cycle** (e.g. tracking index changes in slider controls). \n\nBecause effects run **after** the browser has painted the current render cycle, we can store the current value in a ref within an effect. During the main render cycle, the ref still holds the value from the *previous* cycle, letting us read it before it gets updated in the post-render effect step.'
    },
    {
      type: 'code',
      content: `import { useRef, useEffect } from 'react';

/**
 * Custom hook to track the value of a prop or state variable from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  // The effect runs AFTER the render has been committed and painted.
  // So the ref update happens at the end of the current cycle.
  useEffect(() => {
    ref.current = value;
  }, [value]);

  // Returns the value stored from the PREVIOUS render cycle
  return ref.current;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'text',
      content: 'Let\'s see how `usePrevious` works step-by-step in practice:\n\n1. Component receives state `value = "A"`. The render occurs. Hook returns `ref.current` which is `undefined`.\n2. Render finishes. The `useEffect` triggers, executing `ref.current = "A"`.\n3. Component receives state `value = "B"`. The render occurs. Hook returns `ref.current` which is still `"A"`.\n4. Render finishes. The `useEffect` triggers, executing `ref.current = "B"`.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Heap Mutability & Ref Synchronization' }
    },
    {
      type: 'faq',
      content: 'Q: What is the physical memory difference between useState and useRef in React?\nA: `useState` registers a state hook cell on the Fiber tree which, when updated, schedules an update queue and triggers a re-render phase for the component branch. `useRef` registers a persistent cell on the Fiber tree containing a mutable object `{ current: initialValue }`. Mutating `ref.current` updates the value immediately in heap memory, bypassing React\'s scheduler and triggering zero re-renders.'
    },
    {
      type: 'faq',
      content: 'Q: Why is reading or writing ref.current during the render phase considered dangerous?\nA: Because render functions must behave as pure, idempotent projections. Under Concurrent React, renders can be paused, aborted, retried, or executed off-screen. Reading or writing a mutable ref during render creates non-deterministic UI output, visual glitches, and breaks rendering isolation guarantees.'
    },
    {
      type: 'faq',
      content: 'Q: Why can\'t we just declare a let variable outside of the component instead of useRef?\nA: If declared outside the component function, that variable is shared globally across **all instances** of that component mounted in the application. Mutating it in one instance affects all other instances. `useRef` guarantees the mutable ref container is localized and isolated strictly to the specific fiber node / component instance.'
    },
    {
      type: 'faq',
      content: 'Q: How does useRef guarantee reference stability across rendering phases?\nA: During the initial mount phase, `useRef` creates a single object `{ current: initialValue }` and saves it on the internal Hook structure of the fiber node. In subsequent updates (renders), the corresponding update hook simply retrieves the exact same object from the fiber heap, assuring `Object.is(currentRef, nextRef) === true`.'
    }
  ]
};
