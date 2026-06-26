import { Module } from '@nestjs/common';
import { ImageServeController } from './files-serve.controller';

/**
 * Global module that exposes two authenticated endpoints to serve any file
 * (images, PDFs, Office documents, spreadsheets, archives, etc.):
 *
 *   GET /files/:type/:filename/preview   → inline  (browser preview)
 *   GET /files/:type/:filename/download  → attachment (force download)
 *
 * All requests require a valid JWT (AuthGuard). No static files are exposed
 * publicly — this replaces all ServeStaticModule usages across the gateway.
 *
 * To add a new file category, edit FILE_TYPE_DIR_MAP in image-type.map.ts.
 */
@Module({
  controllers: [ImageServeController],
})
export class ImageServeModule {}
