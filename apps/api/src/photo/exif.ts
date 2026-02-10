import exifr from 'exifr';
import { asDate, asNumber, asString } from '../helpers/helpers.js';
import { ExifSchema } from './photo.schema.js';

export async function getExif(buffer: Buffer): Promise<ExifSchema | undefined> {
  let parsed: unknown;
  try {
    parsed = await exifr.parse(buffer, {
      tiff: true,
      exif: true,
      gps: true,
      xmp: true,
      ifd1: true,
      makerNote: true,
      mergeOutput: true,
    });
  } catch {
    return undefined;
  }

  if (!parsed || typeof parsed !== 'object') return undefined;

  const r = parsed as Record<string, unknown>;

  const iso =
    typeof r.ISO === 'number'
      ? r.ISO
      : Array.isArray(r.ISO) && typeof r.ISO[0] === 'number'
        ? r.ISO[0]
        : undefined;

  return {
    cameraMake: asString(r.Make),
    cameraModel: asString(r.Model),
    lensModel: asString(r.LensModel),

    exposureTime: asNumber(r.ExposureTime),
    fNumber: asNumber(r.FNumber),
    iso,

    focalLength: asNumber(r.FocalLength),
    focalLength35mm: asNumber(r.FocalLengthIn35mmFormat),

    gpsLat: asNumber(r.latitude) ?? asNumber(r.GPSLatitude),
    gpsLng: asNumber(r.longitude) ?? asNumber(r.GPSLongitude),
    gpsAltitude: asNumber(r.GPSAltitude),

    takenAt:
      asDate(r.DateTimeOriginal) ??
      asDate(r.CreateDate) ??
      asDate(r.ModifyDate),
  };
}
