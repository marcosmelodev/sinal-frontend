import type { TipoChamado } from './ChamadosService'
import type { NomeIcone } from './icones'

export interface Ocorrencia {
  id: number
  titulo: string
  icone: NomeIcone
}

// TODO: Substituir estes IDs mockados por uma chamada à API (GET /api/v1/ocorrencias) ou validar contra a BD real.
// Os IDs recomeçam em 1 para cada órgão.
export const OCORRENCIAS: Record<TipoChamado, Ocorrencia[]> = {
  SAMU: [
    { id: 1, titulo: 'Pessoa desacordada / Não respira', icone: 'UserX' },
    { id: 2, titulo: 'Dor forte no peito / Suspeita de infarto', icone: 'HeartPulse' },
    { id: 3, titulo: 'Falta de ar grave / Engasgo', icone: 'Wind' },
    { id: 4, titulo: 'Convulsão / Ataque epiléptico', icone: 'Zap' },
    { id: 5, titulo: 'Sangramento grave / Hemorragia', icone: 'Droplet' },
  ],
  POLICIA_MILITAR: [
    { id: 1, titulo: 'Assalto / Roubo em andamento', icone: 'AlertTriangle' },
    { id: 2, titulo: 'Agressão física / Briga', icone: 'Users' },
    { id: 3, titulo: 'Violência doméstica / Pessoa em perigo', icone: 'House' },
    { id: 4, titulo: 'Ameaça de morte / Arma de fogo', icone: 'ShieldAlert' },
    { id: 5, titulo: 'Pessoa suspeita rondando', icone: 'Eye' },
  ],
  CORPO_DE_BOMBEIROS: [
    { id: 1, titulo: 'Incêndio em residência / Prédio', icone: 'Flame' },
    { id: 2, titulo: 'Acidente com pessoa presa nas ferragens', icone: 'Car' },
    { id: 3, titulo: 'Vazamento de gás com cheiro forte', icone: 'Wind' },
    { id: 4, titulo: 'Afogamento / Vítima em rio ou piscina', icone: 'Waves' },
    { id: 5, titulo: 'Choque elétrico / Fiação caída na rua', icone: 'Zap' },
  ],
}

/** Opção "Outro / Não sei informar" de cada órgão, exibida como botão largo no fim da grade */
export const OCORRENCIA_OUTRO: Record<TipoChamado, Ocorrencia> = {
  SAMU: { id: 6, titulo: 'Outro / Não sei informar', icone: 'CircleHelp' },
  POLICIA_MILITAR: { id: 6, titulo: 'Outro / Não sei informar', icone: 'CircleHelp' },
  CORPO_DE_BOMBEIROS: { id: 6, titulo: 'Outro / Não sei informar', icone: 'CircleHelp' },
}

export function buscarOcorrencia(orgao: TipoChamado, id: number | undefined): Ocorrencia | undefined {
  if (id === undefined) return undefined
  return [...OCORRENCIAS[orgao], OCORRENCIA_OUTRO[orgao]].find((o) => o.id === id)
}
