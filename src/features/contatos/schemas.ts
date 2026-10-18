import { z } from 'zod'

export const contatoSchema = z.object({
  nome: z.string().trim().min(1, 'Informe o nome do contato'),
  telefone: z
    .string()
    .trim()
    .min(1, 'Informe o telefone')
    .regex(/^[\d\s()+-]+$/, 'Use apenas números')
    .refine((v) => {
      const digitos = v.replace(/\D/g, '').length
      return digitos >= 10 && digitos <= 13
    }, 'Telefone inválido (inclua o DDD)'),
})

export type ContatoFormData = z.infer<typeof contatoSchema>
