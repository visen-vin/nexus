// --- FILE: js-22-observers.ts ---
import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-22',
  moduleId: 'js',
  order: 22,
  group: 'Browser APIs & Security',
  title: 'Intersection & Mutation Observers',
  description: 'Performant, asynchronous APIs for reacting to DOM changes and element visibility.',
  sections: [
    {
      type: 'text',
      content: 'Traditionally, reacting to scroll events or DOM changes required expensive, synchronous listeners that often caused "jank" by blocking the main thread. **IntersectionObserver** and **MutationObserver** provide modern, asynchronous alternatives that run off-thread or as microtasks, significantly improving UI performance.'
    },
    {
      type: 'callout',
      content: 'While these observers are asynchronous, their **callbacks** still execute on the main thread. Keep your callback logic lean to avoid dropping frames.',
      metadata: { type: 'runtime', title: 'Main-Thread Callback' }
    },
    {
      type: 'heading',
      content: 'IntersectionObserver: Visibility Logic',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The \\`IntersectionObserver\\` watches for an element entering or leaving the browser viewport (or a specific parent container). It is the gold standard for lazy-loading images, infinite scrolling, and trigger-on-scroll animations.'
    },
    {
      type: 'code',
      content: `const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element visible:', entry.target);
      // Logic for lazy loading or animation
      observer.unobserve(entry.target); // Stop watching if one-time
    }
  });
}, { threshold: 0.5 }); // Trigger when 50% visible

observer.observe(document.querySelector('.my-element'));`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'MutationObserver: DOM Structure Logic',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The \\`MutationObserver\\` reacts to structural changes in the DOM tree, such as elements being added/removed or attribute modifications. It replaces the deprecated (and slow) "Mutation Events".'
    },
    {
      type: 'code',
      content: `const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      console.log('Nodes added/removed');
    } else if (mutation.type === 'attributes') {
      console.log(\`Attribute \${mutation.attributeName} changed\`);
    }
  }
});

observer.observe(targetNode, { 
  childList: true, 
  attributes: true,
  attributeFilter: ['class'] // Optimization: only watch class changes
});`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Performance Pitfall: Layout Thrashing',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A common mistake is reading layout properties (like \\`offsetHeight\\` or \\`getBoundingClientRect()\\`) inside an observer callback. Since these callbacks often run just before a repaint, forced synchronous layouts here are exceptionally expensive.'
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
      content: 'Q: Why is IntersectionObserver better than a "scroll" listener?\nA: Scroll listeners fire synchronously and frequently (dozens of times per second), often requiring manual throttling. \\`IntersectionObserver\\` is asynchronous, calculated by the browser engine off the main thread, and only fires when the intersection state actually changes.'
    },
    {
      type: 'faq',
      content: 'Q: When does a MutationObserver callback execute?\nA: It executes as a **Microtask**. This means it runs after the current task finishes but before the browser performs its next paint cycle, ensuring the UI stays consistent with the data.'
    },
    {
      type: 'faq',
      content: 'Q: What is the purpose of the "rootMargin" option in IntersectionObserver?\nA: \\`rootMargin\\` allows you to grow or shrink the area used for intersection calculations. For example, a \\`rootMargin: "200px"\\` triggers a callback 200px **before** an element enters the viewport, ideal for pre-fetching content.'
    }
  ]
};
