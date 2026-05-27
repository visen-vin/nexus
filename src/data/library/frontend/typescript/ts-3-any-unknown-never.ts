import type { NoteContent } from '../../../types';
import anyUnknownNeverSvg from '../../../../assets/diagrams/frontend/typescript/any-unknown-never.svg?raw';

export const content: NoteContent = {
  id: 'ts-3',
  moduleId: 'ts',
  order: 78,
  group: 'Type System Core',
  title: 'any, unknown, never',
  description: 'In-depth analysis of any, unknown, and never. Explore type safety vectors, narrowing unknown properties, never as a bottom type representing impossible states, and exhaustiveness checks.',
  sections: [
    {
      type: 'text',
      content: 'In type theory, a type system can be defined in part by its extreme boundaries: the **Top Type** (which sits at the apex of the type hierarchy and can represent *any* value) and the **Bottom Type** (which sits at the absolute base of the hierarchy and represents *no* value, or an empty set). \n\nTypeScript provides two distinct Top Types: `any` and `unknown`, and a single Bottom Type: `never`. Understanding the mechanical differences and assignment permissions of these types is fundamental to writing bulletproof, production-grade applications that preserve type-safety boundaries.'
    },
    {
      type: 'diagram',
      content: anyUnknownNeverSvg
    },
    {
      type: 'callout',
      content: 'In standard set theory, a **Top Type** (often denoted as ⊤ or "universal set") is a type that is a supertype of all other possible types. A **Bottom Type** (denoted as ⊥ or "empty set") is a subtype of all other possible types. Understanding TypeScript types as sets helps clarify why assignment permissions flow the way they do.',
      metadata: { type: 'architecture', title: 'The Set Theory Model of Types' }
    },
    {
      type: 'heading',
      content: '1. The Top Types: any vs. unknown',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Although both `any` and `unknown` can hold any value, their type-safety profiles are diametrically opposed:\n\n*   **`any` (The Escape Hatch):** Sitting at the top of the type system, `any` is a wildcard that tells the compiler to turn off type checking entirely. Crucially, `any` acts as both a *supertype* (you can assign anything to it) and a *subtype* (you can assign it to anything, except `never`). This bidirectional assignment violates structural subtyping rules and bypasses the compiler, leading to silent propagation of untyped code and runtime crashes.\n*   **`unknown` (The Safe Container):** Introduced in TypeScript 3.0, `unknown` is the type-safe representation of a value whose shape we do not yet know. While you can assign *any* value to `unknown` (making it a true Top Type), you cannot assign `unknown` to any other type (except `any` or `unknown`), nor can you access its properties, call its methods, or construct instances without first validating its structure through **Type Narrowing**.'
    },
    {
      type: 'heading',
      content: 'Type-Safe Narrowing of unknown',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'Because the compiler refuses to perform operations on a value of type `unknown`, we must narrow the type to a specific concrete shape before interacting with it. Standard mechanisms include:\n\n1.  **Type Predicates / Custom Guards:** Hand-crafted verification functions using the `arg is TargetType` syntax.\n2.  **`typeof` & `instanceof` Checks:** Leveraging standard JavaScript runtime type operators.\n3.  **Assertion Signatures:** Using `asserts arg is TargetType` to throw runtime exceptions if validation fails.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// Production-Grade Safe JSON Parsing and API Validation
// ============================================================================

export interface UserProfile {
  id: string;
  username: string;
  roles: ('admin' | 'billing' | 'user')[];
  settings: {
    theme: 'light' | 'dark';
    notificationsEnabled: boolean;
  };
}

/**
 * A highly resilient, custom type guard to validate an 'unknown' payload
 * against the UserProfile structural contract.
 */
export function isUserProfile(payload: unknown): payload is UserProfile {
  if (typeof payload !== 'object' || payload === null) {
    return false;
  }

  // Cast to standard record to check property existence safely
  const candidate = payload as Record<string, unknown>;

  // 1. Validate primitive fields
  if (typeof candidate.id !== 'string' || typeof candidate.username !== 'string') {
    return false;
  }

  // 2. Validate nested object structure
  if (typeof candidate.settings !== 'object' || candidate.settings === null) {
    return false;
  }
  const settings = candidate.settings as Record<string, unknown>;
  if (
    settings.theme !== 'light' && settings.theme !== 'dark' ||
    typeof settings.notificationsEnabled !== 'boolean'
  ) {
    return false;
  }

  // 3. Validate array structure and item types
  if (!Array.isArray(candidate.roles)) {
    return false;
  }
  const allowedRoles = ['admin', 'billing', 'user'];
  const hasValidRoles = candidate.roles.every(
    (role: unknown) => typeof role === 'string' && allowedRoles.includes(role)
  );

  return hasValidRoles;
}

/**
 * Fetches data from an untrusted source, typing the initial response as 'unknown'
 * to enforce safe validation before the data is allowed into the application.
 */
export async function safeFetchUserProfile(endpoint: string): Promise<UserProfile> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(\`Network error: \${response.statusText}\`);
  }

  // Fetch response is typed as 'unknown' rather than 'any'
  const rawData: unknown = await response.json();

  if (isUserProfile(rawData)) {
    // TypeScript has narrowed 'rawData' from 'unknown' to 'UserProfile'!
    return rawData;
  }

  throw new TypeError('API payload does not conform to UserProfile schema');
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'The use of `any` acts as a viral contagion in your codebase. If a function returns `any`, any variable assigned its result is implicitly typed as `any`, turning off compiler checks for downstream code. Prefer `unknown` for raw API responses, user inputs, and dynamic library configurations.',
      metadata: { type: 'warning', title: 'The Contagion of any' }
    },
    {
      type: 'heading',
      content: '2. The Bottom Type: never',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'In type systems, the **Bottom Type** `never` sits at the absolute base of the hierarchy. It represents the *empty set*—a state that can never exist. Because no values can exist in an empty set, you can never assign a value to `never` (except another `never` value). \n\nHowever, because it sits at the bottom, `never` is an implicit subtype of *every other type*. This structural behavior makes `never` incredibly powerful for two key paradigms:\n\n1.  **Exhaustiveness Checking:** Forcing compile-time confirmation that every member of a discriminated union is explicitly handled.\n2.  **Impossible States Representation:** Typing functions that never complete (e.g. throwing an error or running infinite loops), or trimming invalid branches in generic conditional types.'
    },
    {
      type: 'heading',
      content: 'Compile-Time Union Exhaustiveness Checking',
      metadata: { level: 3 }
    },
    {
      type: 'text',
      content: 'When working with unions (such as actions in a state reducer or block layouts), we can map all valid branches in a `switch` statement. By assigning the falling-through `default` branch to a variable typed as `never`, we ensure that if a new member is added to the union in the future, the compiler will instantly trigger an error because the new member cannot be assigned to the empty set (`never`).'
    },
    {
      type: 'code',
      content: `// ============================================================================
// Exhaustive Union Mapper for Core System Events
// ============================================================================

export interface UserLoginEvent {
  type: 'USER_LOGIN';
  userId: string;
  timestamp: number;
}

export interface UserLogoutEvent {
  type: 'USER_LOGOUT';
  userId: string;
}

export interface DataFetchEvent {
  type: 'DATA_FETCH';
  query: string;
}

// Discriminated union of possible events
export type SystemEvent = UserLoginEvent | UserLogoutEvent | DataFetchEvent;

/**
 * Handles all events exhaustively. 
 * If a new event is added to the SystemEvent union but not handled here,
 * the compiler will fail to build.
 */
export function processSystemEvent(event: SystemEvent): string {
  switch (event.type) {
    case 'USER_LOGIN':
      return \`User \${event.userId} logged in at \${event.timestamp}\`;
      
    case 'USER_LOGOUT':
      return \`User \${event.userId} logged out\`;
      
    case 'DATA_FETCH':
      return \`Query initiated: "\${event.query}"\`;

    default: {
      // Exhaustiveness check!
      // If all event types are handled, 'event' is narrowed to 'never' here.
      // If a new event type (e.g., 'SYSTEM_REBOOT') is added to SystemEvent but not handled,
      // 'event' will be of that type, causing a compile error:
      // Type 'SystemRebootEvent' is not assignable to type 'never'.
      const exhaustiveCheck: never = event;
      throw new Error(\`Unhandled event detected: \${JSON.stringify(exhaustiveCheck)}\`);
    }
  }
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Functions that throw runtime errors or execute infinite loops should be typed as returning `never` rather than `void`. While `void` represents a function returning undefined, `never` explicitly tells the compiler that the function will never return control back to its caller. This allows TypeScript to perform advanced reachability and dead-code analysis.',
      metadata: { type: 'runtime', title: 'never vs. void Return Signatures' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Top and Bottom Type Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the fundamental difference between any and unknown in terms of type safety and assignments?\nA: Both `any` and `unknown` can accept any value (acting as supertypes). However, `any` is completely unchecked: it can also be assigned to any other type (except `never`) without assertions, bypassing all type checking and letting runtime errors propagate silently. `unknown`, on the other hand, is strictly checked: it cannot be assigned to any other type (except `any` or `unknown`), and you cannot invoke methods, read properties, or instantiate it without first narrowing the type via type guards, assertions, or conditional blocks.'
    },
    {
      type: 'faq',
      content: 'Q: How does the "never" type enable compile-time exhaustiveness checking in unions?\nA: Because `never` represents the bottom type (empty set), no value other than `never` itself can be assigned to it. When typing a default branch in a switch statement (or an else block) as `never` (`const _check: never = value`), the compiler validates that all union types have been exhaustively narrowed by prior case branches. If a new member is added to the union later, the compiler will infer that the unhandled type falls through to the default branch. Since that type cannot be assigned to `never`, it flags a compile-time error, preventing missing branches.'
    },
    {
      type: 'faq',
      content: 'Q: What is the semantic difference between functions returning "void" and those returning "never"?\nA: A function returning `void` completes successfully but returns no meaningful value (in JavaScript, it implicitly returns `undefined`). A function returning `never` **never returns control back to the caller**. This occurs either because the function throws a runtime exception, enters an infinite loop, or terminates the process. Typetheoretically, `never` allows the compiler to perform advanced reachability analysis, flagging code after the `never` function call as unreachable.'
    },
    {
      type: 'faq',
      content: 'Q: Why is double casting (e.g., value as unknown as TargetType) sometimes preferred over a single cast (value as TargetType)?\nA: A single type assertion (e.g., `value as TargetType`) is only permitted in TypeScript if there is an overlapping structural relationship between the current type of `value` and `TargetType` (meaning one is a subtype/supertype of the other). If the types have absolutely no overlap, TypeScript blocks the direct assertion to prevent developer error. By casting to `unknown` first (which is compatible with all types as the top type), you break the validation chain, allowing you to force-cast to any desired `TargetType`.'
    }
  ]
};
