import type { NoteContent } from '../../../types';
import childProcessesSvg from '../../../../assets/diagrams/backend/nodejs/child-processes.svg?raw';

export const content: NoteContent = {
  id: 'node-14',
  moduleId: 'node',
  order: 109,
  group: 'Node.js Core',
  title: 'Child Processes',
  description: 'Uncover the process spawning engine of Node.js. Master the child_process module, compare spawn, exec, execFile, and fork, and learn to write secure, shell-injection proof OS executions.',
  sections: [
    {
      type: 'diagram',
      content: childProcessesSvg
    },
    {
      type: 'text',
      content: "Node.js runs inside a single operating system process. Sometimes, your application needs to leverage the operating system directly—such as running system binaries (like `ffmpeg` or `git`), executing shell commands, or spawning external scripts.\n\nThe native **`child_process`** module allows Node.js to spin up sub-processes, control their inputs and outputs via streams, and communicate with them directly using C++ pipes."
    },
    {
      type: 'heading',
      content: '1. The Four Spawning Methods Compared',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "The `child_process` module provides four primary methods to spawn child processes, each designed for entirely different workloads:\n\n* **`spawn(command, args)`**: Launches a process asynchronously. It returns a child process object with `stdout` and `stderr` exposed as **Readable Streams**. Since data is read in small sequential chunks, it has no memory limits and handles massive outputs with O(1) space complexity. It is perfect for long-running processes or high-volume scripts.\n* **`exec(command, callback)`**: Spawns a shell and runs the command inside it, buffering the **entire output** in memory before firing a callback. It is simple to write but has a **default buffer limit of 200KB** (exceeding it throws `ERR_CHILD_PROCESS_OUT_OF_MEMORY`). It also exposes your app to **Shell Injection vulnerabilities** if user inputs are concatenated directly into the command.\n* **`execFile(file, args, callback)`**: Similar to `exec`, but executes the binary file **directly** without spawning an OS shell first. This is slightly faster and highly secure against shell injections, as argument escaping is handled at the OS kernel level.\n* **`fork(modulePath)`**: A specialized variation of `spawn` designed specifically to spawn **new Node.js V8 processes**. It opens a dedicated **IPC (Inter-Process Communication) channel** between the parent and child process, allowing direct JSON messaging via `send()` and `on('message')` without manual stream parsing."
    },
    {
      type: 'code',
      content: `import { spawn, exec, fork } from 'child_process';

// 1. spawn: Streaming large data chunks (Best Practice)
const ls = spawn('find', ['.', '-name', '*.ts']);

ls.stdout.on('data', (chunk) => {
  console.log('Stream chunk received:', chunk.toString());
});

ls.stderr.on('data', (err) => console.error('Error stream:', err.toString()));
ls.on('close', (code) => console.log(\`spawn exit code: \${code}\`));

// 2. exec: Running simple, tiny shell commands
exec('echo "Hello from Shell!"', (err, stdout, stderr) => {
  if (err) throw err;
  console.log('Exec output:', stdout.trim());
});

// 3. fork: Spawning Node sub-processes with IPC
// parent.ts
/*
const child = fork('child-task.js');
child.on('message', (msg) => console.log('Message from child:', msg));
child.send({ start: true });
*/

// child-task.ts
/*
process.on('message', (msg) => {
  if (msg.start) {
    process.send({ status: 'running' });
  }
});
*/`,
      metadata: { language: 'typescript', title: 'Examples of child process execution' }
    },
    {
      type: 'callout',
      content: "Never concatenate raw user input into `child_process.exec()`. For example, `exec('cat ' + userInput)` allows attackers to append shell control operators (like `; rm -rf /`) to execute arbitrary malicious OS commands. Always prefer `spawn` or `execFile` where arguments are passed as a clean array.",
      metadata: { type: 'warning', title: 'Shell Injection Safety' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the key difference between spawn() and exec() in terms of memory and performance?\nA: `spawn()` streams data in real-time chunk-by-chunk using readable streams, keeping memory usage constant (O(1)). `exec()` buffers the process's entire output in memory before calling its callback. If the process output exceeds the default buffer size (200KB), `exec()` will throw a fatal memory limit error."
    },
    {
      type: 'faq',
      content: "Q: Why is execFile() more secure against shell injections compared to exec()?\nA: `exec()` spawns an entire system shell (like bash or sh) to run the command, allowing the shell to parse control operators (like `;`, `&`, `|`). `execFile()` executes the binary executable directly in the OS without spawning a shell wrapper, meaning arguments are passed cleanly as string arrays to the binary without evaluation."
    },
    {
      type: 'faq',
      content: "Q: What is the purpose of child_process.fork() and how does it implement IPC?\nA: `fork()` is a specialized method to spawn Node.js sub-processes. It automatically configures a dedicated C++ message pipe called the IPC channel between the parent and child. Instead of reading stdout, the processes can send and receive structured JSON messages directly using `process.send(json)` and `process.on('message')`."
    }
  ]
};
