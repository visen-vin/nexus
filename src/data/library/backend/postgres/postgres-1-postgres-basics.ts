import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/postgres/postgres-architecture.svg?raw';

export const content: NoteContent = {
  id: 'postgres-1',
  moduleId: 'postgres',
  order: 400,
  group: 'PostgreSQL Core',
  title: 'PostgreSQL Architecture & Core Concepts',
  description: 'Understand PostgreSQL as a production-grade relational database engine, learn client-server connections, and explore managing schema migrations and connections efficiently.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "When moving beyond basic file-based databases like SQLite, **PostgreSQL** is the industry standard for production-grade, enterprise relational databases. It is an **Object-Relational Database Management System (ORDBMS)**, highly optimized for concurrency, heavy query loads, data integrity, and strict adherence to SQL standards.\n\nIn a PostgreSQL architecture, the database runs as a background process listening for connection requests (by default on port `5432`). In this lesson, we will explore the internal architecture of PostgreSQL connections, connection pools, and how to manage schemas effectively in Node.js apps."
    },

    {
      type: 'heading',
      content: 'PostgreSQL Client-Server Connection Model',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Unlike a local SQLite file which is loaded directly inside your Node.js application process, PostgreSQL operates on a client-server architecture:\n\n1. **Postgre SQL Server**: A standalone database engine that manages data files, transaction logs, indexes, and queries in memory and disk storage.\n2. **Database Clients**: Your Node.js/Express server (or terminal utilities like `psql`) acts as a client. It establishes a TCP/IP network connection to the Postgres port, sends SQL strings down the socket, and receives structured data blocks back.\n\nBecause opening a new network connection for every single query is highly expensive (takes 10-100ms for TCP handshake and authorization), production backends utilize **Connection Pooling**."
    },

    {
      type: 'heading',
      content: 'Connection Pooling Explained',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A **Connection Pool** maintains a cache of active, open database connections. When a client needs to execute a query:\n1. It **borrows** an already-open connection from the pool instantly (0ms network cost).\n2. It runs the query over this established pipe.\n3. It **releases** the connection back to the pool to be reused by other concurrent requests.\n\nIn Node.js, the `pg` library manages connection pooling seamlessly using the `Pool` class."
    },

    {
      type: 'heading',
      content: 'Hands-On: Setting Up Postgres in Node.js',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To connect Express to PostgreSQL, we install `pg` (the node-postgres driver) and initialize a `Pool` instance using database credentials."
    },
    {
      type: 'code',
      content: `// db.js
const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool config
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // e.g., postgresql://user:password@localhost:5432/my_db
  max: 20, // Max active connections in the pool
  idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
  connectionTimeoutMillis: 2000 // Error out if connection takes > 2 seconds
});

// Export query helper method
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};`,
      metadata: { language: 'javascript', title: 'pg: Configuring Connection Pool' }
    },
    {
      type: 'code',
      content: `// app.js
const express = require('express');
const db = require('./db');

const app = express();
app.use(express.json());

// Fetching users using pool query
app.get('/users', async (req, res) => {
  try {
    // pool.query automates borrowing, running, and releasing connection
    const { rows } = await db.query('SELECT id, name, email FROM users ORDER BY id ASC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

// Creating user with prepared parameterized statements
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  try {
    const query = 'INSERT INTO users(name, email) VALUES($1, $2) RETURNING id, name, email';
    const { rows } = await db.query(query, [name, email]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') { // Unique constraint violation code
      return res.status(409).json({ error: 'Email already exists' });
    }
    console.error(err);
    res.status(500).json({ error: 'Database insertion failed' });
  }
});

app.listen(3001, () => console.log('Express running on port 3001'));`,
      metadata: { language: 'javascript', title: 'Express: Integrating PostgreSQL with Connection Pool' }
    },

    {
      type: 'callout',
      content: "Always handle database errors carefully and never expose raw SQL error dumps to your users (e.g. sending `res.status(500).json(err)`). Doing so can expose your database column names, schemas, or server paths to attackers. Log the detailed error on the server console and send a generalized, friendly message back to the client.",
      metadata: { type: 'warning', title: 'Security Best Practice: Sanitize Error Responses' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: Why is connection pooling crucial in a production database setup like PostgreSQL?\nA: Opening a raw TCP connection to PostgreSQL is an expensive network operation that requires handshakes, process allocation, and user authorization on the database side, taking tens of milliseconds. A Connection Pool keeps a cache of pre-opened connections in memory. Clients borrow and release connections instantly, reducing network latency to 0ms and preventing the database from crashing under high concurrency."
    },
    {
      type: 'faq',
      content: "Q: What is the purpose of the RETURNING clause in PostgreSQL?\nA: Standard SQL `INSERT`, `UPDATE`, and `DELETE` commands do not return database data upon execution; they only report the number of affected rows. PostgreSQL supports a non-standard `RETURNING` clause that allows you to instantly return modified or newly created rows (including auto-generated fields like `id SERIAL` or timestamps) in a single round-trip, saving you from making a separate `SELECT` query."
    },
    {
      type: 'faq',
      content: "Q: What is a unique constraint violation error in Postgres, and how do we handle it?\nA: When a column is defined with the `UNIQUE` constraint (like `email UNIQUE`), PostgreSQL guarantees no two rows can have the same value. If you attempt to insert a duplicate, Postgres aborts the transaction and throws a database error with SQLState error code `23505`. Your backend should intercept this specific error code and return a standard `409 Conflict` HTTP response instead of throwing a generic `500 Server Error`."
    }
  ]
};
