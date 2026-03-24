/**
 * AnomalieAlert — Affiche les anomalies IA d'un budget (F3)
 * Usage: <AnomalieAlert budgetId={id} isComptable={true} />
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { detecterAnomalies, getAnomalies, traiterAnomalie } from '../../api/ia'

const NIVEAU_CFG = {
  FAIBLE:   { icon: 'ℹ️',  bg: '#eff6ff', border: '#bfdbfe', text: '#1a56db' },
  MOYEN:    { icon: '⚠️',  bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  ELEVE:    { icon: '🔥',  bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
  CRITIQUE: { icon: '🚨',  bg: '#fff1f2', border: '#fecdd3', text: '#be123c' },
}

const STATUT_LABEL = {
  DETECTEE:    { label: 'Détectée',    color: '#b45309' },
  CONFIRMEE:   { label: 'Confirmée',   color: '#be123c' },
  FAUX_POSITIF:{ label: 'Faux positif',color: '#6b7280' },
  RESOLUE:     { label: 'Résolue',     color: '#057a55' },
}

export default function AnomalieAlert({ budgetId, isComptable = false }) {
  const [scanning, setScanning] = useState(false)
  const qc = useQueryClient()

  const { data: result, isLoading } = useQuery({
    queryKey: ['anomalies-budget', budgetId],
    queryFn: () => getAnomalies({ budget: budgetId }).then(r => r.data.data),
    retry: false,
  })

  const { mutate: scanner } = useMutation({
    mutationFn: () => {
      setScanning(true)
      return detecterAnomalies(budgetId)
    },
    onSettled: () => {
      setScanning(false)
      qc.invalidateQueries(['anomalies-budget', budgetId])
    },
  })

  const anomalies = Array.isArray(result) ? result : (result?.results || [])
  const critiques = anomalies.filter(a => ['ELEVE', 'CRITIQUE'].includes(a.niveau) && a.statut === 'DETECTEE')

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>🔍</span>
          <span className="font-bold text-[.85rem] text-[#1F2937]">Détection d'anomalies IA</span>
          {critiques.length > 0 && (
            <span className="bg-[#fff1f2] text-[#be123c] text-[.65rem] font-bold px-[7px] py-[2px] rounded-[10px]">
              {critiques.length} alerte{critiques.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isComptable && (
          <button
            onClick={() => scanner()}
            disabled={scanning}
            className={`bg-[#F9FAFB] border border-[#E5E7EB] rounded-[6px] px-3 py-[5px] text-[.72rem] font-semibold text-[#4B5563]${scanning ? ' cursor-not-allowed' : ' cursor-pointer'}`}
          >
            {scanning ? '⏳ Scan…' : '🔄 Re-scanner'}
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        {isLoading && <div className="text-[#9CA3AF] text-[.8rem] text-center py-[10px]">Chargement…</div>}

        {!isLoading && anomalies.length === 0 && (
          <div className="text-[#9CA3AF] text-[.8rem] text-center py-2">
            ✅ Aucune anomalie détectée
          </div>
        )}

        {anomalies.map(anomalie => (
          <AnomalieItem key={anomalie.id} anomalie={anomalie} isComptable={isComptable} budgetId={budgetId} />
        ))}
      </div>
    </div>
  )
}

function AnomalieItem({ anomalie, isComptable, budgetId }) {
  const [showActions, setShowActions] = useState(false)
  const qc = useQueryClient()
  const cfg = NIVEAU_CFG[anomalie.niveau] || NIVEAU_CFG.FAIBLE
  const sLabel = STATUT_LABEL[anomalie.statut]

  const { mutate: traiter, isPending } = useMutation({
    mutationFn: (statut) => traiterAnomalie(anomalie.id, statut),
    onSuccess: () => {
      qc.invalidateQueries(['anomalies-budget', budgetId])
      setShowActions(false)
    },
  })

  return (
    <div
      className="rounded-[8px] px-3 py-[10px] mb-2"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex gap-2 flex-1">
          <span className="text-[1rem] shrink-0">{cfg.icon}</span>
          <div>
            <div className="flex items-center gap-[6px] flex-wrap">
              <span className="font-bold text-[.78rem]" style={{ color: cfg.text }}>{anomalie.type_anomalie}</span>
              <span
                className="text-[.65rem] px-[6px] py-[1px] rounded-[4px]"
                style={{ background: sLabel?.color + '20', color: sLabel?.color }}
              >
                {sLabel?.label}
              </span>
              <span className="text-[.62rem] text-[#9CA3AF]">
                {Math.round(anomalie.score_confiance * 100)}% confiance
              </span>
            </div>
            <div className="text-[.74rem] text-[#4B5563] mt-1 leading-[1.5]">
              {anomalie.description}
            </div>
            {anomalie.valeur_detectee != null && (
              <div className="text-[.68rem] text-[#6B7280] mt-1">
                Détecté: <strong>{Number(anomalie.valeur_detectee).toLocaleString('fr-FR')} FCFA</strong>
                {anomalie.valeur_attendue != null && <> · Attendu: {Number(anomalie.valeur_attendue).toLocaleString('fr-FR')} FCFA</>}
              </div>
            )}
          </div>
        </div>

        {isComptable && anomalie.statut === 'DETECTEE' && (
          <div className="relative shrink-0">
            <button
              onClick={() => setShowActions(v => !v)}
              className="bg-none border border-[#D1D5DB] rounded-[6px] px-2 py-1 text-[.7rem] cursor-pointer text-[#4B5563]"
            >
              ⋯
            </button>
            {showActions && (
              <div className="absolute right-0 top-7 z-[100] bg-white border border-[#E5E7EB] rounded-[8px] shadow-md min-w-[160px] p-1">
                {[
                  ['CONFIRMEE', '✅ Confirmer', '#be123c'],
                  ['FAUX_POSITIF', '❌ Faux positif', '#6b7280'],
                  ['RESOLUE', '🔓 Marquer résolue', '#057a55'],
                ].map(([val, label, color]) => (
                  <button
                    key={val}
                    onClick={() => traiter(val)}
                    disabled={isPending}
                    className="w-full bg-none border-none text-left px-[10px] py-[7px] text-[.75rem] cursor-pointer rounded-[6px] hover:bg-[#F9FAFB]"
                    style={{ color }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
