import { ACCESS_TOKEN_KEY } from '../../api/axiosClient'

/**
 * Dados do usuário conhecidos pelo front. O back-end não tem endpoint de perfil:
 * só o cadastro devolve nome/e-mail/CPF mascarado e o JWT traz apenas o id (`sub`).
 * Por isso os perfis ficam salvos por id, neste aparelho.
 */
export interface PerfilUsuario {
  nome?: string
  email?: string
  /** Formato do back-end: `***.456.789-**` */
  cpfMascarado?: string
}

const PERFIS_KEY = '@Sinal:perfis'

function lerPerfis(): Record<string, PerfilUsuario> {
  try {
    return JSON.parse(localStorage.getItem(PERFIS_KEY) ?? '{}') as Record<string, PerfilUsuario>
  } catch {
    return {}
  }
}

function gravarPerfis(perfis: Record<string, PerfilUsuario>) {
  try {
    localStorage.setItem(PERFIS_KEY, JSON.stringify(perfis))
  } catch {
    // Armazenamento indisponível (ex.: modo privado): o perfil apenas não persiste
  }
}

/** Lê o `sub` (id do usuário) do JWT. Só para exibição: a validação é feita pelo back-end. */
function usuarioIdDoToken(token: string): string | null {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const { sub } = JSON.parse(atob(payload)) as { sub?: unknown }
    return sub === undefined ? null : String(sub)
  } catch {
    return null
  }
}

function usuarioIdAtual(): string | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY)
  return token ? usuarioIdDoToken(token) : null
}

/** Mesmo formato de máscara usado pelo back-end (`UsuarioCadastrado.mascarar`) */
export function mascararCpf(cpf: string): string | undefined {
  const digitos = cpf.replace(/\D/g, '')
  if (digitos.length !== 11) return undefined
  return `***.${digitos.slice(3, 6)}.${digitos.slice(6, 9)}-**`
}

export function salvarPerfil(usuarioId: number | string, perfil: PerfilUsuario) {
  const perfis = lerPerfis()
  perfis[String(usuarioId)] = { ...perfis[String(usuarioId)], ...perfil }
  gravarPerfis(perfis)
}

export function getPerfilAtual(): PerfilUsuario | null {
  const id = usuarioIdAtual()
  return id ? (lerPerfis()[id] ?? null) : null
}

export function atualizarPerfilAtual(dados: PerfilUsuario) {
  const id = usuarioIdAtual()
  if (id) salvarPerfil(id, dados)
}

export function primeiroNome(perfil: PerfilUsuario | null): string | undefined {
  return perfil?.nome?.trim().split(/\s+/)[0] || undefined
}

/**
 * Salva o token e, se este aparelho ainda não conhece o usuário (ex.: conta criada
 * em outro dispositivo), guarda o que se sabe pelo identificador usado no login.
 */
export function iniciarSessao(accessToken: string, identificador: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  const id = usuarioIdDoToken(accessToken)
  if (!id || lerPerfis()[id]) return

  const valor = identificador.trim()
  salvarPerfil(id, valor.includes('@') ? { email: valor } : { cpfMascarado: mascararCpf(valor) })
}

/** Encerra a sessão. Os perfis ficam para preencher a tela na próxima entrada. */
export function encerrarSessao() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}
