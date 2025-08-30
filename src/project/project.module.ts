import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '../user/entities/user.entity';
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';
import { Project } from './infrastructure/entities/project.entity';
import { Task } from './infrastructure/entities/task.entity';
import { TaskLog } from './infrastructure/entities/task-log.entity';
import { ProjectController } from './interface/controllers/project.controller';
import { TaskController } from './interface/controllers/task.controller';
import { ProjectMemberGuard } from './interface/guards';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Project, Task, TaskLog]),
    CqrsModule,
  ],
  providers: [...CommandHandlers, ...QueryHandlers, ProjectMemberGuard],
  controllers: [ProjectController, TaskController],
})
export class ProjectModule {}
