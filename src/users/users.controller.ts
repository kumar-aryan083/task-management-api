import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import type { User } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto): User {
    return this.usersService.create(dto);
  }

  @Get('me')
  findCurrentUser(): User {
    return this.usersService.findCurrentUser();
  }

  @Patch('me')
  updateCurrentUser(@Body() dto: UpdateUserDto): User {
    return this.usersService.updateCurrentUser(dto);
  }

  @Delete('me')
  deleteCurrentUser(): void {
    this.usersService.deleteCurrentUser();
  }
}
