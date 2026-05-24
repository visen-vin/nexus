#!/bin/bash
topics=(
  "js-4: Closures"
  "js-5: The Event Loop"
  "js-6: Promises & Async/Await"
  "js-7: Lexical Scope & Scope Chain"
  "js-8: let, const & TDZ"
  "js-9: First Class & Higher Order Functions"
  "js-10: The this Keyword"
  "js-11: Prototypal Inheritance"
  "js-12: Garbage Collection & Memory"
  "js-13: Web Workers & Concurrency"
  "js-14: Proxies & Reflect API"
  "js-15: Symbols & Iterators"
  "js-16: Map, Set, WeakMap & WeakSet"
  "js-17: BigInt & Advanced Math"
  "js-18: Explicit Resource Management"
  "js-19: New Immutable Array Methods"
  "js-20: DOM & Event Flow"
  "js-21: AbortController"
  "js-22: Intersection & Mutation Observers"
  "js-23: Web Components & Shadow DOM"
  "js-24: The Temporal API"
  "js-25: Intl API"
  "js-26: The Fetch API"
  "js-27: Streams API"
  "js-28: Web Security (XSS & CSRF)"
  "js-29: Functional Composition"
  "react-1: Fiber Reconciliation"
)

for topic in "${topics[@]}"; do
  gh issue create --title "Content Refinement: $topic" --body "Deep-dive refinement for $topic. Requirements: Senior-level prose, formatting, SVG placeholder, and Interview HQ." --label "refinement"
done
