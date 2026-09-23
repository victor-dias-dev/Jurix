import { createHash } from 'crypto';
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcryptjs';

import { RefreshToken, User } from '../../models';
import { AuditService } from '../audit/audit.service';
import { LoginDto, RefreshTokenDto } from './schemas';
import { JWTPayload, AuthResponse, AuditAction, EntityType, UserStatus } from '@jurix/shared-types';

const INVALID_CREDENTIALS = 'Credenciais inválidas';
const INVALID_REFRESH = 'Refresh token inválido ou expirado';

// Hash of a password that is never assigned to a user. Compared when the
// account does not exist so the response time stays close to a real check.
const DUMMY_PASSWORD_HASH = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(RefreshToken)
    private readonly refreshTokenModel: typeof RefreshToken,
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

    const user = await this.userModel.findOne({
      where: { email },
    });

    const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
    const isPasswordValid = await bcrypt.compare(password, passwordHash);

    if (!user || user.status !== UserStatus.ACTIVE || !isPasswordValid) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    const tokens = await this.generateTokens(user);
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGIN,
      entityType: EntityType.AUTH,
      entityId: null,
      ipAddress,
      userAgent,
    });

    return {
      ...tokens,
      user: user.toPublic(),
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    let payload: JWTPayload;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.requireConfig('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(INVALID_REFRESH);
    }

    const stored = await this.refreshTokenModel.findOne({
      where: { tokenHash: hashRefreshToken(refreshToken) },
    });

    if (!stored || stored.isRevoked || stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(INVALID_REFRESH);
    }

    const user = await this.userModel.findByPk(payload.sub);

    if (!user || user.id !== stored.userId || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(INVALID_REFRESH);
    }

    const tokens = await this.generateTokens(user);

    await stored.update({ isRevoked: true });
    await this.storeRefreshToken(user.id, tokens.refreshToken);

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

    await this.revokeActiveTokens(user.id);

    await this.auditService.log({
      userId: user.id,
      action: AuditAction.LOGOUT,
      entityType: EntityType.AUTH,
      entityId: null,
      ipAddress,
      userAgent,
    });
  }

  async revokeActiveTokens(userId: string): Promise<void> {
    await this.refreshTokenModel.update(
      { isRevoked: true },
      { where: { userId, isRevoked: false } },
    );
  }

  async validateUser(payload: JWTPayload): Promise<User | null> {
    const user = await this.userModel.findByPk(payload.sub);

    if (!user || user.status !== UserStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.refreshTokenModel.create({
      userId,
      tokenHash: hashRefreshToken(refreshToken),
      expiresAt: this.getTokenExpiry(refreshToken),
      isRevoked: false,
    });
  }

  private async generateTokens(user: User): Promise<Omit<AuthResponse, 'user'>> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.requireConfig('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    });

    const expiresIn = this.getExpiresInSeconds(
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m',
    );

    return {
      accessToken,
      refreshToken,
      expiresIn,
    };
  }

  private getTokenExpiry(token: string): Date {
    const decoded = this.jwtService.decode(token) as { exp?: number } | null;

    if (!decoded?.exp) {
      throw new UnauthorizedException(INVALID_REFRESH);
    }

    return new Date(decoded.exp * 1000);
  }

  private requireConfig(key: string): string {
    const value = this.configService.get<string>(key);

    if (!value) {
      throw new Error(`${key} não configurado`);
    }

    return value;
  }

  private getExpiresInSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900;

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
