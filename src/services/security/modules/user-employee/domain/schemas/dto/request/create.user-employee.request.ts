import { ApiProperty } from '@nestjs/swagger';

export class CreateUserEmployeeRequest {
  // Datos de autenticación (para crear el usuario interno)
  @ApiProperty({
    example: 'user123',
    description: 'Identificador único del usuario',
    type: String,
  })
  userId: string;
  @ApiProperty({
    example: 'user123',
    description: 'Nombre de usuario',
    type: String,
  })
  username: string;
  @ApiProperty({
    example: 'user@example.com',
    description: 'Correo electrónico',
    type: String,
  })
  email: string;
  @ApiProperty({
    example: 'password123',
    description: 'Contraseña',
    type: String,
  })
  password: string;

  // Datos personales básicos
  @ApiProperty({ example: 'John', description: 'Nombre', type: String })
  firstName: string;
  @ApiProperty({ example: 'Doe', description: 'Apellido', type: String })
  lastName: string;
  @ApiProperty({
    example: '1990-01-01',
    description: 'Fecha de nacimiento',
    type: String,
    format: 'date',
  })
  dateOfBirth?: Date;
  @ApiProperty({ example: 1, description: 'ID de sexo', type: Number })
  sexId?: number;
  @ApiProperty({ example: '1234567890', description: 'Cédula', type: String })
  idCard?: string; // Cédula
  @ApiProperty({
    example: 'citizen123',
    description: 'ID de ciudadano',
    type: String,
  })
  citizenId?: string; // FK a ciudadano (opcional)

  // Datos laborales (obligatorios para empleado)
  @ApiProperty({ example: 2, description: 'ID de cargo', type: Number })
  positionId: number; // cargo_id
  @ApiProperty({
    example: 1,
    description: 'ID de tipo de contrato',
    type: Number,
  })
  contractTypeId: number; // tipo_contrato_id
  @ApiProperty({
    example: 1,
    description: 'ID de estado del empleado',
    type: Number,
  })
  employeeStatusId?: number; // Default: 1 (ACTIVO)
  @ApiProperty({
    example: '2020-01-01',
    description: 'Fecha de contratación',
    type: String,
    format: 'date',
  })
  hireDate: Date;
  @ApiProperty({
    example: '2023-01-01',
    description: 'Fecha de terminación',
    type: String,
    format: 'date',
  })
  terminationDate?: Date;
  @ApiProperty({ example: 50000, description: 'Salario base', type: Number })
  baseSalary?: number;
  @ApiProperty({
    example: 'supervisor123',
    description: 'ID del supervisor',
    type: String,
  })
  supervisorId?: string;

  // Asignaciones
  @ApiProperty({
    example: [1, 2, 3],
    description: 'Zonas asignadas al empleado',
    type: [Number],
  })
  assignedZones?: number[];

  // Seguridad y cumplimiento
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

  // Contacto
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
  metadata?: Record<string, any>;

  // Auditoría (opcional, se llena en backend)
  @ApiProperty({
    example: 'adminUser',
    description: 'Usuario que crea el empleado',
    type: String,
  })
  createdBy?: string;

  constructor(params: {
    userId: string;
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    sexId?: number;
    idCard?: string;
    citizenId?: string;
    positionId: number;
    contractTypeId: number;
    employeeStatusId?: number;
    hireDate: Date;
    terminationDate?: Date;
    baseSalary?: number;
    supervisorId?: string;
    assignedZones?: number[];
    driverLicense?: string;
    hasCompanyVehicle?: boolean;
    internalPhone?: string;
    internalEmail?: string;
    photoUrl?: string;
    metadata?: Record<string, any>;
    createdBy?: string;
  }) {
    this.userId = params.userId;
    this.username = params.username;
    this.email = params.email;
    this.password = params.password;
    this.firstName = params.firstName;
    this.lastName = params.lastName;
    this.dateOfBirth = params.dateOfBirth;
    this.sexId = params.sexId;
    this.idCard = params.idCard;
    this.citizenId = params.citizenId;
    this.positionId = params.positionId;
    this.contractTypeId = params.contractTypeId;
    this.employeeStatusId = params.employeeStatusId;
    this.hireDate = params.hireDate;
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
    this.createdBy = params.createdBy;
  }
}
