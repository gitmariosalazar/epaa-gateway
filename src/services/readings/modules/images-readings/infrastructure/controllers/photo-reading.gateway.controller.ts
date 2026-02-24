import {
  Body,
  Controller,
  Inject,
  Logger,
  OnModuleInit,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePhotoReadingRequest } from '../../domain/schemas/dto/request/create.photo-reading.request';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { renameSync } from 'fs';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { PhotoReadingResponse } from '../../domain/schemas/dto/response/photo-reading.response';

@Controller('photo-reading')
@ApiTags('Photo Reading')
//@ApiBearerAuth()
//@UseGuards(AuthGuard)
export class PhotoReadingGatewayController implements OnModuleInit {
  private readonly logger = new Logger(PhotoReadingGatewayController.name);
  constructor(
    @Inject(environments.PHOTO_READING_KAFKA_CLIENT)
    private readonly photoReadingClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.logger.log('PhotoReadingGatewayController initialized');
    this.photoReadingClient.subscribeToResponseOf(
      'photo-reading.create-photo-reading',
    );
    this.photoReadingClient.subscribeToResponseOf(
      'photo-reading.get-photo-readings-by-reading-id',
    );
    this.photoReadingClient.subscribeToResponseOf(
      'photo-reading.get-photo-readings-by-cadastral-key',
    );
    this.logger.log(
      'Response patterns:',
      this.photoReadingClient['responsePatterns'],
    );
    await this.photoReadingClient.connect();
  }

  @Post('create-photo-readings')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: '/home/sigepaa/sigepaa/images/readings',
        filename: (req, file, cb) => {
          // Nombre temporal: timestamp-random.ext
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `temp-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
            description: 'Photo files',
          },
        },
        readingId: { type: 'number', example: 1 },
        cadastralKey: { type: 'string', example: '12-36' },
        description: { type: 'string', example: 'Photo taken...' },
      },
    },
  })
  async createPhotoReadings(
    @UploadedFiles() images: Express.Multer.File[],
    @Body()
    body: { readingId: number; cadastralKey: string; description?: string },
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      if (!images || images.length === 0)
        throw new Error('At least one image file is required.');
      if (!body.readingId) throw new Error('Reading ID is required.');

      const host = 'https://sigepaa-aa.com:8443';

      const photoReadingDtos: CreatePhotoReadingRequest[] = images.map(
        (image) => {
          // Renombrar el archivo con readingId
          const tempPath = image.path;
          const finalFilename = `${body.readingId}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(image.filename)}`;
          const finalPath = join(
            '/home/sigepaa/sigepaa/images/readings',
            finalFilename,
          );
          renameSync(tempPath, finalPath);

          // Construye la URL de la imagen guardada
          const imageUrl = `${host}/images/readings/${finalFilename}`;
          this.logger.log(`Image uploaded and renamed: ${imageUrl}`);

          // Construye el DTO para Kafka
          return new CreatePhotoReadingRequest(
            body.readingId,
            imageUrl,
            body.cadastralKey,
            body.description,
          );
        },
      );

      // Envía cada DTO por Kafka (puedes ajustar para enviar todo el array si tu microservicio lo soporta)
      const responses: PhotoReadingResponse[] = [];
      for (const dto of photoReadingDtos) {
        const response: PhotoReadingResponse = await sendKafkaRequest(
          this.photoReadingClient.send(
            'photo-reading.create-photo-reading',
            dto,
          ),
        );
        responses.push(response);
      }

      return new ApiResponse(
        'Photo readings created successfully!',
        responses,
        request.url,
      );
    } catch (error) {
      this.logger.error('Error creating photo readings:', error);
      throw new RpcException(error);
    }
  }
}
