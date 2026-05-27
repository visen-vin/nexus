import type { NoteContent } from '../../../types';
import conditionalTypesSvg from '../../../../assets/diagrams/frontend/typescript/conditional-types.svg?raw';

export const content: NoteContent = {
  id: 'ts-14',
  moduleId: 'ts',
  order: 89,
  group: 'Type System Core',
  title: 'Conditional Types',
  description: 'Detailed exploration of Conditional Types and the infer keyword. Master type checks using T extends U ? X : Y, capturing parameters inline via infer, and constructing dynamic output schemas.',
  sections: [
    {
      type: 'text',
      content: `At the heart of advanced TypeScript lies the ability to perform compile-time logic. **Conditional Types** introduce ternary decision-making directly into the type system, mimicking runtime \`condition ? trueVal : falseVal\` expressions. Expressed as \`T extends U ? X : Y\`, the compiler evaluates whether the type \`T\` is structurally assignable to \`U\`. If the assignability check holds true, the type resolves to \`X\`; otherwise, it resolves to \`Y\`.

This mechanism allows you to build highly dynamic, self-configuring API clients, state management solutions, and form validators. When coupled with the **\`infer\`** keyword, conditional types become even more potent, enabling you to extract and capture nested type parameters (such as the return type of a function, the resolved value of a Promise, or the item type of an array) on the fly without manual declarations.`
    },
    {
      type: 'diagram',
      content: conditionalTypesSvg
    },
    {
      type: 'callout',
      content: `Conditional Types are evaluated at compile time. They operate purely on type signatures and emit zero runtime footprint, meaning they completely disappear during compilation to JavaScript.`,
      metadata: { type: 'architecture', title: 'Pure Compile-Time Logic' }
    },
    {
      type: 'heading',
      content: 'The Power of Type Inference (infer)',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: `The **\`infer\`** keyword is a special declarator that can *only* be used inside the conditional check portion of a conditional type. It tells the compiler: "Introduce a new generic placeholder type variable here, and during assignability checking, discover and bind the exact nested type that exists at this position."

For instance, if you want to inspect a function signature and extract its return type, you can use:
\`\`\`ts
type GetReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
\`\`\`
If \`T\` matches a function, TypeScript infers its exact return type and binds it to \`R\`, which is then returned in the truthy branch.`
    },
    {
      type: 'heading',
      content: 'Distributive Conditional Types',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: `A critical behavior of conditional types is **distribution**. When the type being checked is a "naked" type parameter (a simple generic parameter \`T\` without surrounding wrappers like arrays, promises, or tuples) and a union type (e.g., \`A | B | C\`) is passed into it, the check distributes across each member of the union:

\`\`\`ts
// (A | B) extends U ? X : Y resolves to:
(A extends U ? X : Y) | (B extends U ? X : Y)
\`\`\`

This distributive behavior is how TypeScript's utility types like \`Exclude<T, U>\` and \`Extract<T, U>\` operate under the hood. To disable distribution and evaluate the union as a single consolidated entity, you must wrap both sides of the \`extends\` check in square brackets, forming a tuple: \`[T] extends [U] ? X : Y\`.`
    },
    {
      type: 'heading',
      content: 'Production-Grade API Response & Handler Transformer',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: `The following TypeScript module showcases the union of conditional types, multi-level \`infer\` captures, and the suppression of union distribution using tuple wrapping.`
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Unwrap Promise / Nested Types
// ============================================================================
export type Unwrap<T> = T extends Promise<infer U>
  ? Unwrap<U> // Recursively unwrap nested promises
  : T extends (...args: any[]) => infer R
  ? Unwrap<R> // Recursively unwrap function return types
  : T;

// Client Verification
type P1 = Unwrap<Promise<string>>;             // Inferred as: string
type P2 = Unwrap<() => Promise<number>>;       // Inferred as: number
type P3 = Unwrap<Promise<Promise<boolean>>>;   // Inferred as: boolean (Recursive!)

// ============================================================================
// 2. Extracting Function Parameters & Constructor Arguments
// ============================================================================
export type FirstParameter<T> = T extends (first: infer P, ...args: any[]) => any
  ? P
  : never;

type FetchUser = (id: string, active: boolean) => Promise<{ name: string }>;
type UserID = FirstParameter<FetchUser>;       // Inferred as: string

// ============================================================================
// 3. Non-Distributive Union Checking
// ============================================================================
// Naked conditional type (distributive)
type DistributiveCheck<T> = T extends any ? T[] : never;
type D1 = DistributiveCheck<string | number>; // Inferred as: string[] | number[]

// Wrapped conditional type (non-distributive)
type NonDistributiveCheck<T> = [T] extends [any] ? T[] : never;
type N1 = NonDistributiveCheck<string | number>; // Inferred as: (string | number)[]

// Practical check: Does T represent exactly the union "string | number"?
type IsStrictUnion<T> = [string | number] extends [T]
  ? [T] extends [string | number]
    ? true
    : false
  : false;

type Test1 = IsStrictUnion<string | number>;   // Inferred as: true
type Test2 = IsStrictUnion<string>;            // Inferred as: false`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: `A common pitfall with the \`infer\` keyword is using it outside of the conditional check section. The compiler will trigger an immediate syntax error if you attempt to declare \`infer\` in the truthy or falsy result branches.`,
      metadata: { type: 'warning', title: 'Incorrect infer Scope' }
    },
    {
      type: 'callout',
      content: `When building recursive conditional types (like deeply unwrapping objects or arrays), always define a clear base-case exit path (e.g., returning \`T\`) to prevent the TypeScript compiler from throwing maximum instantiation depth errors.`,
      metadata: { type: 'runtime', title: 'Recursion Depth Management' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Conditional Types & infer Mastery' }
    },
    {
      type: 'faq',
      content: `Q: What is a Conditional Type in TypeScript and how does it differ from runtime ternary statements?
A: A Conditional Type evaluates the structural assignability of types at compile time using the \`T extends U ? X : Y\` syntax. While it resembles runtime ternaries, it has zero runtime existence. It performs static analysis to resolve types based on assignability, allowing developers to define dynamic, input-sensitive type contracts that align with concrete structural parameters.`
    },
    {
      type: 'faq',
      content: `Q: What is the role of the "infer" keyword, and where can it be legally declared?
A: The \`infer\` keyword is used to declare an inline type placeholder variable within the \`extends\` check of a conditional type. During type checking, the compiler infers the actual type parameter that fits that position and binds it to the declared variable. It can only be legally declared within the conditional check portion of a ternary and is typically used to extract function arguments, promise payloads, or array element types.`
    },
    {
      type: 'faq',
      content: `Q: What are Distributive Conditional Types? How do you disable this distribution behavior when evaluating unions?
A: Distributive Conditional Types occur when a naked type parameter (e.g., a simple generic \`T\`) is evaluated against a union type. TypeScript automatically distributes the evaluation across every member of the union, returning a union of the results (e.g., \`(A | B) extends U ? X : Y\` becomes \`(A extends U ? X : Y) | (B extends U ? X : Y)\`). To disable this and treat the union as a single consolidated entity, you must wrap both the checked type and target constraint in square brackets (e.g., \`[T] extends [U] ? X : Y\`).`
    },
    {
      type: 'faq',
      content: `Q: Can "infer" be used recursively in TypeScript? Provide an example of how this is useful in FAANG-scale applications.
A: Yes, \`infer\` can be used recursively within conditional types. This is highly useful in production-level codebases for deep type operations, such as unpacking deep Promise chains, flattening multi-dimensional arrays, or resolving deeply nested API handler return types. For example, a recursive unwrapper like \`Unwrap<T> = T extends Promise<infer U> ? Unwrap<U> : T\` resolves deeply nested promise types to their raw payloads regardless of the nesting depth.`
    }
  ]
};
