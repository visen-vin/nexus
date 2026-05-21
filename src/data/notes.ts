export type Category = 'Frontend' | 'Backend' | 'DevOps' | 'System Design';

export interface Section {
  type: 'text' | 'callout' | 'code';
  content: string;
  metadata?: {
    type?: 'architecture' | 'runtime' | 'warning';
    title?: string;
    language?: string;
  }
}

export interface NoteContent {
  id: string;
  title: string;
  category: Category;
  module: string;
  description: string; // Added for richer index
  sections: Section[];
}

export const CATEGORIES: Category[] = ['Frontend', 'Backend', 'DevOps', 'System Design'];

export const MODULES: Record<Category, string[]> = {
  'Frontend': ['JavaScript', 'TypeScript', 'React', 'Redux / RTK', 'Next.js'],
  'Backend': ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
  'DevOps': ['CI/CD', 'AWS', 'Kubernetes'],
  'System Design': ['High Level Design', 'Low Level Design', 'Database Sharding']
};

export const NOTES: NoteContent[] = [
  {
    id: 'js-1',
    title: 'How JS Works & GEC',
    category: 'Frontend',
    module: 'JavaScript',
    description: 'Internal mechanics of the V8 Engine and the Call Stack lifecycle.',
    sections: [
      { type: 'text', content: 'Everything in JS happens inside an Execution Context.' },
      { type: 'callout', content: 'Creation Phase vs Execution Phase.', metadata: { type: 'architecture', title: 'Memory Lifecycle' } },
      { type: 'code', content: 'var n = 2;', metadata: { language: 'javascript' } }
    ]
  },
  {
    id: 'js-2',
    title: 'Hoisting in JavaScript',
    category: 'Frontend',
    module: 'JavaScript',
    description: 'Deep-dive into memory allocation for variables and function declarations.',
    sections: [
      { type: 'text', content: 'Accessing variables and functions before initialization.' },
      { type: 'callout', content: 'Memory is allocated during the creation phase.', metadata: { type: 'runtime', title: 'Hoisting Logic' } }
    ]
  },
  {
    id: 'js-3',
    title: 'The Call Stack',
    category: 'Frontend',
    module: 'JavaScript',
    description: 'Understanding LIFO structures and functional execution contexts.',
    sections: [
      { type: 'text', content: 'LIFO structure managing functional execution contexts.' }
    ]
  }
];
