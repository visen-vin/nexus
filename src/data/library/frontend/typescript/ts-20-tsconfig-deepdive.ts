import type { NoteContent } from '../../../types';
import tsconfigDeepdiveSvg from '../../../../assets/diagrams/frontend/typescript/tsconfig-deepdive.svg?raw';

export const content: NoteContent = {
  id: 'ts-20',
  moduleId: 'ts',
  order: 95,
  group: 'Type System Core',
  title: 'tsconfig Deep Dive',
  description: 'In-depth exploration of the tsconfig.json compiler configuration. Decouple target vs module options, strict type check vectors (strictNullChecks, noImplicitAny, noUncheckedIndexedAccess), and path mappings.',
  sections: [
    {
      type: 'diagram',
      content: tsconfigDeepdiveSvg
    },
    {
      type: 'text',
      content: 'The **`tsconfig.json`** file is the central command center for the TypeScript compiler (`tsc`). It instructs the compiler how to resolve imports, what files to compile, what level of JavaScript syntax to emit, and how strict the compile-time checks should be.\n\nConfiguring `tsconfig.json` correctly is a prerequisite for codebase scale. Choosing poor defaults can lead to slow compilation, phantom import failures at runtime, or silent type bypasses (such as unhandled `undefined` references during array lookups).'
    },
    {
      type: 'callout',
      content: 'Never rely on default settings for a production codebase. Always initialize your config with `"strict": true` active, which acts as a master toggle enabling strictNullChecks, noImplicitAny, strictBindCallApply, and other core safety guards.',
      metadata: { type: 'warning', title: 'Strict Mode Enforcement' }
    },
    {
      type: 'heading',
      content: '1. Strict Type-Checking Vectors',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Activating `"strict": true` enables several underlying flags. Among these, three compiler guards are particularly critical for eliminating production bugs:\n\n* **`noImplicitAny`**: Compiles an error whenever an expression lacks an explicit type and evaluates to `any`. This forces absolute structural safety.\n* **`strictNullChecks`**: Separates `null` and `undefined` from general type assignments. You cannot assign `undefined` to a `string` variable without defining it as `string | undefined` first.\n* **`noUncheckedIndexedAccess`**: A non-strict-by-default flag. When active, indexing into a dictionary or array yields `T | undefined` rather than `T`, forcing developers to handle potential lookup failures safely.'
    },
    {
      type: 'code',
      content: `// 1. Without noUncheckedIndexedAccess (Type-Safe Lie!)
const userAges: Record<string, number> = { alice: 25 };
const bobAge = userAges["bob"]; // Compiler infers bobAge as: "number"
console.log(bobAge.toFixed()); // ❌ CRASHES at runtime! (bob is undefined)

// 2. With noUncheckedIndexedAccess active
const userAgesStrict: Record<string, number> = { alice: 25 };
const bobAgeStrict = userAgesStrict["bob"]; // Compiler correctly infers: "number | undefined"
// console.log(bobAgeStrict.toFixed()); // ❌ Compile error!
if (bobAgeStrict !== undefined) {
  console.log(bobAgeStrict.toFixed()); // ✓ Safely compiles!
}`,
      metadata: { language: 'typescript', title: 'Unchecked Indexed Access Safety' }
    },
    {
      type: 'heading',
      content: '2. Emitting & Target Boundaries',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Understanding the difference between **`target`** and **`module`** options is crucial for bundling:\n\n* **`target`**: Controls what generation of JavaScript syntax is emitted (e.g., `ES5`, `ES2020`, `ES2022`). Choosing `ES5` compiles modern features like `async/await` down to complex state-machine generators (downlevel compilation).\n* **`module`**: Controls what format is used for file imports and exports in the emitted JS (e.g. `CommonJS` `require`, `ESNext` `import`).'
    },
    {
      type: 'code',
      content: `{
  "compilerOptions": {
    "target": "ES2022",                // Emit modern modern JS (faster builds, smaller bundles)
    "module": "NodeNext",              // Support ESM and CommonJS resolving formats
    "moduleResolution": "NodeNext",    // Matches modern Node package lookups
    "skipLibCheck": true,              // Speeds up compile times by skipping d.ts checks
    "baseUrl": ".",
    "paths": {
      "@/components/*": ["src/components/*"] // Absolute paths mapping
    }
  }
}`,
      metadata: { language: 'json', title: 'Enterprise compilerOptions Configuration' }
    },
    {
      type: 'callout',
      content: 'Configuring custom directory paths via the `paths` key removes complex relative imports (e.g. `import x from "../../../components/x"` becomes `import x from "@/components/x"`). Make sure to align your bundler (Vite, Webpack) with the same path mapping definitions to prevent bundling crashes.',
      metadata: { type: 'architecture', title: 'Modular Import Path Architecture' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'tsconfig Interview mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is the primary compile-time security value of activating noUncheckedIndexedAccess?\nA: By default, index signatures like `Record<string, User>` return the type `User` during lookups. This is a type lie since lookups for non-existent keys return `undefined` at runtime. Activating `noUncheckedIndexedAccess` forces index signatures and array lookups to evaluate to `User | undefined`, forcing developers to handle lookup failure cases safely and eliminating runtime crashes.'
    },
    {
      type: 'faq',
      content: 'Q: Explain skipLibCheck. When should you use it, and what are its performance implications?\nA: `skipLibCheck: true` directs the compiler to skip type checking of all declaration files (`.d.ts`) imported from `node_modules`. This drastically improves compilation and IDE type-checking speed (often by 50% or more) since it avoids re-analyzing already compiled external libraries. It should be used in almost all production environments.'
    },
    {
      type: 'faq',
      content: 'Q: What is downleveling in the TypeScript compiler context, and which setting dictates its behavior?\nA: Downleveling is the process of translating newer ECMAScript syntax (e.g. classes, arrow functions, async/await) into older JavaScript specifications (like ES5 or ES6) for legacy browser compatibility. Its behavior is dictated by the **`target`** compiler setting (e.g. `"target": "ES5"`).'
    }
  ]
};
