import { z } from 'zod'

export const meusDadosSchema = z.object({
  nome: z.string().trim().min(1, 'Informe seu nome'),
  email: z.string().trim().min(1, 'Informe seu e-mail').email('E-mail inválido'),
})

export const alterarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Informe sua senha atual'),
    // Mesma regra do cadastro
    novaSenha: z.string().min(6, 'A nova senha deve ter no mínimo 6 caracteres'),
    confirmarSenha: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    path: ['confirmarSenha'],
    message: 'As senhas não coincidem',
  })
  .refine((d) => d.novaSenha !== d.senhaAtual, {
    path: ['novaSenha'],
    message: 'A nova senha deve ser diferente da atual',
  })

export type MeusDadosFormData = z.infer<typeof meusDadosSchema>
export type AlterarSenhaFormData = z.infer<typeof alterarSenhaSchema>
