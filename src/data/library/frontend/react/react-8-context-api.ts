import type { NoteContent } from '../../../types';
import contextSvg from '../../../../assets/diagrams/frontend/react/context.svg?raw';

export const content: NoteContent = {
  id: 'react-8',
  moduleId: 'react',
  order: 8,
  group: 'Core Philosophy',
  title: 'Context API Deep Dive',
  description: 'Deep dive into Context API broadcast internals, the unoptimized value reference re-render bottleneck, and the high-performance Split Context Pattern.',
  sections: [
    {
      type: 'text',
      content: 'The **Context API** provides a way to pass data through the component tree without having to pass props down manually at every level. While it is incredibly powerful for injecting global configuration, it is often misunderstood as a "state management tool." \n\nAt the engine level, Context is a **dependency injection mechanism**, not a state store. When a Context Provider\'s value changes, React triggers a full, un-abortable rendering pass on **every single component** that consumes that context via `useContext`, bypassing standard component memoization checks.'
    },
    {
      type: 'diagram',
      content: contextSvg
    },
    {
      type: 'callout',
      content: 'A major performance pitfall in combined contexts (e.g. `value={{ state, dispatch }}`) is that a new object reference is constructed **on every render pass**. Because `useContext` checks value identity by strict reference (`Object.is`), all consuming components fail the reference check and are forced to re-render, even if they only read the stable `dispatch` function.',
      metadata: { type: 'warning', title: 'The Combined Reference Bottleneck' }
    },
    {
      type: 'heading',
      content: 'The High-Performance Split Context Pattern',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To build production-grade, performant contexts, we separate the changing state data from the stable dispatch action callbacks using two distinct providers.'
    },
    {
      type: 'code',
      content: `// Step 1: Create two independent contexts
import React, { createContext, useContext, useReducer } from 'react';

interface TodoState { items: string[] }
type TodoAction = { type: 'ADD'; payload: string };

const TodoStateContext = createContext<TodoState | undefined>(undefined);
const TodoDispatchContext = createContext<React.Dispatch<TodoAction> | undefined>(undefined);

// Step 2: Reducer implementation
function todoReducer(state: TodoState, action: TodoAction): TodoState {
  switch (action.type) {
    case 'ADD':
      return { items: [...state.items, action.payload] };
    default:
      return state;
  }
}

// Step 3: Combined provider splitting the values
export function TodoProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(todoReducer, { items: [] });

  return (
    <TodoStateContext.Provider value={state}>
      <TodoDispatchContext.Provider value={dispatch}>
        {children}
      </TodoDispatchContext.Provider>
    </TodoStateContext.Provider>
  );
}

// Step 4: Clean, type-safe custom hooks
export function useTodoState() {
  const context = useContext(TodoStateContext);
  if (!context) throw new Error('useTodoState must be used within TodoProvider');
  return context;
}

export function useTodoDispatch() {
  const context = useContext(TodoDispatchContext);
  if (!context) throw new Error('useTodoDispatch must be used within TodoProvider');
  return context;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'By splitting contexts, components that consume `useTodoDispatch` to add items (e.g. input buttons) will **NEVER RE-RENDER** when state items update, because the `DispatchContext` value reference is completely stable and never changes.',
      metadata: { type: 'architecture', title: 'Performance Isolation' }
    },
    {
      type: 'heading',
      content: 'Alternative Optimization: Value Memoization',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'If splitting contexts is not feasible, you must wrap the combined provider value in a `useMemo` hook to ensure a fresh object is not generated unless the underlying state changes:'
    },
    {
      type: 'code',
      content: `// Memoizing combined context values to safeguard object reference stability
const value = useMemo(() => ({ state, dispatch }), [state]);

return (
  <AppContext.Provider value={value}>
    {children}
  </AppContext.Provider>
);`,
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
      metadata: { type: 'architecture', title: 'Context Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: Why is React Context not a replacement for Redux or Zustand?\nA: Because Context lacks high-performance state selection capabilities. Redux and Zustand utilize internal pub/sub engines that allow components to subscribe to small, specific slices of state, only triggering re-renders when those specific slices change. Context operates on a broadcast model where any value change triggers a full re-render of all consumer nodes, regardless of which slice of context they read.'
    },
    {
      type: 'faq',
      content: 'Q: What is the combined value reference problem in Context and how do you solve it?\nA: In aCombined provider (`value={{ state, dispatch }}`), a new object literal reference is constructed on every single render. Since `useContext` uses `Object.is` check, all consumers detect a new value reference and re-render. We solve this by either (1) splitting state and dispatch into two separate Context Providers, or (2) wrapping the combined object value in `useMemo` backed by state dependencies.'
    },
    {
      type: 'faq',
      content: 'Q: How does the children prop help optimize Context Provider components?\nA: If children are passed dynamically to the Provider via standard layout nesting, their element reference is identical across re-renders. When the Provider state updates and triggers a render, React detects that the `children` element references are unchanged and skips recursing down their render trees, protecting the entire rest of your app layout from redundant updates.'
    }
  ]
};
