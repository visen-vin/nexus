import type { NoteContent } from '../../../types';
import useformstatusOptimisticSvg from '../../../../assets/diagrams/frontend/react/useformstatus-optimistic.svg?raw';

export const content: NoteContent = {
  id: 'react-28',
  moduleId: 'react',
  order: 28,
  group: 'React 19 & Next.js',
  title: 'React 19 useFormStatus & useOptimistic',
  description: 'Deep dive into React 19 form companion hooks: useFormStatus for context-driven parent form tracking, and useOptimistic for instant user feedback rendering with automatic rollback safety.',
  sections: [
    {
      type: 'text',
      content: 'In highly interactive web applications, responsive user interfaces are key to conversion and user satisfaction. Traditional asynchronous form flows are jarring: the user clicks "Submit", the screen freezes or displays a delayed loading spinner, and only after 500ms+ does the UI update. \n\nReact 19 introduces two powerful tools to solve this: \n1. **`useFormStatus`**: A context-driven hook that allows any deep child component within a `<form>` to automatically detect if the parent form is executing an async submission, reading fields like `pending`, `data`, and `method` without prop-drilling.\n2. **`useOptimistic`**: A state-coordination primitive that allows the UI to render the "intended" final state instantaneously at 60 FPS while the background async action is still running. If the backend action succeeds, the real data overwrites the UI; if it rejects, React automatically rolls back the interface to the previous state with zero visual stutter.'
    },
    {
      type: 'diagram',
      content: useformstatusOptimisticSvg
    },
    {
      type: 'callout',
      content: '`useFormStatus` utilizes an implicit context boundary established by standard HTML `<form>` tags that have an active Action. Crucially, `useFormStatus` can only read the status of a form that is rendered **above** the component calling the hook. Calling `useFormStatus` inside the same file that renders the `<form>` will return `pending: false` because it is not a child of the form context.',
      metadata: { type: 'architecture', title: 'The Parent-Child Context Boundary' }
    },
    {
      type: 'heading',
      content: 'Production-Grade Message Thread with Optimistic Updates',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Below is a complete, type-safe implementation of a real-time message board. It utilizes `useOptimistic` inside the parent message list to append messages instantly, and a child input component that uses `useFormStatus` to disable the submit button and show loading indicators during active API submissions.'
    },
    {
      type: 'code',
      content: `import React, { useOptimistic, useTransition } from 'react';
import { useFormStatus } from 'react-dom';

// ============================================================================
// 1. Data Interfaces & Types
// ============================================================================
export interface Message {
  id: string;
  text: string;
  sending?: boolean; // Flag to identify optimistic, unconfirmed items
}

// Simulated backend API submission
async function apiSendMessage(text: string): Promise<Message> {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate 5% random API rejection rates for illustrating rollback
      if (Math.random() < 0.05) {
        reject(new Error('Network timeouts / socket closed'));
      } else {
        resolve(true);
      }
    }, 1200); // 1.2 seconds network latency
  });

  return {
    id: \`msg-\${Date.now()}\`,
    text
  };
}

// ============================================================================
// 2. Child Component: Form Submit Button (Utilizes useFormStatus)
// ============================================================================
// Note: This must be in a separate child component nested inside the form
export function SubmitMessageButton() {
  // Implicitly reads active submission context from the parent <form>
  const { pending, data } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={\`px-4 py-2 font-bold text-white rounded-lg transition-colors \${
        pending ? 'bg-slate-700 cursor-not-allowed' : 'bg-teal-600 hover:bg-teal-700'
      }\`}
    >
      {pending ? 'Sending message...' : 'Send'}
    </button>
  );
}

// ============================================================================
// 3. Parent Component: Message Board (Utilizes useOptimistic)
// ============================================================================
export function MessageBoard({ initialMessages }: { initialMessages: Message[] }) {
  // Real confirmed state synced from parent/DB
  const [messages, setMessages] = React.useState<Message[]>(initialMessages);
  const [isPending, startTransition] = useTransition();

  // useOptimistic returns:
  // - optimisticMessages: The state that updates instantly during actions.
  // - addOptimistic: Function to append items to the state during transitions.
  const [optimisticMessages, addOptimistic] = useOptimistic<Message[], string>(
    messages,
    (state, newText) => [
      ...state,
      {
        id: \`temp-\${Date.now()}\`,
        text: newText,
        sending: true // Marked as sending for visual state styling
      }
    ]
  );

  const handleFormAction = async (formData: FormData) => {
    const text = formData.get('message') as string;
    if (!text.trim()) return;

    // Actions utilizing useOptimistic must execute within a transition!
    startTransition(async () => {
      // 1. Instantly trigger the optimistic UI change at 60 FPS
      addOptimistic(text);

      try {
        // 2. Await the actual server API write
        const newMessage = await apiSendMessage(text);
        
        // 3. Success: Commit the permanently returned server item
        setMessages((current) => [...current, newMessage]);
      } catch (err) {
        console.error('Submission Failed. Rolling back optimistic state:', err);
        // Error case: Simply exit. React automatically discards the optimistic
        // state changes, rolling the UI back to the confirmed 'messages' array!
      }
    });
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-xl space-y-4">
      <h3 className="text-white font-bold text-lg">Secure Chat Channel</h3>

      {/* Render the optimistic message state */}
      <ul className="h-64 overflow-y-auto space-y-2 p-2 bg-slate-950 rounded-lg">
        {optimisticMessages.map((msg) => (
          <li
            key={msg.id}
            className={\`p-2 rounded-lg text-sm transition-all \${
              msg.sending
                ? 'bg-slate-900 border border-dashed border-teal-800 text-teal-400 opacity-60'
                : 'bg-slate-800 text-slate-100'
            }\`}
          >
            <div>{msg.text}</div>
            {msg.sending && (
              <span className="text-[10px] text-teal-500 italic block mt-0.5 animate-pulse">
                Encrypting &amp; Sending...
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* Form executes direct form actions */}
      <form action={handleFormAction} className="flex gap-2">
        <input
          name="message"
          type="text"
          placeholder="Type message here..."
          className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
        />
        {/* Render child submit button containing useFormStatus hook */}
        <SubmitMessageButton />
      </form>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Always mark optimistic items with an explicit flag (e.g. `sending: true`). This allows you to apply styling indicators (like reduced opacity, dashes, or custom spinners), keeping the user fully informed that the operation is in-flight.',
      metadata: { type: 'runtime', title: 'Optimistic UI Transparency' }
    },
    {
      type: 'callout',
      content: 'Any optimistic addition triggered by `useOptimistic` will automatically discard itself once the transition block finishes execution. If you do not update the actual state hook (`setMessages`) in the success branch, the item will disappear from the screen upon transition end.',
      metadata: { type: 'warning', title: 'The Transition Discard Catch' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Form Hooks Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: Why does useFormStatus return pending: false when called in the same component that renders the &lt;form&gt; tag?\nA: useFormStatus works strictly by reading the Form Context established by the parent `<form>` element. In React\'s tree hierarchy, a component cannot consume a context provided within its own render output. To read the form status, the hook must be invoked inside a *nested child component* that is rendered within the opening and closing tags of the parent form.'
    },
    {
      type: 'faq',
      content: 'Q: How does useOptimistic automatically roll back state when an action rejects?\nA: useOptimistic acts as a temporary copy of your primary state. It accepts the source state (e.g. `messages`) as its first parameter. When you trigger `addOptimistic`, React updates this temporary state. If the async action resolves successfully, the parent state hook updates, making the source state matches the new value. If the action rejects, the parent state hook is never called. Upon completion of the async transition block, React discards the optimistic changes, rolling the UI back to the unchanged source state.'
    },
    {
      type: 'faq',
      content: 'Q: What are the parameters expected by the useOptimistic hook?\nA: useOptimistic takes two parameters: (1) `passthroughState` (the primary state source of truth that the optimistic state trails), and (2) `updateFn` (a reducer-like callback `(state, optimisticValue) => newOptimisticState` that dictates how the optimistic addition should be merged into the active state).'
    }
  ]
};
