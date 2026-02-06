import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  ParseUUIDPipe,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';

import { UsersService } from './users.service';
import { createUserSchema, CreateUserDto, updateUserSchema, UpdateUserDto } from './schemas';
import { ZodValidationPipe } from '../../common/pipes';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser, Roles } from '../auth/decorators';
import { User } from '../../models';
import {
  UserRole,
  UserStatus,
  ApiResponse,
  PaginatedResponse,
  UserPublic,
} from '@jurix/shared-types';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<UserPublic>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.usersService.create(
      createUserDto,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Usuário criado com sucesso',
    };
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
    @Query('status') status?: UserStatus,
  ): Promise<PaginatedResponse<UserPublic>> {
    return this.usersService.findAll({
      page,
      limit,
      search,
      role,
      status,
    });
  }

  @Get('me')
  async getMe(@CurrentUser() user: User): Promise<ApiResponse<UserPublic>> {
    return {
      success: true,
      data: user.toPublic(),
    };
  }

  @Get(':id')
  @Roles(UserRole.ADMIN)
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ApiResponse<UserPublic>> {
    const user = await this.usersService.findById(id);

    return {
      success: true,
      data: user.toPublic(),
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN)
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<UserPublic>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.usersService.update(
      id,
      updateUserDto,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Usuário atualizado com sucesso',
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async deactivate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<null>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    await this.usersService.deactivate(id, user, ipAddress, userAgent);

    return {
      success: true,
      data: null,
      message: 'Usuário desativado com sucesso',
    };
  }
}
