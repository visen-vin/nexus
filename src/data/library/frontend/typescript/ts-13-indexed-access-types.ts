import type { NoteContent } from '../../../types';
import indexedAccessTypesSvg from '../../../../assets/diagrams/frontend/typescript/indexed-access-types.svg?raw';

export const content: NoteContent = {
  id: 'ts-13',
  moduleId: 'ts',
  order: 88,
  group: 'Type System Core',
  title: 'Indexed Access Types',
  description: 'In-depth analysis of Indexed Access Types. Access nested object properties dynamically, extract element types from arrays using Type[number], and coordinate type boundaries on complex database payload schemas.',
  sections: [
    {
      type: 'diagram',
      content: indexedAccessTypesSvg
    },
    {
      type: 'text',
      content: 'In TypeScript, **Indexed Access Types** (also known as lookup types) allow you to lookup the type of a specific property on another type using a bracket notation similar to property access in JavaScript: `Type[Key]`. This enables a single source of truth for your data structures, ensuring that nested properties, API payloads, or database schema subsets stay perfectly in sync without manually duplicating deep types.\n\nIndexed access types are evaluated entirely at compile-time. Because of this, you index using **types**, not values. You cannot use a runtime variable inside the brackets; instead, you must use a string literal type, a union of literal types, or another generic type parameter.'
    },
    {
      type: 'callout',
      content: 'You must index using type-level entities. A common mistake is attempting to use a runtime string variable: `type Prop = User[keyVar]` will fail compilation because `keyVar` is a value. Use `type Prop = User["profile"]` or generic variables instead.',
      metadata: { type: 'warning', title: 'Compile-Time Type Boundary' }
    },
    {
      type: 'code',
      content: `// 1. Unified Application State Type
interface AppState {
  user: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string;
    };
    roles: ("admin" | "editor" | "viewer")[];
  };
  settings: {
    theme: "light" | "dark" | "system";
    notifications: boolean;
  };
}

// 2. Extract nested property type using bracket lookup
type UserProfile = AppState["user"]["profile"];
/*
Evaluates to:
type UserProfile = {
  firstName: string;
  lastName: string;
  avatarUrl: string;
}
*/

// 3. Extract union from array using [number]
type UserRole = AppState["user"]["roles"][number];
// Evaluates to: "admin" | "editor" | "viewer"`,
      metadata: { language: 'typescript', title: 'Nested Object & Array Indexing' }
    },
    {
      type: 'text',
      content: 'Beyond indexing with single string literals, you can index using a union of literal types. This returns a union of the respective property types. For example, indexing `AppState["user" | "settings"]` gathers the types of both the `user` and `settings` branches into a combined union type.'
    },
    {
      type: 'code',
      content: `// Indexing using union of keys
type AppSlices = AppState["user" | "settings"];
/*
Evaluates to:
type AppSlices = AppState["user"] | AppState["settings"]
*/

// Dynamic mapped dictionary extraction
type ThemeOption = AppState["settings"]["theme"]; // "light" | "dark" | "system"`,
      metadata: { language: 'typescript', title: 'Indexing with Unions' }
    },
    {
      type: 'callout',
      content: 'Using Indexed Access Types promotes the "single source of truth" architectural principle. Rather than writing distinct types for every intermediate component prop, index directly into your central interface (e.g. `interface ProfileProps { data: AppState["user"]["profile"] }`).',
      metadata: { type: 'architecture', title: 'Architectural Data Synchronization' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Indexed Access Deep Dive' }
    },
    {
      type: 'faq',
      content: 'Q: What does indexing an array type with [number] accomplish, and how does it differ from [0]?\nA: Indexing an array or tuple type `T[]` with `[number]` extracts the type of *any* element inside that array. For `string[]`, `string[][number]` evaluates to `string`. Indexing a tuple with a numeric literal like `[0]` extracts the specific type of the element at that exact index position (e.g., `[string, number][0]` evaluates to `string`, whereas `[string, number][number]` evaluates to `string | number`).'
    },
    {
      type: 'faq',
      content: 'Q: Why does the compiler throw an error if you write User[typeof keyName] where keyName is a runtime string variable?\nA: Because `typeof keyName` in that context is evaluated by TypeScript as the wide type `string` (unless defined as `const keyName = "profile"`). Since `User` does not have a string index signature, you cannot index it with the broad `string` type. You must index it with specific literal string keys (e.g. `"profile"` | `"id"`).'
    },
    {
      type: 'faq',
      content: 'Q: How do you combine keyof and indexed access types inside a generic function for perfect type safety?\nA: By defining two coupled type parameters, `<T, K extends keyof T>`, and setting the function\'s return type to `T[K]`. This guarantees that the compiler enforces a compile-time check that the key matches a valid property on the object, and automatically narrows the return type to the exact type of that property.'
    }
  ]
};
