import { Global, Module } from '@nestjs/common';
import { ApiKeyValidatorService } from './services/api-key-validator.service';
import { API_KEY_VALIDATOR } from './interfaces/api-key-validator.interface';
import { PermissionsInvalidationService } from './services/permissions-invalidation.service';
import { AuthGuard } from './guard/auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { PermissionsGuard } from './guard/permissions.guard';

/**
 * Global auth module — registered once in AppModule.
 *
 * Marking it @Global() makes ApiKeyValidatorService, API_KEY_VALIDATOR,
 * PermissionsInvalidationService, AuthGuard, RolesGuard, and PermissionsGuard
 * available in every feature module without each one having to import this module explicitly.
 */
@Global()
@Module({
  providers: [
    ApiKeyValidatorService,
    { provide: API_KEY_VALIDATOR, useExisting: ApiKeyValidatorService },
    PermissionsInvalidationService,
    AuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    ApiKeyValidatorService,
    API_KEY_VALIDATOR,
    PermissionsInvalidationService,
    AuthGuard,
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthCoreModule {}
