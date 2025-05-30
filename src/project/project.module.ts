import { Module } from '@nestjs/common';
import { ProjectService } from './services/project.service';
import { ProjectController } from './controllers/project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { TaskService } from './services/task.service';
import { TaskController } from './controllers/task.controller';
import { User } from '../user/entities/user.entity';
import { TaskLog } from './entities/task-log.entity';
import { ProjectMemberGuard } from './guards/project-member.guard';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Task, TaskLog])],
  providers: [ProjectService, TaskService, ProjectMemberGuard],
  controllers: [ProjectController, TaskController],
})
export class ProjectModule {}
