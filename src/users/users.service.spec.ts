import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a user and makes that user current', () => {
    const user = service.create({
      name: 'Aryan Srivastava',
      email: 'aryan@example.com',
    });

    expect(typeof user.id).toBe('string');
    expect(user.name).toBe('Aryan Srivastava');
    expect(user.email).toBe('aryan@example.com');
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
    expect(service.findCurrentUser()).toBe(user);
  });

  it('throws when creating a user with a duplicate email', () => {
    service.create({
      name: 'Aryan Srivastava',
      email: 'aryan@example.com',
    });

    expect(() =>
      service.create({
        name: 'Another Aryan',
        email: 'ARYAN@example.com',
      }),
    ).toThrow(ConflictException);
  });

  it('throws when no current user exists', () => {
    expect(() => service.findCurrentUser()).toThrow(NotFoundException);
  });

  it('updates the current user', () => {
    const user = service.create({
      name: 'Old Name',
      email: 'old@example.com',
    });
    const originalUpdatedAt = user.updatedAt;

    const updatedUser = service.updateCurrentUser({
      name: 'New Name',
      email: 'new@example.com',
    });

    expect(updatedUser).toBe(user);
    expect(updatedUser.name).toBe('New Name');
    expect(updatedUser.email).toBe('new@example.com');
    expect(updatedUser.updatedAt.getTime()).toBeGreaterThanOrEqual(
      originalUpdatedAt.getTime(),
    );
  });

  it('throws when updating current user to an existing email', () => {
    service.create({
      name: 'First User',
      email: 'first@example.com',
    });
    service.create({
      name: 'Second User',
      email: 'second@example.com',
    });

    expect(() =>
      service.updateCurrentUser({
        email: 'FIRST@example.com',
      }),
    ).toThrow(ConflictException);
  });

  it('deletes the current user', () => {
    service.create({
      name: 'Delete Me',
      email: 'delete@example.com',
    });

    service.deleteCurrentUser();

    expect(() => service.findCurrentUser()).toThrow(NotFoundException);
  });

  it('throws when deleting without a current user', () => {
    expect(() => service.deleteCurrentUser()).toThrow(NotFoundException);
  });
});
