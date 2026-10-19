import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { unlink } from 'fs/promises';
import { environments } from '../../../../../../settings/environments/environments';

export const WORK_ORDER_IMAGES_FIELD = 'images';
export const WORK_ORDER_IMAGES_MAX_FILES = 10;
export const WORK_ORDER_IMAGE_MAX_SIZE_BYTES = 10 * 1024 * 1024;
const FILES_URL_PREFIX = '/files/work_orders';

const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
];

export const workOrderImagesMulterOptions = {
  storage: diskStorage({
    destination: environments.FILE_STORAGE_PATH,
    filename: (_req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${extname(file.originalname).toLowerCase()}`);
    },
  }),
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }
    cb(
      new BadRequestException(
        'Solo se permiten imágenes (JPEG, PNG, GIF, WebP, BMP)',
      ),
      false,
    );
  },
  limits: { fileSize: WORK_ORDER_IMAGE_MAX_SIZE_BYTES },
};

// URL servida por el endpoint autenticado GET /files/:type/:filename/preview
export const toWorkOrderImageUrl = (file: Express.Multer.File): string =>
  `${FILES_URL_PREFIX}/${file.filename}/preview`;

export const removeUploadedFiles = async (
  files: Express.Multer.File[],
): Promise<void> => {
  await Promise.allSettled(
    files.map((file) =>
      unlink(file.path ?? join(environments.FILE_STORAGE_PATH, file.filename)),
    ),
  );
};
