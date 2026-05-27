import type { NoteContent } from '../../../types';
import intlSvg from '../../../../assets/diagrams/frontend/js/intl.svg?raw';

export const content: NoteContent = {
  id: 'js-25',
  moduleId: 'js',
  order: 25,
  group: 'Browser APIs & Security',
  title: 'Intl API',
  description: 'Language-sensitive string comparison, number formatting, and date/time formatting.',
  sections: [
    {
      type: 'text',
      content: 'Localization (i18n) is often an afterthought but is critical for global applications. The **Intl API** provides a powerful set of tools to format numbers, dates, and relative times according to a user\'s locale, ensuring that your application feels native to everyone, everywhere.'
    },
    {
      type: 'diagram',
      content: intlSvg
    },
    {
      type: 'callout',
      content: 'All Intl formatters are designed to be reused. For performance, you should instantiate a formatter once and reuse it multiple times rather than creating new ones inside loops or frequently rendered components.',
      metadata: { type: 'runtime', title: 'Instantiation Performance' }
    },
    {
      type: 'heading',
      content: 'NumberFormat: Currency & Units',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: '\\`Intl.NumberFormat\\` handles currencies, percentages, and measurement units with correct symbol placement and grouping separators.'
    },
    {
      type: 'code',
      content: `const usd = new Intl.NumberFormat('en-US', { 
  style: 'currency', 
  currency: 'USD' 
});
console.log(usd.format(1234.56)); // "$1,234.56"

const speed = new Intl.NumberFormat('de-DE', { 
  style: 'unit', 
  unit: 'kilometer-per-hour' 
});
console.log(speed.format(100)); // "100 km/h"`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'RelativeTimeFormat: "Yesterday"',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Formatting relative time manually (e.g., "3 minutes ago") is error-prone. \\`Intl.RelativeTimeFormat\\` automates this, including support for "auto" numeric conversion (changing "-1 day" to "yesterday").'
    },
    {
      type: 'code',
      content: `const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

console.log(rtf.format(-1, 'day'));    // "yesterday"
console.log(rtf.format(2, 'quarter')); // "in 2 quarters"`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'PluralRules: Complex Pluralization',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: '\\`Intl.PluralRules\\` tells you which plural category a number falls into for a given locale (e.g., \\`one\\`, \\`few\\`, \\`many\\`, \\`other\\`). This is the foundation for choosing the correct translated string in complex languages.'
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
      content: 'Q: What is the "compact" notation in NumberFormat?\nA: It allows you to format large numbers in a human-readable way, such as converting \\`1200000\\` to \\`"1.2M"\\` (in English) or \\`"1,2 Mio."\\` (in German).'
    },
    {
      type: 'faq',
      content: 'Q: How does DateTimeFormat handle timezones?\nA: You can provide a \\`timeZone\\` option (e.g., \\`"UTC"\\`, \\`"Asia/Tokyo"\\`). The API uses the IANA timezone database to calculate the correct offset and wall-clock time for the target locale.'
    },
    {
      type: 'faq',
      content: 'Q: Why should I use Intl instead of a library like Moment.js or date-fns?\nA: The Intl API is built into the browser, meaning zero bundle size overhead. It is also faster as it relies on the browser\'s internal implementation and the OS-level locale data.'
    }
  ]
};
