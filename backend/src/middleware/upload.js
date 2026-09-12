import multer from 'multer';
import path from 'path';
import { env } from '../config/env.js';
import { BadRequestError } from '../shared/errors/index.js';

// Use memoryStorage for in-memory buffer processing directly to MinIO
const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new BadRequestError(
        'Invalid file type. Only JPEG, JPG, PNG, and WebP images are allowed.',
        'INVALID_FILE_TYPE'
      ),
      false
    );
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});
