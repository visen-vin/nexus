// --- FILE: js-17-bigint.ts ---
import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-17',
  moduleId: 'js',
  order: 17,
  group: 'Modern Standards',
  title: 'BigInt & Advanced Math',
  description: 'Arbitrary-precision integers and fixed-width numeric operations in JavaScript.',
  sections: [
    {
      type: 'text',
      content: 'JavaScript traditionally used 64-bit floats for all numbers, capped at \\`Number.MAX_SAFE_INTEGER\\` ($2^{53} - 1$). **BigInt** breaks this barrier, providing arbitrary-precision integers for handling massive database IDs, high-resolution timestamps, and cryptographic keys without precision loss.'
    },
    {
      type: 'callout',
      content: 'BigInt is a primitive type, not an object. It is created by appending \\`n\\` to a numeric literal or calling \\`BigInt()\\`. Unlike Numbers, BigInts do not support decimals and perform integer truncation during division.',
      metadata: { type: 'runtime', title: 'Integer Fidelity' }
    },
    {
      type: 'heading',
      content: 'Arithmetic & Fixed-Width Operations',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'While BigInt supports standard operators, it cannot be mixed with the \\`Number\\` type in calculations. For low-level systems work, JavaScript provides static methods to simulate fixed-width integers (clamping).'
    },
    {
      type: 'code',
      content: `const large = 2n ** 64n; // 18446744073709551616n
const clamped = BigInt.asUintN(64, large); // 0n (overflow simulation)

// Mixed types throw TypeError
// 10n + 5; 

// Division truncates
console.log(5n / 2n); // 2n`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'The "No Math" Constraint',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The global \\`Math\\` object does not support BigInt. Methods like \\`Math.sqrt()\\` or \\`Math.max()\\` will throw errors if passed a BigInt. You must implement your own algorithms for advanced math or convert back to \\`Number\\` if precision loss is acceptable.'
    },
    {
      type: 'callout',
      content: 'BigInt performance is significantly lower than standard Numbers. Only use BigInt when the numeric range absolutely requires it; otherwise, standard Numbers are optimized by V8 into CPU register operations.',
      metadata: { type: 'warning', title: 'PERFORMANCE HIT' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Mastery Check' }
    },
    {
      type: 'faq',
      content: 'Q: Why does BigInt throw on JSON.stringify()?\nA: JSON does not have a standard syntax for arbitrary-precision integers (they would lose precision if parsed as Numbers). You must provide a custom \\`toJSON\\` method or a replacer function to serialize BigInts as strings.'
    },
    {
      type: 'faq',
      content: 'Q: Is 10n == 10 and 10n === 10 true?\nA: \\`10n == 10\\` is true (abstract equality matches numeric value), but \\`10n === 10\\` is false because they are different primitive types (BigInt vs. Number).'
    },
    {
      type: 'faq',
      content: 'Q: How do you perform bitwise operations on BigInt?\nA: Standard bitwise operators (\\`&\\`, \\`|\\`, \\`^\\`, \\`~\\`, \\`<<\\`, \\`>>\\`) work natively. However, the unsigned right shift (\\`>>>\\`) is not supported because BigInt represents signed integers of arbitrary length.'
    }
  ]
};
