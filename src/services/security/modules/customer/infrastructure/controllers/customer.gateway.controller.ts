import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ClientKafka, RpcException } from '@nestjs/microservices';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { CreateCustomerRequest } from '../../domain/schemas/dto/request/create.customer.request';
import { UpdateCustomerRequest } from '../../domain/schemas/dto/request/update.customer.request';
import {
  CustomerResponse,
  UserProfileResponse,
} from '../../domain/schemas/dto/response/customer.response';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { RegisterNaturalRequest } from '../../domain/schemas/dto/request/register-natural.request';
import { RegisterCompanyRequest } from '../../domain/schemas/dto/request/register-company.request';
import { VerifyCodeRequest } from '../../domain/schemas/dto/request/verify-code.request';
import { ResendVerificationCodeRequest } from '../../domain/schemas/dto/request/resend-verification-code.request';
import { AllowedUserTypes } from '../../../../../../auth/decorator/allowed-user-types.decorator';

@Controller('customer-gateway')
@ApiTags('Customer-Gateway')
//@ApiBearerAuth()
export class CustomerGatewayController {
  private readonly logger = new Logger(CustomerGatewayController.name);

  constructor(
    @Inject(environments.GATEWAY_AUTHENTICATION_KAFKA_CLIENT)
    private readonly clientKafka: ClientKafka,
    @Inject(environments.CLIENTS_KAFKA_CLIENT)
    private readonly customerClient: ClientKafka,
    @Inject(environments.COMPANIES_KAFKA_CLIENT)
    private readonly companyKafkaClient: ClientKafka,
    private readonly kafkaProxy: KafkaProxyService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('find-by-id/:customerUserId')
  @ApiOperation({
    summary: 'Get customer by user ID',
    description: 'Retrieves an external customer account by its user UUID.',
  })
  async findById(
    @Param('customerUserId') customerUserId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.find_by_id',
          customerUserId,
        ),
      );
      return new ApiResponse('Customer found', response, request.url);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding customer by ID: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @UseGuards(AuthGuard)
  @Get('find-by-client-id/:clientId')
  @ApiOperation({
    summary: 'Get customer by client ID',
    description: 'Retrieves an external customer account by RUC/Cédula.',
  })
  async findByClientId(
    @Param('clientId') clientId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.find_by_client_id',
          clientId,
        ),
      );
      return new ApiResponse('Customer found', response, request.url);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding customer by client ID: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @UseGuards(AuthGuard)
  @Get('find-by-email/:email')
  @ApiOperation({
    summary: 'Get customer by email',
    description: 'Retrieves an external customer account by email address.',
  })
  async findByEmail(
    @Param('email') email: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.find_by_email',
          email,
        ),
      );
      return new ApiResponse('Customer found', response, request.url);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error finding customer by email: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @UseGuards(AuthGuard)
  @Post('create')
  @ApiOperation({
    summary: 'Create a new customer account',
    description: 'Creates a new external customer account linked to a client.',
  })
  async create(
    @Body() request: CreateCustomerRequest,
    @Req() requestObj: Request,
  ): Promise<ApiResponse> {
    try {
      const response: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.create',
          request,
        ),
      );
      return new ApiResponse(
        'Customer account created successfully',
        response,
        requestObj.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error creating customer account: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @UseGuards(AuthGuard)
  @Put('update/:customerUserId')
  @ApiOperation({
    summary: 'Update a customer account',
    description: 'Updates external customer account details.',
  })
  async update(
    @Param('customerUserId') customerUserId: string,
    @Body() updates: UpdateCustomerRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.update',
          {
            customerUserId,
            updates,
          },
        ),
      );
      return new ApiResponse(
        'Customer account updated successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error updating customer account: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('soft-delete/:customerUserId')
  @ApiOperation({
    summary: 'Soft delete a customer account',
    description: 'Marks an external customer account as deleted.',
  })
  async softDelete(
    @Param('customerUserId') customerUserId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.soft_delete',
          customerUserId,
        ),
      );
      return new ApiResponse(
        'Customer account deleted successfully',
        null,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error deleting customer account: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @UseGuards(AuthGuard)
  @Put('restore/:customerUserId')
  @ApiOperation({
    summary: 'Restore a customer account',
    description: 'Restores a previously soft-deleted customer account.',
  })
  async restore(
    @Param('customerUserId') customerUserId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.restore',
          customerUserId,
        ),
      );
      return new ApiResponse(
        'Customer account restored successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error restoring customer account: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @UseGuards(AuthGuard)
  @Get('find-all')
  @ApiOperation({
    summary: 'Get all customer accounts',
    description: 'Retrieves all external customer accounts with pagination.',
  })
  async findAll(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: CustomerResponse[] = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.find_all',
          { limit, offset },
        ),
      );
      return new ApiResponse(
        'Customer accounts retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving customer accounts: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @Post('register-natural')
  @ApiOperation({
    summary: 'Register a natural person (Account + Profile)',
    description:
      'Creates a security user account and a customer profile sequentially in a single step.',
  })
  async registerNatural(
    @Body() payload: RegisterNaturalRequest,
    @Req() requestObj: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Starting unified natural person registration for email: ${payload.email}`,
      );

      // 1. Verify if the user already exists in the security/auth service
      const existingAuth = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.find_by_client_id',
          payload.clientId,
        ),
      ).catch(() => null);

      if (existingAuth) {
        throw new RpcException({
          statusCode: 400,
          message: 'El usuario ya existe con esta identificación',
        });
      }

      // Create Auth account
      const authPayload = {
        clientId: payload.clientId,
        email: payload.email,
        password: payload.password,
        authMethod: 'PASSWORD',
        customerStatusId: 2, // Inactive by default
        firstName: payload.firstName,
        lastName: payload.lastName,
      };

      const authResponse: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.create',
          authPayload,
        ),
      );

      this.logger.log(
        `Auth account created successfully. UserID: ${authResponse.customerUserId}`,
      );

      // ✅ Enviar código de verificación por email (fire-and-forget)
      this.emitVerificationCode(authResponse.customerUserId, 'EMAIL_CODE');

      // 2. Check if customer profile already exists
      let profileResponse;
      const exists = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.customerClient,
          'customers.verify-customer-exists',
          payload.clientId, // ✅ string: preserva ceros iniciales ('0400000000')
        ),
      ).catch(() => false);

      if (exists) {
        this.logger.log(
          `Customer profile already exists for customerId: ${payload.clientId}. Updating profile details.`,
        );
        const profilePayload = {
          customerId: payload.clientId, // ✅ string
          firstName: payload.firstName,
          lastName: payload.lastName,
          emails: payload.emails,
          phoneNumbers: payload.phoneNumbers,
          dateOfBirth: payload.dateOfBirth,
          sexId: payload.sexId,
          civilStatus: payload.civilStatus,
          address: payload.address,
          professionId: payload.professionId,
          originCountry: payload.originCountry,
          identificationType: payload.identificationType,
          parishId: payload.parishId,
          deceased: payload.deceased ?? false,
        };

        profileResponse = await sendKafkaRequest(
          this.kafkaProxy.send(
            this.customerClient,
            'customers.update-customer',
            {
              customerId: payload.clientId, // ✅ string
              customer: profilePayload,
            },
          ),
        );
        this.logger.log(
          `Customer profile updated successfully for customerId: ${payload.clientId}`,
        );
      } else {
        const profilePayload = {
          customerId: payload.clientId, // ✅ string
          firstName: payload.firstName,
          lastName: payload.lastName,
          emails: payload.emails,
          phoneNumbers: payload.phoneNumbers,
          dateOfBirth: payload.dateOfBirth,
          sexId: payload.sexId,
          civilStatus: payload.civilStatus,
          address: payload.address,
          professionId: payload.professionId,
          originCountry: payload.originCountry,
          identificationType: payload.identificationType,
          parishId: payload.parishId,
          deceased: payload.deceased ?? false,
        };

        profileResponse = await sendKafkaRequest(
          this.kafkaProxy.send(
            this.customerClient,
            'customers.create-customer',
            profilePayload,
          ),
        );
        this.logger.log(
          `Customer profile created successfully for customerId: ${payload.clientId}`,
        );
      }

      return new ApiResponse(
        'Natural person registered successfully',
        {
          account: authResponse,
          profile: profileResponse,
        },
        requestObj.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in registerNatural: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  // Emitir código de verificación para persona natural (fire-and-forget, fuera del try/catch del registro)
  private emitVerificationCode(
    clienteUsuarioId: string,
    tipoCodigo: 'EMAIL_CODE' | 'PHONE_CODE' = 'EMAIL_CODE',
  ): void {
    this.kafkaProxy.emit(
      this.clientKafka,
      'authentication.customer.send_verification_code',
      {
        clienteUsuarioId,
        tipoCodigo,
      },
    );
    this.logger.log(
      `[VerificationCode] Emitido código para user: ${clienteUsuarioId}, tipo: ${tipoCodigo}`,
    );
  }

  @Post('register-company')
  @ApiOperation({
    summary: 'Register a company/society (Account + Profile)',
    description:
      'Creates a security user account and a company profile sequentially in a single step.',
  })
  async registerCompany(
    @Body() payload: RegisterCompanyRequest,
    @Req() requestObj: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `Starting unified company registration for email: ${payload.email}`,
      );

      // 1. Verify if the user already exists in the security/auth service
      const existingAuth = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.find_by_client_id',
          payload.companyRuc,
        ),
      ).catch(() => null);

      if (existingAuth) {
        throw new RpcException({
          statusCode: 400,
          message: 'El usuario ya existe con esta identificación',
        });
      }

      // Create Auth account
      const authPayload = {
        clientId: payload.companyRuc,
        email: payload.email,
        password: payload.password,
        authMethod: 'PASSWORD',
        customerStatusId: 2, // Inactive by default
        nombreComercial: payload.companyName,
        razonSocial: payload.socialReason,
      };

      const authResponse: CustomerResponse = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.create',
          authPayload,
        ),
      );

      this.logger.log(
        `Auth company account created successfully. UserID: ${authResponse.customerUserId}`,
      );

      // ✅ Enviar código de verificación por email (fire-and-forget)
      this.emitVerificationCode(authResponse.customerUserId, 'EMAIL_CODE');

      // 2. Check if company profile already exists
      let profileResponse;
      const exists = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.companyKafkaClient,
          'companies.verify-company-exists',
          payload.companyRuc,
        ),
      ).catch(() => false);

      if (exists) {
        this.logger.log(
          `Company profile already exists for RUC: ${payload.companyRuc}. Updating company profile details.`,
        );
        const profilePayload = {
          companyName: payload.companyName,
          socialReason: payload.socialReason,
          companyRuc: payload.companyRuc,
          companyAddress: payload.companyAddress,
          companyParishId: payload.companyParishId,
          companyCountry: payload.companyCountry,
          companyEmails: payload.companyEmails,
          companyPhones: payload.companyPhones,
          identificationType: payload.identificationType,
        };

        profileResponse = await sendKafkaRequest(
          this.kafkaProxy.send(
            this.companyKafkaClient,
            'companies.update-company',
            {
              companyRuc: payload.companyRuc,
              company: profilePayload,
            },
          ),
        );
        this.logger.log(
          `Company profile updated successfully for RUC: ${payload.companyRuc}`,
        );
      } else {
        const profilePayload = {
          companyName: payload.companyName,
          socialReason: payload.socialReason,
          companyRuc: payload.companyRuc,
          companyAddress: payload.companyAddress,
          companyParishId: payload.companyParishId,
          companyCountry: payload.companyCountry,
          companyEmails: payload.companyEmails,
          companyPhones: payload.companyPhones,
          identificationType: payload.identificationType,
        };

        profileResponse = await sendKafkaRequest(
          this.kafkaProxy.send(
            this.companyKafkaClient,
            'companies.create-company',
            profilePayload,
          ),
        );
        this.logger.log(
          `Company profile created successfully for RUC: ${payload.companyRuc}`,
        );
      }

      return new ApiResponse(
        'Company registered successfully',
        {
          account: authResponse,
          profile: profileResponse,
        },
        requestObj.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in registerCompany: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  // ── Verificación de cuenta ─────────────────────────────────────────────────

  @Post('verify-code')
  @ApiOperation({
    summary: 'Verificar cuenta con código de 6 dígitos',
    description:
      'Valida el código recibido por email o teléfono. ' +
      'Si es correcto activa la cuenta (email_verified=true, status activo). ' +
      'Máximo 5 intentos antes de que el código se invalide.',
  })
  @ApiBody({ type: VerifyCodeRequest })
  async verifyCode(
    @Body() body: VerifyCodeRequest,
    @Req() requestObj: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `[verify-code] user: ${body.clienteUsuarioId}, tipo: ${body.tipoCodigo ?? 'EMAIL_CODE'}`,
      );
      const result = (await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.verify_code',
          {
            clienteUsuarioId: body.clienteUsuarioId,
            codigo: body.codigo,
            tipoCodigo: body.tipoCodigo ?? 'EMAIL_CODE',
          },
        ),
      )) as { verified: boolean; message: string };
      return new ApiResponse(
        result.message ?? 'Cuenta verificada correctamente',
        { verified: result.verified },
        requestObj.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(`Error in verifyCode: ${err.message}`, err.stack);
      throw new RpcException(err as string | object);
    }
  }

  @Post('resend-verification-code')
  @ApiOperation({
    summary: 'Reenviar código de verificación',
    description:
      'Genera un nuevo código e invalida el anterior. Útil si el cliente no recibió el email. ' +
      'El nuevo código expira en 15 minutos.',
  })
  @ApiBody({ type: ResendVerificationCodeRequest })
  async resendVerificationCode(
    @Body() body: ResendVerificationCodeRequest,
    @Req() requestObj: Request,
  ): Promise<ApiResponse> {
    try {
      this.logger.log(
        `[resend-verification-code] user: ${body.clienteUsuarioId}, tipo: ${body.tipoCodigo ?? 'EMAIL_CODE'}`,
      );
      await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.resend_verification_code',
          {
            clienteUsuarioId: body.clienteUsuarioId,
            tipoCodigo: body.tipoCodigo ?? 'EMAIL_CODE',
          },
        ),
      );
      return new ApiResponse(
        'Código de verificación reenviado correctamente. Revisa tu correo.',
        null,
        requestObj.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error in resendVerificationCode: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }

  @AllowedUserTypes('customer')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get('profile/:searchValue')
  @ApiOperation({
    summary: 'Get user profile by search value',
    description:
      'Retrieves a user profile by email, client ID, or user UUID. ' +
      'Useful for fetching profile details without exposing sensitive data.',
  })
  async getProfileBySearchValue(
    @Param('searchValue') searchValue: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserProfileResponse | null = await sendKafkaRequest(
        this.kafkaProxy.send(
          this.clientKafka,
          'authentication.customer.get_profile_by_search_value',
          searchValue,
        ),
      );
      return new ApiResponse(
        'User profile retrieved successfully',
        response,
        request.url,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error retrieving user profile by search value: ${err.message}`,
        err.stack,
      );
      throw new RpcException(err as string | object);
    }
  }
}
