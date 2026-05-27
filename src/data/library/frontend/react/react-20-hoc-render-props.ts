import type { NoteContent } from '../../../types';
import patternsSvg from '../../../../assets/diagrams/frontend/react/patterns.svg?raw';

export const content: NoteContent = {
  id: 'react-20',
  moduleId: 'react',
  order: 20,
  group: 'Advanced Patterns',
  title: 'Higher-Order Components & Render Props',
  description: 'Deep dive into advanced component composition patterns: Higher-Order Components (HOCs) and Render Props, covering prop collision risks, TypeScript typing configurations, wrapper hell, and dynamic child layouts.',
  sections: [
    {
      type: 'text',
      content: 'In complex React architectures, sharing stateful logic and cross-cutting behaviors across unrelated components is a primary engineering requirement. Before React Hooks introduced functional logic sharing, **Higher-Order Components (HOCs)** and **Render Props** were the industry standard composition patterns.\n\nEven in modern applications utilizing custom hooks, both patterns remain highly relevant when designing UI layout wrappers, context gateways, feature-flag routers, and abstract UI components that need to control rendering structures.'
    },
    {
      type: 'diagram',
      content: patternsSvg
    },
    {
      type: 'callout',
      content: 'Choosing the right composition strategy fundamentally affects your component hierarchy, type-safety guarantees, and runtime overhead. While Hooks encapsulate **pure stateful behavior**, HOCs and Render Props specialize in **structural wrapping** and **dynamic visual orchestration**.',
      metadata: { type: 'architecture', title: 'Composition Architecture Selection' }
    },
    {
      type: 'heading',
      content: '1. Higher-Order Components (HOCs)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A Higher-Order Component is a software design pattern where a function takes a component as an argument and returns a new, enhanced component. This is similar to decorator patterns in Object-Oriented Programming.\n\nHOCs are evaluated **statically during module loading**, augmenting components with injected props (e.g., authentication states, theme objects, or feature toggles).'
    },
    {
      type: 'code',
      content: `import React from 'react';

// The props injected by the HOC
export interface WithAuthProps {
  isAuthenticated: boolean;
  currentUser: { name: string; role: string } | null;
}

// Higher-Order Component utilizing TypeScript Generics and Omit
export function withAuth<T extends WithAuthProps>(
  WrappedComponent: React.ComponentType<T>
) {
  // Expose a component where the caller does NOT need to supply the injected props
  type ExternalProps = Omit<T, keyof WithAuthProps>;

  const WithAuthComponent: React.FC<ExternalProps> = (props) => {
    // Simulated runtime authentication state retrieval
    const isAuthenticated = true;
    const currentUser = { name: 'Alice Smith', role: 'Staff Engineer' };

    return (
      <WrappedComponent
        {...(props as T)}
        isAuthenticated={isAuthenticated}
        currentUser={currentUser}
      />
    );
  };

  // Configure high-quality React DevTools display names
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuthComponent.displayName = \`withAuth(\${displayName})\`;

  return WithAuthComponent;
}

// ==================== USAGE ====================
interface ProfileProps extends WithAuthProps {
  themeColor: string;
}

const Profile: React.FC<ProfileProps> = ({ themeColor, currentUser, isAuthenticated }) => {
  if (!isAuthenticated) return <div>Access Denied</div>;
  return (
    <div style={{ color: themeColor }}>
      Welcome, {currentUser?.name} ({currentUser?.role})
    </div>
  );
};

// Consumers only need to pass "themeColor". "currentUser" & "isAuthenticated" are automatically injected.
export const AuthenticatedProfile = withAuth(Profile);`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'The Critical Pitfalls of HOCs',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'Despite their power, HOCs introduce several significant structural issues:\n\n*   **Prop Collisions (Namespace Pollution):** If you apply multiple HOCs (e.g., `withAuth(withLogging(withTheme(MyComponent)))`), there is a risk that two wrappers attempt to inject a prop with the same name (such as `isLoading` or `data`). The outermost HOC will silently overwrite the inner ones, causing obscure runtime bugs.\n*   **Wrapper Hell:** Looking at React DevTools, you will see a massive, deeply nested tree of anonymous wrappers (`withAuth(withLogging(withTheme(MyComponent)))`). This bloats memory and increases initial component mounting overhead.\n*   **Opaque Data Flow:** It is difficult to identify where a prop originates just by reading the base component\'s render block, making local code comprehension harder.'
    },
    {
      type: 'callout',
      content: 'TypeScript typing for nested HOCs is notoriously difficult to maintain. Because props are combined and mutated statically, type errors in HOC chains are frequently cryptic and require extensive `as any` casting or nested generic exclusions.',
      metadata: { type: 'warning', title: 'HOC Typing Alert' }
    },
    {
      type: 'heading',
      content: '2. Render Props (Dynamic Child Layouts)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A Render Prop is a pattern where a component receives a function that returns a React element, and calls this function to perform its rendering. The "render prop" is commonly passed via the `children` prop, known as **Function-as-a-Child (FaaS)**.\n\nThis pattern resolves all three of the HOC pitfalls:\n1.  **Zero Prop Collisions:** Since props are passed as explicit arguments to a callback function, they can be easily renamed via destructuring.\n2.  **No Wrapper Hell:** Eliminates nested component classes. The structure is dynamically executed at runtime inside the render block.\n3.  **Perfect Type Safety:** TypeScript effortlessly infers types from arguments passed directly into the callback function.'
    },
    {
      type: 'code',
      content: `import React, { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface MouseTrackerProps {
  // Children is a function returning a React element
  children: (position: MousePosition) => React.ReactNode;
}

export const MouseTracker: React.FC<MouseTrackerProps> = ({ children }) => {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return <>{children(position)}</>;
};

// ==================== USAGE ====================
export const CoordinateDashboard: React.FC = () => {
  return (
    <div>
      <h1>Hover Anywhere to Track Coordinates</h1>
      
      {/* Explicit runtime parameter mapping avoids collisions entirely */}
      <MouseTracker>
        {({ x, y }) => (
          <div className="coordinates-panel">
            <p>X Coordinate: <strong>{x}px</strong></p>
            <p>Y Coordinate: <strong>{y}px</strong></p>
          </div>
        )}
      </MouseTracker>
    </div>
  );
};`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Render Props do not cause intermediate React mounting changes because they execute directly inside the host render cycle. This makes them highly optimized for localized dynamic animations and window-dimension calculations.',
      metadata: { type: 'runtime', title: 'Runtime Engine Optimization' }
    },
    {
      type: 'heading',
      content: 'Comparing the Paradigms',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Use this architectural decision tree to determine which pattern to employ when structuring advanced React codebases:'
    },
    {
      type: 'text',
      content: '| Criteria | Higher-Order Components (HOCs) | Render Props / FaaS | Custom React Hooks |\n| :--- | :--- | :--- | :--- |\n| **Best Used For** | Layout Injection, Static Route Protection, Hiding Complex API integrations. | Dynamic layout orchestration, container-presenter coordination. | Pure stateful logic, side effects, state encapsulation. |\n| **DOM Hierarchy** | Adds wrapping components (Wrapper Hell risk). | Flat (directly invokes the child function). | Completely flat (no DOM footprint). |\n| **Prop Collisions** | High Risk. Silent overrides when multiple HOCs are chained. | None. Custom parameters can be mapped dynamically. | None. Variables are uniquely declared in local scope. |\n| **Type Safety** | Complex, fragile generic composition (`Omit`, `Pick`). | Simple, robust generic type parameter propagation. | Trivial, native TypeScript variables. |'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Architectural Design Patterns Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is "Prop Collision" in HOCs and how does it happen?\nA: Prop Collision is a quiet runtime failure mode where two or more chained Higher-Order Components inject a prop with the same name. Because HOC composition is compiled as nested function evaluations (e.g. `withAuth(withLogging(Comp))`), the outer component overrides any prop keys it shares with inner components without warning. This results in missing data, silent crashes, or incorrect states, and is highly difficult for standard compilers to identify.'
    },
    {
      type: 'faq',
      content: 'Q: Why did the industry migrate heavily to React Hooks, and what structural gaps do HOCs and Render Props still fill?\nA: The industry shifted to React Hooks because hooks share stateful logic without adding nesting to the component tree, resolving wrapper hell and simplifying type safety. However, hooks **cannot define UI layout templates or control the component tree rendering direct paths**. HOCs and Render Props are still critical for: (1) structural visual composition (e.g., `<VirtualList renderItem={(item) => <Card data={item} />} />`), (2) conditional routing wrapper systems, and (3) performance optimizations requiring lazy evaluation of large visual node subtrees.'
    },
    {
      type: 'faq',
      content: 'Q: How do you ensure correct generic typings for an HOC in TypeScript?\nA: You achieve strict type safety by making the HOC a generic function: `function withLogic<T extends InjectedProps>(Comp: React.ComponentType<T>)`. Within the HOC, you declare a new type `ExternalProps = Omit<T, keyof InjectedProps>`, which requires callers to only supply the un-injected properties. Lastly, you cast the incoming props back to `T` when passing them down: `<Comp {...(props as T)} />`.'
    },
    {
      type: 'faq',
      content: 'Q: Can Render Props lead to performance issues? How can they be optimized?\nA: Yes, because Render Props define inline functions in the render block (e.g., `{position => <Display {...position} />}`), React must instantiate a new function reference on every parent render. This can break downstream child components wrapped in `React.memo` since their prop references always change. To optimize this, the render-prop callback can be extracted to an instance method or wrapped inside `useCallback` if it depends on dynamic dependencies, preserving identical references between cycles.'
    }
  ]
};
