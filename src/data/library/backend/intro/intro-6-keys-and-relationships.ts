import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/keys-relationships.svg?raw';

export const content: NoteContent = {
  id: 'intro-6',
  moduleId: 'intro',
  order: 205,
  group: 'Backend Crash Course',
  title: 'Keys and Relationships',
  description: 'Learn how to link database tables together using PRIMARY KEYs and FOREIGN KEYs, and how to query across them with JOIN.',
  sections: [
    { type: 'diagram', content: diagramSvg },
    {
      type: 'text',
      content: "Imagine a school. Every student gets a unique roll number — no two students share one. In SQL, that's a PRIMARY KEY. Now imagine an exam paper. Instead of writing the student's full name (which might not be unique), you write their roll number on it. That roll number on the exam paper is a FOREIGN KEY — it links the paper back to the student. This is exactly how relational databases connect tables."
    },
    {
      type: 'heading',
      content: 'PRIMARY KEY',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A PRIMARY KEY is a column (or set of columns) that uniquely identifies each row in a table. Think of it as the row's permanent ID badge. Rules: it must be unique, and it cannot be NULL (empty). In PostgreSQL, you typically use a serial (auto-incrementing integer) or UUID."
    },
    {
      type: 'code',
      content: `-- Creating a users table with a PRIMARY KEY
CREATE TABLE users (
  id SERIAL PRIMARY KEY,   -- auto-increments: 1, 2, 3...
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL
);

-- Insert some rows (id is assigned automatically!)
INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');
INSERT INTO users (name, email) VALUES ('Bob', 'bob@example.com');

-- Result:
-- id | name  | email
-- ---+-------+------------------
--  1 | Alice | alice@example.com
--  2 | Bob   | bob@example.com`,
      metadata: { language: 'sql', title: 'PRIMARY KEY — Users Table' }
    },
    {
      type: 'heading',
      content: 'FOREIGN KEY',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A FOREIGN KEY is a column in one table that refers to the PRIMARY KEY in another table. It creates a link (relationship) between the two tables. In our school analogy: the roll number on the exam paper (foreign key) points to the student record (primary key). This prevents 'orphan' data — you can't have a post that belongs to a user who doesn't exist."
    },
    {
      type: 'code',
      content: `-- Creating a posts table with a FOREIGN KEY linking to users
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT
);

-- Insert posts — user_id must match an existing users.id
INSERT INTO posts (user_id, title, body) VALUES (1, 'Hello World', 'My first post');
INSERT INTO posts (user_id, title, body) VALUES (1, 'My Journey', 'Learning SQL...');
INSERT INTO posts (user_id, title, body) VALUES (2, 'Bob Speaks', 'Hi everyone!');

-- This would FAIL — user_id 999 does not exist in users table!
-- INSERT INTO posts (user_id, title) VALUES (999, 'Ghost Post');`,
      metadata: { language: 'sql', title: 'FOREIGN KEY — Posts Table' }
    },
    {
      type: 'callout',
      content: "Forgetting PRIMARY KEY means you can have duplicate rows with no way to identify or update a specific one. Always define a PRIMARY KEY on every table. SERIAL PRIMARY KEY is the easiest way — PostgreSQL handles the auto-increment for you.",
      metadata: { type: 'warning', title: 'Always Define a PRIMARY KEY' }
    },
    {
      type: 'heading',
      content: 'One-to-Many Relationships',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "The users-posts relationship above is called one-to-many: one user can have many posts, but each post belongs to only one user. This is the most common relationship type. The 'many' side (posts) holds the foreign key."
    },
    {
      type: 'heading',
      content: 'Many-to-Many Relationships',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A many-to-many relationship means: one student can enroll in many courses, and one course can have many students. SQL doesn't support this directly — you need a junction table (also called a join table or bridge table) in between."
    },
    {
      type: 'code',
      content: `-- Many-to-many: students and courses
CREATE TABLE students (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200)
);

-- Junction table: links students to courses
CREATE TABLE enrollments (
  student_id INTEGER REFERENCES students(id),
  course_id  INTEGER REFERENCES courses(id),
  enrolled_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (student_id, course_id)  -- composite primary key
);

-- Now a student can enroll in many courses, and vice versa
INSERT INTO enrollments (student_id, course_id) VALUES (1, 1);
INSERT INTO enrollments (student_id, course_id) VALUES (1, 2);  -- student 1 in 2 courses
INSERT INTO enrollments (student_id, course_id) VALUES (2, 1);  -- student 2 in same course`,
      metadata: { language: 'sql', title: 'Many-to-Many with Junction Table' }
    },
    {
      type: 'heading',
      content: 'JOIN — Combining Tables',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "JOIN is the SQL command that merges rows from two tables based on a matching condition. The most common is INNER JOIN — it returns only rows where there is a match in both tables. Think of it as a Venn diagram: INNER JOIN returns the overlap."
    },
    {
      type: 'code',
      content: `-- INNER JOIN: get each post with its author's name
SELECT
  users.name   AS author,
  posts.title  AS post_title,
  posts.id     AS post_id
FROM posts
INNER JOIN users ON posts.user_id = users.id;

-- Result:
-- author | post_title   | post_id
-- -------+--------------+--------
-- Alice  | Hello World  | 1
-- Alice  | My Journey   | 2
-- Bob    | Bob Speaks   | 3

-- LEFT JOIN: also include users with zero posts
SELECT
  users.name,
  posts.title
FROM users
LEFT JOIN posts ON posts.user_id = users.id;
-- Carol (who has no posts) still appears, with NULL for title`,
      metadata: { language: 'sql', title: 'INNER JOIN and LEFT JOIN' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is a PRIMARY KEY?\nA: A PRIMARY KEY is a column that uniquely identifies each row in a table — no two rows can have the same value, and it can never be NULL. It's like a row's permanent ID badge. In PostgreSQL, SERIAL PRIMARY KEY auto-increments the value (1, 2, 3...) so you never have to set it manually."
    },
    {
      type: 'faq',
      content: "Q: What is a FOREIGN KEY?\nA: A FOREIGN KEY is a column in one table that points to the PRIMARY KEY of another table. It creates a link between the two tables and enforces referential integrity — meaning you can't create a post for a user that doesn't exist. This prevents 'orphan' data from polluting your database."
    },
    {
      type: 'faq',
      content: "Q: What does JOIN do?\nA: JOIN combines rows from two or more tables based on a related column. INNER JOIN returns only rows where there's a match in both tables (like finding records that appear in both). LEFT JOIN returns all rows from the left table plus matched rows from the right — unmatched right-side values come back as NULL. You use JOINs whenever you need data from more than one table in a single query."
    }
  ]
};
