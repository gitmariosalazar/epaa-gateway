/**
 * Interfaz general para emisión de eventos en tiempo real.
 * Se usa 'string' en lugar de un Enum global para permitir que 
 * cada módulo o bounded context defina sus propios eventos 
 * sin crear un cuello de botella centralizado.
 */
export interface IRealtimeNotifier {
  notify<T>(event: string, payload: T): void;
}
