export interface WorkOrderResponse {
  workOrderId: number;
  description: string;
  creationDate?: Date;
  asignationDate?: Date;
  startDate?: Date;
  completionDate?: Date;
  cancelationDate?: Date;
  workOrderTypeId: number;
  priorityId: number;
  workOrderStatusId: number;
  connectionId: string;
  clientId?: string;
  createdUserId: string;
  assignedUserId?: string;
  estimateCost?: number;
  realCost?: number;
  observations?: string;
}