import type { NoteContent } from './types';

/**
 * HIERARCHICAL CONTENT REGISTRY
 * ----------------------------
 * This module automatically discovers all topics from the /library directory.
 * Structure: /library/[domain]/[module]/[id]-[slug].ts
 * 
 * Supports Lazy Loading: Each file is an independent module.
 */
const modules = import.meta.glob('./library/**/*.ts', { eager: true });

export const CONTENT_DB: NoteContent[] = Object.values(modules)
  .map((mod: unknown) => (mod as { content: NoteContent }).content)
  .filter(Boolean)
  .sort((a, b) => a.order - b.order);
