import type { NoteContent } from '../../../types';
import codeSplittingSvg from '../../../../assets/diagrams/frontend/react/code-splitting.svg?raw';

export const content: NoteContent = {
  id: 'react-18-code-splitting',
  moduleId: 'react',
  order: 18,
  group: 'Performance & Architecture',
  title: 'React 18 Code-Splitting & Suspense',
  description: 'Deep dive into bundle optimization, dynamic imports, React.lazy lifecycle, Suspense error boundary architectures, prefetching strategies, and bundle size profiling.',
  sections: [
    {
      type: 'text',
      content: 'As modern web applications grow, initial load bundles can balloon, leading to elevated **Time to Interactive (TTI)** and poor user experience, especially on mobile networks. **Code-splitting** is an architectural technique that breaks a single large compiled JavaScript bundle into smaller, highly cohesive asynchronous chunks loaded strictly on demand.\n\nReact 18, combined with modern bundlers like Vite (Rollup) or Webpack, handles code-splitting natively using **dynamic imports**, **`React.lazy`**, and **`Suspense` boundaries** to manage async loading states gracefully.'
    },
    {
      type: 'diagram',
      content: codeSplittingSvg
    },
    {
      type: 'heading',
      content: 'Dynamic Imports & Bundler Mechanics',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Under the hood, code-splitting starts with the ECMAScript dynamic `import()` statement. When a bundler encounters `import()`, it automatically treats the imported module as a split point, placing it and its unique dependencies in a separate chunk file.\n\nFor example, in a Vite/Rollup environment, dynamic imports generate files named `[name]-[hash].js`. You can use magic comments or configuration to name these chunks for easier production debugging.'
    },
    {
      type: 'code',
      content: `// Dynamic import in Vanilla JS
import('./analytics-utils').then((module) => {
  module.trackEvent('page_view');
});

// Specifying custom chunk name in Webpack (Magic Comments)
const HeavyChart = React.lazy(() => 
  import(/* webpackChunkName: "dashboard-charts" */ './HeavyChart')
);`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Dynamic imports return standard JS Promises. If the network request fails (due to offline status or server chunk-rotation after a deploy), the dynamic import Promise rejects. Always wrap code-split components in an Error Boundary to prevent the entire React application from crashing.',
      metadata: { type: 'warning', title: 'Network Failures & Unhandled Rejections' }
    },
    {
      type: 'heading',
      content: 'Implementing Dynamic Imports: Error Boundaries & Suspense',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Here is a robust, production-ready, type-safe implementation of a code-split component wrapper. This example demonstrates React 18 `Suspense`, custom fallback spinner, and a robust Class-based `ErrorBoundary` handling chunk loading failures.'
    },
    {
      type: 'code',
      content: `import React, { Component, Suspense, ErrorInfo, ReactNode } from 'react';

// 1. Robust Type-Safe Error Boundary for Code-Split Loading Failures
interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class SafeErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render shows the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Code-splitting chunk loading failed:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.state.fallback;
    }
    return this.children;
  }
}

// 2. React.lazy expects default export. Let's lazily import the component.
// We simulate a heavy visual component here.
const LazyVisualizer = React.lazy(() => import('./VisualizerComponent'));

// 3. Wrapping the Lazy Component inside Suspense + ErrorBoundary
export default function SafeVisualizer() {
  return (
    <SafeErrorBoundary 
      fallback={
        <div className="error-card">
          <h4>Failed to load visualizer</h4>
          <p>Please check your internet connection and try reloading the page.</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      }
    >
      <Suspense fallback={<div className="loading-spinner">Loading Visualization Engine...</div>}>
        <LazyVisualizer />
      </Suspense>
    </SafeErrorBoundary>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'React.lazy currently supports components exported as default only. If you need to import a component using a named export, you must resolve the promise with an object containing default export manually.',
      metadata: { type: 'architecture', title: 'Importing Named Exports' }
    },
    {
      type: 'code',
      content: `// Workaround to load a named export dynamically via React.lazy
const LazyChart = React.lazy(() => 
  import('./Charts').then(module => ({ default: module.BarChart }))
);`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Advanced Optimizations: Prefetching & Preloading',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Waiting for a user to click a button or navigate to a route before downloading a chunk adds noticeable latency. We can optimize this by **prefetching** or **preloading** files when the application is idle or when a hover event implies intent.'
    },
    {
      type: 'code',
      content: `// 1. Dynamic Script / Link Tag Preloading
export function prefetchComponent(chunkUrl: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'script';
  link.href = chunkUrl;
  document.head.appendChild(link);
}

// 2. Intent-Based React.lazy Preloader wrapper
const componentLoader = () => import('./HeavyAnalytics');
const LazyAnalytics = React.lazy(componentLoader);

export function AnalyticsPage() {
  const handleHover = () => {
    // Eagerly trigger bundler import fetching before user clicks
    componentLoader();
  };

  return (
    <button onMouseEnter={handleHover} onClick={() => console.log('Render analytical chart')}>
      View Analytics Dashboard
    </button>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'In React 18, when navigating between code-split tabs, you can use `startTransition` or the `useTransition` hook. This keeps the existing page active and interactive while the new chunk downloads, preventing jarring screen resets to the blank Suspense spinner fallback.',
      metadata: { type: 'runtime', title: 'React 18 Concurrent Transitions' }
    },
    {
      type: 'heading',
      content: 'Bundle Size Profiling & Diagnostic Audits',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'To prevent bundle bloating, engineers use bundle visualization toolkits to diagnose size issues. Tools like `rollup-plugin-visualizer` (for Vite) or `webpack-bundle-analyzer` output an interactive treemap representation of your compiled bundles, highlighting duplicate library versions and bloated imports.\n\nTo audit code-splitting in production:\n1. Open **Chrome DevTools** -> **Network** tab -> Filter by `JS` to observe chunks load dynamically.\n2. Open the command palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) and choose **Coverage** to analyze exactly how much of your initial script bundle code is unused on first paint.'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Bundle Profiling & Splitting' }
    },
    {
      type: 'faq',
      content: 'Q: What is the physical mechanism of React.lazy and Suspense under the hood?\nA: When `React.lazy` renders, its internal reader checks if the dynamic import Promise has resolved. If it is still pending, the reader **throws the Promise itself** up the React tree. The nearest ancestor `<Suspense>` boundary catches this thrown Promise, hooks into its resolution chain, renders the fallback UI, and triggers a re-render once the Promise is fulfilled.'
    },
    {
      type: 'faq',
      content: 'Q: How does React 18 useTransition optimize code-splitting navigation compared to React 17?\nA: In React 17, clicking a route to a split-chunk component immediately triggered the Suspense fallback (a blank screen or spinner), which was highly jarring. React 18\'s `useTransition` hook tells React to execute the state update as a transition. React compiles the next UI in memory. If it hits an uncompleted chunk, it delays the visual update, keeping the current screen visible and fully interactive until the chunk downloads.'
    },
    {
      type: 'faq',
      content: 'Q: How do you handle dynamic imports in server-side rendered (SSR) environments?\nA: Standard `React.lazy` and `Suspense` are supported natively in React 18 SSR streaming layouts. However, for older hydration environments, raw dynamic imports cause a hydration mismatch warning because the client misses the chunk markup generated on the server. Utilizing libraries like `@loadable/component` solves this by collecting chunk script tags on the server and preloading them on the client before hydration.'
    }
  ]
};
