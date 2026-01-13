import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from 'src/env';

export class B2Storage {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = env.BACKBLAZE_BUCKET;
    this.client = new S3Client({
      region: env.BACKBLAZE_REGION,
      endpoint: env.BACKBLAZE_ENDPOINT,
      credentials: {
        accessKeyId: env.BACKBLAZE_KEY_ID,
        secretAccessKey: env.BACKBLAZE_ACCESS_KEY,
      },
    });
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  // async getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  //   const command = new GetObjectCommand({
  //     Bucket: this.bucket,
  //     Key: key,
  //   });

  //   return getSignedUrl(this.client, command, { expiresIn });
  // }

  async getUploadUrl(key: string, contentType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(this.client, command, {
      expiresIn: 3600,
    });
  }
}
