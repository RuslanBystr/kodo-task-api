export class CreateTaskDto {
  title: string;
  description?: string;
  assignedUserId: string;
  projectId: string;
}
