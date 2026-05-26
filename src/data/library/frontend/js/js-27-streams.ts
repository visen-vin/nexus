// --- FILE: js-27-streams.ts ---
import type { NoteContent } from '../../../types';

export const content: NoteContent = {
  id: 'js-27',
  moduleId: 'js',
  order: 27,
  group: 'Asynchrony & Runtime',
  title: 'Streams API',
  description: 'Processing massive datasets chunk-by-chunk with memory efficiency and backpressure control.',
  sections: [
    {
      type: 'text',
      content: 'Handling large resources—like multi-gigabyte video files or real-time sensor data—requires a paradigm shift from "buffering" (loading everything into memory) to "streaming." The **Streams API** allows JavaScript to process data piece-by-piece, enabling low memory usage and high-performance I/O pipelines.'
    },
    {
      type: 'callout',
      content: 'The core of the Streams API is the concept of **Backpressure**. It is the mechanism by which a slow consumer tells a fast producer to slow down, preventing the system from running out of memory.',
      metadata: { type: 'architecture', title: 'Flow Control' }
    },
    {
      type: 'heading',
      content: 'Readable Streams: The Source',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A \\`ReadableStream\\` represents an underlying source of data. You consume it using a **Reader**, which allows you to "pull" chunks as they become available.'
    },
    {
      type: 'code',
      content: `const response = await fetch('/large-file.bin');
const reader = response.body.getReader();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  processChunk(value); // 'value' is a Uint8Array
}`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Pipe Chains & Transformations',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'Streams become truly powerful when connected in chains. You can use \\`pipeThrough()\\` to pass data through a \\`TransformStream\\` (e.g., to decompress or decrypt data) and \\`pipeTo()\\` to send it to a \\`WritableStream\\` (a sink).'
    },
    {
      type: 'code',
      content: `// Streaming decompression and writing
await readableStream
  .pipeThrough(new DecompressionStream('gzip'))
  .pipeTo(writableStream); // Automatically handles backpressure`,
      metadata: { language: 'javascript' }
    },
    {
      type: 'heading',
      content: 'Writable Streams: The Sink',
      metadata: { level: 2 }
    },
    {
      type: 'text',
      content: 'A \\`WritableStream\\` is the destination for your data. It uses a **Writer** to enqueue data and handles the internal queueing and state management.'
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
      content: 'Q: What is a "High Water Mark" (HWM) in streams?\nA: The HWM is the threshold of the internal buffer. When the amount of queued data exceeds this mark, the stream signals backpressure to the producer, pausing the data flow until the consumer clears the queue.'
    },
    {
      type: 'faq',
      content: 'Q: How does a TransformStream differ from a ReadableStream?\nA: A \\`ReadableStream\\` is a source and a \\`WritableStream\\` is a sink. A \\`TransformStream\\` consists of both: a writable side to receive data and a readable side to output the transformed data, acting as a middle-ware in a pipeline.'
    },
    {
      type: 'faq',
      content: 'Q: Why is response.json() not considered "streaming"?\nA: \\`response.json()\\` reads the entire stream into memory and then parses it into a JavaScript object. To truly stream JSON, you would need to use a streaming parser that can emit objects or keys as they arrive in chunks.'
    }
  ]
};
