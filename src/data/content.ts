import type { NoteContent } from './types';

export const CONTENT_DB: NoteContent[] = [
  {
    id: 'js-1',
    moduleId: 'js',
    order: 1,
    title: 'How JS Works & GEC',
    description: 'Internal mechanics of the V8 Engine and the Call Stack lifecycle.',
    sections: [
      { type: 'text', content: 'Everything in JS happens inside an Execution Context.' },
      { type: 'callout', content: 'Creation Phase vs Execution Phase.', metadata: { type: 'architecture', title: 'Memory Lifecycle' } },
      { type: 'code', content: 'var n = 2;', metadata: { language: 'javascript' } }
    ]
  },
  {
    id: 'js-2',
    moduleId: 'js',
    order: 2,
    title: 'Hoisting in JavaScript',
    description: 'Deep-dive into memory allocation for variables and function declarations.',
    sections: [
      { type: 'text', content: 'Accessing variables and functions before initialization.' },
      { type: 'callout', content: 'Memory is allocated during the creation phase.', metadata: { type: 'runtime', title: 'Hoisting Logic' } }
    ]
  },
  {
    id: 'js-3',
    moduleId: 'js',
    order: 3,
    title: 'The Call Stack',
    description: 'Understanding LIFO structures and functional execution contexts.',
    sections: [
      { type: 'text', content: 'LIFO structure managing functional execution contexts.' }
    ]
  },
  {
    id: 'react-1',
    moduleId: 'react',
    order: 1,
    title: 'Fiber Reconciliation',
    description: 'Concurrency and incremental rendering mechanics.',
    sections: [
      { type: 'text', content: 'React internals and the virtual DOM tree.' }
    ]
  }
];
