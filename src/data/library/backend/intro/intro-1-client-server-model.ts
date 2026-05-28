import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/client-server.svg?raw';

export const content: NoteContent = {
  id: 'intro-1',
  moduleId: 'intro',
  order: 200,
  group: 'Backend Crash Course',
  title: 'The Client-Server Model',
  description: "Understand how the web actually works: what a backend is, how browsers talk to servers, and what an API really means.",
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "Every time you open a website, two computers are talking to each other: your browser (the **client**) and a remote machine (the **server**). Understanding this relationship is the foundation of all backend development.\n\nThink of it like a restaurant:\n- **Client** = the customer who places an order\n- **Server** = the waiter who takes the order and brings the food\n- **Database** = the kitchen where the food is actually prepared and stored\n\nYou never go into the kitchen yourself — you just talk to the waiter. Similarly, your React app never touches the database directly; it talks to the backend server, which handles everything else."
    },

    {
      type: 'heading',
      content: 'What is HTTP?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "HTTP (HyperText Transfer Protocol) is the language that clients and servers use to communicate. Every interaction follows the same pattern:\n\n1. **Client sends a Request** — with a method (GET, POST, etc.), a URL, and optionally some data\n2. **Server sends a Response** — with a status code and usually some data (often JSON)\n\nThe two most common request types are:\n- **GET** — \"Give me some data\" (like loading a list of users)\n- **POST** — \"Here's some data, please save it\" (like submitting a form)"
    },

    {
      type: 'heading',
      content: 'What is an API?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "An **API** (Application Programming Interface) is the set of URLs your server exposes for clients to interact with. Think of it as a menu at the restaurant — it lists exactly what you can order and how to order it.\n\nFor example, a server might expose:\n- `GET /users` — returns a list of all users\n- `POST /users` — creates a new user\n- `GET /users/42` — returns the user with ID 42\n\nYour React app uses the `fetch()` function (or a library like Axios) to call these URLs."
    },

    {
      type: 'heading',
      content: 'Your First fetch() Call',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// React component making a GET request to a backend API
import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch() sends an HTTP GET request to your backend
    fetch('http://localhost:3001/users')
      .then((response) => {
        // response.json() parses the JSON body the server sent back
        return response.json();
      })
      .then((data: User[]) => {
        setUsers(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Request failed:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <ul>
      {users.map((user) => (
        <li key={user.id}>{user.name} — {user.email}</li>
      ))}
    </ul>
  );
}

export default UserList;`,
      metadata: { language: 'tsx', title: 'React: Fetching data from a backend API' }
    },

    {
      type: 'heading',
      content: 'A Minimal Express Server (the other side)',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// server.js — the backend that your React app talks to
// Run this with: node server.js
// Then visit: http://localhost:3001/users

const express = require('express');
const app = express();

// Middleware: allow requests from your React app (different port = CORS issue)
const cors = require('cors');
app.use(cors());

// Sample data (we'll replace this with a real database later)
const users = [
  { id: 1, name: 'Alice', email: 'alice@example.com' },
  { id: 2, name: 'Bob', email: 'bob@example.com' },
];

// Route: GET /users — return all users as JSON
app.get('/users', (req, res) => {
  res.json(users); // automatically sets Content-Type: application/json
});

// Start the server on port 3001
app.listen(3001, () => {
  console.log('Server running at http://localhost:3001');
});`,
      metadata: { language: 'javascript', title: 'Express: Responding to GET /users' }
    },

    {
      type: 'callout',
      content: "**CORS Error?** When your React app (on port 3000) talks to your Express server (on port 3001), the browser blocks it by default for security. This is called a CORS error. Fix it by installing the `cors` package and adding `app.use(cors())` to your server — just like in the code above.",
      metadata: { type: 'warning', title: 'Common Pitfall: CORS Errors' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },

    {
      type: 'faq',
      content: "Q: What is an API?\nA: An API (Application Programming Interface) is a set of rules that defines how two programs can talk to each other. In web development, it usually refers to a collection of URLs that a backend server exposes so that frontend apps (or other services) can send and receive data. Think of it as a restaurant menu: it tells you what you can order and how to order it, without you needing to know how the kitchen works."
    },
    {
      type: 'faq',
      content: "Q: What is HTTP?\nA: HTTP (HyperText Transfer Protocol) is the communication standard used on the web. It works as a request-response cycle: the client sends a request with a method (GET, POST, PUT, DELETE), a URL, and optional data. The server processes it and sends back a response with a status code (like 200 for success or 404 for not found) and usually some data. Every time you visit a website or your app calls a backend, HTTP is the protocol making it happen."
    },
    {
      type: 'faq',
      content: "Q: What does a backend server actually do?\nA: A backend server sits between your frontend app and your database. It receives HTTP requests from clients, runs your business logic (validates data, checks permissions, applies rules), queries the database if needed, and sends back a response. It also handles things like authentication, file uploads, sending emails, and integrating with third-party services. In short: it is the brain of your application."
    }
  ]
};
