import type { NoteContent } from '../../../types';
import typescriptWithReactSvg from '../../../../assets/diagrams/frontend/typescript/typescript-with-react.svg?raw';

export const content: NoteContent = {
  id: 'ts-19',
  moduleId: 'ts',
  order: 94,
  group: 'Type System Core',
  title: 'TypeScript with React',
  description: 'Comprehensive guide to typing React applications. Master props interfaces, component definitions (React.FC vs standard functions), Event handler generic typing, and strict Ref/State hook parameters.',
  sections: [
    {
      type: 'diagram',
      content: typescriptWithReactSvg
    },
    {
      type: 'text',
      content: 'Integrating **TypeScript with React** is one of the most powerful ways to enforce frontend safety. By applying static type checks across components, props, hooks, and browser events, you catch layout and logic errors during writing, rather than discovering runtime errors in production.\n\nWhile React provides type definitions out of the box (via `@types/react`), using them correctly requires understanding how generics bridge standard HTML DOM elements with React\'s synthetic wrapper layers.'
    },
    {
      type: 'callout',
      content: 'When using `useRef` to reference DOM elements, always initialize it with `null` (e.g., `useRef<HTMLInputElement>(null)`). Failing to pass `null` causes the hook to return a mutable ref container instead of a read-only DOM ref, triggering compilation typing errors when assigned to a JSX `ref` attribute.',
      metadata: { type: 'warning', title: 'Ref Initialization Requirement' }
    },
    {
      type: 'heading',
      content: '1. Typing Component Props',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'While `React.FC` (or `React.FunctionComponent`) was historically the standard way to type React functional components, modern React recommends typing components as standard JavaScript functions with destructuring. This avoids the implicit addition of `children` (removed in React 18) and provides clean, standard generic parameter options.'
    },
    {
      type: 'code',
      content: `import React from 'react';

// Define explicit Props contract
interface ButtonProps {
  label: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}

// Recommend standard typed function signature
export function Button({ label, onClick, disabled = false, size = "md" }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={\`btn-\${size}\`}>
      {label}
    </button>
  );
}`,
      metadata: { language: 'typescript', title: 'Standard Component Typing' }
    },
    {
      type: 'heading',
      content: '2. Typing Hooks (useState & useRef)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'For basic primitives, TypeScript infers hook state types automatically (e.g., `const [val, setVal] = useState(false)` is correctly typed as boolean). However, for complex objects or states initialized as null, you must pass type parameters explicitly using generics:'
    },
    {
      type: 'code',
      content: `interface User {
  id: string;
  displayName: string;
}

// 1. Explicit useState Generic
const [user, setUser] = useState<User | null>(null);

// 2. Explicit DOM Ref Generic bound to browser elements
const inputRef = useRef<HTMLInputElement>(null);

const focusInput = () => {
  // Use optional chaining since inputRef.current might be null initially
  inputRef.current?.focus();
};`,
      metadata: { language: 'typescript', title: 'State and Ref Generic Bounds' }
    },
    {
      type: 'heading',
      content: '3. Typing Form & Input Events',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'React uses a custom `SyntheticEvent` wrapper layer to achieve cross-browser event compatibility. To type event handlers correctly, use the generic event models provided by React, passing the targeting DOM element type inside the brackets:'
    },
    {
      type: 'code',
      content: `const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  console.log(event.target.value); // Strictly typed as string
};

const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault(); // Prevents page reload
};`,
      metadata: { language: 'typescript', title: 'Generic Synthetic Event Handlers' }
    },
    {
      type: 'callout',
      content: 'When typing custom UI components that wrap standard elements, extend native HTML element attributes using `React.ComponentPropsWithoutRef<"button">` to ensure all standard button attributes (disabled, type, etc.) are implicitly supported without manual prop definitions.',
      metadata: { type: 'architecture', title: 'Native Attribute Extension' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'React TS Interview prep' }
    },
    {
      type: 'faq',
      content: 'Q: What is the primary difference between React.ComponentPropsWithoutRef and React.ComponentPropsWithRef?\nA: `React.ComponentPropsWithRef` extracts all props of a native tag (e.g. "input") *including* its JSX `ref` attribute (properly typed as `React.Ref<HTMLInputElement>`). `ComponentPropsWithoutRef` strips out the `ref` key. When building dynamic wrapper components that do not explicitly forward refs via `React.forwardRef`, always use `ComponentPropsWithoutRef` to prevent compilation errors regarding ref forwarding mismatches.'
    },
    {
      type: 'faq',
      content: 'Q: Why should you avoid using React.FC in modern React 18+ codebases?\nA: Prior to React 18, `React.FC` implicitly included `children?: React.ReactNode` in its props contract, meaning a component could compile successfully even if it accepted children it never rendered. React 18 removed this implicit typing. Additionally, standard function signatures are easier to write, support default parameters flawlessly, and do not present complications when using generic components (e.g., `<ListProps<T>>`).'
    },
    {
      type: 'faq',
      content: 'Q: How do you type a custom event handler passed to a child component that needs to update state in the parent?\nA: You should define a callback function type in the child\'s prop interface. For instance, if the child returns a selected string identifier, define it as: `interface Props { onSelect: (id: string) => void; }`. In the parent, you assign a state setter or custom handler matching this signature, which ensures perfect compile-time safety across component boundaries.'
    }
  ]
};
