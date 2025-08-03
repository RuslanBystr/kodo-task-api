import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProjectService } from '../services/project.service';
import { ProjectMemberGuard } from '../guards';
import { JwtAuthGuard } from '../../auth/guards';
import { AuthRequest } from '../../common/types';
import {
  AddProjectMemberDto,
  CreateProjectDto,
  GetAllProjectsFilterDto,
  RemoveProjectMemberDto,
  UpdateProjectDto,
} from '../dto';

@ApiTags('project')
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getProjects(
    @Query() filterDto: GetAllProjectsFilterDto,
    @Req() req: AuthRequest,
  ) {
    return this.projectService.findAll(filterDto, req.user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateProjectDto, @Req() req: AuthRequest) {
    return this.projectService.create(dto, req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  findOne(@Param('id') id: string) {
    return this.projectService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
    return this.projectService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ProjectMemberGuard)
  remove(@Param('id') id: string) {
    return this.projectService.remove(id);
  }

  @Post(':id/members')
  @UseGuards(JwtAuthGuard)
  addMember(
    @Param('id') id: string,
    @Body() dto: AddProjectMemberDto,
    @Req() req: AuthRequest,
  ) {
    return this.projectService.addMember(id, dto, req.user.id);
  }

  @Delete(':id/members')
  @UseGuards(JwtAuthGuard)
  removeMember(
    @Param('id') id: string,
    @Body() dto: RemoveProjectMemberDto,
    @Req() req: AuthRequest,
  ) {
    return this.projectService.removeMember(id, dto, req.user.id);
  }

  @Get(':id/members')
  @UseGuards(JwtAuthGuard)
  getMembers(@Param('id') id: string, @Req() req: AuthRequest) {
    return this.projectService.getMembers(id, req.user.id);
  }
}
