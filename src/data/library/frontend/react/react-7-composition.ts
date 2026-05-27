import type { NoteContent } from '../../../types';
import compositionSvg from '../../../../assets/diagrams/frontend/react/composition.svg?raw';

export const content: NoteContent = {
  id: 'react-7',
  moduleId: 'react',
  order: 7,
  group: 'Core Philosophy',
  title: 'Component Composition',
  description: 'Deep dive into props architecture, the software design implications of Prop Drilling, and leveraging Component Composition patterns to decouple layout from state.',
  sections: [
    {
      type: 'text',
      content: 'In React, data flows in a single direction: downward from parent to child via **Props**. However, as component hierarchies deepen, passing data down multiple levels frequently results in **Prop Drilling**. \n\nProp drilling occurs when intermediate components must receive and pass along props solely to deliver them to a deeply nested child, despite never reading the props themselves. This increases cognitive load, couples unrelated layout blocks, and triggers redundant re-renders.'
    },
    {
      type: 'diagram',
      content: compositionSvg
    },
    {
      type: 'callout',
      content: '**Component Composition** is a fundamental software design pattern in React. Instead of nesting complete child configurations inside lower-level structures, you design components as containers that receive visual slots (like `children` or custom slot props), allowing the parent to control layout and inject state directly.',
      metadata: { type: 'architecture', title: 'The Composition Solution' }
    },
    {
      type: 'heading',
      content: 'The Prop Drilling Anti-Pattern',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Let\'s look at an example. In a drilled setup, the `AppLayout` and `NavigationSidebar` are tightly coupled to the `user` state, even though their only responsibility is structural layout.'
    },
    {
      type: 'code',
      content: `// Drilled Setup: Intermediate components must convey props they do not use
interface User { name: string; avatar: string }

function App({ user }: { user: User }) {
  return <AppLayout user={user} />;
}

function AppLayout({ user }: { user: User }) {
  return (
    <div className="layout">
      <NavigationSidebar user={user} />
      <MainContent />
    </div>
  );
}

function NavigationSidebar({ user }: { user: User }) {
  return (
    <aside className="sidebar">
      <UserProfileCard user={user} />
    </aside>
  );
}

function UserProfileCard({ user }: { user: User }) {
  return <div>Welcome, {user.name}</div>;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'The Composition Solution (Slots & Children)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'By leveraging the `children` prop, we completely pull the `user` dependency out of both `AppLayout` and `NavigationSidebar`. They are now pure structural elements.'
    },
    {
      type: 'code',
      content: `// Composed Setup: Layout components act as pure slot containers
import React from 'react';

function App({ user }: { user: User }) {
  return (
    <AppLayout>
      <NavigationSidebar>
        <UserProfileCard user={user} />
      </NavigationSidebar>
    </AppLayout>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      {children}
      <MainContent />
    </div>
  );
}

function NavigationSidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside className="sidebar">
      {children}
    </aside>
  );
}

function UserProfileCard({ user }: { user: User }) {
  return <div>Welcome, {user.name}</div>;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'While composition is excellent for decoupling components, overusing it to solve deep prop drilling across your entire application can make the top-level `App` file massive and difficult to read. For global state (e.g. themes, authentication, locale), React\'s **Context API** is the more maintainable solution.',
      metadata: { type: 'warning', title: 'Composition vs. Context Boundary' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Composition Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is Prop Drilling and why is it considered a codebase smell?\nA: Prop Drilling is passing props down through multiple layers of nested components to reach a deep child. It is a code smell because: (1) it makes refactoring difficult (changing a prop name requires updating every intermediate file), (2) it couples layout components to state schemas they don\'t need, and (3) it triggers wasteful intermediate renders when props change.'
    },
    {
      type: 'faq',
      content: 'Q: How does using the children prop improve performance in React?\nA: React optimizes children elements. In a composition structure, if the parent state changes, React will invoke the render of the parent. However, because the child element was created at the top level and passed down as a reference, React detects that its reference is identical and skips re-rendering the intermediate composed container components.'
    },
    {
      type: 'faq',
      content: 'Q: How do you choose between Component Composition and the Context API?\nA: Choose Component Composition first for local decoupling, UI slots, and layout structures (e.g., sidebars, tabs, modals). It keeps your components highly reusable and independent. Choose the Context API for true global state that is needed by many unrelated components scattered throughout the tree (e.g. auth status, active theme, language preferences).'
    }
  ]
};
