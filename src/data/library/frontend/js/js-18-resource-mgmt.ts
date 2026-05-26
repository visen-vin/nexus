// --- FILE: js-18-resource-mgmt.ts ---
import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-18',
  moduleId: 'js',
  order: 18,
  group: 'Modern Standards',
  title: 'Explicit Resource Management',
  description: 'Deterministic cleanup of resources using the "using" keyword and disposal protocols.',
  sections: [
    {
      type: 'text',
      content: 'Managing the lifecycle of external resources—like file handles, network sockets, or database connections—has historically relied on manual \\`try...finally\\` blocks. **Explicit Resource Management** introduces the \\`using\\` keyword, providing a standardized, deterministic way to ensure resources are cleaned up as soon as they leave scope.'
    },
    {
      type: 'callout',
      content: 'This feature implements the "Disposable" pattern common in languages like C# (using), Python (with), and Java (try-with-resources). It reduces boilerplate and eliminates a common class of memory and resource leaks.',
      metadata: { type: 'architecture', title: 'Deterministic Cleanup' }
    },
    {
      type: 'heading',
      content: 'The Disposal Protocol',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'An object becomes "disposable" by implementing the \\`Symbol.dispose\\` (synchronous) or \\`Symbol.asyncDispose\\` (asynchronous) method. The engine automatically calls these methods when the block scope exits.'
    },
    {
      type: 'code',
      content: `// Implementing the protocol
const tempFile = {
  path: "/tmp/data.txt",
  [Symbol.dispose]() {
    console.log("Deleting temp file...");
    fs.unlinkSync(this.path);
  }
};

{
  using file = tempFile;
  // Use file...
} // file[Symbol.dispose]() is called AUTOMATICALLY here`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Asynchronous Disposal',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'For resources that require I/O to close (like database connections), use \\`await using\\`. This ensures the cleanup process is fully awaited before the code execution continues past the block.'
    },
    {
      type: 'code',
      content: `async function processData() {
  await using connection = await db.connect();
  // Perform queries...
} // Connection is awaited and closed here`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Error Handling: SuppressedError',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'If an error occurs inside the block and another error occurs during disposal, the engine doesn\'t swallow the original error. Instead, it throws a \\`SuppressedError\\`, which contains the disposal error while referencing the original exception.'
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
      content: 'Q: In what order are multiple "using" resources disposed?\nA: They are disposed in **reverse order** of their declaration (Last-In, First-Out). This ensures that dependent resources are cleaned up before the resources they depend on.'
    },
    {
      type: 'faq',
      content: 'Q: What is the purpose of the DisposableStack class?\nA: \\`DisposableStack\\` allows you to group multiple resources together or defer custom cleanup logic imperatively using the \\`.defer()\\` method, providing more flexibility than the declarative \\`using\\` statement.'
    },
    {
      type: 'faq',
      content: 'Q: Does "using" work with regular objects?\nA: No. The object must explicitly implement \\`Symbol.dispose\\` or \\`Symbol.asyncDispose\\`. Passing a non-disposable object to a \\`using\\` declaration will throw a TypeError.'
    }
  ]
};
