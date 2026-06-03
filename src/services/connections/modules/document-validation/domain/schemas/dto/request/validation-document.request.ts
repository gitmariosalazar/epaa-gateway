import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/** DTO para cada decisión individual de validación documental */
export class DocumentDecisionDto {
  @ApiProperty({
    example: 'b3f1a2c4-9d8e-4f7b-a1c2-3d4e5f6a7b8c',
    description: 'UUID del documento a validar',
    type: String,
  })
  @IsUUID('all')
  documentId!: string;

  @ApiProperty({
    example: 'APROBADO',
    description:
      'Resultado de la validación. RECHAZADO requiere observation. PENDIENTE no aplica cambios.',
    enum: ['APROBADO', 'RECHAZADO', 'PENDIENTE'],
    type: String,
  })
  @IsEnum(['APROBADO', 'RECHAZADO', 'PENDIENTE'])
  validationStatus!: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE';

  @ApiProperty({
    example: 'La cédula presenta inconsistencias en la fecha de expedición.',
    description: 'Observación requerida cuando validationStatus = RECHAZADO',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  observation?: string;
}

/** DTO anidado con decisions y validatorId */
export class ValidateDocumentsInnerDto {
  @ApiProperty({
    description:
      'Decisión individual por cada documento adjunto a la solicitud',
    type: [DocumentDecisionDto],
    example: [
      {
        documentId: 'b3f1a2c4-9d8e-4f7b-a1c2-3d4e5f6a7b8c',
        validationStatus: 'APROBADO',
      },
      {
        documentId: 'c4d5e6f7-0a1b-4c2d-b3e4-5f6a7b8c9d0e',
        validationStatus: 'RECHAZADO',
        observation:
          'La cédula presenta inconsistencias en la fecha de expedición.',
      },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDecisionDto)
  decisions!: DocumentDecisionDto[];

  @ApiProperty({
    example: 'a1b2c3d4-1234-5678-abcd-ef1234567890',
    description: 'UUID del analista que realiza la validación',
    type: String,
  })
  @IsString()
  validatorId!: string;
}

/** DTO principal — mapea exactamente el payload que espera el microservicio connection */
export class ValidateDocumentsGatewayRequest {
  @ApiProperty({
    example: '73a9c05b-3ff2-4e2c-a282-61a73d5951a4',
    description: 'UUID de la solicitud cuyos documentos se están validando',
    type: String,
  })
  @IsUUID('all')
  solicitudId!: string;

  @ApiProperty({
    description: 'Cuerpo de la validación — decisions + validatorId',
    type: ValidateDocumentsInnerDto,
  })
  @ValidateNested()
  @Type(() => ValidateDocumentsInnerDto)
  dto!: ValidateDocumentsInnerDto;
}
