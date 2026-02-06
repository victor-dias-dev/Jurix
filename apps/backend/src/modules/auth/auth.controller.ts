import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthService } from './auth.service';
import { loginSchema, LoginDto, refreshTokenSchema, RefreshTokenDto } from './schemas';
import { ZodValidationPipe } from '../../common/pipes';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../../models';
import { ApiResponse, AuthResponse } from '@jurix/shared-types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(loginSchema))
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
  ): Promise<ApiResponse<AuthResponse>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.authService.login(loginDto, ipAddress, userAgent);

    return {
      success: true,
      data,
      message: 'Login realizado com sucesso',
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(refreshTokenSchema))
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<ApiResponse<AuthResponse>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    const data = await this.authService.refreshToken(
      refreshTokenDto,
      ipAddress,
      userAgent,
    );

    return {
      success: true,
      data,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: User,
    @Req() req: Request,
  ): Promise<ApiResponse<null>> {
    const ipAddress = req.ip ?? req.socket.remoteAddress;
    const userAgent = req.get('user-agent');

    await this.authService.logout(user.id, ipAddress, userAgent);

    return {
      success: true,
      data: null,
      message: 'Logout realizado com sucesso',
    };
  }
}
