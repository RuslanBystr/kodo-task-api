import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccessModule } from '../access/access.module';
import { WorkspaceController } from './controllers/workspace.controller';
import { WorkspaceSettingsController } from './controllers/workspace-settings.controller';
import { WorkspaceMember } from './entities/wokrspace-member.entity';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceService } from './services/workspace.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember]),
    AccessModule,
  ],
  controllers: [WorkspaceController, WorkspaceSettingsController],
  providers: [WorkspaceService],
})
export class WorkspacesModule {}
