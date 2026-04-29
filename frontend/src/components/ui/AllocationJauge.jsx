/**
 * AllocationJauge — Jauge d'allocation départementale (consommé / alloué).
 * Similaire à ExecutionJauge mais avec le wording "Alloué / Disponible".
 *
 * @example <AllocationJauge alloue={5000000} consomme={3000000} />
 */
import { calculerTauxExecution, getCouleurExecution, formaterMontant, formaterPourcentage } from '../../utils/formatters'

export default function AllocationJauge({
  alloue,
  consomme,
  disponible,
  showMontants = true,
  height = 8,
  style,
}) {
  const taux    = calculerTauxExecution(consomme, alloue)
  const pct     = Math.min(taux, 100)
  const couleur = getCouleurExecution(taux)
  const dispo   = disponible !== undefined
    ? disponible
    : (parseFloat(alloue || 0) - parseFloat(consomme || 0))

  return (
    <div style={style}>
      <div className="flex justify-between mb-1">
        <span className="text-[11px] text-[#6B7280] font-semibold">
          {formaterPourcentage(taux, { decimales: 0 })} consommé
        </span>
        <span className="text-[11px] text-[#9CA3AF] font-mono">
          Dispo : {formaterMontant(dispo)}
        </span>
      </div>
      <div className="exec-bar" style={{ height }}>
        <div
          className="exec-bar-fill"
          style={{ width: `${pct}%`, background: couleur }}
        />
      </div>
      {showMontants && (
        <div className="flex justify-between mt-1">
          <span className="text-[11px] font-mono font-bold" style={{ color: couleur }}>
            {formaterMontant(consomme)}
          </span>
          <span className="text-[11px] text-[#9CA3AF] font-mono">
            / {formaterMontant(alloue)}
          </span>
        </div>
      )}
    </div>
  )
}