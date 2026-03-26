import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getBudgets, cloturerBudget, getRapportCloture } from '../../api/budget'
import { StatutBadge, AlerteBadge } from '../../components/StatusBadge'
import { Search, FileText, TrendingUp, Building2, X, Download, Printer } from 'lucide-react'
import { exportCSV, printPDF } from '../../utils/export'

const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))

const STATUTS = [
  { value: '',          label: 'Tous'      },
  { value: 'BROUILLON', label: 'Brouillon' },
  { value: 'SOUMIS',    label: 'Soumis'    },
  { value: 'APPROUVE',  label: 'Approuvé'  },
  { value: 'REJETE',    label: 'Rejeté'    },
  { value: 'CLOTURE',   label: 'Clôturé'   },
]

const jaugeColor = (taux) => {
  if (taux > 75) return '#F43F5E'
  if (taux > 50) return '#F59E0B'
  return '#22C55E'
}

export default function BudgetsPage() {
  const navigate       = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const deptId  = searchParams.get('departement') || ''
  const deptNom = searchParams.get('nom') || ''

  const [budgets,   setBudgets]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filtre,    setFiltre]    = useState('')
  const [search,    setSearch]    = useState('')
  const [actionBusy, setActionBusy] = useState(null)

  const handleCloturer = async (b, e) => {
    e.stopPropagation()
    if (!confirm(`Clôturer le budget ${b.code} – ${b.nom} ?`)) return
    setActionBusy(b.id)
    try { await cloturerBudget(b.id); load() }
    catch (err) { alert(err.response?.data?.detail || 'Erreur') }
    finally { setActionBusy(null) }
  }

  const handleRapport = async (b, e) => {
    e.stopPropagation()
    setActionBusy(b.id)
    try {
      const r = await getRapportCloture(b.id)
      const rpt = r.data
      const headers = ['Ligne', 'Alloué (FCFA)', 'Consommé (FCFA)', 'Disponible (FCFA)', 'Taux %']
      const rows = rpt.lignes.map(l => [
        l.libelle,
        new Intl.NumberFormat('fr-FR').format(l.montant_alloue),
        new Intl.NumberFormat('fr-FR').format(l.montant_consomme),
        new Intl.NumberFormat('fr-FR').format(l.disponible),
        `${l.taux}%`,
      ])
      printPDF(`Rapport de clôture — ${rpt.budget.code}`, headers, rows, {
        subtitle: `${rpt.budget.nom} · Clôturé le ${rpt.date_cloture ? new Date(rpt.date_cloture).toLocaleDateString('fr-FR') : '—'}`,
        stats: [
          { value: new Intl.NumberFormat('fr-FR').format(rpt.budget.montant_global) + ' FCFA', label: 'Budget global' },
          { value: new Intl.NumberFormat('fr-FR').format(rpt.budget.montant_consomme) + ' FCFA', label: 'Consommé' },
          { value: `${rpt.budget.taux}%`, label: 'Taux consommation' },
          { value: rpt.nb_depenses, label: 'Dépenses' },
        ],
      })
    } catch (err) { alert('Impossible de générer le rapport.') }
    finally { setActionBusy(null) }
  }

  const load = (statut = filtre) => {
    setLoading(true)
    const params = {}
    if (statut)  params.statut      = statut
    if (deptId)  params.departement = deptId
    getBudgets(params)
      .then(r => setBudgets(r.data.results ?? r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filtre, deptId])

  const filtered = budgets.filter(b =>
    !search ||
    b.code?.toLowerCase().includes(search.toLowerCase()) ||
    b.nom?.toLowerCase().includes(search.toLowerCase()) ||
    b.departement_nom?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {deptNom ? `Budgets — ${deptNom}` : 'Tous les budgets'}
          </h1>
          <p className="page-subtitle">Supervision et gestion complète des budgets</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-[6px] px-[14px] py-[6px] rounded-[20px] bg-[#EFF6FF] text-[#1D4ED8] text-[13px] font-semibold">
            <TrendingUp size={14} strokeWidth={2} />
            {filtered.length} budget{filtered.length !== 1 ? 's' : ''}
          </div>
          <button
            onClick={() => {
              const headers = ['Code', 'Nom', 'Département', 'Statut', 'Montant global (FCFA)', 'Consommé (FCFA)', 'Taux %', 'Date début', 'Date fin']
              const rows = filtered.map(b => [
                b.code, b.nom, b.departement_nom || '—', b.statut,
                fmt(b.montant_global), fmt(b.montant_consomme),
                `${parseFloat(b.taux_consommation || 0).toFixed(1)}%`,
                b.date_debut, b.date_fin,
              ])
              exportCSV(`budgets-${new Date().toISOString().slice(0,10)}`, headers, rows)
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Download size={13} strokeWidth={2} /> CSV
          </button>
          <button
            onClick={() => {
              const headers = ['Code', 'Nom', 'Département', 'Statut', 'Montant global', 'Taux %']
              const rows = filtered.map(b => [
                b.code, b.nom, b.departement_nom || '—', b.statut,
                fmt(b.montant_global) + ' FCFA',
                `${parseFloat(b.taux_consommation || 0).toFixed(1)}%`,
              ])
              printPDF('Liste des budgets', headers, rows, {
                subtitle: 'Supervision et gestion complète des budgets',
                stats: [
                  { value: filtered.length, label: 'Budgets affichés' },
                  { value: filtered.filter(b => b.statut === 'APPROUVE').length, label: 'Approuvés' },
                  { value: filtered.filter(b => b.statut === 'SOUMIS').length, label: 'En attente' },
                  { value: fmt(filtered.reduce((s, b) => s + parseFloat(b.montant_global || 0), 0)) + ' FCFA', label: 'Total' },
                ],
              })
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Printer size={13} strokeWidth={2} /> PDF
          </button>
        </div>
      </div>

      {/* Bandeau département actif */}
      {deptId && (
        <div className="flex items-center gap-[10px] px-4 py-[10px] rounded-[10px] mb-[14px] bg-[#EFF6FF] border border-[#BFDBFE]">
          <Building2 size={14} strokeWidth={2} className="text-[#2563EB] shrink-0" />
          <span className="text-[13px] text-[#1E40AF] flex-1">
            Filtre actif : <strong>{deptNom}</strong>
          </span>
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1 text-[#2563EB] text-[12px] font-semibold cursor-pointer"
          >
            <X size={13} strokeWidth={2.5} /> Effacer le filtre
          </button>
        </div>
      )}

      {/* Filtres */}
      <div className="filter-bar mb-[20px]">
        <div className="search-wrapper flex-1 min-w-[220px]">
          <Search size={15} strokeWidth={2} className="search-icon" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher par code, nom, département…"
          />
        </div>
        <div className="flex gap-[6px] flex-wrap">
          {STATUTS.map(s => (
            <button
              key={s.value}
              onClick={() => setFiltre(s.value)}
              className={`filter-pill${filtre === s.value ? ' active' : ''}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-[60px] text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-[13px] text-[#9CA3AF]">Chargement des budgets…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FileText size={28} strokeWidth={1.5} className="text-gray-400" />
            </div>
            <p className="empty-title">Aucun budget trouvé</p>
            <p className="empty-body">
              {search || filtre ? 'Essayez d\'ajuster vos filtres de recherche.' : 'Aucun budget n\'a encore été créé.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {['Code', 'Nom', 'Département', 'Gestionnaire', 'Global', 'Consommé', 'Taux', 'Statut', 'Alerte', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const taux = parseFloat(b.taux_consommation || 0)
                const color = jaugeColor(taux)
                return (
                  <tr
                    key={b.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/budgets/${b.id}`)}
                  >
                    <td>
                      <span className="code-tag">{b.code}</span>
                    </td>
                    <td className="font-medium max-w-[180px]">
                      <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                        {b.nom}
                      </div>
                    </td>
                    <td className="text-[#6B7280]">{b.departement_nom || '—'}</td>
                    <td className="text-[#6B7280]">{b.gestionnaire_nom || '—'}</td>
                    <td className="font-mono font-semibold whitespace-nowrap">
                      {fmt(b.montant_global)} <span className="text-[10px] text-[#9CA3AF]">FCFA</span>
                    </td>
                    <td className="font-mono text-[#4B5563] whitespace-nowrap">
                      {fmt(b.montant_consomme)} <span className="text-[10px] text-[#9CA3AF]">FCFA</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="exec-bar w-[60px]">
                          <div
                            className="exec-bar-fill"
                            style={{
                              width: `${Math.min(taux, 100)}%`,
                              background: `linear-gradient(90deg, ${jaugeColor(Math.max(0, taux - 20))}, ${color})`,
                            }}
                          />
                        </div>
                        <span
                          className="text-[11px] font-bold font-mono"
                          style={{ color: taux > 75 ? 'var(--color-danger-600)' : taux > 50 ? 'var(--color-warning-600)' : '#374151' }}
                        >
                          {taux}%
                        </span>
                      </div>
                    </td>
                    <td><StatutBadge statut={b.statut} /></td>
                    <td><AlerteBadge niveau={b.niveau_alerte} /></td>
                    <td onClick={e => e.stopPropagation()} className="whitespace-nowrap" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <button
                        onClick={() => navigate(`/budgets/${b.id}`)}
                        className="btn btn-secondary btn-sm"
                      >
                        Voir
                      </button>
                      {b.statut === 'APPROUVE' && (
                        <button
                          onClick={(e) => handleCloturer(b, e)}
                          disabled={actionBusy === b.id}
                          className="btn btn-sm"
                          style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', color: '#fff', border: 'none', gap: 4 }}
                        >
                          Clôturer
                        </button>
                      )}
                      {b.statut === 'CLOTURE' && (
                        <button
                          onClick={(e) => handleRapport(b, e)}
                          disabled={actionBusy === b.id}
                          className="btn btn-sm"
                          style={{ background: 'var(--color-info-600)', color: '#fff', border: 'none', gap: 4 }}
                        >
                          Rapport
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
