import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-7',
  moduleId: 'js',
  order: 4,
  group: 'Core Foundations',
  title: 'Lexical Scope & Scope Chain',
  description: 'How JavaScript engine resolves variables using the physical location.',
  sections: [
    { type: 'text', content: 'Lexical scope means that a variable\'s scope is determined by its physical placement within the source code. Inner functions contain a reference to the outer function\'s environment.' },
    { type: 'callout', content: 'If a variable is not found locally, JS traverses the Scope Chain until it reaches the Global scope.', metadata: { type: 'architecture', title: 'The Scope Chain' } },
    { type: 'code', content: 'function a() { var b = 10; c(); function c() { console.log(b); } } a();', metadata: { language: 'javascript' } }
  ]
};
