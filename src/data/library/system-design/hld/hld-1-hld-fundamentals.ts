import type { NoteContent } from '../../../types';
import diagramSvg from '../../../../assets/diagrams/system-design/hld/hld-architecture.svg?raw';

export const content: NoteContent = {
  id: 'hld-1',
  moduleId: 'hld',
  order: 500,
  group: 'High Level Design',
  title: 'HLD Foundations & Scaling',
  description: 'Learn the architectural principles of designing high-availability systems, horizontal vs vertical scaling, and CAP theorem trade-offs.',
  sections: [
    { type: 'diagram', content: diagramSvg },

    {
      type: 'text',
      content: "When designing software systems at internet scale, writing clean code is only half the battle. You must design a solid **High Level Design (HLD)** architecture that is capable of handling millions of concurrent users, recovering from server crashes automatically, and maintaining low latency.\n\nHLD focuses on the macro-level architecture: how servers, databases, load balancers, and caches interact with each other. In this lesson, we will cover the core principles of horizontal and vertical scaling, stateless app servers, and the fundamental trade-offs described by the CAP theorem."
    },

    {
      type: 'heading',
      content: 'Scaling Strategies: Vertical vs. Horizontal',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "When your web traffic grows beyond the capacity of a single server, you must scale your system. There are two primary strategies:\n\n1. **Vertical Scaling (Scaling Up)**: Adding more hardware power (CPU, RAM, faster SSDs) to your existing single server. \n   - *Pros*: Extremely simple; no code changes required.\n   - *Cons*: Has a hard physical limit; does not solve Single Point of Failure (if that server crashes, the whole app goes down).\n2. **Horizontal Scaling (Scaling Out)**: Adding more servers to your system and distributing the traffic across them using a **Load Balancer**.\n   - *Pros*: Infinite scaling potential; high availability (if one server dies, others handle the load).\n   - *Cons*: Requires stateless application servers; increases architectural complexity."
    },

    {
      type: 'heading',
      content: 'Stateless Application Servers',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "To scale horizontally, your application servers must be **stateless**. This means that a server does not store any user session details or temporary uploads in its local hard drive or RAM.\n\nIf Server #1 holds a user's login session in its memory, and the Load Balancer forwards their next request to Server #2, the user will be logged out instantly! \n\nTo prevent this, all state must be outsourced to centralized, shared databases or memory caches:\n- **User Sessions** -> Shared session store (like Redis).\n- **User Files** -> Distributed object storage (like AWS S3)."
    },

    {
      type: 'heading',
      content: 'The CAP Theorem',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "The **CAP Theorem** states that in any distributed data system, when a network partition (communication failure between servers) occurs, you can only guarantee two out of the following three properties:\n\n- **Consistency (C)**: Every read request receives the most recent write or an error. All database nodes show identical data at the same time.\n- **Availability (A)**: Every non-failing node returns a non-error response for every request (but it might not contain the latest write).\n- **Partition Tolerance (P)**: The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network.\n\nBecause networks are imperfect and *will* partition eventually, a distributed system **must choose Partition Tolerance (P)**. Therefore, you are forced to make a strict design trade-off:\n1. **CP (Consistency + Partition Tolerance)**: Reject requests or wait for sync during a network failure to guarantee correct, identical data (used in banking).\n2. **AP (Availability + Partition Tolerance)**: Accept writes on any available node and sync later. Some users may see slightly stale data temporarily (used in social media feeds)."
    },

    {
      type: 'heading',
      content: 'Core Components of HLD',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A standard highly-scalable high-level design includes the following components:\n\n- **DNS**: Translates user-friendly domain names (e.g. `google.com`) to physical IP addresses.\n- **CDN (Content Delivery Network)**: Cache static assets (HTML, CSS, JS, Images) globally at edge servers close to the user.\n- **Load Balancer**: Distributes incoming HTTP traffic evenly across multiple stateless web servers (e.g., using Round Robin or Least Connections algorithms).\n- **Cache**: Fast, in-memory databases (like Redis or Memcached) storing hot, frequently-accessed database queries to reduce load on the primary SQL database."
    },

    {
      type: 'callout',
      content: "A common high level design mistake is treating the database as an afterthought. While you can easily add 10 more stateless Express servers to handle traffic, scaling your primary SQL database is extremely difficult because it must maintain strict data consistency. Always implement caching and database read replicas before trying to scale out your application servers further.",
      metadata: { type: 'warning', title: 'Critical Architecture Rule: Database is the Ultimate Bottleneck' }
    },

    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the difference between horizontal and vertical scaling?\nA: Vertical scaling (scaling up) means adding more power (CPU, RAM) to a single machine. It is simple but has a physical limit and creates a single point of failure. Horizontal scaling (scaling out) means adding more machines to the network and distributing traffic via a load balancer. It has infinite scaling potential and provides high availability, but requires stateless application design."
    },
    {
      type: 'faq',
      content: "Q: Why must application servers be stateless to scale horizontally?\nA: In a horizontally scaled system, a load balancer distributes user requests across multiple servers. If a server is stateful (stores session info or user files in its local memory or disk), and a subsequent request goes to a different server, that new server won't have the user's data, causing session loss. Storing state centrally in Redis or S3 keeps app servers stateless, allowing them to be added or destroyed seamlessly."
    },
    {
      type: 'faq',
      content: "Q: What does the CAP Theorem state, and why can we never achieve all three in a distributed system?\nA: The CAP Theorem states that a distributed data system can only guarantee two of three properties: Consistency, Availability, and Partition Tolerance. In the real world, network partitions (P) are unavoidable due to physical hardware limits. Therefore, when a partition occurs, a system must choose either to block the request to guarantee Consistency (CP) or serve stale local data to guarantee Availability (AP)."
    }
  ]
};
