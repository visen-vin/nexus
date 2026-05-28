import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/node-express.svg?raw';

export const content: NoteContent = {
  id: 'intro-2',
  moduleId: 'intro',
  order: 201,
  group: 'Backend Crash Course',
  title: 'Node.js and Express Basics',
  description: "Learn what Node.js is, why it lets you run JavaScript on a server, and how Express makes building web servers fast and simple.",
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "You already know JavaScript — you use it in your React components every day. Here is the cool part: **Node.js lets you run that same JavaScript on a server**, outside of any browser.\n\nBefore Node.js, if you wanted to write backend code you had to learn a completely different language like Python, Java, or PHP. Node.js changed that by letting JavaScript developers write both the frontend and backend.\n\nThink of it this way:\n- **Browser** = JavaScript runs inside Chrome/Firefox, with access to the DOM and window\n- **Node.js** = JavaScript runs on your computer/server, with access to files, the network, and your operating system"
    },

    {
      type: 'heading',
      content: 'Setting Up Your First Server',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `# Step 1: Create a new project folder
mkdir my-backend
cd my-backend

# Step 2: Initialize a Node.js project (creates package.json)
npm init -y

# Step 3: Install Express (the web framework)
npm install express

# Step 4: Install nodemon so the server auto-restarts on file changes
npm install --save-dev nodemon

# Step 5: Create your server file
touch server.js`,
      metadata: { language: 'bash', title: 'Terminal: Setting up a new Node.js + Express project' }
    },

    {
      type: 'heading',
      content: 'What is Express?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "**Express** is a lightweight framework that sits on top of Node.js and makes building web servers much easier.\n\nThink of Express as a receptionist at a busy office. Every time a phone call (HTTP request) comes in, the receptionist:\n1. Checks which department the caller wants (matches the URL)\n2. Puts the call through to the right person (calls the route handler function)\n3. Passes along any message the caller had (the request body or query params)\n\nWithout Express, you would have to write all that routing logic yourself from scratch."
    },

    {
      type: 'heading',
      content: 'Your First Express Server',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// server.js
const express = require('express');

// Create an Express application
const app = express();

// Middleware: parse incoming JSON request bodies
// Without this, req.body will be undefined for POST requests
app.use(express.json());

// ─────────────────────────────────────────────
// ROUTES — each route handles a specific URL
// ─────────────────────────────────────────────

// Route 1: GET / — the home route
// Visit: http://localhost:3001/
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Route 2: GET /hello — with a query parameter
// Visit: http://localhost:3001/hello?name=Alice
app.get('/hello', (req, res) => {
  const name = req.query.name || 'World'; // read ?name= from the URL
  res.json({ message: \`Hello, \${name}!\` }); // respond with JSON
});

// Route 3: GET /users/:id — with a URL parameter
// Visit: http://localhost:3001/users/42
app.get('/users/:id', (req, res) => {
  const userId = req.params.id; // read :id from the URL
  res.json({ userId, message: \`Fetching user \${userId}\` });
});

// ─────────────────────────────────────────────
// START THE SERVER
// ─────────────────────────────────────────────
const PORT = 3001;
app.listen(PORT, () => {
  console.log(\`Server is running on http://localhost:\${PORT}\`);
});`,
      metadata: { language: 'javascript', title: 'server.js — A basic Express server with 3 routes' }
    },

    {
      type: 'callout',
      content: "**Forgetting `app.listen()`** is one of the most common beginner mistakes. Your routes are defined, but if you never call `app.listen()`, the server never actually starts and you will get a \"connection refused\" error. Always make sure `app.listen()` is at the bottom of your file.",
      metadata: { type: 'warning', title: 'Common Pitfall: Forgetting app.listen()' }
    },

    {
      type: 'heading',
      content: 'What is Middleware?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Middleware is code that runs **between** the incoming request and your route handler. Think of airport security — every passenger (request) has to go through it before reaching their gate (your route).\n\nExpress processes middleware and routes in order, top to bottom. Common middleware:\n- `express.json()` — parses JSON request bodies so you can use `req.body`\n- `cors()` — adds headers to allow cross-origin requests from your React app\n- Custom logger — logs every request to the console"
    },
    {
      type: 'code',
      content: `const express = require('express');
const cors = require('cors');

const app = express();

// ─── MIDDLEWARE (runs on EVERY request) ───
app.use(cors()); // allow requests from any origin
app.use(express.json()); // parse JSON bodies

// Custom middleware: log every request
app.use((req, res, next) => {
  console.log(\`[\${new Date().toISOString()}] \${req.method} \${req.url}\`);
  next(); // IMPORTANT: call next() to pass control to the next middleware/route
});

// ─── ROUTES (run only when URL matches) ───
app.get('/ping', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3001, () => console.log('Server started'));`,
      metadata: { language: 'javascript', title: 'Middleware: CORS + JSON parser + custom logger' }
    },

    {
      type: 'callout',
      content: "If you forget to call `next()` inside your middleware, the request will hang forever and the client will time out waiting for a response. Every middleware function must either call `next()` to continue the chain, or send a response with `res.send()` / `res.json()` to end it.",
      metadata: { type: 'warning', title: 'Common Pitfall: Forgetting next() in middleware' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },

    {
      type: 'faq',
      content: "Q: What is Node.js?\nA: Node.js is a JavaScript runtime built on Chrome's V8 engine. It lets you run JavaScript code outside of a browser — on a server, your laptop, or any computer. It comes with built-in modules for things like reading files, making network requests, and creating HTTP servers. It is what makes it possible to use JavaScript for backend development, not just the frontend."
    },
    {
      type: 'faq',
      content: "Q: Why use Express instead of plain Node.js?\nA: Node.js has a built-in `http` module that can create a server, but it is very low-level — you would have to manually parse URLs, check request methods, handle routing, parse JSON bodies, and more. Express wraps all of that into a clean, simple API. It gives you things like `app.get()`, `app.post()`, `req.body`, and `req.params` out of the box, so you can focus on your application logic instead of boilerplate."
    },
    {
      type: 'faq',
      content: "Q: What is middleware in Express?\nA: Middleware is any function that runs between a request arriving at your server and your route handler responding to it. It has access to the request object (req), the response object (res), and a `next()` function to pass control forward. You use middleware for cross-cutting concerns: logging every request, parsing JSON bodies, checking authentication, adding CORS headers, and so on. Think of it as a security checkpoint — every request must pass through it."
    }
  ]
};
