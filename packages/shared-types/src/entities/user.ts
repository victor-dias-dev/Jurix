import { UserRole, UserStatus } from '../enums/index.js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}
