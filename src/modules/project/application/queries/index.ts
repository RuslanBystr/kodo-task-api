export * from './get-all-projects.handler';
export * from './get-assigned-tasks.handler';
export * from './get-project-by-id.handler';
export * from './get-project-members.handler';
export * from './get-task-by-id.handler';

import { GetAllProjectsHandler } from './get-all-projects.handler';
import { GetAssignedTasksHandler } from './get-assigned-tasks.handler';
import { GetProjectByIdHandler } from './get-project-by-id.handler';
import { GetProjectMembersHandler } from './get-project-members.handler';
import { GetTaskByIdHandler } from './get-task-by-id.handler';

export const QueryHandlers = [
  GetAssignedTasksHandler,
  GetTaskByIdHandler,

  GetAllProjectsHandler,
  GetProjectByIdHandler,
  GetProjectMembersHandler,
];
