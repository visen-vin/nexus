import type { NoteContent } from '../../../types';
import discriminatedUnionsSvg from '../../../../assets/diagrams/frontend/typescript/discriminated-unions.svg?raw';

export const content: NoteContent = {
  id: 'ts-5',
  moduleId: 'ts',
  order: 80,
  group: 'Type System Core',
  title: 'Discriminated Unions',
  description: 'Deep dive into algebraic data types and Discriminated Unions. Master tagged union structures, compile-time exhaustiveness checks using never, and state-machine modeling in TypeScript.',
  sections: [
    {
      type: 'text',
      content: 'In complex applications, managing polymorph structures (objects that have multiple forms but share common attributes) is a frequent source of runtime errors. Traditional inheritance hierarchies often fail to handle clean structural switching, and casting parameters is highly fragile. \n\n**Discriminated Unions** (also known as Tagged Unions or Algebraic Data Types) resolve this by coupling a shared literal key (the **discriminant/tag**) across a set of unique object interfaces. By switching or validating on this tag, TypeScript\'s flow-sensitive type narrowing immediately refines the type, allowing developers to safely interact with subtype-specific fields. When paired with **Exhaustiveness checking** via the `never` bottom type, Discriminated Unions create a compile-time lock that guarantees every potential structure is handled, preventing uncaught runtime crashes when new types are added to the codebase.'
    },
    {
      type: 'diagram',
      content: discriminatedUnionsSvg
    },
    {
      type: 'callout',
      content: 'A Discriminated Union is defined by three fundamental characteristics:\n1. **Constituent Object Interfaces**: Independent structural types.\n2. **The Discriminant Tag**: A literal value field (e.g. `type: \'circle\'` or `status: \'success\'`) shared across all constituent types.\n3. **The Union Binding**: Binding all structures together as a single type (e.g. `type Shape = Circle | Square`).',
      metadata: { type: 'architecture', title: 'The Three Tagged Pillars' }
    },
    {
      type: 'heading',
      content: 'Flow-Sensitive Narrowing & Switch Cases',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'TypeScript\'s flow analysis reads the switch statement or conditional checks on the discriminant tag. Inside each case block, the compiler refines the type from the wide union to the specific interface mapped to that string literal tag, granting absolute type safety.'
    },
    {
      type: 'heading',
      content: 'Compile-Time Exhaustiveness checking',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When developers add a new type to a union (e.g., adding `Rectangle` to `Shape`), it is easy to forget to update every file that performs calculations on `Shape`. \n\nTo prevent this, we implement **Exhaustiveness Checking**. By assigning the remaining unhandled union to a variable typed as `never` in the default case, we instruct the compiler to verify that no members of the union are left. If any member is unhandled, it will cascade into the default case, triggering a compile-time error because a valid type cannot be assigned to `never`.'
    },
    {
      type: 'heading',
      content: 'Production-Grade Payment Processing Machine',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'The following TypeScript module showcases a production-grade payment state machine utilizing tagged unions, exhaustive checks, and a reusable unreachability utility.'
    },
    {
      type: 'code',
      content: `// ============================================================================
// 1. Tagged Interfaces (The Constituents)
// ============================================================================
export interface CreditCardPayment {
  method: 'credit_card'; // The Discriminant Tag
  cardNumber: string;
  cvv: string;
  expiry: string;
}

export interface UPIPayment {
  method: 'upi'; // The Discriminant Tag
  upiId: string;
}

export interface BankTransferPayment {
  method: 'bank_transfer'; // The Discriminant Tag
  accountNumber: string;
  routingNumber: string;
}

// 2. The Union Binding
export type PaymentDetails = CreditCardPayment | UPIPayment | BankTransferPayment;

// ============================================================================
// 3. Exhaustiveness Checking Helper
// ============================================================================
// A robust utility that enforces compile-time safety and throws at runtime
// if an invalid/unexpected input reaches it.
export function assertUnreachable(value: never): never {
  throw new Error(\`Fatal Runtime: Unhandled algebraic type member received: \${JSON.stringify(value)}\`);
}

// ============================================================================
// 4. Processing Switch coordination
// ============================================================================
export function processTransaction(payment: PaymentDetails): string {
  switch (payment.method) {
    case 'credit_card':
      // payment is narrowed strictly to CreditCardPayment
      return \`Processing credit card ending in \${payment.cardNumber.slice(-4)}\`;

    case 'upi':
      // payment is narrowed strictly to UPIPayment
      return \`Requesting UPI transfer for ID: \${payment.upiId}\`;

    case 'bank_transfer':
      // payment is narrowed strictly to BankTransferPayment
      return \`Routing bank wire transfer to routing number: \${payment.routingNumber}\`;

    default:
      // Exhaustiveness check: If any union type was left unhandled,
      // the compiler throws a compile-time error at this line!
      return assertUnreachable(payment);
  }
}

// ============================================================================
// 5. Handling Future Additions (Illustrating safety)
// ============================================================================
// Imagine we add a new payment method:
// export interface CryptoPayment {
//   method: 'crypto';
//   walletAddress: string;
// }
// type PaymentDetails = CreditCardPayment | UPIPayment | BankTransferPayment | CryptoPayment;
//
// If we uncomment 'CryptoPayment' above, 'processTransaction' will immediately
// fail to compile at 'assertUnreachable(payment)' because 'payment' is inferred
// as 'CryptoPayment' inside 'default', which cannot be assigned to 'never'.`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: "Exhaustiveness checks are only effective if you do NOT add a catch-all fallback return in your switch cases (like returning a generic string before the default block). Doing so satisfies the compiler's return expectations, rendering the `never` validation inactive.",
      metadata: { type: 'warning', title: 'The Fallback Return Trap' }
    },
    {
      type: 'callout',
      content: "The discriminant tag must be a literal type (e.g. 'circle', `42`, or `true` - literal strings, numbers, or booleans). It cannot be a wide primitive type like `string` or `number` since primitives cannot be narrowed to unique constituent types.",
      metadata: { type: 'runtime', title: 'Allowed Discriminant Tag Types' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Discriminated Unions Mastery' }
    },
    {
      type: 'faq',
      content: 'Q: What is a Discriminated Union in TypeScript and what are its three necessary structural components?\nA: A Discriminated Union is a design pattern used to construct type-safe algebraic structures. It requires: (1) Multiple distinct constituent interfaces. (2) A shared discriminant tag field containing a unique literal type (e.g. `type: "success"`) in each constituent. (3) A type union combining all constituent interfaces into a single exported type.'
    },
    {
      type: 'faq',
      content: 'Q: How do you implement static "exhaustiveness checking" inside a switch statement, and why does it protect developers?\nA: Exhaustiveness checking ensures that every member of a union is explicitly handled. It is implemented by assigning the value to a variable typed as `never` (or passing it to a helper like `assertUnreachable(value: never)`) inside the `default` case of a switch block. If a developer adds a new member to the union but forgets to update the switch statement, the new member falls into the `default` block, triggering an immediate compile-time error because the new type cannot be assigned to `never`.'
    },
    {
      type: 'faq',
      content: "Q: Why can't wide primitive types like string or number be used as discriminant tags?\nA: A discriminant tag must be a literal type (such as string literals 'upi' / 'credit_card' or boolean literals `true` / `false`). Literal types are finite and unique, allowing the compiler to perform exact matching and eliminate other union members during check passes. Wide types like `string` represent an infinite set of values, making it structurally impossible for the compiler to narrow down to a single constituent interface."
    }
  ]
};
