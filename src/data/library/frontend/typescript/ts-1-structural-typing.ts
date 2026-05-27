import type { NoteContent } from '../../../types';
import structuralTypingSvg from '../../../../assets/diagrams/frontend/typescript/structural-typing.svg?raw';

export const content: NoteContent = {
  id: 'ts-1',
  moduleId: 'ts',
  order: 76,
  group: 'Type System Core',
  title: 'Structural Typing',
  description: 'Deep dive into TypeScript\'s structural typing model. Contrast it with nominal typing systems, understand type shape compatibility rules, master excess property checks, and dissect structural subtyping inside function signatures.',
  sections: [
    {
      type: 'text',
      content: 'Type systems in programming languages generally fall into two primary paradigms: **Nominal Typing** and **Structural Typing**. \n\nIn nominal systems (such as Java, C#, or C++), type compatibility is determined strictly by explicit declarations and name matches. Two classes with identical fields and methods are completely incompatible unless they share an explicit inheritance tree. \n\n**TypeScript** utilizes a **Structural Typing** model (often described as duck typing: "if it walks like a duck and quacks like a duck, it is a duck"). In a structural system, type compatibility is determined solely by the *shape* and *members* of the types. If an object contains all the properties defined in an interface with compatible types, TypeScript considers the object fully compatible with that interface, regardless of its class hierarchy or name declarations.'
    },
    {
      type: 'diagram',
      content: structuralTypingSvg
    },
    {
      type: 'callout',
      content: 'Structural typing is a deliberate architectural decision in TypeScript. Because JavaScript is highly dynamic and frequently uses object literals, structural typing provides a natural, low-friction integration with native JavaScript patterns, allowing developers to model dynamic API payloads without compiling explicit, bloated class hierarchies.',
      metadata: { type: 'architecture', title: 'Why TypeScript is Structural' }
    },
    {
      type: 'heading',
      content: 'Type Shape Compatibility & Subtyping',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Under structural subtyping, a type `S` is compatible with a type `T` if `S` has at least all the properties of `T`, with compatible types. In formal set theory, `S` is a **subtype** of `T` because it is "more specific" (it contains more structural details).'
    },
    {
      type: 'heading',
      content: 'Excess Property Checks',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'One of the most common points of confusion in TypeScript is **Excess Property Checking**. While a type is structurally compatible even if it contains *extra* properties, TypeScript applies stricter rules when assigning **direct object literals**. \n\nIf you assign an object literal directly to a type, TypeScript throws a compiler error if the literal contains any properties not declared in the target type. This is a design choice to catch developer typos (like misspelling optional properties). However, if you assign the literal to an intermediate variable first, and then assign that variable to the type, the excess property check is bypassed, and structural typing compatibility takes over.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Core Shapes & Structural Compatibility
// ============================================================================
export interface Vector2D {
  x: number;
  y: number;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

// Function accepting 2D vectors
export function renderPoint2D(point: Vector2D) {
  return \`Point at X: \${point.x}, Y: \${point.y}\`;
}

// 3D vector satisfies all criteria of a 2D vector
const point3D: Vector3D = { x: 10, y: 20, z: 30 };

// Compiles perfectly! Vector3D is structurally a subtype of Vector2D
renderPoint2D(point3D);

// ============================================================================
// 2. Excess Property Check Mechanics
// ============================================================================
// Case A: Direct Object Literal Assignment (Triggers Check)
// Will cause a compilation error because 'z' is unrecognized inside Vector2D
// const pointA: Vector2D = { x: 5, y: 10, z: 15 }; // ❌ ERROR: 'z' does not exist in Vector2D

// Case B: Bypassing via Intermediate Variable (Bypasses Check)
// The intermediate variable 'pointObject' is typed by inference as { x: number, y: number, z: number }
const pointObject = { x: 5, y: 10, z: 15 };

// Compiles perfectly! Structural typing is satisfied because pointObject contains 'x' and 'y'.
const pointB: Vector2D = pointObject; // ✓ SUCCESS

// ============================================================================
// 3. Subtyping inside Function Signatures
// ============================================================================
type VectorCallback2D = (v: Vector2D) => void;
type VectorCallback3D = (v: Vector3D) => void;

function executeCallback(cb: VectorCallback3D) {
  cb({ x: 1, y: 2, z: 3 });
}

// Can we pass a 2D callback to a function expecting a 3D callback?
const log2D: VectorCallback2D = (v) => console.log(v.x, v.y);

// Yes! A function accepting fewer arguments or less specific structures (Vector2D)
// is perfectly safe to receive a more specific structure (Vector3D) at runtime.
executeCallback(log2D); // ✓ SUCCESS`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Excess property checks are disabled when the target type accepts index signatures (e.g. `[key: string]: any`). Since the type declares it can accept arbitrary properties, TypeScript lets object literals bypass excess checks completely.',
      metadata: { type: 'runtime', title: 'Index Signatures and Excess Checks' }
    },
    {
      type: 'callout',
      content: 'TypeScript classes are also evaluated structurally! If class `Car` and class `Bike` contain the identical fields and methods, you can assign an instance of `Bike` to a variable typed as `Car`. However, there is a catch: if the class contains any **private or protected members**, their structural compatibility breaks, and nominal-like strictness is enforced.',
      metadata: { type: 'warning', title: 'The Private Member Class Catch' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Type System Core Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the fundamental difference between Nominal and Structural typing systems?\nA: In a nominal typing system (like Java or C#), type equivalence is determined strictly by the explicit name and package namespace of the class or interface. In a structural typing system (like TypeScript), compatibility is determined entirely by the *shape* and *properties* of the types. If class A and class B are named differently but have identical properties and methods, structural typing considers them identical and fully interchangeable.'
    },
    {
      type: 'faq',
      content: 'Q: What is the purpose of TypeScript\'s "Excess Property Checks" and why does it only trigger on direct object literals?\nA: Excess property checks are a design feature designed to catch developer mistakes and spelling errors. When you assign an object literal directly to a type (e.g., `const user: User = { name: "Abhi", agee: 25 }`), TypeScript validates that all properties correspond to the type declaration. If it allowed excess properties on direct literals, typos like `agee` would go uncaught. It only runs on direct literals because intermediate variables are inferred to have wider types, where stripping properties implicitly could break runtime structures.'
    },
    {
      type: 'faq',
      content: 'Q: Do TypeScript classes follow structural typing rules? If so, are there any exceptions?\nA: Yes, TypeScript classes are evaluated strictly by their shape and structure rather than their class name. You can assign a `new Dog()` to a `Cat` type if they have compatible members. The critical exception is **private or protected fields**. When a class has a private member (e.g., `private id: string`), TypeScript requires that the private member originate from the *exact same* class definition, effectively converting that class into a nominal type compatibility-wise.'
    }
  ]
};
