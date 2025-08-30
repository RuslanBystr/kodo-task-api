import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from '../project/infrastructure/entities/project.entity';
import { User } from '../user/entities/user.entity';
import { GetAllMembersHandler } from './application/queries';
import { MembersController } from './interface/controllers/members.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Project]), CqrsModule],
  controllers: [MembersController],
  providers: [GetAllMembersHandler],
})
export class MembersModule {}
