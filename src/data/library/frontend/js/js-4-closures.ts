import type { NoteContent } from '../../../types';
import closureSvg from '../../../../assets/diagrams/frontend/js/closure.svg?raw';

export const content: NoteContent = {
  id: 'js-4',
  moduleId: 'js',
  order: 6,
  group: 'Functions & Objects',
  title: 'Closures',
  description: 'How functions retain access to their lexical scope after execution.',
  sections: [
    { type: 'text', content: 'A closure gives a function access to its outer scope even after the outer function has finished executing.' },
    { type: 'diagram', content: closureSvg },
    { type: 'callout', content: 'Every function in JS is a closure because it captures its surrounding scope at definition time.', metadata: { type: 'architecture', title: 'Scope Preservation' } },
    { type: 'code', content: 'function x() { var a = 7; return function y() { console.log(a); } } var z = x(); z();', metadata: { language: 'javascript' } }
  ]
};
