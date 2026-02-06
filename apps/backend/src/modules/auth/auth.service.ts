import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';

import { User } from '../../models';
import { AuditService } from '../audit/audit.service';
import { LoginDto, RefreshTokenDto } from './schemas';
import { JWTPayload, AuthResponse, AuditAction, UserStatus } from '@jurix/shared-types';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async login(
    loginDto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Buscar usuário
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verificar status
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Validar senha
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Gerar tokens
    const tokens = await this.generateTokens(user);

    // Salvar refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    // Registrar log de auditoria
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'AUTH',
      entityId: null,
      ipAddress,
      userAgent,
    });

    return {
      ...tokens,
      user: user.toPublic(),
    };
  }

  async refreshToken(
    refreshTokenDto: RefreshTokenDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    // Verificar refresh token
    let payload: JWTPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado');
    }

    // Buscar usuário
    const user = await this.userModel.findByPk(payload.sub);

    if (!user || user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Usuário inativo');
    }

    // Gerar novos tokens
    const tokens = await this.generateTokens(user);

    // Atualizar refresh token
    await user.update({ refreshToken: tokens.refreshToken });

    return {
      ...tokens,
      user: user.toPublic(),
    };
  }

  async logout(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Invalidar refresh token
    await user.update({ refreshToken: null });

    // Registrar log de auditoria
    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGOUT,
      entityType: 'AUTH',
      entityId: null,
      ipAddress,
      userAgent,
    });
  }

  async validateUser(payload: JWTPayload): Promise<User | null> {
    const user = await this.userModel.findByPk(payload.sub);

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  private async generateTokens(user: User): Promise<Omit<AuthResponse, 'user'>> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresIn = this.getExpiresInSeconds(
      this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private getExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // default 15min

    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 60 * 60 * 24;
      default:
        return 900;
    }
  }
}
