import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserRole, UserStatus } from '@jurix/shared-types';

import { AuthService, hashRefreshToken } from './auth.service';
import { RefreshToken, User } from '../../models';
import { AuditService } from '../audit/audit.service';

describe('AuthService', () => {
  const refreshRaw = 'refresh-token-raw';
  let service: AuthService;
  let userModel: { findOne: jest.Mock; findByPk: jest.Mock };
  let refreshTokenModel: { create: jest.Mock; findOne: jest.Mock; update: jest.Mock };
  let jwtService: { sign: jest.Mock; verify: jest.Mock; decode: jest.Mock };
  let auditService: { log: jest.Mock };
  let passwordHash: string;

  const publicUser = {
    id: 'user-1',
    email: 'legal@jurix.com',
    name: 'Legal',
    role: UserRole.LEGAL,
    status: UserStatus.ACTIVE,
  };

  function buildUser(status: UserStatus = UserStatus.ACTIVE) {
    return {
      id: 'user-1',
      email: 'legal@jurix.com',
      password: passwordHash,
      role: UserRole.LEGAL,
      status,
      toPublic: () => ({ ...publicUser, status }),
    };
  }

  beforeAll(async () => {
    passwordHash = await bcrypt.hash('Legal@123', 4);
  });

  beforeEach(() => {
    userModel = {
      findOne: jest.fn(),
      findByPk: jest.fn(),
    };
    refreshTokenModel = {
      create: jest.fn().mockResolvedValue({ id: 'rt-1' }),
      findOne: jest.fn(),
      update: jest.fn().mockResolvedValue([1]),
    };
    jwtService = {
      sign: jest.fn((_payload, options?: { secret?: string }) =>
        options?.secret ? refreshRaw : 'access-token-raw',
      ),
      verify: jest.fn(),
      decode: jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 }),
    };
    auditService = { log: jest.fn().mockResolvedValue({}) };

    const configService = {
      get: jest.fn((key: string) => {
        const values: Record<string, string> = {
          JWT_SECRET: 'test-secret',
          JWT_REFRESH_SECRET: 'test-refresh-secret',
          JWT_EXPIRES_IN: '15m',
          JWT_REFRESH_EXPIRES_IN: '7d',
        };
        return values[key];
      }),
    };

    service = new AuthService(
      userModel as unknown as typeof User,
      refreshTokenModel as unknown as typeof RefreshToken,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
      auditService as unknown as AuditService,
    );
  });

  it('stores only the hash of the refresh token', async () => {
    userModel.findOne.mockResolvedValue(buildUser());

    const result = await service.login({ email: 'legal@jurix.com', password: 'Legal@123' });

    expect(result.refreshToken).toBe(refreshRaw);
    expect(refreshTokenModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        tokenHash: hashRefreshToken(refreshRaw),
        isRevoked: false,
      }),
    );
    expect(hashRefreshToken(refreshRaw)).not.toBe(refreshRaw);
  });

  it.each([
    ['missing user', null, 'wrong-password'],
    ['wrong password', 'active', 'nope'],
    ['inactive user', 'inactive', 'Legal@123'],
  ])('returns the same message for %s', async (_label, kind, password) => {
    if (kind === 'active') {
      userModel.findOne.mockResolvedValue(buildUser());
    } else if (kind === 'inactive') {
      userModel.findOne.mockResolvedValue(buildUser(UserStatus.INACTIVE));
    } else {
      userModel.findOne.mockResolvedValue(null);
    }

    await expect(
      service.login({ email: 'legal@jurix.com', password }),
    ).rejects.toThrow(new UnauthorizedException('Credenciais inválidas'));
    expect(refreshTokenModel.create).not.toHaveBeenCalled();
  });

  it('rejects a revoked refresh token', async () => {
    jwtService.verify.mockReturnValue({ sub: 'user-1', email: 'legal@jurix.com', role: UserRole.LEGAL });
    refreshTokenModel.findOne.mockResolvedValue({
      isRevoked: true,
      userId: 'user-1',
      expiresAt: new Date(Date.now() + 60_000),
    });

    await expect(service.refreshToken({ refreshToken: refreshRaw })).rejects.toThrow(
      new UnauthorizedException('Refresh token inválido ou expirado'),
    );
    expect(refreshTokenModel.create).not.toHaveBeenCalled();
  });
});
