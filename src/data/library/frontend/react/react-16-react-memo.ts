import type { NoteContent } from '../../../types';
import memoSvg from '../../../../assets/diagrams/frontend/react/memo.svg?raw';

export const content: NoteContent = {
  id: 'react-16',
  moduleId: 'react',
  order: 16,
  group: 'Performance Optimization',
  title: 'React.memo & Memoization Overhead',
  description: 'Deep dive into React.memo, props shallow equality comparison mechanics, custom comparator strategies, and the performance cost of over-memoization.',
  sections: [
    {
      type: 'text',
      content: 'In React\'s standard execution model, when a parent component re-renders, all of its nested child components automatically re-render as well—regardless of whether their incoming props have changed. \n\n**`React.memo`** is a high-order component (HOC) introduced in React 16.6 designed to optimize performance by caching the rendered output of a functional component. If the incoming props are structurally "identical" (using shallow reference checks), React skips invoking the component function and directly reuses the last rendered Virtual DOM tree, bypassing both the Render and Commit phases.'
    },
    {
      type: 'diagram',
      content: memoSvg
    },
    {
      type: 'callout',
      content: 'React.memo operates strictly on the Virtual DOM level. If a component uses internal state (`useState`, `useReducer`) or subscribes to a React Context (`useContext`), it will still force a re-render when those internal sources change, regardless of the props memoization state.',
      metadata: { type: 'runtime', title: 'State and Context Exception' }
    },
    {
      type: 'heading',
      content: 'The Mechanics of Shallow Comparison',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'By default, React.memo performs a **shallow comparison** of the previous props and new props objects. Under the hood, this comparison resolves to checking if keys of both props objects match, and comparing their corresponding values using standard **`Object.is`** equality:\n\n1. **Primitive Props** (e.g., `string`, `number`, `boolean`): Checked by value. If `prevProps.userId === nextProps.userId` evaluates to `true`, they are considered identical.\n2. **Reference Props** (e.g., `object`, `array`, `function`): Checked by reference. If the parent passes a freshly constructed object literal (`{}`) or inline arrow function, the reference changes on every single render, rendering the memoization optimization entirely useless.'
    },
    {
      type: 'heading',
      content: 'Custom Props Equality Comparison',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'React.memo accepts an optional second argument: a custom comparison function `arePropsEqual(prevProps, nextProps)`. This allows developers to bypass reference inequality checks or perform deep comparisons on selected prop fields.'
    },
    {
      type: 'callout',
      content: 'Unlike class-based components\' `shouldComponentUpdate(nextProps, nextState)` which returns **`true` to force a render**, React.memo\'s `arePropsEqual` comparator returns **`true` to skip the render** (indicating props are equal) and **`false` to force a render**.',
      metadata: { type: 'architecture', title: 'Inverted Comparator Logic' }
    },
    {
      type: 'code',
      content: `import React from 'react';

interface UserCardProps {
  user: {
    id: string;
    username: string;
    details: {
      role: string;
      lastActive: string;
    };
  };
  onSelect: (id: string) => void;
}

const UserCardComponent: React.FC<UserCardProps> = ({ user, onSelect }) => {
  return (
    <div onClick={() => onSelect(user.id)} className="p-4 border rounded shadow">
      <h3>{user.username}</h3>
      <p>Role: {user.details.role}</p>
    </div>
  );
};

// Custom equality comparator: prevents re-renders on nested object reference changes
function arePropsEqual(prevProps: UserCardProps, nextProps: UserCardProps): boolean {
  // 1. Compare primitive/scalar values directly
  if (prevProps.user.id !== nextProps.user.id) return false;
  if (prevProps.user.username !== nextProps.user.username) return false;
  
  // 2. Safely compare nested deep structures manually
  if (prevProps.user.details.role !== nextProps.user.details.role) return false;
  
  // 3. Skip function reference checks if semantics are identical
  // (Warning: only do this if you know onSelect is invariant across changes!)
  return true; 
}

// Wrap the component using the custom comparator
export const UserCard = React.memo(UserCardComponent, arePropsEqual);`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'The Performance Cost of Unnecessary Memoization',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Many developers fall into the anti-pattern of wrapping *every single component* in `React.memo`. This is highly counterproductive. Memoization is **not free**; it introduces substantial performance, memory, and cognitive overhead:\n\n* **The Comparison Overhead**: For simple, lightweight components (e.g., a button, label, or simple wrapper), the computational cost of allocating an object, extracting keys, and executing `Object.is` loops on every prop can easily be **greater** than the raw cost of React generating the new Virtual DOM node and checking it during diffing.\n* **Memory Accumulation**: React must retain reference copies of `prevProps` and the previously rendered virtual node tree in memory for every memoized component instance on the heap.\n* **Defeated Optimizations**: If a component is memoized, but at least one prop reference changes on every render (due to inline handlers or arrays), the component still re-renders. You pay the penalty of the shallow comparison **AND** the full re-render, compounding performance degradation.'
    },
    {
      type: 'code',
      content: `// CRITICAL ANTI-PATTERN: Paying double execution overhead
// 1. Child component is memoized:
const MemoizedItem = React.memo(({ onClick, items }: { onClick: () => void, items: string[] }) => {
  return <div onClick={onClick}>Count: {items.length}</div>;
});

// 2. Parent constantly defeats the memoization by passing fresh references:
export const ParentContainer = () => {
  return (
    <MemoizedItem
      onClick={() => console.log('Clicked!')} // Inline arrow function reference changes EVERY render!
      items={['a', 'b']}                     // Array literal reference changes EVERY render!
    />
  );
};
// Result: React runs the shallow comparison, detects reference mismatch, 
// rejects the cache, and performs a full render. You pay BOTH costs.`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Only memoize when: (1) The component renders frequently with identical props, (2) The component is medium-to-large with costly rendering operations, and (3) You have verified that its props remain reference-stable through patterns like `useCallback` and `useMemo`.',
      metadata: { type: 'warning', title: 'Rules of Strategic Memoization' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: 'Q: How does React.memo differ from React\'s PureComponent or shouldComponentUpdate?\nA: React.memo is a High-Order Component designed for functional components, whereas PureComponent is a class component base class that implements a shallow comparison of both `props` and `state`. Unlike PureComponent, React.memo ONLY compares props by default (state changes trigger renders independently). Furthermore, React.memo\'s comparator returns the inverse boolean of `shouldComponentUpdate` (return `true` to skip rendering, rather than to trigger it).'
    },
    {
      type: 'faq',
      content: 'Q: Why does passing inline object literals or inline functions defeat React.memo, and how do we solve this?\nA: In JavaScript, `{}` and `() => {}` create completely new memory address allocations (references) every time they are evaluated. Since React.memo uses shallow reference checks (`Object.is`), the parent component\'s render forces fresh references, causing the comparison to return `false` (cache miss). To solve this, wrap callbacks in `useCallback()`, cache objects/arrays in `useMemo()`, or extract static objects completely outside the component scope.'
    },
    {
      type: 'faq',
      content: 'Q: In what scenarios does React.memo actually hurt application performance?\nA: It hurts performance in two major scenarios: (1) Highly dynamic components whose props change on nearly every render (e.g., text inputs, mouse tracking nodes). React spends CPU cycles performing comparisons that constantly fail, then executes the render anyway. (2) Trivial, small components (like `<Icon />` or `<Button />`). React\'s raw rendering time is so fast that the overhead of shallow props comparison and object allocation is actually slower than rendering from scratch.'
    },
    {
      type: 'faq',
      content: 'Q: How does React.memo handle children props (e.g., props.children)?\nA: By default, `props.children` is represented as React Elements, which are fresh object structures created by `React.createElement` on every render. Because of this, passing `children` usually causes React.memo to fail its shallow comparison check and re-render. To preserve memoization, either wrap children elements in `useMemo`, avoid passing arbitrary JSX as children, or write a custom `arePropsEqual` comparator that skips children check.'
    }
  ]
};
