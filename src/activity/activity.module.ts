import { Module } from '@nestjs/common';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../project/entities/task.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, User])
  ],
  controllers: [ActivityController],
  providers: [ActivityService]
})
export class ActivityModule {}
