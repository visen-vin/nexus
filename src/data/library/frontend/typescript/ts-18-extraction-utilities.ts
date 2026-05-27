import type { NoteContent } from '../../../types';
import extractionUtilitiesSvg from '../../../../assets/diagrams/frontend/typescript/extraction-utilities.svg?raw';

export const content: NoteContent = {
  id: 'ts-18',
  moduleId: 'ts',
  order: 93,
  group: 'Type System Core',
  title: 'Extraction Utilities',
  description: 'Detailed breakdown of TypeScript\'s type extraction utilities: Exclude, Extract, NonNullable, ReturnType, and Parameters. Master conditional type inferences for advanced operations.',
  sections: [
    {
      type: 'diagram',
      content: extractionUtilitiesSvg
    },
    {
      type: 'text',
      content: 'While core utilities work on modifying or slicing object interface shapes, **Extraction Utilities** operate primarily on **unions** and **function signatures**. They allow you to pull out specific parameters, extract return types, filter union types, or strip away nullability.\n\nThese utilities are built entirely using advanced conditional types (`T extends U ? X : Y`) and compiler type inference (`infer`). Understanding their internals empowers you to dissect third-party library signatures and capture precise type bindings dynamically, ensuring your code remains extremely dry.'
    },
    {
      type: 'callout',
      content: 'Utilities like `ReturnType` and `Parameters` will throw a compile error if applied directly to a function identifier without querying its type. You must prepend the `typeof` keyword inside the brackets: `ReturnType<typeof myFunc>` instead of `ReturnType<myFunc>`.',
      metadata: { type: 'warning', title: 'Static Query Prerequisite' }
    },
    {
      type: 'heading',
      content: '1. Filtering Unions: Exclude, Extract, NonNullable',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'These utilities utilize the distributive nature of conditional types when applied to union inputs, filtering out matching or non-matching components of a type:'
    },
    {
      type: 'code',
      content: `type T1 = "a" | "b" | "c";

// Exclude<T, U> -> Subtracts keys matching U from T
// Under the hood: type Exclude<T, U> = T extends U ? never : T;
type Excluded = Exclude<T1, "c">; // "a" | "b"

// Extract<T, U> -> Extracts only keys matching U from T
// Under the hood: type Extract<T, U> = T extends U ? T : never;
type Extracted = Extract<T1, "a" | "z">; // "a"

// NonNullable<T> -> Strips null and undefined from union
// Under the hood: type NonNullable<T> = T extends null | undefined ? never : T;
type NullableVal = string | number | null | undefined;
type ClearVal = NonNullable<NullableVal>; // string | number`,
      metadata: { language: 'typescript', title: 'Union Filters' }
    },
    {
      type: 'heading',
      content: '2. Deconstructing Functions: ReturnType & Parameters',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'These utilities use the `infer` keyword inside a conditional check to pluck out structural components of a function signature:'
    },
    {
      type: 'code',
      content: `function fetchConfig(id: number, active: boolean) {
  return { endpoint: "https://api", active };
}

// Parameters<T> -> Gathers function arguments into a strict tuple type
// Under the hood: type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never;
type FetchArgs = Parameters<typeof fetchConfig>; 
// Result: [id: number, active: boolean]

// ReturnType<T> -> Extracts the return shape
// Under the hood: type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any;
type FetchResponse = ReturnType<typeof fetchConfig>;
// Result: { endpoint: string; active: boolean; }`,
      metadata: { language: 'typescript', title: 'Deconstructing Function Signatures' }
    },
    {
      type: 'callout',
      content: 'Using `ReturnType` on third-party libraries allows you to dynamically type API response models even when the package creator does not export the return interface. Simply pluck the type from the query or dispatch function: `type ResponseData = ReturnType<typeof axios.get>;`.',
      metadata: { type: 'architecture', title: 'Dynamic API Binding Architecture' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Extraction Mastery Prep' }
    },
    {
      type: 'faq',
      content: 'Q: How does the infer keyword operate inside the ReturnType utility?\nA: The `infer` keyword is a compiler directive used inside a conditional type check `T extends (...) => infer R ? R : any`. It instructs the compiler to perform type inference on the return position of the function `T` and bind that inferred shape to the placeholder variable `R`. If the check succeeds, it returns `R`.'
    },
    {
      type: 'faq',
      content: 'Q: What is distributive conditional type behavior, and how does it power Exclude?\nA: Distributive behavior occurs when a generic type parameter `T` is a union type (e.g. `A | B | C`) and is evaluated against a conditional check `T extends U`. TypeScript distributes the union, evaluating each member independently: `(A extends U ? never : A) | (B extends U ? never : B)`. Since unioning with `never` drops it, the matching members are filtered out, which is exactly how `Exclude` operates.'
    },
    {
      type: 'faq',
      content: 'Q: How can you write a custom utility type to extract the resolved value of a Promise using infer?\nA: You can define an unwrapper utility using conditional types: `type UnwrappedPromise<T> = T extends Promise<infer U> ? U : T;`. If `T` extends `Promise`, the compiler infers the internal type parameters and binds it to `U`, returning `U`. Otherwise, it falls back to the original type `T`.'
    }
  ]
};
