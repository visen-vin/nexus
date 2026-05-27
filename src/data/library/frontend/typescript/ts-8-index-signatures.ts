import type { NoteContent } from '../../../types';
import indexSignaturesSvg from '../../../../assets/diagrams/frontend/typescript/index-signatures.svg?raw';

export const content: NoteContent = {
  id: 'ts-8',
  moduleId: 'ts',
  order: 83,
  group: 'Type System Core',
  title: 'Index Signatures & Records',
  description: 'In-depth exploration of Index Signatures and the Record utility. Master dynamic key-value dictionary modeling, handle index primitive limitations, and protect against runtime crashes using noUncheckedIndexedAccess.',
  sections: [
    {
      type: 'text',
      content: 'In modern application design, we frequently instantiate objects whose exact property keys are unknown at compile-time but whose values conform to a standardized contract—such as an in-memory session cache, a dictionary of API responses, or localized translations. \n\n**Index Signatures** allow developers to model these dynamic structures by declaring a generic parameter placeholder for keys (e.g. `[key: string]: Value`). When keys belong to a finite, known set (like a union of category routes), TypeScript provides the **`Record<Keys, Value>`** utility type to enforce rigid key mapping boundaries. Crucially, because reading a missing dictionary key returns `undefined` at runtime, pairing index signatures with the **`noUncheckedIndexedAccess`** configuration flag is a vital architectural practice, forcing developers to handle empty index lookups compile-safely.'
    },
    {
      type: 'diagram',
      content: indexSignaturesSvg
    },
    {
      type: 'callout',
      content: 'Index signature keys are restricted by JavaScript design rules. Only `string`, `number`, `symbol`, and template literal types are permitted as key parameters inside index signature definitions.',
      metadata: { type: 'architecture', title: 'Allowed Key Index Types' }
    },
    {
      type: 'heading',
      content: 'The Missing Index Trap & noUncheckedIndexedAccess',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'By default, TypeScript assumes that lookups on index signatures will always succeed. If you query `cache[\'missing_id\']`, the compiler infers the returned value strictly as the defined `Value` type. At runtime, JavaScript actually returns `undefined` because the property is missing. If you immediately attempt to read properties on that value, your application will crash with a fatal `TypeError` exception. \n\nTo bridge this safety gap, you should enable **`noUncheckedIndexedAccess`** in your `tsconfig.json`. When active, the compiler automatically infers any dynamic index lookup as `Value | undefined`. This forces developers to use optional chaining (`?.`) or explicit truthy guards before accessing nested properties, ensuring absolute safety.'
    },
    {
      type: 'heading',
      content: 'Production-Grade Dynamic Cache & Category Records',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases a generic in-memory session cache utilizing index signatures, structural restrictions using `Record`, and compiler-safe handling of unchecked index boundaries.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Standard Index Signature (Dynamic Dictionary)
// ============================================================================
export interface UserSession {
  userId: string;
  username: string;
  createdAt: Date;
}

// In-memory Session Cache
export interface SessionCache {
  // Allows any string key mapping to a UserSession
  [sessionId: string]: UserSession;
}

const activeSessions: SessionCache = {
  'session_9921': { userId: 'u_1', username: 'Abhi', createdAt: new Date() },
  'session_0012': { userId: 'u_2', username: 'Kunwaravi', createdAt: new Date() }
};

// ============================================================================
// 2. The Record Utility (Structured Keys)
// ============================================================================
export type AppDomain = 'billing' | 'engineering' | 'support';

export interface DepartmentMetrics {
  activeTickets: number;
  slaMetPercentage: number;
}

// Record restricts the keys strictly to the AppDomain union!
// Redeclaring with a random key (like 'marketing') will throw a compiler error.
export const domainMetrics: Record<AppDomain, DepartmentMetrics> = {
  billing: { activeTickets: 4, slaMetPercentage: 99.2 },
  engineering: { activeTickets: 12, slaMetPercentage: 95.8 },
  support: { activeTickets: 0, slaMetPercentage: 100 }
};

// ============================================================================
// 3. noUncheckedIndexedAccess in Practice
// ============================================================================
export function retrieveSession(id: string): string {
  // If 'noUncheckedIndexedAccess' is enabled:
  // 'session' is inferred as 'UserSession | undefined' (Safe!)
  // If disabled, it is inferred as 'UserSession' (Unsafe!)
  const session = activeSessions[id];

  // badPractice: Directly reading properties causes runtime crashes if id is invalid
  // return session.username; // ❌ COMPILE ERROR: Object is possibly 'undefined' under strict checks!

  // goodPractice: Safe access via optional chaining or explicit guards
  if (!session) {
    return 'Session expired or invalid.';
  }

  return \`Welcome back, \${session.username}. Created: \${session.createdAt.toISOString()}\`;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'When defining an index signature, any explicitly declared properties must conform to the index signature\'s value type. Declaring `interface Bad { [key: string]: string; id: number; }` triggers an immediate compiler crash because the property `id` contradicts the string index value constraint.',
      metadata: { type: 'warning', title: 'The Property Value Contradiction' }
    },
    {
      type: 'callout',
      content: 'Using index signatures opens up object shapes completely, which bypasses excess property checks. If you write `const obj: SessionCache = { \'id-1\': sessionData, typoField: \'bad\' }`, the compiler accepts it because `typoField` is treated as a dynamic string key containing a string, which can cause subtle data pollution.',
      metadata: { type: 'runtime', title: 'Excess Property Bypasses' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Index Signatures Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the purpose of TypeScript\'s noUncheckedIndexedAccess config flag, and how does it prevent production crashes?\nA: By default, TypeScript assumes that any dynamic index lookup (e.g. `cache["invalid_id"]`) will successfully return the defined value type. However, JavaScript actually returns `undefined` at runtime if a key is missing. Attempting to read properties on this value will trigger a fatal `TypeError` crash. Enabling `noUncheckedIndexedAccess` forces the compiler to append `undefined` to all dynamic lookup return types, requiring developers to use optional chaining (`?.`) or truthy checks before accessing properties.'
    },
    {
      type: 'faq',
      content: 'Q: Why does TypeScript throw a compiler error if you mix explicit properties with conflicting index signature value types (e.g., interface Config { [key: string]: string; status: number; })?\nA: TypeScript enforces strict structural integrity. An index signature `[key: string]: string` declares that *every* string property of that object must return a string. Declaring an explicit property `status: number` directly contradicts this contract, because `status` is a string key that yields a number. To mix them safely, you must widen the index signature value type to accept both (e.g., `[key: string]: string | number`).'
    },
    {
      type: 'faq',
      content: 'Q: How does the Record&lt;Keys, Value&gt; utility type differ from a standard index signature ([key: string]: Value)?\nA: A standard index signature is open-ended: it allows *any* dynamic string, number, or symbol key. In contrast, the `Record<Keys, Value>` utility type is closed-ended: it restricts the allowed keys strictly to a specific, predefined set (typically a union of string literals like "billing" | "support"). Declaring an object with keys outside of that union triggers an immediate compiler error, making `Record` much tighter and more structured.'
    }
  ]
};
