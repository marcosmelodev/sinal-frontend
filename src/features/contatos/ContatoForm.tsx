import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { aplicarErrosDeCampo } from '../../utils/problemDetails'
import { contatoSchema } from './schemas'
import type { ContatoFormData } from './schemas'

interface ContatoFormProps {
  titulo: string
  textoBotao: string
  valoresIniciais?: ContatoFormData
  /** Erro bruto da última operação do hook, usado para exibir erros de campo da API */
  problema: unknown
  /** Deve resolver true em caso de sucesso */
  onSubmit: (dados: ContatoFormData) => Promise<boolean>
  onCancel: () => void
}

function ContatoForm({
  titulo,
  textoBotao,
  valoresIniciais,
  problema,
  onSubmit,
  onCancel,
}: ContatoFormProps) {
  const [enviou, setEnviou] = useState(false)
  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<ContatoFormData>({
    resolver: zodResolver(contatoSchema),
    defaultValues: valoresIniciais ?? { nome: '', telefone: '' },
  })

  useEffect(() => {
    setFocus('nome')
  }, [setFocus])

  // Só aplica erros da API que vieram de um envio deste formulário
  useEffect(() => {
    if (enviou && problema) aplicarErrosDeCampo(problema, ['nome', 'telefone'], setError)
  }, [enviou, problema, setError])

  function enviar(dados: ContatoFormData) {
    setEnviou(true)
    return onSubmit(dados)
  }

  return (
    <form
      onSubmit={handleSubmit(enviar)}
      noValidate
      aria-label={titulo}
      className="flex flex-col gap-1 rounded-xl border-2 border-primario bg-slate-50 p-4"
    >
      <h2 className="mb-2 text-lg font-bold">{titulo}</h2>
      <Input label="Nome" autoComplete="off" error={errors.nome?.message} {...register('nome')} />
      <Input
        label="Telefone"
        type="tel"
        inputMode="tel"
        autoComplete="off"
        placeholder="(00) 00000-0000"
        error={errors.telefone?.message}
        {...register('telefone')}
      />
      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Salvando...' : textoBotao}
      </Button>
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

export default ContatoForm
