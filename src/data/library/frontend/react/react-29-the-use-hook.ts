import type { NoteContent } from '../../../types';
import theUseHookSvg from '../../../../assets/diagrams/frontend/react/the-use-hook.svg?raw';

export const content: NoteContent = {
  id: 'react-29',
  moduleId: 'react',
  order: 29,
  group: 'React 19 & Next.js',
  title: 'React 19 The use Hook',
  description: 'In-depth review of React 19\'s new `use` hook, the unified API for consuming Promises and Context, executing hooks conditionally, loop-based hook integration, and avoiding infinite render loops.',
  sections: [
    {
      type: 'text',
      content: 'In traditional React development, the "Rules of Hooks" were absolute: hooks could never be called inside conditional blocks (`if`), loops (`for`), or nested functions. This constraint ensured that hook calls occurred in the exact same index order on every render, allowing React to align hooks with their internal Fiber states. \n\n**React 19 `use`** breaks this constraint. It is a new React API designed to consume async resources (Promises) and React Context dynamically. Unlike standard hooks, `use` can be called conditionally or in loops. When passed a Context, it functions as a dynamic version of `useContext`. When passed a Promise, it intercepts rendering, automatically yields control to the nearest `<Suspense>` boundary, suspends execution until the promise resolves, and then resumes rendering with the resolved value—all without requiring any hand-written data fetching boilerplate.'
    },
    {
      type: 'diagram',
      content: theUseHookSvg
    },
    {
      type: 'callout',
      content: 'The `use` API is technically not a Hook in the traditional sense, but an API. Because it is evaluated dynamically at runtime, it does not rely on strict index ordering inside the Fiber architecture, which is why it can bypass standard hook constraints.',
      metadata: { type: 'architecture', title: 'Why use is not a Traditional Hook' }
    },
    {
      type: 'heading',
      content: 'Conditional Context & Async Promise Resolution',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To illustrate the flexibility of the `use` API, let\'s examine a production-grade module. It demonstrates two key patterns:\n1. **Promise Consumption**: Consuming a loading data promise inline, complete with automatic Suspense integration.\n2. **Conditional Context**: Consuming a user theme context only if a specific profile feature is turned on, which is illegal using traditional `useContext`.'
    },
    {
      type: 'code',
      content: `import React, { use, useMemo, createContext, Suspense } from 'react';

// ============================================================================
// 1. Data Interfaces & Contexts
// ============================================================================
export interface UserProfile {
  username: string;
  role: 'admin' | 'user';
  premium: boolean;
}

export const ThemeContext = createContext<{ theme: 'dark' | 'light' }>({ theme: 'dark' });

// Simulated Server API call
async function fetchUserProfile(userId: string): Promise<UserProfile> {
  await new Promise((resolve) => setTimeout(resolve, 800)); // Latency
  return {
    username: 'Kunwaravi',
    role: 'admin',
    premium: true
  };
}

// ============================================================================
// 2. Component Consuming Promises and Context via 'use'
// ============================================================================
interface ProfileCardProps {
  userId: string;
  userPromise: Promise<UserProfile>;
  showTheme: boolean;
}

export function ProfileCard({ userId, userPromise, showTheme }: ProfileCardProps) {
  // Pattern 1: Consume Promise Inline!
  // If the promise is not resolved, React will immediately suspend rendering
  // and display the fallback of the parent Suspense boundary.
  const profile = use(userPromise);

  // Pattern 2: Conditional Context!
  // Traditional useContext would trigger a compiler error if placed inside an 'if' block.
  // The 'use' API works perfectly here.
  let activeTheme = 'dark';
  if (showTheme) {
    const config = use(ThemeContext);
    activeTheme = config.theme;
  }

  return (
    <div 
      className={\`p-6 rounded-xl border \${
        activeTheme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-950'
      }\`}
    >
      <h3 className="font-bold text-lg">{profile.username}</h3>
      <p className="text-sm opacity-70">Role: {profile.role}</p>
      
      {profile.premium && (
        <span className="inline-block mt-2 px-2 py-1 text-xs bg-amber-500 text-slate-900 rounded font-bold">
          PREMIUM SUBSCRIBER
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 3. Parent Coordinator showing Promise Caching
// ============================================================================
export function Dashboard() {
  // CRITICAL WARNING: Caching the Promise
  // If we create the Promise inside the render function of Dashboard (e.g. fetchUserProfile('user-1')),
  // React will recreate the Promise on every single render. When 'use' suspends rendering,
  // Dashboard re-renders, creating a brand-new Promise, suspending again, creating an infinite loop.
  // Use useMemo (or a framework cache) to ensure referential stability of the promise!
  const userPromiseMemo = useMemo(() => {
    return fetchUserProfile('usr_9921');
  }, []);

  return (
    <div className="p-8">
      <Suspense fallback={<div className="animate-pulse text-slate-400">Syncing Profile Data...</div>}>
        <ProfileCard 
          userId="usr_9921" 
          userPromise={userPromiseMemo} 
          showTheme={true} 
        />
      </Suspense>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Never create a promise directly inside the body of a rendering component and pass it to `use`. Doing so triggers an infinite re-render loop as React repeatedly suspends, recreates the promise reference, and suspends again. Always cache your promises using `useMemo`, a module-level cache, or server-level caching layers.',
      metadata: { type: 'warning', title: 'The Promise Caching Trap' }
    },
    {
      type: 'callout',
      content: 'When a promise passed to `use` rejects, the nearest parent **Error Boundary** catches the rejection automatically. Ensure that components using promise-resolution are wrapped in both `<Suspense>` and an Error Boundary to handle rejection gracefully.',
      metadata: { type: 'runtime', title: 'Error Boundary Integration' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'use API Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the primary difference between the use API and traditional hooks like useContext?\nA: Traditional React hooks must follow the "Rules of Hooks": they cannot be executed inside conditional blocks (`if`), loops (`for`), or nested callbacks. The `use` API completely bypasses these constraints. It is evaluated dynamically at runtime, meaning you can call `use(Context)` inside an `if` block, or map over an array and call `use(Promise)` inside a loop.'
    },
    {
      type: 'faq',
      content: 'Q: Why does passing a non-cached promise to the use API cause an infinite re-render loop?\nA: When a promise is passed to `use`, and that promise is still pending, React immediately interrupts (suspends) rendering. Once the promise resolves, React schedules a re-render of the component to display the resolved data. If the promise was created directly inside the render block (without `useMemo` or external caching), the re-render creates a *new, unresolved promise*. React then suspends again, creating an infinite loop of suspension and re-rendering.'
    },
    {
      type: 'faq',
      content: 'Q: How does the use API handle promise rejections?\nA: When a Promise passed to the `use` API rejects, React treats it similarly to a runtime execution error. It instantly triggers the nearest parent **Error Boundary** in the component tree. The Error Boundary catches the rejection reason and renders its fallback UI, allowing you to handle API query crashes gracefully without crashing the entire app.'
    }
  ]
};
