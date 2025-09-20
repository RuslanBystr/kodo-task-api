import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Project } from '../../infrastructure/entities/project.entity';
import { DeleteProjectCommand } from './delete-project.command';
import { DeleteProjectHandler } from './delete-project.handler';

type MockRepo<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('DeleteProjectHandler', () => {
  let handler: DeleteProjectHandler;
  let projectRepo: MockRepo<Project>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteProjectHandler,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = moduleRef.get(DeleteProjectHandler);
    projectRepo = moduleRef.get(getRepositoryToken(Project));
  });

  afterEach(() => jest.clearAllMocks());

  it('should call repository.delete with correct id', async () => {
    (projectRepo.delete as jest.Mock).mockResolvedValue({ affected: 1 });

    const cmd = new DeleteProjectCommand('123');
    const result = await handler.execute(cmd);

    expect(projectRepo.delete).toHaveBeenCalledWith('123');
    expect(result).toEqual({ message: 'Project deleted successfully' });
  });

  it('should still return success message even if no rows affected', async () => {
    (projectRepo.delete as jest.Mock).mockResolvedValue({ affected: 0 });

    const cmd = new DeleteProjectCommand('999');
    const result = await handler.execute(cmd);

    expect(projectRepo.delete).toHaveBeenCalledWith('999');
    expect(result).toEqual({ message: 'Project deleted successfully' });
  });
});
