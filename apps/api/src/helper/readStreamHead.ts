import { Readable } from 'stream';

export async function readStreamHead(
  stream: Readable,
  maxBytes: number,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of stream) {
    chunks.push(chunk);
    total += chunk.length;

    if (total >= maxBytes) {
      stream.destroy();
      break;
    }
  }

  return Buffer.concat(chunks, total);
}
