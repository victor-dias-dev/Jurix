import { UserRole } from '../enums/index.js';

/**
 * Payload do token JWT
 */
export interface JWTPayload {
  sub: string; // userId
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Dados para login
 */
export interface LoginDTO {
  email: string;
  password: string;
}

/**
 * Resposta de autenticação
 */
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

/**
 * Dados para refresh token
 */
export interface RefreshTokenDTO {
  refreshToken: string;
}

/**
 * Dados para SSO (simulação)
 */
export interface SSOLoginDTO {
  provider: 'azure' | 'okta';
  token: string;
}

