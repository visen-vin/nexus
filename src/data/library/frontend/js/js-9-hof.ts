import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-9',
  moduleId: 'js',
  order: 7,
  group: 'Functions & Objects',
  title: 'First Class & Higher Order Functions',
  description: 'Functions as values and functions that operate on other functions.',
  sections: [
    { type: 'text', content: 'Functions are First-Class Citizens. They can be assigned to variables, passed as arguments, and returned from functions.' },
    { type: 'callout', content: 'A Higher Order Function (HOF) is a function that takes or returns another function.', metadata: { type: 'architecture', title: 'Functional Composition' } },
    { type: 'code', content: 'const radius = [1, 2, 3];\nconst area = (r) => Math.PI * r * r;\nconst calculate = (arr, logic) => arr.map(logic);', metadata: { language: 'javascript' } }
  ]
};
