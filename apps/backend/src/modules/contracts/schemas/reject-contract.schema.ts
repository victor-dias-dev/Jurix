import { z } from 'zod';

export const rejectContractSchema = z.object({
  reason: z
    .string({ required_error: 'Motivo da rejeição é obrigatório' })
    .min(10, 'Motivo deve ter no mínimo 10 caracteres')
    .max(1000, 'Motivo deve ter no máximo 1000 caracteres'),
});

export type RejectContractDto = z.infer<typeof rejectContractSchema>;

