export * from './create-task.handler';
export * from './update-task.handler';
export * from './delete-task.handler';
export * from './update-task-time.handler';
export * from './remove-task-log.handler';

export * from './create-project.handler';
export * from './update-project.handler';
export * from './delete-project.handler';
export * from './add-project-member.handler';
export * from './remove-project-member.handler';

import { CreateTaskHandler } from './create-task.handler';
import { UpdateTaskHandler } from './update-task.handler';
import { DeleteTaskHandler } from './delete-task.handler';
import { UpdateTaskTimeHandler } from './update-task-time.handler';
import { RemoveTaskLogHandler } from './remove-task-log.handler';

import { CreateProjectHandler } from './create-project.handler';
import { UpdateProjectHandler } from './update-project.handler';
import { DeleteProjectHandler } from './delete-project.handler';
import { AddProjectMemberHandler } from './add-project-member.handler';
import { RemoveProjectMemberHandler } from './remove-project-member.handler';

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
