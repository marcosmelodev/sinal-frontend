import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, Pencil } from 'lucide-react'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import LinhaResumo from '../../components/chamados/LinhaResumo'
import type { PerfilUsuario } from '../auth/sessao'
import { meusDadosSchema } from './schemas'
import type { MeusDadosFormData } from './schemas'

interface MeusDadosSectionProps {
  perfil: PerfilUsuario | null
  onSalvar: (dados: MeusDadosFormData) => void
}

function MeusDadosForm({ perfil, onSalvar, onCancel }: MeusDadosSectionProps & { onCancel: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MeusDadosFormData>({
    resolver: zodResolver(meusDadosSchema),
    defaultValues: { nome: perfil?.nome ?? '', email: perfil?.email ?? '' },
  })

  return (
    <form onSubmit={handleSubmit(onSalvar)} noValidate aria-label="Editar meus dados" className="flex flex-col gap-1">
      <Input label="Nome" autoComplete="name" error={errors.nome?.message} {...register('nome')} />
      <Input
        label="E-mail"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Button type="submit">Salvar dados</Button>
      <button
        type="button"
        onClick={onCancel}
        className="mt-1 min-h-12 rounded-md font-semibold text-slate-600 underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
      >
        Cancelar
      </button>
    </form>
  )
}

function MeusDadosSection({ perfil, onSalvar }: MeusDadosSectionProps) {
  const [editando, setEditando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  function handleSalvar(dados: MeusDadosFormData) {
    onSalvar(dados)
    setEditando(false)
    setSalvo(true)
  }

  return (
    <section aria-labelledby="meus-dados-titulo" className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 id="meus-dados-titulo" className="text-lg font-bold">
          Meus Dados
        </h2>
        {!editando && (
          <button
            type="button"
            onClick={() => {
              setSalvo(false)
              setEditando(true)
            }}
            className="flex min-h-11 items-center gap-1 rounded-lg px-2 font-semibold text-primario focus:outline-none focus-visible:ring-2 focus-visible:ring-primario"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Editar
          </button>
        )}
      </div>

      {editando ? (
        <MeusDadosForm perfil={perfil} onSalvar={handleSalvar} onCancel={() => setEditando(false)} />
      ) : (
        <dl>
          <LinhaResumo rotulo="Nome" valor={perfil?.nome || 'Não informado'} />
          <LinhaResumo rotulo="E-mail" valor={perfil?.email || 'Não informado'} />
          <LinhaResumo rotulo="CPF" valor={perfil?.cpfMascarado || 'Não informado'} />
        </dl>
      )}

      <div role="status">
        {salvo && (
          <p className="flex items-center gap-2 rounded-xl border-2 border-sucesso bg-white p-3">
            <Check aria-hidden="true" className="h-5 w-5 flex-none text-sucesso" />
            Dados atualizados neste aparelho.
          </p>
        )}
      </div>
      {/* Não há endpoint de atualização de usuário no back-end (../sinal) */}
      <p className="text-sm text-slate-600">
        No protótipo, as alterações ficam salvas apenas neste aparelho.
      </p>
    </section>
  )
}

export default MeusDadosSection
