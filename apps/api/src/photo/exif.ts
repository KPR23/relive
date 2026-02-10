import exifr from 'exifr';
import { ExifSchema } from './photo.schema.js';

export async function getExif(buffer: Buffer): Promise<ExifSchema> {
  const raw = await exifr.parse(buffer, {
    tiff: true,
    exif: true,
    gps: true,
    xmp: true,
    ifd1: true,
    makerNote: true,
    mergeOutput: true,
  });

  if (!raw) return;

  const orientation = (() => {
    switch (raw.Orientation) {
      case 'Horizontal (normal)':
        return 1;
      case 'Mirror horizontal':
        return 2;
      case 'Rotate 180':
        return 3;
      case 'Mirror vertical':
        return 4;
      case 'Mirror horizontal and rotate 270 CW':
        return 5;
      case 'Rotate 90 CW':
        return 6;
      case 'Mirror horizontal and rotate 90 CW':
        return 7;
      case 'Rotate 270 CW':
        return 8;
      default:
        return undefined;
    }
  })();

  const exif: ExifSchema = {
    orientation,
    cameraMake: raw.Make,
    cameraModel: raw.Model,
    lensModel: raw.LensModel,
    exposureTime: raw.ExposureTime,
    fNumber: raw.FNumber,
    iso: raw.ISO,
    focalLength: raw.FocalLength,
    focalLength35mm: raw.FocalLengthIn35mmFormat,
    gpsLat: raw.latitude ?? raw.GPSLatitude,
    gpsLng: raw.longitude ?? raw.GPSLongitude,
    gpsAltitude: raw.GPSAltitude,
    takenAt: raw.DateTimeOriginal ?? raw.CreateDate ?? raw.ModifyDate,
  };

  return exif;
}
