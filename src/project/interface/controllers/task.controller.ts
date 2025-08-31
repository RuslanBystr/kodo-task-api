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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../auth/guards';
import { AuthRequest } from '../../../common/types';
import { CreateTaskCommand } from '../../application/commands/create-task.command';
import { DeleteTaskCommand } from '../../application/commands/delete-task.command';
import { RemoveTaskLogCommand } from '../../application/commands/remove-task-log.command';
import { UpdateTaskCommand } from '../../application/commands/update-task.command';
import { UpdateTaskTimeCommand } from '../../application/commands/update-task-time.command';
import { GetAssignedTasksQuery } from '../../application/queries/get-assigned-tasks.query';
import { GetTaskByIdQuery } from '../../application/queries/get-task-by-id.query';
import { GetAllTasksFilterDto, SetTimeDto, UpdateTaskDto } from '../dto';
import { CreateTaskDto } from '../dto/create-task.dto';

@ApiBearerAuth('access_token')
@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(
    private readonly command: CommandBus,
    private readonly query: QueryBus,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateTaskDto) {
    await this.command.execute(
      new CreateTaskCommand(
        dto.title,
        dto.description,
        dto.estimate,
        dto.priority,
        dto.projectId,
        dto.assignedUserId,
      ),
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getTasks(
    @Query() filterDto: GetAllTasksFilterDto,
    @Req() req: AuthRequest,
  ) {
    return this.query.execute(
      new GetAssignedTasksQuery(req.user.id, filterDto),
    );
  }

  @Put('/spend/:id')
  @UseGuards(JwtAuthGuard)
  async trackTaskTime(
    @Param('id') taskId: string,
    @Body() setTimeDto: SetTimeDto,
    @Req() req: AuthRequest,
  ) {
    return this.command.execute(
      new UpdateTaskTimeCommand(req.user.id, taskId, setTimeDto),
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.query.execute(new GetTaskByIdQuery(id));
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.command.execute(new UpdateTaskCommand(id, dto));
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.command.execute(new DeleteTaskCommand(id));
  }

  @Delete('logs/:logId')
  removeLog(@Param('logId') logId: string) {
    return this.command.execute(new RemoveTaskLogCommand(logId));
  }
}
