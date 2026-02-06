import { z } from 'zod';

export const updateContractSchema = z.object({
  title: z
    .string()
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(500, 'Título deve ter no máximo 500 caracteres')
    .optional(),
  content: z
    .string()
    .min(10, 'Conteúdo deve ter no mínimo 10 caracteres')
    .optional(),
});

export type UpdateContractDto = z.infer<typeof updateContractSchema>;

