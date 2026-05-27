import type { NoteContent } from '../../../types';
import cleanupSvg from '../../../../assets/diagrams/frontend/react/cleanup.svg?raw';

export const content: NoteContent = {
  id: 'react-10',
  moduleId: 'react',
  order: 10,
  group: 'Core Philosophy',
  title: 'Effect Cleanups & Race Conditions',
  description: 'Deep dive into how useEffect cleanup functions work, how to handle network race conditions using active flags and AbortControllers, and understanding Strict Mode double invocations.',
  sections: [
    {
      type: 'text',
      content: 'In React, **`useEffect`** is not just for launching side effects—it is also responsible for stopping them. Every time an effect runs, it can return a **cleanup function**. \n\nThe cleanup contract is simple but powerful:\n1. **Before every re-run** of the effect (due to dependency updates), the previous render\'s cleanup function is executed first.\n2. **When the component unmounts**, the final cleanup function is executed.\n\nThis cycle is critical for preventing memory leaks, duplicate subscriptions, and asynchronous state updates on unmounted or stale components.'
    },
    {
      type: 'diagram',
      content: cleanupSvg
    },
    {
      type: 'heading',
      content: 'The Mechanics of Race Conditions',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A classic race condition occurs when two fast-paced network requests are initiated in sequence. If Request A takes **5 seconds** to resolve but Request B takes **1 second**, Request B will resolve first and update the UI. Four seconds later, Request A will resolve and overwrite the UI with **stale data**.\n\nThere are two main industry-standard patterns to solve this inside `useEffect`:'
    },
    {
      type: 'heading',
      content: 'Pattern 1: The Boolean Flag (Active Guard)',
      metadata: { level: 3 }
    },
    {
      type: 'code',
      content: `import React, { useState, useEffect } from 'react';

export function UserProfile({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    let active = true; // 1. Set local active flag to true

    async function fetchData() {
      const response = await fetch(\`/api/users/\${userId}\`);
      const data = await response.json();
      
      // 2. Only update state if this effect execution is still active
      if (active) {
        setUserData(data);
      }
    }

    fetchData();

    // 3. Cleanup: Set active flag to false when dependency changes or unmounts
    return () => {
      active = false;
    };
  }, [userId]); // Re-runs on every userId change

  if (!userData) return <div>Loading...</div>;
  return <div>{userData.name}</div>;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Pattern 2: The AbortController (Network Cancellation)',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'Using a boolean flag lets the stale promise complete in the background but ignores its result. If you want to **actively abort** the network request to save bandwidth and server resources, use the browser\'s native `AbortController` API.'
    },
    {
      type: 'code',
      content: `import React, { useState, useEffect } from 'react';

export function UserProfileAbort({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // 1. Create AbortController instance
    const controller = new AbortController();
    const { signal } = controller;

    async function fetchData() {
      try {
        const response = await fetch(\`/api/users/\${userId}\`, { signal });
        const data = await response.json();
        setUserData(data);
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log('Fetch successfully aborted!');
        } else {
          // Handle real application errors
          console.error(error);
        }
      }
    }

    fetchData();

    // 2. Trigger abort inside cleanup
    return () => {
      controller.abort();
    };
  }, [userId]);

  if (!userData) return <div>Loading...</div>;
  return <div>{userData.name}</div>;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Strict Mode and Double Invocations',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'In development, React\'s **Strict Mode** intentionally mounts, unmounts, and mounts every component again. This causes your effects to run twice (`Mount` -> `Unmount/Cleanup` -> `Mount`).\n\nMany developers try to "fix" this by using a `useRef` to skip the second execution. **This is an anti-pattern.** \n\nStrict Mode is designed to force you to write resilient cleanup functions. If your effect breaks when run twice, it means you have a **missing cleanup function** that will leak memory or cause bugs in production (e.g. during Fast Refresh or when navigating back and forth).'
    },
    {
      type: 'callout',
      content: 'Instead of trying to suppress the double invocation, implement a clean return function to cancel/teardown whatever side-effect was initiated.',
      metadata: { type: 'warning', title: 'The useRef Double-Run Hack' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Cleanup Mechanics & Concurrency' }
    },
    {
      type: 'faq',
      content: 'Q: What is the exact execution order of cleanups and effects during a re-render?\nA: 1. React renders the component with new props/state. 2. The browser paints the screen. 3. React executes the **cleanup** function returned by the previous render\'s effect. 4. React executes the **new effect** returned by the current render.'
    },
    {
      type: 'faq',
      content: 'Q: Why is returning active = false in a cleanup function better than ignoring the entire race condition issue?\nA: Without active guards, asynchronous state updates will resolve out-of-order, leading to inconsistent UI states (e.g. showing active tabs matching different loaded lists). Additionally, attempting to set state on unmounted components causes React console warnings and memory leaks.'
    },
    {
      type: 'faq',
      content: 'Q: What happens if an AbortController is aborted after the fetch has already completed successfully?\nA: The abort signal has no effect if the request has already completed. The promise has resolved, and the browser\'s network operations have finalized, meaning it is perfectly safe and has no performance overhead.'
    },
    {
      type: 'faq',
      content: 'Q: Why does React Strict Mode double-invoke effects in development?\nA: It is a diagnostic tool to highlight missing cleanups. By forcing a mount-cleanup-mount sequence, React surfaces bugs like un-cleared intervals, double EventListeners, or un-aborted network streams immediately during development rather than waiting for subtle production leaks.'
    }
  ]
};
