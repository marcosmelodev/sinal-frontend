import type { TipoChamado } from './ChamadosService'
import type { NomeIcone } from './icones'

export interface Ocorrencia {
  /** ID auto-incremental da tabela `ocorrencia_tipo`; é o valor enviado como `ocorrenciaId` */
  id: number
  /** Código estável do back-end (`ocorrencia_tipo.codigo`); não é enviado, serve de referência */
  codigo: string
  titulo: string
  icone: NomeIcone
}

// TODO: Substituir estes IDs mockados por uma chamada à API (GET /api/v1/ocorrencias) ou validar contra a BD real.
// Espelho do seed oficial do back-end (sinal/src/main/resources/db/migration/V2__seed_ocorrencias.sql).
// Os IDs seguem a ordem dos inserts em um banco recém-migrado: PM 1–11, SAMU 12–22, CBM 23–33.
// O "Outro / Não sei informar" (último de cada órgão) fica em OCORRENCIA_OUTRO.
export const OCORRENCIAS: Record<TipoChamado, Ocorrencia[]> = {
  POLICIA_MILITAR: [
    { id: 1, codigo: 'PM_ASSALTO_ROUBO', titulo: 'Assalto / Roubo em andamento', icone: 'AlertTriangle' },
    { id: 2, codigo: 'PM_AGRESSAO_BRIGA', titulo: 'Agressão física / Briga', icone: 'Users' },
    { id: 3, codigo: 'PM_VIOLENCIA_DOMESTICA', titulo: 'Violência doméstica / Pessoa em perigo', icone: 'House' },
    { id: 4, codigo: 'PM_INVASAO_DOMICILIO', titulo: 'Invasão de domicílio / Estabelecimento', icone: 'Building2' },
    { id: 5, codigo: 'PM_AMEACA_ARMA_FOGO', titulo: 'Ameaça de morte / Arma de fogo', icone: 'ShieldAlert' },
    { id: 6, codigo: 'PM_FURTO_VEICULO_OBJETO', titulo: 'Furto de veículo / Objeto', icone: 'Car' },
    { id: 7, codigo: 'PM_DISPAROS_ARMA_FOGO', titulo: 'Disparos de arma de fogo', icone: 'Crosshair' },
    { id: 8, codigo: 'PM_PESSOA_SUSPEITA', titulo: 'Pessoa suspeita rondando', icone: 'Eye' },
    { id: 9, codigo: 'PM_DESORDEM_PERTURBACAO', titulo: 'Desordem / Perturbação do sossego', icone: 'Megaphone' },
    { id: 10, codigo: 'PM_ACIDENTE_TRANSITO_BRIGA_FUGA', titulo: 'Acidente de trânsito com briga / Fuga', icone: 'Car' },
  ],
  SAMU: [
    { id: 12, codigo: 'SAMU_DESACORDADO_NAO_RESPIRA', titulo: 'Pessoa desacordada / Não respira', icone: 'UserX' },
    { id: 13, codigo: 'SAMU_DOR_PEITO_INFARTO', titulo: 'Dor forte no peito / Suspeita de infarto', icone: 'HeartPulse' },
    { id: 14, codigo: 'SAMU_FALTA_AR_ENGASGO', titulo: 'Falta de ar grave / Engasgo', icone: 'Wind' },
    { id: 15, codigo: 'SAMU_CONVULSAO', titulo: 'Convulsão / Ataque epiléptico', icone: 'Zap' },
    { id: 16, codigo: 'SAMU_SANGRAMENTO_GRAVE', titulo: 'Sangramento grave / Hemorragia', icone: 'Droplet' },
    { id: 17, codigo: 'SAMU_QUEDA_FRATURA', titulo: 'Queda de altura com fratura', icone: 'Bone' },
    { id: 18, codigo: 'SAMU_SUSPEITA_AVC', titulo: 'Boca torta / Perda de força (Suspeita de AVC)', icone: 'Brain' },
    { id: 19, codigo: 'SAMU_QUEIMADURA_GRAVE', titulo: 'Queimadura grave', icone: 'Flame' },
    { id: 20, codigo: 'SAMU_INTOXICACAO_ENVENENAMENTO', titulo: 'Intoxicação / Envenenamento', icone: 'FlaskConical' },
    { id: 21, codigo: 'SAMU_TENTATIVA_SUICIDIO', titulo: 'Tentativa de suicídio', icone: 'LifeBuoy' },
  ],
  CORPO_DE_BOMBEIROS: [
    { id: 23, codigo: 'CBM_INCENDIO_RESIDENCIA_PREDIO', titulo: 'Incêndio em residência / Prédio', icone: 'Flame' },
    { id: 24, codigo: 'CBM_INCENDIO_MATA_VEGETACAO', titulo: 'Incêndio em mata / Vegetação', icone: 'Trees' },
    { id: 25, codigo: 'CBM_ACIDENTE_PRESO_FERRAGENS', titulo: 'Acidente com pessoa presa nas ferragens', icone: 'Car' },
    { id: 26, codigo: 'CBM_VAZAMENTO_GAS', titulo: 'Vazamento de gás com cheiro forte', icone: 'Wind' },
    { id: 27, codigo: 'CBM_AFOGAMENTO', titulo: 'Afogamento / Vítima em rio ou piscina', icone: 'Waves' },
    { id: 28, codigo: 'CBM_DESABAMENTO', titulo: 'Desabamento / Risco de queda de estrutura', icone: 'House' },
    { id: 29, codigo: 'CBM_CHOQUE_ELETRICO', titulo: 'Choque elétrico / Fiação caída na rua', icone: 'Zap' },
    { id: 30, codigo: 'CBM_QUEDA_ARVORE', titulo: 'Queda de árvore sobre casa ou via', icone: 'TreeDeciduous' },
    { id: 31, codigo: 'CBM_ATAQUE_ANIMAIS', titulo: 'Ataque de animais perigosos', icone: 'PawPrint' },
    { id: 32, codigo: 'CBM_PESSOA_ANIMAL_PRESO', titulo: 'Pessoa ou animal preso em local de risco', icone: 'LifeBuoy' },
  ],
}

/** Opção "Outro / Não sei informar" de cada órgão, exibida como botão largo no fim da grade */
export const OCORRENCIA_OUTRO: Record<TipoChamado, Ocorrencia> = {
  POLICIA_MILITAR: { id: 11, codigo: 'PM_OUTRO', titulo: 'Outro / Não sei informar', icone: 'CircleHelp' },
  SAMU: { id: 22, codigo: 'SAMU_OUTRO', titulo: 'Outro / Não sei informar', icone: 'CircleHelp' },
  CORPO_DE_BOMBEIROS: { id: 33, codigo: 'CBM_OUTRO', titulo: 'Outro / Não sei informar', icone: 'CircleHelp' },
}

export function buscarOcorrencia(orgao: TipoChamado, id: number | undefined): Ocorrencia | undefined {
  if (id === undefined) return undefined
  return [...OCORRENCIAS[orgao], OCORRENCIA_OUTRO[orgao]].find((o) => o.id === id)
}
