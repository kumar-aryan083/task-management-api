import { Body, Controller, Delete, Get, Patch, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '@prisma/client';
import {
  ErrorResponseDto,
  ValidationErrorResponseDto,
} from '../common/dto/error-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

const CURRENT_USER_CAVEAT =
  'No authentication yet: resolves to the most recently created user.';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a user account' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid or missing fields.',
    type: ValidationErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'A user with this email already exists.',
    type: ErrorResponseDto,
  })
  create(@Body() dto: CreateUserDto): Promise<User> {
    return this.usersService.create(dto);
  }

  @Get('me')
  @ApiOperation({
    summary: `Get the current user's profile. ${CURRENT_USER_CAVEAT}`,
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiNotFoundResponse({
    description: 'No user exists yet.',
    type: ErrorResponseDto,
  })
  findCurrentUser(): Promise<User> {
    return this.usersService.findCurrentUser();
  }

  @Patch('me')
  @ApiOperation({
    summary: `Update the current user's profile. ${CURRENT_USER_CAVEAT}`,
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid fields.',
    type: ValidationErrorResponseDto,
  })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  @ApiConflictResponse({
    description: 'The new email already belongs to another user.',
    type: ErrorResponseDto,
  })
  updateCurrentUser(@Body() dto: UpdateUserDto): Promise<User> {
    return this.usersService.updateCurrentUser(dto);
  }

  @Delete('me')
  @ApiOperation({
    summary: `Delete the current user's account. ${CURRENT_USER_CAVEAT}`,
  })
  @ApiOkResponse({ description: 'Deleted. Empty body.' })
  @ApiNotFoundResponse({ type: ErrorResponseDto })
  deleteCurrentUser(): Promise<void> {
    return this.usersService.deleteCurrentUser();
  }
}
