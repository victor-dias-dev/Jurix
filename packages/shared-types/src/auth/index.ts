import { UserRole } from '../enums/index.js';

export interface JWTPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  };
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface SSOLoginDTO {
  provider: 'azure' | 'okta';
  token: string;
}
