import type { NoteContent } from '../../../types';
import eventLoopSvg from '../../../../assets/diagrams/frontend/js/event-loop.svg?raw';

export const content: NoteContent = {
  id: 'js-5',
  moduleId: 'js',
  order: 12,
  group: 'Asynchrony & Runtime',
  title: 'The Event Loop',
  description: 'Concurrency model and non-blocking I/O operations in JavaScript.',
  sections: [
    { type: 'text', content: 'The Event Loop is the orchestration mechanism that enables JavaScript to perform non-blocking asynchronous operations.' },
    { type: 'diagram', content: eventLoopSvg }
  ]
};
