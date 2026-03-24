/**
 * ExecutionJauge — Barre de progression pour le taux d'exécution budgétaire.
 *
 * @example <ExecutionJauge consomme={750000} alloue={1000000} />
 * @example <ExecutionJauge taux={75} />
 * @example <ExecutionJauge consomme={750000} alloue={1000000} compact />
 */
import { calculerTauxExecution, getCouleurExecution, formaterMontant } from '../../utils/formatters'

export default function ExecutionJauge({
  consomme,
  alloue,
  taux: tauxProp,
  compact   = false,
  showLabel = true,
  showMontants = false,
  height    = 6,
  style,
}) {
  const taux    = tauxProp !== undefined ? parseFloat(tauxProp) : calculerTauxExecution(consomme, alloue)
  const pct     = Math.min(taux, 100)
  const couleur = getCouleurExecution(taux)

  if (compact) {
    return (
      <div className="flex items-center gap-2" style={style}>
        <div
          className="flex-1 overflow-hidden rounded-full bg-[#F3F4F6]"
          style={{ height }}
        >
          <div style={{ width: `${pct}%`, height: '100%', background: couleur, borderRadius: height, transition: 'width .4s' }} />
        </div>
        {showLabel && (
          <span className="font-mono font-bold whitespace-nowrap text-[11px]" style={{ color: couleur }}>
            {taux.toFixed(0)} %
          </span>
        )}
      </div>
    )
  }

  return (
    <div style={style}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-[11px] text-[#6B7280] font-semibold">Exécution</span>
          <span className="font-mono font-bold text-[12px]" style={{ color: couleur }}>
            {taux.toFixed(1)} %
          </span>
        </div>
      )}
      <div className="exec-bar" style={{ height }}>
        <div
          className="exec-bar-fill"
          style={{ width: `${pct}%`, background: couleur }}
        />
      </div>
      {showMontants && consomme !== undefined && alloue !== undefined && (
        <div className="flex justify-between mt-1">
          <span className="text-[11px] text-[#9CA3AF] font-mono">
            {formaterMontant(consomme)}
          </span>
          <span className="text-[11px] text-[#9CA3AF] font-mono">
            {formaterMontant(alloue)}
          </span>
        </div>
      )}
    </div>
  )
}
