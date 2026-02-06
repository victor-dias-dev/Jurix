import { z } from 'zod';
import { ContractStatus } from '@jurix/shared-types';

export const queryContractsSchema = z.object({
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
  
  status: z
    .nativeEnum(ContractStatus)
    .optional(),
  
  createdById: z
    .string()
    .uuid('ID do criador inválido')
    .optional(),
  
  search: z
    .string()
    .min(1, 'Busca deve ter pelo menos 1 caractere')
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .optional(),
  
  sortBy: z
    .enum(['title', 'createdAt', 'updatedAt', 'status'], {
      errorMap: () => ({ message: 'Campo de ordenação inválido' }),
    })
    .optional()
    .default('createdAt'),
  
  sortOrder: z
    .enum(['asc', 'desc'], {
      errorMap: () => ({ message: 'Direção de ordenação inválida' }),
    })
    .optional()
    .default('desc'),
});

export type QueryContractsDto = z.infer<typeof queryContractsSchema>;

