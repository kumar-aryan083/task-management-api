import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.ensureEmailIsAvailable(dto.email);

    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
      },
    });
  }

  async findCurrentUser(): Promise<User> {
    const user = await this.prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      throw new NotFoundException('Current user not found');
    }

    return user;
  }

  async updateCurrentUser(dto: UpdateUserDto): Promise<User> {
    const user = await this.findCurrentUser();

    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      await this.ensureEmailIsAvailable(dto.email, user.id);
    }

    return this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    });
  }

  async deleteCurrentUser(): Promise<void> {
    const user = await this.findCurrentUser();
    await this.prisma.user.delete({ where: { id: user.id } });
  }

  private async ensureEmailIsAvailable(
    email: string,
    excludeUserId?: string,
  ): Promise<void> {
    const existing = await this.prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        ...(excludeUserId ? { id: { not: excludeUserId } } : {}),
      },
    });

    if (existing) {
      throw new ConflictException(`User with email ${email} already exists`);
    }
  }
}
