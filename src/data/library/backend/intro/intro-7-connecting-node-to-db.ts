import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/connecting-node-db.svg?raw';

export const content: NoteContent = {
  id: 'intro-7',
  moduleId: 'intro',
  order: 206,
  group: 'Backend Crash Course',
  title: 'Connecting Node.js to PostgreSQL',
  description: 'Learn how to use the pg library to connect your Express server to a PostgreSQL database using connection pools.',
  sections: [
    { type: 'diagram', content: diagramSvg },
    {
      type: 'text',
      content: "So far you have an Express server and a PostgreSQL database — but they don't know about each other yet. To connect them, you use a Node.js library called pg (short for postgres). Think of pg as a translator: your JavaScript code tells it what SQL to run, it sends that SQL to PostgreSQL, and brings back the results as plain JavaScript objects."
    },
    {
      type: 'heading',
      content: 'Installing the pg Library',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `# Install the pg package and its TypeScript types
npm install pg
npm install --save-dev @types/pg

# Also install dotenv to manage your database credentials
npm install dotenv`,
      metadata: { language: 'bash', title: 'Install Dependencies' }
    },
    {
      type: 'heading',
      content: 'What is a Connection Pool?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A connection pool is like a parking lot full of ready-to-use cars. Without a pool, every time a user makes a request, your app would have to build a brand-new connection to PostgreSQL (~50ms overhead) and tear it down after. With a pool, you keep a set of connections open and ready. When a request comes in, it grabs an idle connection, uses it, and returns it — just like taking a car from the lot and parking it back when done. Most apps set a pool of 5–10 connections."
    },
    {
      type: 'heading',
      content: 'What is a Connection String?',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A connection string is a URL that tells pg everything it needs to connect: who you are, your password, where the database lives, and which database to use. Format: postgresql://username:password@host:5432/database_name"
    },
    {
      type: 'heading',
      content: 'Setting Up the Database Connection',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `# .env file — store your credentials here, NEVER in code
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/myapp_db
PORT=3000`,
      metadata: { language: 'bash', title: '.env — Database Credentials' }
    },
    {
      type: 'code',
      content: `// src/db.ts — create and export the connection pool
import { Pool } from 'pg';
import 'dotenv/config';  // loads .env variables into process.env

// Create a pool of up to 10 database connections
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional: for SSL on hosted databases (Railway, Render)
  // ssl: { rejectUnauthorized: false }
});

// Test the connection when the app starts
pool.connect((err, client, release) => {
  if (err) {
    console.error('Failed to connect to database:', err.message);
    return;
  }
  console.log('Connected to PostgreSQL database!');
  release(); // return connection back to pool
});`,
      metadata: { language: 'typescript', title: 'src/db.ts — Database Pool Setup' }
    },
    {
      type: 'callout',
      content: "Never hardcode your database password directly in your code! If you push it to GitHub (even a private repo), it's a major security risk. Always use environment variables via dotenv. Add .env to your .gitignore file so it's never committed.",
      metadata: { type: 'warning', title: 'Never Hardcode Database Passwords' }
    },
    {
      type: 'heading',
      content: 'Running Queries',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "The pool.query() method sends a SQL string to PostgreSQL and returns a result object. The result has a rows property — an array of JavaScript objects, one per matched row. Each object's keys match the column names in your SQL query."
    },
    {
      type: 'code',
      content: `// src/server.ts — using the pool in an Express route
import express from 'express';
import { pool } from './db';

const app = express();
app.use(express.json());

// GET /users — fetch all users from the database
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY id');
    // result.rows is an array of user objects:
    // [{ id: 1, name: 'Alice', email: 'alice@example.com' }, ...]
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /users/:id — fetch a single user
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // $1 is a parameterized placeholder — safe from SQL injection
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);  // return single user object
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server running on port', process.env.PORT || 3000);
});`,
      metadata: { language: 'typescript', title: 'src/server.ts — Express Routes with pg' }
    },
    {
      type: 'callout',
      content: "Always wrap pool.query() in a try/catch block. If your database is down or a query fails, the error won't crash your server — instead you can send a proper 500 error response to the client.",
      metadata: { type: 'architecture', title: 'Always Use Try/Catch with Async Queries' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is a connection pool?\nA: A connection pool is a set of pre-opened database connections that are kept alive and reused across multiple requests. Instead of opening and closing a new connection for every query (which takes ~50ms each time), the pool keeps, say, 10 connections ready and hands them out as needed. This dramatically improves performance under load. The pg library's Pool class manages this automatically."
    },
    {
      type: 'faq',
      content: "Q: What is a connection string?\nA: A connection string is a URL that contains everything needed to connect to a database: the username, password, host (server address), port (5432 for PostgreSQL), and database name. Example: postgresql://alice:secret@localhost:5432/mydb. It's always stored in an environment variable (DATABASE_URL) so the password is never exposed in code."
    },
    {
      type: 'faq',
      content: "Q: What is the pg library?\nA: pg (also called node-postgres) is the most popular Node.js driver for PostgreSQL. A 'driver' is a library that knows how to speak the PostgreSQL network protocol — it translates your pool.query('SELECT ...') calls into low-level database communication and returns results as plain JavaScript objects. You import Pool from 'pg', create one instance, and reuse it throughout your app."
    }
  ]
};
