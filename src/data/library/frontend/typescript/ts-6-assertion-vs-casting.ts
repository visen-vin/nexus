import type { NoteContent } from '../../../types';
import assertionVsCastingSvg from '../../../../assets/diagrams/frontend/typescript/assertion-vs-casting.svg?raw';

export const content: NoteContent = {
  id: 'ts-6',
  moduleId: 'ts',
  order: 81,
  group: 'Type System Core',
  title: 'Assertion vs. Casting',
  description: 'In-depth analysis of Type Assertions vs traditional Type Casting. Master compile-time as-assertions, double assertion bypasses, const assertions literal freezing, and non-null operator risks.',
  sections: [
    {
      type: 'text',
      content: 'In statically-typed programming languages (like Java, C++, or C#), **Type Casting** is a runtime mechanism that can modify the physical memory layout of an object or perform runtime checks that throw exceptions if compatibility boundaries are breached. \n\nIn TypeScript, **Type Casting does not exist**. Because JavaScript is a dynamic, untyped runtime, TypeScript type checks exist exclusively at compile-time. Instead, TypeScript provides **Type Assertions** (`as Type` or the legacy angle-bracket `<Type>` syntax). An assertion is a purely compile-time directive that tells the compiler: "trust me, I have verified the shape of this value, and it matches this type." Because assertions are completely stripped during compilation (type erasure), they have absolutely zero runtime performance cost and execute no runtime validations or memory transformations.'
    },
    {
      type: 'diagram',
      content: assertionVsCastingSvg
    },
    {
      type: 'callout',
      content: 'Using a type assertion (`as`) is essentially silencing the compiler. If you assert an object to a specific interface but the object is missing those fields at runtime, JavaScript will fail silently or throw a `TypeError: Cannot read properties of undefined` crash.',
      metadata: { type: 'warning', title: 'The Silent Crash Trap' }
    },
    {
      type: 'heading',
      content: 'Double Assertion Bypasses',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'TypeScript prevents you from performing wild, impossible assertions between completely unrelated types (e.g. asserting a `string` directly to a `number`). If you must force this conversion, you must use a **Double Assertion** by converting the value to the universal `unknown` type first, and then to the target type: `value as unknown as UnrelatedType`.'
    },
    {
      type: 'heading',
      content: 'Const Assertions (as const)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Introduced in TypeScript 3.4, **Const Assertions** (`as const`) provide a powerful way to lock down object structures and arrays. When you apply `as const` to a literal expression:\n1. Primitive types are narrowed to their literal values (e.g., `'active'` instead of `string`).\n2. Object properties become strictly `readonly` recursively.\n3. Array literals are frozen, becoming strictly sized `readonly` tuples.'
    },
    {
      type: 'heading',
      content: 'Production-Grade Configuration & Assertion Structures',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases standard assertions, double assertions, non-null assertions, and the massive capability of `as const` for type-safe routing definitions.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Compile-Time Assertions vs Casting
// ============================================================================
export interface APIResponse {
  status: string;
  payload: unknown;
}

export interface User {
  id: string;
  name: string;
  role: 'admin' | 'user';
}

export function handleApiResponse(response: APIResponse) {
  // We assert that payload matches the User structure because we trust our backend contract
  const user = response.payload as User;
  
  // Compiled JS output is simply: const user = response.payload;
  // Zero runtime overhead!
  return \`User role is: \${user.role.toUpperCase()}\`;
}

// ============================================================================
// 2. The Unrelated Type Assertion & The Double Assertion Bypasses
// ============================================================================
export function forceUnrelatedTypeConversion(input: string): number {
  // Doing: const num = input as number; // ❌ COMPILE ERROR: Unrelated shapes!
  
  // Double assertion overrides the safety barrier
  const num = input as unknown as number; // ✓ Compiles, but HIGHLY DANGEROUS!
  return num;
}

// ============================================================================
// 3. Const Assertions (as const) - Deep Literal Freezing
// ============================================================================
// Creating a strictly locked-down routing config
export const APP_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ROLES: ['admin', 'moderator', 'user']
} as const; // Recursive readonly literal lock!

// Let's inspect the types generated:
// type OF APP_ROUTES.HOME is strictly "/" (not string)
// type OF APP_ROUTES.ROLES is strictly readonly ["admin", "moderator", "user"] (a tuple, not string[])

// APP_ROUTES.HOME = '/new-home'; // ❌ COMPILE ERROR: Cannot assign because it is readonly!
// APP_ROUTES.ROLES.push('guest'); // ❌ COMPILE ERROR: Property 'push' does not exist on readonly tuple!

// Extracting a union type directly from the const assertion!
export type AppRole = typeof APP_ROUTES.ROLES[number]; // Union: "admin" | "moderator" | "user"

// ============================================================================
// 4. Non-Null Assertion Operator (!) vs Safe Verification
// ============================================================================
export function renderProfileImage(user: User | null) {
  // Bad practice: Non-null assertion (!) overrides compiler checks
  // If user is null, this will crash with TypeError at runtime!
  // const badName = user!.name;

  // Good practice: Proper fallback or narrowing guard
  if (!user) {
    return '/assets/fallback-avatar.png';
  }
  
  return \`/assets/avatar-\${user.id}.png\`;
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Double assertions (`as unknown as Type`) should be reserved strictly for low-level library wrappers or testing mocks. Overusing them in standard business logic is a critical architectural smell that bypasses the compiler, neutralizing TypeScript\'s core safety guarantees.',
      metadata: { type: 'architecture', title: 'The Double Assertion Smell' }
    },
    {
      type: 'callout',
      content: 'Never use the non-null assertion operator (`!`) inside event listeners or async callbacks where data load states depend on HTTP networks. If the API fails or latency delays the payload, the code will trigger an uncaught runtime exception immediately.',
      metadata: { type: 'runtime', title: 'Non-Null Operator Risks' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Assertion Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the fundamental difference between Type Assertion and Type Casting?\nA: Type Casting (found in C#, C++, or Java) performs actual runtime operations. It can convert the physical memory representation of an object or perform type checks that throw exceptions if invalid. Type Assertion (e.g. `as Type` in TypeScript) is purely a compile-time compiler hint. It tells the compiler to treat a value as a specific type during static checking, but it is completely erased during compilation, having zero runtime footprint or validation.'
    },
    {
      type: 'faq',
      content: 'Q: What is a Double Assertion in TypeScript, and why is it considered highly dangerous in production applications?\nA: A Double Assertion is the process of casting a value to `unknown` first, and then to an unrelated type (e.g., `value as unknown as UnrelatedType`). It is required because the compiler blocks direct assertions between unrelated shapes. It is highly dangerous because it completely overrides the type safety checker, forcing the compiler to accept a potentially invalid shape, which can lead to silent `TypeError` crashes at runtime.'
    },
    {
      type: 'faq',
      content: 'Q: What does the "as const" assertion accomplish, and how does it benefit configuration definitions?\nA: The "as const" assertion (Const Assertion) locks down literal expressions. It: (1) Narrows primitive fields to their specific string/number literal values (preventing them from widening to `string` or `number`). (2) Marks all properties of an object literal as `readonly` recursively. (3) Transforms array literals into strictly sized `readonly` tuples. This guarantees that key configuration configurations cannot be modified at runtime.'
    }
  ]
};
