import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { DistributeEmelnorteTrashRateUseCase } from './distribute-emelnorte-trash-rate.use-case';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { DistributeEmelnorteTrashRateRequest } from '../../domain/schemas/dto/request/distribute-emelnorte-trash-rate.request';

describe('DistributeEmelnorteTrashRateUseCase (Gateway)', () => {
  let useCase: DistributeEmelnorteTrashRateUseCase;
  let mockKafkaProxy: { send: jest.Mock };
  let mockReadingClient: any;

  beforeEach(async () => {
    mockReadingClient = {};
    mockKafkaProxy = {
      send: jest.fn().mockImplementation((client, pattern, payload) => {
        return of([
          {
            connectionId: '22-492',
            clientId: payload.clientId,
            assignedAmount: 13.14,
            isPennyRemainder: true,
            hasCadastralMismatch: false,
            origin: 'EMELNORTE_DISTRIBUCION',
            versionSheet: 'PLIEGO-2026-V1',
            totalClientOrigin: payload.septemberTotal,
            emelnorteQuantityOrigin: payload.emelnorteQuantity,
            totalActiveConnections: 3,
            observation: 'Distribución EMELNORTE',
          },
          {
            connectionId: '22-493',
            clientId: payload.clientId,
            assignedAmount: 13.12,
            isPennyRemainder: false,
            hasCadastralMismatch: false,
            origin: 'EMELNORTE_DISTRIBUCION',
            versionSheet: 'PLIEGO-2026-V1',
            totalClientOrigin: payload.septemberTotal,
            emelnorteQuantityOrigin: payload.emelnorteQuantity,
            totalActiveConnections: 3,
            observation: 'Distribución EMELNORTE',
          },
          {
            connectionId: '22-240',
            clientId: payload.clientId,
            assignedAmount: 13.12,
            isPennyRemainder: false,
            hasCadastralMismatch: false,
            origin: 'EMELNORTE_DISTRIBUCION',
            versionSheet: 'PLIEGO-2026-V1',
            totalClientOrigin: payload.septemberTotal,
            emelnorteQuantityOrigin: payload.emelnorteQuantity,
            totalActiveConnections: 3,
            observation: 'Distribución EMELNORTE',
          },
        ]);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DistributeEmelnorteTrashRateUseCase,
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

    useCase = module.get<DistributeEmelnorteTrashRateUseCase>(
      DistributeEmelnorteTrashRateUseCase,
    );
  });

  it('should send distribute emelnorte request to readings microservice', async () => {
    const request: DistributeEmelnorteTrashRateRequest = {
      clientId: '0200236479001',
      septemberTotal: 39.38,
      activeConnectionIds: ['22-492', '22-493', '22-240'],
      emelnorteQuantity: 3,
      persist: true,
    };

    const result = await useCase.execute(request);

    expect(mockKafkaProxy.send).toHaveBeenCalledWith(
      mockReadingClient,
      'reading.distribute-emelnorte-trash-rate',
      request,
    );
    expect(result).toHaveLength(3);
    const sum = result.reduce((acc, item) => acc + item.assignedAmount, 0);
    expect(Math.round(sum * 100) / 100).toBe(39.38);
  });
});
