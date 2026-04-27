import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { PaginationResponseDto } from '../../../common/dto/pagination';
import { JwtAuthGuard } from '../../auth/guards';
import { ApiCreateWorkspace } from '../docs';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { FindWorkspacesDto } from '../dto/find-workspaces.dto';
import { InviteWorkspaceMemberDto } from '../dto/invite-workspace-member.dto';
import { WorkspaceMemberResponseDto } from '../dto/workspace-member-response.dto';
import { WorkspaceService } from '../services/workspace.service';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getWorkspaces(
    @Req() req: Request,
    @Query() dto: FindWorkspacesDto,
  ): Promise<PaginationResponseDto<WorkspaceMemberResponseDto>> {
    return this.workspaceService.findWorkspaces(req.user.id, dto);
  }

  @Post('create')
  @ApiCreateWorkspace()
  @UseGuards(JwtAuthGuard)
  createWorkspace(@Req() req: Request, @Body() dto: CreateWorkspaceDto) {
    return this.workspaceService.createWorkspace(req.user.id.toString(), dto);
  }

  @Post('invite-member')
  inviteMember(@Req() req: Request, @Body() dto: InviteWorkspaceMemberDto) {
    return this.workspaceService.inviteMember(req.user.id, dto);
  }
}
