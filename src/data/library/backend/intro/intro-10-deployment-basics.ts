import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/deployment.svg?raw';

export const content: NoteContent = {
  id: 'intro-10',
  moduleId: 'intro',
  order: 209,
  group: 'Backend Crash Course',
  title: 'Deployment Basics',
  description: 'Learn how to deploy your Express backend to the internet using services like Render, bind to dynamic ports, and connect it with your React frontend.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "Up until now, you have been running your React frontend and Express backend entirely on your own laptop (`localhost`). While this is perfect for building and testing, it means nobody else in the world can open your app or use your API. \n\nTo make your application accessible from anywhere, we need to **deploy** it. This means putting our server code onto a continuously running, internet-connected cloud server (like Render, Fly.io, or Heroku) so it can respond to requests 24/7."
    },

    {
      type: 'heading',
      content: 'Preparing Your Server for the Cloud',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Before pushing your backend code to a cloud hosting provider, you must make two critical adjustments to your codebase:\n\n1. **Dynamic Port Binding**: When running locally, you hardcode a port (like `3001`). But cloud providers automatically assign a random port for your server to listen on via the `PORT` environment variable. Your server must dynamically use this port, falling back to your default only if it is undefined.\n2. **Start Script**: The cloud platform needs to know exactly how to run your server. You must define a `start` script in your `package.json` file."
    },
    {
      type: 'code',
      content: `// 1. server.js (Dynamic Port Binding)
const express = require('express');
const app = express();

// Use the PORT assigned by the cloud platform, OR default to 3001 locally
const PORT = process.env.PORT || 3001;

app.get('/api/greet', (req, res) => {
  res.json({ message: 'Hello from the live internet!' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});`,
      metadata: { language: 'javascript', title: 'server.js: Handling dynamic cloud ports' }
    },
    {
      type: 'code',
      content: `// 2. package.json (Define start script)
{
  "name": "my-backend",
  "version": "1.0.0",
  "description": "Express backend server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",      // Used by cloud platforms to run your app
    "dev": "nodemon server.js"      // Used locally for auto-restarting
  },
  "dependencies": {
    "express": "^4.19.2"
  }
}`,
      metadata: { language: 'json', title: 'package.json: Deployment configuration' }
    },

    {
      type: 'callout',
      content: "When deploying a backend, never run your server using `nodemon` in production. Nodemon is designed for development—it watches for file changes and restarts, which is slow and consumes unnecessary resources. Always use `node server.js` in your `start` script for production deployments.",
      metadata: { type: 'warning', title: 'Common Pitfall: Using Nodemon in Production' }
    },

    {
      type: 'heading',
      content: 'Deploying to Render in 4 Simple Steps',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "**Render** is a popular, developer-friendly platform that makes hosting backends completely free and effortless. Here is the step-by-step workflow:\n\n1. **Push to GitHub**: Create a repository for your backend and push your code (make sure `.env` is ignored!).\n2. **Create a Web Service**: Log in to [Render](https://render.com), click \"New\" and select \"Web Service\".\n3. **Connect GitHub**: Connect your GitHub account and select your backend repository.\n4. **Configure Settings**:\n   - **Runtime**: `Node`\n   - **Build Command**: `npm install`\n   - **Start Command**: `npm start`\n   - Click **Deploy Web Service**!\n\nRender will download your code, install dependencies, run your start command, and provide you with a live public URL (e.g. `https://my-backend-service.onrender.com`)."
    },

    {
      type: 'heading',
      content: 'Connecting Your React Frontend to Your Live API',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Once your backend is live, you must update the `fetch()` calls in your React app. If you keep fetching from `http://localhost:3001/api/...`, it will fail when a user tries to access your app from their phone or a different computer. You must swap the local URL for your live Render URL."
    },
    {
      type: 'code',
      content: `// React Frontend Component
import { useEffect, useState } from 'react';

// Swap this based on your environment
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://my-backend-service.onrender.com' // Your live URL
  : 'http://localhost:3001';                    // Your local testing URL

function LiveStatus() {
  const [msg, setMsg] = useState('Connecting...');

  useEffect(() => {
    fetch(\`\${API_BASE_URL}/api/greet\`)
      .then(res => res.json())
      .then(data => setMsg(data.message))
      .catch(err => setMsg('Could not connect to live API.'));
  }, []);

  return <p>Server Status: {msg}</p>;
}`,
      metadata: { language: 'jsx', title: 'React: Dynamically switching between Local and Live URLs' }
    },

    {
      type: 'callout',
      content: "If your React frontend has loaded but you cannot see any database information, check the Web Service's environment variables in the Render dashboard. If your local `.env` keys (like `DB_PASSWORD`) are not defined in the cloud platform's dashboard, your deployed backend won't be able to connect to the database! Always add your production keys in Render under the 'Environment' settings tab.",
      metadata: { type: 'warning', title: 'Common Pitfall: Forgot to Set Production Environment Variables' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: Why is it important to use process.env.PORT inside our Express code for deployment?\nA: In a local environment, you have complete control over ports. However, cloud hosting platforms (like Render or Heroku) run thousands of apps on the same physical server. They dynamically assign a random, open port for your app to listen on. By using `process.env.PORT`, your app automatically binds to the specific port the platform has reserved for it."
    },
    {
      type: 'faq',
      content: "Q: What is the difference between Local Host and Production Host?\nA: Localhost (`http://localhost` or `127.0.0.1`) is a loopback address pointing directly to your own computer. It is invisible to the rest of the world. Production hosting involves deploying your code to a remote, high-availability cloud server with a public IP address and domain name, enabling anyone connected to the internet to reach your application."
    },
    {
      type: 'faq',
      content: "Q: Why shouldn't we use nodemon to run our backend in production?\nA: Nodemon is a utility designed specifically for local development. It continuously monitors the filesystem for changes and restarts the node process. This file system watching is highly resource-intensive and slows down the server. In production, files never change once deployed, so running node directly (`node server.js`) is faster, more secure, and highly stable."
    }
  ]
};
