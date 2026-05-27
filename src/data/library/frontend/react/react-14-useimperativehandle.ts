import type { NoteContent } from '../../../types';
import useImperativeHandleSvg from '../../../../assets/diagrams/frontend/react/useimperativehandle.svg?raw';

export const content: NoteContent = {
  id: 'react-14',
  moduleId: 'react',
  order: 14,
  group: 'Hooks Deep Dive',
  title: 'useImperativeHandle & Imperative DOM Exposure',
  description: 'Master the useImperativeHandle hook in React to selectively and safely expose customized handle methods across component boundaries while strictly maintaining DOM encapsulation.',
  sections: [
    {
      type: 'text',
      content: 'In React\'s declarative model, parents interact with children primarily through **Props**. However, rare circumstances require triggering imperative actions (e.g., focusing an input, scrolling to a container, starting/pausing a media player, or managing modal animations) from a parent.\n\nDirectly exposing a child\'s raw DOM node via standard `forwardRef` violates **component encapsulation**. It allows parent components to read arbitrary styles, mutate attributes directly, or bind rogue event listeners, leading to brittle rendering bugs. \n\n**`useImperativeHandle`** solves this by letting a child intercept the ref passed from the parent and customize the object it exposes. Instead of returning the raw DOM node, the child exposes a strictly defined, minimal API surface.'
    },
    {
      type: 'diagram',
      content: useImperativeHandleSvg
    },
    {
      type: 'heading',
      content: 'Architectural Benefits of useImperativeHandle',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Using `useImperativeHandle` alongside `forwardRef` offers three crucial architectural advantages:\n\n1. **API Encapsulation**: You can shield internal DOM structures and present a clean, high-level control surface (`open()`, `close()`, `reset()`).\n2. **Type Safety**: Using TypeScript, you can fully define the interface of the exposed handle (`ModalHandle`), ensuring callers compile-time safety and IDE autocompletion.\n3. **Ref Coupling Isolation**: The child component can change its underlying DOM representation (e.g., swapping a `<div class="modal">` to a native `<dialog>`) without breaking any consuming parent component.'
    },
    {
      type: 'callout',
      content: 'Exposing too many imperative methods violates React\'s declarative principles. If you find yourself syncing states or calling chain methods like `ref.current.calculate()` and then `ref.current.save()`, consider hoisting the state to the parent or passing declarative props instead.',
      metadata: { type: 'warning', title: 'The Imperative Trap' }
    },
    {
      type: 'heading',
      content: 'Implementation: Fully Type-Safe Custom Handles',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Below is a comprehensive, production-grade example of a custom Modal component using TypeScript to define a strictly typed external handle, complete with auto-focusing on mount.'
    },
    {
      type: 'code',
      content: `import React, { useImperativeHandle, useRef, useState, forwardRef } from 'react';

// 1. Define the public API interface that the child exposes
export interface ModalHandle {
  open: () => void;
  close: () => void;
  focusConfirm: () => void;
}

interface ModalProps {
  title: string;
  children: React.ReactNode;
}

// 2. Wrap the child component with forwardRef
export const Modal = forwardRef<ModalHandle, ModalProps>(({ title, children }, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Internal private DOM refs
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  // Helper actions
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const focusConfirm = () => {
    confirmButtonRef.current?.focus();
  };

  // 3. Intercept the ref and define the custom imperative handle
  useImperativeHandle(ref, () => ({
    open,
    close,
    focusConfirm
  }), []); // Empty dependency array ensures handle is stable across re-renders

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={close} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center' }}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ background: '#1e293b', padding: '24px', borderRadius: '8px', color: '#fff' }}>
        <h3>{title}</h3>
        <div className="modal-body" style={{ margin: '16px 0' }}>
          {children}
        </div>
        <div className="modal-actions" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={close} style={{ background: '#475569', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
          <button ref={confirmButtonRef} onClick={close} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>Confirm</button>
        </div>
      </div>
    </div>
  );
});

Modal.displayName = 'Modal';`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'text',
      content: 'And here is the parent component showing how to store the ref securely and trigger the exposed API safely.'
    },
    {
      type: 'code',
      content: `import React, { useRef } from 'react';
import { Modal, ModalHandle } from './Modal';

export function Dashboard() {
  // Store the ref using the custom Handle type instead of a raw HTML Element
  const modalRef = useRef<ModalHandle | null>(null);

  const handleOpenAlert = () => {
    modalRef.current?.open();
    
    // Defer focusing until the next macro-task to allow rendering
    setTimeout(() => {
      modalRef.current?.focusConfirm();
    }, 50);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>System Dashboard</h1>
      <button 
        onClick={handleOpenAlert}
        style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Trigger Action Modal
      </button>

      <Modal ref={modalRef} title="Critical Operation Detected">
        <p>Are you sure you want to proceed with database migrations on production?</p>
      </Modal>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'The third parameter of `useImperativeHandle` is a dependency array, just like `useEffect` or `useMemo`. If you reference closure values (like active indices or custom props) inside your exposed handlers, make sure to add them to this dependency array to prevent stale closure bugs.',
      metadata: { type: 'runtime', title: 'Dependency Arrays in Imperative Handles' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'CORE CONCEPTS & INTERNALS',
      metadata: { type: 'architecture', title: 'API Safety & Ref Binding' }
    },
    {
      type: 'faq',
      content: 'Q: What is the primary problem useImperativeHandle solves, and why not use plain forwardRef?\nA: Plain `forwardRef` returns the raw child DOM node, exposing all internal attributes, styling details, and inner DOM structure to the parent. This compromises encapsulation and security. `useImperativeHandle` intercepts this process, allowing the child to expose a strictly controlled, custom API object containing only the functions or variables the parent is meant to call.'
    },
    {
      type: 'faq',
      content: 'Q: Why is it important to provide a dependency array to useImperativeHandle?\nA: Like React hook dependencies, if the functions exposed inside the imperative handle refer to any props or local state variables, leaving them out of the dependency array will cause a stale closure. The exposed methods will forever capture the values from the initial render, causing silent bugs.'
    },
    {
      type: 'faq',
      content: 'Q: How does React schedule the assignment of useImperativeHandle under the hood?\nA: `useImperativeHandle` runs during React\'s synchronous commit phase. Specifically, it schedules the custom object instantiation immediately after DOM updates are written to the tree but before paint. The assigned handle is attached to the parent ref object\'s `.current` attribute, making it ready to be consumed immediately inside the parent\'s `useLayoutEffect` hooks.'
    }
  ]
};
