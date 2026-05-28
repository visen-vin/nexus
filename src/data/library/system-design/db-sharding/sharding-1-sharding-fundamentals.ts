import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/system-design/db-sharding/db-sharding.svg?raw';

export const content: NoteContent = {
  id: 'db-sharding-1',
  moduleId: 'db-sharding',
  order: 600,
  group: 'Database Sharding',
  title: 'Database Sharding & Horizontal Scaling',
  description: 'Learn the advanced database scaling technique of sharding, choose routing partition keys, and manage cross-shard queries and re-sharding challenges.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "When a relational database grows to hold hundreds of millions of rows, standard optimizations like indexing or vertical scaling (adding faster CPU/SSD) eventually hit a physical wall. Heavy query latency increases, and a single database engine becomes the global bottleneck for the entire system.\n\nTo scale further, we must horizontally scale the database using **Database Sharding**. Sharding is the process of breaking up a massive database table into smaller, manageable chunks (called **shards**) and distributing them across completely independent database servers."
    },

    {
      type: 'heading',
      content: 'How Sharding Works: Horizontal Partitioning',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Database sharding is a form of **horizontal partitioning**. \n\n- **Vertical Partitioning**: Splitting a table by *columns* (e.g., separating rarely used columns like `profile_bio` into a separate table, but keeping them on the same server).\n- **Horizontal Partitioning (Sharding)**: Splitting a table by *rows* (e.g., putting users with IDs 1 to 1,000,000 on Database Server A, and IDs 1,000,001 to 2,000,000 on Database Server B).\n\nEach shard is a standalone database that holds a subset of the total rows. Together, all shards contain the complete dataset."
    },

    {
      type: 'heading',
      content: 'Choosing a Shard Key (Partition Key)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "The **Shard Key** is the specific column in your table that is used to decide which database shard a particular row will be written to or read from. Choosing the right shard key is the most critical decision in database sharding. Common routing algorithms include:\n\n1. **Range-Based Sharding**: Routing rows based on ranges of the shard key (e.g., `user_id` 1-100k -> Shard A, 100k-200k -> Shard B).\n   - *Downside*: Leads to uneven loading (if user IDs 1-100k represent early, highly-active users, Shard A will be overloaded while Shard B sits idle).\n2. **Directory-Based Sharding**: Maintaining a lookup database that maps shard keys to physical shards.\n   - *Downside*: The lookup database itself becomes a single point of failure and a query bottleneck.\n3. **Hash-Based Sharding**: Applying a mathematical hash function to the shard key, taking the modulo of the number of shards, and routing accordingly (e.g., `Hash(user_id) % number_of_shards`).\n   - *Upside*: Distributes rows extremely evenly across all shards, preventing \"hotspots.\"\n   - *Downside*: Adding a new shard requires moving almost all existing data (mitigated by using **consistent hashing**)."
    },

    {
      type: 'heading',
      content: 'Hands-On: Simple Hash-Based Sharding Simulation',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Here is a simplified example of how an application-level shard router dynamically selects the database connection based on a user ID."
    },
    {
      type: 'code',
      content: `// shardRouter.js
const { Pool } = require('pg');

// Separate independent database server connections
const shardAPool = new Pool({ connectionString: 'postgresql://db-server-even:5432/users_even' });
const shardBPool = new Pool({ connectionString: 'postgresql://db-server-odd:5432/users_odd' });

function getShardPool(userId) {
  // Simple hashing algorithm: Even IDs route to Shard A, Odd to Shard B
  const shardSelector = userId % 2;
  return shardSelector === 0 ? shardAPool : shardBPool;
}

async function getUserById(userId) {
  const pool = getShardPool(userId);
  const query = 'SELECT * FROM users WHERE id = $1';
  
  // Query only the targeted database shard!
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
}

async function createUser(userId, name, email) {
  const pool = getShardPool(userId);
  const query = 'INSERT INTO users(id, name, email) VALUES($1, $2, $3) RETURNING *';
  
  const { rows } = await pool.query(query, [userId, name, email]);
  return rows[0];
}

module.exports = { getUserById, createUser };`,
      metadata: { language: 'javascript', title: 'Shard Router: Modulo Hash-Based Sharding' }
    },

    {
      type: 'heading',
      content: 'The Major Challenges of Sharding',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Sharding provides incredible horizontal scale, but it introduces major architectural complexities:\n\n- **Cross-Shard Joins**: You cannot perform standard SQL `JOIN` queries across independent databases. If you need to join a `orders` table (on Shard A) with a `users` table (on Shard B), you must query them separately and perform the join manually in your application code, which is slow and memory-intensive.\n- **Transaction Loss**: You lose database-enforced atomic transactions (`ACID` compliance) when updating rows on different shards. You must implement complex patterns like **Two-Phase Commit (2PC)** or **Sagas**.\n- **Re-sharding**: When your shards run out of capacity, adding a new database server requires changing the routing formula and physically moving gigabytes of existing data across servers."
    },

    {
      type: 'callout',
      content: "Never shard your database unless it is absolutely necessary. Sharding adds massive complexity, breaks SQL joins, and destroys automatic ACID transactions. Always exhaust other scaling options first: optimize queries, add database indexes, introduce in-memory caching (Redis), scale vertically, and set up read replicas before choosing to shard.",
      metadata: { type: 'warning', title: 'The Golden Rule of Sharding: Avoid it as long as possible' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the difference between vertical partitioning and horizontal sharding?\nA: Vertical partitioning splits a table by columns, separating rarely-used columns into different tables on the same server to optimize memory. Horizontal sharding splits a table by rows, placing different ranges or hashes of rows onto completely separate physical database servers to distribute query and storage load."
    },
    {
      type: 'faq',
      content: "Q: What are the main downsides of database sharding?\nA: Sharding introduces severe architectural limitations: you lose the ability to perform standard relational SQL `JOIN` queries across shards; you lose native, automatic ACID transactions when modifying rows across different databases; and re-sharding (adding new servers) requires highly complex data migrations."
    },
    {
      type: 'faq',
      content: "Q: What is a Shard Key, and how does Hash-Based Sharding work?\nA: A Shard Key is a specific column in a database table (like `user_id` or `tenant_id`) that dictates which physical shard a row belongs to. Hash-based sharding applies a hash function to this key and performs a modulo operation against the number of database shards (e.g. `hash(key) % N`) to route queries and inserts evenly, preventing database server hot-spots."
    }
  ]
};
