import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ClientKafka } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { environments } from '../../../../../../settings/environments/environments';
import { ApiResponse } from '../../../../../../shared/errors/responses/ApiResponse';
import { RpcException } from '@nestjs/microservices';
import { CreateUserEmployeeRequest } from '../../domain/schemas/dto/request/create.user-employee.request';
import { UpdateUserEmployeeRequest } from '../../domain/schemas/dto/request/update.user-employee.request';
import { sendKafkaRequest } from '../../../../../../shared/utils/kafka/send.kafka.request';
import { statusCode } from '../../../../../../settings/environments/status-code';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';
import { UserEmployeeResponse } from '../../domain/schemas/dto/response/user-employee.response';

@Controller('user-employee-gateway')
@ApiTags('User-Employee-Gateway')
@ApiBearerAuth()
@UseGuards(AuthGuard)
export class UserEmployeeGatewayController implements OnModuleInit {
  constructor(
    @Inject(environments.GATEWAY_EMPLOYEES_KAFKA_CLIENT)
    private readonly clientKafka: ClientKafka,
  ) {}

  onModuleInit() {
    const requestPatterns = [
      'authentication.user-employee.find_by_id',
      'authentication.user-employee.find_by_user_id',
      'authentication.user-employee.find_by_id_card',
      'authentication.user-employee.search_by_name',
      'authentication.user-employee.exists_by_user_id',
      'authentication.user-employee.exists_by_id_card',
      'authentication.user-employee.create',
      'authentication.user-employee.update',
      'authentication.user-employee.soft_delete',
      'authentication.user-employee.restore',
      'authentication.user-employee.assign_zones',
      'authentication.user-employee.change_status',
      'authentication.user-employee.change_supervisor',
      'authentication.user-employee.find_all_active',
      'authentication.user-employee.find_by_position',
      'authentication.user-employee.find_by_zone',
      'authentication.user-employee.find_by_supervisor',
      'authentication.user-employee.find_all_employees',
    ];

    requestPatterns.forEach((pattern) => {
      this.clientKafka.subscribeToResponseOf(pattern);
    });

    return this.clientKafka.connect();
  }

  // =============================================
  // Búsquedas básicas
  // =============================================

