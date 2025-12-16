export class CreateWorkOrderWorkerAssignmentRequest {
  workOrderId: string;
  workerId: number;
  rolId: number;

  constructor(workOrderId: string, workerId: number, rolId: number) {
    this.workOrderId = workOrderId;
    this.workerId = workerId;
    this.rolId = rolId;
  }
}
