import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import AuthLayout from '../components/layout/AuthLayout'
import { AuthService } from '../features/auth/AuthService'
import { iniciarSessao } from '../features/auth/sessao'
import { loginSchema } from '../features/auth/schemas'
import type { LoginFormData } from '../features/auth/schemas'
import { aplicarErrosDeCampo, mensagemDeErro } from '../utils/problemDetails'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cadastroRealizado = (location.state as { cadastroRealizado?: boolean } | null)
    ?.cadastroRealizado
  const [erroApi, setErroApi] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(dados: LoginFormData) {
    setErroApi(null)
    try {
      const { accessToken } = await AuthService.login(dados)
      iniciarSessao(accessToken, dados.identificador)
      navigate('/', { replace: true })
    } catch (error) {
      if (!aplicarErrosDeCampo(error, ['identificador', 'senha'], setError)) {
        setErroApi(mensagemDeErro(error))
      }
    }
  }

  return (
    <AuthLayout>
      <h1 className="mb-6 text-3xl font-bold text-gray-900">Entrar</h1>

      {cadastroRealizado && !erroApi && (
        <p role="status" className="mb-4 rounded-md border-2 border-green-700 bg-green-50 p-3 text-lg text-green-900">
          Conta criada com sucesso! Faça login.
        </p>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-2">
        {erroApi && (
          <p role="alert" className="mb-2 rounded-md border-2 border-red-700 bg-red-50 p-3 text-lg font-medium text-red-800">
            {erroApi}
          </p>
        )}

        <Input
          label="CPF ou e-mail"
          autoComplete="username"
          error={errors.identificador?.message}
          {...register('identificador')}
        />
        <Input
          label="Senha"
          type="password"
          autoComplete="current-password"
          error={errors.senha?.message}
          {...register('senha')}
        />

        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <p className="mt-6 text-center text-lg text-gray-900">
        Não tem conta?{' '}
        <Link to="/cadastro" className="font-semibold text-blue-700 underline">
          Cadastre-se
        </Link>
      </p>
    </AuthLayout>
  )
}

export default LoginPage
