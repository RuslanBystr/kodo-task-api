export class CreateTaskDto {
  title: string;
  description?: string;
  assignedUserId: number;
  projectId: string;
}
