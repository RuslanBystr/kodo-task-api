import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Request } from 'express';

import { JwtAuthGuard } from '../../../auth/guards';
import { GetAllUsersFilterDto } from '../../../user/dto';
import { GetAllMembersQuery } from '../../application/queries/get-all-members.query';

@Controller('members')
export class MembersController {
  constructor(private readonly query: QueryBus) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMembers(@Query() dto: GetAllUsersFilterDto, @Req() req: Request) {
    return this.query.execute(new GetAllMembersQuery(req.user.id, dto));
  }
}
