import type { NoteContent } from '../../../types';
import mappedTypesSvg from '../../../../assets/diagrams/frontend/typescript/mapped-types.svg?raw';

export const content: NoteContent = {
  id: 'ts-15',
  moduleId: 'ts',
  order: 90,
  group: 'Type System Core',
  title: 'Mapped Types',
  description: 'Detailed exploration of Mapped Types. Master iterating through property keys, applying and removing modifiers like readonly and optional, and utilizing key remapping with the "as" keyword.',
  sections: [
    {
      type: 'diagram',
      content: mappedTypesSvg
    },
    {
      type: 'text',
      content: 'In TypeScript, **Mapped Types** allow you to create new types by transforming properties from an existing type. If you think of generics as functions that accept types as arguments, Mapped Types are like loops that iterate over a union of string literals (typically gathered via `keyof`) to construct new object structures property-by-property.\n\nThis capability allows you to avoid declaring repetitive interface shapes (like making all fields optional, readonly, or nullable). Mapped types operate using the syntax `[K in Keys]`, where `Keys` is a union of string/number/symbol literal types, and `K` is a type variable representing the current key in the iteration.'
    },
    {
      type: 'callout',
      content: 'Mapped types can only be declared using type aliases (`type`), not interfaces. Attempting to use mapped type syntax inside an `interface` declaration will trigger a fatal compiler syntax error.',
      metadata: { type: 'warning', title: 'Type Alias Restriction' }
    },
    {
      type: 'code',
      content: `// 1. Base interface
interface User {
  id: string;
  name: string;
  email?: string;
}

// 2. A mapped type that makes all properties Readonly and Optional
type CustomPartial<T> = {
  readonly [K in keyof T]?: T[K];
};

type ReadonlyOptionalUser = CustomPartial<User>;
/*
Evaluates to:
type ReadonlyOptionalUser = {
  readonly id?: string;
  readonly name?: string;
  readonly email?: string;
}
*/`,
      metadata: { language: 'typescript', title: 'Basic Mapped Type Transformation' }
    },
    {
      type: 'heading',
      content: 'Modifier Adjustments (+ and -)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Mapped types allow you to add or remove property modifiers like `readonly` and `?` using the prefix operators `+` and `-`. If you do not specify a prefix, it defaults to adding (`+`). For example, you can remove the optional status `?` from properties by utilizing `-?`, making all properties strictly required.'
    },
    {
      type: 'code',
      content: `// 1. Remove optional modifier from all keys (-?)
type Concrete<T> = {
  [K in keyof T]-?: T[K];
};

type StrictUser = Concrete<User>;
/*
Evaluates to:
type StrictUser = {
  id: string;
  name: string;
  email: string; // "email?" became "email"
}
*/

// 2. Remove readonly modifier from all keys (-readonly)
type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};`,
      metadata: { language: 'typescript', title: 'Adding and Removing Modifiers' }
    },
    {
      type: 'heading',
      content: 'Key Remapping with "as"',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'TypeScript allows you to re-map or rename keys inside a mapped type using the `as` clause. Combined with **Template Literal Types**, you can automatically transform property names, such as turning standard properties into getter/setter function signatures or namespace prefixes.'
    },
    {
      type: 'code',
      content: `// Key remapping: transform property names into getters
type Getters<T> = {
  [K in keyof T as \`get\${Capitalize<string & K>}\`]: () => T[K];
};

type UserGetters = Getters<User>;
/*
Evaluates to:
type UserGetters = {
  getId: () => string;
  getName: () => string;
  getEmail: () => string | undefined;
}
*/`,
      metadata: { language: 'typescript', title: 'Key Remapping via "as"' }
    },
    {
      type: 'callout',
      content: 'Key remapping can also filter out keys. By returning the `never` type in the `as` clause, you can exclude specific keys from the resulting object, providing a powerful, programmatic way to construct dynamic type slices.',
      metadata: { type: 'architecture', title: 'Key Filtering Mechanics' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Mapped Types Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is Key Remapping in TypeScript mapped types, and what keyword is used to implement it?\nA: Key Remapping allows you to rename or filter keys during mapped type iteration. It is implemented using the **`as`** keyword after the iteration clause (e.g., `[K in keyof T as NewKeyType]`). This allows you to apply transformations (like template literal string casing changes) or omit keys entirely by mapping them to the `never` type.'
    },
    {
      type: 'faq',
      content: 'Q: Explain how the modifiers -readonly and -? operate inside a mapped type.\nA: The minus `-` prefix serves as a subtraction operator for property modifiers during transformation. `-readonly` strips away any existing `readonly` constraints from keys, making them mutable in the new type. `-?` strips away the optional question mark modifier, making all optional fields strictly required in the generated type.'
    },
    {
      type: 'faq',
      content: 'Q: Can you map properties using dynamic keys other than string literals (e.g. symbol or number)?\nA: Yes! TypeScript mapped types support indexing over arbitrary union literal types containing `string | number | symbol`. You can use `[K in string]` or `[K in keyof any]` to iterate over all possible property keys, which forms the core mechanism of the built-in `Record<K, T>` utility type.'
    }
  ]
};
