import type { NoteContent } from '../../../types';
import ssrConnectionSvg from '../../../../assets/diagrams/backend/nodejs/ssr-connection.svg?raw';

export const content: NoteContent = {
  id: 'node-25',
  moduleId: 'node',
  order: 120,
  group: 'Node.js Core',
  title: 'RSC & SSR with Node.js',
  description: 'Understand how React Server Components and SSR connect to Node.js backends. Master renderToPipeableStream, Suspense streaming, RSC payload serialization, hydration mechanics, and the server-client component boundary.',
  sections: [
    {
      type: 'diagram',
      content: ssrConnectionSvg
    },
    {
      type: 'text',
      content: "React Server Components (RSC) and Server-Side Rendering (SSR) represent a fundamental shift in how React applications connect to Node.js backends. Instead of the traditional SPA pattern (client fetches data via REST APIs after rendering), RSC allows React components to **run directly on the Node.js server**, query databases and APIs directly, and stream the resulting HTML to the browser.\n\nThis eliminates entire categories of client-server roundtrips, reduces JavaScript bundle sizes dramatically, and enables a much simpler data fetching model — but it requires understanding the new server/client component boundary and how Node.js powers the rendering pipeline."
    },
    {
      type: 'heading',
      content: '1. SSR with renderToPipeableStream',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "The Node.js `renderToPipeableStream` API is the modern replacement for `renderToString`. Unlike `renderToString` (which blocks until the entire tree is rendered), `renderToPipeableStream` uses Node.js streams to progressively send HTML to the client as React resolves Suspense boundaries."
    },
    {
      type: 'code',
      content: `// server/renderer.ts — Custom Node.js SSR renderer
import { renderToPipeableStream } from 'react-dom/server';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { createElement } from 'react';
import App from './App'; // Your React root component

const server = createServer((req: IncomingMessage, res: ServerResponse) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked'); // Enable HTTP streaming

  const { pipe, abort } = renderToPipeableStream(
    createElement(App, { url: req.url }),
    {
      // bootstrapScripts: Tell the browser which JS bundle to load for hydration
      bootstrapScripts: ['/static/client.js'],

      onShellReady() {
        // Shell = HTML outside Suspense boundaries — send immediately
        // Browser can start rendering BEFORE async data is ready
        res.statusCode = 200;
        pipe(res); // Pipe React's HTML stream directly to HTTP response
      },

      onShellError(err) {
        // Shell failed — fallback to client-side render
        console.error('SSR Shell Error:', err);
        res.statusCode = 500;
        res.end('<html><body>Loading...</body></html>');
      },

      onError(err) {
        // Log async errors (inside Suspense boundaries) without crashing
        console.error('SSR Async Error:', err);
      },
    }
  );

  // Abort if client disconnects (saves server resources)
  req.on('close', () => abort());

  // Abort after timeout to prevent hanging responses
  setTimeout(() => abort(), 10_000);
});

server.listen(3000);`,
      metadata: { language: 'typescript', title: 'renderToPipeableStream — Streaming HTML from Node.js' }
    },
    {
      type: 'heading',
      content: '2. React Server Components — Data Fetching Without APIs',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// app/products/page.tsx — React Server Component (Next.js App Router)
// No 'use client' directive = Server Component by default
import { prisma } from '@/lib/db';
import { cache } from 'react'; // React's built-in request-scoped memoization
import { Suspense } from 'react';

// cache() deduplicates identical DB calls within the same request
const getProducts = cache(async (categoryId: string) => {
  return prisma.product.findMany({
    where: { categoryId, inStock: true },
    select: { id: true, name: true, price: true, imageUrl: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
});

// This component runs on Node.js — can directly access DB, filesystem, secrets
// Zero client JS bundle contribution from this component
export default async function ProductsPage({ params }: { params: { categoryId: string } }) {
  // Direct DB query — no REST API needed, no useEffect, no loading states
  const products = await getProducts(params.categoryId);

  return (
    <main>
      <h1>Products</h1>
      {/* Suspense boundary — server streams HTML here, client gets fallback until ready */}
      <Suspense fallback={<ProductSkeleton count={20} />}>
        {/* ProductReviews also fetches independently — won't block ProductList */}
        <ProductList products={products} />
      </Suspense>
    </main>
  );
}

// 'use client' — This component runs in browser, can use hooks/state/events
'use client';
import { useState } from 'react';

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);
  // This component's code IS sent to the browser
  return (
    <button onClick={() => handleAddToCart(productId, setLoading)} disabled={loading}>
      {loading ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}`,
      metadata: { language: 'typescript', title: 'RSC Data Fetching — Direct DB Access from Server Components' }
    },
    {
      type: 'heading',
      content: '3. RSC Payload & Hydration',
      metadata: { level: 2 }
    },
    {
      type: 'code',
      content: `// Next.js App Router sends TWO things to the browser:
//
// 1. HTML Stream — The pre-rendered HTML for instant display
//    <div id="root"><h1>Products</h1><div class="product-list">...</div></div>
//
// 2. RSC Payload — A serialized JSON-like tree describing the component structure
//    Used by React to 'hydrate' the HTML and make it interactive
//    React reconciles this payload against the server-rendered DOM

// The RSC payload looks like this (simplified):
// ["$","main",null,{"children":[
//   ["$","h1",null,{"children":"Products"}],
//   ["$","$L1",null,{"products":[...]}]  // Client component reference
// ]}]

// API Route Handler — Node.js edge/server function
// app/api/cart/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { productId, quantity } = await req.json();

  const cartItem = await prisma.cartItem.upsert({
    where: { userId_productId: { userId: session.user.id, productId } },
    update: { quantity: { increment: quantity } },
    create: { userId: session.user.id, productId, quantity },
  });

  return NextResponse.json({ data: cartItem }, { status: 201 });
}`,
      metadata: { language: 'typescript', title: 'RSC Payload Hydration & API Route Handlers in Next.js' }
    },
    {
      type: 'callout',
      content: "The critical mental model: **Server Components** run on Node.js and produce HTML + RSC payload (no JS sent to browser). **Client Components** (`'use client'`) run first on the server for SSR, then hydrate in the browser (JS IS sent). The boundary between them is the `'use client'` directive. Pass only serializable data (plain objects, arrays, primitives) across this boundary — functions, class instances, and non-serializable values cannot cross from server to client components.",
      metadata: { type: 'architecture', title: 'Server-Client Component Boundary Rules' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the fundamental difference between React Server Components (RSC) and traditional Server-Side Rendering (SSR)?\nA: Traditional SSR (e.g., `renderToString`) renders the **entire React tree** to an HTML string on the server once — server components and client components are indistinguishable; all component code is bundled and sent to the browser. **RSC** introduces a permanent distinction: Server Components run **exclusively on Node.js**, never in the browser, and their code is never sent to the client bundle. They can access databases/secrets directly. Client Components are marked with `'use client'` and run in both environments (SSR on server, hydration in browser)."
    },
    {
      type: 'faq',
      content: "Q: What does 'hydration' mean, and what is 'hydration mismatch'?\nA: **Hydration** is the process by which React's client-side JavaScript 'attaches' event listeners and React state to server-rendered HTML. React traverses the DOM comparing it to its component tree (using the RSC payload) and adds interactivity without re-rendering the HTML. A **hydration mismatch** occurs when the server-rendered HTML doesn't match what React would render on the client — commonly caused by using `Date.now()`, `Math.random()`, or browser-only APIs in server components. React will log a warning and re-render on the client, negating SSR performance benefits."
    },
    {
      type: 'faq',
      content: "Q: How does renderToPipeableStream improve performance over renderToString?\nA: `renderToString` is **synchronous and blocking** — it renders the complete React tree before sending a single byte to the client. If a component is awaiting slow data (e.g., a 500ms DB query), the entire response is held up. `renderToPipeableStream` uses Node.js streams and React's Suspense to **progressively stream** HTML chunks: the outer shell (nav, layout) is sent immediately while Suspense boundaries resolve independently and stream their HTML as data becomes available. This dramatically reduces Time to First Byte (TTFB) and Time to Interactive (TTI) for data-heavy pages."
    }
  ]
};
