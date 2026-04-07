import { AsyncLocalStorage } from 'async_hooks';

export interface AuditUserContext {
  userId: string;
  userName?: string;
  ip?: string;
  sessionId?: string;
  userAgent?: string;
}

export class AuditContextStorage {
  private static readonly storage = new AsyncLocalStorage<AuditUserContext>();

  static run(context: AuditUserContext, callback: () => any) {
    return this.storage.run(context, callback);
  }

  static getContext(): AuditUserContext | undefined {
    return this.storage.getStore();
  }
}
