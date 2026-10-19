import type { Coordinates } from '../../services/LocationService'

export type CanalCompartilhamento = 'sms' | 'whatsapp' | 'telegram'

export const MENSAGEM_PADRAO = 'Preciso de ajuda!'

/** DDI do Brasil, adicionado aos números salvos sem código do país */
const DDI_BRASIL = '55'

export function apenasDigitos(telefone: string): string {
  return telefone.replace(/\D/g, '')
}

/** Aceita números nacionais (10/11 dígitos, com DDD) ou já com DDI (12/13 dígitos) */
export function telefoneValido(telefone: string): boolean {
  const digitos = apenasDigitos(telefone)
  return digitos.length >= 10 && digitos.length <= 13
}

/** Formata para exibição: `(DD) 9XXXX-XXXX` ou `(DD) XXXX-XXXX`; outros formatos ficam como estão */
export function formatarTelefone(telefone: string): string {
  const d = apenasDigitos(telefone)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return telefone
}

/** wa.me exige o número internacional: prefixa 55 em números nacionais (10 ou 11 dígitos) */
export function telefoneWhatsApp(telefone: string): string {
  const d = apenasDigitos(telefone)
  return d.length === 10 || d.length === 11 ? `${DDI_BRASIL}${d}` : d
}

export function linkGoogleMaps({ latitude, longitude }: Pick<Coordinates, 'latitude' | 'longitude'>): string {
  // 6 casas decimais ≈ 10 cm: precisão de sobra sem poluir o link
  return `https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`
}

export interface MensagemAjuda {
  /** Texto do usuário (ou o padrão), sem o link */
  texto: string
  /** Link do Google Maps, ou null se a localização não estiver disponível */
  linkLocalizacao: string | null
  /** Mensagem completa (texto + link), usada em SMS e WhatsApp */
  completa: string
}

export function montarMensagem(textoDigitado: string, coords: Coordinates | null): MensagemAjuda {
  const texto = textoDigitado.trim() || MENSAGEM_PADRAO
  const linkLocalizacao = coords ? linkGoogleMaps(coords) : null
  return {
    texto,
    linkLocalizacao,
    completa: linkLocalizacao ? `${texto}\nMinha localização: ${linkLocalizacao}` : texto,
  }
}

export function montarLinkCompartilhamento(
  canal: CanalCompartilhamento,
  telefone: string,
  mensagem: MensagemAjuda,
): string {
  const enc = encodeURIComponent
  switch (canal) {
    case 'whatsapp':
      return `https://wa.me/${telefoneWhatsApp(telefone)}?text=${enc(mensagem.completa)}`
    case 'sms':
      return `sms:${apenasDigitos(telefone)}?body=${enc(mensagem.completa)}`
    case 'telegram':
      // O Telegram exige `url`; sem localização, o próprio texto vai nesse parâmetro
      return mensagem.linkLocalizacao
        ? `https://t.me/share/url?url=${enc(mensagem.linkLocalizacao)}&text=${enc(mensagem.texto)}`
        : `https://t.me/share/url?url=${enc(mensagem.texto)}`
  }
}
