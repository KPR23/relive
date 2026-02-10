import { Readable } from 'stream';

function toBuffer(chunk: unknown): Buffer | null {
  if (Buffer.isBuffer(chunk)) return chunk;
  if (chunk instanceof Uint8Array) return Buffer.from(chunk);
  return null;
}

export async function readStreamHead(
  stream: Readable,
  maxBytes: number,
): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;

  for await (const chunk of stream) {
    const buf = toBuffer(chunk);
    if (!buf) continue;

    chunks.push(buf);
    total += buf.byteLength;

    if (total >= maxBytes) {
      stream.destroy();
      break;
    }
  }

  return Buffer.concat(chunks, total);
}
