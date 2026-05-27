import type { NoteContent } from '../../../types';
import functionOverloadsSvg from '../../../../assets/diagrams/frontend/typescript/function-overloads.svg?raw';

export const content: NoteContent = {
  id: 'ts-9',
  moduleId: 'ts',
  order: 84,
  group: 'Type System Core',
  title: 'Function Overloads',
  description: 'In-depth analysis of TypeScript Function Overloads. Master compile-time call signatures, understand implementation routing boundaries, organize overload ordering, and evaluate unions vs overloads.',
  sections: [
    {
      type: 'text',
      content: 'In highly flexible Javascript libraries, a single function frequently accepts varying combinations of arguments and yields distinct return types based on those inputs. For example, a function might accept a single timestamp number and return a `Date` object, or accept three numbers (year, month, day) and also return a `Date` object. \n\n**Function Overloads** provide a type-safe way to model this behavior in TypeScript. An overload system separates the **Compile-Time Interface** from the **Runtime Execution**. You declare multiple **Overload Signatures** that describe the valid call configurations visible to consumers. You then write a single **Implementation Signature** whose function body contains type-narrowing routing logic designed to handle all potential inputs. This bridges Javascript\'s dynamic nature with static type safety, preventing invalid parameter combinations at compile-time.'
    },
    {
      type: 'diagram',
      content: functionOverloadsSvg
    },
    {
      type: 'callout',
      content: 'Overload signatures exist strictly at compile-time and are completely erased during type erasure. The implementation signature must be compatible with *all* overload signatures, but it is invisible to callers and cannot be invoked directly.',
      metadata: { type: 'architecture', title: 'The Overload Visibility Boundary' }
    },
    {
      type: 'heading',
      content: 'Overload Ordering & Specificity',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When a function call occurs, TypeScript evaluates overload signatures sequentially from **top to bottom**. It commits to the first signature that matches the call parameters. \n\nTherefore, you must always order your overloads from **most specific to most general**. If you place a wide, general signature at the top, it will intercept all calls, masking the tighter signatures beneath it and causing compile checks to fail.'
    },
    {
      type: 'heading',
      content: 'Unions vs. Overloads (When to choose which)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A common mistake is using function overloads when simple **union parameters** would suffice. Overloads should be reserved strictly for cases where the **return type of the function changes dynamically based on the input arguments**. If the return type is the same regardless of whether you pass a string or a number, union types are much cleaner, simpler to read, and perform faster.'
    },
    {
      type: 'heading',
      content: 'Production-Grade API Client & Date Coordinator',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases a dual-configured Date coordinator and an overloaded API request coordinator that validates dynamic configuration configurations.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Example A: Date Coordinator (Varying Argument Counts)
// ============================================================================
// Overload 1: Single timestamp parameter
export function makeDate(timestamp: number): Date;

// Overload 2: Fully detailed year, month, day parameters
export function makeDate(year: number, month: number, day: number): Date;

// Implementation Signature (Handles both shapes internally)
// Note: This signature is NOT directly callable. It must be wide enough to accept all overloads.
export function makeDate(
  yearOrTimestamp: number,
  month?: number,
  day?: number
): Date {
  if (month !== undefined && day !== undefined) {
    return new Date(yearOrTimestamp, month, day);
  }
  return new Date(yearOrTimestamp);
}

// Client usage
const d1 = makeDate(1716912000000); // ✓ Compiles, resolved to Overload 1
const d2 = makeDate(2026, 4, 28);   // ✓ Compiles, resolved to Overload 2
// const d3 = makeDate(2026, 4);     // ❌ COMPILE ERROR: No overload matches this signature!

// ============================================================================
// 2. Example B: API Request Coordinator (Varying Argument and Return Types)
// ============================================================================
export interface JSONRequest {
  url: string;
  format: 'json';
}

export interface TextRequest {
  url: string;
  format: 'text';
}

// Overload A: JSON Request returns parsed Object
export function sendRequest<T = unknown>(config: JSONRequest): Promise<T>;

// Overload B: Text Request returns raw string
export function sendRequest(config: TextRequest): Promise<string>;

// Implementation Signature
export async function sendRequest<T>(
  config: JSONRequest | TextRequest
): Promise<T | string> {
  const response = await fetch(config.url);
  
  if (config.format === 'json') {
    return response.json() as Promise<T>;
  }
  
  return response.text();
}

// Client usage
async function run() {
  // Returns parsed user object automatically
  const user = await sendRequest<{ name: string }>({ 
    url: '/api/user', 
    format: 'json' 
  });
  console.log(user.name); // Full autocomplete!

  // Returns raw string automatically
  const rawHTML = await sendRequest({ 
    url: '/api/page', 
    format: 'text' 
  });
  console.log(rawHTML.toUpperCase()); // Raw string autocomplete!
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'The implementation signature must contain union types or optional parameters that completely encompass every possible combination declared in the overload signatures. If the implementation signature is narrower than any single overload, the compiler will throw a compatibility mismatch error.',
      metadata: { type: 'warning', title: 'The Implementation Mismatch Catch' }
    },
    {
      type: 'callout',
      content: 'Always prioritize union parameters over overloads when return types remain static. Declaring `function double(x: number): number; function double(x: string): number;` is an architectural smell; simplify it to `function double(x: number | string): number`.',
      metadata: { type: 'runtime', title: 'Union Parameters Preference' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Function Overloads Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What are Overload Signatures and how do they differ from the Implementation Signature?\nA: Overload Signatures are compile-time declarations that define the public interfaces of a function. They dictate what parameters are valid and what specific return types correspond to them. They are fully visible to callers and shown in IDE tooltips. The Implementation Signature is the actual code block that contains the function body. It must accept parameters wide enough to cover all overloads, but it is invisible to callers and cannot be executed directly.'
    },
    {
      type: 'faq',
      content: 'Q: Why is the ordering of overload signatures critical, and what is the consequence of incorrect ordering?\nA: TypeScript evaluates overload signatures sequentially from top to bottom and resolves to the first matching signature. If you place a wide, general signature above a tight, specific signature, the general signature will intercept all matching calls, masking the tighter signature beneath it. This makes it impossible for callers to reach the more specific overload, typically resulting in incorrect return type inferences.'
    },
    {
      type: 'faq',
      content: 'Q: When should you prefer using a Union parameter type over Function Overloads?\nA: You should prefer union parameters when the return type of the function is identical regardless of the input argument types (e.g. `function log(x: string | number): void`). You should only use function overloads when the return type changes dynamically based on the specific combination of input arguments (e.g., passing a "json" config returns an object, while passing "text" returns a string).'
    }
  ]
};
