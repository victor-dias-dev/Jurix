import { z } from 'zod';
import { UserRole, UserStatus } from '@jurix/shared-types';

export const queryUsersSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1).default(1)),

  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().min(1).max(100).default(10)),

  search: z
    .string()
    .min(1, 'Busca deve ter pelo menos 1 caractere')
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .optional(),

  role: z.nativeEnum(UserRole).optional(),

  status: z.nativeEnum(UserStatus).optional(),
});

export type QueryUsersDto = z.infer<typeof queryUsersSchema>;

