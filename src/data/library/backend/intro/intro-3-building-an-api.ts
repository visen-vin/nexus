import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/building-api.svg?raw';

export const content: NoteContent = {
  id: 'intro-3',
  moduleId: 'intro',
  order: 202,
  group: 'Backend Crash Course',
  title: 'Building an API',
  description: 'Learn how to design API endpoints, parse incoming client data using body parsers, and send standard JSON responses back.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "When building a web application, your frontend (React) and backend (Express) need a structured way to share information. This is done through an **API** (Application Programming Interface). \n\nAn API acts as a bridge. It defines a set of digital endpoints (URLs) that the client can request to perform actions like fetching, creating, updating, or deleting data. In this lesson, we will cover how to design these endpoints, how to extract data sent by the client, and how to send back clean JSON responses."
    },

    {
      type: 'heading',
      content: 'API Endpoints and Routing',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "An endpoint is a combination of a **URL path** (like `/api/users`) and an **HTTP method** (like `GET` or `POST`). Express handles routing by matching the request URL and method to a specific handler function.\n\nFor example:\n- `GET /users` — Retrieves a list of users.\n- `POST /users` — Creates a new user.\n\nBy separating requests by method, the same URL (`/users`) can do completely different things depending on whether you want to read data or write it."
    },

    {
      type: 'heading',
      content: 'How the Server Receives Client Data',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Clients can send data to your Express server in three primary ways:\n\n1. **Route Parameters (`req.params`)**: Used for identifying a specific resource by its ID in the URL path (e.g., `/users/12` -> `req.params.id` is `'12'`).\n2. **Query Parameters (`req.query`)**: Used for filtering, sorting, or searching (e.g., `/users?role=admin` -> `req.query.role` is `'admin'`).\n3. **Request Body (`req.body`)**: Used to send large, structured data (like objects or arrays) securely, typically with `POST` or `PUT` requests."
    },

    {
      type: 'heading',
      content: 'Hands-On: Parsing the Request Body',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "By default, Node.js and Express see the request body as a raw stream of data. To read it as a JavaScript object, you must use a **body parser**. Express provides a built-in middleware called `express.json()` that intercepts incoming JSON requests, parses them, and populates `req.body` automatically."
    },

    {
      type: 'code',
      content: `// app.js
const express = require('express');
const app = express();

// CRITICAL: This middleware parses incoming JSON request bodies
app.use(express.json());

// Simulation database
let tasks = [
  { id: 1, title: 'Learn React', completed: true },
  { id: 2, title: 'Build an Express API', completed: false }
];

// 1. Route with URL Param (GET /tasks/:id)
app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

// 2. Route reading req.body (POST /tasks)
app.post('/tasks', (req, res) => {
  const { title } = req.body; // extracted from client JSON payload

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newTask = {
    id: tasks.length + 1,
    title,
    completed: false
  };

  tasks.push(newTask);
  
  // Respond with 201 Created and the new task resource
  res.status(201).json(newTask);
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});`,
      metadata: { language: 'javascript', title: 'Express: Parsing Request Body and URL Parameters' }
    },

    {
      type: 'callout',
      content: "If you omit `app.use(express.json())`, then `req.body` will be `undefined` inside your route handlers when a client makes a `POST` request. Always put the body parser middleware near the very top of your file before your routes are declared.",
      metadata: { type: 'warning', title: 'Common Pitfall: Missing express.json()' }
    },

    {
      type: 'heading',
      content: 'Sending Structured JSON Responses',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To send data back to the client, you use `res.json()`. This method takes a JavaScript object or array, automatically converts it into a JSON string using `JSON.stringify()`, sets the correct `Content-Type: application/json` header, and sends it down the wire. \n\nYou should also use HTTP status codes to communicate the result of the request:\n- `200 OK` — Default for successful GET/PUT/DELETE requests.\n- `201 Created` — Use for successful POST requests that create resources.\n- `400 Bad Request` — The client sent invalid data.\n- `404 Not Found` — The requested resource does not exist."
    },

    {
      type: 'code',
      content: `// React Frontend code making a POST request with JSON data
function createTask(taskTitle) {
  fetch('http://localhost:3001/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Tell the server we are sending JSON
    },
    body: JSON.stringify({ title: taskTitle }) // Serialize object to JSON string
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(newTask => {
      console.log('Task created successfully on server:', newTask);
    })
    .catch(error => {
      console.error('Failed to create task:', error);
    });
}`,
      metadata: { language: 'javascript', title: 'React: Making a POST request with JSON payload' }
    },

    {
      type: 'callout',
      content: "You can only respond to an HTTP request **once**. If you attempt to send multiple responses (e.g. calling `res.send()` or `res.json()` twice in the same execution path), Node.js will throw an error: `Error [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client`. Always use `return` to halt execution once you send a response.",
      metadata: { type: 'warning', title: 'Common Pitfall: Headers Already Sent' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is a Body Parser, and why do we need one in Express?\nA: Express does not parse incoming request bodies by default. To extract JSON data sent in a `POST` or `PUT` request body, you must use body-parsing middleware like `express.json()`. It intercepts the raw request stream, parses the JSON string into a native JavaScript object, and attaches it to `req.body` so that it is easily accessible in your route handlers."
    },
    {
      type: 'faq',
      content: "Q: What is the difference between req.params and req.query?\nA: `req.params` contains route parameters that are part of the URL path itself, defined with a colon (e.g. `/users/:id` captures `/users/12` where `req.params.id` is `'12'`). `req.query` contains optional query parameters appended after a question mark (e.g. `/users?limit=5` captures `req.query.limit` as `'5'`). Path params identify resources, whereas query params filter or modify the result."
    },
    {
      type: 'faq',
      content: "Q: What does the error 'Cannot set headers after they are sent to the client' mean?\nA: HTTP follows a strict 1-Request to 1-Response cycle. You can only respond to a client's request once. If you call `res.json()` or `res.send()` twice (e.g. forgot a `return` in an `if` block checking for errors), Express tries to send a second response, causing this runtime error. To prevent it, always ensure your handler returns immediately after sending a response."
    }
  ]
};
