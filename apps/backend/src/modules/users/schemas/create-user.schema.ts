import { z } from 'zod';
import { UserRole } from '@jurix/shared-types';

export const createUserSchema = z.object({
  email: z
    .string({ required_error: 'Email é obrigatório' })
    .email('Email inválido')
    .max(255, 'Email deve ter no máximo 255 caracteres'),
  password: z
    .string({ required_error: 'Senha é obrigatória' })
    .min(6, 'Senha deve ter no mínimo 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  name: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  role: z.nativeEnum(UserRole, { 
    required_error: 'Perfil é obrigatório',
    invalid_type_error: 'Perfil inválido' 
  }),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

