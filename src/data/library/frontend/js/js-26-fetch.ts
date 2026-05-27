import type { NoteContent } from '../../../types';
import fetchSvg from '../../../../assets/diagrams/frontend/js/fetch.svg?raw';

export const content: NoteContent = {
  id: 'js-26',
  moduleId: 'js',
  order: 26,
  group: 'Asynchrony & Runtime',
  title: 'Fetch API',
  description: 'The modern, promise-based standard for making network requests in the browser.',
  sections: [
    {
      type: 'text',
      content: 'The **Fetch API** provides a powerful and flexible interface for accessing and manipulating parts of the protocol, such as requests and responses. It serves as a modern, cleaner replacement for the older \\`XMLHttpRequest\\` (AJAX), built from the ground up to work with Promises and \\`async/await\\`.'
    },
    {
      type: 'diagram',
      content: fetchSvg
    },
    {
      type: 'callout',
      content: 'A fundamental difference between Fetch and older APIs is that the fetch promise only rejects on network failure. It does NOT reject on HTTP errors like 404 or 500.',
      metadata: { type: 'warning', title: 'The Fetch Rejection Trap' }
    },
    {
      type: 'heading',
      content: 'Making a Request',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'By default, \\`fetch()\\` performs a GET request. For other methods like POST, you provide an options object containing the method, headers, and the request body.'
    },
    {
      type: 'code',
      content: `// Sending a POST request with JSON
async function createUser(userData) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }

  return await response.json();
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Handling the Response',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Fetching data is a two-stage process. First, the promise resolves as soon as the server sends the headers. Second, you must call a body-reading method (like \\`.json()\\`, \\`.text()\\`, or \\`.blob()\\`) to consume the actual content.'
    },
    {
      type: 'callout',
      content: 'The response body can only be read once. Attempting to call multiple parsing methods (e.g., \\`.json()\\` then \\`.text()\\`) will throw an error.',
      metadata: { type: 'runtime', title: 'Stream Consumption' }
    },
    {
      type: 'heading',
      content: 'Cancelling Requests: AbortController',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To prevent memory leaks or handle user navigation, you can cancel ongoing requests using an \\`AbortController\\`. This is especially useful for search-as-you-type features where you only care about the latest request.'
    },
    {
      type: 'code',
      content: `const controller = new AbortController();
const signal = controller.signal;

fetch('/api/data', { signal })
  .then(res => res.json())
  .catch(err => {
    if (err.name === 'AbortError') {
      console.log('Fetch aborted');
    }
  });

// Cancel the request
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
      content: 'Q: Why does Fetch not reject on 404 Not Found?\\nA: Fetch considers a successful HTTP response (even an error status) as a successful completion of the request. Rejection is reserved for "network failures" where no response could be retrieved at all.'
    },
    {
      type: 'faq',
      content: 'Q: How do you send and receive cookies with Fetch?\\nA: By default, Fetch does not send cookies. You must set the \\`credentials\\` option to \\`"include"\\` to send cross-origin cookies or \\`"same-origin"\\` for internal ones.'
    },
    {
      type: 'faq',
      content: 'Q: Can you use Fetch to track upload progress?\\nA: No. Currently, the Fetch API does not support tracking upload progress (unlike \\`XMLHttpRequest\\`). For tracking download progress, you can use the \\`ReadableStream\\` API from the \\`response.body\\`.'
    }
  ]
};
