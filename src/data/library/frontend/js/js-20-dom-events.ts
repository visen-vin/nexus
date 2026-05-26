import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-20',
  moduleId: 'js',
  order: 20,
  group: 'Browser APIs & Security',
  title: 'DOM & Event Flow',
  description: 'Understanding the document structure and the mechanics of event propagation in the browser.',
  sections: [
    {
      type: 'text',
      content: 'The **Document Object Model (DOM)** is the programming interface for HTML and XML documents. It represents the page as a logical tree where every node is an object. Understanding how this tree is structured and how events navigate through it is fundamental to building interactive web applications.'
    },
    {
      type: 'callout',
      content: 'The DOM is not part of the JavaScript language itself; it is a Web API provided by the browser environment.',
      metadata: { type: 'architecture', title: 'Web API Layer' }
    },
    {
      type: 'heading',
      content: 'The Three Phases of Event Flow',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When an interaction occurs, the browser doesn\'t just trigger a handler on the target element. Instead, the event follows a path through the DOM tree in three distinct phases: **Capturing**, **Target**, and **Bubbling**.'
    },
    {
      type: 'code',
      content: `// 1. Capturing Phase: Down from Window to Target
// 2. Target Phase: Triggers on the clicked element
// 3. Bubbling Phase: Up from Target back to Window

elem.addEventListener("click", (e) => {
  console.log("Bubbling phase (default)");
}, false);

elem.addEventListener("click", (e) => {
  console.log("Capturing phase");
}, true); // Setting 'capture: true' catches the event on the way down`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Bubbling & event.target',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Bubbling is the most common pattern: an event triggers on the inner-most element and then "bubbles up" through its ancestors. To distinguish between the initiator and the handler, we use \\`event.target\\` (where it started) and \\`event.currentTarget\\` (the element currently handling the event).'
    },
    {
      type: 'callout',
      content: 'Stopping propagation via \\`event.stopPropagation()\\` is generally discouraged. It can break global tracking scripts or component-level logic that relies on seeing all events.',
      metadata: { type: 'warning', title: 'Architectural Warning' }
    },
    {
      type: 'heading',
      content: 'Optimization: Event Delegation',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Instead of attaching listeners to hundreds of similar elements, we can attach a single listener to a common ancestor. This pattern, called **Event Delegation**, leverages bubbling to handle events efficiently and reduces memory overhead.'
    },
    {
      type: 'code',
      content: `// Unified handler for an entire list
document.querySelector('#menu').onclick = function(event) {
  const target = event.target;
  
  if (target.tagName !== 'BUTTON') return;
  
  // Logic for any button click inside the menu
  executeAction(target.dataset.action);
};`,
      metadata: { language: 'javascript' }
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
      content: 'Q: What is the difference between event.target and event.currentTarget?\\nA: \\`event.target\\` is the "origin" element that was actually clicked. \\`event.currentTarget\\` (which is also \\`this\\`) is the element that the event listener is physically attached to.'
    },
    {
      type: 'faq',
      content: 'Q: Can you stop an event from triggering other handlers on the same element?\\nA: Yes. \\`event.stopPropagation()\\` only stops the event from moving to other elements. To stop subsequent handlers on the **current** element, use \\`event.stopImmediatePropagation()\\`. '
    },
    {
      type: 'faq',
      content: 'Q: Why do browsers add a <tbody> automatically if missing in HTML?\\nA: The DOM specification requires a \\`<tbody>\\` for every table. Browsers "autocorrect" malformed HTML during parsing to ensure the resulting DOM tree adheres to the standard structure.'
    }
  ]
};
