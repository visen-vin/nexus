import type { NoteContent } from '../../../types';
import typeGuardsSvg from '../../../../assets/diagrams/frontend/typescript/type-guards.svg?raw';

export const content: NoteContent = {
  id: 'ts-4',
  moduleId: 'ts',
  order: 79,
  group: 'Type System Core',
  title: 'Type Guards & Narrowing',
  description: 'Deep dive into TypeScript\'s type narrowing pipelines. Master built-in guards (typeof, instanceof, in), construct type predicates, and leverage assertion functions to enforce runtime boundaries.',
  sections: [
    {
      type: 'text',
      content: 'In highly dynamic applications, we frequently deal with values that possess multiple potential types (represented as Union Types, like `string | number` or `User | Admin`). While unions allow flexibility, they present a challenge: the TypeScript compiler restricts access to only the fields shared across *all* union members. \n\n**Type Narrowing** is the process by which TypeScript analyzes runtime control flow to deduct a more specific type within a specific conditional scope. **Type Guards** are special expressions that perform runtime checks, signaling to the compiler that a value conforms to a specific subtype. Once a type guard is successfully evaluated, the compiler refines the type boundary, granting full autocomplete and compile-safe access to subtype properties without needing manual assertions.'
    },
    {
      type: 'diagram',
      content: typeGuardsSvg
    },
    {
      type: 'callout',
      content: 'TypeScript does not perform magic type narrowing. It leverages standard JavaScript runtime checks (like `typeof` and `instanceof`) and maps them directly to the static compiler tree, bridging Javascript execution with strict type safety.',
      metadata: { type: 'architecture', title: 'The Static-Runtime Bridge' }
    },
    {
      type: 'heading',
      content: 'Built-in Type Guards (Native Operators)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'TypeScript supports four native JavaScript operators to narrow types out of the box:\n1. **`typeof`**: Evaluates primitive types. (Warning: `typeof null` returns `"object"` in JavaScript, a famous legacy runtime pitfall).\n2. **`instanceof`**: Evaluates prototype inheritance chains (checking if an object was constructed from a specific Class).\n3. **`in`**: Evaluates if a key property exists structurally on an object.\n4. **Equality narrowing (`===`, `!==`)**: Performs simple literal value narrowing.'
    },
    {
      type: 'heading',
      content: 'User-Defined Type Guards (Type Predicates)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When writing helper functions to validate complex custom object structures (like API payloads), standard boolean return helpers are insufficient. If you write `function isUser(val: any): boolean`, the compiler only understands that the function returns a boolean; it does not narrow the type of the argument inside the calling block.\n\nTo solve this, TypeScript provides **Type Predicates**. By defining the return type signature as `parameterName is Type`, you instruct the compiler that if the function returns `true`, it must narrow the variable to `Type` inside that conditional block.'
    },
    {
      type: 'heading',
      content: 'Production-Grade API Payload Narrowing',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases native type narrowing, user-defined type predicates, and custom assertion functions designed to validate dynamic API responses safely.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Domain Interfaces
// ============================================================================
export interface Admin {
  id: string;
  role: 'admin';
  adminKey: string;
}

export interface Customer {
  id: string;
  role: 'customer';
  loyaltyPoints: number;
}

export interface Guest {
  id: string;
  role: 'guest';
}

export type User = Admin | Customer | Guest;

// ============================================================================
// 2. Built-in Type Guards (typeof & in operator)
// ============================================================================
export function processInput(input: string | number | null) {
  // typeof Primitive Guard
  if (typeof input === 'string') {
    // TypeScript knows input is strictly 'string' here
    return input.toUpperCase();
  }
  
  if (typeof input === 'number') {
    // TypeScript knows input is strictly 'number' here
    return input.toFixed(2);
  }

  // input is 'null' here
  return 'No valid input';
}

export function handleUserRole(user: User) {
  // The 'in' structural guard: Checks if key exists on object
  if ('adminKey' in user) {
    // TypeScript automatically narrows user to Admin!
    return \`Admin Access Granted. Admin Key: \${user.adminKey}\`;
  }

  if ('loyaltyPoints' in user) {
    // TypeScript narrows user to Customer!
    return \`Customer loyalty points: \${user.loyaltyPoints}\`;
  }

  // Remaining type is inferred as Guest
  return 'Guest access restricted.';
}

// ============================================================================
// 3. User-Defined Type Guard (Type Predicate)
// ============================================================================
// The signature "user is Admin" is the Type Predicate.
// Returning true tells the compiler to treat the argument as Admin.
export function isAdmin(user: User): user is Admin {
  return user.role === 'admin' && 'adminKey' in user;
}

export function dispatchSecureMetrics(user: User) {
  if (isAdmin(user)) {
    // Compiles perfectly! "user" is narrowed to Admin
    return executeAdminReport(user.adminKey);
  }
  
  return 'Denied.';
}

function executeAdminReport(key: string) {
  return \`Report metrics decrypted using: \${key}\`;
}

// ============================================================================
// 4. Assertion Functions (asserts value is Type)
// ============================================================================
// Great for testing and runtime throwing of bad validations.
// If this function returns without throwing an error, the compiler assumes
// the value is of the defined type for the remainder of the block.
export function assertIsAdmin(user: User): asserts user is Admin {
  if (user.role !== 'admin' || !('adminKey' in user)) {
    throw new Error('Security Violation: User is not an Administrator.');
  }
}

export function executeRestrictedQuery(user: User) {
  // Call assertion function
  assertIsAdmin(user);
  
  // From this line onward, "user" is strictly treated as Admin!
  // No if-statement or casting required!
  return \`Query output generated for key: \${user.adminKey}\`;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Never rely on user-defined type predicates without implementing robust runtime checks inside the function body. A type predicate is a **contract** with the compiler. If you return `true` but don\'t actually validate the fields, the compiler will accept it blindly, resulting in silent `TypeError: undefined is not a function` runtime crashes.',
      metadata: { type: 'warning', title: 'The Type Predicate Honesty Contract' }
    },
    {
      type: 'callout',
      content: 'Avoid using `instanceof` with plain JavaScript object literals or JSON responses fetched over HTTP. JSON payloads are deserialized as plain objects (`Object.prototype`) and do not possess prototype class relations, which makes `instanceof Class` checks return `false` at runtime.',
      metadata: { type: 'runtime', title: 'The JSON instanceof Trap' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Type Guards Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is a Type Predicate in TypeScript, and how does it differ from a standard boolean-returning helper?\nA: A standard boolean helper (`isUser(val: any): boolean`) only communicates to the compiler that it returns a boolean value; it does not narrow the type of the argument in the calling scope. A Type Predicate uses the specific signature `parameterName is Type` (e.g. `user is Admin`). If the function returns `true`, the compiler refines the type of the passed variable to `Type` within the active conditional branch, granting full type safety.'
    },
    {
      type: 'faq',
      content: 'Q: Why is instanceof unsafe to use for validating HTTP JSON responses?\nA: `instanceof` checks prototype inheritance chains in memory (e.g., verifying if the object was created using `new ClassName()`). HTTP JSON responses are serialized as text and parsed in the browser via `JSON.parse()`, which produces plain JavaScript objects. Because these objects do not possess the class prototype reference, `instanceof` will evaluate to `false` at runtime, making it ineffective for external payloads.'
    },
    {
      type: 'faq',
      content: 'Q: What is an Assertion Function in TypeScript, and when should it be preferred over a Type Predicate?\nA: An assertion function utilizes the `asserts value is Type` signature. Instead of returning a boolean, it throws an error if validation fails. If it completes without throwing, the compiler assumes the value matches `Type` for the *remainder of the block* (no if-block nesting required). It should be preferred in validation modules, security gateways, and unit tests where failing to meet type expectations is an exceptional, fatal error.'
    }
  ]
};
