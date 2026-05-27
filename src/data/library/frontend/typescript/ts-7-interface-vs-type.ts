import type { NoteContent } from '../../../types';
import interfaceVsTypeSvg from '../../../../assets/diagrams/frontend/typescript/interface-vs-type.svg?raw';

export const content: NoteContent = {
  id: 'ts-7',
  moduleId: 'ts',
  order: 82,
  group: 'Type System Core',
  title: 'Interface vs. Type Alias',
  description: 'Comprehensive architectural comparison between TypeScript interfaces and type aliases. Master declaration merging, union/intersection mechanics, extensibility, and compiler lookup performance.',
  sections: [
    {
      type: 'text',
      content: 'In TypeScript, `interface` and `type` alias are the two core mechanisms used to declare structural types. For many standard object declarations, they can be used interchangeably, leading to widespread confusion about which to choose. \n\nHowever, they possess fundamental structural differences. **Interfaces** represent structural contracts for objects and classes, supporting **Declaration Merging** (implicitly merging multiple interfaces of the same name) and flat cached lookup trees that optimize compiler performance. **Type Aliases** are final, non-extensible definitions that can model *any* valid JavaScript type, including primitives, unions, intersections, tuples, and mapped types. Understanding these nuances allows developers to write cleaner, more performant type definitions.'
    },
    {
      type: 'diagram',
      content: interfaceVsTypeSvg
    },
    {
      type: 'callout',
      content: 'Rule of thumb: Use **interfaces** when defining public API libraries, extensible component options, or class-based structures that benefit from declaration merging. Use **types** when modeling unions, intersections, tuples, mapped configurations, or when you want to prevent third-party consumer code from polluting your types.',
      metadata: { type: 'architecture', title: 'The Architectural Selection Guide' }
    },
    {
      type: 'heading',
      content: 'Declaration Merging (Extending boundaries)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Declaration merging is a unique capability of interfaces. If you declare two interfaces with the same name in the same namespace, TypeScript automatically merges their properties. This is vital for third-party libraries (e.g., adding custom options to express Request objects or extending the global `Window` interface) but can cause silent collisions if not managed carefully.'
    },
    {
      type: 'heading',
      content: 'Extensibility: extends vs. Intersection (&)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Interfaces extend other structures using the `extends` keyword, whereas types merge structures using the **Intersection operator (`&`)**. \n\nThe compiler handles these differently: `extends` performs flat structural checks and caches type trees, throwing clear errors if properties collide with different types. In contrast, type intersections (`&`) resolve recursively, which can lead to complex type resolutions and compiler slowing in large codebases.'
    },
    {
      type: 'heading',
      content: 'Production-Grade API Integration & Merging Examples',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases declaration merging, type-safe intersections, and how to define dynamic configurations using types.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Declaration Merging (Interfaces Only)
// ============================================================================
// Declaring the User interface first
export interface AppUser {
  id: string;
  name: string;
}

// Declaring it again - TypeScript implicitly merges them!
export interface AppUser {
  role: 'admin' | 'user';
}

export const activeUser: AppUser = {
  id: 'usr_882',
  name: 'Kunwaravi',
  role: 'admin' // Both fields are required!
};

// ============================================================================
// 2. Extending Interfaces and Types
// ============================================================================
export interface Printable {
  print(): void;
}

// Interfaces can extend Type Aliases
export type Loggable = {
  logLevel: string;
};

export interface DiagnosticReport extends Printable, Loggable {
  reportId: string;
}

// Types can intersect Interfaces
export type SerializableReport = DiagnosticReport & {
  serializedData: string;
};

// ============================================================================
// 3. Union & Tuple Power (Type Aliases Only)
// ============================================================================
// Interfaces CANNOT represent primitive unions or tuples
export type DatabaseID = string | number;

export type CoordinatesTuple = [latitude: number, longitude: number];

// Dynamic mapped type lookup
export type ReadOnlyConfig<T> = {
  readonly [P in keyof T]: T[P];
};

export interface APIConfig {
  endpoint: string;
  retries: number;
}

// Binds to generic mapping utilities
export type FrozenConfig = ReadOnlyConfig<APIConfig>;`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'When extending interfaces, the compiler performs a check to ensure that overridden properties are compatible. If you redefine a property with an incompatible type (e.g. extending a string property as a number), the compiler throws an error. However, intersecting types via `&` allows incompatible overrides, resolving them to `never` silently, which can lead to impossible-to-instantiate object models.',
      metadata: { type: 'warning', title: 'The Silent never Intersection Trap' }
    },
    {
      type: 'callout',
      content: 'In large codebases, preferring `interface extends` over type intersections (`&`) yields significantly faster compiler speeds. This is because the TS compiler creates a flat index lookup tree for interfaces and caches them, whereas type intersections are resolved recursively on every check pass.',
      metadata: { type: 'architecture', title: 'Compiler Performance Optimization' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Interface vs Type Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is Declaration Merging, and which type definition tool supports it?\nA: Declaration Merging is the process by which the TypeScript compiler automatically merges multiple separate declarations of the same name into a single type definition. This capability is **exclusive to interfaces**. If you define `interface User` twice in the same scope, the compiler combines their fields. Type aliases cannot be redefined and will throw a duplicate identifier compilation error.'
    },
    {
      type: 'faq',
      content: 'Q: Why do interfaces extends perform better in terms of compiler speeds compared to type intersections (&) in large systems?\nA: Interfaces establish a flat cached lookup tree inside the compiler. When type checking occurrences, the compiler simply looks up the flat cache index. In contrast, type intersections (`&`) require the compiler to recursively inspect and resolve every nested structure, validating compatibility inline. For huge type trees, this recursive check causes significant compiler lag and slows down IDE auto-completion.'
    },
    {
      type: 'faq',
      content: 'Q: What happens if you try to override a property with an incompatible type using interface extends vs type intersection (&)?\nA: If you try to override a property with an incompatible type using `interface extends`, the compiler will throw an immediate type validation error at compile-time. If you use a type intersection (`&`), the compiler will allow the merge but resolve the conflicting property to the impossible `never` type. This means the object can never be instantiated at runtime, creating a silent and confusing bug.'
    }
  ]
};
