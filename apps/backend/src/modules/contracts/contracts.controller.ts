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
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';

import { ContractsService } from './contracts.service';
import {
  createContractSchema,
  CreateContractDto,
  updateContractSchema,
  UpdateContractDto,
  rejectContractSchema,
  RejectContractDto,
  queryContractsSchema,
  QueryContractsDto,
} from './schemas';
import { ZodValidationPipe } from '../../common/pipes';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser, Roles } from '../auth/decorators';
import { Contract, ContractVersion, User } from '../../models';
import {
  UserRole,
  ContractStatus,
  ApiResponse,
  PaginatedResponse,
  ContractWithCreator,
} from '@jurix/shared-types';

@Controller('contracts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  @UsePipes(new ZodValidationPipe(createContractSchema))
  async create(
    @Body() createContractDto: CreateContractDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<Contract>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.contractsService.create(
      createContractDto,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Contrato criado com sucesso',
    };
  }

  @Get()
  @UsePipes(new ZodValidationPipe(queryContractsSchema))
  async findAll(
    @CurrentUser() user: User,
    @Query() query: QueryContractsDto,
  ): Promise<PaginatedResponse<ContractWithCreator>> {
    return this.contractsService.findAll(query, user);
  }

  @Get(':id')
  async findById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<Contract>> {
    const data = await this.contractsService.findById(id, user);

    return {
      success: true,
      data,
    };
  }

  @Put(':id')
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  @UsePipes(new ZodValidationPipe(updateContractSchema))
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateContractDto: UpdateContractDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<Contract>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.contractsService.update(
      id,
      updateContractDto,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Contrato atualizado com sucesso',
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<null>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    await this.contractsService.delete(id, user, ipAddress, userAgent);

    return {
      success: true,
      data: null,
      message: 'Contrato excluído com sucesso',
    };
  }

  @Post(':id/submit')
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<Contract>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.contractsService.submit(
      id,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Contrato enviado para revisão',
    };
  }

  @Post(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<Contract>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.contractsService.approve(
      id,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Contrato aprovado com sucesso',
    };
  }

  @Post(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  @UsePipes(new ZodValidationPipe(rejectContractSchema))
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() rejectDto: RejectContractDto,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<Contract>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.contractsService.reject(
      id,
      rejectDto,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Contrato rejeitado',
    };
  }

  @Post(':id/return-to-draft')
  @Roles(UserRole.ADMIN, UserRole.LEGAL)
  async returnToDraft(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<Contract>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.contractsService.returnToDraft(
      id,
      user,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
      message: 'Contrato retornado para edição',
    };
  }

  @Get(':id/versions')
  async getVersions(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ): Promise<ApiResponse<ContractVersion[]>> {
    const data = await this.contractsService.getVersions(id, user);

    return {
      success: true,
      data,
    };
  }
}
