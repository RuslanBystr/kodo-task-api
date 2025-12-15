import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { User } from '../../../user/entities/user.entity';
import { Project } from '../../infrastructure/entities/project.entity';
import { Task, TaskPriority } from '../../infrastructure/entities/task.entity';
import { CreateTaskCommand } from './create-task.command';
import { CreateTaskHandler } from './create-task.handler';

type MockRepo<T = unknown> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('CreateTaskHandler', () => {
  let handler: CreateTaskHandler;
  let taskRepo: MockRepo<Task>;
  let userRepo: MockRepo<User>;
  let projectRepo: MockRepo<Project>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateTaskHandler,
        {
          provide: getRepositoryToken(Task),
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
        {
          provide: getRepositoryToken(Project),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = moduleRef.get(CreateTaskHandler);
    taskRepo = moduleRef.get(getRepositoryToken(Task));
    userRepo = moduleRef.get(getRepositoryToken(User));
    projectRepo = moduleRef.get(getRepositoryToken(Project));
  });

  afterEach(() => jest.clearAllMocks());

  it('throws if project not found', async () => {
    (projectRepo.findOne as jest.Mock).mockResolvedValue(null);

    const cmd = new CreateTaskCommand(
      'T1',
      'desc',
      3,
      TaskPriority.HIGH,
      '99',
      undefined,
    );

    await expect(handler.execute(cmd)).rejects.toThrow('Project not found');
  });

  it('throws if assigned user specified but not found', async () => {
    const mockProject = { id: '1' } as Project;
    (projectRepo.findOne as jest.Mock).mockResolvedValue(mockProject);
    (userRepo.findOne as jest.Mock).mockResolvedValue(null);

    const cmd = new CreateTaskCommand(
      'T2',
      'desc',
      2,
      TaskPriority.MEDIUM,
      '1',
      777,
    );

    await expect(handler.execute(cmd)).rejects.toThrow(
      'Assigned user not found',
    );
    expect(userRepo.findOne).toHaveBeenCalledWith({ where: { id: 777 } });
  });

  it('creates task with assigned user when provided', async () => {
    const mockProject = { id: '1' } as Project;
    const mockUser = { id: 7 } as User;
    const createdTask = { id: undefined };
    const savedTask = { id: 123 };

    (projectRepo.findOne as jest.Mock).mockResolvedValue(mockProject);
    (userRepo.findOne as jest.Mock).mockResolvedValue(mockUser);
    (taskRepo.create as jest.Mock).mockReturnValue(createdTask);
    (taskRepo.save as jest.Mock).mockResolvedValue(savedTask);

    const cmd = new CreateTaskCommand(
      'Implement login',
      'JWT + refresh',
      5,
      TaskPriority.HIGH,
      '1',
      7,
    );

    const result = await handler.execute(cmd);

    expect(taskRepo.create).toHaveBeenCalledWith({
      title: 'Implement login',
      description: 'JWT + refresh',
      project: mockProject,
      estimate: 5,
      priority: TaskPriority.HIGH,
      assignedUser: mockUser,
    });
    expect(result).toEqual({ id: 123 });
  });

  it('creates task without assigned user when not provided', async () => {
    const mockProject = { id: '2' } as Project;
    const createdTask = { id: undefined };
    const savedTask = { id: 456 };

    (projectRepo.findOne as jest.Mock).mockResolvedValue(mockProject);
    (taskRepo.create as jest.Mock).mockReturnValue(createdTask);
    (taskRepo.save as jest.Mock).mockResolvedValue(savedTask);

    const cmd = new CreateTaskCommand(
      'Docs',
      'Write API docs',
      1,
      TaskPriority.LOW,
      '2',
      undefined,
    );

    const result = await handler.execute(cmd);

    expect(taskRepo.create).toHaveBeenCalledWith({
      title: 'Docs',
      description: 'Write API docs',
      project: mockProject,
      estimate: 1,
      priority: TaskPriority.LOW,
      assignedUser: null,
    });
    expect(result).toEqual({ id: 456 });
  });
});
