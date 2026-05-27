import type { NoteContent } from '../../../types';
import layouteffectSvg from '../../../../assets/diagrams/frontend/react/layouteffect.svg?raw';

export const content: NoteContent = {
  id: 'react-11',
  moduleId: 'react',
  order: 11,
  group: 'Core Philosophy',
  title: 'useLayoutEffect vs useEffect',
  description: 'Deep dive into the browser paint timeline, understanding synchronous blocking via useLayoutEffect, measuring DOM nodes, and preventing visual layout flickering.',
  sections: [
    {
      type: 'text',
      content: 'While **`useEffect`** and **`useLayoutEffect`** have identical signatures and parameters, their internal timing and impact on the browser paint engine are completely different.\n\n- **`useEffect`** runs **asynchronously** after the browser has completed layout and paint. It is non-blocking and optimized for general tasks like network requests, analytical pings, or event listeners.\n- **`useLayoutEffect`** runs **synchronously** immediately after React mutates the DOM, but **before** the browser paints the updated layout to the screen. It blocks the browser from painting, allowing you to perform synchronous measurements and additional mutations before pixels hit the user\'s screen.'
    },
    {
      type: 'diagram',
      content: layouteffectSvg
    },
    {
      type: 'heading',
      content: 'The Paint Timeline & Visual Flickering',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'If you try to position an element dynamically (like a tooltip or a popover) based on another element\'s bounding client rectangle using `useEffect`:\n\n1. React renders the tooltip at a default fallback position (e.g. `top: 0, left: 0`).\n2. The browser paints this default position to the screen.\n3. `useEffect` fires in a post-paint macro-task, measures the anchor element, and updates tooltip state with coordinate values.\n4. React re-renders, committing new coordinates to the DOM.\n5. The browser paints the correct coordinates.\n\nThe result? The user sees a split-second **visual flash or layout flicker** where the tooltip jumps from `0,0` to its final location. Switching to `useLayoutEffect` guarantees that the measurement and correction happen in the same tick as the initial DOM mutation, rendering only the final correct position.'
    },
    {
      type: 'heading',
      content: 'Measuring DOM Nodes and Element Boundaries',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Here is a robust, type-safe implementation of a custom Tooltip overlay that dynamically measures its target anchor bounding box synchronously, ensuring absolutely zero rendering jumps.'
    },
    {
      type: 'code',
      content: `import React, { useState, useLayoutEffect, useRef } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactElement;
}

export function Tooltip({ text, children }: TooltipProps) {
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [show, setShow] = useState(false);
  
  const anchorRef = useRef<HTMLButtonElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  // useLayoutEffect is essential here to prevent visual jumps
  useLayoutEffect(() => {
    if (!show || !anchorRef.current || !tooltipRef.current) return;

    // 1. Measure dimensions of target and anchor elements
    const anchorRect = anchorRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    // 2. Compute correct overlay position (Centered above anchor)
    const top = anchorRect.top - tooltipRect.height - 8; // 8px offset
    const left = anchorRect.left + (anchorRect.width - tooltipRect.width) / 2;

    // 3. Write position coordinates to state synchronously
    setCoords({
      top: top + window.scrollY,
      left: left + window.scrollX
    });
  }, [show]); // Only run when tooltip visibility changes

  // Clone element to pass anchor ref securely
  const trigger = React.cloneElement(children, {
    ref: anchorRef,
    onMouseEnter: () => setShow(true),
    onMouseLeave: () => setShow(false)
  });

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {show && (
        <div
          ref={tooltipRef}
          style={{
            position: 'absolute',
            top: \`\${coords.top}px\`,
            left: \`\${coords.left}px\`,
            background: '#1E293B',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            border: '1px stroke #334155'
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Using `useLayoutEffect` blocks the main browser thread. If you perform heavy computational logic inside this hook (e.g. iterating over 10,000 array items), the browser UI will completely freeze, degrading the user experience. Limit tasks strictly to layout measurements and styling mutations.',
      metadata: { type: 'warning', title: 'The Performance Toll of Layout Blocking' }
    },
    {
      type: 'heading',
      content: 'Server-Side Rendering (SSR) Warning',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When using frameworks like Next.js or Remix, `useLayoutEffect` triggers a server-side warning: *“useLayoutEffect does nothing on the server...”*.\n\nThis is because server rendering produces static HTML where layout measurements are impossible (since there is no browser frame or viewport). \n\nTo solve this safely without triggering hydration mismatch errors, you can dynamically select the hook based on runtime presence of the window object, or use a custom isomorphic hook.'
    },
    {
      type: 'code',
      content: `import { useEffect, useLayoutEffect } from 'react';

// Isomorphic hook: useLayoutEffect on client, useEffect on server
export const useIsomorphicLayoutEffect = 
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Layout Timings & SSR Hydration' }
    },
    {
      type: 'faq',
      content: 'Q: What is the exact physical difference in the browser between useLayoutEffect and useEffect?\nA: `useLayoutEffect` executes synchronously in the same execution context as React\'s commit phase, blocking the browser\'s rendering loop from painting. `useEffect` schedules its execution inside an asynchronous task handler (like `MessageChannel` or `requestAnimationFrame`) which deferredly triggers after the paint process is complete.'
    },
    {
      type: 'faq',
      content: 'Q: When should a senior engineer choose useLayoutEffect over useEffect?\nA: Only when a state change leads to visual "glitching" or layout jumps because of DOM reads and subsequent writes. Common examples: dynamic overlay positioning (tooltips, dropdowns), preserving/restoring scroll positions, or building custom visual drag-and-drop engines.'
    },
    {
      type: 'faq',
      content: 'Q: Why does useLayoutEffect cause warnings during Server-Side Rendering (SSR)?\nA: Because the HTML generated on the server is static and lacks a rendering viewport or DOM sizing engines. Thus, layout measurements cannot be computed. During client hydration, the server markup will load first, causing a flash once layout measurements execute on the client. Using a conditional window check or isomorphic wrapper suppresses this safely.'
    }
  ]
};
