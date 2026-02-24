import {
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { CountryResponse } from '../../domain/schemas/dto/response/location.response';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';

@Controller('location-global')
@ApiTags('Location Global')
export class LocationGlobalGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_LOCATION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
  ) {}

  async onModuleInit() {
    // Subscribe to Kafka topics for location service
    // Countries
    this.kafkaClient.subscribeToResponseOf('location.get-countries');
    this.kafkaClient.subscribeToResponseOf('location.get-country-by-id');
    this.kafkaClient.subscribeToResponseOf('location.get-country-by-name');

    // Provinces
    this.kafkaClient.subscribeToResponseOf('location.get-provinces');
    this.kafkaClient.subscribeToResponseOf('location.get-province-by-id');
    this.kafkaClient.subscribeToResponseOf('location.get-province-by-name');
    this.kafkaClient.subscribeToResponseOf(
      'location.get-provinces-by-country-id',
    );
    // Cantons
    this.kafkaClient.subscribeToResponseOf('location.get-cantons');
    this.kafkaClient.subscribeToResponseOf('location.get-canton-by-id');
    this.kafkaClient.subscribeToResponseOf('location.get-canton-by-name');
    this.kafkaClient.subscribeToResponseOf(
      'location.get-cantons-by-province-id',
    );

    // Parishes
    this.kafkaClient.subscribeToResponseOf('location.get-parishes');
    this.kafkaClient.subscribeToResponseOf('location.get-parish-by-id');
    this.kafkaClient.subscribeToResponseOf('location.get-parish-by-name');
    this.kafkaClient.subscribeToResponseOf(
      'location.get-parishes-by-canton-id',
    );
    await this.kafkaClient.connect();
  }

  // Countries

  @Get('get-countries')
  @ApiOperation({
    summary: 'Get all countries',
    description: 'Retrieves a list of all countries.',
  })
  async getCountries(@Req() request: Request): Promise<ApiResponse> {
    try {
      const countries: CountryResponse[] = await sendKafkaRequest(
        this.kafkaClient.send('location.get-countries', {}),
      );
      return new ApiResponse(
        'Countries retrieved successfully',
        countries,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-country-by-id/:countryId')
  @ApiOperation({
    summary: 'Get country by ID',
    description: 'Retrieves a country by its unique identifier.',
  })
  async getCountryById(
    @Req() request: Request,
    @Param('countryId') countryId: string,
  ): Promise<ApiResponse> {
    try {
      const country: CountryResponse = await sendKafkaRequest(
        this.kafkaClient.send('location.get-country-by-id', countryId),
      );
      return new ApiResponse(
        'Country retrieved successfully',
        country,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-country-by-name/:countryName')
  @ApiOperation({
    summary: 'Get country by name',
    description: 'Retrieves a country by its name.',
  })
  async getCountryByName(
    @Req() request: Request,
    @Param('countryName') countryName: string,
  ): Promise<ApiResponse> {
    try {
      const country: CountryResponse = await sendKafkaRequest(
        this.kafkaClient.send('location.get-country-by-name', countryName),
      );
      return new ApiResponse(
        'Country retrieved successfully',
        country,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // Provinces
  @Get('get-provinces')
  @ApiOperation({
    summary: 'Get all provinces',
    description: 'Retrieves a list of all provinces.',
  })
  async getProvinces(@Req() request: Request): Promise<ApiResponse> {
    try {
      const provinces = await sendKafkaRequest(
        this.kafkaClient.send('location.get-provinces', {}),
      );
      return new ApiResponse(
        'Provinces retrieved successfully',
        provinces,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-province-by-name/:provinceName')
  @ApiOperation({
    summary: 'Get province by name',
    description: 'Retrieves a province by its name.',
  })
  async getProvinceByName(
    @Req() request: Request,
    @Param('provinceName') provinceName: string,
  ): Promise<ApiResponse> {
    try {
      const province = await sendKafkaRequest(
        this.kafkaClient.send('location.get-province-by-name', provinceName),
      );
      return new ApiResponse(
        'Province retrieved successfully',
        province,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-province-by-id/:provinceId')
  @ApiOperation({
    summary: 'Get province by ID',
    description: 'Retrieves a province by its unique identifier.',
  })
  async getProvinceById(
    @Req() request: Request,
    @Param('provinceId') provinceId: string,
  ): Promise<ApiResponse> {
    try {
      const province = await sendKafkaRequest(
        this.kafkaClient.send('location.get-province-by-id', provinceId),
      );
      return new ApiResponse(
        'Province retrieved successfully',
        province,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-provinces-by-country-id/:countryId')
  @ApiOperation({
    summary: 'Get provinces by country ID',
    description: 'Retrieves a list of provinces for a given country ID.',
  })
  async getProvincesByCountryId(
    @Req() request: Request,
    @Param('countryId') countryId: string,
  ): Promise<ApiResponse> {
    try {
      const provinces = await sendKafkaRequest(
        this.kafkaClient.send(
          'location.get-provinces-by-country-id',
          countryId,
        ),
      );
      return new ApiResponse(
        'Provinces retrieved successfully',
        provinces,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // Cantons

  @Get('get-cantons')
  @ApiOperation({
    summary: 'Get all cantons',
    description: 'Retrieves a list of all cantons.',
  })
  async getCantons(@Req() request: Request): Promise<ApiResponse> {
    try {
      const cantons = await sendKafkaRequest(
        this.kafkaClient.send('location.get-cantons', {}),
      );
      return new ApiResponse(
        'Cantons retrieved successfully',
        cantons,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-canton-by-id/:cantonId')
  @ApiOperation({
    summary: 'Get canton by ID',
    description: 'Retrieves a canton by its unique identifier.',
  })
  async getCantonById(
    @Req() request: Request,
    @Param('cantonId') cantonId: string,
  ): Promise<ApiResponse> {
    try {
      const canton = await sendKafkaRequest(
        this.kafkaClient.send('location.get-canton-by-id', cantonId),
      );
      return new ApiResponse(
        'Canton retrieved successfully',
        canton,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-canton-by-name/:cantonName')
  @ApiOperation({
    summary: 'Get canton by name',
    description: 'Retrieves a canton by its name.',
  })
  async getCantonByName(
    @Req() request: Request,
    @Param('cantonName') cantonName: string,
  ): Promise<ApiResponse> {
    try {
      const canton = await sendKafkaRequest(
        this.kafkaClient.send('location.get-canton-by-name', cantonName),
      );
      return new ApiResponse(
        'Canton retrieved successfully',
        canton,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-cantons-by-province-id/:provinceId')
  @ApiOperation({
    summary: 'Get cantons by province ID',
    description: 'Retrieves a list of cantons for a given province ID.',
  })
  async getCantonsByProvinceId(
    @Req() request: Request,
    @Param('provinceId') provinceId: string,
  ): Promise<ApiResponse> {
    try {
      const cantons = await sendKafkaRequest(
        this.kafkaClient.send(
          'location.get-cantons-by-province-id',
          provinceId,
        ),
      );
      return new ApiResponse(
        'Cantons retrieved successfully',
        cantons,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // Parishes

  @Get('get-parishes')
  @ApiOperation({
    summary: 'Get all parishes',
    description: 'Retrieves a list of all parishes.',
  })
  async getParishes(@Req() request: Request): Promise<ApiResponse> {
    try {
      const parishes = await sendKafkaRequest(
        this.kafkaClient.send('location.get-parishes', {}),
      );
      return new ApiResponse(
        'Parishes retrieved successfully',
        parishes,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-parish-by-id/:parishId')
  @ApiOperation({
    summary: 'Get parish by ID',
    description: 'Retrieves a parish by its unique identifier.',
  })
  async getParishById(
    @Req() request: Request,
    @Param('parishId') parishId: string,
  ): Promise<ApiResponse> {
    try {
      const parish = await sendKafkaRequest(
        this.kafkaClient.send('location.get-parish-by-id', parishId),
      );
      return new ApiResponse(
        'Parish retrieved successfully',
        parish,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-parish-by-name/:parishName')
  @ApiOperation({
    summary: 'Get parish by name',
    description: 'Retrieves a parish by its name.',
  })
  async getParishByName(
    @Req() request: Request,
    @Param('parishName') parishName: string,
  ): Promise<ApiResponse> {
    try {
      const parish = await sendKafkaRequest(
        this.kafkaClient.send('location.get-parish-by-name', parishName),
      );
      return new ApiResponse(
        'Parish retrieved successfully',
        parish,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('get-parishes-by-canton-id/:cantonId')
  @ApiOperation({
    summary: 'Get parishes by canton ID',
    description: 'Retrieves a list of parishes for a given canton ID.',
  })
  async getParishesByCantonId(
    @Req() request: Request,
    @Param('cantonId') cantonId: string,
  ): Promise<ApiResponse> {
    try {
      const parishes = await sendKafkaRequest(
        this.kafkaClient.send('location.get-parishes-by-canton-id', cantonId),
      );
      return new ApiResponse(
        'Parishes retrieved successfully',
        parishes,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
