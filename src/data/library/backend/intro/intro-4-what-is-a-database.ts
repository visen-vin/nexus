import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/backend/intro/what-is-database.svg?raw';

export const content: NoteContent = {
  id: 'intro-4',
  moduleId: 'intro',
  order: 203,
  group: 'Backend Crash Course',
  title: 'What is a Database?',
  description: 'Understand the concept of persistent storage, compare Relational (SQL) and Non-Relational (NoSQL) databases, and learn how tables, rows, and columns organize data.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "When your Express server restarts, all variables and memory get wiped clean. If a user registers on your website, you can't just store their profile in a JavaScript array — because as soon as you restart your server or it crashes, all that data is gone forever.\n\nTo save data permanently, we need a **database**. A database is a separate program running on a computer that is dedicated entirely to storing, retrieving, and organizing data securely on a hard drive. Think of it like a highly-optimized, industrial-strength digital filing cabinet."
    },

    {
      type: 'heading',
      content: 'The Spreadsheet Analogy: Tables, Rows, and Columns',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "For beginners, the easiest way to visualize a database is to think of a **Microsoft Excel sheet or Google Spreadsheet**:\n\n- **Database** = The entire Excel workbook (`school_database.xlsx`).\n- **Table** = A single sheet inside that workbook (e.g., the `students` sheet).\n- **Row (Record)** = A single horizontal line representing one student (e.g., Alice, age 20, roll number 101).\n- **Column (Field)** = A vertical column representing a specific attribute (e.g., `name`, `age`, `email`). Each column has a specific **data type** (text, number, date) that every row must follow."
    },

    {
      type: 'heading',
      content: 'SQL vs. NoSQL: Choosing Your Database Type',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "There are two main families of databases used in modern web development:\n\n1. **Relational Databases (SQL)**: These store data in strict tables with predefined columns (like Excel sheets). They are called \"relational\" because they excel at linking tables together (e.g., linking a `posts` table to a `users` table). They use a standard query language called SQL (Structured Query Language). \n   *Examples:* **PostgreSQL**, MySQL, SQLite.\n\n2. **Non-Relational Databases (NoSQL)**: These do not use rigid tables. Instead, they store data as flexible JSON-like documents. Each document can have completely different fields, making it great for unstructured, rapidly-evolving data.\n   *Examples:* **MongoDB**, DynamoDB."
    },

    {
      type: 'heading',
      content: 'Defining a Strict SQL Table Schema',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "In SQL databases, you must define your table and column structure (called a **schema**) *before* you can save any data. You must specify what data type each column allows. If a column is defined as an `INTEGER`, the database will block you if you try to insert the string `'hello'` into it."
    },

    {
      type: 'code',
      content: `-- Creating a structured SQL Table for students
CREATE TABLE students (
  id SERIAL PRIMARY KEY,            -- Auto-incrementing unique number for each student
  first_name VARCHAR(50) NOT NULL,   -- Text up to 50 characters, cannot be empty
  email VARCHAR(100) UNIQUE,        -- Text, must be unique across all students
  age INT,                          -- Whole number
  enrolled_date DATE DEFAULT NOW()  -- Date format, defaults to today's date
);`,
      metadata: { language: 'sql', title: 'SQL: Creating a Structured Table Schema' }
    },

    {
      type: 'callout',
      content: "When developing locally, a database is a separate server process. If you try to run your Express app but get a \"Connection Refused\" or \"Failed to connect to port 5432\" error, it usually means your local database software (like PostgreSQL) is turned off. Make sure the database service is running on your machine before starting your server.",
      metadata: { type: 'warning', title: 'Common Pitfall: Forgot to Start the Database' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the main difference between SQL and NoSQL databases?\nA: SQL databases are relational and store data in rigid, structured tables with predefined columns and schemas (e.g. PostgreSQL). They excel at handling complex relationships between tables. NoSQL databases are non-relational and store data as flexible, schema-less documents (e.g. MongoDB). They excel at scale and handling unstructured or fast-changing data structures."
    },
    {
      type: 'faq',
      content: "Q: Why can't we just save our app's data in global JavaScript variables or arrays?\nA: JavaScript variables are stored in the server's RAM (temporary memory). If the server crashes, restarts, or is updated, the RAM is cleared, and all your data is lost forever. A database stores data persistently on the server's hard drive (non-volatile storage), ensuring it survives restarts and power outages."
    },
    {
      type: 'faq',
      content: "Q: What is a Table, a Row, and a Column in a Relational Database?\nA: A Table is a collection of related data (like a spreadsheet sheet). A Row (also called a Record) represents a single, complete entity in that table (like a single user or order). A Column (also called a Field) represents a specific attribute or property of that entity, which must conform to a specific data type (like a string, integer, or date)."
    }
  ]
};
