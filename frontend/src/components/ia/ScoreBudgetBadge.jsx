/**
 * ScoreBudgetBadge — Badge circulaire affichant le score qualité IA (F6)
 * Usage: <ScoreBudgetBadge budgetId={id} />
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getScoreBudget, scorerBudget } from '../../api/ia'

const COULEURS = {
  EXCELLENT: { bg: '#f0fdf4', text: '#057a55', border: '#bbf7d0', label: 'Excellent' },
  BON:       { bg: '#eff6ff', text: '#1a56db', border: '#bfdbfe', label: 'Bon'       },
  MOYEN:     { bg: '#fffbeb', text: '#b45309', border: '#fde68a', label: 'Moyen'     },
  FAIBLE:    { bg: '#fff1f2', text: '#be123c', border: '#fecdd3', label: 'Faible'    },
}

export default function ScoreBudgetBadge({ budgetId, showDetails = false }) {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['score-budget', budgetId],
    queryFn: () => getScoreBudget(budgetId).then(r => r.data.data),
    retry: false,
  })

  const { mutate: scorer, isPending } = useMutation({
    mutationFn: () => scorerBudget(budgetId),
    onSuccess: () => qc.invalidateQueries(['score-budget', budgetId]),
  })

  if (isLoading) return (
    <div className="w-[52px] h-[52px] rounded-full bg-[#F3F4F6] flex items-center justify-center">
      <span className="text-[.6rem] text-[#9CA3AF]">…</span>
    </div>
  )

  if (!data) return (
    <button
      onClick={() => scorer()}
      disabled={isPending}
      className="flex items-center gap-[6px] bg-[#F9FAFB] border-[1.5px] border-dashed border-[#D1D5DB] rounded-[8px] px-3 py-[6px] text-[.72rem] text-[#6B7280] cursor-pointer"
    >
      {isPending ? '⏳ Scoring…' : '🤖 Scorer ce budget'}
    </button>
  )

  const c = COULEURS[data.niveau] || COULEURS.MOYEN

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <div
        onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full flex flex-col items-center justify-center cursor-pointer select-none"
        style={{ background: c.bg, border: `2.5px solid ${c.border}` }}
      >
        <span className="text-[.7rem] font-extrabold leading-none" style={{ color: c.text }}>{data.score_global}</span>
        <span className="text-[.5rem] tracking-[.3px]" style={{ color: c.text }}>/100</span>
      </div>
      <span className="text-[.62rem] font-semibold" style={{ color: c.text }}>{c.label}</span>

      {/* Tooltip détail */}
      {open && (
        <div
          className="absolute top-[68px] right-0 z-[200] min-w-[260px] bg-white border border-[#E5E7EB] rounded-[10px] shadow-md px-4 py-[14px]"
        >
          <div className="font-bold text-[.82rem] mb-[10px] text-[#1F2937]">
            Score qualité IA — {data.score_global}/100
          </div>
          {[
            ['Complétude',  data.score_completude],
            ['Cohérence',   data.score_coherence],
            ['Conformité',  data.score_conformite],
            ['Réalisme',    data.score_realisme],
          ].map(([label, score]) => (
            <div key={label} className="mb-2">
              <div className="flex justify-between text-[.72rem] text-[#4B5563] mb-[3px]">
                <span>{label}</span><span className="font-bold">{score}/25</span>
              </div>
              <div className="h-[5px] bg-[#F3F4F6] rounded-[4px]">
                <div
                  className="h-full rounded-[4px] transition-[width_.5s]"
                  style={{ width: `${(score / 25) * 100}%`, background: c.text }}
                />
              </div>
            </div>
          ))}
          {data.recommandations?.length > 0 && (
            <div className="mt-[10px] border-t border-[#F3F4F6] pt-2">
              <div className="text-[.68rem] font-semibold text-[#6B7280] mb-[5px]">RECOMMANDATIONS</div>
              {data.recommandations.slice(0, 3).map((r, i) => (
                <div key={i} className="text-[.71rem] text-[#374151] mb-1 flex gap-[6px]">
                  <span style={{ color: c.text }}>→</span> {r}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
