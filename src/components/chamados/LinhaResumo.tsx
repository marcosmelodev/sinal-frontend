interface LinhaResumoProps {
  rotulo: string
  valor: string
}

/** Linha "rótulo — valor" dos painéis de resumo. Use dentro de um <dl>. */
function LinhaResumo({ rotulo, valor }: LinhaResumoProps) {
  return (
    <div className="flex justify-between gap-2 border-b border-slate-200 py-2 last:border-b-0">
      <dt className="text-slate-600">{rotulo}</dt>
      <dd className="text-right font-bold [overflow-wrap:anywhere]">{valor}</dd>
    </div>
  )
}

export default LinhaResumo
