import sharp from 'sharp';
import { PassThrough } from 'stream';
import { pipeline } from 'stream/promises';
import { B2Storage } from '../storage/b2.storage.js';
import { readStreamHead } from '../helpers/readStreamHead.js';
import { getExif } from './exif.js';
import { ExifSchema } from './photo.schema.js';

function createThumbnailStream() {
  return sharp()
    .resize({
      width: 300,
      withoutEnlargement: true,
    })
    .jpeg({ quality: 80 });
}

export async function generateAndUploadThumbnail({
  storage,
  originalKey,
  thumbKey,
}: {
  storage: B2Storage;
  originalKey: string;
  thumbKey: string;
}): Promise<{ width: number; height: number; exif: ExifSchema }> {
  const inputStream = await storage.downloadStream(originalKey);
  const exifStream = await storage.downloadStream(originalKey);

  const head = await readStreamHead(exifStream, 64 * 1024);
  const exif = await getExif(head);
  const transformer = createThumbnailStream();

  const outputStream = new PassThrough();

  const uploadPromise = storage.uploadStream(
    thumbKey,
    outputStream,
    'image/jpeg',
  );

  const metadataPromise = transformer.metadata();

  await pipeline(inputStream, transformer, outputStream);

  await uploadPromise;

  const metadata = await metadataPromise;

  return {
    width: metadata.width ?? 0,
    height: metadata.height ?? 0,
    exif,
  };
}
