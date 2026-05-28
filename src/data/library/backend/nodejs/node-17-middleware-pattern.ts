import type { NoteContent } from '../../../types';
import middlewarePatternSvg from '../../../../assets/diagrams/backend/nodejs/middleware-pattern.svg?raw';

export const content: NoteContent = {
  id: 'node-17',
  moduleId: 'node',
  order: 112,
  group: 'Node.js Core',
  title: 'The Middleware Pattern',
  description: 'Uncover the architectural foundation of Node.js web frameworks. Master Express-style sequential middleware chains, understand next() boundaries, and learn to write robust error-handling pipelines.',
  sections: [
    {
      type: 'diagram',
      content: middlewarePatternSvg
    },
    {
      type: 'text',
      content: "Node.js web frameworks like Express and Koa rely on a single central architectural concept: the **Middleware Pattern**.\n\nRather than executing request routing in a single massive controller block, the middleware pattern structures your application as a **pipeline of small, focused functions**. Each middleware function has access to the Request object, the Response object, and the next middleware function in the execution chain."
    },
    {
      type: 'heading',
      content: '1. The Middleware Chain & next() Boundaries',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "When a request hits your server, it passes sequentially through your registered middleware array. Each middleware can perform calculations, attach metadata properties to the `req` object, or validate credentials. \n\nTo pass execution to the next middleware in the chain, you must explicitly call the **`next()`** function. If a middleware does not call `next()` and does not terminate the request (e.g. by calling `res.send()`), the connection will hang indefinitely, eventually timing out."
    },
    {
      type: 'heading',
      content: '2. Error-Handling Middleware',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Under standard Express rules, if a middleware encounters an error, it signals the pipeline to stop and skip directly to the centralized error handler by calling **`next(err)`** with the error object as the first parameter.\n\nCentralized error middleware has a unique **4-argument function signature**: **`(err, req, res, next)`**. The presence of exactly four arguments is how the framework distinguishes error-handling middleware from standard middleware, letting it safely catch all upstream pipeline failures."
    },
    {
      type: 'code',
      content: `// Express-style Middleware execution pipeline
import express, { Request, Response, NextFunction } from 'express';
const app = express();

interface AuthenticatedRequest extends Request {
  userId?: string;
  requestId?: string;
}

// 1. Standard Middleware: Generates a Request ID
app.use((req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  req.requestId = Math.random().toString(36).substring(2, 9);
  console.log(\`[Request \${req.requestId}] Incoming: \${req.method} \${req.url}\`);
  next(); // Pass execution to the next middleware!
});

// 2. Authentication Guard Middleware
const authGuard = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    // Pass the error downstream to the error handler!
    return next(new Error('Unauthorized Access - Token Missing'));
  }
  req.userId = 'user_123';
  next();
};

app.get('/dashboard', authGuard, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    status: 'success',
    requestId: req.requestId,
    userId: req.userId
  });
});

// 3. Centralized Error Handler (4-argument signature)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Captured Pipeline Error:', err.message);
  res.status(err.message.includes('Unauthorized') ? 401 : 500).json({
    status: 'error',
    message: err.message
  });
});

app.listen(3000);`,
      metadata: { language: 'typescript', title: 'Express-style Middleware and Error Handler Pipeline' }
    },
    {
      type: 'callout',
      content: "In Express 4, standard middleware cannot automatically catch unhandled errors from asynchronous functions (like failed async/await database calls). If an async operation fails inside a middleware, you must wrap it in a `try/catch` block and manually forward it using `next(err)`. Forgetting to do so will result in an unhandled promise rejection that can crash your Node.js process.",
      metadata: { type: 'warning', title: 'Asynchronous Middleware gotchas' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What happens if a middleware function forgets to invoke next() and does not end the response?\nA: If a middleware does not call `next()` and does not send a response back via `res.send()` / `res.end()`, the request-response pipeline stalls. The client request hangs indefinitely, maintaining the physical TCP connection until the client or server timeout threshold is reached."
    },
    {
      type: 'faq',
      content: "Q: How does Express distinguish error-handling middleware from standard middleware?\nA: Express distinguishes error-handling middleware strictly by checking the **arity** (number of defined arguments) of the function callback using JavaScript's `Function.length` property. Standard middleware accepts 3 arguments `(req, res, next)`, whereas error middleware must declare exactly **4 arguments** `(err, req, res, next)`."
    },
    {
      type: 'faq',
      content: "Q: Why is calling next(err) critical for handling asynchronous errors in Express 4?\nA: Express 4's internal routing engine is fully synchronous. If a runtime error is thrown asynchronously inside an `async/await` promise or callback handler, Express cannot catch it. You must explicitly catch the error inside a `try/catch` block and pass it to `next(err)` to route it to your centralized error handler."
    }
  ]
};
