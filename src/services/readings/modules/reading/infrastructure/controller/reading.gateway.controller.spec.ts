import { Test, TestingModule } from '@nestjs/testing';
import { ReadingGatewayController } from './reading.gateway.controller';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { CreateReadingUseCase } from '../../application/use-cases/create-reading.use-case';
import { UpdateCurrentReadingUseCase } from '../../application/use-cases/update-current-reading.use-case';
import { UpdateSpecialReadingUseCase } from '../../application/use-cases/update-special-reading.use-case';
import { ApplyPaymentAgreementUseCase } from '../../application/use-cases/apply-payment-agreement.use-case';
import { DistributeEmelnorteTrashRateUseCase } from '../../application/use-cases/distribute-emelnorte-trash-rate.use-case';
import { AssignConnectionTrashRateUseCase } from '../../application/use-cases/assign-connection-trash-rate.use-case';
import { AuthGuard } from '../../../../../../auth/guard/auth.guard';

describe('ReadingGatewayController - Trash Rate & Payment Agreement Endpoints', () => {
  let controller: ReadingGatewayController;
  let mockApplyPaymentAgreementUseCase: { execute: jest.Mock };
  let mockDistributeEmelnorteTrashRateUseCase: { execute: jest.Mock };
  let mockAssignConnectionTrashRateUseCase: { execute: jest.Mock };

  beforeEach(async () => {
    mockApplyPaymentAgreementUseCase = {
      execute: jest.fn().mockResolvedValue({
        agreementId: 1,
        agreementCode: 'CONV-2026-0001',
        connectionId: '22-492',
        clientId: '0200236479001',
        numberOfInstallments: 6,
        totalRefinancedAmount: 120.5,
        status: 'ACTIVO',
        agreementDate: new Date(),
        affectedInvoicesCount: 3,
        deferredConcepts: [],
        message: 'Convenio de pago aplicado exitosamente',
      }),
    };

    mockDistributeEmelnorteTrashRateUseCase = {
      execute: jest.fn().mockResolvedValue([
        {
          connectionId: '22-492',
          clientId: '0200236479001',
          assignedAmount: 13.14,
          isPennyRemainder: true,
          hasCadastralMismatch: false,
          origin: 'EMELNORTE_DISTRIBUCION',
          versionSheet: 'PLIEGO-2026-V1',
          totalClientOrigin: 39.38,
          emelnorteQuantityOrigin: 3,
          totalActiveConnections: 3,
          observation: 'Distribución EMELNORTE',
        },
      ]),
    };

    mockAssignConnectionTrashRateUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 1,
        connectionId: '22-492',
        originClientId: '0200236479001',
        assignedAmount: 20.44,
        origin: 'TARIFA_NUEVA_ACOMETIDA',
        versionSheet: 'PLIEGO-2026-V1',
        hasCadastralMismatch: false,
        isPennyRemainder: false,
        isActive: true,
        startDate: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReadingGatewayController],
      providers: [
        {
          provide: environments.READINGS_KAFKA_CLIENT,
          useValue: {},
        },
        {
          provide: KafkaProxyService,
          useValue: {},
        },
        {
          provide: CreateReadingUseCase,
          useValue: {},
        },
        {
          provide: UpdateCurrentReadingUseCase,
          useValue: {},
        },
        {
          provide: UpdateSpecialReadingUseCase,
          useValue: {},
        },
        {
          provide: ApplyPaymentAgreementUseCase,
          useValue: mockApplyPaymentAgreementUseCase,
        },
        {
          provide: DistributeEmelnorteTrashRateUseCase,
          useValue: mockDistributeEmelnorteTrashRateUseCase,
        },
        {
          provide: AssignConnectionTrashRateUseCase,
          useValue: mockAssignConnectionTrashRateUseCase,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReadingGatewayController>(ReadingGatewayController);
  });

  const mockRequest = {
    url: '/Readings/test',
  } as any;

  describe('applyPaymentAgreement', () => {
    it('should call applyPaymentAgreementUseCase and return wrapped ApiResponse', async () => {
      const dto = {
        agreementCode: 'CONV-2026-0001',
        connectionId: '22-492',
        clientId: '0200236479001',
        readingIds: [100, 101, 102],
        numberOfInstallments: 6,
        totalRefinancedAmount: 120.5,
      };

      const response = await controller.applyPaymentAgreement(dto as any, mockRequest);

      expect(mockApplyPaymentAgreementUseCase.execute).toHaveBeenCalledWith(dto);
      expect(response.message[0]).toContain('CONV-2026-0001');
      expect(response.data).toBeDefined();
    });
  });

  describe('distributeEmelnorteTrashRate', () => {
    it('should call distributeEmelnorteTrashRateUseCase and return wrapped ApiResponse', async () => {
      const dto = {
        clientId: '0200236479001',
        septemberTotal: 39.38,
        activeConnectionIds: ['22-492', '22-493', '22-240'],
        emelnorteQuantity: 3,
        persist: true,
      };

      const response = await controller.distributeEmelnorteTrashRate(dto as any, mockRequest);

      expect(mockDistributeEmelnorteTrashRateUseCase.execute).toHaveBeenCalledWith(dto);
      expect(response.message[0]).toContain('0200236479001');
      expect(Array.isArray(response.data)).toBe(true);
    });
  });

  describe('assignConnectionTrashRate', () => {
    it('should call assignConnectionTrashRateUseCase and return wrapped ApiResponse', async () => {
      const dto = {
        connectionId: '22-492',
        clientId: '0200236479001',
        categoryName: 'COMERCIAL',
        consumptionM3: 15,
        origin: 'TARIFA_NUEVA_ACOMETIDA',
      };

      const response = await controller.assignConnectionTrashRate(dto as any, mockRequest);

      expect(mockAssignConnectionTrashRateUseCase.execute).toHaveBeenCalledWith(dto);
      expect(response.message[0]).toContain('22-492');
      expect(response.data.assignedAmount).toBe(20.44);
    });
  });
});