  @Get('find-by-id/:employeeId')
  @ApiOperation({
    summary: 'Get employee by ID',
    description:
      'Retrieves an employee by its unique ID from the authentication service.',
  })
  async findById(
    @Param('employeeId') employeeId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_by_id',
          employeeId,
        ),
      );

      return new ApiResponse('Employee found', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-by-user-id/:userId')
  @ApiOperation({
    summary: 'Get employee by user ID',
    description: 'Retrieves an employee by its associated internal user ID.',
  })
  async findByUserId(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_by_user_id',
          userId,
        ),
      );

      return new ApiResponse('Employee found', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-by-id-card/:idCard')
  @ApiOperation({
    summary: 'Get employee by ID Card',
    description: 'Retrieves an employee by its ID card (cedula).',
  })
  async findByIdCard(
    @Param('idCard') idCard: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_by_id_card',
          idCard,
        ),
      );

      return new ApiResponse('Employee found', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('search-by-name')
  @ApiOperation({
    summary: 'Search employees by name',
    description: 'Searches for employees by name or last name (partial match).',
  })
  async searchByName(
    @Query('searchTerm') searchTerm: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        throw new RpcException({
          statusCode: statusCode.BAD_REQUEST,
          message: 'Search term must be provided and non-empty',
        });
      }

      const response: UserEmployeeResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.search_by_name',
          searchTerm.trim(),
        ),
      );

      return new ApiResponse('Employees found', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // =============================================
  // Verificación de existencia
  // =============================================

  @Get('exists-by-user-id/:userId')
  @ApiOperation({
    summary: 'Check if employee exists by user ID',
    description:
      'Checks if an employee is linked to the given internal user ID.',
  })
  async existsByUserId(
    @Param('userId') userId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const exists: boolean = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.exists_by_user_id',
          userId,
        ),
      );

      return new ApiResponse('Existence check', { exists }, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('exists-by-id-card/:idCard')
  @ApiOperation({
    summary: 'Check if employee exists by ID Card',
    description:
      'Checks if an employee exists with the given ID card (cedula).',
  })
  async existsByIdCard(
    @Param('idCard') idCard: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const exists: boolean = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.exists_by_id_card',
          idCard,
        ),
      );

      return new ApiResponse('Existence check', { exists }, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // =============================================
  // CRUD completo
  // =============================================

  @Post('create')
  @ApiOperation({
    summary: 'Create a new employee',
    description: 'Creates a new employee linked to an internal user.',
  })
  async create(
    @Body() request: CreateUserEmployeeRequest,
    @Req() requestObj: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user-employee.create', request),
      );

      return new ApiResponse(
        'Employee created successfully',
        response,
        requestObj.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('update/:employeeId')
  @ApiOperation({
    summary: 'Update an existing employee',
    description: 'Updates employee details (partial update).',
  })
  async update(
    @Param('employeeId') employeeId: string,
    @Body() updates: UpdateUserEmployeeRequest,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user-employee.update', {
          employeeId,
          updates,
        }),
      );

      return new ApiResponse(
        'Employee updated successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Delete('soft-delete/:employeeId')
  @ApiOperation({
    summary: 'Soft delete an employee',
    description: 'Marks an employee as deleted (soft delete).',
  })
  async softDelete(
    @Param('employeeId') employeeId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: void = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.soft_delete',
          employeeId,
        ),
      );

      return new ApiResponse(
        'Employee soft deleted successfully',
        null,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('restore/:employeeId')
  @ApiOperation({
    summary: 'Restore a soft-deleted employee',
    description: 'Restores an employee previously marked as deleted.',
  })
  async restore(
    @Param('employeeId') employeeId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.restore',
          employeeId,
        ),
      );

      return new ApiResponse(
        'Employee restored successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // =============================================
  // Operaciones de negocio específicas
  // =============================================

  @Post('assign-zones/:employeeId')
  @ApiOperation({
    summary: 'Assign zones to an employee',
    description: 'Assigns or updates zones assigned to an employee.',
  })
  async assignZones(
    @Param('employeeId') employeeId: string,
    @Body() payload: { zoneIds: number[] },
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: void = await sendKafkaRequest(
        this.clientKafka.send('authentication.user-employee.assign_zones', {
          employeeId,
          zoneIds: payload.zoneIds,
        }),
      );

      return new ApiResponse('Zones assigned successfully', null, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('change-status/:employeeId')
  @ApiOperation({
    summary: 'Change employee status',
    description: 'Changes the employment status (e.g., ACTIVO, SUSPENDIDO).',
  })
  async changeStatus(
    @Param('employeeId') employeeId: string,
    @Body() payload: { newStatusId: number },
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send('authentication.user-employee.change_status', {
          employeeId,
          newStatusId: payload.newStatusId,
        }),
      );

      return new ApiResponse(
        'Status changed successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Put('change-supervisor/:employeeId')
  @ApiOperation({
    summary: 'Change employee supervisor',
    description: 'Assigns or removes a supervisor for an employee.',
  })
  async changeSupervisor(
    @Param('employeeId') employeeId: string,
    @Body() payload: { supervisorId: string | null },
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.change_supervisor',
          {
            employeeId,
            supervisorId: payload.supervisorId,
          },
        ),
      );

      return new ApiResponse(
        'Supervisor changed successfully',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  // =============================================
  // Listados y filtros avanzados
  // =============================================

  @Get('find-all-active')
  @ApiOperation({
    summary: 'Get all active employees',
    description: 'Retrieves a list of all active employees.',
  })
  async findAllActive(@Req() request: Request): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_all_active',
          {},
        ),
      );

      return new ApiResponse(
        'Active employees retrieved',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-by-position/:positionId')
  @ApiOperation({
    summary: 'Get employees by position',
    description: 'Retrieves employees filtered by position/cargo ID.',
  })
  async findByPosition(
    @Param('positionId', ParseIntPipe) positionId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_by_position',
          positionId,
        ),
      );

      return new ApiResponse(
        'Employees by position retrieved',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-by-zone/:zoneId')
  @ApiOperation({
    summary: 'Get employees by zone',
    description: 'Retrieves employees assigned to a specific zone.',
  })
  async findByZone(
    @Param('zoneId', ParseIntPipe) zoneId: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_by_zone',
          zoneId,
        ),
      );

      return new ApiResponse(
        'Employees by zone retrieved',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-by-supervisor/:supervisorId')
  @ApiOperation({
    summary: 'Get employees by supervisor',
    description: 'Retrieves employees under a specific supervisor.',
  })
  async findBySupervisor(
    @Param('supervisorId') supervisorId: string,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_by_supervisor',
          supervisorId,
        ),
      );

      return new ApiResponse(
        'Employees by supervisor retrieved',
        response,
        request.url,
      );
    } catch (error) {
      throw new RpcException(error);
    }
  }

  @Get('find-all-employees')
  @ApiOperation({
    summary: 'Get all employees',
    description: 'Retrieves all employees with pagination.',
  })
  async findAllEmployees(
    @Query('limit', ParseIntPipe) limit: number,
    @Query('offset', ParseIntPipe) offset: number,
    @Req() request: Request,
  ): Promise<ApiResponse> {
    try {
      const response: UserEmployeeResponse[] = await sendKafkaRequest(
        this.clientKafka.send(
          'authentication.user-employee.find_all_employees',
          { limit, offset },
        ),
      );

      return new ApiResponse('All employees retrieved', response, request.url);
    } catch (error) {
      throw new RpcException(error);
    }
  }
}
