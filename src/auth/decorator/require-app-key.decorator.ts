import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by AuthGuard to identify endpoints that accept
 * requests from the official mobile app without a user session.
 *
 * Endpoints decorated with @RequireAppKey() allow:
 *  - Requests authenticated with a valid JWT token (logged-in users), OR
 *  - Requests carrying the `x-api-key` header matching APP_API_KEY (anonymous app clients)
 *
 * Requests without either credential are rejected with HTTP 401.
 */
export const REQUIRE_APP_KEY = 'requireAppKey';
export const RequireAppKey = () => SetMetadata(REQUIRE_APP_KEY, true);
