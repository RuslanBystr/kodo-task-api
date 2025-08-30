import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../project/infrastructure/entities/task.entity';
import { User } from '../user/entities/user.entity';
import { ActivityController } from './activity.controller';
import { ActivityService } from './activity.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, User])],
  controllers: [ActivityController],
  providers: [ActivityService],
})
export class ActivityModule {}
