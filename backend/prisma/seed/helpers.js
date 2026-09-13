import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';
import { HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { storageService } from '../../src/shared/storage/storage.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const SEED_ASSETS_DIR = path.join(__dirname, '..', 'seed-assets');
export const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Uploads an image from seed-assets with a deterministic MinIO object key.
 * If the object already exists in MinIO, skips upload and returns the public URL.
 */
export async function uploadDeterministicSeedImage(localFilename, folder, stableName) {
  const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
  const objectName = stableName || localFilename;
  const objectKey = `${cleanFolder}/${objectName}`;

  try {
    // 1. Check if already uploaded to MinIO
    try {
      await storageService.client.send(
        new HeadObjectCommand({
          Bucket: storageService.bucket,
          Key: objectKey,
        })
      );
      return storageService.getPublicUrl(objectKey);
    } catch (headErr) {
      // Not found (404) or head error -> proceed to upload
    }

    // 2. Read local file
    const filePath = path.join(SEED_ASSETS_DIR, localFilename);
    const buffer = await fs.readFile(filePath);

    // 3. Put to MinIO with deterministic key
    await storageService.client.send(
      new PutObjectCommand({
        Bucket: storageService.bucket,
        Key: objectKey,
        Body: buffer,
        ContentType: 'image/webp',
      })
    );

    return storageService.getPublicUrl(objectKey);
  } catch (err) {
    console.warn(`MinIO deterministic upload fallback for ${localFilename}: ${err.message}`);
    return `/images/halls/${localFilename}`;
  }
}
