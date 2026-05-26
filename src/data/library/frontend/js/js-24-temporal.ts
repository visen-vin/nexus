import type { NoteContent } from '../../../types';
import temporalSvg from '../../../../assets/diagrams/frontend/js/temporal.svg?raw';

export const content: NoteContent = {
  id: 'js-24',
  moduleId: 'js',
  order: 24,
  group: 'Modern Standards',
  title: 'The Temporal API',
  description: 'The modern, immutable replacement for the legacy Date object with robust timezone handling.',
  sections: [
    {
      type: 'text',
      content: 'For decades, the JavaScript \`Date\` object has been a source of frustration due to its mutability, lack of timezone support, and inconsistent parsing. The **Temporal API** is the next-generation solution, providing a set of immutable objects for handling dates, times, and durations with mathematical precision and built-in DST (Daylight Saving Time) awareness.'
    },
    {
      type: 'diagram',
      content: temporalSvg
    },
    {
      type: 'callout',
      content: 'Unlike the legacy Date object, all Temporal objects are **immutable**. Methods like \`.add()\` or \`.with()\` return a new instance, preventing the common "action at a distance" bugs caused by shared Date references.',
      metadata: { type: 'architecture', title: 'Immutable Time' }
    },
    {
      type: 'heading',
      content: 'ZonedDateTime: The Global Event',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: '\`Temporal.ZonedDateTime\` represents a specific event at a specific location. It is the most comprehensive type, handling wall-clock time, timezones, and DST transitions automatically.'
    },
    {
      type: 'code',
      content: `const zdt = Temporal.ZonedDateTime.from("2026-05-24T12:00[America/New_York]");

// DST-safe arithmetic
const tomorrow = zdt.add({ days: 1 });

console.log(zdt.toString()); // 2026-05-24T12:00:00-04:00[America/New_York]`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'PlainDate: Birthdays & Holidays',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: '\`Temporal.PlainDate\` represents a date without any time or timezone info. This eliminates the "midnight in UTC" bug where a user in a different timezone sees a birthday shift to the previous day.'
    },
    {
      type: 'code',
      content: `const birthday = Temporal.PlainDate.from("1995-12-07");
const nextYear = birthday.with({ year: 2027 });

console.log(birthday.dayOfWeek); // 4 (Thursday)`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Temporal.Duration: Measuring Spans',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Representing a span of time (e.g., "5 hours and 30 minutes") is now a first-class citizen. You can compare durations, add them to dates, and "balance" them (converting 90 minutes to 1 hour 30 minutes).'
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Mastery Check' }
    },
    {
      type: 'faq',
      content: 'Q: Why is Temporal preferred over the legacy Date object?\nA: Temporal solves four major flaws: it is immutable, it has separate types for specific use cases (Plain vs. Zoned), it supports non-Gregorian calendars, and it handles DST transitions correctly during arithmetic.'
    },
    {
      type: 'faq',
      content: 'Q: What is the difference between Temporal.Instant and Temporal.ZonedDateTime?\nA: \`Instant\` is a fixed point in time (UTC) represented by nanoseconds since the Unix epoch. \`ZonedDateTime\` is an Instant combined with a specific timezone and calendar rules.'
    },
    {
      type: 'faq',
      content: 'Q: Is Temporal available in all browsers?\nA: As of mid-2024, Temporal is a Stage 4 proposal and is being implemented across major engines. For production use, a polyfill (like \`@js-temporal/polyfill\`) is currently required.'
    }
  ]
};
