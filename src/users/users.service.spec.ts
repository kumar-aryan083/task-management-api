import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

type MockPrismaService = {
  user: {
    create: jest.Mock;
    findFirst: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
};

function buildUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    name: 'Aryan Srivastava',
    email: 'aryan@example.com',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let prisma: MockPrismaService;

  beforeEach(async () => {
    prisma = {
      user: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user', async () => {
    const created = buildUser();
    prisma.user.findFirst.mockResolvedValueOnce(null);
    prisma.user.create.mockResolvedValueOnce(created);

    const user = await service.create({
      name: 'Aryan Srivastava',
      email: 'aryan@example.com',
    });

    expect(user).toBe(created);
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: { name: 'Aryan Srivastava', email: 'aryan@example.com' },
    });
  });

  it('throws when creating a user with a duplicate email', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(buildUser());

    await expect(
      service.create({ name: 'Another Aryan', email: 'ARYAN@example.com' }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.create).not.toHaveBeenCalled();
  });

  it('returns the most recently created user as the current user', async () => {
    const current = buildUser();
    prisma.user.findFirst.mockResolvedValueOnce(current);

    const user = await service.findCurrentUser();

    expect(user).toBe(current);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
  });

  it('throws when no current user exists', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);

    await expect(service.findCurrentUser()).rejects.toThrow(NotFoundException);
  });

  it('updates the current user', async () => {
    const current = buildUser();
    const updated = buildUser({ name: 'New Name', email: 'new@example.com' });
    prisma.user.findFirst
      .mockResolvedValueOnce(current) // findCurrentUser
      .mockResolvedValueOnce(null); // duplicate email check
    prisma.user.update.mockResolvedValueOnce(updated);

    const user = await service.updateCurrentUser({
      name: 'New Name',
      email: 'new@example.com',
    });

    expect(user).toBe(updated);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: current.id },
      data: { name: 'New Name', email: 'new@example.com' },
    });
  });

  it('throws when updating current user to an existing email', async () => {
    const current = buildUser();
    prisma.user.findFirst
      .mockResolvedValueOnce(current) // findCurrentUser
      .mockResolvedValueOnce(
        buildUser({ id: 'user-2', email: 'taken@example.com' }),
      ); // duplicate check

    await expect(
      service.updateCurrentUser({ email: 'TAKEN@example.com' }),
    ).rejects.toThrow(ConflictException);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('does not re-check email availability when email is unchanged', async () => {
    const current = buildUser();
    prisma.user.findFirst.mockResolvedValueOnce(current); // findCurrentUser only
    prisma.user.update.mockResolvedValueOnce(current);

    await service.updateCurrentUser({ email: current.email.toUpperCase() });

    expect(prisma.user.findFirst).toHaveBeenCalledTimes(1);
  });

  it('deletes the current user', async () => {
    const current = buildUser();
    prisma.user.findFirst.mockResolvedValueOnce(current);
    prisma.user.delete.mockResolvedValueOnce(current);

    await service.deleteCurrentUser();

    expect(prisma.user.delete).toHaveBeenCalledWith({
      where: { id: current.id },
    });
  });

  it('throws when deleting without a current user', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(null);

    await expect(service.deleteCurrentUser()).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
