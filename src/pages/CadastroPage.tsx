import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthLayout from '../components/layout/AuthLayout'
import { AuthService } from '../features/auth/AuthService'
import { salvarPerfil } from '../features/auth/sessao'
import { cadastroSchema } from '../features/auth/schemas'
import type { CadastroFormData } from '../features/auth/schemas'
import { aplicarErrosDeCampo, mensagemDeErro } from '../utils/problemDetails'

function CadastroPage() {
  const navigate = useNavigate()
  const [erroApi, setErroApi] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({ resolver: zodResolver(cadastroSchema) })

  async function onSubmit(dados: CadastroFormData) {
    setErroApi(null)
    try {
      const usuario = await AuthService.cadastro(dados)
      salvarPerfil(usuario.id, {
        nome: usuario.nome,
        email: usuario.email,
        cpfMascarado: usuario.cpfMascarado,
      })
      navigate('/login', { replace: true, state: { cadastroRealizado: true } })
    } catch (error) {
      if (!aplicarErrosDeCampo(error, ['nome', 'cpf', 'email', 'senha'], setError)) {
        setErroApi(mensagemDeErro(error))
      }
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Criar conta</h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
        {erroApi && (
          <p role="alert" className="mb-2 rounded-md border-2 border-red-700 bg-red-50 p-3 text-lg font-medium text-red-800">
            {erroApi}
          </p>
        )}

        <Input label="Nome completo" autoComplete="name" error={errors.nome?.message} {...register('nome')} />
        <Input
          label="CPF"
          inputMode="numeric"
          placeholder="000.000.000-00"
          error={errors.cpf?.message}
          {...register('cpf')}
        />
        <Input
          label="E-mail"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="new-password"
          error={errors.senha?.message}
          {...register('senha')}
        />

        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-lg text-gray-900">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-blue-700 underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}

export default CadastroPage
