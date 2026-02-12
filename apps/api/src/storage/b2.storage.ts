import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';
import { env } from '../env.server.js';

@Injectable()
export class B2Storage {
  private client: S3Client;
  private bucket: string;

  constructor() {
    this.bucket = env.AWS_BUCKET;
    this.client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_KEY_ID,
        secretAccessKey: env.AWS_BUCKET_ACCESS_KEY,
      },
    });
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private static readonly DELETE_BATCH_SIZE = 1000;

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;

    for (let i = 0; i < keys.length; i += B2Storage.DELETE_BATCH_SIZE) {
      const batch = keys.slice(i, i + B2Storage.DELETE_BATCH_SIZE);
      const response = await this.client.send(
        new DeleteObjectsCommand({
          Bucket: this.bucket,
          Delete: {
            Objects: batch.map((key) => ({ Key: key })),
            Quiet: true,
          },
        }),
      );

      const errors = response.Errors ?? [];
      if (errors.length > 0) {
        const details = errors
          .map((e) =>
            `${e.Key ?? 'unknown'}: ${e.Code ?? ''} ${e.Message ?? ''}`.trim(),
          )
          .join('; ');
        throw new Error(
          `B2 deleteObjects failed for ${errors.length} object(s): ${details}`,
        );
      }
    }
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

  async getSignedUrl(key: string, expiresIn = 120) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ResponseCacheControl: `private, max-age=${expiresIn}`,
    });

    const signedUrl = await getSignedUrl(this.client, command, {
      expiresIn,
    });

    return {
      signedUrl,
      expiresAt: new Date(Date.now() + expiresIn * 1000),
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
