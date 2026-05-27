import type { NoteContent } from '../../../types';
import coreUtilitiesSvg from '../../../../assets/diagrams/frontend/typescript/core-utilities.svg?raw';

export const content: NoteContent = {
  id: 'ts-17',
  moduleId: 'ts',
  order: 92,
  group: 'Type System Core',
  title: 'Core Utilities',
  description: 'In-depth analysis of TypeScript\'s core built-in utility types: Partial, Required, Readonly, Record, Pick, and Omit. Learn their underlying type-level implementations and compilation strategies.',
  sections: [
    {
      type: 'diagram',
      content: coreUtilitiesSvg
    },
    {
      type: 'text',
      content: 'TypeScript provides several **built-in utility types** to facilitate common type transformations. These utilities are globally available and act as high-level macros or wrappers over mapped types, index signatures, and conditional types. Rather than manually writing complex iteration blocks for basic object transformations, developers can use these utilities to create clean, reusable, and self-documenting code.\n\nUnderstanding not just how to *use* these utilities, but how they are *implemented* at a compiler level is essential for debugging type failures and building advanced, high-fidelity type systems.'
    },
    {
      type: 'callout',
      content: 'Core utilities like `Omit` and `Pick` do not check if keys actually exist unless strict type checks are enforced. For instance, `Omit<User, "nonExistentKey">` compiles perfectly fine, which can lead to silent type-drifts if not actively monitored.',
      metadata: { type: 'warning', title: 'Silent Key Drift' }
    },
    {
      type: 'heading',
      content: '1. Modifying Property Attributes: Partial, Required, Readonly',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'These utilities iterate over all properties of a type and alter their attributes. Under the hood, they use standard mapped type syntax to add or remove modifiers like `?` and `readonly`:'
    },
    {
      type: 'code',
      content: `interface User {
  id: string;
  name: string;
  age?: number;
}

// Partial<T> -> Makes all keys optional
// Under the hood: type Partial<T> = { [P in keyof T]?: T[P]; };
type PartialUser = Partial<User>;

// Required<T> -> Makes all keys required (removes optionality)
// Under the hood: type Required<T> = { [P in keyof T]-?: T[P]; };
type RequiredUser = Required<User>; // age is now strictly number

// Readonly<T> -> Makes all keys immutable
// Under the hood: type Readonly<T> = { readonly [P in keyof T]: T[P]; };
type ReadonlyUser = Readonly<User>;`,
      metadata: { language: 'typescript', title: 'Attribute Modifiers' }
    },
    {
      type: 'heading',
      content: '2. Slicing Shapes: Pick & Omit',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: '`Pick` and `Omit` are used to extract a subset of properties from a type. They require a union of literal strings representing keys as their second argument. `Pick` includes only those keys, while `Omit` excludes them:'
    },
    {
      type: 'code',
      content: `// Pick<T, K> -> Extracts a subset of properties
// Under the hood: type Pick<T, K extends keyof T> = { [P in K]: T[P]; };
type UserMetadata = Pick<User, "id" | "name">; 
// Result: { id: string; name: string; }

// Omit<T, K> -> Excludes a subset of properties
// Under the hood: type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
type UserWithoutAge = Omit<User, "age">;
// Result: { id: string; name: string; }`,
      metadata: { language: 'typescript', title: 'Pick and Omit mechanics' }
    },
    {
      type: 'heading',
      content: '3. Creating Dicts: Record',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: '`Record<Keys, Value>` is used to map keys of one type to another type. It is the core mechanism for creating strict dictionary maps or configuration tables:'
    },
    {
      type: 'code',
      content: `// Record<K, T> -> Maps key union K to type T
// Under the hood: type Record<K extends keyof any, T> = { [P in K]: T; };
type UserRoles = "admin" | "editor" | "viewer";
type RolePermissions = Record<UserRoles, string[]>;

const permissions: RolePermissions = {
  admin: ["create", "read", "update", "delete"],
  editor: ["read", "update"],
  viewer: ["read"]
};`,
      metadata: { language: 'typescript', title: 'Record Dictionary Map' }
    },
    {
      type: 'callout',
      content: 'Always prefer `Omit` and `Pick` over raw type duplication to preserve a clean dependency layer. If a UI component only requires a user\'s avatar and display name, represent its props as `interface Props { user: Pick<User, "name" | "id"> }` to keep types synchronized automatically.',
      metadata: { type: 'architecture', title: 'Component Contract Caching' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Core Utilities Interview Prep' }
    },
    {
      type: 'faq',
      content: 'Q: How is Omit built using Pick and Exclude under the hood? Write its type signature.\nA: `Omit` is defined as: `type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>`. It first uses the `Exclude` utility to subtract the keys listed in `K` from the total keys `keyof T`. Then, it applies `Pick` to extract only that remaining subset of keys from `T`.'
    },
    {
      type: 'faq',
      content: 'Q: Why does Pick constrain its key argument with K extends keyof T, but Omit constraints its key with K extends keyof any?\nA: `Pick` requires the extracted keys to actually exist on the target type `T` to prevent compiling dead references. `Omit`, however, uses `Exclude` internally, which naturally filters out non-existent keys without compiling errors. Therefore, `Omit` uses the wider constraint `K extends keyof any` (meaning any valid property key: string | number | symbol) to allow loose exclusions.'
    },
    {
      type: 'faq',
      content: 'Q: What is the primary compile-time difference between interface inheritance (extends) and the Pick utility?\nA: Interface inheritance (`interface B extends A`) creates a permanent parent-child class-like link in the compiler\'s cached relation graph, enabling fast cached lookups. `Pick<A, Keys>` creates an anonymous mapped type on-the-fly. While structurally identical, intensive inline use of anonymous utility types in large codebases can lead to slower type-checking times compared to declared interfaces.'
    }
  ]
};
