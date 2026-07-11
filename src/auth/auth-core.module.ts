import { Global, Module } from '@nestjs/common';
import { ApiKeyValidatorService } from './services/api-key-validator.service';
import { API_KEY_VALIDATOR } from './interfaces/api-key-validator.interface';
import { AuthGuard } from './guard/auth.guard';

/**
 * Global auth module — registered once in AppModule.
 *
 * Marking it @Global() makes ApiKeyValidatorService, API_KEY_VALIDATOR, and
 * AuthGuard available in every feature module without each one having to
 * import this module explicitly. This is required because any controller that
 * applies @UseGuards(AuthGuard) forces NestJS to resolve AuthGuard's
 * dependencies (including API_KEY_VALIDATOR) within that module's context.
 */
@Global()
@Module({
  providers: [
    ApiKeyValidatorService,
    { provide: API_KEY_VALIDATOR, useExisting: ApiKeyValidatorService },
    AuthGuard,
  ],
  exports: [ApiKeyValidatorService, API_KEY_VALIDATOR, AuthGuard],
})
export class AuthCoreModule {}
