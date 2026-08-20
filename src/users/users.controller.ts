import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  @Get('me')
  findCurrentUser(): Promise<User> {
    return this.usersService.findCurrentUser();
  }

  @Patch('me')
  updateCurrentUser(@Body() dto: UpdateUserDto): Promise<User> {
    return this.usersService.updateCurrentUser(dto);
  }

  @Delete('me')
  deleteCurrentUser(): Promise<void> {
    return this.usersService.deleteCurrentUser();
  }
}
