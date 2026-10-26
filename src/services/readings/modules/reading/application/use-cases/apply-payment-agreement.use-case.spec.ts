import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { ApplyPaymentAgreementUseCase } from './apply-payment-agreement.use-case';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { ApplyPaymentAgreementRequest } from '../../domain/schemas/dto/request/apply-payment-agreement.request';

describe('ApplyPaymentAgreementUseCase (Gateway)', () => {
  let useCase: ApplyPaymentAgreementUseCase;
  let mockKafkaProxy: { send: jest.Mock };
  let mockReadingClient: any;

  beforeEach(async () => {
    mockReadingClient = {};
    mockKafkaProxy = {
      send: jest.fn().mockImplementation((client, pattern, payload) => {
        return of({
          agreementId: 1,
          agreementCode: payload.agreementCode,
          connectionId: payload.connectionId,
          clientId: payload.clientId,
          numberOfInstallments: payload.numberOfInstallments,
          totalRefinancedAmount: payload.totalRefinancedAmount,
          status: 'ACTIVO',
          agreementDate: new Date(),
          affectedInvoicesCount: payload.readingIds.length,
          deferredConcepts: [
            {
              conceptId: 4,
              conceptCode: 'TASA_BASURA',
              accumulatedAmount: 18.5,
              originInvoicesCount: 3,
              treatment: 'EXONERAR_A_CERO',
            },
          ],
          message: 'Convenio de pago aplicado exitosamente',
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplyPaymentAgreementUseCase,
        {
          provide: environments.READINGS_KAFKA_CLIENT,
          useValue: mockReadingClient,
        },
        {
          provide: KafkaProxyService,
          useValue: mockKafkaProxy,
        },
      ],
    }).compile();

    useCase = module.get<ApplyPaymentAgreementUseCase>(
      ApplyPaymentAgreementUseCase,
    );
  });

  it('should successfully send apply payment agreement request to microservice', async () => {
    const request: ApplyPaymentAgreementRequest = {
      agreementCode: 'CONV-2026-0001',
      connectionId: '22-492',
      clientId: '0200236479001',
      readingIds: [100, 101, 102],
      numberOfInstallments: 6,
      totalRefinancedAmount: 120.0,
      observation: 'Arreglo de pago',
    };

    const result = await useCase.execute(request);

    expect(mockKafkaProxy.send).toHaveBeenCalledWith(
      mockReadingClient,
      'reading.apply-payment-agreement',
      request,
    );
    expect(result).toBeDefined();
    expect(result.agreementCode).toBe('CONV-2026-0001');
    expect(result.affectedInvoicesCount).toBe(3);
    expect(result.deferredConcepts[0].conceptCode).toBe('TASA_BASURA');
  });
});
