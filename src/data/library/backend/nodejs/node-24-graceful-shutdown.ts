import type { NoteContent } from '../../../types';
import gracefulShutdownSvg from '../../../../assets/diagrams/backend/nodejs/graceful-shutdown.svg?raw';

export const content: NoteContent = {
  id: 'node-24',
  moduleId: 'node',
  order: 119,
  group: 'Node.js Core',
  title: 'Graceful Shutdowns',
  description: 'Implement zero-downtime, zero-data-loss shutdowns in Node.js. Learn SIGTERM/SIGINT handling, HTTP connection draining, database pool cleanup, Kubernetes rolling update compatibility, and force-kill safety nets.',
  sections: [
    {
      type: 'diagram',
      content: gracefulShutdownSvg
    },
    {
      type: 'text',
      content: "When Kubernetes terminates a Pod during a rolling update, or when PM2 restarts a process after a deployment, it sends a **SIGTERM** signal to the Node.js process. By default, Node.js exits immediately — killing any in-flight HTTP requests, abandoning open database transactions, and leaving clients with broken connections.\n\nA **graceful shutdown** intercepts this signal and orchestrates an orderly teardown:\n1. Signal health checks to return `503` (removes the instance from load balancer rotation)\n2. Stop accepting new TCP connections (`server.close()`)\n3. Drain all in-flight HTTP requests to completion\n4. Flush database write queues and release connection pools\n5. Close all resource handles, then call `process.exit(0)`\n\nThis ensures **zero active requests are dropped** and **no data is lost** during redeployments."
    },
    {
      type: 'heading',
      content: '1. Basic SIGTERM Handler',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `import express from 'express';
import { Pool } from 'pg';
import { createClient } from 'redis';

const app = express();
const db = new Pool({ connectionString: process.env.DATABASE_URL });
const redis = createClient({ url: process.env.REDIS_URL });

let isShuttingDown = false;

// Health check endpoint — Kubernetes liveness/readiness probe
app.get('/health', (req, res) => {
  if (isShuttingDown) {
    // Returning 503 causes load balancer to stop routing traffic here
    return res.status(503).json({ status: 'shutting_down' });
  }
  res.json({ status: 'ok', uptime: process.uptime() });
});

const server = app.listen(3000, () => console.log('Server running on :3000'));

// Orchestrated shutdown function
const shutdown = async (signal: string) => {
  console.log(\`[\${signal}] Graceful shutdown initiated...\`);
  isShuttingDown = true;

  // Force-kill safety net — if shutdown takes too long, exit anyway
  const forceExit = setTimeout(() => {
    console.error('Forced shutdown after timeout!');
    process.exit(1);
  }, 30_000);
  forceExit.unref(); // Don't let this timer keep event loop alive

  try {
    // 1. Stop accepting new HTTP connections
    // Existing connections are kept alive until their requests complete
    await new Promise<void>((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
    console.log('HTTP server closed.');

    // 2. Drain database connections
    await db.end();
    console.log('DB pool closed.');

    // 3. Disconnect cache client
    await redis.quit();
    console.log('Redis disconnected.');

    clearTimeout(forceExit);
    console.log('Graceful shutdown complete. Exiting with code 0.');
    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM')); // Kubernetes / PM2 sends this
process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C in development`,
      metadata: { language: 'typescript', title: 'Production Graceful Shutdown — Zero Dropped Requests' }
    },
    {
      type: 'heading',
      content: '2. Handling Keep-Alive Connections',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A critical edge case: `server.close()` only prevents **new** connections. Existing HTTP/1.1 keep-alive connections remain open — clients can keep sending requests on them indefinitely. For a truly graceful shutdown, you must also terminate idle keep-alive connections."
    },
    {
      type: 'code',
      content: `import { IncomingMessage, ServerResponse } from 'http';

// Track all active connections
const connections = new Set<any>();

server.on('connection', (socket) => {
  connections.add(socket);
  socket.on('close', () => connections.delete(socket));
});

// Destroy idle keep-alive connections during shutdown
const destroyIdleConnections = () => {
  for (const socket of connections) {
    // Only destroy if no active request is being processed
    const res: ServerResponse = (socket as any)._httpMessage;
    if (!res || res.finished) {
      socket.destroy();
      connections.delete(socket);
    }
  }
};

// Enhanced shutdown — handles keep-alive connections
const shutdown = async (signal: string) => {
  isShuttingDown = true;

  // First: close server (stops new connections)
  server.close(() => console.log('Server closed'));

  // Second: destroy all idle keep-alive connections
  destroyIdleConnections();

  // Interval to clean up connections as their requests finish
  const interval = setInterval(destroyIdleConnections, 1000);

  // Then drain DB and cache as before...
  await db.end();
  await redis.quit();

  clearInterval(interval);
  process.exit(0);
};`,
      metadata: { language: 'typescript', title: 'Tracking & Destroying Keep-Alive Connections' }
    },
    {
      type: 'heading',
      content: '3. Kubernetes Lifecycle Hooks',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `# kubernetes/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: node-api
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 30  # K8s waits this long before SIGKILL
      containers:
        - name: node-api
          image: node-api:latest
          lifecycle:
            preStop:
              exec:
                # Sleep 5s BEFORE SIGTERM — allows load balancer to drain traffic first
                # This prevents the 'race condition' where K8s sends traffic to a dying pod
                command: ["/bin/sh", "-c", "sleep 5"]
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            periodSeconds: 5
            failureThreshold: 3
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10`,
      metadata: { language: 'yaml', title: 'Kubernetes — preStop Hook & Grace Period Configuration' }
    },
    {
      type: 'callout',
      content: "The `preStop` sleep hook is essential in Kubernetes. Without it, there is a race condition: Kubernetes removes the Pod from the Service endpoints (stopping traffic), but the load balancer's cache may still route requests to the pod for 1-3 seconds after SIGTERM is sent. The `sleep 5` in `preStop` ensures the pod keeps running long enough for all load balancers to drain before shutdown begins.",
      metadata: { type: 'architecture', title: 'The Kubernetes preStop Race Condition' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the difference between SIGTERM and SIGKILL, and why can't you catch SIGKILL?\nA: **SIGTERM** (signal 15) is a polite termination request that can be caught, handled, and used to trigger graceful shutdown logic. **SIGKILL** (signal 9) is a hard, unconditional termination sent by the OS kernel — it immediately destroys the process memory without giving any code a chance to run. You cannot register a handler for SIGKILL (`process.on('SIGKILL')` throws an error). This is why `terminationGracePeriodSeconds` in Kubernetes is critical: if your app doesn't exit within that window, K8s escalates to SIGKILL."
    },
    {
      type: 'faq',
      content: "Q: Why does calling server.close() alone not guarantee a complete graceful shutdown?\nA: `server.close()` only stops the server from accepting new TCP connections. However, **existing HTTP keep-alive connections** remain open and clients can continue sending new requests on them. For a truly graceful shutdown, you must also track all active sockets and close idle keep-alive connections while allowing active requests to complete. Without this, the process may remain alive indefinitely waiting for clients to close their keep-alive connections."
    },
    {
      type: 'faq',
      content: "Q: How do you prevent data loss when shutting down a Node.js server that has pending database writes?\nA: First, ensure all database operations use proper transactions that are either committed or rolled back — never left in-flight. During shutdown, after `server.close()` prevents new requests, wait for all in-progress database operations to complete before calling `db.pool.end()`. A timeout (e.g., 30 seconds via `setTimeout`) acts as a safety net to prevent the process hanging forever if a transaction stalls. Message queues like BullMQ should also have their workers drained before shutdown."
    }
  ]
};
