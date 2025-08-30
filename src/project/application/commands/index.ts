export * from './add-project-member.handler';
export * from './create-project.handler';
export * from './create-task.handler';
export * from './delete-project.handler';
export * from './delete-task.handler';
export * from './remove-project-member.handler';
export * from './remove-task-log.handler';
export * from './update-project.handler';
export * from './update-task.handler';
export * from './update-task-time.handler';

import { AddProjectMemberHandler } from './add-project-member.handler';
import { CreateProjectHandler } from './create-project.handler';
import { CreateTaskHandler } from './create-task.handler';
import { DeleteProjectHandler } from './delete-project.handler';
import { DeleteTaskHandler } from './delete-task.handler';
import { RemoveProjectMemberHandler } from './remove-project-member.handler';
import { RemoveTaskLogHandler } from './remove-task-log.handler';
import { UpdateProjectHandler } from './update-project.handler';
import { UpdateTaskHandler } from './update-task.handler';
import { UpdateTaskTimeHandler } from './update-task-time.handler';

export const CommandHandlers = [
  // Tasks
  CreateTaskHandler,
  UpdateTaskHandler,
  DeleteTaskHandler,
  UpdateTaskTimeHandler,
  RemoveTaskLogHandler,

  // Projects
  CreateProjectHandler,
  UpdateProjectHandler,
  DeleteProjectHandler,
  AddProjectMemberHandler,
  RemoveProjectMemberHandler,
];
