import { z } from 'zod';
import { ContractStatus } from '../models/contract.model';

export const createContractSchema = z.object({
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres').max(500),
  content: z.string().min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
});

export const updateContractSchema = z.object({
  title: z.string().min(3).max(500).optional(),
  content: z.string().min(10).optional(),
});

export const rejectContractSchema = z.object({
  reason: z.string().min(10, 'Justificativa deve ter no mínimo 10 caracteres'),
});

export const contractFiltersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  status: z.nativeEnum(ContractStatus).optional(),
  createdById: z.string().uuid().optional(),
  search: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type RejectContractInput = z.infer<typeof rejectContractSchema>;
export type ContractFiltersInput = z.infer<typeof contractFiltersSchema>;

