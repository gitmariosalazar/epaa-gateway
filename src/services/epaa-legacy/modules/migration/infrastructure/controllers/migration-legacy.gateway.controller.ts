import { Controller, Get, Inject, Logger, Query, Req } from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';

@Controller('migration/lecturas')
@ApiTags('Migration - Legacy')
export class MigrationLegacyGatewayController {
  private readonly logger = new Logger(MigrationLegacyGatewayController.name);
  constructor(
    @Inject('EPAA_LEGACY_MIGRATION_KAFKA_CLIENT')
    private readonly kafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @Get('migrate')
  @ApiOperation({
    summary: 'Method GET - Migrate Lecturas (Legacy)',
    description:
      'Migrates lecturas from PostgreSQL into the configured SQL Server target (2000 or 2022, selected by DATABASE_TYPE), then compares the same months and returns both results (migration + comparison)',
  })
  async migrate(
    @Req() request: Request,
    @Query('months') months?: string,
  ): Promise<ApiResponse> {
    try {
      const monthsArray = months ? months.split(',') : undefined;
      this.logger.log(
        `Sending migrate-lecturas request: ${JSON.stringify(monthsArray)}`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.migration.migrate-lecturas',
          {
            months: monthsArray,
          },
        ),
      );
      return new ApiResponse(
        'Lecturas migrated successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in migrate: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('compare')
  @ApiOperation({
    summary: 'Method GET - Compare Lecturas (Legacy)',
    description:
      'Compares lecturas between PostgreSQL and the configured SQL Server target (2000 or 2022, selected by DATABASE_TYPE)',
  })
  async compare(
    @Req() request: Request,
    @Query('months') months?: string,
  ): Promise<ApiResponse> {
    try {
      const monthsArray = months ? months.split(',') : undefined;
      this.logger.log(
        `Sending compare-lecturas request: ${JSON.stringify(monthsArray)}`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.migration.compare-lecturas',
          {
            months: monthsArray,
          },
        ),
      );
      return new ApiResponse(
        'Lecturas compared successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in compare: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Get('reconciliation/summary')
  @ApiOperation({
    summary: 'Method GET - Reconciliation Summary (Legacy)',
    description:
      'Compares AP_LECTURAS and lecturas_postgres directly in SQL Server for a given month (YYYY-MM) and returns match/mismatch counts',
  })
  async reconciliationSummary(
    @Req() request: Request,
    @Query('mesLectura') mesLectura: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(`Sending reconciliation.summary request: ${mesLectura}`);
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.migration.reconciliation.summary',
          { mesLectura },
        ),
      );
      return new ApiResponse(
        'Reconciliation summary retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in reconciliationSummary: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('reconciliation/duplicates')
  @ApiOperation({
    summary: 'Method GET - Reconciliation Duplicates (Legacy)',
    description:
      'Lists duplicate composite keys in both AP_LECTURAS and lecturas_postgres for a given month (YYYY-MM)',
  })
  async reconciliationDuplicates(
    @Req() request: Request,
    @Query('mesLectura') mesLectura: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending reconciliation.duplicates request: ${mesLectura}`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.migration.reconciliation.duplicates',
          { mesLectura },
        ),
      );
      return new ApiResponse(
        'Reconciliation duplicates retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in reconciliationDuplicates: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('reconciliation/mismatches')
  @ApiOperation({
    summary: 'Method GET - Reconciliation Mismatches (Legacy)',
    description:
      'Lists the records that differ (or are missing in AP_LECTURAS) between AP_LECTURAS and lecturas_postgres for a given month (YYYY-MM)',
  })
  async reconciliationMismatches(
    @Req() request: Request,
    @Query('mesLectura') mesLectura: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending reconciliation.mismatches request: ${mesLectura}`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.migration.reconciliation.mismatches',
          { mesLectura },
        ),
      );
      return new ApiResponse(
        'Reconciliation mismatches retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in reconciliationMismatches: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
  @Get('reconciliation/kpis')
  @ApiOperation({
    summary: 'Method GET - Reconciliation KPIs (Legacy)',
    description:
      'Returns the key performance indicators for the reconciliation process of a given month (YYYY-MM)',
  })
  async reconciliationKpis(
    @Req() request: Request,
    @Query('mesLectura') mesLectura: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending reconciliation.kpis request: ${mesLectura}`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.migration.reconciliation.kpis',
          { mesLectura },
        ),
      );
      return new ApiResponse(
        'Reconciliation KPIs retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in reconciliationKpis: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Get('reconciliation/discrepancies-detail')
  @ApiOperation({
    summary: 'Method GET - Reconciliation Discrepancies Detail (Legacy)',
    description:
      'Returns a detailed grid of discrepancies with filtering capabilities for a given month (YYYY-MM). Filtros válidos: TODOS, DUPLICADOS, DIFERENTES, SOLO_POSTGRES.',
  })
  async reconciliationDiscrepanciesDetail(
    @Req() request: Request,
    @Query('mesLectura') mesLectura: string,
    @Query('tipo_filtro') tipo_filtro: string,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Sending reconciliation.discrepancies.detail request: ${mesLectura}, filtro: ${tipo_filtro}`,
      );
      const response = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.kafkaClient,
          'epaa-legacy.migration.reconciliation.discrepancies.detail',
          { mesLectura, tipo_filtro },
        ),
      );
      return new ApiResponse(
        'Reconciliation discrepancies detail retrieved successfully!',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in reconciliationDiscrepanciesDetail: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
