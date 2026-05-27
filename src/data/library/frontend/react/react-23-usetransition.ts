import type { NoteContent } from '../../../types';
import usetransitionSvg from '../../../../assets/diagrams/frontend/react/usetransition.svg?raw';

export const content: NoteContent = {
  id: 'react-23',
  moduleId: 'react',
  order: 23,
  group: 'Concurrent Features',
  title: 'useTransition Hook',
  description: 'Detailed exploration of useTransition for non-blocking state updates, fiber priority lanes, transition execution queue, and comparing transition rendering with traditional debouncing and throttling.',
  sections: [
    {
      type: 'text',
      content: 'In traditional React (v17 and earlier), all state updates were treated as urgent. When a state update triggered a heavy re-render—such as filtering a large table or rendering complex data visualisations—the main thread would block synchronously. During this time, the page was completely unresponsive: keystrokes were ignored, hover effects froze, and the UI felt sluggish. \n\nIntroduced in React 18, **Concurrent Mode** and the `useTransition` hook revolutionize this behavior by allowing developers to categorize state updates into two groups: **Urgent Updates** (like typing, clicking, or dragging) and **Transition Updates** (like switching tabs or rendering search results).'
    },
    {
      type: 'diagram',
      content: usetransitionSvg
    },
    {
      type: 'callout',
      content: 'A **Transition Update** is a non-blocking state update. By wrapping a state setter in `startTransition`, you instruct React to lower its priority. The scheduler will slice the rendering work into small chunks, yielding the main thread to ensure high-priority user actions are processed instantly.',
      metadata: { type: 'architecture', title: 'The Core Concept of Transitions' }
    },
    {
      type: 'heading',
      content: 'The Mechanics Under the Hood: Fiber Priority Lanes',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Underpinning React\'s concurrent engine is the **Lanes model**. Lanes are a 32-bit bitmask system where each bit represents a specific category of priority. React assigns different updates to specific lanes:\n\n1. **Sync Lane / Discrete Lanes**: Reserved for immediate user interactions (e.g., keyboard input, clicks). These must run to completion synchronously.\n2. **Transition Lanes**: Reserved for `useTransition` updates. These run with low priority and are fully interruptible.\n\n### The Interruptible Render Cycle\nDuring the Render phase, the **Fiber Scheduler** processes the `workInProgress` tree. If React is rendering a transition update and the user types a new character, the browser registers a discrete input event. Because input events map to the high-priority Sync Lane, React\'s scheduler detects a pending higher-priority update.\n\nReact immediately **pauses or discards** the low-priority rendering of the transition tree, context-switches back to process the high-priority input event, renders the input state change, and commits it to the DOM (updating the input field instantly). Only then does it restart or resume rendering the low-priority transition work.'
    },
    {
      type: 'callout',
      content: 'React does not just "pause and resume" the interrupted transition tree in place. If the high-priority state update altered data that the transition depends on, the ongoing render work is discarded completely, and React restarts the render phase from the root of the transition with the fresh state.',
      metadata: { type: 'runtime', title: 'Why Discard and Restart Matters' }
    },
    {
      type: 'heading',
      content: 'Comparing Approaches: Transition vs. Debouncing vs. Throttling',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Developers often confuse `useTransition` with traditional performance techniques like debouncing or throttling. While they address similar symptoms, their underlying mechanics and UX results are vastly different.'
    },
    {
      type: 'text',
      content: '| Capability / Metric | Debouncing / Throttling | useTransition (Concurrent Rendering) |\n| :--- | :--- | :--- |\n| **Mechanism** | Delays execution by an arbitrary time delay (e.g., 300ms). | Starts rendering *immediately* but interruptibly without arbitrary delays. |\n| **Main Thread Blocking** | Yes. Once the timeout fires, the render blocks the main thread synchronously. | No. React yields the thread every 5ms to keep the browser responsive. |\n| **Interruption** | Cannot be interrupted once execution starts. | Fully interruptible by high-priority user actions at any point. |\n| **UX Feel** | Keyboards lag or stutter during heavy list rendering after the delay. | Keyboard typing is 100% smooth, lists render progressively or when ready. |\n| **Visual States** | Requires manual state management for loading spinners. | Provides built-in `isPending` state indicating background work is active. |'
    },
    {
      type: 'callout',
      content: 'Do not use `useTransition` or `useDeferredValue` for network debouncing. If you want to delay an API call to prevent spamming your backend server, **debouncing** is still the correct choice. Use `useTransition` when the bottleneck is **CPU-bound rendering work** on the client.',
      metadata: { type: 'warning', title: 'Network vs CPU Bottlenecks' }
    },
    {
      type: 'heading',
      content: 'Production-Grade Implementation: Search Filter Catalog',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Below is a type-safe, production-ready React component showing how to use `useTransition` to build a highly responsive product search filter that handles heavy rendering operations gracefully.'
    },
    {
      type: 'code',
      content: `import React, { useState, useTransition, useMemo } from 'react';

// 1. Define strict type interfaces
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
}

// 2. Generate a large synthetic dataset (CPU-heavy filter target)
const generateMockProducts = (count: number): Product[] => {
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'];
  return Array.from({ length: count }, (_, i) => ({
    id: \`prod-\${i}\`,
    name: \`Product \${i + 1} - Premium Model\`,
    category: categories[i % categories.length],
    price: parseFloat((Math.random() * 1000).toFixed(2)),
    description: \`High-performance item designed for extreme reliability. Product ID: \${i}\`,
  }));
};

const ALL_PRODUCTS = generateMockProducts(15000); // 15k items

export const SearchCatalog: React.FC = () => {
  // Urgent state: Keeps the input element immediately responsive
  const [inputValue, setInputValue] = useState<string>('');
  
  // Transition state: Defer actual filtering and re-rendering of results
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // useTransition gives us:
  // - isPending: boolean (true while transition renders in memory)
  // - startTransition: function (declares low-priority state change)
  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // ACTION 1 (Urgent): Update input field instantly
    setInputValue(value);

    // ACTION 2 (Low-Priority): Wrap filtering state in transition
    startTransition(() => {
      // React will schedule this state change at low-priority
      setSearchQuery(value);
    });
  };

  // Perform expensive filter operation based on transition state
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return ALL_PRODUCTS;
    
    // Simulate high CPU computation workload inside render
    return ALL_PRODUCTS.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h3>Catalog Search Engine</h3>
        <p style={styles.subtext}>Demonstrating React 18 Concurrency using 15,000 Items</p>
      </header>

      <div style={styles.searchBox}>
        <input
          type="text"
          value={inputValue}
          onChange={handleSearchChange}
          placeholder="Type to search products..."
          style={styles.input}
          id="product-search-input"
        />
        {/* Visual feedback indicating rendering is running in the background */}
        {isPending && (
          <span style={styles.spinner} id="search-pending-indicator">
            Updating Catalog...
          </span>
        )}
      </div>

      <div style={{ ...styles.resultsContainer, opacity: isPending ? 0.7 : 1 }}>
        <div style={styles.metaInfo}>
          <span>Showing {filteredProducts.length} products</span>
          {isPending && <span style={styles.pendingText}>Rendering concurrent frames...</span>}
        </div>

        <ul style={styles.list} id="product-results-list">
          {filteredProducts.slice(0, 100).map(product => (
            <li key={product.id} style={styles.listItem}>
              <div style={styles.itemHeader}>
                <span style={styles.itemName}>{product.name}</span>
                <span style={styles.itemCategory}>{product.category}</span>
              </div>
              <p style={styles.itemDesc}>{product.description}</p>
              <span style={styles.itemPrice}>\${product.price}</span>
            </li>
          ))}
          {filteredProducts.length > 100 && (
            <li style={styles.listFooter}>
              Showing top 100 results. Refine your query for more.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

// Clean styling system avoiding generic colors
const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#0F172A',
    borderRadius: '12px',
    color: '#F8FAFC',
    fontFamily: 'Inter, system-ui, sans-serif',
    maxWidth: '700px',
    margin: '0 auto',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    border: '1px solid #1E293B',
  },
  header: {
    marginBottom: '20px',
  },
  subtext: {
    color: '#64748B',
    fontSize: '13px',
    marginTop: '4px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative' as const,
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#1E293B',
    border: '1px solid #334155',
    color: '#FFFFFF',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  spinner: {
    fontSize: '12px',
    color: '#38BDF8',
    fontStyle: 'italic',
  },
  resultsContainer: {
    marginTop: '20px',
    transition: 'opacity 0.2s ease',
  },
  metaInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: '#94A3B8',
    marginBottom: '10px',
  },
  pendingText: {
    color: '#F59E0B',
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0,
    maxHeight: '400px',
    overflowY: 'auto' as const,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
  },
  listItem: {
    padding: '14px',
    backgroundColor: '#1E293B',
    borderRadius: '8px',
    borderLeft: '4px solid #38BDF8',
    transition: 'transform 0.15s',
  },
  itemHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontWeight: 'bold',
    color: '#F1F5F9',
  },
  itemCategory: {
    fontSize: '11px',
    backgroundColor: '#0F172A',
    padding: '3px 8px',
    borderRadius: '12px',
    color: '#38BDF8',
    border: '1px solid #334155',
  },
  itemDesc: {
    fontSize: '12px',
    color: '#94A3B8',
    margin: '6px 0',
  },
  itemPrice: {
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#10B981',
  },
  listFooter: {
    textAlign: 'center' as const,
    padding: '12px',
    color: '#64748B',
    fontSize: '12px',
    fontStyle: 'italic',
  },
};`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'FAANG-Level Concurrency Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: How does useTransition differ from useDeferredValue? When should you use which?\nA: Both hooks defer rendering to a lower priority, but they are used in different scenarios based on where state control resides. \n- Use `useTransition` when you have direct access to the state-setting function (e.g., `startTransition(() => setCount(c => c + 1))`). It provides a direct loading status via `isPending`.\n- Use `useDeferredValue` when you do not control the state setter (e.g., you receive a value as a prop from a parent component or a third-party library). It creates a low-priority clone of that value that trails the original.'
    },
    {
      type: 'faq',
      content: 'Q: Why does React discard the in-progress transition tree and re-run rendering from scratch when interrupted by a high-priority update?\nA: React ensures strict consistency and safety. When a high-priority update occurs (e.g., a keystroke changes search input to "A" then "B"), the state dependencies have changed. Continuing to render the "A" transition is wasteful because its output is already stale. By instantly discarding the stale tree and starting the "B" transition from the root, React prevents rendering visual tearing and incorrect, outdated UI states.'
    },
    {
      type: 'faq',
      content: 'Q: Can you perform asynchronous operations (like fetch calls) inside startTransition?\nA: No. The callback passed to `startTransition` must be completely synchronous. Within this callback, you must only execute state-setting functions (e.g., `setValue()`). React runs the callback immediately to discover which state updates are transition-bound, mapping them to the lower-priority lanes. If you try to run async calls (like `setTimeout` or `await fetch()`) inside the callback, React will not catch the delayed state setters, and they will execute at high priority instead.'
    },
    {
      type: 'faq',
      content: 'Q: What is the technical overhead of useTransition? Why shouldn\'t we wrap every state update in a transition?\nA: While extremely efficient, transitions do carry architectural overhead:\n1. **Memory & Double-Buffering**: To allow interruptible rendering, React keeps both the current committed tree and the workInProgress transition tree in memory. Offloading every update to transitions increases memory allocation and GC strain.\n2. **Double Render overhead**: When a transition triggers, React performs a synchronous high-priority render (to set `isPending` to `true`), and then schedules the actual state update inside the low-priority Lane. If an update is tiny, this adds an unnecessary rendering pass.'
    }
  ]
};
