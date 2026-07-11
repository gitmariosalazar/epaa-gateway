/**
 * Injection token for the API key validator abstraction.
 * Use this token with @Inject() to depend on the interface rather than the
 * concrete implementation (Dependency Inversion Principle).
 */
export const API_KEY_VALIDATOR = Symbol('IApiKeyValidator');

/**
 * Contract for validating mobile-app API keys.
 * Consumers depend on this abstraction — not on any concrete implementation.
 */
export interface IApiKeyValidator {
  /**
   * Returns true only when `providedKey` matches the server-side secret,
   * verified using a constant-time comparison to prevent timing attacks.
   */
  isValid(providedKey: string): boolean;
}
