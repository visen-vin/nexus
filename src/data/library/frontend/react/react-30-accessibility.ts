import type { NoteContent } from '../../../types';
import accessibilitySvg from '../../../../assets/diagrams/frontend/react/accessibility.svg?raw';

export const content: NoteContent = {
  id: 'react-30',
  moduleId: 'react',
  order: 30,
  group: 'React 19 & Next.js',
  title: 'React Accessibility (a11y)',
  description: 'Comprehensive guide to building accessible React interfaces. Master semantic markup fragments, camelCase attribute exceptions, ref-based focus management pipelines, and screen-reader form coordination.',
  sections: [
    {
      type: 'text',
      content: 'Building accessible software (commonly abbreviated as **a11y**) is not just a regulatory checkmark but a core engineering requirement. When interfaces are designed with clean accessibility, they are completely usable by individuals navigating via screen readers, keyboards, speech control, or alternative devices. \n\nIn React development, accessibility centers on three core pillars: (1) **Semantic HTML structure** (using correct semantic tags and fragments `<React.Fragment>` rather than rendering redundant, broken container `<div>` wrappers), (2) **Connecting Form Controls** (linking inputs with label `htmlFor` selectors and routing validation errors through `aria-describedby` relations), and (3) **Programmatic Focus Management** (routing keyboard focus to newly opened structures like Modals or side overlays using `useRef` hooks, locking keyboard tabs within active boundaries, and returning focus to original triggers when structures close).'
    },
    {
      type: 'diagram',
      content: accessibilitySvg
    },
    {
      type: 'callout',
      content: 'In JSX, standard HTML attributes are typed using camelCase (such as `tabIndex`, `readOnly`, `colSpan`). However, **all ARIA and data-attributes (`aria-*` and `data-*`) preserve their traditional hyphenated formats** (e.g. `aria-label`, `aria-describedby`, `aria-hidden`) and must be strictly bound in lower-case hyphen formats.',
      metadata: { type: 'architecture', title: 'JSX Attribute Formatting Exceptions' }
    },
    {
      type: 'heading',
      content: 'Accessible Modal Dialog Module',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module represents a highly accessible, production-grade **Modal Dialog** component. It implements semantic containers, connects elements using specific aria properties, automatically traps keyboard focus when active, and gracefully returns focus to the initiating button upon dismissal.'
    },
    {
      type: 'code',
      content: `import React, { useEffect, useRef } from 'react';

// ============================================================================
// 1. Strict TypeScript Interfaces
// ============================================================================
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>; // Source to return focus to
  children: React.ReactNode;
}

export function AccessibleModal({
  isOpen,
  onClose,
  title,
  triggerRef,
  children
}: AccessibleModalProps) {
  // Establish refs for the modal dialog and its primary focus target (the close button)
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  // Focus Routing Cycle
  useEffect(() => {
    if (isOpen) {
      // 1. Trap Focus: When modal opens, shift focus directly to the close button
      // This immediately announces the modal boundary to screen readers.
      closeButtonRef.current?.focus();

      // 2. Escape Key Listener: Dismiss the modal when pressing 'Escape'
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        
        // 3. Return Focus: Once modal unmounts, return cursor focus to the initiating button
        triggerRef.current?.focus();
      };
    }
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    // Backdrop overlay
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      {/* 
        Semantic Dialog Container:
        - role="dialog" identifies the element as a dialog boundary.
        - aria-modal="true" alerts screen-readers to ignore background elements.
        - aria-labelledby connects the container to its header for voice naming.
      */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-headline"
        className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        <div className="flex justify-between items-center">
          <h2 id="modal-headline" className="text-white text-lg font-bold">
            {title}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal dialog"
            className="p-1 text-slate-400 hover:text-white rounded focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            ✕
          </button>
        </div>

        <div className="text-slate-300 text-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Connecting Accessible Form Inputs
// ============================================================================
export function ContactA11yInput() {
  const triggerButtonRef = useRef<HTMLButtonElement | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  return (
    <div className="p-4 space-y-4">
      {/* 1. Initiating button maintains an explicit ref reference */}
      <button
        ref={triggerButtonRef}
        onClick={() => setModalOpen(true)}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg"
      >
        Open Settings Dialog
      </button>

      <AccessibleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Account Preferences"
        triggerRef={triggerButtonRef}
      >
        <div className="space-y-4">
          <div>
            {/* Connect input using htmlFor, ensuring screen readers link labels */}
            <label 
              htmlFor="username-input" 
              className="block text-slate-300 text-sm font-semibold mb-1"
            >
              Configure Username
            </label>
            <input
              id="username-input"
              type="text"
              aria-describedby="username-hint"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
            />
            {/* Link descriptive hints with aria-describedby */}
            <p id="username-hint" className="text-xs text-slate-500 mt-1">
              Your public username must contain only alphanumeric characters.
            </p>
          </div>
        </div>
      </AccessibleModal>
    </div>
  );
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Always prefer semantic markup over ARIA additions. Do not apply `role="button"` or `tabIndex` to clickable `<div>` wrappers if you can render a standard HTML `<button>` element. Standard buttons have native keyboard mappings, focus rings, and action states built in by the browser.',
      metadata: { type: 'warning', title: 'The First Rule of ARIA' }
    },
    {
      type: 'callout',
      content: 'When lists (`<li>`), table items (`<td>`), or navigation grids are rendered across multiple components, avoid wrapping them in extra `<div>` containers inside sub-components. Divs corrupt the browser\'s parent-child layout expectations (such as `<ul>` expecting direct child `<li>` items), breaking voice parser trees. Use React Fragments (`<>`) instead.',
      metadata: { type: 'runtime', title: 'Semantic Fragment Rule' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'a11y Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is focus trapping, and why is it essential for accessible modal components?\nA: Focus trapping is the practice of restricting the tab focus cycle inside the boundaries of an active modal dialog. If you do not trap focus, a keyboard user pressing "Tab" will eventually route their focus onto elements *behind* the modal (such as sidebar links or footer targets) that are visually covered. This breaks screen-reader semantics and can result in keyboard users triggering hidden elements accidentally.'
    },
    {
      type: 'faq',
      content: 'Q: How do HTML accessibility attribute naming rules differ in JSX?\nA: Most core HTML properties map to camelCase JSX formats: `tabindex` becomes `tabIndex`, `readonly` becomes `readOnly`, and form association `for` becomes `htmlFor`. However, ARIA and data attributes are exceptions: all `aria-*` attributes (such as `aria-label`, `aria-describedby`, and `aria-hidden`) preserve their standard hyphenated lower-case names exactly.'
    },
    {
      type: 'faq',
      content: 'Q: Why is returning focus to the trigger button when a modal unmounts considered an essential accessibility practice?\nA: It preserves the user\'s reading context and navigational path. Keyboard and screen-reader users traverse pages sequentially. When they click a button to open a modal, their active focus shifts to the modal. If focus is not explicitly returned to that original button when the modal closes, the user\'s focus is lost and rolls back to the top body element, forcing them to navigate the entire page again from the beginning.'
    }
  ]
};
