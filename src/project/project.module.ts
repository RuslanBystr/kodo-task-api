import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ProjectController } from './interface/controllers/project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './infrastructure/entities/project.entity';
import { Task } from './infrastructure/entities/task.entity';
import { TaskController } from './interface/controllers/task.controller';
import { User } from '../user/entities/user.entity';
import { TaskLog } from './infrastructure/entities/task-log.entity';
import { ProjectMemberGuard } from './interface/guards';
import { CommandHandlers } from './application/commands';
import { QueryHandlers } from './application/queries';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Project, Task, TaskLog]),
    CqrsModule,
  ],
  providers: [...CommandHandlers, ...QueryHandlers, ProjectMemberGuard],
  controllers: [ProjectController, TaskController],
})
export class ProjectModule {}
