import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/crud-api.svg?raw';

export const content: NoteContent = {
  id: 'intro-8',
  moduleId: 'intro',
  order: 207,
  group: 'Backend Crash Course',
  title: 'Building a CRUD API with PostgreSQL',
  description: 'Build a complete Create, Read, Update, Delete API for a users resource, fully connected to a PostgreSQL database.',
  sections: [
    { type: 'diagram', content: diagramSvg },
    {
      type: 'text',
      content: "CRUD stands for Create, Read, Update, Delete — the four fundamental operations every data-driven app needs. It maps perfectly to four SQL commands (INSERT, SELECT, UPDATE, DELETE) and four HTTP methods (POST, GET, PUT, DELETE). In this lesson you'll build a complete, working CRUD API for a 'users' resource connected to a real PostgreSQL database."
    },
    {
      type: 'heading',
      content: 'Project Setup',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `-- First, create your database table in PostgreSQL
-- Run this in psql or pgAdmin

CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);`,
      metadata: { language: 'sql', title: 'Database — Create Users Table' }
    },
    {
      type: 'code',
      content: `# Project structure
my-api/
  src/
    db.ts         # database pool
    server.ts     # express app + all routes
  .env            # database credentials
  .gitignore      # must include .env!
  package.json`,
      metadata: { language: 'bash', title: 'Project Structure' }
    },
    {
      type: 'heading',
      content: 'The Database Pool (db.ts)',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// src/db.ts
import { Pool } from 'pg';
import 'dotenv/config';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});`,
      metadata: { language: 'typescript', title: 'src/db.ts' }
    },
    {
      type: 'heading',
      content: 'READ — GET All Users',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// GET /users — returns ALL users
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
    // Response: [{ id: 1, name: "Alice", email: "...", created_at: "..." }, ...]
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /users/:id — returns ONE user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params; // id comes from the URL: /users/42
    const result = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [id]  // $1 is safely replaced with the id value
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]); // single object, not array
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});`,
      metadata: { language: 'typescript', title: 'GET — Read Users' }
    },
    {
      type: 'heading',
      content: 'CREATE — POST New User',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// POST /users — creates a new user
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body; // data sent by the client

    // Basic validation
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
      // RETURNING * tells PostgreSQL to send back the newly created row
      // including its auto-generated id and created_at timestamp
    );

    res.status(201).json(result.rows[0]);
    // Response: { id: 3, name: "Carol", email: "carol@example.com", created_at: "..." }
  } catch (err: any) {
    // Handle duplicate email error (unique constraint violation)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});`,
      metadata: { language: 'typescript', title: 'POST — Create User' }
    },
    {
      type: 'heading',
      content: 'UPDATE — PUT User',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// PUT /users/:id — updates an existing user
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]); // return the updated user
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});`,
      metadata: { language: 'typescript', title: 'PUT — Update User' }
    },
    {
      type: 'heading',
      content: 'DELETE — Remove User',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// DELETE /users/:id — deletes a user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(204).send(); // 204 = No Content (success, nothing to return)
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});`,
      metadata: { language: 'typescript', title: 'DELETE — Remove User' }
    },
    {
      type: 'heading',
      content: 'Complete server.ts',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// src/server.ts — full CRUD API
import express from 'express';
import { pool } from './db';

const app = express();
app.use(express.json()); // parse JSON request bodies

// ---- READ ----
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch users' }); }
});

app.get('/users/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to fetch user' }); }
});

// ---- CREATE ----
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'name and email required' });
    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already exists' });
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// ---- UPDATE ----
app.put('/users/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    const result = await pool.query(
      'UPDATE users SET name=$1, email=$2 WHERE id=$3 RETURNING *',
      [name, email, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: 'Failed to update user' }); }
});

// ---- DELETE ----
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM users WHERE id=$1 RETURNING id',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Not found' });
    res.status(204).send();
  } catch (err) { res.status(500).json({ error: 'Failed to delete user' }); }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('API running on port', process.env.PORT || 3000);
});`,
      metadata: { language: 'typescript', title: 'src/server.ts — Complete CRUD API' }
    },
    {
      type: 'callout',
      content: "ALWAYS use parameterized queries ($1, $2, $3...) instead of string concatenation. NEVER do this: `SELECT * FROM users WHERE id = '${req.params.id}'`. A malicious user could set req.params.id to something like `1; DROP TABLE users;` and destroy your database. With $1 placeholders, pg treats the value as pure data — not as executable SQL.",
      metadata: { type: 'warning', title: 'Use Parameterized Queries to Prevent SQL Injection' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is CRUD?\nA: CRUD stands for Create, Read, Update, Delete — the four basic operations for managing data. In a REST API they map to: POST (Create), GET (Read), PUT/PATCH (Update), DELETE (Delete). In SQL they map to: INSERT, SELECT, UPDATE, DELETE. Almost every data-driven application is built on these four operations."
    },
    {
      type: 'faq',
      content: "Q: What is SQL injection?\nA: SQL injection is a security attack where a user submits malicious SQL code inside form input, hoping your server will execute it against the database. For example, if you build a query like `'SELECT * FROM users WHERE name = ' + req.body.name`, an attacker could submit `'; DROP TABLE users; --` as their name, which would delete your entire table. Parameterized queries ($1, $2) completely prevent this by treating user input as data only, never as executable SQL."
    },
    {
      type: 'faq',
      content: "Q: What does req.params.id do?\nA: req.params gives you the dynamic parts of a URL route. When you define a route as '/users/:id', Express captures whatever appears in that position in the URL and puts it in req.params.id. So a request to GET /users/42 gives you req.params.id === '42' (always a string — convert with parseInt() or Number() if you need a number). Similarly, req.body contains the parsed JSON body of POST/PUT requests, and req.query contains URL query parameters like ?page=2."
    }
  ]
};
