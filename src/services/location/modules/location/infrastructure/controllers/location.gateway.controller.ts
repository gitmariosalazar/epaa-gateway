import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Req
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { CountryResponse } from '../../domain/schemas/dto/response/location.response';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';

@Controller('location-global')
@ApiTags('Location Global')
export class LocationGlobalGatewayController {
  private readonly logger = new Logger(LocationGlobalGatewayController.name);
  constructor(
    @Inject(environments.GATEWAY_LOCATION_KAFKA_CLIENT)
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  // Countries

  @Get('get-countries')
  @ApiOperation({
    summary: 'Get all countries',
    description: 'Retrieves a list of all countries.',
  })
  async getCountries(@Req() request: Request): Promise<ApiResponse> {
    try {
      const countries: CountryResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(this.kafkaClient, 'location.get-countries', {}),
      );
      return new ApiResponse(
        'Countries retrieved successfully',
        countries,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getCountries: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-country-by-id', countryId),
      );
      return new ApiResponse(
        'Country retrieved successfully',
        country,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getCountryById: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-country-by-name', countryName),
      );
      return new ApiResponse(
        'Country retrieved successfully',
        country,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getCountryByName: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-provinces', {}),
      );
      return new ApiResponse(
        'Provinces retrieved successfully',
        provinces,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getProvinces: ${err.message}`, err.stack);
      throw new RpcException(error as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-province-by-name', provinceName),
      );
      return new ApiResponse(
        'Province retrieved successfully',
        province,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getProvinceByName: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-province-by-id', provinceId),
      );
      return new ApiResponse(
        'Province retrieved successfully',
        province,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getProvinceById: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'location.get-provinces-by-country-id', countryId,
        ),
      );
      return new ApiResponse(
        'Provinces retrieved successfully',
        provinces,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getProvincesByCountryId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-cantons', {}),
      );
      return new ApiResponse(
        'Cantons retrieved successfully',
        cantons,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getCantons: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-canton-by-id', cantonId),
      );
      return new ApiResponse(
        'Canton retrieved successfully',
        canton,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getCantonById: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-canton-by-name', cantonName),
      );
      return new ApiResponse(
        'Canton retrieved successfully',
        canton,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getCantonByName: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 
          'location.get-cantons-by-province-id', provinceId,
        ),
      );
      return new ApiResponse(
        'Cantons retrieved successfully',
        cantons,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getCantonsByProvinceId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-parishes', {}),
      );
      return new ApiResponse(
        'Parishes retrieved successfully',
        parishes,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getParishes: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-parish-by-id', parishId),
      );
      return new ApiResponse(
        'Parish retrieved successfully',
        parish,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getParishById: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-parish-by-name', parishName),
      );
      return new ApiResponse(
        'Parish retrieved successfully',
        parish,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in getParishByName: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
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
        this.kafkaProxy.send(this.kafkaClient, 'location.get-parishes-by-canton-id', cantonId),
      );
      return new ApiResponse(
        'Parishes retrieved successfully',
        parishes,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in getParishesByCantonId: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
