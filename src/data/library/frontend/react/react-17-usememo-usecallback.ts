import type { NoteContent } from '../../../types';
import memoizationHooksSvg from '../../../../assets/diagrams/frontend/react/memoization-hooks.svg?raw';

export const content: NoteContent = {
  id: 'react-17',
  moduleId: 'react',
  order: 17,
  group: 'Core Philosophy',
  title: 'useMemo & useCallback',
  description: 'Deep dive into React memoization primitives. Master value and callback caching, shallow dependency comparison via Object.is, referential stability, and when to optimize vs when to avoid overhead.',
  sections: [
    {
      type: 'text',
      content: 'In React, every re-render causes all variables, functions, and computations inside the component body to be completely **re-allocated** and **re-created**. While JavaScript engines are incredibly fast at allocating memory, React\'s rendering paradigm can trigger unnecessary sub-tree re-renders when references change.\n\nTo manage this behavior, React provides two primary memoization hooks:\n\n- **`useMemo`**: Caches the **computed result** of a factory function. It avoids expensive calculations on subsequent renders unless dependencies change.\n- **`useCallback`**: Caches the **callback function reference** itself. It guarantees referential stability for functions passed down to optimized child components.'
    },
    {
      type: 'diagram',
      content: memoizationHooksSvg
    },
    {
      type: 'heading',
      content: 'Referential Integrity Across Renders',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'React evaluates dependency arrays using **`Object.is`** for shallow equality checks. If you pass an object literal, array, or inline function as a dependency or prop, its reference is unique on every single render pass.\n\nThis has a cascade effect:\n1. **Child Re-renders**: If a child component is wrapped in `React.memo` (which performs a shallow comparison of incoming props), but receives an un-memoized inline callback or object prop, the child will **always** re-render, completely defeating the purpose of `React.memo`.\n2. **Effect Triggering**: If a dependency array inside `useEffect` or another hook contains a non-stable object or function reference, that hook will re-execute on every render pass, which can cause infinite render loops.'
    },
    {
      type: 'callout',
      content: '`useCallback(fn, deps)` is syntactically equivalent to `useMemo(() => fn, deps)`. Under the hood, they both store their memoized values inside the component\'s Fiber node (`FiberNode.memoizedState`) inside a structured hook node.',
      metadata: { type: 'architecture', title: 'Fiber Architecture Memoization' }
    },
    {
      type: 'heading',
      content: 'High-Fidelity Code Example: Filtering and Stable Callbacks',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript example shows a high-performance lists container where `useMemo` is used to execute expensive array filtering, and `useCallback` provides a stable function reference to a memoized child items-row component.'
    },
    {
      type: 'code',
      content: `import React, { useState, useMemo, useCallback } from 'react';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Child component explicitly optimized with React.memo
interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number) => void;
}

const TodoItem = React.memo(function TodoItem({ todo, onToggle }: TodoItemProps) {
  console.log(\`Rendering TodoItem: \${todo.text}\`);
  return (
    <li 
      onClick={() => onToggle(todo.id)}
      style={{
        padding: '8px',
        cursor: 'pointer',
        textDecoration: todo.completed ? 'line-through' : 'none',
        borderBottom: '1px solid #334155'
      }}
    >
      {todo.text}
    </li>
  );
});

export function TodoDashboard() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Master React Fiber Architecture', completed: false },
    { id: 2, text: 'Optimize Referential Integrity', completed: true },
    { id: 3, text: 'Avoid Unnecessary Memoization', completed: false },
  ]);
  const [filterQuery, setFilterQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // 1. useMemo: Cache computationally expensive array transformations.
  // This prevents running filter logic when 'theme' changes.
  const filteredTodos = useMemo(() => {
    console.log('Computing filtered list...');
    return todos.filter(todo => 
      todo.text.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [todos, filterQuery]); // Only recompute if list or query changes

  // 2. useCallback: Keep the toggle callback reference identical across renders.
  // This ensures TodoItem (wrapped in React.memo) does NOT re-render when 'theme' changes.
  const handleToggle = useCallback((id: number) => {
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }, []); // Empty dependencies = function reference is absolutely stable

  return (
    <div style={{ padding: '24px', background: theme === 'dark' ? '#0F172A' : '#F8FAFC', color: theme === 'dark' ? '#F1F5F9' : '#0F172A' }}>
      <h2>Todo Management Portal</h2>
      <button onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}>
        Toggle Theme (Current: {theme})
      </button>
      <br /><br />
      <input
        type="text"
        placeholder="Filter tasks..."
        value={filterQuery}
        onChange={(e) => setFilterQuery(e.target.value)}
        style={{ padding: '8px', width: '300px' }}
      />
      <ul>
        {filteredTodos.map(todo => (
          <TodoItem 
            key={todo.id} 
            todo={todo} 
            onToggle={handleToggle} 
          />
        ))}
      </ul>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Performance Trade-offs & Anti-Patterns',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A very common junior developer mistake is to wrap **every single function and calculation** in `useCallback` or `useMemo`. This is a counter-productive anti-pattern because of the associated runtime and memory overhead.'
    },
    {
      type: 'callout',
      content: 'Every call to `useMemo` or `useCallback` requires allocating an array for dependencies, executing a loop with `Object.is` check on every single render, and dedicating heap memory inside the Fiber node structure to hold reference arrays. For simple operations (like string concatenation or creating small objects), the overhead of tracking the hook exceeds the allocation cost of the raw code.',
      metadata: { type: 'warning', title: 'The Costs of Tracking Hooks' }
    },
    {
      type: 'text',
      content: 'Use the following decision matrix to determine when to memoize:\n\n1. **Use `useMemo` when**:\n   - You are running computationally expensive tasks (e.g. processing large datasets, sorting/filtering hundreds of items, complex regex matches).\n   - You need to guarantee referential stability for objects passed down to custom hook dependency arrays or `useEffect` inputs.\n2. **Use `useCallback` when**:\n   - You pass a callback function to a child component optimized with `React.memo`.\n   - The function is used as a dependency in another hook (e.g., `useEffect`).'
    },
    {
      type: 'callout',
      content: 'If the child component is NOT wrapped in `React.memo`, wrapping a parent callback in `useCallback` is completely useless. The child component will re-render anyway, and you will have paid the performance tax of running the hook for nothing.',
      metadata: { type: 'runtime', title: 'Useless useCallback Overhead' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Memoization Mechanics & Strategy' }
    },
    {
      type: 'faq',
      content: 'Q: What is the semantic difference between useMemo and useCallback?\nA: `useMemo` calls the factory function immediately and caches the returned **value** (whether that is a primitive, array, object, or database query result). `useCallback` does not execute the function; it caches the **function reference itself**. `useCallback(fn, deps)` is simply syntactic sugar for `useMemo(() => fn, deps)`.'
    },
    {
      type: 'faq',
      content: 'Q: How does React perform the comparison in the dependencies array?\nA: React performs a shallow equality check using the `Object.is` algorithm. It loops over the dependencies array indexes and compares the current array elements to the previous array elements. It does NOT do a deep equality check; therefore, objects with the same properties but different references are always treated as changed.'
    },
    {
      type: 'faq',
      content: 'Q: Why is wrapping every single function in useCallback considered bad practice?\nA: It incurs three performance taxes: (1) inline function allocation still occurs on every render to pass into the hook, (2) memory must be allocated on the Fiber hook list to store the closure and dependencies array, and (3) React must perform a shallow comparison array scan on every render. For simple inline events, these costs far exceed raw re-allocation.'
    },
    {
      type: 'faq',
      content: 'Q: Under what conditions does useCallback actually prevent child components from re-rendering?\nA: For `useCallback` to successfully optimize child re-renders, three conditions must all be met simultaneously: (1) The child component must receive the callback as a prop, (2) The child component must be optimized with `React.memo` (or extend `React.PureComponent` / implement `shouldComponentUpdate`), and (3) The callback\'s dependency array must remain stable so the reference doesn\'t change.'
    }
  ]
};
