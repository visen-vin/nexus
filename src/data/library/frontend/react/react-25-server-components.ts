import type { NoteContent } from '../../../types';
import serverComponentsSvg from '../../../../assets/diagrams/frontend/react/server-components.svg?raw';

export const content: NoteContent = {
  id: 'react-25',
  moduleId: 'react',
  order: 25,
  group: 'Advanced Patterns',
  title: 'React Server Components (RSC)',
  description: 'Deep dive into React Server Components (RSC). Understand the server-client boundary, database queries inside React code, streaming HTML payloads, serializeability constraints, and how RSC compares with and complements traditional Server-Side Rendering (SSR).',
  sections: [
    {
      type: 'text',
      content: 'In traditional single-page React applications (SPAs), every component is executed on the client, which requires downloading, parsing, and executing massive JavaScript bundles. \n\n**React Server Components (RSC)** represents a paradigm shift: it splits React components into two execution environments—**Server Components** and **Client Components**. Server Components execute exclusively on the server, have direct access to database, filesystem, and microservices, and output a lightweight, serialized UI description stream. Because their dependencies are never sent to the browser, RSC solves the "bundle bloat" problem, giving developers an extremely fast initial paint and minimal runtime overhead.'
    },
    {
      type: 'diagram',
      content: serverComponentsSvg
    },
    {
      type: 'callout',
      content: 'RSC does NOT replace Server-Side Rendering (SSR). SSR is a pre-rendering step that transforms a React tree into a static HTML string on the server for initial paint. RSC is a component-execution model that allows parts of the virtual DOM tree to execute on the server and stream structural UI updates dynamically without losing client state (e.g. input focus, scroll position).',
      metadata: { type: 'architecture', title: 'RSC vs. SSR: The Fundamental Distinction' }
    },
    {
      type: 'heading',
      content: 'The Server-Client Boundary',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To define where components execute, React introduces two core directives:\n1. **Server Components (Default)**: All files are treated as Server Components by default. They can perform async data fetching, read files, and write SQL queries directly. They cannot use client-only hooks (`useState`, `useEffect`, `useLayoutEffect`) or standard DOM event handlers.\n2. **Client Components (`\'use client\'`)**: Marked by placing the directive at the top of the file. They are standard React components that run on the client, supports state, effects, browser APIs, and interactive handlers.'
    },
    {
      type: 'heading',
      content: 'RSC Serialization & Prop Constraints',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When a Server Component renders a Client Component, it creates a boundary across which props must be transferred. Because these environments are separated by a network boundary, **all props passed from a Server Component to a Client Component must be fully serializable**.\n\nAllowed types include: primitives, plain objects, arrays, and Promises. Functions (like click callbacks), Map/Set instances, and custom class instances are **not** serializable and will cause severe runtime build crashes if passed across the boundary.'
    },
    {
      type: 'callout',
      content: 'Passing functions from a Server to a Client component is illegal, but there is one exception: Server Actions (functions marked with `\'use server\'`) can be passed as actions to client components to handle form submissions and data updates asynchronously.',
      metadata: { type: 'warning', title: 'The Serialization Barrier' }
    },
    {
      type: 'heading',
      content: 'Production-Grade RSC Composition & DB Fetching',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases a production-grade async Server Component fetching data directly from a database using a generic client layer, handling serialization boundaries, and dynamically composing interactive Client Components by passing Server Components as `children`.'
    },
    {
      type: 'code',
      content: `import React, { Suspense } from 'react';

// ============================================================================
// 1. Mock DB Layer & Data Interfaces (Executes only on Server)
// ============================================================================
export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
}

// Simulated server-only DB fetch
async function dbQueryProducts(): Promise<Product[]> {
  // In a real Server Component, this would be: await db.query('SELECT * FROM products')
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', name: 'Quantum Processor M3', price: 1299, stock: 14 },
        { id: '2', name: 'Holographic Monitor X5', fill: 899, price: 899, stock: 5 },
        { id: '3', name: 'Synaptic Keyboard Elite', price: 299, stock: 0 }
      ]);
    }, 800); // Simulated DB latency
  });
}

// ============================================================================
// 2. Client Component (Requires 'use client' boundary)
// ============================================================================
// This component is written in a client-marked module:
// 'use client';
// import React, { useState } from 'react';
//
// interface CartButtonProps {
//   productId: string;
//   isOutOfStock: boolean;
// }
// export function CartButton({ productId, isOutOfStock }: CartButtonProps) {
//   const [inCart, setInCart] = useState(false);
//   return (
//     <button
//       disabled={isOutOfStock}
//       onClick={() => setInCart(!inCart)}
//       className={\`px-4 py-2 rounded font-bold \${
//         isOutOfStock ? 'bg-gray-700 text-gray-400' : inCart ? 'bg-red-600' : 'bg-blue-600'
//       }\`}
//     >
//       {isOutOfStock ? 'Sold Out' : inCart ? 'Remove from Cart' : 'Add to Cart'}
//     </button>
//   );
// }

// Fake import of our client component for illustration
const CartButton = ({ productId, isOutOfStock }: { productId: string; isOutOfStock: boolean }) => null;

// ============================================================================
// 3. Server Component (Async, Direct Data Fetching, Zero Client Bundle Size)
// ============================================================================
export async function ProductFeed() {
  // Direct DB call! No API gateway, no Axios, no fetch() endpoints.
  const products = await dbQueryProducts();

  return (
    <div className="space-y-4">
      {products.map((product) => (
        <div key={product.id} className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
          <div>
            <h3 className="text-white text-lg font-bold">{product.name}</h3>
            <p className="text-slate-400">\${product.price}</p>
          </div>

          {/* Crossing the Server-Client Boundary: Passing serializable props */}
          <CartButton productId={product.id} isOutOfStock={product.stock === 0} />
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 4. Dynamic Composition: Server Components nested as Children
// ============================================================================
// How to nest a Server Component inside a Client Component without pulling the
// Server Component into the client bundle? Pass it as children!
interface ClientLayoutProps {
  children: React.ReactNode;
}
export function ClientLayout({ children }: ClientLayoutProps) {
  // Client layout handles navigation state, sidebar toggles, etc.
  const [collapsed, setCollapsed] = React.useState(false);
  return (
    <div className="flex">
      <aside className={collapsed ? 'w-12' : 'w-64'}>
        <button onClick={() => setCollapsed(!collapsed)}>Toggle Sidebar</button>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}

// In the root Server Page:
export default function Page() {
  return (
    <ClientLayout>
      <Suspense fallback={<div>Loading Server Feed...</div>}>
        <ProductFeed />
      </Suspense>
    </ClientLayout>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'To render a Server Component inside a Client Component, do NOT import the Server Component directly. Doing so forces the bundler to compile and include it in the client bundle. Instead, structure your layouts to accept `children` (or other slots) as props, and let a parent Server Component pass the Server Component dynamically into the slot.',
      metadata: { type: 'architecture', title: 'Dynamic Composition Rule' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'RSC Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the main structural advantage of React Server Components (RSC) over standard Server-Side Rendering (SSR)?\nA: SSR only pre-renders the initial HTML structure. Once the page is loaded, React must download and parse the entire bundle to hydrate the app, making the bundle size large. In contrast, RSC runs components exclusively on the server, outputting a serialized JSON-like structure. None of the libraries or node modules used strictly inside Server Components are sent to the client, drastically decreasing bundle size and improving initial page interactivity.'
    },
    {
      type: 'faq',
      content: 'Q: What is the "use client" directive and how does it affect component loading?\nA: The "use client" directive marks a module boundary. It tells React that this file and all its imported sub-modules are Client Components that should be bundle-packaged and executed in the browser. Crucially, a component containing "use client" is still pre-rendered to HTML on the server during the initial SSR load; it simply marks where interactive hydration and React state hook capabilities begin.'
    },
    {
      type: 'faq',
      content: 'Q: Why must props passed across the Server-Client boundary be serializable?\nA: Because the server and client represent separate environments that run on different computers (or at different times). To send data from server execution space to the client browser, React must convert the props into a standardized stream format (RSC payload) over the network. Functions, callbacks, and complex prototype chains cannot be represented as serializable strings, which is why passing them causes runtime compilation exceptions.'
    },
    {
      type: 'faq',
      content: 'Q: How do you nest a Server Component inside a Client Component without converting the Server Component into a Client Component?\nA: You must use the "children composition pattern". Instead of importing and rendering the Server Component inside the Client Component directly, design the Client Component to accept a `children` prop (or custom slots). Then, in a parent Server Component, you render the Client Component and pass the Server Component inside its opening and closing tags. This ensures the Server Component is fully evaluated on the server and its output is passed down cleanly as virtual DOM nodes.'
    }
  ]
};
