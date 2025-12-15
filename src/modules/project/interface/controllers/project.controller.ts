import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/guards';
import { AuthRequest } from '../../../../common/types';
import { AddProjectMemberCommand } from '../../application/commands/add-project-member.command';
import { CreateProjectCommand } from '../../application/commands/create-project.command';
import { DeleteProjectCommand } from '../../application/commands/delete-project.command';
import { RemoveProjectMemberCommand } from '../../application/commands/remove-project-member.command';
import { UpdateProjectCommand } from '../../application/commands/update-project.command';
import { GetAllProjectsQuery } from '../../application/queries/get-all-projects.query';
import { GetProjectByIdQuery } from '../../application/queries/get-project-by-id.query';
import { GetProjectMembersQuery } from '../../application/queries/get-project-members.query';
import { ApiCreateProject, ApiGetAllProjects } from '../docs';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  GetAllProjectsFilterDto,
  RemoveProjectMemberDto,
  UpdateProjectDto,
} from '../dto';
import { ProjectMemberGuard } from '../guards';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(
    private readonly command: CommandBus,
    private readonly query: QueryBus,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiGetAllProjects()
  async getProjects(
    @Query() filterDto: GetAllProjectsFilterDto,
    @Req() req: AuthRequest,
  ) {
    return this.query.execute(new GetAllProjectsQuery(filterDto, req.user.id));
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiCreateProject()
  create(@Body() dto: CreateProjectDto, @Req() req: AuthRequest) {
    return this.command.execute(new CreateProjectCommand(dto, req.user.id));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  findOne(@Param('id') id: string) {
    return this.query.execute(new GetProjectByIdQuery(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.command.execute(new UpdateProjectCommand(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  remove(@Param('id') id: string) {
    return this.command.execute(new DeleteProjectCommand(id));
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  addMember(
    @Param('id') id: string,
    @Body() dto: AddProjectMemberDto,
    @Req() req: AuthRequest,
  ) {
    return this.command.execute(
      new AddProjectMemberCommand(id, dto, req.user.id),
    );
  }

  @Delete(':id/members')
  @UseGuards(JwtAuthGuard)
  removeMember(
    @Param('id') id: string,
    @Body() dto: RemoveProjectMemberDto,
    @Req() req: AuthRequest,
  ) {
    return this.command.execute(
      new RemoveProjectMemberCommand(id, dto, req.user.id),
    );
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  getMembers(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.query.execute(new GetProjectMembersQuery(id, req.user.id));
  }
}
