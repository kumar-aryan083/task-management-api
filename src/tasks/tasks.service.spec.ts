import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { Prisma, Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TasksService } from './tasks.service';
import { SortOrder, TaskPriority, TaskSortBy, TaskStatus } from './task.enums';

type MockPrismaService = {
  task: {
    create: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

function buildTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    title: 'A task',
    description: null,
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: null,
    userId: '55a0218e-376e-46d2-8fa7-d314ec77c866',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('TasksService', () => {
  let service: TasksService;
  let prisma: MockPrismaService;
  const userId = '55a0218e-376e-46d2-8fa7-d314ec77c866';

  beforeEach(async () => {
    prisma = {
      task: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a task with defaults', async () => {
    const created = buildTask();
    prisma.task.create.mockResolvedValueOnce(created);

    const task = await service.create({ title: 'A task', userId });

    expect(task).toBe(created);
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'A task',
        description: null,
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: null,
        userId,
      },
    });
  });

  it('creates a task with optional fields', async () => {
    const created = buildTask({
      description: 'Cover validation later at the API boundary.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2026-09-01T10:00:00.000Z'),
    });
    prisma.task.create.mockResolvedValueOnce(created);

    const task = await service.create({
      title: 'Write DTO tests',
      description: 'Cover validation later at the API boundary.',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: '2026-09-01T10:00:00.000Z',
      userId,
    });

    expect(task.dueDate).toEqual(new Date('2026-09-01T10:00:00.000Z'));
    expect(prisma.task.create).toHaveBeenCalledWith({
      data: {
        title: 'Write DTO tests',
        description: 'Cover validation later at the API boundary.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2026-09-01T10:00:00.000Z'),
        userId,
      },
    });
  });

  it('throws NotFoundException when the referenced user does not exist', async () => {
    prisma.task.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError('Foreign key violation', {
        code: 'P2003',
        clientVersion: 'test',
      }),
    );

    await expect(service.create({ title: 'A task', userId })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('finds all tasks with pagination metadata', async () => {
    const items = [buildTask(), buildTask({ id: 'task-2' })];
    prisma.task.findMany.mockResolvedValueOnce(items);
    prisma.task.count.mockResolvedValueOnce(2);

    const result = await service.findAll();

    expect(result).toEqual({
      items,
      page: 1,
      limit: 20,
      total: 2,
      totalPages: 1,
    });
    expect(prisma.task.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: 'desc' },
      skip: 0,
      take: 20,
    });
    expect(prisma.task.count).toHaveBeenCalledWith({ where: {} });
  });

  it('filters tasks by status and priority', async () => {
    prisma.task.findMany.mockResolvedValueOnce([]);
    prisma.task.count.mockResolvedValueOnce(0);

    await service.findAll({
      status: TaskStatus.DONE,
      priority: TaskPriority.HIGH,
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: TaskStatus.DONE, priority: TaskPriority.HIGH },
      }),
    );
  });

  it('searches tasks by title case-insensitively', async () => {
    prisma.task.findMany.mockResolvedValueOnce([]);
    prisma.task.count.mockResolvedValueOnce(0);

    await service.findAll({ search: 'nestjs' });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { title: { contains: 'nestjs', mode: 'insensitive' } },
      }),
    );
  });

  it('sorts tasks', async () => {
    prisma.task.findMany.mockResolvedValueOnce([]);
    prisma.task.count.mockResolvedValueOnce(0);

    await service.findAll({
      sortBy: TaskSortBy.TITLE,
      sortOrder: SortOrder.ASC,
    });

    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { title: 'asc' } }),
    );
  });

  it('paginates tasks', async () => {
    prisma.task.findMany.mockResolvedValueOnce([buildTask({ id: 'task-2' })]);
    prisma.task.count.mockResolvedValueOnce(3);

    const result = await service.findAll({ page: 2, limit: 1 });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(1);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(3);
    expect(prisma.task.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 1, take: 1 }),
    );
  });

  it('finds one task by id', async () => {
    const task = buildTask();
    prisma.task.findUnique.mockResolvedValueOnce(task);

    expect(await service.findOne(task.id)).toBe(task);
  });

  it('throws when finding a missing task', async () => {
    prisma.task.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.findOne('7354d194-9a22-4865-8128-cc0fb0b33267'),
    ).rejects.toThrow(NotFoundException);
  });

  it('updates a task', async () => {
    const task = buildTask();
    const updated = buildTask({
      title: 'New title',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
    });
    prisma.task.findUnique.mockResolvedValueOnce(task);
    prisma.task.update.mockResolvedValueOnce(updated);

    const result = await service.update(task.id, {
      title: 'New title',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.LOW,
    });

    expect(result).toBe(updated);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: task.id },
      data: {
        title: 'New title',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.LOW,
        dueDate: undefined,
      },
    });
  });

  it('keeps the existing due date when update dto does not include one', async () => {
    const task = buildTask({ dueDate: new Date('2026-09-01T10:00:00.000Z') });
    prisma.task.findUnique.mockResolvedValueOnce(task);
    prisma.task.update.mockResolvedValueOnce(task);

    await service.update(task.id, { title: 'Still has due date' });

    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: task.id },
      data: { title: 'Still has due date', dueDate: undefined },
    });
  });

  it('marks a task as completed', async () => {
    const task = buildTask({ status: TaskStatus.IN_PROGRESS });
    const completed = buildTask({ status: TaskStatus.DONE });
    prisma.task.findUnique.mockResolvedValueOnce(task);
    prisma.task.update.mockResolvedValueOnce(completed);

    const result = await service.complete(task.id);

    expect(result.status).toBe(TaskStatus.DONE);
    expect(prisma.task.update).toHaveBeenCalledWith({
      where: { id: task.id },
      data: { status: TaskStatus.DONE },
    });
  });

  it('throws when completing a missing task', async () => {
    prisma.task.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.complete('7354d194-9a22-4865-8128-cc0fb0b33267'),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.task.update).not.toHaveBeenCalled();
  });

  it('deletes a task', async () => {
    const task = buildTask();
    prisma.task.findUnique.mockResolvedValueOnce(task);
    prisma.task.delete.mockResolvedValueOnce(task);

    await service.remove(task.id);

    expect(prisma.task.delete).toHaveBeenCalledWith({ where: { id: task.id } });
  });

  it('throws when deleting a missing task', async () => {
    prisma.task.findUnique.mockResolvedValueOnce(null);

    await expect(
      service.remove('7354d194-9a22-4865-8128-cc0fb0b33267'),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.task.delete).not.toHaveBeenCalled();
  });
});
