import type { NoteContent } from '../../../types';
import keyofTypeofSvg from '../../../../assets/diagrams/frontend/typescript/keyof-typeof.svg?raw';

export const content: NoteContent = {
  id: 'ts-12',
  moduleId: 'ts',
  order: 87,
  group: 'Type System Core',
  title: 'keyof & typeof',
  description: 'Detailed exploration of keyof and typeof operators. Master extracting types from runtime values, gathering key unions from static types, and coordinating them for dynamic type safety.',
  sections: [
    {
      type: 'diagram',
      content: keyofTypeofSvg
    },
    {
      type: 'text',
      content: 'In standard JavaScript, `typeof` is a runtime operator that returns a string representing the primitive type of a value (e.g., "string", "number", "object"). In TypeScript, however, `typeof` operates in two distinct contexts: the runtime expression context and the static type query context. When used in a type position, `typeof` queries the TypeScript compiler to extract the static type of a runtime variable, function, or object, establishing a direct bridge between runtime code and static types.\n\nOnce a type is extracted or defined, the `keyof` operator can be applied. `keyof` is an index type query operator that takes an object type and yields a union of its literal keys. Combining `typeof` and `keyof` allows you to dynamically derive strict type unions directly from live configuration files, mock objects, or API responses, eliminating redundant manual type definitions.'
    },
    {
      type: 'callout',
      content: 'The static `typeof` operator only queries existing identifiers. You cannot query the type of a value returned directly from an unassigned expression (e.g., `typeof Math.random()` is invalid in type space). You must assign the result to an identifier first.',
      metadata: { type: 'warning', title: 'Identifier Restriction' }
    },
    {
      type: 'code',
      content: `// 1. Live Runtime Variable
const appConfig = {
  apiEndpoint: "https://api.nexus.dev",
  port: 443,
  timeoutMs: 5000,
  features: {
    darkMode: true,
    betaTest: false
  }
};

// 2. Extract Static Type via 'typeof'
type AppConfigType = typeof appConfig;
/*
Evaluates to:
type AppConfigType = {
  apiEndpoint: string;
  port: number;
  timeoutMs: number;
  features: {
    darkMode: boolean;
    betaTest: boolean;
  };
}
*/

// 3. Extract Literal Key Union via 'keyof'
type AppConfigKeys = keyof AppConfigType;
// Evaluates to: "apiEndpoint" | "port" | "timeoutMs" | "features"`,
      metadata: { language: 'typescript', title: 'Coordinating typeof and keyof' }
    },
    {
      type: 'text',
      content: 'This pattern becomes exceptionally powerful when implementing type-safe dynamic property accessors (getters and setters). By using a generic function with a constraint `<T, K extends keyof T>`, we guarantee that the lookup key is a literal key of the target object, ensuring the return type is exactly mapped to `T[K]` rather than collapsing into `any` or `unknown`.'
    },
    {
      type: 'code',
      content: `// Type-safe property getter
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const endpoint = getProperty(appConfig, "apiEndpoint"); // Strict string type
const portNumber = getProperty(appConfig, "port");       // Strict number type
// const invalid = getProperty(appConfig, "invalidKey"); // ❌ Compile-time error!`,
      metadata: { language: 'typescript', title: 'Type-Safe Property Lookup' }
    },
    {
      type: 'callout',
      content: 'TypeScript\'s `typeof` operates purely at compile time when used in type declarations. The resulting type definitions are completely erased during compilation, leaving zero performance overhead in the final JavaScript bundle.',
      metadata: { type: 'architecture', title: 'Type Erasure Efficiency' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Operator Mastery Questions' }
    },
    {
      type: 'faq',
      content: 'Q: What is the key difference between the JavaScript runtime typeof and the TypeScript static typeof?\nA: The JavaScript runtime `typeof` is evaluated at execution time and returns one of the eight standard string representations ("string", "number", "boolean", "object", "undefined", "function", "symbol", "bigint"). The TypeScript static `typeof` is evaluated exclusively at compile-time when used in a type annotation context. It extracts the full static shape of a variable, function, or class, preserving all structural detail.'
    },
    {
      type: 'faq',
      content: 'Q: How does the keyof operator behave when applied to arrays or tuples?\nA: When applied to an array, `keyof T[]` yields standard prototype methods (e.g., "length", "push", "concat") along with "number" (representing indexing keys). When applied to a tuple, e.g., `type MyTuple = [string, number]`, `keyof MyTuple` returns the string literals representing the indices ("0" | "1") along with length and tuple method keys.'
    },
    {
      type: 'faq',
      content: 'Q: Explain how keyof behaves when applied to an interface with an index signature.\nA: If an interface has a string index signature, e.g., `interface Dict { [key: string]: number }`, `keyof Dict` evaluates to `string | number` (since numbers are implicitly converted to string keys in JavaScript). If it has a number index signature, `keyof Dict` yields only `number`.'
    }
  ]
};
