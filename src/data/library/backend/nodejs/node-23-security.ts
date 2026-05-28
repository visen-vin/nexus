import type { NoteContent } from '../../../types';
import nodejsSecuritySvg from '../../../../assets/diagrams/backend/nodejs/nodejs-security.svg?raw';

export const content: NoteContent = {
  id: 'node-23',
  moduleId: 'node',
  order: 118,
  group: 'Node.js Core',
  title: 'Node.js Security',
  description: 'Harden Node.js/Express applications against OWASP Top-10 attack vectors. Master input validation, SQL injection prevention, XSS mitigation, rate limiting, security headers via Helmet, and secrets management.',
  sections: [
    {
      type: 'diagram',
      content: nodejsSecuritySvg
    },
    {
      type: 'text',
      content: "Security in Node.js is a layered discipline. No single package or setting makes an application secure — instead, you must apply **defense-in-depth**: multiple independent security controls, each blocking different attack vectors. Even if an attacker bypasses one layer, the remaining layers prevent exploitation.\n\nThe OWASP Top-10 represents the most critical web application security risks, and virtually all of them can be mitigated in a Node.js application through disciplined coding practices and the right dependencies."
    },
    {
      type: 'heading',
      content: '1. Security Headers with Helmet.js',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

const app = express();

// helmet() sets 11 security-critical HTTP response headers automatically
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'nonce-{RANDOM}'"], // Block inline scripts (XSS)
      styleSrc: ["'self'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
    },
  },
  hsts: { maxAge: 31_536_000, includeSubDomains: true, preload: true }, // HTTPS only
  frameguard: { action: 'deny' }, // X-Frame-Options: DENY — blocks clickjacking
  noSniff: true, // X-Content-Type-Options: nosniff
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// CORS — explicitly allowlist origins; never use origin: '*' in production
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));`,
      metadata: { language: 'typescript', title: 'Helmet.js — 11 Security Headers in One Line' }
    },
    {
      type: 'heading',
      content: '2. Rate Limiting & Brute-Force Protection',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redisClient } from './redis';

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per window per IP
  standardHeaders: true,     // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,
  store: new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) }),
  message: { status: 'error', message: 'Too many requests, please try again later.' },
});

// Strict limiter for auth endpoints — prevents credential stuffing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Only 10 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins against limit
});

app.use('/api', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);`,
      metadata: { language: 'typescript', title: 'Rate Limiting — Redis-backed Per-IP Throttling' }
    },
    {
      type: 'heading',
      content: '3. Input Validation & SQL Injection Prevention',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Define strict input schema with Zod
const CreateUserSchema = z.object({
  email: z.string().email().max(254).toLowerCase(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(100).trim(),
  role: z.enum(['user', 'admin']).default('user'),
});

// Route handler with Zod validation
app.post('/api/users', async (req, res, next) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      status: 'error',
      errors: result.error.flatten().fieldErrors,
    });
  }

  const { email, password, name, role } = result.data;

  // Parameterized queries via Prisma ORM — SQL injection is impossible
  // Never use raw string concatenation: \`SELECT * WHERE email = '\${email}'\`
  const user = await prisma.user.create({
    data: { email, name, role, password: await bcrypt.hash(password, 12) },
    select: { id: true, email: true, name: true, role: true }, // Never return password!
  });

  res.status(201).json({ data: user });
});`,
      metadata: { language: 'typescript', title: 'Zod Validation + Parameterized Queries — Zero SQL Injection Risk' }
    },
    {
      type: 'heading',
      content: '4. JWT Security & Secrets Management',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// CRITICAL: Never hardcode secrets. Always load from environment variables.
const JWT_SECRET = process.env.JWT_SECRET!;         // HS256 signing key — min 256 bits
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

// Short-lived access token + long-lived refresh token pattern
const generateTokenPair = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { sub: userId, role },
    JWT_SECRET,
    { expiresIn: '15m', algorithm: 'HS256' } // Short TTL — limits stolen token damage
  );

  const refreshToken = jwt.sign(
    { sub: userId },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );

  return { accessToken, refreshToken };
};

// Password hashing — bcrypt with cost factor 12 (OWASP recommendation)
const hashPassword = (plain: string) => bcrypt.hash(plain, 12);
const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

// Constant-time comparison prevents timing attacks
const safeCompare = (a: string, b: string): boolean =>
  crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));`,
      metadata: { language: 'typescript', title: 'JWT + bcrypt — Secure Auth Implementation' }
    },
    {
      type: 'callout',
      content: "Run `npm audit` regularly and integrate Snyk or Dependabot into your CI pipeline to automatically detect vulnerable dependencies. A perfectly written application can be compromised by a single outdated transitive dependency (e.g., the Log4Shell equivalent in npm). Also store secrets in HashiCorp Vault or AWS Secrets Manager in production — never in `.env` files committed to Git.",
      metadata: { type: 'warning', title: 'Dependency Auditing & Secrets Management' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: How does a Content Security Policy (CSP) header prevent Cross-Site Scripting (XSS) attacks?\nA: A CSP header instructs the browser to **only execute scripts from explicitly allowlisted sources**. Even if an attacker successfully injects a `<script>` tag (e.g., via an XSS vulnerability in a comment field), the browser will refuse to execute it because the injected script's origin doesn't match the CSP whitelist. CSP is configured via the `Content-Security-Policy` response header, which Helmet.js sets automatically with the `contentSecurityPolicy` option."
    },
    {
      type: 'faq',
      content: "Q: Why is parameterized queries (prepared statements) the correct defense against SQL injection rather than input escaping?\nA: Input escaping (manually replacing `'` with `\\'`) is fragile — it depends on correctly identifying every escape character for every database engine. **Parameterized queries** (via Prisma, pg's `$1` placeholders, or knex) solve this at the protocol level: the database driver sends the query structure and data separately, so the DB engine never interprets user data as SQL syntax. It's architecturally impossible to inject SQL this way, regardless of input content."
    },
    {
      type: 'faq',
      content: "Q: What is a timing attack on password comparison, and how does `crypto.timingSafeEqual` prevent it?\nA: A naive string comparison (`a === b`) short-circuits and returns as soon as it finds the first mismatched character. An attacker can measure the time difference between 'password correct up to character 3' vs 'correct up to character 1' to brute-force secrets character-by-character. `crypto.timingSafeEqual` always takes the same amount of time regardless of where the mismatch occurs, making timing analysis statistically meaningless."
    }
  ]
};
