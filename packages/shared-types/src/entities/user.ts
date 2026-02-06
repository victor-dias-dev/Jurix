import { UserRole, UserStatus } from '../enums/index.js';

/**
 * Entidade Usuário
 * Representa uma pessoa autenticada no sistema
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Usuário sem dados sensíveis (para responses)
 */
export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

/**
 * Dados para criação de usuário
 */
export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

/**
 * Dados para atualização de usuário
 */
export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

