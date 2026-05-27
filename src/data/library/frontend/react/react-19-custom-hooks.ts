import type { NoteContent } from '../../../types';
import customHooksSvg from '../../../../assets/diagrams/frontend/react/custom-hooks.svg?raw';

export const content: NoteContent = {
  id: 'react-19',
  moduleId: 'react',
  order: 12,
  group: 'Hooks & State',
  title: 'Custom Hooks Architecture & Composition',
  description: 'Deep dive into logic encapsulation, state isolation mechanics, returning status objects vs array tuples, and designing composite hook pipelines.',
  sections: [
    {
      type: 'text',
      content: 'In modern React, **Custom Hooks** are the primary mechanism for encapsulating and sharing stateful logic across multiple components. Unlike standard helper functions, custom hooks can invoke other React hooks (like `useState`, `useEffect`, `useContext`, or other custom hooks), creating reusable composition pipelines.'
    },
    {
      type: 'diagram',
      content: customHooksSvg
    },
    {
      type: 'callout',
      content: 'Every time a custom hook is invoked within a component, it gets its own **isolated state container**. Hooks do *not* share state values directly; instead, they encapsulate the stateful *logic* and *mechanics*. Under the hood, React reserves a unique series of slots inside that specific component\'s Fiber node memory stack for the hook\'s internal states.',
      metadata: { type: 'architecture', title: 'Isolated Fiber Instantiation' }
    },
    {
      type: 'heading',
      content: 'The Rules of Hooks & Fiber Linked List Mechanics',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To understand why custom hooks operate under strict constraints, we must look at React\'s runtime architecture. React does not keep track of hooks by key or name; instead, it relies entirely on the **order of execution**.\n\nInside every Active Fiber Node, React maintains a **linked list of hook cells** (`memoizedState`). Each call to a hook (like `useState` or `useEffect`) registers a cell on this list and advances a pointer. This explains the two core Rules of Hooks:\n\n1. **Only Call Hooks at the Top Level**: Do not call hooks inside loops, conditions, or nested functions. Doing so shifts the order of execution, causing the pointer to misalign with the linked list cells on subsequent renders, leading to silent state corruption.\n2. **Only Call Hooks from React Functions**: Call them from React functional components or other custom hooks to ensure the runtime context is active and has access to the current Fiber node.'
    },
    {
      type: 'callout',
      content: 'With React 19 and the new **React Compiler**, static analysis checks are increasingly robust. The linter (`eslint-plugin-react-hooks`) and the compiler ensure that hook dependencies and calls are statically extractable, optimizing hook execution pathways and preserving the strict FIFO linked list layout.',
      metadata: { type: 'runtime', title: 'React Compiler Integration' }
    },
    {
      type: 'heading',
      content: 'Design Patterns: Status Objects vs. Array Tuples',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When designing custom hooks, you must choose how to expose the return values. The two dominant patterns are **Array Tuples** (mimicking `useState`) and **Status/Configuration Objects**.'
    },
    {
      type: 'heading',
      content: '1. Array Tuples (e.g., const [value, setValue] = useX())',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: '- **Pros**: Trivial to rename destructured variables (e.g., `const [count, setCount] = useCounter()` and `const [age, setAge] = useCounter()`). Looks idiomatic for hooks that return exactly one primary value and a modifier.\n- **Cons**: Rigid ordering. Extending the hook in the future is highly painful. If you need to return a third value (e.g., `error`), consumers must destructure all preceding elements, or it breaks backward compatibility.'
    },
    {
      type: 'heading',
      content: '2. Status Objects (e.g., const { data, loading, error } = useX())',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: '- **Pros**: Extremely extensible. You can add new properties (e.g., `refetch`, `status`, `updatedAt`) without breaking existing call sites. Consumers only destructure the specific fields they need.\n- **Cons**: Renaming variables during destructuring is slightly more verbose: `const { data: userData } = useUser()`.'
    },
    {
      type: 'callout',
      content: 'For simple utility hooks with 1-2 return values, use an Array Tuple. For complex domain hooks, data fetching, or async workflows, **always return a Status Object** to ensure long-term architectural extensibility.',
      metadata: { type: 'architecture', title: 'Senior API Recommendation' }
    },
    {
      type: 'heading',
      content: 'Architecting Composition Pipelines',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Custom hooks shine when they are composed together like functional building blocks. Let\'s build a composed hook pipeline where a top-level hook (`useAuthenticatedData`) uses three independent hooks (`useAuth`, `useLocalStorage`, and a type-safe dynamic data fetcher).'
    },
    {
      type: 'code',
      content: `import { useState, useEffect, useCallback } from 'react';

// Hook 1: Simulated Auth Hook
export interface User {
  id: string;
  name: string;
  token: string;
}

export function useAuth() {
  // Static mockup for demo; in real systems, this reads from Context
  const user: User = { id: 'usr-99', name: 'Alice Smith', token: 'jwt-secure-101' };
  const isAuthenticated = true;
  return { user, isAuthenticated, token: user.token };
}

// Hook 2: Persistent LocalStorage State Hook
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn('LocalStorage error:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

// Hook 3: Composed Hook - Combines auth, local cache, and async workflows
interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAuthenticatedData<T>(url: string, cacheKey: string): FetchState<T> & { refetch: () => void } {
  const { token, isAuthenticated } = useAuth();
  const [cachedData, setCachedData] = useLocalStorage<T | null>(cacheKey, null);
  const [state, setState] = useState<FetchState<T>>({
    data: cachedData,
    loading: !cachedData,
    error: null,
  });

  const fetchData = useCallback(async (abortController: AbortController) => {
    if (!isAuthenticated || !token) {
      setState(s => ({ ...s, loading: false, error: new Error('User not authenticated') }));
      return;
    }

    setState(s => ({ ...s, loading: true }));

    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        signal: abortController.signal
      });

      if (!response.ok) {
        throw new Error(\`Network error: \${response.statusText}\`);
      }

      const json = await response.json() as T;
      setCachedData(json);
      setState({ data: json, loading: false, error: null });
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setState({ data: null, loading: false, error: err });
      }
    }
  }, [url, token, isAuthenticated, setCachedData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller);
    return () => controller.abort();
  }, [fetchData]);

  const refetch = useCallback(() => {
    const controller = new AbortController();
    fetchData(controller);
  }, [fetchData]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch
  };
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'When writing custom hooks that expose action functions (like `refetch` or `setValue`), **always wrap those functions in `useCallback`**. If you return raw, un-memoized functions, any parent component using your hook will pass a fresh reference on every render, triggering accidental child re-renders or infinite `useEffect` loops if passed as dependency array variables.',
      metadata: { type: 'warning', title: 'Memoization Leakage' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Advanced Hook Master Class' }
    },
    {
      type: 'faq',
      content: 'Q: If two separate components call the exact same custom hook, do they share state?\nA: Absolutely not. Custom hooks isolate stateful mechanics, but each component call gets its own hook cells allocated inside its own execution Fiber node. It is functionally identical to calling standard `useState` twice in separate components.'
    },
    {
      type: 'faq',
      content: 'Q: Why can we not call React hooks conditionally or inside loops?\nA: React maps states to components purely by the chronological order of execution using a linked list. If a hook call is inside a conditional that resolves to false, that hook is skipped. The linked list pointer then becomes offset, aligning all subsequent hook slots with the wrong state cells, resulting in severe state mismatches.'
    },
    {
      type: 'faq',
      content: 'Q: What are the trade-offs of returning an object vs. an array tuple from custom hooks?\nA: Array tuples allow easy destructuring and custom naming on the fly, but are highly fragile to expand since elements are mapped by sequential index. Objects allow new return parameters (status flags, callbacks, timestamps) to be appended without introducing breaking changes, but require longer syntax when mapping/renaming properties.'
    },
    {
      type: 'faq',
      content: 'Q: How should you handle async cleanup inside custom hooks to prevent memory leaks and race conditions?\nA: Always return a cleanup function inside the hook\'s `useEffect` to abort outstanding requests or clear timers. Using `AbortController` as shown in the composition example ensures that if a component unmounts or its dependency parameters change mid-flight, stale network requests are safely cancelled and do not mutate outdated state.'
    }
  ]
};
