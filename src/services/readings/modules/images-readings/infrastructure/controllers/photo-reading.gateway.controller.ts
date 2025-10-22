import { Body, Controller, Inject, Logger, OnModuleInit, Post, Req, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ClientKafka, RpcException } from "@nestjs/microservices";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { environments } from "src/settings/environments/environments";
import { CreatePhotoReadingRequest } from "../../domain/schemas/dto/request/create.photo-reading.request";
import { ApiResponse } from "src/shared/errors/responses/ApiResponse";
import { sendKafkaRequest } from "src/shared/utils/kafka/send.kafka.request";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import { renameSync } from "fs";

@Controller('photo-reading')
@ApiTags('Photo Reading')
export class PhotoReadingGatewayController implements OnModuleInit {
  private readonly logger = new Logger(PhotoReadingGatewayController.name);
  constructor(
    @Inject(environments.PHOTO_READING_KAFKA_CLIENT)
    private readonly photoReadingClient: ClientKafka
  ) { }

  async onModuleInit() {
    this.logger.log('PhotoReadingGatewayController initialized');
    this.photoReadingClient.subscribeToResponseOf('photo-reading.create-photo-reading');
    this.photoReadingClient.subscribeToResponseOf('photo-reading.get-photo-readings-by-reading-id');
    this.photoReadingClient.subscribeToResponseOf('photo-reading.get-photo-readings-by-cadastral-key');
    this.logger.log('Response patterns:', this.photoReadingClient['responsePatterns']);
    await this.photoReadingClient.connect();
  }

  @Post('create-photo-readings')
  @UseInterceptors(FilesInterceptor('images', 10, {
    storage: diskStorage({
      destination: '/home/sigepaa/sigepaa/images/readings',
      filename: (req, file, cb) => {
        // Nombre temporal: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `temp-${uniqueSuffix}${extname(file.originalname)}`);
      }
    }),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    }
  }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        images: { type: 'array', items: { type: 'string', format: 'binary', description: 'Photo files' } },
        readingId: { type: 'number', example: 1 },
        cadastralKey: { type: 'string', example: '12-36' },
        description: { type: 'string', example: 'Photo taken...' }
      }
    }
  })
  async createPhotoReadings(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: { readingId: number; cadastralKey: string; description?: string },
    @Req() request: Request
  ): Promise<ApiResponse> {
    try {
      if (!images || images.length === 0) throw new Error('At least one image file is required.');
      if (!body.readingId) throw new Error('Reading ID is required.');

      const host = 'https://sigepaa-aa.com:8443';

      const photoReadingDtos: CreatePhotoReadingRequest[] = images.map((image) => {
        // Renombrar el archivo con readingId
        const tempPath = image.path;
        const finalFilename = `${body.readingId}-${Date.now()}-${Math.round(Math.random() * 1E9)}${extname(image.filename)}`;
        const finalPath = join('/home/sigepaa/sigepaa/images/readings', finalFilename);
        renameSync(tempPath, finalPath);

        // Construye la URL de la imagen guardada
        const imageUrl = `${host}/images/readings/${finalFilename}`;
        this.logger.log(`Image uploaded and renamed: ${imageUrl}`);

        // Construye el DTO para Kafka
        return new CreatePhotoReadingRequest(
          body.readingId,
          imageUrl,
          body.cadastralKey,
          body.description
        );
      });

      // Envía cada DTO por Kafka (puedes ajustar para enviar todo el array si tu microservicio lo soporta)
      const responses: any[] = [];
      for (const dto of photoReadingDtos) {
        const response = await sendKafkaRequest(
          this.photoReadingClient.send(
            'photo-reading.create-photo-reading', dto
          )
        );
        responses.push(response);
      }

      return new ApiResponse(
        'Photo readings created successfully!',
        responses,
        request.url
      );
    } catch (error) {
      this.logger.error('Error creating photo readings:', error);
      throw new RpcException(error);
    }
  }
}