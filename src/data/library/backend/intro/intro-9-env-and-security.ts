import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/env-security.svg?raw';

export const content: NoteContent = {
  id: 'intro-9',
  moduleId: 'intro',
  order: 208,
  group: 'Backend Crash Course',
  title: 'Environment Variables & Security',
  description: 'Learn how to secure your backend: prevent hardcoding database passwords using .env files and safeguard your queries against SQL Injection.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "When you build frontend React apps, your code is compiled and shipped directly to the user's browser — which means *anyone* can open the dev tools and see everything inside it. A backend is completely different. It runs on a private server, hidden from the public. \n\nHowever, if you hardcode database passwords or API keys in your server files, and then push that code to GitHub, anyone who views your repository can steal your credentials. Additionally, if you don't secure your SQL queries, hackers can trick your server into exposing or deleting your entire database. Let's learn how to secure our database credentials and protect our database queries."
    },

    {
      type: 'heading',
      content: 'Never Hardcode Credentials: Environment Variables',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To keep credentials safe, we use **Environment Variables**. These are key-value pairs stored on the operating system running your server, completely separate from your codebase. \n\nIn Node.js, we use a file named `.env` to hold these values locally, and the `dotenv` npm package to load them into memory (`process.env`)."
    },
    {
      type: 'code',
      content: `# 1. Create a file named ".env" in your backend root folder
# (Make sure to add ".env" to your ".gitignore" file so it NEVER gets pushed to GitHub!)

DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=my_super_secret_password_123
DB_PORT=5432`,
      metadata: { language: 'bash', title: 'Local File: .env (Kept secret and out of Git)' }
    },
    {
      type: 'code',
      content: `// 2. Load environment variables in your server.js
require('dotenv').config(); // Loads .env into process.env

const express = require('express');
const { Pool } = require('pg');

const app = express();

// Configure database connection using variables
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: 'my_app_db'
});

app.get('/status', async (req, res) => {
  const result = await pool.query('SELECT NOW()');
  res.json({ dbTime: result.rows[0].now });
});

app.listen(3001, () => console.log('Server started'));`,
      metadata: { language: 'javascript', title: 'server.js: Accessing process.env' }
    },

    {
      type: 'callout',
      content: "One of the most common beginner mistakes is committing the `.env` file to Git and pushing it to GitHub. This exposes your passwords to the entire world. Always immediately add `.env` to your `.gitignore` file. Instead of committing `.env`, push a `.env.example` file that shows the keys (e.g. `DB_PASSWORD=`) but leaves the actual values blank.",
      metadata: { type: 'warning', title: 'Critical Security Pitfall: Committing .env to Git' }
    },

    {
      type: 'heading',
      content: 'Understanding SQL Injection',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A **SQL Injection (SQLi)** attack occurs when a hacker inserts malicious SQL commands into a user input field (like a login email box) and your server directly concatenates that input into a SQL query. \n\nIf you stitch strings together directly, the database cannot distinguish between the query structure you wrote and the malicious code the hacker provided."
    },
    {
      type: 'code',
      content: `// DANGEROUS UNSAFE CODE — NEVER DO THIS!
// If a user sends: req.body.email = "admin@example.com' OR '1'='1"
// The resulting query becomes: SELECT * FROM users WHERE email = 'admin@example.com' OR '1'='1';
// Since '1'='1' is always true, the hacker successfully logs in as the administrator without a password!
app.post('/login', async (req, res) => {
  const { email } = req.body;
  const query = \`SELECT * FROM users WHERE email = '\${email}'\`; // String interpolation is UNSAFE!
  
  const result = await pool.query(query);
  res.json(result.rows);
});`,
      metadata: { language: 'javascript', title: 'Vulnerable: Susceptible to SQL Injection' }
    },

    {
      type: 'heading',
      content: 'The Solution: Parameterized Queries',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To prevent SQL Injection, you must use **Parameterized Queries** (also called Prepared Statements). Instead of combining strings directly in JavaScript, you use placeholders (`$1`, `$2`, etc.) in the SQL string, and pass the user input as a separate array. \n\nThe database driver treats these placeholders as strict data values, never as executable code, making SQL Injection impossible."
    },
    {
      type: 'code',
      content: `// SAFE SECURE CODE — ALWAYS DO THIS!
// The database driver safely sanitizes variables before putting them in placeholders
app.post('/login', async (req, res) => {
  const { email } = req.body;
  
  // Use $1 as a placeholder
  const query = 'SELECT * FROM users WHERE email = $1'; 
  
  // Pass user variables inside a separate array
  const values = [email]; 
  
  const result = await pool.query(query, values);
  res.json(result.rows);
});`,
      metadata: { language: 'javascript', title: 'Secure: Using Prepared Parameterized Query' }
    },

    {
      type: 'callout',
      content: "Never trust user input. Even if you validate a form on the frontend React app (e.g. checking for email format), hackers can easily bypass your React forms and make raw HTTP POST requests directly to your API. Always sanitize and use parameterized queries on the backend server for complete safety.",
      metadata: { type: 'warning', title: 'Security Rule: Never Trust the Frontend' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: Why should we never hardcode database credentials or API keys in our code?\nA: Hardcoding credentials exposes them directly in version control. If the repository is pushed to a public platform like GitHub, hackers can scan and steal them instantly. Additionally, hardcoding makes it difficult to change configurations between environments (like using a local database on your laptop vs. a production database on a cloud server)."
    },
    {
      type: 'faq',
      content: "Q: What is SQL Injection, and how does it happen?\nA: SQL Injection (SQLi) is a security vulnerability where an attacker manipulates SQL queries by inserting malicious code into user-input fields. It happens when user input is concatenated directly into SQL query strings (using string interpolation or addition) and executed, tricking the database into treating user data as executable SQL commands."
    },
    {
      type: 'faq',
      content: "Q: How do Parameterized Queries prevent SQL Injection?\nA: Parameterized queries separate the query structure from the user-supplied data. You define the SQL query using placeholders (like `$1` or `?`), and send the user variables as a completely separate array. The database driver compiles the query template first, and then inserts the values purely as literal data, preventing the database from executing any code contained in the user input."
    }
  ]
};
