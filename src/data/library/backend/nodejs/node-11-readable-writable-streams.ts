import type { NoteContent } from '../../../types';
import readableWritableStreamsSvg from '../../../../assets/diagrams/backend/nodejs/readable-writable-streams.svg?raw';

export const content: NoteContent = {
  id: 'node-11',
  moduleId: 'node',
  order: 106,
  group: 'Node.js Core',
  title: 'Readable & Writable Streams',
  description: 'Deep dive into stream state machines. Master Readable modes (flowing vs paused), Writable methods (write, end), stream event cycles (data, drain, finish), and custom stream implementations.',
  sections: [
    {
      type: 'diagram',
      content: readableWritableStreamsSvg
    },
    {
      type: 'text',
      content: 'In Node.js, streams are divided into four primary classes: **Readable** (sources from which data can be consumed), **Writable** (destinations to which data can be written), **Duplex** (streams that are both Readable and Writable, like TCP sockets), and **Transform** (Duplex streams that modify data as it is written and read, like gzip compression).\n\nTo master streams, you must understand their internal event lifecycles, operating modes, and state machines. Readable and Writable streams operate under rigid, decoupled event-driven systems that communicate state changes using native events.'
    },
    {
      type: 'heading',
      content: '1. Readable Streams: Flowing vs. Paused Modes',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A Readable stream operates in one of two distinct modes:\n\n* **Flowing Mode**: Data is read from the underlying system automatically and emitted directly to the application as fast as possible using the 'data' event. A stream transitions to flowing mode when you attach a `.on('data', callback)` listener, call `readable.resume()`, or pipe it using `.pipe()`.\n* **Paused Mode**: Data does not flow automatically. Instead, the developer must explicitly call the **`readable.read()`** method to extract chunks of data from the internal buffer. A stream operates in paused mode by default, or transitions to it when you call `readable.pause()`, remove 'data' listeners, or remove piping destinations."
    },
    {
      type: 'code',
      content: `import fs from 'fs';

const stream = fs.createReadStream('logs.txt', { encoding: 'utf-8', highWaterMark: 1024 });

// Paradigm A: Consuming in Flowing Mode (Event Driven)
stream.on('data', (chunk) => {
  console.log('Received chunk in Flowing mode:', chunk.length);
});

stream.on('end', () => console.log('Flowing mode complete!'));

// Paradigm B: Consuming in Paused Mode (Manual Pulling)
/*
stream.on('readable', () => {
  let chunk;
  // Keep pulling chunks from the internal stream buffer manually
  while ((chunk = stream.read()) !== null) {
    console.log('Manually read chunk:', chunk.length);
  }
});
*/`,
      metadata: { language: 'javascript', title: 'Two Ways of Consuming Readable Streams' }
    },
    {
      type: 'heading',
      content: '2. Writable Streams: Execution States',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "Writable streams write data to a system resource using two main methods:\n\n* **`writable.write(chunk)`**: Queues a chunk of data to be written. Returns `true` if the internal buffer is below `highWaterMark`, or `false` (signaling backpressure) if the buffer has filled up.\n* **`writable.end(chunk)`**: Signals that no more data will be written to this stream. It can optionally write a final chunk before closing. When `end()` is called and all remaining buffered chunks are fully written to the underlying system, the **`'finish'`** event is emitted."
    },
    {
      type: 'heading',
      content: '3. Custom Stream Implementations',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Node.js allows you to extend the base stream classes to build custom data sources or destinations. To build a custom stream, import the base class, extend it, and implement the corresponding internal method:\n\n* **Custom Readable**: Override **`_read(size)`** and call **`this.push(chunk)`** to feed data into the queue. When finished, call `this.push(null)`.\n* **Custom Writable**: Override **`_write(chunk, encoding, callback)`** and invoke `callback()` when the write operation completes.'
    },
    {
      type: 'code',
      content: `import { Readable, Writable } from 'stream';

// 1. Custom Readable: Generates a counter stream
class CounterStream extends Readable {
  private count = 0;
  
  constructor() {
    super({ highWaterMark: 16 });
  }

  _read() {
    this.count++;
    if (this.count <= 5) {
      this.push(Buffer.from(\`Count: \${this.count}\\n\`));
    } else {
      this.push(null); // Signals end of stream
    }
  }
}

// 2. Custom Writable: Logs chunks in uppercase
class UppercaseLogStream extends Writable {
  _write(chunk: Buffer, encoding: string, callback: (err?: Error) => void) {
    console.log(chunk.toString().toUpperCase());
    callback(); // Signal that the write was successful
  }
}

const counter = new CounterStream();
const logger = new UppercaseLogStream();

counter.pipe(logger);`,
      metadata: { language: 'typescript', title: 'Implementing Custom Streams in TypeScript' }
    },
    {
      type: 'callout',
      content: 'Never call `_read()` or `_write()` directly in your application code. These are internal methods meant to be overridden by subclasses. Always consume streams using public APIs like `.pipe()`, `read()`, `write()`, or events.',
      metadata: { type: 'warning', title: 'Internal Methods Isolation' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What are the two modes of a Readable stream, and how do you transition between them?\nA: The two modes are **Flowing Mode** (data is emitted automatically via the 'data' event) and **Paused Mode** (data remains buffered, requiring manual `read()` calls). You transition to Flowing mode by adding a 'data' event listener or calling `resume()`. You transition to Paused mode by calling `pause()`."
    },
    {
      type: 'faq',
      content: "Q: What is the difference between the \"finish\" and \"end\" events on streams?\nA: The **`'end'`** event is unique to **Readable** streams, indicating that the source has run out of data to read. The **`'finish'`** event is unique to **Writable** streams, indicating that the `writable.end()` method was called and all remaining buffered data has been successfully flushed to the system."
    },
    {
      type: 'faq',
      content: 'Q: How do you implement a custom Readable stream in Node.js?\nA: You extend the base `Readable` class from the `stream` module and override the internal `_read(size)` method. Inside `_read`, you fetch your custom data source and feed it to the stream by calling `this.push(chunk)`. You signal the end of the stream by calling `this.push(null)`.'
    }
  ]
};
