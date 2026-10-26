import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { CreateReadingUseCase } from './create-reading.use-case';
import { environments } from '../../../../../../settings/environments/environments';
import { KafkaProxyService } from '../../../../../../shared/kafka/kafka-proxy.service';
import { READING_LEGACY_SYNC_PORT } from '../ports/reading-legacy-sync.port';
import { READING_REALTIME_NOTIFIER_PORT } from '../ports/reading-realtime-notifier.port';
import { CreateReadingRequest } from '../../domain/schemas/dto/request/create-reading.request';
import { ReadingResponse } from '../../domain/schemas/dto/response/reading.response';

describe('CreateReadingUseCase (Gateway)', () => {
  let useCase: CreateReadingUseCase;
  let mockKafkaProxy: { send: jest.Mock };
  let mockReadingClient: any;
  let mockLegacySync: { syncCreateReadingLegacy: jest.Mock };
  let mockRealtimeNotifier: { notifyReadingCreated: jest.Mock };

  beforeEach(async () => {
    mockReadingClient = {};
    mockLegacySync = { syncCreateReadingLegacy: jest.fn() };
    mockRealtimeNotifier = { notifyReadingCreated: jest.fn() };

    mockKafkaProxy = {
      send: jest.fn().mockImplementation((client, pattern, payload) => {
        const response: ReadingResponse = {
          readingId: 505,
          connectionId: payload.connectionId,
          readingDate: new Date('2026-10-26T14:30:00Z'),
          readingTime: '14:30:00',
          sector: payload.sector,
          account: payload.account,
          cadastralKey: payload.cadastralKey,
          readingValue: payload.readingValue,
          sewerRate: payload.sewerRate,
          previousReading: payload.previousReading,
          currentReading: payload.currentReading,
          rentalIncomeCode: payload.rentalIncomeCode,
          novelty: payload.novelty,
          incomeCode: payload.incomeCode,
          readingCode: 'RC-505',
        };
        return of(response);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        {
          provide: environments.READINGS_KAFKA_CLIENT,
          useValue: mockReadingClient,
        },
        {
          provide: KafkaProxyService,
          useValue: mockKafkaProxy,
        },
        {
          provide: READING_LEGACY_SYNC_PORT,
          useValue: mockLegacySync,
        },
        {
          provide: READING_REALTIME_NOTIFIER_PORT,
          useValue: mockRealtimeNotifier,
        },
      ],
    }).compile();

    useCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
  });

  it('should sync to legacy with historical year and month when currentMonthReading is provided', async () => {
    const readingRequest: CreateReadingRequest = {
      connectionId: '14-293',
      sector: 14,
      account: 293,
      cadastralKey: '14-293',
      sewerRate: 5.5,
      previousReading: 100,
      currentReading: 120,
      incomeCode: 2001,
      readingValue: 20.0,
      rentalIncomeCode: 0,
      novelty: 'NORMAL',
      meterStatus: 'BUENO',
      averageConsumption: 20,
      previousMonthReading: '2025-05',
      currentMonthReading: '2025-06',
    };

    const result = await useCase.execute(
      readingRequest,
      'creator-uuid-1',
      'operador_campo',
    );

    expect(result).toBeDefined();
    expect(result.readingId).toBe(505);

    expect(mockLegacySync.syncCreateReadingLegacy).toHaveBeenCalledTimes(1);
    const legacyPayload =
      mockLegacySync.syncCreateReadingLegacy.mock.calls[0][0];

    expect(legacyPayload.year).toBe(2025);
    expect(legacyPayload.month).toBe('JUNIO');
    expect(legacyPayload.username).toBe('operador_campo');
    expect(legacyPayload.meterStatus).toBe('BUENO');
    expect(mockRealtimeNotifier.notifyReadingCreated).toHaveBeenCalledWith(14);
  });

  it('should derive reading month from previousMonthReading if currentMonthReading is not passed', async () => {
    const readingRequest: any = {
      connectionId: '14-293',
      sector: 14,
      account: 293,
      cadastralKey: '14-293',
      sewerRate: 5.5,
      previousReading: 100,
      currentReading: 120,
      incomeCode: 2001,
      readingValue: 20.0,
      rentalIncomeCode: 0,
      novelty: 'NORMAL',
      meterStatus: null,
      averageConsumption: 20,
      previousMonthReading: '2025-05',
    };

    const result = await useCase.execute(
      readingRequest,
      'creator-uuid-1',
      'operador_campo',
    );

    expect(result).toBeDefined();
    expect(mockLegacySync.syncCreateReadingLegacy).toHaveBeenCalledTimes(1);
    const legacyPayload =
      mockLegacySync.syncCreateReadingLegacy.mock.calls[0][0];

    // previousMonthReading 2025-05 -> next month is 2025-06 -> JUNIO 2025
    expect(legacyPayload.year).toBe(2025);
    expect(legacyPayload.month).toBe('JUNIO');
  });
});
