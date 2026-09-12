import fs from 'fs/promises';
import path from 'path';
import { env } from '../../config/env.js';

export const deleteUploadedFile = async (fileUrl) => {
  if (!fileUrl) return;

  try {
    const filename = path.basename(fileUrl);
    const uploadDir = path.resolve(env.UPLOAD_DIR);
    const targetPath = path.join(uploadDir, filename);

    // Prevent path traversal: target must be inside uploadDir
    if (!targetPath.startsWith(uploadDir)) {
      console.warn(`[File Cleanup] Disallowed path traversal attempt: ${fileUrl}`);
      return;
    }

    // Check if file exists before attempting unlink
    try {
      await fs.access(targetPath);
      await fs.unlink(targetPath);
    } catch (accessErr) {
      if (accessErr.code !== 'ENOENT') {
        console.warn(`[File Cleanup] Error deleting file ${targetPath}:`, accessErr.message);
      }
    }
  } catch (err) {
    console.warn(`[File Cleanup] Unexpected error for ${fileUrl}:`, err.message);
  }
};
