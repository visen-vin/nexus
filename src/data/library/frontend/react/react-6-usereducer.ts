import type { NoteContent } from '../../../types';
import usereducerSvg from '../../../../assets/diagrams/frontend/react/usereducer.svg?raw';

export const content: NoteContent = {
  id: 'react-6',
  moduleId: 'react',
  order: 6,
  group: 'Core Philosophy',
  title: 'useReducer & Complex State',
  description: 'Deep dive into managing complex multi-dimensional state transitions, implementing Finite State Machines (FSMs), and optimizing dispatch boundaries.',
  sections: [
    {
      type: 'text',
      content: 'As applications grow, state management inside components can become complicated. When multiple state values depend on one another, using several `useState` hooks frequently leads to out-of-sync updates. \n\n**`useReducer`** acts as an alternative to `useState` that models state transitions explicitly. It decouples the *what happened* (actions) from *how the state updates* (reducer logic), allowing you to construct robust state management architectures.'
    },
    {
      type: 'diagram',
      content: usereducerSvg
    },
    {
      type: 'callout',
      content: 'A **Finite State Machine (FSM)** is a mathematical model of computation. It can be in exactly one of a finite number of states at any given time. Modeling state transitions explicitly via a reducer makes "impossible states" (e.g. `loading: true` and `success: true` concurrently) architecturally impossible.',
      metadata: { type: 'architecture', title: 'Finite State Machine Modeling' }
    },
    {
      type: 'heading',
      content: 'Designing an FSM Reducer (TypeScript)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Let\'s build a robust, type-safe Finite State Machine for an API request module using strict TypeScript union types.'
    },
    {
      type: 'code',
      content: `// Define explicit state structures to avoid "impossible states"
type State<T> = 
  | { status: 'idle'; data: null; error: null }
  | { status: 'loading'; data: null; error: null }
  | { status: 'success'; data: T; error: null }
  | { status: 'error'; data: null; error: Error };

// Explicit action union types
type Action<T> = 
  | { type: 'FETCH' }
  | { type: 'FETCH_SUCCESS'; payload: T }
  | { type: 'FETCH_ERROR'; error: Error }
  | { type: 'RESET' };

// Reducer enforcing strict, valid FSM transitions
function fsmReducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (state.status) {
    case 'idle':
      if (action.type === 'FETCH') return { status: 'loading', data: null, error: null };
      return state;
    case 'loading':
      if (action.type === 'FETCH_SUCCESS') return { status: 'success', data: action.payload, error: null };
      if (action.type === 'FETCH_ERROR') return { status: 'error', data: null, error: action.error };
      return state;
    case 'success':
      if (action.type === 'RESET') return { status: 'idle', data: null, error: null };
      return state;
    case 'error':
      if (action.type === 'FETCH') return { status: 'loading', data: null, error: null };
      if (action.type === 'RESET') return { status: 'idle', data: null, error: null };
      return state;
    default:
      return state;
  }
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Reducers **MUST BE PURE FUNCTIONS**. Reducers execute during React\'s Render Phase. Doing side effects (like running network fetches, scheduling timeouts, or mutating external stores) inside a reducer violates the pure render contract and leads to severe performance bugs.',
      metadata: { type: 'warning', title: 'Reducer Purity Contract' }
    },
    {
      type: 'heading',
      content: 'Performance Benefit: Stable Dispatch Identity',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A major architectural benefit of `useReducer` is the stability of the **`dispatch`** function reference. React guarantees that the identity of `dispatch` is **completely stable and never changes** between renders. \n\nInstead of passing down multiple individual callback functions that recreate closures on every render (and thus trigger unnecessary component re-renders down the tree), you can pass down `dispatch` safely without needing to wrap it in `useCallback`.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Reducer Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: When should you choose useReducer over useState?\nA: Choose `useReducer` when: (1) state logic is complex and involves multiple co-dependent values, (2) the next state depends heavily on the previous state structure, (3) you want to enforce strict Finite State Machine (FSM) rules, or (4) you need to optimize deep component tree updates by passing down a stable `dispatch` function rather than dynamic callbacks.'
    },
    {
      type: 'faq',
      content: 'Q: What are "Impossible States" and how does useReducer prevent them?\nA: "Impossible States" occur when discrete, mutually exclusive flags are enabled concurrently (e.g. `isLoading: true` and `isSuccess: true` both active). With individual `useState` hooks, setting these independently can lead to visual bugs if updates are missed. `useReducer` prevents this by forcing state to be modeled as a single, unified union object type that only transitions through explicit actions.'
    },
    {
      type: 'faq',
      content: 'Q: Why is the dispatch function reference guaranteed to be stable by React?\nA: Because the `dispatch` function does not capture local closure scope directly inside the rendering cycle. Instead, React handles action dispatching via an internal global reconciler queue, routing actions dynamically to the reducer. This stable identity prevents child components that receive `dispatch` as props from performing redundant re-renders.'
    }
  ]
};
