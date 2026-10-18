import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronDown, KeyRound } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { alterarSenhaSchema } from './schemas'
import type { AlterarSenhaFormData } from './schemas'

const FORM_ID = 'alterar-senha-form'

/**
 * Não há endpoint de troca de senha no back-end (../sinal): os campos são validados
 * com Zod e o sucesso é apenas simulado, deixando isso explícito para o usuário.
 */
function AlterarSenhaSection() {
  const [aberto, setAberto] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AlterarSenhaFormData>({ resolver: zodResolver(alterarSenhaSchema) })

  function onSubmit() {
    reset()
    setAberto(false)
    setSucesso(true)
  }

  return (
    <section className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <h2>
        <button
          type="button"
          aria-expanded={aberto}
          aria-controls={FORM_ID}
          onClick={() => {
            setSucesso(false)
            setAberto((v) => !v)
          }}
          className="flex min-h-12 w-full items-center gap-2 rounded-lg text-left text-lg font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
        >
          <KeyRound aria-hidden="true" className="h-5 w-5 flex-none text-primario" />
          Alterar senha
          <ChevronDown
            aria-hidden="true"
            className={`ml-auto h-5 w-5 transition-transform motion-reduce:transition-none ${aberto ? 'rotate-180' : ''}`}
          />
        </button>
      </h2>

      {aberto && (
        <form id={FORM_ID} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-1">
          <Input
            label="Senha atual"
            type="password"
            autoComplete="current-password"
            error={errors.senhaAtual?.message}
            {...register('senhaAtual')}
          />
          <Input
            label="Nova senha"
            type="password"
            autoComplete="new-password"
            error={errors.novaSenha?.message}
            {...register('novaSenha')}
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            autoComplete="new-password"
            error={errors.confirmarSenha?.message}
            {...register('confirmarSenha')}
          />
          <Button type="submit">Salvar nova senha</Button>
        </form>
      )}

      <div role="status">
        {sucesso && (
          <p className="flex items-start gap-2 rounded-xl border-2 border-sucesso bg-white p-3">
            <Check aria-hidden="true" className="mt-0.5 h-5 w-5 flex-none text-sucesso" />
            <span>
              <b className="block">Senha validada com sucesso (simulação).</b>
              Protótipo acadêmico: a senha ainda não é alterada no servidor. Continue usando a senha
              atual para entrar.
            </span>
          </p>
        )}
      </div>
    </section>
  )
}

export default AlterarSenhaSection
