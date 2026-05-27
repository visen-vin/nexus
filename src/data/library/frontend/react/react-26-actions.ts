import type { NoteContent } from '../../../types';
import actionsSvg from '../../../../assets/diagrams/frontend/react/actions.svg?raw';

export const content: NoteContent = {
  id: 'react-26',
  moduleId: 'react',
  order: 26,
  group: 'React 19 & Next.js',
  title: 'React 19 Actions Overview',
  description: 'In-depth exploration of React 19 Actions, standardizing the management of asynchronous operations, automatic pending states, native error handling, and form-level auto-resets.',
  sections: [
    {
      type: 'text',
      content: 'In traditional React development, handling asynchronous interactions (like form submissions, API post requests, and server transactions) required substantial boilerplate. Developers had to write manual state variables (`loading`, `error`, `data`), handle try-catch traps, coordinate loading indicators, and clean up form inputs manually once the action finished. \n\n**React 19 Actions** standardizes this workflow. An "Action" is simply any function (often async) wrapped inside a transition boundary. When an Action is triggered, React intercepts the promise, automatically sets an internal pending transition state, coordinates multi-step state commits, catches promise rejections, and natively resets form elements when the promise successfully resolves. This simplifies form and UI coordination, keeping interfaces interactive and resilient during heavy async operations.'
    },
    {
      type: 'diagram',
      content: actionsSvg
    },
    {
      type: 'callout',
      content: 'Any function that returns a Promise can be passed to a React 19 action handler (like standard HTML `<form action={...}>`). React will automatically execute the function within an **async transition** lane, managing lifecycle and loading states with zero hand-written `setLoading` indicators.',
      metadata: { type: 'architecture', title: 'The Core Action Principle' }
    },
    {
      type: 'heading',
      content: 'Manual Loading vs. Automatic Actions',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To understand the difference, let\'s contrast the legacy manual approach with React 19 Actions. In the legacy model, we had to manage loading and error states manually. In the new model, React intercepts the async action, handling the pending state, error catching, and even clearing form inputs after success.'
    },
    {
      type: 'code',
      content: `import React, { useState, useTransition } from 'react';

// ============================================================================
// Legacy React 18 Approach: Manual Async State Coordination
// ============================================================================
export function LegacyContactForm() {
  const [name, setName] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      // Simulate API submit
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify({ name })
      });
      // Manual form reset
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={(e) => setName(e.target.value)} disabled={isPending} />
      <button type="submit" disabled={isPending}>
        {isPending ? 'Sending...' : 'Send Message'}
      </button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}

// ============================================================================
// Modern React 19 Approach: Direct Async Action Integration
// ============================================================================
// Simulated production API handler
async function submitContactAction(formData: FormData): Promise<void> {
  const name = formData.get('name');
  const response = await fetch('/api/contact', {
    method: 'POST',
    body: JSON.stringify({ name })
  });
  
  if (!response.ok) {
    throw new Error('Database insertion failed');
  }
}

export function ModernContactForm() {
  // We can wrap actions in useTransition to access the isPending state
  const [isPending, startTransition] = useTransition();

  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
      try {
        await submitContactAction(formData);
        // Form is automatically reset by React when using the native action prop!
      } catch (err) {
        console.error('Action Failed:', err);
      }
    });
  };

  return (
    <form action={handleFormAction}>
      {/* Uncontrolled inputs work natively and are reset automatically */}
      <input name="name" type="text" disabled={isPending} />
      
      <button type="submit" disabled={isPending}>
        {isPending ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'When an async action completes, React automatically resets any uncontrolled form inputs inside the `<form>` element. This prevents developers from writing brittle manual clearing handlers, simplifying input validation systems.',
      metadata: { type: 'runtime', title: 'Automatic Form Reset Mechanics' }
    },
    {
      type: 'heading',
      content: 'The Mechanism of Async Transitions',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Under the hood, React 19 Actions utilize **Priority Lanes** in the fiber reconciler. When `startTransition` executes an async callback, React registers the promise inside a special transition queue. While this promise is active, the reconciler schedules low-priority background render ticks. This allows urgent inputs (like keyboard typing or scrolling) to immediately interrupt the rendering of the action\'s outcome, guaranteeing that the application never stutters or freezes.'
    },
    {
      type: 'callout',
      content: 'Never block an action callback with long-running synchronous code before returning the promise. The transition boundary only delegates *asynchronous* waiting states; blocking synchronous code will still lock the browser main thread.',
      metadata: { type: 'warning', title: 'Transition Blocking Trap' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Actions Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is a React 19 Action and how does it relate to traditional state hooks?\nA: An Action is any function wrapped inside an async transition boundary (e.g. via `startTransition` or directly passed to `<form action>`). It doesn\'t replace state hooks; instead, it coordinates state hooks. It automatically sets the transition pending state (`isPending`), intercepts and catches async promise rejections, and performs cleanups (like clearing form fields) once the operation resolves.'
    },
    {
      type: 'faq',
      content: 'Q: How does React 19 automatically reset forms when an action finishes?\nA: When you pass an async function to the HTML `<form action={...}>` prop, React registers an internal listener. Once the action\'s returned Promise resolves successfully, React internally executes a form reset, clearing all uncontrolled form inputs automatically. If the action throws an error, the input fields are preserved so users don\'t lose their typed input.'
    },
    {
      type: 'faq',
      content: 'Q: Why is wrapping async handlers in startTransition better than a simple setLoading(true)/setLoading(false) state?\nA: A standard `setLoading` state triggers synchronous, blocking re-renders. If the component tree below is heavy, the browser UI can stutter. By wrapping the promise inside `startTransition`, React executes the rendering work in a lower-priority background lane. The browser remains responsive to immediate user inputs (like scrolling or typing), which can instantly preempt the transition render task.'
    }
  ]
};
