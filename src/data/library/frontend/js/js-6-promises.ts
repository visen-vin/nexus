import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-6',
  moduleId: 'js',
  order: 8,
  group: 'Asynchrony & Runtime',
  title: 'Promises & Async/Await',
  description: 'The modern standard for handling asynchronous operations and avoiding callback hell.',
  sections: [
    {
      type: 'text',
      content: 'In the early days, JavaScript relied on callbacks for asynchrony, leading to the infamous **"Callback Hell."** **Promises** and the subsequent **Async/Await** syntax revolutionized this by providing a robust, clean, and composable way to handle operations that take time, such as network requests or file I/O.'
    },
    {
      type: 'callout',
      content: 'A Promise is a proxy for a value not necessarily known when the promise is created. It allows you to associate handlers with an asynchronous action\'s eventual success value or failure reason.',
      metadata: { type: 'architecture', title: 'The Promise Mental Model' }
    },
    {
      type: 'heading',
      content: 'The Three States of a Promise',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A Promise is always in one of three mutually exclusive states: **Pending** (initial state), **Fulfilled** (operation completed successfully), or **Rejected** (operation failed). Once a promise is settled (fulfilled or rejected), its state can never change again.'
    },
    {
      type: 'code',
      content: `const promise = new Promise((resolve, reject) => {
  const success = true;
  if (success) {
    resolve("Operation Successful"); // State: Fulfilled, Result: "Operation Successful"
  } else {
    reject(new Error("Failure")); // State: Rejected, Result: Error object
  }
});`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Async/Await: Syntactic Sugar?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Introduced in ES2017, \\`async/await\\` is built on top of promises. It makes asynchronous code look and behave more like synchronous code, significantly improving readability and error handling. An \\`async\\` function always returns a promise, and \\`await\\` pauses execution until the promise settles.'
    },
    {
      type: 'callout',
      content: 'While \\`await\\` pauses the execution of the function, it **does not block the main thread**. The engine is free to handle other tasks while waiting for the promise to resolve.',
      metadata: { type: 'runtime', title: 'Non-Blocking Wait' }
    },
    {
      type: 'code',
      content: `// The modern way to handle asynchronous flow
async function fetchUserData(userId) {
  try {
    const response = await fetch(\`https://api.example.com/users/\${userId}\`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error; // Re-throwing for the caller to handle
  }
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Common Pitfall: Sequential vs. Parallel',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A common mistake is awaiting promises sequentially when they could be executed in parallel. This leads to unnecessary "Waterfall" delays. Use \\`Promise.all()\\` to trigger multiple requests simultaneously.'
    },
    {
      type: 'code',
      content: `// SLOW: Sequential (Waterfall)
const user = await fetchUser();
const posts = await fetchPosts(); // Starts only after fetchUser finishes

// FAST: Parallel (Concurrent)
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()]); // Both start together`,
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
      content: 'Q: What happens if you don\'t handle a promise rejection?\\nA: It results in an "Unhandled Promise Rejection" warning (or error in Node.js). In the browser, you can catch these globally using the \\`unhandledrejection\\` event, but it is best practice to always use \\`try/catch\\` or \\`.catch()\\`.'
    },
    {
      type: 'faq',
      content: 'Q: Is it possible to use await outside of an async function?\\nA: Traditionally, no. However, modern browsers and Node.js environments support **Top-Level Await** in ES Modules, allowing you to use \\`await\\` at the top level of a file.'
    },
    {
      type: 'faq',
      content: 'Q: How does finally() differ from then() or catch()?\\nA: \\`finally()\\` is used for cleanup logic that must run regardless of whether the promise succeeded or failed. Unlike \\`then()\\`, it does not receive the result, and it "passes through" the original settlement to the next handler.'
    }
  ]
};
