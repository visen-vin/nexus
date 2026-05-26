import type { NoteContent } from '../../../types';
import abortControllerSvg from '../../../../assets/diagrams/frontend/js/abort-controller.svg?raw';

export const content: NoteContent = {
  id: 'js-21',
  moduleId: 'js',
  order: 21,
  group: 'Asynchrony & Runtime',
  title: 'AbortController',
  description: 'A standardized mechanism for cancelling asynchronous operations like Fetch and event listeners.',
  sections: [
    {
      type: 'text',
      content: 'Managing long-running asynchronous tasks is a core engineering challenge. The **AbortController** API provides a first-class way to cancel operations that are no longer needed—such as a network request after a user navigates away or a timeout-triggered cleanup—preventing memory leaks and redundant processing.'
    },
    {
      type: 'diagram',
      content: abortControllerSvg
    },
    {
      type: 'callout',
      content: 'An AbortController instance has a \`signal\` property (an \`AbortSignal\`) which is passed to the asynchronous API, and an \`abort()\` method used to trigger the cancellation.',
      metadata: { type: 'architecture', title: 'Controller-Signal Pattern' }
    },
    {
      type: 'heading',
      content: 'Cancelling Fetch Requests',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The most common use case for \`AbortController\` is with the Fetch API. When \`abort()\` is called, the fetch promise rejects with an \`AbortError\`.'
    },
    {
      type: 'code',
      content: `const controller = new AbortController();

async function fetchData() {
  try {
    const response = await fetch('/api/data', { signal: controller.signal });
    return await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Request was cancelled');
    }
  }
}

// Trigger cancellation
controller.abort();`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Modern Shortcut: AbortSignal.timeout()',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Modern browsers provide a static method \`AbortSignal.timeout(ms)\` which returns a signal that automatically aborts after a specified duration. This eliminates the need for manual \`setTimeout\` orchestration for simple timeouts.'
    },
    {
      type: 'code',
      content: `// Automatically abort after 5 seconds
const response = await fetch(url, { 
  signal: AbortSignal.timeout(5000) 
});`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Removing Event Listeners',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Beyond fetch, \`AbortSignal\` can be used to clean up multiple event listeners in a single call, which is much cleaner than individual \`removeEventListener\` calls.'
    },
    {
      type: 'code',
      content: `const controller = new AbortController();

window.addEventListener('resize', onResize, { signal: controller.signal });
window.addEventListener('scroll', onScroll, { signal: controller.signal });

// Remove BOTH listeners at once
controller.abort();`,
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
      content: 'Q: Can an AbortController be reused?\nA: No. Once \`abort()\` is called, the signal remains in the aborted state. You must create a new \`AbortController\` instance for a new operation.'
    },
    {
      type: 'faq',
      content: 'Q: How do you combine multiple signals?\nA: Use \`AbortSignal.any([signal1, signal2])\`. This returns a signal that aborts as soon as **any** of the provided signals are triggered (e.g., abort on user click OR timeout).'
    },
    {
      type: 'faq',
      content: 'Q: Does aborting a fetch stop the request on the server?\nA: No. Aborting a fetch tells the **browser** to stop waiting for the response and close the connection. The server may still finish processing the request if it has already reached the backend logic.'
    }
  ]
};
