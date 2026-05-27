import type { NoteContent } from '../../../types';
import genericsMentalModelSvg from '../../../../assets/diagrams/frontend/typescript/generics-mental-model.svg?raw';

export const content: NoteContent = {
  id: 'ts-10',
  moduleId: 'ts',
  order: 85,
  group: 'Type System Core',
  title: 'Generics Mental Model',
  description: 'Establish a rock-solid mental model of TypeScript Generics. Learn to treat Generics as parameters for types, master compiler type inference rules, and build referential structural contracts.',
  sections: [
    {
      type: 'text',
      content: 'In statically-typed systems, a common dilemma is balancing **safety** and **reusability**. If we write a function that only accepts class `User`, it is highly type-safe but completely useless for other shapes. If we write it to accept `any` or `unknown`, it is highly reusable but we completely lose the compile-time type safety connection between inputs and outputs. \n\n**Generics** elegantly solve this. The core mental model is simple: **Generics are variables for types**, just like standard function parameters are variables for values. Instead of locking down a specific, rigid type, you declare a generic type parameter placeholder (traditionally `<T>`). When a consumer executes the function, the compiler automatically captures the type of the argument passed, binds it to `<T>` dynamically, and uses it to establish strict, referential type contracts across parameters, return structures, and internal class values.'
    },
    {
      type: 'diagram',
      content: genericsMentalModelSvg
    },
    {
      type: 'callout',
      content: 'TypeScript Generics are a purely compile-time construct. Just like interfaces and type assertions, generic parameter configurations are completely stripped away during JavaScript compilation (type erasure), resulting in zero runtime performance overhead.',
      metadata: { type: 'architecture', title: 'Generics Runtime Impact' }
    },
    {
      type: 'heading',
      content: 'Referential Type Locking',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The primary superpower of Generics is establishing **referential type relationships**. By utilizing the same type parameter in multiple locations (e.g. `(arg: T) => T`), you instruct the compiler that the output type is guaranteed to be identical to the input type. If a caller passes a `string`, the compiler narrows the output to `string`, preserving full type-safe autocomplete capabilities downstream.'
    },
    {
      type: 'heading',
      content: 'Type Parameter Inference',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'In most situations, you do not need to explicitly declare type arguments (like writing `identity<string>(\'hello\')`). TypeScript\'s compiler is highly intelligent and automatically **infers** the type parameter based on the values passed as arguments, keeping codebase consumption clean and readable. \n\nHowever, in cases where the type parameter cannot be inferred (e.g., initial state setups like `useState(null)` or fetching parsed API payloads), developers must supply type parameters explicitly to guide the compiler.'
    },
    {
      type: 'heading',
      content: 'Production-Grade API Client & Reusable Box Container',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases a type-safe generic API Client, a reusable state container class, and how type parameter inference works.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Reusable Generic Container (The Box)
// ============================================================================
// T is a type parameter variable. It acts as a placeholder.
export class DataBox<T> {
  private content: T;

  constructor(initialValue: T) {
    this.content = initialValue;
  }

  getValue(): T {
    return this.content;
  }

  setValue(newValue: T): void {
    this.content = newValue;
  }
}

// Construction with Type Parameter Inference
// The compiler automatically infers T as 'string' based on 'hello'
const stringBox = new DataBox('hello');
const strValue = stringBox.getValue().toUpperCase(); // ✓ String autocompletes work!

// Construction with Explicit Type Parameters
// Required when type cannot be inferred or when we want to enforce a union shape
export interface GuestUser { name: string; guestId: string; }
const unionBox = new DataBox<GuestUser | null>(null);
unionBox.setValue({ name: 'Kunwaravi', guestId: 'g_0021' });

// ============================================================================
// 2. Generic API Client (Referential Safety)
// ============================================================================
export interface NetworkResult<PayloadType> {
  success: boolean;
  data: PayloadType;
  timestamp: number;
}

// A generic async fetch helper
export async function fetchJsonPayload<T>(url: string): Promise<NetworkResult<T>> {
  const response = await fetch(url);
  const data = await response.json();
  
  return {
    success: response.ok,
    data: data as T, // Type assertion required to bridge dynamic JSON
    timestamp: Date.now()
  };
}

// Client usage
export interface Product { id: string; price: number; }

async function loadProducts() {
  // Explicitly passing Product[] because fetch cannot infer the database shape
  const result = await fetchJsonPayload<Product[]>('/api/v1/products');
  
  if (result.success) {
    // Full autocomplete on Product arrays!
    result.data.map(p => console.log(p.price));
  }
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'Do not use generic type parameters if the type parameter is only declared in a single location inside the function signature (e.g. `function log<T>(message: T): void`). If a generic is not establishing a referential relationship between multiple arguments or return formats, it is an architectural smell. Simplify it to a standard union type: `message: unknown`.',
      metadata: { type: 'warning', title: 'The Single-Declaration Smell' }
    },
    {
      type: 'callout',
      content: 'When writing generic classes, static members cannot access class-level type parameters. Since static fields are initialized on class load before instances are created, they cannot participate in instance-level dynamic type mappings.',
      metadata: { type: 'runtime', title: 'Static Generic Limitations' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Generics Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the core mental model of TypeScript Generics, and why are they extremely useful?\nA: The core mental model is that Generics are variables designed specifically for types, just as function parameters are variables designed for values. Instead of using rigid types (which limits reuse) or using `any` (which destroys type safety), Generics allow us to create highly reusable abstractions that automatically capture passed argument shapes, establishing safe, referential type contracts across inputs, outputs, and classes.'
    },
    {
      type: 'faq',
      content: 'Q: What is Type Parameter Inference, and when is a developer required to write explicit type parameters instead?\nA: Type Parameter Inference is the compiler\'s ability to automatically deduce what type argument corresponds to `<T>` based on the runtime arguments passed to the function (e.g., passing "hello" infers `T = string`). A developer must write explicit type parameters when the compiler has no value-level arguments to infer from—such as initial state settings (e.g., `useState<User | null>(null)`) or parsing dynamic HTTP responses (e.g., `fetchJsonPayload<Product>("/api")`).'
    },
    {
      type: 'faq',
      content: 'Q: Why is using a generic type parameter considered an anti-pattern if the parameter is only declared once in the signature (e.g., function log&lt;T&gt;(x: T): void)?\nA: The sole purpose of Generics is to establish referential contracts (linking the type of one parameter to another, or to the return type). If a type parameter is only declared once, it is not establishing any relationships. It adds unnecessary compilation complexity and decreases readability. It should be simplified to standard type boundaries like unions or primitives (e.g. `x: unknown`).'
    }
  ]
};
