/**
 * BudgetFlow — Hooks TanStack Query v5 pour les rapports détaillés.
 */
import { useMutation } from '@tanstack/react-query'
import {
  getRapportMensuel,
  getRapportTrimestriel,
  getRapportAnnuel,
  getRapportAdhoc,
  exportRapport,
} from '../api/rapports'

function downloadBlob(blob, filename) {
  const url  = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href  = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/**
 * Génère un rapport (action explicite utilisateur).
 * Retourne { mutate, data, isPending, error, reset }
 */
export function useGenererRapport() {
  return useMutation({
    mutationFn: ({ type, ...params }) => {
      switch (type) {
        case 'MENSUEL':
          return getRapportMensuel(params.mois, params.annee).then(r => r.data)
        case 'TRIMESTRIEL':
          return getRapportTrimestriel(params.trimestre, params.annee).then(r => r.data)
        case 'ANNUEL':
          return getRapportAnnuel(params.annee).then(r => r.data)
        case 'ADHOC':
          return getRapportAdhoc(params).then(r => r.data)
        default:
          return Promise.reject(new Error(`Type inconnu : ${type}`))
      }
    },
  })
}

/**
 * Exporte un rapport en PDF ou Excel (déclenche un téléchargement).
 */
export function useExportRapport() {
  return useMutation({
    mutationFn: ({ type, format, params }) =>
      exportRapport(type, format, params).then(r => r.data),
    onSuccess: (blob, { type, format, params }) => {
      const label = (() => {
        if (type === 'MENSUEL')     return `${params.mois}-${params.annee}`
        if (type === 'TRIMESTRIEL') return `T${params.trimestre}-${params.annee}`
        if (type === 'ANNUEL')      return `${params.annee}`
        return `${params.date_debut}_${params.date_fin}`
      })()
      const ext      = format === 'EXCEL' ? 'xlsx' : 'pdf'
      const filename = `rapport_${type.toLowerCase()}_${label}.${ext}`
      downloadBlob(blob, filename)
    },
  })
}
