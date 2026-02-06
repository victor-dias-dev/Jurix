import { z } from 'zod';
import { UserRole, UserStatus } from '@jurix/shared-types';

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres')
    .optional(),
  role: z.nativeEnum(UserRole, { 
    invalid_type_error: 'Perfil inválido' 
  }).optional(),
  status: z.nativeEnum(UserStatus, { 
    invalid_type_error: 'Status inválido' 
  }).optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;

