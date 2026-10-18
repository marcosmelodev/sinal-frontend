import { useEffect, useState } from 'react'
import type { TipoChamado } from '../features/chamados/ChamadosService'
import { OcorrenciasService } from '../features/chamados/OcorrenciasService'
import type { OcorrenciaTipoResponse } from '../features/chamados/OcorrenciasService'
import { OCORRENCIAS, OCORRENCIA_OUTRO } from '../features/chamados/ocorrenciasData'
import type { Ocorrencia } from '../features/chamados/ocorrenciasData'

interface CatalogoOcorrencias {
  ocorrencias: Ocorrencia[]
  /** "Outro / Não sei informar", exibido como botão largo no fim */
  outro: Ocorrencia | null
  /** 'api' quando veio do back-end; 'local' quando a API falhou e o catálogo embutido foi usado */
  origem: 'api' | 'local'
}

/** Ícones de cada código do catálogo local (a API não envia ícone) */
const ICONE_POR_CODIGO = new Map(
  (Object.keys(OCORRENCIAS) as TipoChamado[]).flatMap((orgao) =>
    [...OCORRENCIAS[orgao], OCORRENCIA_OUTRO[orgao]].map((o) => [o.codigo, o.icone] as const),
  ),
)

const ORDEM_OUTRO = 99

function isOutro(item: OcorrenciaTipoResponse): boolean {
  return item.ordem === ORDEM_OUTRO || item.codigo.endsWith('_OUTRO')
}

function daApi(itens: OcorrenciaTipoResponse[]): CatalogoOcorrencias {
  const paraOcorrencia = (item: OcorrenciaTipoResponse): Ocorrencia => ({
    id: item.id,
    codigo: item.codigo,
    titulo: item.nome,
    icone: ICONE_POR_CODIGO.get(item.codigo) ?? 'CircleHelp',
  })
  const ordenados = [...itens].sort((a, b) => a.ordem - b.ordem)
  const outro = ordenados.find(isOutro)
  return {
    ocorrencias: ordenados.filter((item) => !isOutro(item)).map(paraOcorrencia),
    outro: outro ? paraOcorrencia(outro) : null,
    origem: 'api',
  }
}

function doCatalogoLocal(orgao: TipoChamado): CatalogoOcorrencias {
  return { ocorrencias: OCORRENCIAS[orgao], outro: OCORRENCIA_OUTRO[orgao], origem: 'local' }
}

/**
 * Catálogo de ocorrências do órgão vindo de `GET /api/v1/ocorrencias?orgao=`.
 * Enquanto carrega devolve null (para não exibir IDs que podem não bater com o banco);
 * se a API falhar, usa o catálogo local de `ocorrenciasData.ts`.
 */
export function useOcorrencias(orgao: TipoChamado | null) {
  const [resultado, setResultado] = useState<{ orgao: TipoChamado; catalogo: CatalogoOcorrencias } | null>(null)

  useEffect(() => {
    if (!orgao) return
    let ativo = true
    OcorrenciasService.listarPorOrgao(orgao)
      .then((itens) => {
        if (!ativo) return
        setResultado({ orgao, catalogo: itens.length ? daApi(itens) : doCatalogoLocal(orgao) })
      })
      .catch((err) => {
        if (!ativo) return
        console.warn('[useOcorrencias] API indisponível, usando catálogo local:', err)
        setResultado({ orgao, catalogo: doCatalogoLocal(orgao) })
      })
    return () => {
      ativo = false
    }
  }, [orgao])

  // Ignora um resultado antigo caso o órgão da rota tenha mudado
  return resultado && resultado.orgao === orgao ? resultado.catalogo : null
}
