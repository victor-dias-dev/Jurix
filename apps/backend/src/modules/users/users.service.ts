import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, WhereOptions } from 'sequelize';

import { User } from '../../models';
import { AuditService } from '../audit/audit.service';
import { CreateUserDto, UpdateUserDto } from './schemas';
import {
  UserRole,
  UserStatus,
  AuditAction,
  EntityType,
  PaginatedResponse,
  UserPublic,
} from '@jurix/shared-types';

interface FindAllOptions {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createUserDto: CreateUserDto,
    createdBy: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserPublic> {
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const user = await this.userModel.create({
      email: createUserDto.email,
      password: createUserDto.password,
      name: createUserDto.name,
      role: createUserDto.role,
      status: UserStatus.ACTIVE,
    });

    await this.auditService.log({
      userId: createdBy.id,
      action: AuditAction.USER_CREATED,
      entityType: EntityType.USER,
      entityId: user.id,
      metadata: {
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ipAddress,
      userAgent,
    });

    return user.toPublic();
  }

  async findAll(options: FindAllOptions): Promise<PaginatedResponse<UserPublic>> {
    const page = options.page ?? 1;
    const limit = options.limit ?? 20;
    const offset = (page - 1) * limit;

    const where: WhereOptions<User> = {};

    if (options.search) {
      (where as Record<string, unknown>)[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${options.search}%` } },
        { email: { [Op.iLike]: `%${options.search}%` } },
      ];
    }

    if (options.role) {
      where.role = options.role;
    }

    if (options.status) {
      where.status = options.status;
    }

    const { count, rows } = await this.userModel.findAndCountAll({
      where,
      attributes: ['id', 'email', 'name', 'role', 'status'],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    return {
      success: true,
      data: rows.map((u) => u.toPublic()),
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    updatedBy: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<UserPublic> {
    const user = await this.findById(id);

    if (
      updateUserDto.role &&
      updatedBy.id === user.id &&
      updatedBy.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException('Você não pode alterar seu próprio perfil');
    }

    await user.update(updateUserDto);

    await this.auditService.log({
      userId: updatedBy.id,
      action: AuditAction.USER_UPDATED,
      entityType: EntityType.USER,
      entityId: user.id,
      metadata: {
        changes: updateUserDto,
      },
      ipAddress,
      userAgent,
    });

    return user.toPublic();
  }

  async deactivate(
    id: string,
    deactivatedBy: User,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.findById(id);

    if (user.id === deactivatedBy.id) {
      throw new ForbiddenException('Você não pode desativar sua própria conta');
    }

    await user.update({ status: UserStatus.INACTIVE, refreshToken: null });

    await this.auditService.log({
      userId: deactivatedBy.id,
      action: AuditAction.USER_DEACTIVATED,
      entityType: EntityType.USER,
      entityId: user.id,
      ipAddress,
      userAgent,
    });
  }
}
