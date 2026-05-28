import type { NoteContent } from '../../../types';
import errorHandlingSvg from '../../../../assets/diagrams/backend/nodejs/error-handling.svg?raw';

export const content: NoteContent = {
  id: 'node-22',
  moduleId: 'node',
  order: 117,
  group: 'Node.js Core',
  title: 'Centralized Error Handling',
  description: 'Build a production-grade error handling system in Node.js/Express. Learn operational vs programmer errors, custom AppError classes, async wrapper patterns, and global process-level error safety nets.',
  sections: [
    {
      type: 'diagram',
      content: errorHandlingSvg
    },
    {
      type: 'text',
      content: "In production Express applications, error handling cannot be an afterthought. Without a centralized strategy, errors scatter across route handlers — leading to inconsistent HTTP status codes, leaked stack traces, and silent failures that are impossible to debug.\n\nThe foundation of robust error handling rests on a key distinction:\n\n* **Operational Errors**: Expected, predictable failures that arise from runtime conditions — invalid user input (400), missing resources (404), authentication failures (401), or downstream service timeouts. These should be handled gracefully, returning a structured JSON response to the client.\n* **Programmer Errors**: Bugs in the code — TypeError, reading a property of `undefined`, logic errors. These should trigger `process.exit(1)` and a restart (via PM2 or Kubernetes) because the application state is now unknown and untrustworthy."
    },
    {
      type: 'heading',
      content: '1. The AppError Class',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// src/errors/AppError.ts
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Restore prototype chain (required when extending built-ins in TS)
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Domain-specific subclasses — self-documenting throw sites
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(\`\${resource} not found\`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 422);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
  }
}`,
      metadata: { language: 'typescript', title: 'AppError Hierarchy — Typed, Self-Documenting Errors' }
    },
    {
      type: 'heading',
      content: '2. Async Route Wrapper',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Express does not natively catch errors thrown inside `async` route handlers. You must either wrap every handler in a `try/catch` block (verbose), or use a higher-order wrapper function that passes all rejected promises to `next(err)` automatically."
    },
    {
      type: 'code',
      content: `// src/utils/catchAsync.ts
import { Request, Response, NextFunction, RequestHandler } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

// Wraps async route handlers, forwards all rejections to Express error middleware
export const catchAsync = (fn: AsyncHandler): RequestHandler =>
  (req, res, next) => fn(req, res, next).catch(next);

// Usage in router — clean, no try/catch noise
// src/routes/user.routes.ts
import { Router } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { NotFoundError } from '../errors/AppError';
import { UserService } from '../services/user.service';

const router = Router();

router.get('/:id', catchAsync(async (req, res) => {
  const user = await UserService.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json({ data: user });
}));

export default router;`,
      metadata: { language: 'typescript', title: 'catchAsync HOF — Eliminates Boilerplate try/catch' }
    },
    {
      type: 'heading',
      content: '3. Global Error Middleware',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import logger from '../utils/logger'; // Winston/Pino instance

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction // Must have 4 params for Express to recognize as error middleware
): void => {
  // 1. Log every error with context
  logger.error({ err, path: req.path, method: req.method });

  // 2. Operational error — safe to expose message to client
  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // 3. Programmer error — DO NOT leak implementation details
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ status: 'error', message: 'Something went wrong' });
  } else {
    // In development, expose full error for debugging
    res.status(500).json({ status: 'error', message: err.message, stack: err.stack });
  }
};

// app.ts — Register LAST, after all routes
// app.use(globalErrorHandler);`,
      metadata: { language: 'typescript', title: 'Global Error Middleware — The Single Error Processing Point' }
    },
    {
      type: 'heading',
      content: '4. Process-Level Safety Nets',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// src/index.ts — Process-level error handlers for uncaught failures
const server = app.listen(PORT, () => logger.info(\`Server on port \${PORT}\`));

// Unhandled promise rejections (async code outside Express middleware chain)
process.on('unhandledRejection', (reason: Error) => {
  logger.fatal({ reason }, 'UNHANDLED REJECTION — Shutting down');
  server.close(() => process.exit(1)); // Graceful shutdown
});

// Uncaught synchronous exceptions (should never happen if catchAsync is used correctly)
process.on('uncaughtException', (err: Error) => {
  logger.fatal({ err }, 'UNCAUGHT EXCEPTION — Shutting down immediately');
  process.exit(1); // Immediate exit — state is corrupt
});`,
      metadata: { language: 'typescript', title: 'Process Safety Nets — Last Line of Defense' }
    },
    {
      type: 'callout',
      content: "Register `process.on('unhandledRejection')` BEFORE starting the server to ensure even startup failures are captured. In Kubernetes/PM2, always let the process crash and restart rather than swallowing fatal errors — a predictable restart is safer than running with corrupted state.",
      metadata: { type: 'architecture', title: 'Crash-and-Restart Over Swallowing Errors' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the difference between an operational error and a programmer error in Node.js?\nA: An **operational error** is an expected runtime failure — invalid input, missing DB record, network timeout, or authentication failure. It has a defined `statusCode` and is safe to return to the client. A **programmer error** is a bug — a TypeError, accessing `undefined.property`, or a logic flaw. The application state is now unknown, so the correct response is to log it, return a generic 500, and `process.exit(1)` to trigger a clean restart."
    },
    {
      type: 'faq',
      content: "Q: Why does Express error middleware require exactly 4 parameters?\nA: Express uses function arity (`.length` property) to distinguish error-handling middleware from regular middleware. If the function signature only has `(req, res, next)`, Express treats it as a normal middleware. Only when the signature is `(err, req, res, next)` does Express route errors to it. Even if you don't use `next`, you must declare it to satisfy the arity check."
    },
    {
      type: 'faq',
      content: "Q: What happens if you throw an error inside an async Express route handler without a try/catch or catchAsync wrapper?\nA: In Express 4.x, the promise rejection will go **unhandled** and trigger `process.on('unhandledRejection')` instead of routing to the Express error middleware. The client will receive a hung connection that eventually times out. Express 5 (still in RC) natively handles async errors. For Express 4, the `catchAsync` HOF or a library like `express-async-errors` is essential."
    }
  ]
};
