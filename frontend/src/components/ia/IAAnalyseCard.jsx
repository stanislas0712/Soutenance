/**
 * IAAnalyseCard — Affiche le résultat d'une analyse IA complète (F1)
 * Usage: <IAAnalyseCard budgetId={id} />
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { analyserBudget, getAnalysesBudget } from '../../api/ia'

const PRIORITE_COLOR = { HAUTE: '#be123c', MOYENNE: '#b45309', BASSE: '#057a55' }

export default function IAAnalyseCard({ budgetId }) {
  const [expanded, setExpanded] = useState(false)
  const qc = useQueryClient()

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['analyses-budget', budgetId],
    queryFn: () => getAnalysesBudget(budgetId).then(r => r.data.data),
    retry: false,
  })

  const { mutate: lancer, isPending, error } = useMutation({
    mutationFn: () => analyserBudget(budgetId),
    onSuccess: () => {
      qc.invalidateQueries(['analyses-budget', budgetId])
      setExpanded(true)
    },
  })

  const derniere = analyses?.[0]

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden shadow-sm">
      {/* Header */}
      <div
        className="px-[18px] py-[14px] flex items-center justify-between"
        style={{ background: 'linear-gradient(135deg, #1a56db 0%, #6c63ff 100%)' }}
      >
        <div className="flex items-center gap-[10px]">
          <span className="text-[1.1rem]">🤖</span>
          <div>
            <div className="text-white font-bold text-[.88rem]">Analyse IA</div>
            <div className="text-white/70 text-[.7rem]">
              {derniere ? `Dernière analyse: ${new Date(derniere.created_at).toLocaleDateString('fr-FR')}` : 'Aucune analyse'}
            </div>
          </div>
        </div>
        <button
          onClick={() => lancer()}
          disabled={isPending}
          className={`flex items-center gap-[6px] text-white text-[.75rem] font-semibold px-[14px] py-[6px] rounded-[8px]${isPending ? ' cursor-not-allowed' : ' cursor-pointer'}`}
          style={{
            background: 'rgba(255,255,255,.15)',
            border: '1px solid rgba(255,255,255,.3)',
          }}
        >
          {isPending ? '⏳ Analyse en cours…' : '✨ Analyser'}
        </button>
      </div>

      {error && (
        <div className="bg-[#fff1f2] text-[#be123c] px-4 py-2 text-[.75rem]">
          ⚠️ Service IA temporairement indisponible. Réessayez dans quelques instants.
        </div>
      )}

      {!derniere && !isLoading && (
        <div className="px-[18px] py-5 text-center text-[#9CA3AF] text-[.82rem]">
          Cliquez sur "Analyser" pour obtenir une analyse IA complète de ce budget.
        </div>
      )}

      {derniere && (
        <div className="px-[18px] py-4">
          {/* Résumé */}
          <p className="text-[.82rem] text-[#374151] leading-[1.6] mb-[14px]">
            {derniere.resume}
          </p>

          <button
            onClick={() => setExpanded(e => !e)}
            className="text-[#1a56db] text-[.75rem] font-semibold cursor-pointer"
          >
            {expanded ? '▲ Réduire' : '▼ Voir le détail complet'}
          </button>

          {expanded && (
            <div className="mt-[14px]">
              <SectionListe titre="✅ Points forts" items={derniere.points_forts} color="#057a55" bg="#f0fdf4" />
              <SectionListe titre="⚠️ Points faibles" items={derniere.points_faibles} color="#b45309" bg="#fffbeb" />

              {derniere.recommandations?.length > 0 && (
                <div className="mt-[14px]">
                  <div className="text-[.72rem] font-bold text-[#6B7280] mb-2 tracking-[.5px]">RECOMMANDATIONS</div>
                  {derniere.recommandations.map((r, i) => (
                    <div
                      key={i}
                      className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] px-3 py-[10px] mb-2 flex gap-[10px] items-start"
                    >
                      <span
                        className="text-[.62rem] font-bold px-[6px] py-[2px] rounded-[4px] whitespace-nowrap shrink-0"
                        style={{
                          background: PRIORITE_COLOR[r.priorite] ? PRIORITE_COLOR[r.priorite] + '20' : '#f0fdf4',
                          color: PRIORITE_COLOR[r.priorite] || '#057a55',
                        }}
                      >
                        {r.priorite || 'INFO'}
                      </span>
                      <div>
                        <div className="text-[.78rem] font-semibold text-[#1F2937]">{r.action}</div>
                        {r.impact && <div className="text-[.71rem] text-[#6B7280] mt-[3px]">Impact: {r.impact}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SectionListe({ titre, items, color, bg }) {
  if (!items?.length) return null
  return (
    <div className="mb-3">
      <div className="text-[.72rem] font-bold text-[#6B7280] mb-[6px] tracking-[.5px]">
        {titre}
      </div>
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-[0_6px_6px_0] px-[10px] py-[6px] mb-[5px] text-[.78rem] text-[#374151]"
          style={{ background: bg, borderLeft: `3px solid ${color}` }}
        >
          {item}
        </div>
      ))}
    </div>
  )
}
