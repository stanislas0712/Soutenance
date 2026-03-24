/**
 * PredictionCard — Affiche la prédiction de dépassement budgétaire (F5)
 * Usage: <PredictionCard budgetId={id} montantTotal={140000} />
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getPredictions, predireDepassement } from '../../api/ia'

export default function PredictionCard({ budgetId, montantTotal }) {
  const qc = useQueryClient()

  const { data: allPreds } = useQuery({
    queryKey: ['predictions'],
    queryFn: () => getPredictions().then(r => r.data.data),
    retry: false,
  })

  const pred = (Array.isArray(allPreds) ? allPreds : []).find(p => p.budget === budgetId)

  const { mutate: predire, isPending } = useMutation({
    mutationFn: () => predireDepassement(budgetId),
    onSuccess: () => qc.invalidateQueries(['predictions']),
  })

  const niveau = pred ? getNiveau(pred.probabilite_depassement) : null

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden shadow-sm">
      <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>📈</span>
          <span className="font-bold text-[.85rem] text-[#1F2937]">Prédiction de dépassement</span>
        </div>
        <button
          onClick={() => predire()}
          disabled={isPending}
          className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] px-3 py-[5px] text-[.72rem] font-semibold text-[#4B5563]${isPending ? ' cursor-not-allowed' : ' cursor-pointer'}`}
        >
          {isPending ? '⏳' : '🔮 Prédire'}
        </button>
      </div>

      <div className="px-4 py-[14px]">
        {!pred && (
          <div className="text-center text-[#9CA3AF] text-[.8rem] py-2">
            Cliquez sur "Prédire" pour analyser le risque de dépassement.
          </div>
        )}

        {pred && (
          <>
            {/* Jauge probabilité */}
            <div className="mb-[14px]">
              <div className="flex justify-between mb-[6px]">
                <span className="text-[.75rem] text-[#4B5563]">Probabilité de dépassement</span>
                <span className="font-extrabold text-[.88rem]" style={{ color: niveau.color }}>
                  {Math.round(pred.probabilite_depassement * 100)}%
                </span>
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-[4px] overflow-hidden">
                <div
                  className="h-full rounded-[4px] transition-[width_.6s_ease]"
                  style={{
                    width: `${pred.probabilite_depassement * 100}%`,
                    background: `linear-gradient(90deg, ${niveau.colorStart}, ${niveau.color})`,
                  }}
                />
              </div>
              <div className="text-right text-[.65rem] font-bold mt-[3px]" style={{ color: niveau.color }}>
                Risque {niveau.label}
              </div>
            </div>

            {/* Montants */}
            <div className="grid grid-cols-2 gap-[10px] mb-3">
              <MetricBox
                label="Montant prévu final"
                value={`${Number(pred.montant_prevu_final).toLocaleString('fr-FR')} FCFA`}
                color="#374151"
              />
              <MetricBox
                label={Number(pred.ecart_prevu) >= 0 ? "Dépassement estimé" : "Économie estimée"}
                value={`${Number(pred.ecart_prevu) >= 0 ? '+' : ''}${Number(pred.ecart_prevu).toLocaleString('fr-FR')} FCFA`}
                color={Number(pred.ecart_prevu) >= 0 ? '#be123c' : '#057a55'}
              />
            </div>

            {/* Facteurs */}
            {pred.facteurs?.length > 0 && (
              <div>
                <div className="text-[.68rem] font-bold text-[#6B7280] mb-[6px] tracking-[.5px]">
                  FACTEURS EXPLICATIFS
                </div>
                {pred.facteurs.slice(0, 3).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 mb-[5px]">
                    <span className="text-[.75rem]">{f.impact === 'NEGATIF' ? '📉' : '📈'}</span>
                    <div className="flex-1">
                      <div className="text-[.73rem] font-semibold text-[#374151]">{f.facteur}</div>
                      <div className="text-[.68rem] text-[#6B7280]">{f.description}</div>
                    </div>
                    <div className="h-[5px] w-[60px] bg-[#F3F4F6] rounded-[4px]">
                      <div
                        className="h-full rounded-[4px]"
                        style={{
                          width: `${(f.poids || 0) * 100}%`,
                          background: f.impact === 'NEGATIF' ? '#be123c' : '#057a55',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function MetricBox({ label, value, color }) {
  return (
    <div className="bg-[#F9FAFB] rounded-[8px] px-3 py-[10px]">
      <div className="text-[.67rem] text-[#6B7280] mb-1 font-semibold">{label}</div>
      <div className="text-[.82rem] font-extrabold" style={{ color }}>{value}</div>
    </div>
  )
}

function getNiveau(prob) {
  if (prob >= 0.75) return { label: 'CRITIQUE', color: '#be123c', colorStart: '#fca5a5' }
  if (prob >= 0.50) return { label: 'ÉLEVÉ',    color: '#c2410c', colorStart: '#fdba74' }
  if (prob >= 0.25) return { label: 'MOYEN',    color: '#b45309', colorStart: '#fde68a' }
  return               { label: 'FAIBLE',    color: '#057a55', colorStart: '#a7f3d0' }
}
