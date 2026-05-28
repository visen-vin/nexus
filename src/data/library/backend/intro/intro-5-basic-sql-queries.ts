import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/basic-sql.svg?raw';

export const content: NoteContent = {
  id: 'intro-5',
  moduleId: 'intro',
  order: 204,
  group: 'Backend Crash Course',
  title: 'Basic SQL Queries',
  description: 'Master the core database CRUD operations: how to create (INSERT), read (SELECT), update (UPDATE), and delete (DELETE) records in a SQL database.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "Now that we know what a database is and how to design a table schema, let's learn how to actually communicate with it. \n\nRelational databases speak **SQL** (Structured Query Language). Just like we use HTTP methods (GET, POST, etc.) to talk to APIs, we use SQL commands to talk to a database. The operations map directly to the classic software pattern of **CRUD** (Create, Read, Update, Delete)."
    },

    {
      type: 'heading',
      content: '1. CREATE: Saving Data with INSERT',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To add a new row of data to a table, we use the `INSERT INTO` command. You specify the table name, the columns you want to fill, and the matching values in the exact same order."
    },
    {
      type: 'code',
      content: `-- Inserting a single student record
INSERT INTO students (first_name, email, age) 
VALUES ('John Doe', 'john@example.com', 22);

-- Inserting multiple records at once (separate values by commas)
INSERT INTO students (first_name, email, age) 
VALUES 
  ('Alice Smith', 'alice@example.com', 20),
  ('Bob Jones', 'bob@example.com', 25);`,
      metadata: { language: 'sql', title: 'SQL: Inserting Records into a Table' }
    },

    {
      type: 'heading',
      content: '2. READ: Fetching Data with SELECT',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To query or fetch records from a database table, we use the `SELECT` command. You specify which columns you want (or use `*` for all columns) and the table name.\n\nYou can refine your search using:\n- `WHERE` — Filters results based on a condition.\n- `ORDER BY` — Sorts results by a column (ascending or descending).\n- `LIMIT` — Caps the number of records returned."
    },
    {
      type: 'code',
      content: `-- Fetch ALL columns for ALL students
SELECT * FROM students;

-- Fetch only names and emails of students who are 22 or older
SELECT first_name, email 
FROM students 
WHERE age >= 22;

-- Get the top 5 youngest students sorted alphabetically
SELECT * 
FROM students 
ORDER BY age ASC, first_name ASC
LIMIT 5;`,
      metadata: { language: 'sql', title: 'SQL: Fetching and Filtering Records' }
    },

    {
      type: 'heading',
      content: '3. UPDATE: Modifying Data with UPDATE',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To change existing data in a table, we use the `UPDATE` command. You specify the table name, tell it which columns to change with `SET`, and use `WHERE` to pinpoint which specific rows to modify."
    },
    {
      type: 'code',
      content: `-- Correcting John's age (updates ONLY the row where id = 1)
UPDATE students 
SET age = 23 
WHERE id = 1;

-- Marking a student as having updated their email
UPDATE students 
SET email = 'john.new@example.com', age = 24
WHERE id = 1;`,
      metadata: { language: 'sql', title: 'SQL: Updating Specific Records' }
    },

    {
      type: 'callout',
      content: "If you run an `UPDATE` or `DELETE` command **without a `WHERE` clause**, the database will apply that change to **every single row** in the entire table! For example, running `UPDATE students SET age = 23;` will make every student in your school 23 years old. Double-check your `WHERE` clauses before running updates.",
      metadata: { type: 'warning', title: 'Critical Warning: The Dangerous Missing WHERE Clause' }
    },

    {
      type: 'heading',
      content: '4. DELETE: Removing Data with DELETE',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To remove rows from a table completely, we use the `DELETE FROM` command. Just like `UPDATE`, you **must** use a `WHERE` clause to target the specific records you want to delete."
    },
    {
      type: 'code',
      content: `-- Delete a specific student by ID
DELETE FROM students 
WHERE id = 3;

-- Delete all students under the age of 18
DELETE FROM students 
WHERE age < 18;`,
      metadata: { language: 'sql', title: 'SQL: Deleting Specific Records' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What does CRUD stand for, and how do SQL commands map to it?\nA: CRUD stands for Create, Read, Update, and Delete. In SQL, these map directly to the following fundamental statements:\n- **Create** -> `INSERT INTO` (adds new rows to a table)\n- **Read** -> `SELECT` (fetches records from a table)\n- **Update** -> `UPDATE` (modifies existing records)\n- **Delete** -> `DELETE FROM` (removes records)"
    },
    {
      type: 'faq',
      content: "Q: What happens if you forget the WHERE clause in an UPDATE or DELETE statement?\nA: If you omit the `WHERE` clause, the database will apply the operation to **every single row** in the table. For example, `DELETE FROM users;` will instantly wipe out your entire users table. In a production environment, this can be catastrophic. Always be extremely careful to include a precise `WHERE` clause."
    },
    {
      type: 'faq',
      content: "Q: What is the difference between SELECT * and SELECT column_name?\nA: `SELECT *` fetches every single column defined in the table schema. While easy for quick testing, it is considered bad practice in production because it queries and sends unnecessary data over the network, slowing down performance. `SELECT column_name1, column_name2` retrieves only the specific columns you need, which is much faster and highly optimized."
    }
  ]
};
