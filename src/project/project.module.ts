import { Module } from '@nestjs/common';
import { ProjectService } from './services/project.service';
import { ProjectController } from './controllers/project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Task } from './entities/task.entity';
import { TaskService } from './services/task.service';
import { TaskController } from './controllers/task.controller';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project, Task])],
  providers: [ProjectService, TaskService],
  controllers: [ProjectController, TaskController],
})
export class ProjectModule {}
