import type { NoteContent } from '../../../types';
import compoundComponentsSvg from '../../../../assets/diagrams/frontend/react/compound-components.svg?raw';

export const content: NoteContent = {
  id: 'react-21',
  moduleId: 'react',
  order: 21,
  group: 'Advanced Patterns',
  title: 'Compound Components Pattern',
  description: 'Deep dive into the Compound Component design pattern, detailing implicit state sharing via React Context, sub-component namespace structures, dynamic styling APIs, and comparing modern Context-driven layout flexibility with legacy cloneElement paradigms.',
  sections: [
    {
      type: 'text',
      content: 'In modern component design, balancing **customizability** and **encapsulation** is a primary challenge. Standard monolithic components often suffer from "Prop Explosion" as users demand customizations for rendering layout, styles, behaviors, and accessibility. \n\nThe **Compound Components Pattern** elegantly solves this by dividing a complex, stateful UI unit into cooperative sub-components that share implicit state. Rather than accepting hundreds of configuration props, the parent component exposes a set of child components. The consumer then arranges these sub-components in their markup however they see fit, granting absolute layout freedom while keeping state coordination completely hidden.'
    },
    {
      type: 'diagram',
      content: compoundComponentsSvg
    },
    {
      type: 'callout',
      content: 'Compound components are characterized by three fundamental pillars: (1) **Implicit State Coordination** (sub-components communicate automatically without explicit prop-drilling), (2) **Sub-component Namespacing** (grouping related parts under a single parent namespace like `Tabs.Tab`), and (3) **Layout Decoupling** (the consumer, not the component, controls the final HTML structure).',
      metadata: { type: 'architecture', title: 'The Three Pillars of Compound Design' }
    },
    {
      type: 'heading',
      content: 'Context vs. React.Children (Legacy)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Historically, compound components were built using `React.Children.map` and `React.cloneElement` to inject state props into children at runtime. However, this approach is **highly fragile** because it only works for direct, immediate children of the parent component. If a consumer nests a sub-component inside a structural `div` or a CSS grid wrapper, the cloning fails and state flow breaks. \n\nModern React architecture favors **React Context**. By establishing a context boundary, any sub-component in the DOM tree can implicitly consume the shared state, no matter how deeply nested it is.'
    },
    {
      type: 'heading',
      content: 'Production-Grade Implementation (Tabs Module)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Below is a complete, type-safe implementation of a generic **Tabs** system in React and TypeScript. It includes a safe context-assertion hook, layout flexibility, dynamic class name state functions, and render props to support custom child templates.'
    },
    {
      type: 'code',
      content: `import React, { createContext, useContext, useState, useMemo } from 'react';

// ============================================================================
// 1. Core Types & Context Setup
// ============================================================================
interface TabsContextProps {
  activeId: string;
  setActiveId: (id: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextProps | null>(null);

// Safe Context Consumer Hook
function useTabsContext(componentName: string) {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error(
      \`\${componentName} must be rendered within a <Tabs> parent component.\`
    );
  }
  return context;
}

// ============================================================================
// 2. Parent Container Component
// ============================================================================
interface TabsProps {
  defaultId: string;
  orientation?: 'horizontal' | 'vertical';
  children: React.ReactNode;
  onChange?: (id: string) => void;
}

export function Tabs({ defaultId, orientation = 'horizontal', children, onChange }: TabsProps) {
  const [activeId, setActiveIdState] = useState<string>(defaultId);

  const setActiveId = (id: string) => {
    setActiveIdState(id);
    if (onChange) onChange(id);
  };

  // Performance Optimization: Memoize the context value to prevent wasteful subtree renders
  const contextValue = useMemo<TabsContextProps>(
    () => ({ activeId, setActiveId, orientation }),
    [activeId, orientation]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div 
        className={
          orientation === 'vertical' 
            ? 'flex flex-row gap-6 w-full' 
            : 'flex flex-col gap-4 w-full'
        }
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

// ============================================================================
// 3. Sub-Component: Tabs.List (Tab Track Wrapper)
// ============================================================================
interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

export function TabsList({ children, className = '' }: TabsListProps) {
  const { orientation } = useTabsContext('Tabs.List');
  return (
    <div
      role="tablist"
      aria-orientation={orientation}
      className={\`flex \${
        orientation === 'vertical' ? 'flex-col border-r' : 'flex-row border-b'
      } border-gray-200 gap-2 \${className}\`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 4. Sub-Component: Tabs.Tab (Interactive Switch)
// ============================================================================
interface DynamicStyleProps {
  isActive: boolean;
  orientation?: 'horizontal' | 'vertical';
}

interface TabsTabProps {
  id: string;
  // Support dynamic styling API via standard string or function
  className?: string | ((props: DynamicStyleProps) => string);
  // Support Render Props API
  children: React.ReactNode | ((props: DynamicStyleProps) => React.ReactNode);
}

export function TabsTab({ id, className = '', children }: TabsTabProps) {
  const { activeId, setActiveId, orientation } = useTabsContext('Tabs.Tab');
  const isActive = activeId === id;

  const dynamicProps = { isActive, orientation };

  const computedClassName = typeof className === 'function' 
    ? className(dynamicProps) 
    : \`px-4 py-2 text-sm font-semibold transition-colors duration-150 \${
        isActive 
          ? 'text-blue-600 border-b-2 border-blue-600 font-bold' 
          : 'text-gray-500 hover:text-gray-700'
      } \${className}\`;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveId(id)}
      className={computedClassName}
    >
      {typeof children === 'function' ? children(dynamicProps) : children}
    </button>
  );
}

// ============================================================================
// 5. Sub-Component: Tabs.Panel (Content Container)
// ============================================================================
interface TabsPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabsPanel({ id, children, className = '' }: TabsPanelProps) {
  const { activeId } = useTabsContext('Tabs.Panel');
  const isActive = activeId === id;

  if (!isActive) return null;

  return (
    <div
      role="tabpanel"
      className={\`p-4 rounded-lg bg-gray-50 text-gray-800 transition-opacity duration-300 \${className}\`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// 6. Namespace Registration
// ============================================================================
Tabs.List = TabsList;
Tabs.Tab = TabsTab;
Tabs.Panel = TabsPanel;`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'By attaching sub-components to the parent namespace (e.g., `Tabs.List = TabsList`), we provide a clean, self-documenting API. IDE auto-completion works seamlessly, and components are visually grouped, indicating clear architectural ownership.',
      metadata: { type: 'architecture', title: 'Sub-Component Namespacing' }
    },
    {
      type: 'heading',
      content: 'Layout Composition Freedom',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Because state coordination occurs implicitly through the React Context boundary, the component consumer has full authority over the layout hierarchy. Developers can nest elements inside grids, inject sidebars, or add descriptive custom headers without breaking state synchronization:'
    },
    {
      type: 'code',
      content: `// Consumer Code showcasing total layout composition flexibility
import { Tabs } from './Tabs';

function App() {
  return (
    <Tabs defaultId="metrics" orientation="horizontal">
      {/* 1. Custom Layout Wrap: Flexbox wrapper not present in the original component */}
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-t-xl">
        <h2 className="text-white text-lg font-bold">Analytics Panel</h2>
        
        {/* Sub-component nested safely */}
        <Tabs.List className="border-none gap-4">
          <Tabs.Tab id="metrics">Metrics</Tabs.Tab>
          <Tabs.Tab id="logs">System Logs</Tabs.Tab>
        </Tabs.List>
      </div>

      {/* 2. Content boundary completely decoupled */}
      <div className="mt-4 border border-slate-200 rounded-b-xl p-4">
        <Tabs.Panel id="metrics">
          <h3>Real-time Dashboard Metrics</h3>
        </Tabs.Panel>
        
        <Tabs.Panel id="logs">
          <h3>Raw Server Logs (Standard Output)</h3>
        </Tabs.Panel>
      </div>
    </Tabs>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Always wrap the context value in a \`useMemo\` hook inside the parent container. Failing to do so causes a new object reference to be created on every single render of the parent container, triggering complete, forced re-renders of all child tab components, even when state remains unchanged.',
      metadata: { type: 'runtime', title: 'Context Re-render Prevention' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Pattern Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the main structural advantage of using React Context over React.Children mapping in Compound Components?\nA: React.Children.map is restricted to direct, immediate children of the parent component. Any intermediate wrappers (like simple layout divs, grids, or semantic tags) interrupt the prop passing, breaking the state flow. React Context creates an implicit state boundary, allowing sub-components to be nested at any depth within standard HTML tags while automatically maintaining access to core state.'
    },
    {
      type: 'faq',
      content: 'Q: How do you prevent sub-components from being incorrectly used outside of their parent container?\nA: You implement a "safe context consumer hook" (e.g. `useTabsContext`). Inside the hook, you verify if `useContext(MyContext)` returns `null`. If it does, you throw an explicit runtime exception stating that the sub-component must be rendered within its appropriate parent. This prevents silent failures and helps developers debug incorrect structures instantly.'
    },
    {
      type: 'faq',
      content: 'Q: How can we implement dynamic class names or custom child renders in a Compound Component?\nA: We can support (1) **Dynamic Style Functions** by accepting a function as the `className` prop, which passes active state details (like `isActive`) back to the user, and (2) **Render Props** by checking if the `children` prop is a function, invoking it with the internal states, and rendering the returned React Nodes.'
    },
    {
      type: 'faq',
      content: 'Q: Does using Context in compound components cause performance issues, and how do we solve them?\nA: Yes, it can cause performance issues if the context value reference changes on every parent render, forcing all subscribers to re-render. To solve this, we must wrap the context value object in `useMemo`, ensuring its reference only changes when the dependency state (e.g., `activeId`) actually changes. For highly performance-critical systems, splitting the state and dispatch actions into separate contexts is also a highly effective optimization.'
    }
  ]
};
