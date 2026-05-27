import type { NoteContent } from '../../../types';
import usedeferredvalueSvg from '../../../../assets/diagrams/frontend/react/usedeferredvalue.svg?raw';

export const content: NoteContent = {
  id: 'react-24',
  moduleId: 'react',
  order: 24,
  group: 'Concurrent Features',
  title: 'useDeferredValue Hook',
  description: 'In-depth analysis of useDeferredValue for deferring slow/expensive parts of the UI, stale-while-revalidate UX patterns, comparison with debouncing/throttling, and performance implications on large component subtrees.',
  sections: [
    {
      type: 'text',
      content: 'In standard single-threaded UI environments, updating the DOM is a blocking operation. When a user input triggers heavy computations or expensive component subtree rendering, the main thread freezes, dropping key frames and leading to sluggish, unresponsive inputs.\n\nIntroduced in React 18, `useDeferredValue` is a concurrent primitive that enables developers to **defer rendering slow parts of the UI**. By maintaining two versions of a value simultaneously, React can instantly commit urgent updates (such as a search input) and complete the expensive recalculations (such as a filtered product list) in a low-priority, interruptible background process.'
    },
    {
      type: 'diagram',
      content: usedeferredvalueSvg
    },
    {
      type: 'callout',
      content: 'Under the hood, `useDeferredValue` utilizes React Fiber\'s double-buffering and priority lane scheduling. During a re-render:\n1. **Urgent Phase**: React runs a high-priority pass using the new input value, but the hook returns the *old* (stale) value. The fast input updates at 60 FPS.\n2. **Concurrent Phase**: React starts a low-priority background render loop. The hook returns the *new* value in memory. If another input change occurs, React yields the thread, aborts the obsolete background render, and restarts with the latest input.\n3. **Commit Phase**: Once the background tree completes preparation, React atomically swaps the pointers, making the updated expensive tree visible instantly.',
      metadata: { type: 'architecture', title: 'Under the Hood: Concurrent Re-rendering' }
    },
    {
      type: 'heading',
      content: 'Debouncing vs. Throttling vs. useDeferredValue',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Traditional throttling and debouncing were the standard mechanisms used to handle heavy computations in the UI. However, they possess several critical drawbacks that `useDeferredValue` elegantly avoids:\n\n| Feature | Throttling | Debouncing | useDeferredValue |\n| :--- | :--- | :--- | :--- |\n| **Delay Mechanism** | Fixed periodic execution interval | Hardcoded delay after user stops typing | No static delay; schedules low-priority work loop |\n| **Responsiveness** | Laggy; periodic UI locks | Artificial delay on all hardware specs | Near-instant on powerful devices; scales gracefully |\n| **Abortability** | Non-abortable (blocks thread once fired) | Non-abortable (blocks thread once timeout ends) | Fully interruptible mid-render by newer interactions |\n| **Visual States** | Hard to synchronize intermediate states | Screen is blank or shows static spinner | Enables "Stale-While-Revalidate" UI with opacity controls |\n| **Device Native** | Ignorant of CPU load and core count | Ignorant of hardware capabilities | Adapts rendering frequency based on client CPU capacity |'
    },
    {
      type: 'heading',
      content: 'Production-Grade Type-Safe Example',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To reap the performance benefits of `useDeferredValue`, the expensive downstream component **must be memoized** using `React.memo` or wrapped in a `useMemo` block. If the component isn\'t memoized, React will still execute a full, slow synchronous render of the entire subtree during the urgent pass, neutralizing the deferred scheduling.\n\nHere is a production-ready, type-safe product filter catalog showcasing the **Stale-While-Revalidate** design pattern:'
    },
    {
      type: 'code',
      content: `import React, { useState, useDeferredValue, memo } from 'react';

// 1. Strict TypeScript Interfaces
export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  rating: number;
}

interface ProductListProps {
  query: string;
  products: Product[];
}

// 2. Heavy Subtree Component - Memoization is CRITICAL
export const ProductList = memo(({ query, products }: ProductListProps) => {
  // Simulate heavy computation (e.g. 100ms algorithmic calculation / massive DOM footprint)
  const startTime = performance.now();
  while (performance.now() - startTime < 100) {
    // Thread blocking simulation
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(query.toLowerCase()) ||
    product.category.toLowerCase().includes(query.toLowerCase())
  );

  if (filteredProducts.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 font-medium">
        No items found matching "{query}"
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-800 border-t border-slate-800">
      {filteredProducts.map(product => (
        <li key={product.id} className="py-4 flex justify-between items-center transition-all">
          <div>
            <h4 className="text-slate-100 font-semibold">{product.name}</h4>
            <p className="text-slate-400 text-sm">{product.category}</p>
          </div>
          <div className="text-right">
            <span className="text-emerald-400 font-mono font-medium">\${product.price.toFixed(2)}</span>
            <div className="text-amber-400 text-xs">★ {product.rating.toFixed(1)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
});

ProductList.displayName = 'ProductList';

// 3. Parent Coordinator Container
export const ProductCatalog: React.FC<{ initialProducts: Product[] }> = ({ initialProducts }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Create a deferred value from the search state
  const deferredSearchQuery = useDeferredValue(searchQuery);
  
  // Detect if the displayed subtree is stale (revalidating in the background)
  const isStale = searchQuery !== deferredSearchQuery;

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
      <div className="mb-6 relative">
        <label htmlFor="catalog-search" className="block text-slate-300 font-semibold mb-2 text-sm uppercase tracking-wider">
          Search Live Catalog
        </label>
        <div className="relative">
          <input
            id="catalog-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type to search (e.g., 'Laptop', 'Headphones')..."
            className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />
          {isStale && (
            <div className="absolute right-4 top-3.5 flex items-center gap-2 text-cyan-400 text-sm">
              <span className="animate-spin h-4 w-4 border-2 border-cyan-400 border-t-transparent rounded-full"></span>
              <span className="font-medium text-xs">Computing...</span>
            </div>
          )}
        </div>
      </div>

      {/* 
        Apply optical staleness styles (opacity reductions) instead of hiding 
        or spinner-blocking the UI, keeping the layout perfectly stable.
      */}
      <div 
        className="transition-opacity duration-200 ease-in-out"
        style={{
          opacity: isStale ? 0.5 : 1,
          pointerEvents: isStale ? 'none' : 'auto'
        }}
      >
        <ProductList query={deferredSearchQuery} products={initialProducts} />
      </div>
    </div>
  );
};`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'If the downstream components are not wrapped in React.memo or useMemo, useDeferredValue will fail completely! This happens because React will execute a fast, high-priority render pass on the parent first, which immediately cascades into the slow child components using the new value, locking up the main thread anyway. You must shield the expensive child with React.memo.',
      metadata: { type: 'warning', title: 'The Memoization Catch' }
    },
    {
      type: 'callout',
      content: 'Never wire useDeferredValue directly to standard text inputs (<input value={deferredValue} />). Text inputs rely on immediate, synchronous, single-frame state updates. Deferring the state of an active text input will result in severe cursor jumping, loss of focus, and an extremely jarring, broken typing experience. Keep input states urgent; defer only the values sent downstream.',
      metadata: { type: 'runtime', title: 'Form Input Integration Warning' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Concurrent Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: How does useDeferredValue interact with React\'s Transition API under the hood, and when should you choose one over the other?\nA: Under the hood, both useDeferredValue and startTransition trigger a concurrent re-render at the same Transition-level priority lane. The key difference lies in their integration vectors. startTransition is imperative: you must wrap the actual event-handler callback or state-setter execution (e.g. startTransition(() => setSearchQuery(val))). useDeferredValue is reactive: it is utilized when you do not control the source state setter (e.g., when the value is passed from a third-party library, custom hook, or parent component) and you want to lazily compute a deferred version of that value.'
    },
    {
      type: 'faq',
      content: 'Q: Explain the exact mechanism by which React interrupts and aborts an in-flight background render when a user types rapidly.\nA: React Fiber breaks up rendering work into tiny, microscopic units of work (individual Fiber nodes) rather than a single recursive call. The scheduler processes these nodes incrementally. Every 5 milliseconds, it checks the frame time budget. If a user presses a key during this time, the browser schedules a main-thread event. React\'s scheduler yields the thread, allowing the browser to capture the keypress. When React resumes, it detects that the source state value has changed. It immediately discards the in-flight, now-obsolete workInProgress tree, and initiates a brand new background render with the updated value, completely avoiding waste.'
    },
    {
      type: 'faq',
      content: 'Q: Does useDeferredValue spawn Web Workers to achieve non-blocking rendering?\nA: No. JavaScript in browser environments remains fundamentally single-threaded. useDeferredValue does not utilize Web Workers or spawn multiple threads. It achieves its non-blocking behavior entirely through cooperative scheduling and time-slicing. By breaking down the render tree traversal into linked-list structures (Fibers) and yielding to the main event loop every 5ms, React allows key user inputs and layout repaints to slot in between rendering ticks.'
    },
    {
      type: 'faq',
      content: 'Q: How does isStale (value !== deferredValue) benefit Core Web Vitals, specifically CLS (Cumulative Layout Shift)?\nA: By comparing the current state value with the deferred value (value !== deferredValue), we can safely keep the old, fully rendered component on screen while lowering its opacity. Traditional loaders destroy the active list and show a spinner, causing the layout to collapse and expand rapidly when the new list loads. This layout oscillation results in high Cumulative Layout Shift (CLS). Retaining the old list at reduced opacity keeps the physical bounds of the element stable, maintaining CLS near zero.'
    }
  ]
};
