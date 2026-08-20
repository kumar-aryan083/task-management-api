import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<User> {
    await this.ensureEmailIsAvailable(dto.email);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
      },
    });
    this.logger.log(`Created user id=${user.id}`);

    return user;
  }

  async findCurrentUser(): Promise<User> {
    const user = await this.prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!user) {
      this.logger.warn('findCurrentUser: no current user exists');
      throw new NotFoundException('Current user not found');
    }

    return user;
  }

  async updateCurrentUser(dto: UpdateUserDto): Promise<User> {
    const user = await this.findCurrentUser();

    if (dto.email && dto.email.toLowerCase() !== user.email.toLowerCase()) {
      await this.ensureEmailIsAvailable(dto.email, user.id);
    }

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: dto,
    });
    this.logger.log(`Updated user id=${updated.id}`);

    return updated;
  }

  async deleteCurrentUser(): Promise<void> {
    const user = await this.findCurrentUser();
    await this.prisma.user.delete({ where: { id: user.id } });
    this.logger.log(`Deleted user id=${user.id}`);
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
      this.logger.warn(`Rejected duplicate email for user id=${existing.id}`);
      throw new ConflictException(`User with email ${email} already exists`);
    }
  }
}
