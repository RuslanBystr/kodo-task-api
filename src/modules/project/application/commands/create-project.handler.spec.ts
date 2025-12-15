import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../../user/entities/user.entity';
import { Project } from '../../infrastructure/entities/project.entity';
import { CreateProjectCommand } from './create-project.command';
import { CreateProjectHandler } from './create-project.handler';

type MockRepo<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CreateProjectHandler', () => {
  let handler: CreateProjectHandler;
  let projectRepo: MockRepo<Project>;
  let userRepo: MockRepo<User>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreateProjectHandler,
        {
          provide: getRepositoryToken(Project),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateProjectHandler);
    projectRepo = module.get(getRepositoryToken(Project));
    userRepo = module.get(getRepositoryToken(User));
  });

  it('should throw NotFoundException if user not found', async () => {
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    const command = new CreateProjectCommand({ name: 'Test' }, 1);

    await expect(handler.execute(command)).rejects.toThrow(
      new NotFoundException('User with ID 1 not found'),
    );
  });

  it('should create and save project when user exists', async () => {
    const mockUser = { id: 1 } as User;
    const mockProject = {
      id: 123,
      name: 'Test',
      members: [mockUser],
    };

    (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
    (projectRepo.create as jest.Mock).mockReturnValue(mockProject);
    (projectRepo.save as jest.Mock).mockResolvedValue(mockProject);

    const command = new CreateProjectCommand({ name: 'Test' }, 1);
    const result = await handler.execute(command);

    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    expect(projectRepo.create).toHaveBeenCalledWith({
      ...command.dto,
      members: [mockUser],
    });
    expect(projectRepo.save).toHaveBeenCalledWith(mockProject);
    expect(result).toEqual(mockProject);
  });
});
