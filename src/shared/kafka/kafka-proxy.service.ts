import { Injectable, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { Observable } from 'rxjs';

/**
 * KafkaProxyService
 *
 * Centralizes all Kafka communications from the Gateway.
 * Implements the "Single Topic per Service" pattern using Kafka Keys for routing.
 */
@Injectable()
export class KafkaProxyService {
  private readonly logger = new Logger(KafkaProxyService.name);
  private readonly serviceMapping: Record<string, string> = {
    authentication: 'authentication_topic',
    roles: 'authentication_topic',
    categories: 'authentication_topic',
    permissions: 'authentication_topic',
    'rol-permission': 'authentication_topic',
    users: 'authentication_topic',
    employees: 'authentication_topic',
    auth: 'authentication_topic',
    clients: 'clients_topic',
    customers: 'clients_topic',
    companies: 'companies_topic',
    connections: 'connection_topic',
    requests: 'connection_topic',
    inspection_order: 'connection_topic',
    installation_order: 'connection_topic',
    'connection-documents': 'connection_topic',
    'inspection-invoice': 'connection_topic',
    rates: 'connection_topic',
    'observation-connection': 'connection_topic',
    'photo-connection': 'connection_topic',
    // Nuevos dominios del proceso BPMN de Acometidas
    document_validation: 'connection_topic',
    payment_confirmation: 'connection_topic',
    inspection_report: 'connection_topic',
    contracts: 'connection_topic',
    cadastral: 'connection_topic',
    installation_report: 'connection_topic',
    // Microservicio de notificaciones
    notifications: 'notifications_topic',
    // Otros servicios
    'epaa-legacy': 'epaa_database_legacy_topic',
    inventory: 'inventory_topic',
    location: 'location_topic',
    property: 'property_topic',
    properties: 'property_topic',
    qrcode: 'qrcode_topic',
    reading: 'readings_topic',
    readings: 'readings_topic',
    'observation-reading': 'readings_topic',
    'photo-reading': 'readings_topic',
    incident: 'readings_topic',
    'work-orders': 'work_orders_topic',
    'work-order': 'work_orders_topic',
    'work-type': 'work_orders_topic',
    workers: 'workers_topic',
    'sigame-legacy': 'sigame_legacy_topic',
    accounting: 'epaa_database_legacy_topic',
    audit: 'authentication_topic',
    'trash-rate-audit-report': 'epaa_database_legacy_topic',
    'credit-notes': 'epaa_database_legacy_topic',
    'missing-valor-records': 'epaa_database_legacy_topic',
    'monthly-summary': 'epaa_database_legacy_topic',
    'top-debtors': 'epaa_database_legacy_topic',
    'trash-dashboard-kpi': 'epaa_database_legacy_topic',
    'client-trash-detail': 'epaa_database_legacy_topic',
    'trash-rate-kpi': 'epaa_database_legacy_topic',
    'collector-performance-kpi': 'epaa_database_legacy_topic',
    'daily-collector-detail': 'epaa_database_legacy_topic',
    documents: 'documents_topic',
  };

  /**
   * Identifies the correct topic for a given pattern.
   * Pattern usually looks like 'service.action'
   */
  private getTopicForPattern(pattern: string): string {
    const domain = pattern.split('.')[0];
    const topic = this.serviceMapping[domain];
    if (!topic) {
      console.warn(
        `[KafkaProxy] No topic mapping found for domain: ${domain}. Pattern: ${pattern}`,
      );
      return pattern;
    }
    return topic;
  }

  /**
   * Sends a request-response message to Kafka.
   * Maps the pattern to a Topic and uses the pattern inside the message payload.
   */
  send<TResult = any, TInput = any>(
    client: ClientKafka,
    pattern: string,
    data: TInput,
  ): Observable<TResult> {
    const topic = this.getTopicForPattern(pattern);

    // Ensure the client is subscribed to the response of this topic
    client.subscribeToResponseOf(topic);

    return new Observable<TResult>((subscriber) => {
      client
        .connect()
        .then(() => {
          this.logger.log(
            `[KafkaProxy] Sending to Topic: ${topic}, with Key: ${pattern}`,
          );
          client
            .send<TResult>(topic, {
              pattern,
              data,
            })
            .subscribe(subscriber);
        })
        .catch((err) => subscriber.error(err));
    });
  }

  /**
   * Emits an event message to Kafka.
   */
  emit<TResult = any, TInput = any>(
    client: ClientKafka,
    pattern: string,
    data: TInput,
  ): Observable<TResult> {
    const topic = this.getTopicForPattern(pattern);
    // Use emit for one-way events, but still wrap with pattern for routing
    return client.emit(topic, {
      pattern,
      data,
    });
  }
}
