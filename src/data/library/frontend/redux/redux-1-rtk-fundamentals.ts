import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/frontend/redux/rtk-architecture.svg?raw';

export const content: NoteContent = {
  id: 'redux-1',
  moduleId: 'redux',
  order: 300,
  group: 'Redux / RTK',
  title: 'Redux Toolkit (RTK) Fundamentals',
  description: 'Understand global state management principles, why Redux Toolkit (RTK) is preferred over legacy Redux, and how to configure a store, build slices, and connect React components.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "In large-scale React applications, passing state down through multiple levels of components (known as **prop drilling**) or sharing state across distant sibling nodes becomes messy and unmaintainable. While React Context offers a solution, it broadcasts changes to all consumer nodes, making it highly inefficient for rapidly changing or massive states.\n\n**Redux** solves this by providing a single, centralized database for your entire application's state (called the **Store**). Components can read from the store using **selectors** and request changes by **dispatching actions** to **reducers** that compute the new state cleanly and predictably."
    },

    {
      type: 'heading',
      content: 'The Three Core Principles of Redux',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Redux operates on three strict architectural rules:\n\n1. **Single Source of Truth**: The global state of your application is stored in an object tree within a single store. This makes debugging, persistence, and server-side rendering trivial.\n2. **State is Read-Only**: The only way to change the state is to emit an **Action** (a plain JavaScript object describing what happened). Components can never modify the global state directly.\n3. **Changes are Made with Pure Functions**: To specify how the state tree is transformed by actions, you write **Reducers**. Reducers are pure functions: they take the previous state and an action, and return a brand-new state object without modifying (mutating) the original state."
    },

    {
      type: 'heading',
      content: 'Why Redux Toolkit (RTK) over Legacy Redux?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Traditional Redux was notorious for its massive boilerplate code (actions, action creators, constants, reducers, and store setup written separately) and the manual configuration of middleware like Redux DevTools or Redux Thunk.\n\n**Redux Toolkit (RTK)** is the official, modern opinionated toolset for Redux development. It simplifies everything:\n- **`createSlice`** — Combines actions and reducers in a single declaration.\n- **Built-in Immer library** — Allows you to write \"mutating\" code (e.g., `state.count++`) which Immer automatically converts into a safe, immutable update under the hood!\n- **Pre-configured Store** — automatically sets up Redux DevTools and middleware."
    },

    {
      type: 'heading',
      content: 'Building Your First Redux Slice',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A **Slice** is a collection of Redux reducer logic and actions for a single feature of your application (like a user profile, shopping cart, or todo list)."
    },
    {
      type: 'code',
      content: `// features/counterSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  value: 0,
  status: 'idle'
};

export const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment: (state) => {
      // Immer lets us write "mutating" syntax safely!
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      // action.payload holds the argument passed when dispatching
      state.value += action.payload;
    }
  }
});

// RTK automatically generates action creators for each reducer function
export const { increment, decrement, incrementByAmount } = counterSlice.actions;

// Export the reducer to be registered in the store
export default counterSlice.reducer;`,
      metadata: { language: 'javascript', title: 'Redux Toolkit: Creating a Slice' }
    },

    {
      type: 'heading',
      content: 'Configuring the Redux Store',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Once you have created your slices, you register their reducers inside a single central store using `configureStore`."
    },
    {
      type: 'code',
      content: `// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './features/counterSlice';

export const store = configureStore({
  reducer: {
    // Registers the counter slice reducer under the 'counter' key in global state
    counter: counterReducer
  }
});`,
      metadata: { language: 'javascript', title: 'Redux Toolkit: Configuring the Global Store' }
    },

    {
      type: 'heading',
      content: 'Connecting Redux to React Components',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To use Redux in your React components, you wrap your application root with the `<Provider>` component from the `react-redux` package, passing it the store. Inside components, you read state using `useSelector` and dispatch actions using `useDispatch`."
    },
    {
      type: 'code',
      content: `// index.js (App Entry Point)
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);`,
      metadata: { language: 'jsx', title: 'React-Redux: Providing the Store to the Application' }
    },
    {
      type: 'code',
      content: `// App.jsx (React Component utilizing Redux)
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, incrementByAmount } from './features/counterSlice';

function Counter() {
  // Read state from global store
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h1>Counter: {count}</h1>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
        <button onClick={() => dispatch(decrement())}>Decrement</button>
        <button onClick={() => dispatch(increment())}>Increment</button>
        <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
      </div>
    </div>
  );
}

export default Counter;`,
      metadata: { language: 'jsx', title: 'React-Redux: useSelector() and useDispatch() Hooks' }
    },

    {
      type: 'callout',
      content: "Never dispatch raw mutative changes or attempt to modify `useSelector` values directly. Redux states are immutable. Modifying state outside of Redux reducers breaks time-travel debugging, prevents components from correctly re-rendering, and leads to unpredictable app crashes.",
      metadata: { type: 'warning', title: 'Critical Redux Pitfall: Mutating State Directly' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is a Slice in Redux Toolkit, and what does it combine?\nA: A Slice is a feature-specific collection of Redux reducer logic and actions. Created using `createSlice`, it combines the declaration of an initial state, a collection of reducer functions, and automatically generates the corresponding action creators and action type strings under the hood, significantly reducing boilerplate code."
    },
    {
      type: 'faq',
      content: "Q: How does Redux Toolkit allow us to write 'mutating' code (like state.value++)?\nA: Under the hood, Redux Toolkit's `createSlice` wraps your reducers inside the **Immer** library. Immer intercepts operations that look like direct state mutations, tracks all changes made to a temporary draft state, and automatically produces a brand-new immutable state object, keeping your code simple while maintaining strict Redux immutability."
    },
    {
      type: 'faq',
      content: "Q: What are useSelector and useDispatch hooks used for in React-Redux?\nA: `useSelector` is a React hook that allows your components to extract (read) specific slices of data from the global Redux store state. It also sets up a subscription, so your component will automatically re-render if that selected state changes. `useDispatch` returns a reference to the Redux store's dispatch function, allowing your components to fire (dispatch) actions to trigger state changes."
    }
  ]
};
