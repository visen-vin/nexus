import type { NoteContent } from '../../../types';
import compilationErasureSvg from '../../../../assets/diagrams/frontend/typescript/compilation-erasure.svg?raw';

export const content: NoteContent = {
  id: 'ts-2',
  moduleId: 'ts',
  order: 77,
  group: 'Type System Core',
  title: 'Compilation & Type Erasure',
  description: 'Detailed exploration of the TypeScript compiler (tsc) pipeline, from AST parsing and type checking to JS emission, downleveling, and type erasure mechanics.',
  sections: [
    {
      type: 'text',
      content: 'In standard compiled languages (like Rust, C++, or Go), types dictate memory allocation, struct layouts, and CPU instructions. In **TypeScript**, types exist strictly for the developer during static analysis. At runtime, they are completely obliterated.\n\nThis behavior is known as **Type Erasure**. The primary engine driving this lifecycle is the TypeScript compiler (`tsc`). Understanding the internals of the `tsc` compiler pipeline and how it downlevels syntax while erasing static typing constructs is essential to mastering performance-sensitive web application architecture.'
    },
    {
      type: 'diagram',
      content: compilationErasureSvg
    },
    {
      type: 'callout',
      content: 'The Type Checker and the Emitter are isolated subsystems inside `tsc`. Unlike traditional compilers where a type mismatch terminates the compile pipeline immediately, `tsc` will proudly output transpiled JavaScript even if it discovers syntax or semantic type check errors. This design philosophy honors JavaScript\'s highly flexible nature, allowing developers to execute partial, slightly broken code during active local development iterations (unless `--noEmitOnError` is explicitly enabled).',
      metadata: { type: 'architecture', title: 'Isolation of Verification vs. Generation' }
    },
    {
      type: 'heading',
      content: 'The tsc Compiler Pipeline Internals',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The execution of `tsc` is segmented into five core stages, orchestrated by a program controller:\n\n1. **Parsing (Source to AST):** The scanner reads individual characters from source files, converting them into a stream of lexical tokens. The parser then parses this token stream into an **Abstract Syntax Tree (AST)**, mapping parent-child structural relationships.\n2. **Binding (AST to Symbols):** The Binder processes the AST nodes and links declarations to **Symbols**. A symbol represents a named entity (e.g. variable, class, interface) and keeps track of all declarations that contribute to its definition. These are stored inside the file\'s **Symbol Table**.\n3. **Type Checking (The Checker Engine):** The Checker is the massive heart of the compiler. It performs semantic checks by traversing the AST, resolving variable references via the symbol tables, validating type shape compatibility, and ensuring safety rules are met. This is where your type errors are calculated.\n4. **Downleveling & Transpilation:** If your compilation target is older than the syntax used (e.g. targeting ES5 but using ESNext features like async/await, optional chaining, or classes), `tsc` transforms these complex syntax tree structures into equivalent, polyfilled syntax structures suitable for the destination environment.\n5. **Emitting (Type Erasure & Generation):** The Emitter prints the final AST back to actual output files. It generates plain JavaScript (`.js`), sourcemaps (`.js.map`), and declaration headers (`.d.ts`). Crucially, in this final print step, all types, interfaces, generics, type signatures, and type annotations are completely ignored and erased.'
    },
    {
      type: 'heading',
      content: 'The Runtime Footprint: Classes vs. Interfaces',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Because of type erasure, we must recognize which TypeScript declarations have a **runtime footprint** and which evaporate into thin air:\n\n* **Fully Erased Constructs (Zero Footprint):** Interfaces, type aliases, generic type parameters, function return signatures, and type assertions leave exactly *zero* bytes in the output JavaScript. They cannot be queried or inspected at runtime.\n* **Emitted Constructs (Runtime Footprint):** Classes, variables, functions, and standard enums remain intact. A class in TypeScript compiles to a JavaScript prototype structure or native class, meaning it has a constructor function and prototype methods that can be inspected at runtime.'
    },
    {
      type: 'callout',
      content: 'Using standard structural interfaces prevents runtime checks via operator keywords like `instanceof`. Attempting `x instanceof UserInterface` is a syntax error because interfaces do not survive the emitter stage. To solve this, developers must create user-defined Type Guards (using `typeof`, `in`, or value-tag discriminators) or switch to a class model, which provides a physical constructor function for runtime verification.',
      metadata: { type: 'warning', title: 'The Interface instanceof Trap' }
    },
    {
      type: 'heading',
      content: 'Advanced Compilation, Decorators, and Reflective Metadata',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Legacy Experimental Decorators (via `experimentalDecorators` and `emitDecoratorMetadata`) rely on compiler-level code insertion to serialize type information for runtime DI (Dependency Injection) frameworks. However, because of type erasure, this reflective serialization has strict boundaries.\n\nOnly types that have a runtime representable class, function, or constructor can be serialized. If a constructor parameter is typed as a structural interface, standard object, or generic type (e.g. `List<User>`), `tsc` downlevels this type to a simple generic `Object` or `Array` container, completely stripping away the internal structural type details.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Classes vs. Interfaces in Compilation Output
// ============================================================================
export interface UserInterface {
  id: string;
  name: string;
}

export class UserClass implements UserInterface {
  id: string;
  name: string;
  
  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }
}

/*
👉 COMPILED JS OUTPUT EMISSION (Type Erasure & Class Preservation):
------------------------------------------------------------------
// The UserInterface is completely omitted! No code is emitted for it.

export class UserClass {
    constructor(id, name) {
        this.id = id;
        this.name = name;
    }
}
*/

// ============================================================================
// 2. Handling Incoming Payloads Safely (Runtime Type Guard)
// ============================================================================
// Since UserInterface is erased at runtime, how do we validate network payloads?
export function isUser(payload: any): payload is UserInterface {
  return (
    payload !== null &&
    typeof payload === 'object' &&
    typeof payload.id === 'string' &&
    typeof payload.name === 'string'
  );
}

// Correct runtime validation
export function handleApiResponse(response: unknown) {
  if (isUser(response)) {
    console.log("Successfully validated user:", response.name.toUpperCase());
  } else {
    console.error("Payload validation failed! Erasure prevented direct verification.");
  }
}

// ============================================================================
// 3. Decorator Metadata Serialization & Erasure Limitations
// ============================================================================
import 'reflect-metadata';

function Injectable() {
  return (target: any) => {};
}

@Injectable()
export class OrderService {
  // UserClass exists at runtime. UserInterface does not.
  constructor(
    public userClass: UserClass, 
    public userInterface: UserInterface,
    public genericUsers: Array<UserClass>
  ) {}
}

/*
👉 EMITTED METADATA IN JS (Using emitDecoratorMetadata):
-------------------------------------------------------
// The Emitter generates Reflect.metadata instructions with design:paramtypes:
Reflect.metadata("design:paramtypes", [
  UserClass,  // preserved! UserClass constructor function is alive at runtime.
  Object,     // ERASED! UserInterface is a static construct, downleveled to basic Object.
  Array       // ERASED! Generics like Array<UserClass> lose details, downleveled to Array.
])
*/
export function inspectOrderServiceMetadata() {
  const paramTypes = Reflect.getMetadata('design:paramtypes', OrderService);
  console.log("Param type 1 (Class):", paramTypes[0]); // Output: [class UserClass]
  console.log("Param type 2 (Interface):", paramTypes[1]); // Output: [Function: Object]
  console.log("Param type 3 (Generic Array):", paramTypes[2]); // Output: [Function: Array]
}`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'When configuring runtime injection layers (e.g. NestJS, InversifyJS, or custom DI systems), avoid binding dependencies using structural interfaces. Because of metadata type erasure downleveling them to generic Objects, multiple different interfaces will map to the same Object metadata key, triggering parameter injection collisions. Instead, register your services using Classes (acting as token contracts) or explicit runtime Symbol strings.',
      metadata: { type: 'runtime', title: 'Preventing Injection Collisions in DI' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Engine-level Compilation & Runtime Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: Walk through the complete lifecycle of a TypeScript file inside the tsc compiler engine.\nA: A source file progresses through five sequential compiler stages:\n1. **Scanning/Lexing:** Character streams are split into tokens.\n2. **Parsing:** Tokens are converted into a hierarchical Abstract Syntax Tree (AST).\n3. **Binding:** AST nodes are mapped to unique Symbols in file Symbol Tables to maintain binding context.\n4. **Type Checking:** The Checker performs semantic analysis, tracing the AST to calculate structural subtyping and shapes, identifying type diagnostics.\n5. **Emitting:** The Emitter downlevels newer syntax to target versions, strips away all compile-time type constructs (Type Erasure), and writes physical .js, .js.map, and .d.ts files.'
    },
    {
      type: 'faq',
      content: 'Q: Why does tsc produce transpiled output even when code contains type errors? What are the architectural implications?\nA: The type checking (static verification) and code generation (emitting) phases are intentionally isolated. TypeScript assumes developers use type checks as guardrails, not blocks, aligning with the fluid, highly iterative paradigm of native JavaScript development. This is different from systems like Rust, where safety checks are hard constraints for binary creation. If desired, developers can enforce hard stops on compilation errors using the `--noEmitOnError` compiler flag.'
    },
    {
      type: 'faq',
      content: 'Q: Given that interfaces are erased, how can a developer perform runtime validation of an API payload matching an interface?\nA: Direct validation using operators like `instanceof` is impossible because interfaces leave no runtime footprint. The correct approaches are:\n1. **User-defined Type Guards:** Create helper functions using the `is` keyword, conducting structural property validation (e.g., checking if key `id` in `payload` and `typeof payload.id === "string"`).\n2. **Class Validation with Decorators:** Use libraries like `class-validator` combined with classes instead of interfaces, allowing decorators to run runtime checks.\n3. **Schema Libraries:** Use declarative schema tools like `Zod` or `Yup` to parse incoming payloads at runtime and infer TypeScript types directly from the schema parser.'
    },
    {
      type: 'faq',
      content: 'Q: What is the compilation footprint difference between a const enum and a standard enum, and what are the architectural trade-offs of using const enum?\nA: A standard `enum` compiles to an actual runtime JavaScript object featuring a two-way (bi-directional) mapping between strings and index numbers. A `const enum` is completely erased at compilation; the compiler directly inlines the raw constant values wherever the enum members are referenced, leaving zero runtime object footprint.\n\n*Architectural Trade-off:* While `const enum` reduces JavaScript size and removes prototype lookup overhead, it has a serious drawback. If a library exports a `const enum` and a consumer consumes it, compiling them separately can cause inlining failures or runtime resolution issues if the enum changes in a library patch version without the consumer re-compiling. This is why tools like Babel and `--isolatedModules` configuration generally require flag settings or caution when handling them.'
    }
  ]
};
