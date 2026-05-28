import type { NoteContent } from '../../../types';
import duplexTransformSvg from '../../../../assets/diagrams/backend/nodejs/duplex-transform.svg?raw';

export const content: NoteContent = {
  id: 'node-12',
  moduleId: 'node',
  order: 107,
  group: 'Node.js Core',
  title: 'Duplex & Transform Streams',
  description: 'Master specialized stream interfaces. Contrast independent read/write channels of Duplex streams with dynamic chunk modification of Transform streams, including zlib/crypto and custom pipeline creations.',
  sections: [
    {
      type: 'diagram',
      content: duplexTransformSvg
    },
    {
      type: 'text',
      content: "While basic Readable and Writable streams deal with single-direction data flow, complex backend networking and data pipelines require bidirectional flow. Node.js implements two advanced stream interfaces: **Duplex** and **Transform**.\n\nBoth inherit from the base stream class but represent entirely distinct architectures. A Duplex stream wraps separate, unrelated read and write channels, whereas a Transform stream connects the write input directly to the read output, modifying the data chunks as they pass through."
    },
    {
      type: 'heading',
      content: '1. Duplex Streams: Dual Independent Channels',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A **Duplex** stream implements both the Readable and Writable interfaces. Its unique characteristic is that its **read and write channels are completely independent** and have no internal link.\n\nWriting data to a Duplex stream does not affect the data you read from it. The most common real-world example of a Duplex stream is a **TCP net.Socket**. Data written to the socket is sent over the network adapter to the remote server, while data read from the socket represents incoming network bytes. Other examples include native `process.stdout`/`process.stdin` pairs."
    },
    {
      type: 'heading',
      content: '2. Transform Streams: Integrated Data Pipelines',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: "A **Transform** stream is a specialized type of Duplex stream where the **output is calculated directly from the input**. The write channel and read channel are linked via an internal processor.\n\nWhen you write a chunk to a Transform stream, it processes the chunk through an internal **`_transform()`** method, performs operations on the binary bytes, and automatically pushes the modified chunk into the read queue to be consumed.\n\nTransform streams are extremely popular in Node.js for on-the-fly transformations:\n* **Compression (`zlib`)**: e.g., `zlib.createGzip()` compresses binary chunks as they pass through.\n* **Cryptography (`crypto`)**: e.g., `crypto.createCipheriv()` encrypts data streams dynamically."
    },
    {
      type: 'code',
      content: `import { Transform } from 'stream';

// Custom Transform Stream that replaces lowercase characters with uppercase
class UppercaseTransform extends Transform {
  constructor() {
    super({ decodeStrings: false }); // Process strings directly instead of converting to buffers
  }

  // Overriding internal _transform method
  _transform(chunk: string, encoding: string, callback: (err?: Error, data?: string) => void) {
    try {
      const upperStr = chunk.toUpperCase();
      
      // Push the transformed chunk into the readable queue
      this.push(upperStr);
      
      // Signal transform completion
      callback();
    } catch (err) {
      callback(err as Error); // Forward errors properly
    }
  }

  // Optional: _flush runs right before the stream closes to push any remaining buffered data
  _flush(callback: () => void) {
    this.push('\\n--- TRANSFORMATION COMPLETED ---');
    callback();
  }
}

const transformer = new UppercaseTransform();
transformer.on('data', (chunk) => console.log('Transformed chunk: ', chunk.toString()));

transformer.write('hello ');
transformer.write('world');
transformer.end();`,
      metadata: { language: 'typescript', title: 'Implementing a Custom Transform Stream' }
    },
    {
      type: 'callout',
      content: "Always handle error states properly inside custom Transform streams. If an unhandled exception occurs inside `_transform` and is not passed as the first argument to `callback(err)`, the entire stream pipeline will break, and errors won't be forwarded to downstream pipe listeners.",
      metadata: { type: 'warning', title: 'Transform Error Handling' }
    },
    {
      type: 'heading',
      content: 'Interview HQ',
      metadata: { level: 2 }
    },
    {
      type: 'faq',
      content: "Q: What is the key difference between a Duplex stream and a Transform stream?\nA: A Duplex stream implements both Readable and Writable interfaces with two **independent** data channels (e.g. net.Socket where writing data is sent out, and reading data comes in). A Transform stream is a Duplex stream where the read and write channels are **integrated**—data written to the write channel is processed and modified by a `_transform` function before being pushed to the read channel."
    },
    {
      type: 'faq',
      content: "Q: Explain the role of the callback and this.push() inside a custom _transform() method.\nA: In a custom `_transform(chunk, encoding, callback)` method, you process incoming data. You pass the transformed data downstream using `this.push(transformedChunk)`. Finally, you call `callback()` to signal to Node.js that the current chunk has been successfully processed and the stream is ready to receive the next chunk."
    },
    {
      type: 'faq',
      content: "Q: When would you implement the optional _flush() method in a Transform stream?\nA: The `_flush()` method is useful when a Transform stream has to buffer chunks internally or needs to append additional summary/closing data. It is invoked automatically when the writable side is closed (`.end()`), right before the stream officially emits the `'end'` event, allowing final data emission."
    }
  ]
};
