import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AssignConnectionTrashRateUseCase } from './assign-connection-trash-rate.use-case';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { AssignConnectionTrashRateRequest } from '../../domain/schemas/dto/request/assign-connection-trash-rate.request';

describe('AssignConnectionTrashRateUseCase (Gateway)', () => {
  let useCase: AssignConnectionTrashRateUseCase;
  let mockKafkaProxy: { send: jest.Mock };
  let mockReadingClient: any;

  beforeEach(async () => {
    mockReadingClient = {};
    mockKafkaProxy = {
      send: jest.fn().mockImplementation((client, pattern, payload) => {
        return of({
          id: 1,
          connectionId: payload.connectionId,
          originClientId: payload.clientId,
          assignedAmount: 20.44,
          origin: payload.origin ?? 'TARIFA_NUEVA_ACOMETIDA',
          versionSheet: payload.versionSheet ?? 'PLIEGO-2026-V1',
          isActive: true,
          startDate: new Date(),
        });
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignConnectionTrashRateUseCase,
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

    useCase = module.get<AssignConnectionTrashRateUseCase>(
      AssignConnectionTrashRateUseCase,
    );
  });

  it('should send assign connection trash rate request to readings microservice', async () => {
    const request: AssignConnectionTrashRateRequest = {
      connectionId: '22-492',
      clientId: '0200236479001',
      categoryName: 'COMERCIAL',
      consumptionM3: 15,
      origin: 'TARIFA_NUEVA_ACOMETIDA',
      versionSheet: 'PLIEGO-2026-V1',
      persist: true,
    };

    const result = await useCase.execute(request);

    expect(mockKafkaProxy.send).toHaveBeenCalledWith(
      mockReadingClient,
      'reading.assign-connection-trash-rate',
      request,
    );
    expect(result).toBeDefined();
    expect(result.connectionId).toBe('22-492');
    expect(result.assignedAmount).toBe(20.44);
  });
});
