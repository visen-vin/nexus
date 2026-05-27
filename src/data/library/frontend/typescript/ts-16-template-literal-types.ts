import type { NoteContent } from '../../../types';
import templateLiteralTypesSvg from '../../../../assets/diagrams/frontend/typescript/template-literal-types.svg?raw';

export const content: NoteContent = {
  id: 'ts-16',
  moduleId: 'ts',
  order: 91,
  group: 'Type System Core',
  title: 'Template Literal Types',
  description: 'Detailed exploration of Template Literal Types. Master building dynamic string combinations, automating styles, Redux actions, API paths, and utilizing intrinsic casing helpers like Capitalize and Uppercase.',
  sections: [
    {
      type: 'diagram',
      content: templateLiteralTypesSvg
    },
    {
      type: 'text',
      content: 'Introduced in TypeScript 4.1, **Template Literal Types** build on top of string literal types, allowing you to interpolate other types into a string signature. The syntax is identical to JavaScript\'s ES6 template literals (backticks and `\${}`), but it operates exclusively in the type system.\n\nWhen a type is interpolated, if it is a union type, the template literal type performs a **cross-product multiplication** (distributive behavior), generating a union of every possible string combination. This makes it an incredibly powerful tool for modeling complex, strict string protocols such as CSS class combinations, Redux action strings, dynamic API endpoints, or database query patterns.'
    },
    {
      type: 'callout',
      content: 'Be careful when interpolating large union types. If union `A` has 20 options and union `B` has 20 options, interpolating them as `\`\${A}\${B}\`` will generate 400 string literal types. If the total number of combinations exceeds 100,000, TypeScript will throw a compile error to prevent infinite loops and compiler crashes.',
      metadata: { type: 'warning', title: 'Combinatorial Explosion' }
    },
    {
      type: 'code',
      content: `// 1. Redux-style action generation
type ActionType = "create" | "update" | "delete";
type Domain = "user" | "order" | "product";

// 2. Cross-multiply unions into actions
type ReduxAction = \`\${Domain}_\${ActionType}\`;
/*
Evaluates to a strict union of 9 literal types:
type ReduxAction = 
  | "user_create" | "user_update" | "user_delete"
  | "order_create" | "order_update" | "order_delete"
  | "product_create" | "product_update" | "product_delete"
*/`,
      metadata: { language: 'typescript', title: 'Redux Action Helper' }
    },
    {
      type: 'heading',
      content: 'Intrinsic Casing Helpers',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'TypeScript provides four built-in (intrinsic) type helpers that allow you to manipulate string cases. Because they are intrinsic, they are implemented directly in the compiler\'s core code to guarantee speed and efficiency:\n\n1. **`Uppercase<StringType>`**: Converts all characters to uppercase.\n2. **`Lowercase<StringType>`**: Converts all characters to lowercase.\n3. **`Capitalize<StringType>`**: Capitalizes the first character.\n4. **`Uncapitalize<StringType>`**: Converts the first character to lowercase.'
    },
    {
      type: 'code',
      content: `type Event = "click" | "hover";

// Capitalize helper combined with template literals
type EventHandlers = {
  [K in Event as \`on\${Capitalize<K>}\`]: (e: MouseEvent) => void;
};
/*
Evaluates to:
type EventHandlers = {
  onClick: (e: MouseEvent) => void;
  onHover: (e: MouseEvent) => void;
}
*/`,
      metadata: { language: 'typescript', title: 'Casing Transformation with Mapped Types' }
    },
    {
      type: 'callout',
      content: 'Template literal types are not just for concatenating strings. When combined with conditional types and the `infer` keyword, you can parse and extract subsets of a string dynamically. This allows you to construct fully type-safe parsers for query strings, route paths (e.g. `/user/:id`), or even mini SQL queries entirely at compile-time!',
      metadata: { type: 'architecture', title: 'Dynamic String Parsing Architecture' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Template Literal Type Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What happens when you pass non-string unions (e.g. number or boolean) into a template literal type?\nA: TypeScript automatically stringifies them. For example, if you declare `type SafeBool = \`status-\${boolean}\``, the type system distributes the boolean union and evaluates the shape to `"status-true" | "status-false"`. If a number union is passed, it compiles to literal digit strings.'
    },
    {
      type: 'faq',
      content: 'Q: How do you parse route parameters from a URL path template using template literal types?\nA: By using a recursive conditional type combined with `extends` and `infer`. For example:\n`type ExtractParams<S extends string> = S extends \`\${string}/:\${infer Param}/\${infer Rest}\` ? Param | ExtractParams<Rest> : S extends \`\${string}/:\${infer Param}\` ? Param : never;`\nWhen applied to `"/users/:userId/books/:bookId"`, it evaluates to `"userId" | "bookId"`.'
    },
    {
      type: 'faq',
      content: 'Q: What is the combinatorial limit of template literal type expansion, and how does the compiler protect itself?\nA: The compiler has a hard-coded limit of **100,000** elements for generated union types. If a cross-multiplication template expands beyond this limit, compilation fails immediately to prevent extreme memory leaks and IDE crashes.'
    }
  ]
};
