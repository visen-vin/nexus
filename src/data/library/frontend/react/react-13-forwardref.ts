import type { NoteContent } from '../../../types';
import forwardrefSvg from '../../../../assets/diagrams/frontend/react/forwardref.svg?raw';

export const content: NoteContent = {
  id: 'react-13',
  moduleId: 'react',
  order: 13,
  group: 'Core Philosophy',
  title: 'React.forwardRef and Ref Tunneling',
  description: 'Deep dive into React\'s reference forwarding engine, addressing component boundaries, robust TypeScript forwarding generics, and dynamic polymorphic custom component wrappers.',
  sections: [
    {
      type: 'text',
      content: 'In standard React architecture, data flows from parent to child via read-only **props**. However, there are scenarios where a parent component requires direct imperative access to the underlying DOM node or public instance of a child (e.g., to focus an input, measure dimensions, or trigger animations).\n\nReact treats the **`ref`** attribute as a reserved keyword—similar to `key`. As a result, React strips `ref` from the component\'s `props` argument. If a parent attempts to pass a ref directly to a custom child component, it yields `undefined`. \n\n**`React.forwardRef`** resolves this limitation by constructing a dedicated **reference forwarding tunnel**, bypassing the prop-filtering pipeline and exposing the ref parameter as a second argument in the functional component definition.'
    },
    {
      type: 'diagram',
      content: forwardrefSvg
    },
    {
      type: 'heading',
      content: 'How the Ref Forwarding Tunnel Operates',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'When React mounts a component wrapped in `forwardRef(render)`:\n\n1. React instantiates a specialized React element with the type `Symbol(react.forward_ref)`.\n2. During the render phase, the React Fiber reconciler executes the component function, passing both `props` (first parameter) and the captured `ref` (second parameter).\n3. The component forwards the `ref` argument down to its deep DOM node or another React element via `<input ref={ref} />`.\n4. When the Fiber commits the mutations to the browser DOM, the `current` field of the parent\'s ref object is populated with the actual DOM node.'
    },
    {
      type: 'callout',
      content: 'Because `ref` is a reserved property name, passing it directly to a standard React component triggers a console warning in development (prior to React 19). Always wrap target components in `React.forwardRef` to let React know that the component is fully prepared to receive and forward the reference.',
      metadata: { type: 'warning', title: 'The Reserved Ref Property Limit' }
    },
    {
      type: 'heading',
      content: 'Type-Safe Ref Forwarding in TypeScript',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'TypeScript\'s built-in definitions for `React.forwardRef` are structured with the generic parameters reversed relative to component parameters: `React.forwardRef<TRef, TProps>`.\n\nHere is the industry-standard implementation of a type-safe custom input component:'
    },
    {
      type: 'code',
      content: `import React, { useRef, useImperativeHandle } from 'react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

// 1. TRef is HTMLInputElement (the DOM node we are targeting)
// 2. TProps is CustomInputProps (the properties accepted by the component)
export const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ label, ...props }, ref) => {
    return (
      <div className="input-wrapper">
        <label className="input-label">{label}</label>
        <input ref={ref} {...props} className="input-field" />
      </div>
    );
  }
);

// Explicitly set displayName for clean debugging in DevTools
CustomInput.displayName = 'CustomInput';`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Advanced Pattern: Polymorphic Dynamic Component Wrapper with Ref Preservation',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Building design system primitives (like a generic `<Box />` or `<Button />` component) requires polymorphic support where the rendering HTML tag is dynamic (e.g. `<Box as="button">` or `<Box as="a" href="...">`), whilst retaining absolute type safety for the forwarded ref.\n\nStandard `React.forwardRef` loses generic type parameters. To preserve generic parameter signatures, we use a custom type assertion to bypass the standard type checker limitation:'
    },
    {
      type: 'code',
      content: `import React from 'react';

// 1. Define supported HTML tags
type AsProp<C extends React.ElementType> = {
  as?: C;
};

// 2. Combine the 'as' prop, component specific props, and the standard HTML element attributes of 'as'
type PolymorphicProps<C extends React.ElementType, Props = {}> = Props &
  AsProp<C> &
  Omit<React.ComponentPropsWithoutRef<C>, keyof (AsProp<C> & Props)>;

// 3. Define the structure for the ref associated with the dynamic HTML tag
type PolymorphicRef<C extends React.ElementType> = React.ComponentPropsWithRef<C>['ref'];

// 4. Create the implementation using a generic helper
const PolymorphicBoxInner = <C extends React.ElementType = 'div'>(
  { as, children, ...props }: PolymorphicProps<C>,
  ref: PolymorphicRef<C>
) => {
  const Component = as || 'div';
  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
};

// 5. Wrap inside forwardRef and re-type to preserve generic signatures
export const PolymorphicBox = React.forwardRef(PolymorphicBoxInner) as <
  C extends React.ElementType = 'div'
>(
  props: PolymorphicProps<C> & { ref?: PolymorphicRef<C> }
) => React.ReactElement | null;

// Usage Example:
// const buttonRef = useRef<HTMLButtonElement>(null);
// <PolymorphicBox as="button" ref={buttonRef} onClick={() => alert('Clicked!')}>Click Me</PolymorphicBox>
`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'callout',
      content: 'When writing polymorphic components with standard React.forwardRef, the type signature defaults to resolving properties based on the fallback tag (\'div\' in this case) and completely fails to narrow properties based on the dynamic "as" prop. Redefining the export signature through casting (as shown above) is the standard clean-architecture workaround.',
      metadata: { type: 'architecture', title: 'Polymorphic Type Erasure' }
    },
    {
      type: 'heading',
      content: 'Exposing Imperative APIs via useImperativeHandle',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Sometimes you don\'t want to expose the raw DOM node directly to the parent component, as this violates encapsulation. Instead, you can construct a customized, restricted imperative API using **`useImperativeHandle`** along with `forwardRef`.'
    },
    {
      type: 'code',
      content: `import React, { useRef, useImperativeHandle } from 'react';

export interface CustomVideoPlayerRef {
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export const CustomVideoPlayer = React.forwardRef<CustomVideoPlayerRef, { src: string }>(
  ({ src }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    // useImperativeHandle intercepts the ref and exposes ONLY the defined custom interface
    useImperativeHandle(ref, () => ({
      play: () => {
        videoRef.current?.play();
      },
      pause: () => {
        videoRef.current?.pause();
      },
      reset: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
      }
    }), []); // Dependencies array

    return (
      <div className="player-wrapper">
        <video ref={videoRef} src={src} className="video-element" />
      </div>
    );
  }
);

CustomVideoPlayer.displayName = 'CustomVideoPlayer';`,
      metadata: { language: 'typescript' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'callout',
      content: 'PREPARATION ZONE',
      metadata: { type: 'architecture', title: 'Ref Forwarding & API Design' }
    },
    {
      type: 'faq',
      content: 'Q: Why can\'t we pass a ref attribute directly to a custom functional component without forwardRef?\nA: React treats the `ref` attribute as a special reserved keyword, much like the `key` attribute. When parsing jsx elements, React\'s virtual element factory filters out these reserved keys, and excludes them from the standard `props` object. `React.forwardRef` explicitly intercepts this extraction process, retrieving the ref parameter and exposing it as the second argument in the functional signature.'
    },
    {
      type: 'faq',
      content: 'Q: How do you handle generic components (like a custom Select or List selector) when wrapping them in forwardRef?\nA: By default, `React.forwardRef` erases generic arguments, reducing components with type parameters <T> to non-generic types. To overcome this limitation, senior developers use a custom type cast: defining the component implementation separately as a generic function, wrapping it with `forwardRef`, and then casting the exported component back to a custom generic call signature.'
    },
    {
      type: 'faq',
      content: 'Q: What is the purpose of useImperativeHandle, and how does it interface with forwardRef?\nA: `useImperativeHandle` is used to customize the instance value that is exposed to the parent component when a ref is attached. Instead of exposing the raw, internal DOM element (which allows risky direct mutation), `useImperativeHandle` lets the developer expose a controlled, customized imperative API (e.g., exposing only a `.focus()` or `.play()` function) thus maintaining clean element encapsulation.'
    },
    {
      type: 'faq',
      content: 'Q: Does React 19 change the way refs are forwarded?\nA: Yes! React 19 deprecates `React.forwardRef` entirely. Functional components can now accept `ref` directly as a regular prop: `function MyComponent({ ref, label }) { ... }`. However, understanding `React.forwardRef` remains highly critical, as it is the standard implementation for millions of React apps in production today and is a core requirement for backward-compatible libraries.'
    }
  ]
};
