import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import path from 'path';
import crypto from 'crypto';
import { env } from '../../config/env.js';
import { ServiceUnavailableError } from '../errors/index.js';

export class StorageService {
  constructor() {
    this.bucket = env.S3_BUCKET;
    this.client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY,
        secretAccessKey: env.S3_SECRET_KEY,
      },
      forcePathStyle: env.S3_FORCE_PATH_STYLE === 'true' || env.S3_FORCE_PATH_STYLE === true,
    });
  }

  getPublicUrl(objectKey) {
    const base = env.S3_PUBLIC_URL || env.S3_ENDPOINT;
    const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const cleanKey = objectKey.startsWith('/') ? objectKey.slice(1) : objectKey;
    return `${cleanBase}/${this.bucket}/${cleanKey}`;
  }

  extractObjectKey(objectKeyOrUrl) {
    if (!objectKeyOrUrl) return '';
    if (objectKeyOrUrl.includes(`/${this.bucket}/`)) {
      return objectKeyOrUrl.split(`/${this.bucket}/`)[1];
    }
    if (objectKeyOrUrl.startsWith(`/${this.bucket}`)) {
      return objectKeyOrUrl.replace(new RegExp(`^/?${this.bucket}/?`), '');
    }
    // If it starts with a leading slash, trim it
    return objectKeyOrUrl.replace(/^\/+/, '');
  }

  async uploadFile(file, folder = 'wedding-halls') {
    try {
      let bodyBuffer = file?.buffer;
      if (!bodyBuffer && file?.path) {
        const fs = await import('fs/promises');
        bodyBuffer = await fs.readFile(file.path);
      }

      if (!bodyBuffer) {
        throw new Error('File buffer is empty or missing');
      }

      const originalname = file?.originalname || '';
      const mimetype = file?.mimetype || 'application/octet-stream';
      const ext = path.extname(originalname).toLowerCase() || '.webp';
      const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
      const objectKey = `${cleanFolder}/${crypto.randomUUID()}${ext}`;

      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: objectKey,
        Body: bodyBuffer,
        ContentType: mimetype,
      });

      await this.client.send(command);

      return {
        objectKey,
        url: this.getPublicUrl(objectKey),
      };
    } catch (err) {
      if (env.NODE_ENV !== 'test') {
        console.error('[StorageService] Error uploading file:', err);
      }
      throw new ServiceUnavailableError(
        'Image storage service is currently unavailable',
        'STORAGE_SERVICE_UNAVAILABLE'
      );
    }
  }

  async deleteFile(objectKeyOrUrl) {
    try {
      const key = this.extractObjectKey(objectKeyOrUrl);
      if (!key) return false;

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await this.client.send(command);
      return true;
    } catch (err) {
      if (env.NODE_ENV !== 'test') {
        console.warn(`[StorageService] Error deleting object "${objectKeyOrUrl}":`, err.message);
      }
      return false;
    }
  }

  async objectExists(objectKey) {
    try {
      const key = this.extractObjectKey(objectKey);
      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });
      await this.client.send(command);
      return true;
    } catch {
      return false;
    }
  }
}

export const storageService = new StorageService();
