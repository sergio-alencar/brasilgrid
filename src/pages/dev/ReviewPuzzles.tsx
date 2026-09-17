// Só em desenvolvimento: revisão visual dos lotes gerados em puzzles/.
import { useState } from 'react'
import { CATEGORIES } from '../../../data/categories/index.ts'
import { getUf } from '../../../shared/ufs.ts'
import type { GeneratedPuzzle } from '../../../scripts/lib/generator.ts'

interface Batch {
  generated: string
  options: { from: string; days: number; seed: number; cooldownDays: number }
  puzzles: GeneratedPuzzle[]
}

const batches = import.meta.glob<Batch>('../../../puzzles/*.json', { eager: true, import: 'default' })
const byId = new Map(CATEGORIES.map((c) => [c.id, c]))

export default function ReviewPuzzles() {
  const files = Object.keys(batches).sort()
  const [file, setFile] = useState(files.at(-1) ?? '')
  const [rejected, setRejected] = useState<Set<string>>(new Set())
  const [launch, setLaunch] = useState('')
  const batch = batches[file]

  if (!batch) return <p>Nenhum lote em puzzles/. Rode npm run puzzles:generate.</p>

  const toggle = (date: string) =>
    setRejected((prev) => {
      const next = new Set(prev)
      if (next.has(date)) next.delete(date)
      else next.add(date)
      return next
    })

  const path = file.replace('../../../', '')
  const regenerateCommand = `npm run puzzles:regenerate -- --file ${path} --dates ${[...rejected].sort().join(',')}`
  const publishCommand = `npm run puzzles:publish -- --file ${path} --launch ${launch || '<AAAA-MM-DD>'}`

  return (
    <section className="content-panel space-y-6">
      <h1 className="text-2xl font-bold">Revisão de grades</h1>
      <div className="flex flex-wrap items-end gap-3 text-sm">
        <label>
          Lote
          <select value={file} onChange={(e) => (setFile(e.target.value), setRejected(new Set()))} className="ml-2 rounded border px-2 py-1 dark:bg-slate-900">
            {files.map((f) => (
              <option key={f} value={f}>
                {f.replace('../../../puzzles/', '')}
              </option>
            ))}
          </select>
        </label>
        <label>
          Lançamento
          <input type="date" value={launch} onChange={(e) => setLaunch(e.target.value)} className="ml-2 rounded border px-2 py-1 dark:bg-slate-900" />
        </label>
      </div>
      <p className="text-sm text-slate-500">
        {batch.puzzles.length} grades · semente {batch.options.seed} · gerado em {batch.generated} · {rejected.size} rejeitadas
      </p>
      {rejected.size > 0 ? (
        <div className="space-y-1">
          <p className="text-sm">
            1. Rode o comando abaixo para <strong>gerar substitutas</strong> só para as datas rejeitadas (elas nunca
            saem iguais às que estão marcadas):
          </p>
          <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs dark:bg-slate-800">{regenerateCommand}</pre>
          <p className="text-sm">2. Recarregue esta página, revise as novas e desmarque-as antes de publicar.</p>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-sm">Nenhuma grade rejeitada. Comando para publicar o lote inteiro:</p>
          <pre className="overflow-x-auto rounded bg-slate-100 p-3 text-xs dark:bg-slate-800">{publishCommand}</pre>
        </div>
      )}

      {batch.puzzles.map((p) => {
        const out = rejected.has(p.playDate)
        return (
          <article key={p.playDate} className={`rounded-xl border p-3 dark:border-slate-700 ${out ? 'opacity-40' : ''}`}>
            <header className="mb-2 flex items-center justify-between text-sm">
              <strong>{new Date(`${p.playDate}T12:00:00`).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })}</strong>
              <span className="text-xs text-slate-500">
                dif. {p.metrics.difficulty} · mín. {p.metrics.minAnswers} · total {p.metrics.totalAnswers} · triviais {p.metrics.trivialCells} · intervalo {p.cooldownUsed}d
              </span>
              <label className="flex items-center gap-1">
                <input type="checkbox" checked={out} onChange={() => toggle(p.playDate)} /> rejeitar
              </label>
            </header>
            <table className="w-full table-fixed text-xs">
              <thead>
                <tr>
                  <th />
                  {p.cols.map((id) => (
                    <th key={id} className="p-1 text-left" title={byId.get(id)?.description}>
                      {byId.get(id)?.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.rows.map((rid, r) => (
                  <tr key={rid} className="border-t dark:border-slate-700">
                    <th className="p-1 text-left align-top" title={byId.get(rid)?.description}>
                      {byId.get(rid)?.label}
                    </th>
                    {[0, 1, 2].map((c) => {
                      const i = r * 3 + c
                      return (
                        <td key={c} className="p-1 align-top">
                          {p.cells[i].map((uf) => (
                            <span key={uf} className={uf === p.solution[i] ? 'font-bold' : ''}>
                              {getUf(uf)?.name}
                              <br />
                            </span>
                          ))}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        )
      })}
    </section>
  )
}
