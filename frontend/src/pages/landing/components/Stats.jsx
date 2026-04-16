import { useEffect } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { useScrollAnimation } from '../hooks/useScrollAnimation'

function StatItem({ prefix = '', end, suffix = '', label, sublabel = '', isStatic = false, staticValue = '' }) {
  const [count, activate] = useCountUp(end ?? 0, 2000)
  const [ref, visible] = useScrollAnimation(0.1)

  useEffect(() => {
    if (visible && !isStatic) activate()
  }, [visible, isStatic])

  return (
    <div
      ref={ref}
      className={`text-center py-10 px-6 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
      }`}
    >
      <div className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight" style={{ color: '#C9910A', fontFamily: "'IBM Plex Mono', 'Courier New', monospace" }}>
        {isStatic ? staticValue : `${prefix}${count}${suffix}`}
      </div>
      <div className="text-sm font-semibold text-gray-700 mb-1">{label}</div>
      {sublabel && <div className="text-xs text-gray-400 max-w-[160px] mx-auto leading-relaxed">{sublabel}</div>}
    </div>
  )
}

export default function Stats() {
  return (
    <section className="bg-slate-50 py-4 border-t border-b border-gray-200" aria-label="Chiffres clés BudgetFlow">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
          <StatItem
            isStatic
            staticValue="+10M FCFA"
            label="Montants gérés"
            sublabel="Budget total gérable par exercice"
          />
          <StatItem
            end={3}
            suffix=" Acteurs"
            label="Workflow optimisé"
            sublabel="Admin · Gestionnaire · Comptable"
          />
          <StatItem
            end={32}
            label="Fonctionnalités"
            sublabel="Suite complète de gestion budgétaire"
          />
          <StatItem
            end={100}
            suffix="%"
            label="Traçabilité"
            sublabel="Journal d'audit automatique"
          />
        </div>
      </div>
    </section>
  )
}
