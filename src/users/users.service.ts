import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private currentUserId: string | null = null;

  create(dto: CreateUserDto): User {
    this.ensureEmailIsAvailable(dto.email);

    const now = new Date();
    const user: User = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    this.currentUserId = user.id;
    return user;
  }

  findCurrentUser(): User {
    const user = this.users.find((item) => item.id === this.currentUserId);

    if (!user) {
      throw new NotFoundException('Current user not found');
    }

    return user;
  }

  updateCurrentUser(dto: UpdateUserDto): User {
    const user = this.findCurrentUser();

    if (dto.email && dto.email !== user.email) {
      this.ensureEmailIsAvailable(dto.email);
    }

    Object.assign(user, {
      ...dto,
      updatedAt: new Date(),
    });

    return user;
  }

  deleteCurrentUser(): void {
    const user = this.findCurrentUser();
    this.users = this.users.filter((item) => item.id !== user.id);
    this.currentUserId = null;
  }

  private ensureEmailIsAvailable(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const user = this.users.find(
      (item) => item.email.toLowerCase() === normalizedEmail,
    );

    if (user) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
  }
}
