import type { Localizacao } from '../features/chamados/ChamadosService'

export function formatarData(iso: string): string {
  const data = new Date(iso)
  if (Number.isNaN(data.getTime())) return iso
  return data.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).replace(',', '')
}

export function formatarCoordenadas(localizacao: Pick<Localizacao, 'latitude' | 'longitude'>): string {
  return `${localizacao.latitude.toFixed(5)}, ${localizacao.longitude.toFixed(5)}`
}

/** Converte o `:id` da rota em número; null se inválido */
export function parseId(valor: string | undefined): number | null {
  const id = Number(valor)
  return Number.isInteger(id) && id > 0 ? id : null
}

/** Duração em `MM:SS` (minutos podem passar de 59 em chamadas longas) */
export function formatarDuracao(totalSegundos: number): string {
  const minutos = Math.floor(totalSegundos / 60)
  const segundos = totalSegundos % 60
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`
}
