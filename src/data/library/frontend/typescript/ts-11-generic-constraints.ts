import type { NoteContent } from '../../../types';
import genericConstraintsSvg from '../../../../assets/diagrams/frontend/typescript/generic-constraints.svg?raw';

export const content: NoteContent = {
  id: 'ts-11',
  moduleId: 'ts',
  order: 86,
  group: 'Type System Core',
  title: 'Generic Constraints',
  description: 'Deep dive into TypeScript Generic Constraints. Master structural boundaries using the extends keyword, type-safe property lookups via keyof constraints, and default generic parameters.',
  sections: [
    {
      type: 'text',
      content: 'While TypeScript Generics provide exceptional reusability, open-ended type parameters (`<T>`) present a critical limitation: because `T` can represent absolutely *any* type, the compiler blocks you from accessing specific properties or executing methods on it. If you attempt to access `x.length` or `x.getId()`, the compiler throws an error because it cannot guarantee the passed type has those fields. \n\n**Generic Constraints** resolve this by placing structural boundaries on type parameters. By using the **`extends`** keyword inside the type parameter declaration (e.g., `<T extends Lengthwise>`), you restrict the types that can be bound to `T`. The compiler now guarantees that `T` has at least the properties defined in the constraint, granting safe access to those fields. When combined with the **`keyof`** operator (e.g., `<K extends keyof T>`), generic constraints allow developers to build extremely tight, type-safe dynamic getters, mappers, and state synchronizers.'
    },
    {
      type: 'diagram',
      content: genericConstraintsSvg
    },
    {
      type: 'callout',
      content: 'Generic Constraints declare a **minimum structural requirement**. Because TypeScript is structural, any object that contains *at least* the fields declared in the constraint interface will pass validation, even if it possesses excess fields.',
      metadata: { type: 'architecture', title: 'Minimum Structural Contracts' }
    },
    {
      type: 'heading',
      content: 'Type-Safe Property Lookups (K extends keyof T)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A classic JavaScript pattern is retrieving a property from an object dynamically (e.g. `function getProperty(obj, key) { return obj[key]; }`). In vanilla JS, if the key is misspelled, it silently returns `undefined` at runtime. \n\nTo make this type-safe, we couple two generic parameters. We declare `<T>` for the object, and **`<K extends keyof T>`** for the key. This tells the compiler that the parameter `key` must be a valid key of the object `T`. The return type is then inferred strictly as `T[K]`, ensuring perfect type propagation.'
    },
    {
      type: 'heading',
      content: 'Production-Grade Dynamic Object Mapper & Key Lookups',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases structural extends constraints, keyof property routers, and default type fallback parameters.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Structural Extends Constraint
// ============================================================================
export interface Lengthwise {
  length: number;
}

// T must satisfy at least the Lengthwise structure
export function logLengthwise<T extends Lengthwise>(item: T): void {
  // Compiles perfectly! The compiler guarantees '.length' exists.
  console.log(\`Length of item is: \${item.length}\`);
}

// Client usage
logLengthwise([1, 2, 3]);       // ✓ Arrays have .length
logLengthwise('hello');         // ✓ Strings have .length
logLengthwise({ length: 42 });  // ✓ Custom objects containing .length work
// logLengthwise(8821);         // ❌ COMPILE ERROR: Number does not have .length!

// ============================================================================
// 2. Type-Safe Property Getter (K extends keyof T)
// ============================================================================
// Returns the exact subtype T[K] dynamically
export function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

export interface User {
  id: string;
  name: string;
  age: number;
}

const activeUser: User = {
  id: 'usr_228',
  name: 'Kunwaravi',
  age: 26
};

// Autocompletes key parameters and correctly infers return types!
const username = getProperty(activeUser, 'name'); // Inferred as: string
const userAge = getProperty(activeUser, 'age');   // Inferred as: number
// const badField = getProperty(activeUser, 'typo'); // ❌ COMPILE ERROR: Argument 'typo' is not assignable to 'id' | 'name' | 'age'!

// ============================================================================
// 3. Default Generic Parameters
// ============================================================================
// Allows providing a default type boundary fallback if none is specified or inferred
export interface APIResponse<T = string> {
  status: number;
  payload: T; // Defaults to string
}

const textResponse: APIResponse = {
  status: 200,
  payload: 'Success message' // Inferred as string
};

const jsonResponse: APIResponse<User> = {
  status: 200,
  payload: activeUser // Strictly validated as User
};`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Never write a generic constraint that is overly wide (e.g. `<T extends any>`). Doing so defeats the entire purpose of a constraint, allowing unsafe variables to pass through and disabling compiler property validations.',
      metadata: { type: 'warning', title: 'The wide Constraint Smell' }
    },
    {
      type: 'callout',
      content: 'When mixing default generics and constraints, the constraint must be declared first: `<T extends Lengthwise = string[]>`. Declaring default fallbacks before the extends constraint will trigger a compile-time syntax error.',
      metadata: { type: 'runtime', title: 'Syntax Declaration Order' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Generic Constraints Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is a Generic Constraint in TypeScript, and what keyword is used to enforce it?\nA: A Generic Constraint is a structural boundary placed on a generic type parameter, restricting the types that can be assigned to it. It is enforced using the **`extends`** keyword (e.g., `<T extends Lengthwise>`). Once constrained, the compiler guarantees that the type parameter possesses at least the properties defined in the constraint interface, granting safe access to those fields inside the function/class body.'
    },
    {
      type: 'faq',
      content: 'Q: Explain the mechanics of the &lt;K extends keyof T&gt; type signature. How does it improve property lookups?\nA: The `<K extends keyof T>` signature couples two type parameters. `T` represents an object shape, and `keyof T` gathers a union of all literal keys defined on `T`. The constraint `K extends keyof T` declares that the parameter `K` must be one of those valid keys. The return type of the lookup is then inferred as `T[K]`. This guarantees compile-time validation of object keys and ensures perfect type propagation, preventing misspelling errors that silently return `undefined` at runtime.'
    },
    {
      type: 'faq',
      content: 'Q: Can you mix default generic parameters with extends constraints? If so, what is the required syntax order?\nA: Yes, you can mix them. The extends constraint must always be declared first, followed by the default assignment (e.g., `<T extends Lengthwise = string[]>`). Reversing this order (e.g. `<T = string[] extends Lengthwise>`) is a syntax violation and will throw a compilation crash.'
    }
  ]
};
