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
      type: 'text',
      content: 'In complex applications, maintaining a single source of truth for type definitions is essential to avoid redundant code and drift between the frontend and database models. **Indexed Access Types** (also known as Lookup Types) allow you to query and extract the type of a specific property from another type using the `Type[Key]` syntax. Just as you access values in JavaScript using bracket notation, TypeScript allows you to look up type shapes at compile-time. This mechanism works seamlessly across nested object hierarchies, union types, and arrays or tuples using the `Type[number]` operator.'
    },
    {
      type: 'diagram',
      content: indexedAccessTypesSvg
    },
    {
      type: 'callout',
      content: 'Indexed Access Types strictly require a type-level lookup. You cannot pass a runtime variable inside the brackets; only types, type aliases, or literal values can be used. For example, `type Port = AppConfig[runtimeKey]` is invalid and will trigger a compiler error.',
      metadata: { type: 'architecture', title: 'Compile-Time Restrictions' }
    },
    {
      type: 'heading',
      content: 'Deep Object Navigation & Type Extraction',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Using index lookups, you can dissect nested structures without redeclaring them. This is highly effective when consuming third-party API definitions or shared database schemas. For instance, if an API client exposes a massive interface, you can pluck exactly the nested payload type your component needs. Lookups can also resolve union type keys dynamically. If you pass a union of keys (e.g., `Type["host" | "port"]`), TypeScript evaluates the lookup to a union of their respective types.'
    },
    {
      type: 'heading',
      content: 'Array & Tuple Indexing with Type[number]',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Array elements can be dynamically targeted using the `Type[number]` index signature. When applied to an array type like `string[]`, indexing with `number` resolves to `string`. However, the real power of `number` is revealed when working with **tuple types** and **const assertions**. By plucking elements from a readonly tuple, we can effortlessly transform a static list of strings into a precise union of string literals, creating an automated link between runtime values and compile-time boundaries.'
    },
    {
      type: 'heading',
      content: 'Production Implementation: Schema Coordination',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following module demonstrates how to coordinate database payload structures with client-side requirements using advanced nested lookups and tuple element extraction.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Nested Database Schema & Lookup Types
// ============================================================================
export interface DatabaseSchema {
  users: {
    id: string;
    profile: {
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    };
    settings: {
      theme: "light" | "dark" | "system";
      notificationsEnabled: boolean;
    };
    createdAt: Date;
  };
  orders: {
    id: string;
    amount: number;
    status: "pending" | "shipped" | "delivered" | "cancelled";
    items: Array<{
      productId: string;
      quantity: number;
      price: number;
    }>;
  };
}

// Pluck nested profile type directly from schema source of truth
export type UserProfile = DatabaseSchema["users"]["profile"];

// Pluck notification settings directly
export type UserNotificationSettings = DatabaseSchema["users"]["settings"]["notificationsEnabled"]; // boolean

// Pluck elements from the orders items array
// Since items is an Array, we index by number to extract the individual item type
export type OrderItem = DatabaseSchema["orders"]["items"][number];

// ============================================================================
// 2. Automated Union Generation from Readonly Configurations
// ============================================================================
export const FEATURE_FLAGS = [
  "dark_mode",
  "beta_dashboard",
  "ai_copilot",
  "premium_exports"
] as const;

// 1. typeof FEATURE_FLAGS yields: readonly ["dark_mode", "beta_dashboard", ...]
// 2. Indexing by [number] extracts the values as a literal union type!
export type FeatureFlag = (typeof FEATURE_FLAGS)[number];
// Evaluated: "dark_mode" | "beta_dashboard" | "ai_copilot" | "premium_exports"

export interface UserPermissions {
  allowedFlags: FeatureFlag[];
  userId: DatabaseSchema["users"]["id"];
}

// ============================================================================
// 3. Dynamic Key Lookups with Generics
// ============================================================================
export function pluckProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

const userSettings: DatabaseSchema["users"]["settings"] = {
  theme: "dark",
  notificationsEnabled: true
};

// themeVal is strongly typed as "light" | "dark" | "system"
const themeVal = pluckProperty(userSettings, "theme");`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'When using `as const` on arrays, TypeScript marks the array as `readonly`. If you attempt to pass this to a function expecting a mutable `string[]`, it will trigger a compiler mismatch. Be sure to type functions receiving these configurations as `readonly string[]`.',
      metadata: { type: 'warning', title: 'Readonly Tuple Assignment' }
    },
    {
      type: 'callout',
      content: 'If you attempt to perform an indexed lookup using a key that does not exist in the object type, TypeScript will immediately block compilation. Unlike JavaScript, which fails silently returning `undefined`, TypeScript protects against property misalignments during build time.',
      metadata: { type: 'runtime', title: 'Compiler Key Verification' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Indexed Access Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: How do you extract the element type of an array or list type in TypeScript dynamically?\nA: You can extract the element type of any array or tuple by indexing it with the `number` type. For example, if you have `type StringList = string[]`, then `StringList[number]` resolves to `string`. When combined with a const-asserted array (e.g. `const FRUITS = ["apple", "banana"] as const`), you can query `(typeof FRUITS)[number]` to extract the exact literal union `"apple" | "banana"`.'
    },
    {
      type: 'faq',
      content: 'Q: Can you perform an indexed access lookup using a dynamic runtime value as the key?\nA: No. TypeScript is a compile-time system, and type relationships are resolved before code execution. Bracket notation lookup `Type[Key]` strictly requires `Key` to be a *type*, such as a string literal type, a union of literal types, or `number`. Passing a standard runtime JavaScript variable inside bracket notation will result in a compiler error.'
    },
    {
      type: 'faq',
      content: 'Q: What happens if you index a type with a union of keys (e.g. User["firstName" | "lastName"])?\nA: TypeScript will resolve the lookup by extracting the type for each key in the union, and then returning a union of those resolved types. If `firstName` is `string` and `lastName` is `string`, then `User["firstName" | "lastName"]` evaluates to `string`. If the keys yield different types, the result will be a union of all those unique property types.'
    }
  ]
};
