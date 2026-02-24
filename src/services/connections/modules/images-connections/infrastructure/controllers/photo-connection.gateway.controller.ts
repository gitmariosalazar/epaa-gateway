import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  OnModuleInit,
  Param,
  Post,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { CreatePhotoConnectionRequest } from '../../domain/schemas/dto/request/create.photo-connection.request';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { renameSync } from 'fs';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { PhotoConnectionResponse } from '../../domain/schemas/dto/response/photo-connection.response';

@Controller('photo-connection')
@ApiTags('Photo Connection')
//@ApiBearerAuth()
//@UseGuards(AuthGuard)
export class PhotoConnectionGatewayController implements OnModuleInit {
  private readonly logger = new Logger(PhotoConnectionGatewayController.name);
  constructor(
    @Inject(environments.PHOTO_CONNECTION_KAFKA_CLIENT)
    private readonly photoConnectionClient: ClientKafka,
  ) {}

  async onModuleInit() {
    this.logger.log('PhotoConnectionGatewayController initialized');
    this.photoConnectionClient.subscribeToResponseOf(
      'photo-connection.create-photo-connection',
    );
    this.photoConnectionClient.subscribeToResponseOf(
      'photo-connection.get-photo-connections-by-cadastral-key',
    );
    this.logger.log(
      'Response patterns:',
      this.photoConnectionClient['responsePatterns'],
    );
    await this.photoConnectionClient.connect();
  }

  @Post('create-photo-connection')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: '/home/sigepaa/sigepaa/images/connections',
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
        connectionId: { type: 'number', example: 1 },
        description: { type: 'string', example: 'Photo taken...' },
      },
    },
  })
  async createPhotoConnections(
    @UploadedFiles() images: Express.Multer.File[],
    @Body() body: { connectionId: string; description?: string },
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      if (!images || images.length === 0)
        throw new Error('At least one image file is required.');
      if (!body.connectionId) throw new Error('Connection ID is required.');

      const host = 'https://sigepaa-aa.com:8443';

      const photoConnectionDtos: CreatePhotoConnectionRequest[] = images.map(
        (image) => {
          // Renombrar el archivo con connectionId
          const tempPath = image.path;
          const finalFilename = `${body.connectionId}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(image.filename)}`;
          const finalPath = join(
            '/home/sigepaa/sigepaa/images/connections',
            finalFilename,
          );
          renameSync(tempPath, finalPath);

          // Construye la URL de la imagen guardada
          const imageUrl = `${host}/images/connections/${finalFilename}`;
          this.logger.log(`Image uploaded and renamed: ${imageUrl}`);

          // Construye el DTO para Kafka
          return new CreatePhotoConnectionRequest(
            body.connectionId,
            imageUrl,
            body.description,
          );
        },
      );

      // Envía cada DTO por Kafka (puedes ajustar para enviar todo el array si tu microservicio lo soporta)
      const responses: PhotoConnectionResponse[] = [];
      for (const dto of photoConnectionDtos) {
        const response: PhotoConnectionResponse = await sendKafkaRequest(
          this.photoConnectionClient.send(
            'photo-connection.create-photo-connection',
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

  @Get('get-by-cadastral-key/:cadastralKey')
  async getPhotoConnectionsByCadastralKey(
    @Req() request: Request,
    @Param('cadastralKey') cadastralKey: string,
  ): Promise<ApiResponse> {
    try {
      if (!cadastralKey) throw new Error('Cadastral key is required.');

      const response: PhotoConnectionResponse[] = await sendKafkaRequest(
        this.photoConnectionClient.send(
          'photo-connection.get-photo-connections-by-cadastral-key',
          { cadastralKey },
        ),
      );

      return new ApiResponse(
        `Photo connections for cadastral key ${cadastralKey} retrieved successfully!`,
        response,
        request.url,
      );
    } catch (error) {
      this.logger.error(
        'Error retrieving photo connections by cadastral key:',
        error,
      );
      throw new RpcException(error);
    }
  }
}
