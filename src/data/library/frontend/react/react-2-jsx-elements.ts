import type { NoteContent } from '../../../types';
import jsxElementsSvg from '../../../../assets/diagrams/frontend/react/jsx-elements.svg?raw';

export const content: NoteContent = {
  id: 'react-2',
  moduleId: 'react',
  order: 2,
  group: 'Core Philosophy',
  title: 'JSX & Elements Under the Hood',
  description: 'Deep dive into JSX compilation mechanics, SWC/Babel transformation pipelines, and the technical distinction between React Elements, Components, and Real DOM Nodes.',
  sections: [
    {
      type: 'text',
      content: 'JSX is not valid ECMAScript—it cannot be executed directly by browsers or JavaScript engines. Instead, JSX serves as a declarative, HTML-like **syntactic sugar** representing nested JavaScript function invocations. During build time, a compiler (such as SWC or Babel) parses the JSX syntax tree and transpiles it into runtime code.'
    },
    {
      type: 'diagram',
      content: jsxElementsSvg
    },
    {
      type: 'callout',
      content: 'In modern React 17+, the build tool automatically injects a special helper function `_jsx` from the `react/jsx-runtime` package, eliminating the requirement to write `import React from "react"` at the top of every file containing JSX markup.',
      metadata: { type: 'architecture', title: 'The Modern JSX Runtime' }
    },
    {
      type: 'heading',
      content: 'The Compilation Pipeline (Babel vs. SWC)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Let\'s analyze the compiler transformation. When compilers transpile a component, static JSX nodes are turned into JavaScript expressions.'
    },
    {
      type: 'heading',
      content: 'Source JSX Code',
      metadata: { level: 3 }
    },
    {
      type: 'code',
      content: `import React from 'react';

function Header() {
  return (
    <header className="main-header">
      <h1>Nexus</h1>
    </header>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Compiled Output (Classic Runtime)',
      metadata: { level: 3 }
    },
    {
      type: 'code',
      content: `// Transpiled code representing classic React runtime compilation
function Header() {
  return React.createElement(
    "header",
    { className: "main-header" },
    React.createElement("h1", null, "Nexus")
  );
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Compiled Output (Modern Runtime)',
      metadata: { level: 3 }
    },
    {
      type: 'code',
      content: `// Transpiled code using the modern JSX compiler runtime injection
import { jsx as _jsx } from "react/jsx-runtime";

function Header() {
  return _jsx("header", {
    className: "main-header",
    children: _jsx("h1", { children: "Nexus" })
  });
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Elements vs. Components vs. DOM Nodes',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To master React\'s internals, you must distinguish between these three critical core concepts:\n\n1. **React Element**: A lightweight, plain JavaScript object describing what should appear on the screen. It is completely **immutable**. Recreating these objects is extremely cheap.\n2. **Component**: A template, blueprint, or stateful factory function that accepts inputs (`props`) and outputs a tree of React Elements.\n3. **DOM Node**: The actual physical rendering element instantiated in the browser context (e.g. `HTMLDivElement`). Mutating these directly is very expensive.'
    },
    {
      type: 'callout',
      content: 'React Elements contain a special runtime security token: `$$typeof: Symbol.for("react.element")`. This prevents **XSS (Cross-Site Scripting)** attacks where a user injects arbitrary JSON data claiming to be a React Element, because JSON strings cannot represent native JavaScript symbols.',
      metadata: { type: 'warning', title: 'Security: $$typeof Protection' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Elements Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the purpose of Symbol.for("react.element") inside a React element object?\nA: It is a critical security feature. If your server is vulnerable to database text injection, a malicious user could attempt to return a JSON object resembling a React element (e.g. a script injector). Since JSON cannot transfer Symbols, React identifies that the element is not genuine and refuses to render it, protecting the app from Cross-Site Scripting (XSS).'
    },
    {
      type: 'faq',
      content: 'Q: What is the performance difference between a React Element and a Component?\nA: A React Element is just a plain, flat static configuration object describing the virtual node. A Component is a functional entity. In v16+, React reconciler evaluates components (invoking hooks, setting up lifecycles) only when required, but creates elements frequently as pure values.'
    },
    {
      type: 'faq',
      content: 'Q: Why are React Elements immutable?\nA: Immutability enables extremely fast diffing. React does not need to traverse a nested object structure line-by-line to check if props have changed; instead, it performs quick reference checks. If a component updates, React destroys the old element tree and produces a fresh one, relying on browser JS engines for garbage collection.'
    }
  ]
};
