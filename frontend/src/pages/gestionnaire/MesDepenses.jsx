import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDepenses } from '../../api/depenses'
import { CreditCard, AlertTriangle, RotateCcw, FileText, Paperclip } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))

const fmtDate = (iso) => {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR')
}

const STATUT_STYLE = {
  SAISIE:  { bg: 'var(--color-warning-50)',  color: 'var(--color-warning-700)', label: 'En attente' },
  VALIDEE: { bg: 'var(--color-success-50)',  color: 'var(--color-success-700)', label: 'Validée'    },
  REJETEE: { bg: 'var(--color-danger-50)',   color: 'var(--color-danger-700)',  label: 'Rejetée'    },
}

const FILTRES = [
  { key: '',        label: 'Toutes' },
  { key: 'SAISIE',  label: 'En attente' },
  { key: 'VALIDEE', label: 'Validées' },
  { key: 'REJETEE', label: 'Rejetées' },
]

export default function MesDepenses() {
  const navigate = useNavigate()
  const [depenses, setDepenses] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [filtre,   setFiltre]   = useState('')

  const load = (statut) => {
    setLoading(true); setError('')
    getDepenses({ statut: statut || undefined })
      .then(r => setDepenses(r.data?.data ?? r.data?.results ?? r.data ?? []))
      .catch(err => setError(err.response?.data?.detail || err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filtre) }, [filtre])

  const totaux = {
    saisies:  depenses.filter(d => d.statut === 'SAISIE').length,
    validees: depenses.filter(d => d.statut === 'VALIDEE').length,
    rejetees: depenses.filter(d => d.statut === 'REJETEE').length,
    montant:  depenses.reduce((s, d) => s + parseFloat(d.montant || 0), 0),
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes dépenses</h1>
          <p className="page-subtitle">
            Dépenses enregistrées sur vos budgets approuvés
          </p>
        </div>
        <button
          onClick={() => navigate('/mes-budgets')}
          className="btn btn-primary btn-md"
          style={{ gap: 7 }}
        >
          <CreditCard size={15} strokeWidth={2} />
          Saisir depuis un budget
        </button>
      </div>

      {/* KPI cards */}
      {!loading && !error && (
        <div className="kpi-grid" style={{ marginBottom: 20 }}>
          <div className="card">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>Total dépenses</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '20px', color: 'var(--color-gray-900)' }}>{fmt(totaux.montant)}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: 2 }}>FCFA</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-warning-600)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>En attente</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '20px', color: 'var(--color-warning-700)' }}>{totaux.saisies}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: 2 }}>dépense{totaux.saisies !== 1 ? 's' : ''}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-success-600)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>Validées</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '20px', color: 'var(--color-success-700)' }}>{totaux.validees}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: 2 }}>dépense{totaux.validees !== 1 ? 's' : ''}</div>
          </div>
          <div className="card">
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-danger-600)', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>Rejetées</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '20px', color: 'var(--color-danger-700)' }}>{totaux.rejetees}</div>
            <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: 2 }}>dépense{totaux.rejetees !== 1 ? 's' : ''}</div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        {FILTRES.map(f => (
          <button
            key={f.key}
            onClick={() => setFiltre(f.key)}
            className={`filter-pill${filtre === f.key ? ' active' : ''}`}
          >
            {f.label}
          </button>
        ))}
        {filtre && (
          <button
            onClick={() => setFiltre('')}
            className="btn btn-secondary btn-sm"
            style={{ gap: 5, marginLeft: 4 }}
          >
            <RotateCcw size={12} strokeWidth={2} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-start',
          padding: '12px 16px', borderRadius: 10, marginBottom: 16,
          background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-200)',
        }}>
          <AlertTriangle size={15} style={{ color: 'var(--color-danger-500)', flexShrink: 0, marginTop: 1 }} />
          <span style={{ color: 'var(--color-danger-700)', fontSize: '13px' }}>{error}</span>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-gray-400)' }}>Chargement…</p>
        </div>
      ) : depenses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <CreditCard size={28} strokeWidth={1.5} style={{ color: 'var(--color-gray-400)' }} />
          </div>
          <p className="empty-title">Aucune dépense</p>
          <p className="empty-body">
            {filtre
              ? 'Aucune dépense pour ce filtre.'
              : 'Ouvrez un budget approuvé pour enregistrer vos premières dépenses.'}
          </p>
          <button
            onClick={() => navigate('/mes-budgets')}
            className="btn btn-primary btn-md"
            style={{ marginTop: 16, gap: 7 }}
          >
            <FileText size={15} strokeWidth={2} /> Voir mes budgets
          </button>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Référence', 'Budget', 'Ligne', 'Montant', 'Date', 'Statut', 'Note'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {depenses.map(d => {
                const s = STATUT_STYLE[d.statut] || { bg: 'var(--color-gray-100)', color: 'var(--color-gray-600)', label: d.statut }
                return (
                  <tr key={d.id}>
                    <td>
                      <span className="code-tag">{d.reference || String(d.id).slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '13px' }}>{d.budget_reference || '—'}</td>
                    <td style={{ fontSize: '12px', color: 'var(--color-gray-600)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {d.ligne_designation || '—'}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {fmt(d.montant)} FCFA
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--color-gray-400)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>
                      {fmtDate(d.date_depense)}
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20,
                        fontSize: '11px', fontWeight: 700,
                        background: s.bg, color: s.color,
                        whiteSpace: 'nowrap',
                      }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--color-gray-500)', maxWidth: 180 }}>
                      {d.statut === 'REJETEE' && d.motif_rejet ? (
                        <span style={{ color: 'var(--color-danger-600)', fontStyle: 'italic' }}>
                          {d.motif_rejet}
                        </span>
                      ) : (
                        d.note || '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Info */}
      {!loading && depenses.length > 0 && (
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          marginTop: 14, padding: '8px 14px', borderRadius: 8,
          background: 'var(--color-primary-50)', border: '1px solid var(--color-primary-100)',
          fontSize: '12px', color: 'var(--color-primary-700)',
        }}>
          <Paperclip size={13} strokeWidth={2} style={{ flexShrink: 0 }} />
          Pour saisir une nouvelle dépense, ouvrez le budget concerné depuis <strong
            onClick={() => navigate('/mes-budgets')}
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >Mes budgets</strong> et cliquez sur une ligne de dépense.
        </div>
      )}
    </div>
  )
}
