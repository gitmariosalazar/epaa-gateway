import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

/**
 * Canales de notificación soportados.
 * Pueden combinarse separados por coma: "EMAIL,WHATSAPP"
 */
export enum NotificationChannelEnum {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  WHATSAPP = 'WHATSAPP',
  PUSH = 'PUSH',
}

export enum NotificationPriorityEnum {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * SendNotificationRequest — DTO simplificado del gateway.
 *
 * Campos obligatorios:
 *   - userId  → requerido por el trigger fn_validar_usuario_notificacion
 *              (valida existencia en public.usuarios o public.cliente_usuario)
 *   - title   → titulo de la notificación
 *   - body    → cuerpo del mensaje
 *
 * Campos opcionales:
 *   - channel  → canal de envío (default: IN_APP)
 *   - priority → prioridad (default: NORMAL)
 *   - metadata → datos extra (to, phone, url, etc.)
 *
 * SRP : solo transporta y valida datos de la petición REST.
 * DIP : no conoce detalles del microservicio ni de Kafka.
 */
export class SendNotificationRequest {
  @ApiProperty({
    description:
      'UUID del usuario destinatario. ' +
      'Debe existir en public.usuarios o public.cliente_usuario ' +
      '(validado por trigger de base de datos).',
    example: 'e3400d18-86e1-4eee-9a8b-3e7eaf812a95',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'Título de la notificación',
    example: 'Registro exitoso',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Cuerpo / mensaje de la notificación',
    example: 'Tu cuenta ha sido creada correctamente. Bienvenido al sistema.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    description:
      'Canal(es) de envío. Para múltiples canales simultáneos separa con coma. ' +
      'Valores permitidos: IN_APP | EMAIL | SMS | WHATSAPP | PUSH. ' +
      'Si no se especifica, se usa IN_APP.',
    example: 'EMAIL',
    enum: NotificationChannelEnum,
    default: NotificationChannelEnum.IN_APP,
  })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({
    description: 'Prioridad de la notificación. Por defecto: NORMAL',
    enum: NotificationPriorityEnum,
    default: NotificationPriorityEnum.NORMAL,
    example: NotificationPriorityEnum.NORMAL,
  })
  @IsOptional()
  @IsEnum(NotificationPriorityEnum)
  priority?: NotificationPriorityEnum;

  @ApiPropertyOptional({
    description:
      'Datos adicionales para el proveedor: destinatario (email, teléfono), ' +
      'URL de redirección, icono, etc.',
    example: {
      to: 'mariosalazar.ms.10@gmail.com',
      phone: '+593994532438',
      url: 'https://www.google.com',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
