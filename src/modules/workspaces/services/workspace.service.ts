import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PaginationResponseDto } from '../../../common/dto/pagination';
import { AccessService } from '../../access/access.service';
import { ActionEnum } from '../../access/access.types';
import { CreateWorkspaceDto } from '../dto/create-workspace.dto';
import { FindWorkspacesDto } from '../dto/find-workspaces.dto';
import { WorkspaceCreatedResponseDto } from '../dto/workspace-created.response.dto';
import { WorkspaceMemberResponseDto } from '../dto/workspace-member-response.dto';
import {
  WorkspaceMember,
  WorkspaceRole,
} from '../entities/wokrspace-member.entity';
import { Workspace } from '../entities/workspace.entity';
import { WorkspaceMemberMapper } from '../mappers/workspace.mapper';
import { InviteWorkspaceMemberDto } from '../dto/invite-workspace-member.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace) private workspaceRepo: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepo: Repository<WorkspaceMember>,
    private readonly accessService: AccessService,
  ) {}

  async findWorkspaces(
    userId: number,
    dto: FindWorkspacesDto,
  ): Promise<PaginationResponseDto<WorkspaceMemberResponseDto>> {
    const page = 1;
    const limit = 100;

    const [items, total] = await Promise.all([
      this.workspaceMemberRepo
        .createQueryBuilder('wm')
        .leftJoinAndSelect('wm.workspace', 'workspace')
        .where('wm.user.id = :userId', { userId })
        .orderBy('wm.joinedAt', 'DESC')
        .skip((page - 1) * limit)
        .take(limit)
        .getMany(),

      this.workspaceMemberRepo.count({
        where: { user: { id: userId } },
      }),
    ]);

    const mappedItems: WorkspaceMemberResponseDto[] = items.map(
      (item: WorkspaceMember) => WorkspaceMemberMapper.toDto(item),
    );

    return {
      items: mappedItems,
      meta: {
        currentPage: page,
        itemCount: mappedItems.length,
        itemsPerPage: limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createWorkspace(
    userId: string,
    dto: CreateWorkspaceDto,
  ): Promise<WorkspaceCreatedResponseDto> {
    const queryRunner =
      this.workspaceRepo.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const access = this.accessService.can(ActionEnum.CREATE_WORKSPACE, {
        userId,
      });

      if (!access) {
        throw new ForbiddenException('Access denied');
      }

      const workspace = await queryRunner.manager.save(Workspace, {
        ...dto,
        totalMembers: 1,
      });

      await queryRunner.manager.save(WorkspaceMember, {
        workspace: { id: workspace.id },
        user: { id: Number(userId) },
        role: WorkspaceRole.OWNER,
      });

      await queryRunner.commitTransaction();

      return {
        workspaceId: workspace.id,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Creating failed');
    } finally {
      await queryRunner.release();
    }
  }

  async inviteMember(userId: number, dto: InviteWorkspaceMemberDto) {
    return 'Invite member';
  }
}
