import { z } from 'zod'

export const loginSchema = z.object({
  identificador: z.string().trim().min(1, 'Informe seu CPF ou e-mail'),
  senha: z.string().min(1, 'Informe sua senha'),
})

export const cadastroSchema = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome'),
  cpf: z
    .string()
    .trim()
    .min(1, 'Informe seu CPF')
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, 'CPF inválido (use 11 dígitos)'),
  email: z.string().trim().min(1, 'Informe seu e-mail').email('E-mail inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type CadastroFormData = z.infer<typeof cadastroSchema>
