import type { NoteContent } from '../../../types';
import useactionstateSvg from '../../../../assets/diagrams/frontend/react/useactionstate.svg?raw';

export const content: NoteContent = {
  id: 'react-27',
  moduleId: 'react',
  order: 27,
  group: 'React 19 & Next.js',
  title: 'React 19 useActionState',
  description: 'Deep dive into React 19 useActionState (formerly useFormState). Learn to manage asynchronous form action states, capture returned state payloads, track pending statuses, and write strict type-safe form handlers.',
  sections: [
    {
      type: 'text',
      content: 'Managing form submission states has always been one of React\'s most verbose tasks. Capturing input fields, wiring up submit event handlers, toggling loading spinners, managing successful returns, and catching input-specific backend validation errors required custom hooks or repetitive states. \n\n**React 19 `useActionState`** (previously introduced in React 18 experimental builds as `useFormState`) natively resolves this problem. It is designed to streamline form flows that rely on async Actions. Instead of manually maintaining state, you pass it an asynchronous action function and an initial state. It returns three values: the **current state** (updated whenever the action finishes), a **wrapped action executor** (to be passed directly to the HTML `<form action>` prop), and a **boolean pending flag** (`isPending`) that signals when the background transition is processing.'
    },
    {
      type: 'diagram',
      content: useactionstateSvg
    },
    {
      type: 'callout',
      content: 'The core signature of `useActionState` is:\n`const [state, formAction, isPending] = useActionState(actionFn, initialState);`\n\nCrucially, the callback function passed as `actionFn` receives two arguments: the **previous state** of the form as the first argument, and the **FormData** (or custom argument) as the second. Its returned value becomes the next active state.',
      metadata: { type: 'architecture', title: 'The ActionState Signature' }
    },
    {
      type: 'heading',
      content: 'Building a Type-Safe Signup Form Module',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases a production-grade signup form implementing `useActionState`. It handles validation messages, displays pending feedback, disables double submission, and validates inputs using strict TypeScript types.'
    },
    {
      type: 'code',
      content: `import React, { useActionState } from 'react';

// ============================================================================
// 1. Core Interfaces & Types
// ============================================================================
export interface FormState {
  success: boolean;
  message: string;
  errors?: {
    email?: string;
    password?: string;
  };
  submittedEmail?: string;
}

const INITIAL_STATE: FormState = {
  success: false,
  message: ''
};

// ============================================================================
// 2. Asynchronous Action Handler (Executes on Server or Client)
// ============================================================================
async function signupAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  // Simulate network latency / database write
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const errors: FormState['errors'] = {};

  // Simple validation checks
  if (!email || !email.includes('@')) {
    errors.email = 'Please provide a valid email address.';
  }
  if (!password || password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: 'Validation failed.',
      errors
    };
  }

  // Success case: Return new state values
  return {
    success: true,
    message: 'User registered successfully!',
    submittedEmail: email
  };
}

// ============================================================================
// 3. Form Component
// ============================================================================
export function SignupForm() {
  // useActionState receives our action handler and initial state.
  // It handles state tracking and pending transition flags out-of-the-box.
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    signupAction,
    INITIAL_STATE
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-900 border border-slate-800 rounded-xl">
      <h2 className="text-white text-xl font-bold mb-4">Create Account</h2>

      {state.success ? (
        <div className="p-4 bg-emerald-950 border border-emerald-800 rounded-lg text-emerald-300">
          <p className="font-bold">{state.message}</p>
          <p className="text-sm mt-1">Verification link sent to: {state.submittedEmail}</p>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          {/* Email input field */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1">
              Email Address
            </label>
            <input
              name="email"
              type="text"
              disabled={isPending}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
            {state.errors?.email && (
              <p className="text-red-500 text-xs mt-1" id="email-validation-error">
                {state.errors.email}
              </p>
            )}
          </div>

          {/* Password input field */}
          <div>
            <label className="block text-slate-300 text-sm font-semibold mb-1">
              Secret Password
            </label>
            <input
              name="password"
              type="password"
              disabled={isPending}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
            {state.errors?.password && (
              <p className="text-red-500 text-xs mt-1" id="password-validation-error">
                {state.errors.password}
              </p>
            )}
          </div>

          {/* Submit button dynamically tracks pending state */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors"
          >
            {isPending ? 'Signing up...' : 'Register'}
          </button>

          {state.message && !state.success && (
            <p className="text-amber-500 text-center text-sm mt-2">{state.message}</p>
          )}
        </form>
      )}
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'The action handler receives the *previous* state as its first argument. This allows you to accumulate historical form state inputs, implement multi-step form sequences, or create undo/redo history trackers naturally.',
      metadata: { type: 'architecture', title: 'Accumulative Form State Pattern' }
    },
    {
      type: 'callout',
      content: 'Unlike standard event listeners, the action returned by `useActionState` is automatically executed within an asynchronous transition lane. This means any state updates occurring inside the action do not block user interactions like scrolling or typing on the page.',
      metadata: { type: 'runtime', title: 'Transition Thread Isolation' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'useActionState Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the main structural difference between useActionState in React 19 and traditional useState for forms?\nA: Traditional forms using `useState` require manual binding of values, change listeners (`onChange`), submission handlers (`onSubmit`), manual loading state toggling (`setLoading(true)`), and manual try-catch traps. React 19 `useActionState` manages this lifecycle natively. You pass an async action callback, and it gives you the current action state (such as backend validation errors or success flags), a direct action-prop executor, and a built-in `isPending` transition flag.'
    },
    {
      type: 'faq',
      content: 'Q: Why does the action callback passed to useActionState accept the previous state as its first argument?\nA: This allows actions to be "accumulative" and stateful. By receiving the previous state, actions can support advanced UX patterns like multi-step registration forms (carrying steps 1 and 2 state forward), incrementing request counters, or logging execution histories directly without needing extra external state hooks.'
    },
    {
      type: 'faq',
      content: 'Q: How does useActionState work with Server Actions in frameworks like Next.js?\nA: They integrate seamlessly. Next.js Server Actions are functions marked with `"use server"` that execute exclusively in the cloud. By passing a Server Action to `useActionState`, the browser will automatically make an RPC (Remote Procedure Call) fetch request when the form is submitted. The hook manages the loading state (`isPending`) dynamically, and once the Server Action returns a payload, the hook re-renders the client UI with the fresh data.'
    }
  ]
};
