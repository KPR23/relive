import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Injectable } from '@nestjs/common';
import { env } from '../env.server.js';
import { Readable } from 'stream';

@Injectable()
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

  async downloadStream(key: string): Promise<Readable> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error('Empty object body');
    }

    return response.Body as Readable;
  }

  async uploadStream(
    key: string,
    body: Readable,
    contentType: string,
  ): Promise<void> {
    const upload = new Upload({
      client: this.client,
      params: {
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      },
    });

    await upload.done();
  }

  async getSignedUrl(
    key: string,
    expiresIn?: number,
  ): Promise<{ signedUrl: string; expiresAt: Date }> {
    const ttl = expiresIn ?? 600;

    let signingDate = new Date();
    let finalTtl = ttl;

    if (ttl >= 3600) {
      const now = new Date();
      signingDate = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
      );

      finalTtl = ttl + 24 * 60 * 60;
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseCacheControl: `public, max-age=${ttl}, immutable`,
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn: finalTtl,
      signingDate,
    });

    return {
      signedUrl,
      expiresAt: new Date(signingDate.getTime() + finalTtl * 1000),
    };
  }

  async getFileInfo(key: string) {
    const result = await this.client.send(
      new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    return {
      size: result.ContentLength || 0,
    };
  }

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
