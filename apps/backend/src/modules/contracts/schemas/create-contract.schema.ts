import { z } from 'zod';

export const createContractSchema = z.object({
  title: z
    .string({ required_error: 'Título é obrigatório' })
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(500, 'Título deve ter no máximo 500 caracteres'),
  content: z
    .string({ required_error: 'Conteúdo é obrigatório' })
    .min(10, 'Conteúdo deve ter no mínimo 10 caracteres'),
});

export type CreateContractDto = z.infer<typeof createContractSchema>;

