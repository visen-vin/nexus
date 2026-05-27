import type { NoteContent } from '../../../types';
import philosophySvg from '../../../../assets/diagrams/frontend/react/philosophy.svg?raw';

export const content: NoteContent = {
  id: 'react-1',
  moduleId: 'react',
  order: 1,
  group: 'Core Philosophy',
  title: 'Declarative Philosophy',
  description: 'Deep dive into React\'s fundamental shift from Imperative DOM manipulation to Declarative UI as a function of state.',
  sections: [
    {
      type: 'text',
      content: 'In traditional web programming, developers write **Imperative** code—explicitly describing each step to transition the DOM from one state to another (e.g. querying a node, creating children, and appending elements manually). \n\nReact introduces a **Declarative** paradigm. Instead of describing *how* to transition between states, you describe *what* the UI should look like for a given state. React\'s reconciliation engine manages the transition steps automatically.'
    },
    {
      type: 'diagram',
      content: philosophySvg
    },
    {
      type: 'callout',
      content: 'The core equation of React is: **UI = f(state)**. The User Interface is a pure projection of the application state. When state changes, the projection function is re-evaluated, and React handles the DOM updates.',
      metadata: { type: 'architecture', title: 'The Core Formula' }
    },
    {
      type: 'heading',
      content: 'Imperative vs. Declarative Code Comparison',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Let\'s contrast the implementation of a simple "Toggle Active Profile" button. Notice the difference in cognitive load and complexity.'
    },
    {
      type: 'heading',
      content: 'The Imperative Way (Vanilla JS)',
      metadata: { level: 3 }
    },
    {
      type: 'code',
      content: `// Explicitly detailing step-by-step instructions
const btn = document.querySelector('#toggle-btn');
const card = document.querySelector('#profile-card');

btn.addEventListener('click', () => {
  if (card.classList.contains('active')) {
    card.classList.remove('active');
    card.style.background = '#fff';
    btn.textContent = 'Enable Profile';
  } else {
    card.classList.add('active');
    card.style.background = '#4db8ff10';
    btn.textContent = 'Disable Profile';
  }
});`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The Declarative Way (React + TypeScript)',
      metadata: { level: 3 }
    },
    {
      type: 'code',
      content: `import React, { useState } from 'react';

export function ProfileToggle() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div 
      className={\`profile-card \${isActive ? 'active' : ''}\`}
      style={{ background: isActive ? '#4db8ff10' : '#fff' }}
    >
      <button onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Disable Profile' : 'Enable Profile'}
      </button>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Directly querying the DOM using `document.getElementById` or jQuery inside React components bypassing state bypasses React\'s Virtual DOM tracking, resulting in subtle rendering bugs, stale UI states, and memory leaks.',
      metadata: { type: 'warning', title: 'Anti-Pattern Warning' }
    },
    {
      type: 'heading',
      content: 'Benefits of the Declarative Paradigm',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: '1. **Predictability**: For any given state, the UI will always render the exact same way. This eliminates "out-of-sync" states.\n2. **Maintainability**: You only need to think about what the view should look like for each distinct state, rather than tracking state transitions.\n3. **Testability**: Because components are functions of state, they are highly deterministic and straightforward to unit test.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Philosophy Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What does the equation UI = f(state) actually mean in React?\nA: It implies that the UI is a direct projection of the data (state/props). React components are pure-like functions that receive state and return JSX elements. Whenever the data changes, React re-evaluates the function to get the new visual representation.'
    },
    {
      type: 'faq',
      content: 'Q: Why is direct DOM manipulation discouraged in React?\nA: React builds an in-memory Virtual DOM representing the tree. Direct DOM manipulation modifies the real DOM behind React\'s back, meaning React\'s Virtual DOM representation is now out-of-sync. When a subsequent state update occurs, React\'s diffing calculation will produce unexpected or broken visual updates.'
    },
    {
      type: 'faq',
      content: 'Q: Is React truly functional and declarative?\nA: Yes. Its model is declarative because you specify the end target structure, not the DOM mutation commands. However, because JS has closures and hooks manage state statefully inside components, React isn\'t "purely functional" in the mathematical sense, but it adheres tightly to declarative principles.'
    }
  ]
};
