import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDepenses, validerDepense, rejeterDepense } from '../../api/depenses'
import { Search, CheckCircle2, XCircle, Receipt } from 'lucide-react'
import { DepenseBadge } from '../../components/StatusBadge'

export default function DepensesPage() {
  const [filtreStatut, setFiltreStatut] = useState('SAISIE')
  const [search,       setSearch]       = useState('')
  const [rejetModal,   setRejetModal]   = useState(null)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['depenses', filtreStatut, search],
    queryFn: () => getDepenses({ statut: filtreStatut || undefined, search }).then(r => r.data),
  })

  const { mutate: valider, isPending: validating } = useMutation({
    mutationFn: (id) => validerDepense(id, {}),
    onSuccess: () => qc.invalidateQueries(['depenses']),
  })

  const { mutate: rejeter } = useMutation({
    mutationFn: ({ id, motif }) => rejeterDepense(id, { motif }),
    onSuccess: () => { qc.invalidateQueries(['depenses']); setRejetModal(null) },
  })

  const depenses = Array.isArray(data?.data)
    ? data.data
    : (data?.data?.results || data?.results || [])

  const FILTRES = [
    { val: '',          label: 'Toutes'     },
    { val: 'SAISIE',    label: 'En attente' },
    { val: 'VALIDEE',   label: 'Validées'   },
    { val: 'REJETEE',   label: 'Rejetées'   },
  ]

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Suivi des dépenses</h1>
          <p className="page-subtitle">Validation et suivi des dépenses réelles sur budgets approuvés</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-bar mb-[20px]">
        <div className="search-wrapper flex-1 max-w-[360px]">
          <Search size={14} strokeWidth={2} className="search-icon" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher fournisseur, référence…"
          />
        </div>
        <div className="flex gap-[6px]">
          {FILTRES.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setFiltreStatut(val)}
              className={`filter-pill${filtreStatut === val ? ' active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-[60px] text-center">
            <div className="spinner mx-auto mb-[12px]" />
            <p className="text-[13px] text-gray-400">Chargement…</p>
          </div>
        ) : depenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Receipt size={28} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <p className="empty-title">Aucune dépense</p>
            <p className="empty-body">
              {filtreStatut ? 'Aucune dépense avec ce statut.' : 'Aucune dépense enregistrée.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {['Référence', 'Fournisseur', 'Montant', 'Budget', 'Ligne', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depenses.map(d => (
                <tr key={d.id}>
                  <td>
                    <span className="code-tag">{d.reference}</span>
                  </td>
                  <td className="font-medium">{d.fournisseur}</td>
                  <td className="font-mono font-bold">
                    {Number(d.montant).toLocaleString('fr-FR')} <span className="text-[10px] text-gray-400">FCFA</span>
                  </td>
                  <td className="text-gray-500 text-[12px]">{d.budget_reference || '—'}</td>
                  <td className="text-gray-500 text-[12px] max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {d.ligne_designation || '—'}
                  </td>
                  <td className="text-gray-400 text-[12px]">
                    {d.date_depense ? new Date(d.date_depense).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td>
                    <DepenseBadge statut={d.statut} />
                  </td>
                  <td>
                    {d.statut === 'SAISIE' && (
                      <div className="flex gap-[6px]">
                        <button
                          onClick={() => valider(d.id)}
                          disabled={validating}
                          className="btn btn-success btn-sm gap-[5px]"
                        >
                          <CheckCircle2 size={12} strokeWidth={2.5} />
                          Valider
                        </button>
                        <button
                          onClick={() => setRejetModal(d.id)}
                          className="btn btn-danger btn-sm gap-[5px]"
                        >
                          <XCircle size={12} strokeWidth={2.5} />
                          Rejeter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal rejet */}
      {rejetModal && (
        <RejetModal
          id={rejetModal}
          onConfirm={(motif) => rejeter({ id: rejetModal, motif })}
          onClose={() => setRejetModal(null)}
        />
      )}
    </div>
  )
}

function RejetModal({ onConfirm, onClose }) { // eslint-disable-line
  const [motif, setMotif] = useState('')
  const valid = motif.length >= 20

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-[420px]" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="flex items-center gap-[8px] text-danger-700 font-bold text-[15px]">
            <XCircle size={18} strokeWidth={2} />
            Rejeter la dépense
          </h3>
        </div>
        <div className="modal-body">
          <label className="form-label">Motif du rejet</label>
          <textarea
            value={motif}
            onChange={e => setMotif(e.target.value)}
            placeholder="Expliquez pourquoi cette dépense est rejetée…"
            rows={4}
            className="w-full border-[1.5px] border-gray-200 rounded-[9px] px-[14px] py-[10px] text-[13px] resize-y box-border outline-none font-[inherit]"
          />
          <p className={`text-[11px] mt-[4px]${valid ? ' text-success-600' : ' text-danger-500'}`}>
            {motif.length}/20 caractères minimum
          </p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-md">Annuler</button>
          <button
            onClick={() => valid && onConfirm(motif)}
            disabled={!valid}
            className="btn btn-danger btn-md gap-[7px]"
            style={{ opacity: valid ? 1 : 0.5 }}
          >
            <XCircle size={14} strokeWidth={2} />
            Rejeter
          </button>
        </div>
      </div>
    </div>
  )
}
