import { ReadingResponse } from '../schemas/dto/response/reading.response';
import { CreateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/create.reading-legacy.request';
import { UpdateReadingLegacyRequest } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/update.reading.request';
import { FindCurrentReadingParams } from '../../../../../epaa-legacy/modules/readings/domain/schemas/dto/request/find-current-reading-params';
import { MONTHS } from '../../../../../../shared/consts/months';

/**
 * Pure mapping rules between the Reading bounded context and the legacy SIGAME
 * schema. No I/O, no framework dependencies — trivially unit-testable (SRP).
 */
export class ReadingLegacyMapper {
  static toCreateReadingLegacyRequest(
    response: ReadingResponse,
    username: string | undefined,
  ): CreateReadingLegacyRequest {
    const reading = new CreateReadingLegacyRequest();
    reading.previousReading = parseFloat(response.previousReading!.toString());
    reading.currentReading = parseFloat(response.currentReading!.toString());
    reading.cadastralKey = response.cadastralKey!;
    reading.novelty = response.novelty!;
    reading.account = parseInt(response.account!.toString());
    reading.sector = parseInt(response.sector!.toString());
    reading.rentalIncomeCode = null;
    reading.readingDate = response.readingDate!;
    reading.readingTime = response.readingTime!;
    reading.readingId = response.readingCode
      ? response.readingCode.toString()
      : '';
    reading.username = username ?? '';
    reading.year = response.readingDate
      ? new Date(response.readingDate).getFullYear()
      : new Date().getFullYear();
    reading.month = response.readingDate
      ? MONTHS[new Date(response.readingDate).getMonth() + 1]
      : MONTHS[new Date().getMonth() + 1];
    reading.readingValue = null;
    return reading;
  }

  static toUpdateReadingLegacyContext(
    response: ReadingResponse,
    readingMonth: string,
    username: string | undefined,
  ): {
    request: UpdateReadingLegacyRequest;
    params: FindCurrentReadingParams;
  } {
    const [yearPart, monthPart] = readingMonth.split('-');

    const request = new UpdateReadingLegacyRequest();
    request.sector = response.sector!;
    request.account = response.account!;
    request.year = Number(yearPart);
    request.month = MONTHS[parseInt(monthPart)];
    request.incomeCode = response.rentalIncomeCode;
    request.currentReading = response.currentReading ?? 0;
    request.previousReading = response.previousReading ?? 0;
    request.novelty = response.novelty ?? 'SIN NOVEDAD';
    request.cadastralKey = response.cadastralKey ?? '';
    request.readingId = response.readingId?.toString() ?? '';
    request.username = username ?? '';

    const params = new FindCurrentReadingParams();
    params.sector = request.sector!;
    params.account = request.account!;
    params.year = request.year!;
    params.month = request.month!;
    params.readingId = response.readingCode!.toString();

    return { request, params };
  }
}
