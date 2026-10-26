import { ReadingLegacyMapper } from './reading-legacy.mapper';
import { ReadingResponse } from '../schemas/dto/response/reading.response';

describe('ReadingLegacyMapper', () => {
  const baseResponse: ReadingResponse = {
    readingId: 101,
    connectionId: '14-293',
    readingDate: new Date('2026-10-26T12:00:00Z'),
    readingTime: '12:00:00',
    sector: 14,
    account: 293,
    cadastralKey: '14-293',
    readingValue: 25.5,
    sewerRate: 10.2,
    previousReading: 100,
    currentReading: 120,
    rentalIncomeCode: null,
    novelty: 'NORMAL',
    incomeCode: null,
    readingCode: 'RC-101',
  };

  describe('toCreateReadingLegacyRequest', () => {
    it('should assign historical year and month when readingMonth is provided in YYYY-MM format', () => {
      const result = ReadingLegacyMapper.toCreateReadingLegacyRequest(
        baseResponse,
        'operador1',
        'BUENO',
        '2025-06',
      );

      expect(result.year).toBe(2025);
      expect(result.month).toBe('JUNIO');
      expect(result.previousReading).toBe(100);
      expect(result.currentReading).toBe(120);
      expect(result.cadastralKey).toBe('14-293');
      expect(result.sector).toBe(14);
      expect(result.account).toBe(293);
      expect(result.username).toBe('operador1');
      expect(result.meterStatus).toBe('BUENO');
    });

    it('should handle another historical month correctly (e.g. 2024-01 -> ENERO)', () => {
      const result = ReadingLegacyMapper.toCreateReadingLegacyRequest(
        baseResponse,
        'operador1',
        null,
        '2024-01',
      );

      expect(result.year).toBe(2024);
      expect(result.month).toBe('ENERO');
    });

    it('should fallback to response.readingDate when readingMonth is omitted', () => {
      const result = ReadingLegacyMapper.toCreateReadingLegacyRequest(
        baseResponse,
        'operador1',
        null,
      );

      expect(result.year).toBe(2026);
      expect(result.month).toBe('OCTUBRE');
    });

    it('should fallback gracefully when readingMonth is malformed', () => {
      const result = ReadingLegacyMapper.toCreateReadingLegacyRequest(
        baseResponse,
        'operador1',
        null,
        'invalid-format',
      );

      expect(result.year).toBe(2026);
      expect(result.month).toBe('OCTUBRE');
    });
  });

  describe('toUpdateReadingLegacyContext', () => {
    it('should correctly parse readingMonth for update context', () => {
      const { request, params } =
        ReadingLegacyMapper.toUpdateReadingLegacyContext(
          baseResponse,
          '2025-06',
          'operador1',
          'BUENO',
        );

      expect(request.year).toBe(2025);
      expect(request.month).toBe('JUNIO');
      expect(params.year).toBe(2025);
      expect(params.month).toBe('JUNIO');
    });
  });
});
