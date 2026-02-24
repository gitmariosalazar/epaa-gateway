/**
 {
  "userId": "20eaa981-e0aa-4775-844a-304e7e108881",
  "username": "mario10salazar",
  "email": "user@example.com",
  "password": "password123",
  "firstName": "Mario",
  "lastName": "Salazar",
  "dateOfBirth": "1995-02-01",
  "sexId": 1,
  "idCard": "1003938477",
  "citizenId": "1003938477",
  "positionId": 2,
  "contractTypeId": 1,
  "employeeStatusId": 1,
  "hireDate": "2020-01-01",
  "terminationDate": "2023-01-01",
  "baseSalary": 50000,
  "supervisorId": null,
  "assignedZones": [
    1,
    2,
    3
  ],
  "driverLicense": "B1234567",
  "hasCompanyVehicle": true,
  "internalPhone": "123-456-7890",
  "internalEmail": "user@example.com",
  "photoUrl": "https://example.com/photo.jpg",
  "metadata": {
    "key": "value"
  },
  "createdBy": "d75fa5f8-83a2-4898-8b8d-890d3a2303bc"
}
 */

import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserEmployeeRequest {
  // Datos de autenticación (solo si se permite cambiar, muy restringido)
  @ApiProperty({
    example: 'mario10salazar',
    description: 'Nombre de usuario',
    type: String,
  })
  username?: string; // Opcional y con validación estricta en backend
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico',
    type: String,
  })
  email?: string; // Opcional, requiere verificación de nuevo email

  // Datos personales básicos (casi siempre opcionales)
  @ApiProperty({
    example: 'Mario',
    description: 'Nombre',
    type: String,
  })
  firstName?: string;
  @ApiProperty({
    example: 'Salazar',
    description: 'Apellido',
    type: String,
  })
  lastName?: string;
  @ApiProperty({
    example: '1995-02-01',
    description: 'Fecha de nacimiento',
    type: String,
    format: 'date',
  })
  dateOfBirth?: Date;
  @ApiProperty({
    example: 1,
    description: 'ID de sexo',
    type: Number,
  })
  sexId?: number;
  @ApiProperty({
    example: '1003938477',
    description: 'Cédula',
    type: String,
  })
  idCard?: string; // Cambiar cédula es raro, pero posible
  @ApiProperty({
    example: '1003938477',
    description: 'ID de ciudadano',
    type: String,
  })
  citizenId?: string; // Cambiar vínculo a ciudadano (raro)

  // Datos laborales (solo algunos se actualizan normalmente)
  @ApiProperty({
    example: 2,
    description: 'ID de cargo',
    type: Number,
  })
  positionId?: number; // Cambio de cargo
  @ApiProperty({
    example: 1,
    description: 'ID de tipo de contrato',
    type: Number,
  })
  contractTypeId?: number; // Cambio de contrato
  @ApiProperty({
    example: 1,
    description: 'ID de estado del empleado',
    type: Number,
  })
  employeeStatusId?: number; // Cambio de estado (ej: de ACTIVO a SUSPENDIDO)
  @ApiProperty({
    example: '2023-01-01',
    description: 'Fecha de terminación',
    type: String,
    format: 'date',
  })
  terminationDate?: Date; // Fecha de salida (solo si se termina contrato)
  @ApiProperty({
    example: 50000,
    description: 'Salario base',
    type: Number,
  })
  baseSalary?: number; // Ajuste salarial (con auditoría)
  @ApiProperty({
    example: 'supervisor123',
    description: 'ID del supervisor',
    type: String,
  })
  supervisorId?: string; // Cambio de supervisor

  // Asignaciones (pueden cambiar)
  @ApiProperty({
    example: [1, 2, 3],
    description: 'IDs de zonas asignadas',
    type: [Number],
  })
  assignedZones?: number[]; // Reasignación de zonas

  // Seguridad y cumplimiento (cambios sensibles)
  @ApiProperty({
    example: 'B1234567',
    description: 'Licencia de conducir',
    type: String,
  })
  driverLicense?: string;
  @ApiProperty({
    example: true,
    description: 'Indica si tiene vehículo de la empresa',
    type: Boolean,
  })
  hasCompanyVehicle?: boolean;

  // Contacto (frecuentes en updates)
  @ApiProperty({
    example: '123-456-7890',
    description: 'Teléfono interno',
    type: String,
  })
  internalPhone?: string;
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico interno',
    type: String,
  })
  internalEmail?: string;
  @ApiProperty({
    example: 'https://example.com/photo.jpg',
    description: 'URL de la foto',
    type: String,
  })
  photoUrl?: string;

  // Flexibilidad
  @ApiProperty({
    example: { key: 'value' },
    description: 'Metadatos adicionales',
    type: Object,
  })
  metadata?: Record<string, any>; // Actualizaciones dinámicas

  // Auditoría (se llena en backend, no se envía desde frontend)
  // updatedBy se agrega automáticamente en el servicio

  constructor(params: Partial<UpdateUserEmployeeRequest>) {
    this.username = params.username;
    this.email = params.email;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.dateOfBirth = params.dateOfBirth;
    this.sexId = params.sexId;
    this.idCard = params.idCard;
    this.citizenId = params.citizenId;
    this.positionId = params.positionId;
    this.contractTypeId = params.contractTypeId;
    this.employeeStatusId = params.employeeStatusId;
    this.terminationDate = params.terminationDate;
    this.baseSalary = params.baseSalary;
    this.supervisorId = params.supervisorId;
    this.assignedZones = params.assignedZones;
    this.driverLicense = params.driverLicense;
    this.hasCompanyVehicle = params.hasCompanyVehicle;
    this.internalPhone = params.internalPhone;
    this.internalEmail = params.internalEmail;
    this.photoUrl = params.photoUrl;
    this.metadata = params.metadata;
  }
}
