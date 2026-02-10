import { Readable } from 'stream';
import { Transform } from 'stream';

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

export function readStreamHeadAndPassThrough(maxBytes: number): {
  transform: Transform;
  headPromise: Promise<Buffer>;
} {
  const chunks: Buffer[] = [];
  let size = 0;
  let headResolve!: (b: Buffer) => void;
  const headPromise = new Promise<Buffer>((r) => {
    headResolve = r;
  });

  const transform = new Transform({
    transform(chunk: unknown, _, cb) {
      const buf = toBuffer(chunk);
      if (!buf) return cb();

      if (size < maxBytes) {
        const take = Math.min(buf.length, maxBytes - size);
        chunks.push(buf.subarray(0, take));
        size += take;
        if (size >= maxBytes) headResolve(Buffer.concat(chunks, size));
      }
      this.push(chunk);
      cb();
    },
    flush(cb) {
      if (size < maxBytes)
        headResolve(size > 0 ? Buffer.concat(chunks, size) : Buffer.alloc(0));
      cb();
    },
  });

  return { transform, headPromise };
}
