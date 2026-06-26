import { Controller, Get, Logger, Param, Res, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { access, constants as fsConstants } from 'fs/promises';
import { basename, extname, join } from 'path';
import { Response } from 'express';
import { RpcException } from '@nestjs/microservices';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { AllowedUserTypes } from '../../auth/decorator/allowed-user-types.decorator';
import { FILE_TYPE_DIR_MAP } from './files-type.map';
import { statusCode } from '../../settings/environments/status-code';

/**
 * MIME type map — covers images, documents, spreadsheets, archives, and more.
 * Fallback: 'application/octet-stream' (forces browser to download unknown types).
 */
const MIME_TYPE_MAP: Record<string, string> = {
  // ── Images ────────────────────────────────────────────────────────────────
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.tiff': 'image/tiff',
  '.tif': 'image/tiff',
  // ── Documents ─────────────────────────────────────────────────────────────
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx':
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.odt': 'application/vnd.oasis.opendocument.text',
  '.txt': 'text/plain',
  '.rtf': 'application/rtf',
  // ── Spreadsheets ──────────────────────────────────────────────────────────
  '.xls': 'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.csv': 'text/csv',
  '.ods': 'application/vnd.oasis.opendocument.spreadsheet',
  // ── Presentations ─────────────────────────────────────────────────────────
  '.ppt': 'application/vnd.ms-powerpoint',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // ── Archives ──────────────────────────────────────────────────────────────
  '.zip': 'application/zip',
  '.rar': 'application/vnd.rar',
  '.7z': 'application/x-7z-compressed',
  '.tar': 'application/x-tar',
  '.gz': 'application/gzip',
  // ── Data ──────────────────────────────────────────────────────────────────
  '.json': 'application/json',
  '.xml': 'application/xml',
};

@Controller('files')
@ApiTags('Files (Secure Serve)')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@AllowedUserTypes('employee', 'customer')
export class ImageServeController {
  private readonly logger = new Logger(ImageServeController.name);

  // ─────────────────────────────────────────────────────────────────────────
  // GET /files/:type/:filename/preview  → inline (visualización en browser)
  // ─────────────────────────────────────────────────────────────────────────
  @Get(':type/:filename/preview')
  @ApiOperation({
    summary: 'Serve a file inline (authenticated)',
    description:
      'Returns the physical file inline (browser preview) for authenticated users. ' +
      `The :type parameter must be one of: ${Object.keys(FILE_TYPE_DIR_MAP).join(', ')}. ` +
      'Supports images, PDFs, documents, spreadsheets, and more.',
  })
  @ApiParam({
    name: 'type',
    description: 'File category',
    enum: Object.keys(FILE_TYPE_DIR_MAP),
  })
  @ApiParam({
    name: 'filename',
    description: 'Filename including extension (e.g. report.pdf, photo.jpg)',
  })
  async previewFile(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.streamFile(type, filename, response, 'inline');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GET /files/:type/:filename/download  → attachment (descarga forzada)
  // ─────────────────────────────────────────────────────────────────────────
  @Get(':type/:filename/download')
  @ApiOperation({
    summary: 'Download a file as attachment (authenticated)',
    description:
      'Returns the physical file as a downloadable attachment for authenticated users. ' +
      `The :type parameter must be one of: ${Object.keys(FILE_TYPE_DIR_MAP).join(', ')}. ` +
      'Supports images, PDFs, documents, spreadsheets, and more.',
  })
  @ApiParam({
    name: 'type',
    description: 'File category',
    enum: Object.keys(FILE_TYPE_DIR_MAP),
  })
  @ApiParam({
    name: 'filename',
    description: 'Filename including extension (e.g. report.pdf, photo.jpg)',
  })
  async downloadFile(
    @Param('type') type: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ): Promise<void> {
    await this.streamFile(type, filename, response, 'attachment');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Shared private streaming logic
  // ─────────────────────────────────────────────────────────────────────────
  private async streamFile(
    type: string,
    filename: string,
    response: Response,
    disposition: 'inline' | 'attachment',
  ): Promise<void> {
    try {
      // 1. Validate file category
      const dir = FILE_TYPE_DIR_MAP[type];
      if (!dir) {
        response.status(statusCode.NOT_FOUND).json({
          statusCode: statusCode.NOT_FOUND,
          message: `Unknown file category: "${type}". Valid categories: ${Object.keys(FILE_TYPE_DIR_MAP).join(', ')}.`,
        });
        return;
      }

      // 2. Sanitize filename — prevents path traversal attacks (e.g. ../../etc/passwd)
      const safeFilename = this.extractSafeFileName(filename);

      // 3. Build absolute path
      const absolutePath = join(dir, safeFilename);

      // 4. Check file exists and is readable
      await access(absolutePath, fsConstants.R_OK);

      // 5. Detect MIME type from extension — fallback to octet-stream
      const ext = extname(safeFilename).toLowerCase();
      const mimeType = MIME_TYPE_MAP[ext] ?? 'application/octet-stream';

      // 6. Set secure headers
      response.setHeader('Content-Type', mimeType);
      response.setHeader(
        'Content-Disposition',
        `${disposition}; filename="${basename(safeFilename)}"`,
      );
      response.setHeader(
        'Cache-Control',
        'no-store, no-cache, must-revalidate, private',
      );
      response.setHeader('Pragma', 'no-cache');
      response.setHeader('X-Content-Type-Options', 'nosniff');

      // 7. Stream the file
      const stream = createReadStream(absolutePath);
      stream.on('error', (err) => {
        this.logger.error(
          `Error streaming file ${absolutePath}: ${err.message}`,
        );
        if (!response.headersSent) {
          response.status(statusCode.INTERNAL_SERVER_ERROR).json({
            statusCode: statusCode.INTERNAL_SERVER_ERROR,
            message: 'Error streaming file',
          });
        } else {
          response.end();
        }
      });

      stream.pipe(response);
    } catch (error: any) {
      if (response.headersSent) return;

      // fs/promises access() throws ENOENT when file is not found
      if (error?.code === 'ENOENT') {
        response.status(statusCode.NOT_FOUND).json({
          statusCode: statusCode.NOT_FOUND,
          message: `File not found: ${filename}`,
        });
        return;
      }

      const rpcError = error instanceof RpcException ? error.getError() : null;
      const payload =
        rpcError && typeof rpcError === 'object'
          ? (rpcError as any)
          : {
              statusCode: statusCode.INTERNAL_SERVER_ERROR,
              message: 'Error serving file',
            };

      response
        .status(payload.statusCode ?? statusCode.INTERNAL_SERVER_ERROR)
        .json(payload);
    }
  }

  /**
   * Strips path components and validates the filename is safe.
   * Prevents path traversal attacks (e.g. `../../etc/passwd`).
   */
  private extractSafeFileName(rawFilename: string): string {
    if (!rawFilename || typeof rawFilename !== 'string') {
      throw new RpcException({
        statusCode: statusCode.BAD_REQUEST,
        message: 'Invalid filename',
      });
    }

    // Strip query strings and fragments, then take only the basename
    const normalized = rawFilename.split('?')[0].split('#')[0];
    const safe = basename(normalized);

    if (!safe || safe === '.' || safe === '..') {
      throw new RpcException({
        statusCode: statusCode.BAD_REQUEST,
        message: 'Invalid filename',
      });
    }

    return safe;
  }
}
