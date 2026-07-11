import { Injectable, Logger } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';
import { IApiKeyValidator } from '../interfaces/api-key-validator.interface';
import { environments } from '../../settings/environments/environments';

/**
 * Validates the mobile-app API key sent in the `x-api-key` request header.
 *
 * Security notes:
 *  - Both keys are hashed with SHA-256 before comparison so buffers are always
 *    the same length, satisfying the timingSafeEqual pre-condition.
 *  - timingSafeEqual prevents timing-based side-channel attacks (OWASP A02).
 *  - A missing or empty APP_API_KEY environment variable always returns false
 *    so the service fails-secure when misconfigured.
 */
@Injectable()
export class ApiKeyValidatorService implements IApiKeyValidator {
  private readonly logger = new Logger(ApiKeyValidatorService.name);

  isValid(providedKey: string): boolean {
    const expectedKey = environments.APP_API_KEY;

    if (!expectedKey || !providedKey) {
      return false;
    }

    try {
      const expected = createHash('sha256').update(expectedKey).digest();
      const provided = createHash('sha256').update(providedKey).digest();
      return timingSafeEqual(expected, provided);
    } catch (err) {
      this.logger.warn(
        'Unexpected error during API key comparison',
        err instanceof Error ? err.stack : String(err),
      );
      return false;
    }
  }
}
