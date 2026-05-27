import type { NoteContent } from '../../../types';
import useeffectSvg from '../../../../assets/diagrams/frontend/react/useeffect.svg?raw';

export const content: NoteContent = {
  id: 'react-9',
  moduleId: 'react',
  order: 9,
  group: 'Core Philosophy',
  title: 'useEffect Mental Model',
  description: 'Deep dive into useEffect as a synchronization engine rather than a lifecycle hook, dependency array reference diffing, and stale closures traps.',
  sections: [
    {
      type: 'text',
      content: 'A major source of confusion in React is treating **`useEffect`** as a set of component lifecycle methods (like `componentDidMount`, `componentDidUpdate`, and `componentWillUnmount`). \n\nIn declarative React, the correct mental model is **Synchronization**. `useEffect` allows you to synchronize your component\'s state, props, or rendering output with an **external system** (such as a Chat Room WebSocket, custom analytics SDK, or native browser API) after the component has painted.'
    },
    {
      type: 'diagram',
      content: useeffectSvg
    },
    {
      type: 'callout',
      content: 'If you are using `useEffect` solely to calculate computed values (e.g. filtering an array based on active query props) or to update local state based on props changes, you are introducing **unnecessary re-renders**. Calculate computed values inline during the render phase, or use memoization hooks.',
      metadata: { type: 'warning', title: 'The "You Might Not Need An Effect" Rule' }
    },
    {
      type: 'heading',
      content: 'Dependency Arrays: Reference vs. Value',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'React compares the values in the dependency array on every render pass using `Object.is` (shallow equality check):\n\n1. **Primitives** (numbers, strings, booleans): Compared by **Value**. If the value remains the same, the effect does not run.\n2. **Objects, Arrays, Functions**: Compared by **Reference**. If you recreate an object inside the component body, its memory reference changes on *every single render pass*, forcing the effect to run on every render.'
    },
    {
      type: 'code',
      content: `import React, { useState, useEffect, useMemo } from 'react';

export function ChatConnection() {
  const [roomId, setRoomId] = useState('general');

  // UNOPTIMIZED: Object literal created on EVERY render.
  // The reference changes every time, causing useEffect to re-connect infinitely!
  // const options = { server: 'https://chat.nexus.dev' };
  
  // OPTIMIZED: Memoize the object reference
  const options = useMemo(() => ({
    server: 'https://chat.nexus.dev'
  }), []);

  useEffect(() => {
    const connection = connectToChat(roomId, options);
    
    // THE CLEANUP CONTRACT: Always clean up connections/listeners
    // Runs before the next effect execution and when the component unmounts
    return () => {
      connection.disconnect();
    };
  }, [roomId, options]); // stable dependencies

  return <div>Connected to {roomId}</div>;
}

function connectToChat(roomId: string, options: { server: string }) {
  // Mock connection object
  return { disconnect: () => {} };
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Stale Closures in Effects',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'If an effect references state or props but omits them from the dependency array, the effect handler becomes a **stale closure**. The effect will only see the values captured when the effect ran, leading to bugs where callbacks operate on stale state.'
    },
    {
      type: 'callout',
      content: 'To fix stale closures, always list all variables read inside the effect in the dependency array, or leverage functional state updates to eliminate the state variable dependency entirely.',
      metadata: { type: 'architecture', title: 'Stale Closures Remediation' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Effect Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: Why is useEffect considered a synchronization tool rather than a lifecycle hook?\nA: Lifecycle hooks are imperative markers based on component mounting states. `useEffect` is declarative: you describe what external systems (WebSockets, events) the component should be synchronized with for the current state. When state changes, React synchronizes the systems automatically, un-syncing (cleaning up) the old state first.'
    },
    {
      type: 'faq',
      content: 'Q: What happens if you omit the cleanup function inside a WebSocket connection effect?\nA: It creates a severe resource leak. Every time the dependency (e.g. `roomId`) changes, a fresh connection is opened while the old connection remains open in the background. In production, this can crash the server with thousands of socket connections and trigger state memory leaks.'
    },
    {
      type: 'faq',
      content: 'Q: How does React perform dependency checks in useEffect?\nA: React compares the current dependencies array with the previous render array item-by-item using strict shallow equality `Object.is`. If any item changes reference or value, React schedules the effect to run in a deferred macro-task after the paint phase.'
    }
  ]
};
