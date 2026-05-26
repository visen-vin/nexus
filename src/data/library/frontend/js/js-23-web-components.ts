// --- FILE: js-23-web-components.ts ---
import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-23',
  moduleId: 'js',
  order: 23,
  group: 'Browser APIs & Security',
  title: 'Web Components & Shadow DOM',
  description: 'Creating encapsulated, reusable custom elements that are framework-agnostic.',
  sections: [
    {
      type: 'text',
      content: '**Web Components** are a suite of browser-native technologies that allow you to create reusable, encapsulated UI components. Unlike components in React or Vue, Web Components are standard-compliant and work natively in the browser without any external libraries, making them perfect for design systems and long-lived architectural building blocks.'
    },
    {
      type: 'callout',
      content: 'The "Three Pillars" of Web Components are **Custom Elements** (logic), **Shadow DOM** (encapsulation), and **HTML Templates** (markup).',
      metadata: { type: 'architecture', title: 'The Component Pillars' }
    },
    {
      type: 'heading',
      content: 'Shadow DOM: Total Encapsulation',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The Shadow DOM provides a private, isolated DOM tree for your component. CSS styles defined inside a Shadow Root **cannot leak out**, and global styles from the page **cannot leak in** (except for CSS Variables).'
    },
    {
      type: 'code',
      content: `class MyProfile extends HTMLElement {
  constructor() {
    super();
    // Attach a shadow root to the element
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = \`
      <style>
        h1 { color: blue; } /* Only affects this component */
      </style>
      <h1>User Profile</h1>
      <slot></slot> <!-- Composition placeholder -->
    \`;
  }
}
customElements.define('my-profile', MyProfile);`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The Lifecycle Callbacks',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Custom elements provide native hooks to manage state and DOM interactions at specific points in their existence.'
    },
    {
      type: 'code',
      content: `class AppTimer extends HTMLElement {
  connectedCallback() {
    console.log('Element added to page');
    this.startTimer();
  }

  disconnectedCallback() {
    console.log('Element removed from page');
    this.stopTimer();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    console.log(\`Attribute \${name} updated to \${newVal}\`);
  }

  static get observedAttributes() { return ['theme']; }
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Composition with Slots',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The \\`<slot>\\` element is used to pass "Light DOM" content from the consumer into the "Shadow DOM" of the component. This enables powerful composition patterns similar to \\`props.children\\` in React.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Mastery Check' }
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between "open" and "closed" Shadow DOM?\nA: \\`mode: "open"\\` allows the shadow root to be accessed via the host\'s \\`shadowRoot\\` property. \\`mode: "closed"\\` makes the shadow root inaccessible from external JavaScript, providing strict encapsulation.'
    },
    {
      type: 'faq',
      content: 'Q: How do you style a component from the outside?\nA: Global styles do not penetrate the Shadow DOM. To allow external styling, you should use **CSS Custom Properties (Variables)** or the \\`::part()\\` pseudo-element to expose specific internal nodes for styling.'
    },
    {
      type: 'faq',
      content: 'Q: Can Web Components be used with React?\nA: Yes. Since they are standard HTML elements, React can render them. However, since React has its own synthetic event system, you may need a wrapper or manual \\`addEventListener\\` to handle custom events emitted by the Web Component.'
    }
  ]
};
