export interface UserEmployeeResponse {
  employeeId: string;
  userId: string;

  citizenId?: string | null;
  idCard?: string | null;

  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: Date | null;
  sexId?: number | null;

  positionId: number;
  contractTypeId: number;
  employeeStatusId: number;
  hireDate: Date;
  terminationDate?: Date | null;
  baseSalary?: number | null;

  assignedZones: number[];

  driverLicense?: string | null;
  hasCompanyVehicle: boolean;

  internalPhone?: string | null;
  internalEmail?: string | null;
  photoUrl?: string | null;
  metadata: Record<string, any>;

  createdAt: Date;
  updatedAt: Date;
  createdBy?: string | null;
  updatedBy?: string | null;
  deletedAt?: Date | null;
}
