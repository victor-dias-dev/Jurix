import { z } from 'zod';
import { AuditAction, EntityType } from '@jurix/shared-types';

export const queryAuditSchema = z.object({
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

  userId: z
    .string()
    .uuid('ID do usuário inválido')
    .optional(),

  action: z.nativeEnum(AuditAction).optional(),

  entityType: z.nativeEnum(EntityType).optional(),

  entityId: z
    .string()
    .uuid('ID da entidade inválido')
    .optional(),

  startDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .pipe(z.date().optional()),

  endDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .pipe(z.date().optional()),
});

export type QueryAuditDto = z.infer<typeof queryAuditSchema>;

export const queryAuditByEntitySchema = z.object({
  entityType: z.nativeEnum(EntityType, {
    errorMap: () => ({ message: 'Tipo de entidade inválido' }),
  }),

  entityId: z
    .string()
    .uuid('ID da entidade inválido'),
});

export type QueryAuditByEntityDto = z.infer<typeof queryAuditByEntitySchema>;

