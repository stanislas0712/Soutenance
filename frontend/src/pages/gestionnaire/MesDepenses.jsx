import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDepenses } from '../../api/depenses'
import {
  CreditCard, AlertTriangle, RotateCcw, FileText, Paperclip,
  Search, Eye, ChevronRight, Download, X,
} from 'lucide-react'
import { exportCSV } from '../../utils/export'

const fmt     = (n)   => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR') : '—'

const STATUT = {
  SAISIE:  { bg: 'var(--color-warning-50)',  color: 'var(--color-warning-700)', label: 'En attente' },
  VALIDEE: { bg: 'var(--color-success-50)',  color: 'var(--color-success-700)', label: 'Validée'    },
  REJETEE: { bg: 'var(--color-danger-50)',   color: 'var(--color-danger-700)',  label: 'Rejetée'    },
}

const TABS = [
  { key: '',        label: 'Toutes',     color: 'var(--color-primary-600)' },
  { key: 'SAISIE',  label: 'En attente', color: '#D97706' },
  { key: 'VALIDEE', label: 'Validées',   color: '#059669' },
  { key: 'REJETEE', label: 'Rejetées',   color: '#DC2626' },
]

export default function MesDepenses() {
  const navigate = useNavigate()
  const [allDepenses, setAllDepenses] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [tab,         setTab]         = useState('')
  const [search,      setSearch]      = useState('')
  const [detailGroup, setDetailGroup] = useState(null)

  useEffect(() => {
    setLoading(true); setError('')
    getDepenses({})
      .then(r => setAllDepenses(r.data?.data ?? r.data?.results ?? r.data ?? []))
      .catch(err => setError(err.response?.data?.detail || err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }, [])

  const countFor = (key) => key ? allDepenses.filter(d => d.statut === key).length : allDepenses.length
  const totalMontant = allDepenses.reduce((s, d) => s + parseFloat(d.montant || 0), 0)

  const q = search.trim().toLowerCase()
  const filtered = allDepenses
    .filter(d => !tab || d.statut === tab)
    .filter(d => !q ||
      d.budget_reference?.toLowerCase().includes(q) ||
      d.budget_nom?.toLowerCase().includes(q) ||
      d.ligne_designation?.toLowerCase().includes(q) ||
      d.reference?.toLowerCase().includes(q)
    )

  const groups = Object.values(
    filtered.reduce((acc, d) => {
      const key = d.budget_reference || '—'
      if (!acc[key]) acc[key] = {
        reference: key,
        nom: (d.budget_nom && d.budget_nom !== '—') ? d.budget_nom : key,
        items: [],
      }
      acc[key].items.push(d)
      return acc
    }, {})
  )

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes dépenses</h1>
          <p className="page-subtitle">Dépenses enregistrées sur vos budgets approuvés</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => exportCSV('Mes_Depenses',
              ['Référence', 'Budget', 'Ligne', 'Montant (FCFA)', 'Statut', 'Date'],
              filtered.map(d => [d.reference || '—', d.budget_reference || '—', d.ligne_designation || '—', d.montant, d.statut, fmtDate(d.date_depense)])
            )}
            className="btn btn-secondary btn-md" style={{ gap: 7 }}
          >
            <Download size={15} strokeWidth={2} /> CSV
          </button>
          <button onClick={() => navigate('/mes-budgets')} className="btn btn-primary btn-md" style={{ gap: 7 }}>
            <CreditCard size={15} strokeWidth={2} /> Saisir depuis un budget
          </button>
        </div>
      </div>

      {/* KPI */}
      {!loading && !error && (
        <div className="kpi-grid">
          {[
            { label: 'Total dépensé', val: fmt(totalMontant), sub: 'FCFA',      color: 'var(--color-gray-500)'    },
            { label: 'En attente',    val: countFor('SAISIE'),  sub: 'dépenses', color: 'var(--color-warning-600)' },
            { label: 'Validées',      val: countFor('VALIDEE'), sub: 'dépenses', color: 'var(--color-success-600)' },
            { label: 'Rejetées',      val: countFor('REJETEE'), sub: 'dépenses', color: 'var(--color-danger-600)'  },
          ].map(k => (
            <div key={k.label} className="card">
              <div style={{ fontSize: '11px', fontWeight: 700, color: k.color, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '20px', color: 'var(--color-gray-900)' }}>{k.val}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: 2 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '1px solid var(--color-gray-200)' }}>
        {TABS.map(t => {
          const active = tab === t.key
          return (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 18px 10px', fontSize: '13px',
              fontWeight: active ? 700 : 500,
              color: active ? t.color : 'var(--color-gray-500)',
              borderBottom: active ? `2.5px solid ${t.color}` : '2.5px solid transparent',
              display: 'flex', alignItems: 'center', gap: 6, transition: 'color .15s',
            }}>
              {t.label}
              <span style={{
                background: active ? t.color : 'var(--color-gray-200)',
                color: active ? '#fff' : 'var(--color-gray-600)',
                fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: 9,
              }}>
                {countFor(t.key)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Recherche */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <div className="search-wrapper" style={{ maxWidth: 360 }}>
          <Search size={14} strokeWidth={2} className="search-icon" />
          <input className="search-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher budget, ligne, référence…" />
        </div>
        {search && (
          <button onClick={() => setSearch('')} className="btn btn-secondary btn-sm" style={{ gap: 5 }}>
            <RotateCcw size={12} strokeWidth={2} /> Effacer
          </button>
        )}
      </div>

      {/* Erreur */}
      {error && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 16px', borderRadius: 10, marginBottom: 16, background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-200)' }}>
          <AlertTriangle size={15} style={{ color: 'var(--color-danger-500)', flexShrink: 0 }} />
          <span style={{ color: 'var(--color-danger-700)', fontSize: '13px' }}>{error}</span>
        </div>
      )}

      {/* Contenu */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: '13px', color: 'var(--color-gray-400)' }}>Chargement…</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><CreditCard size={28} strokeWidth={1.5} style={{ color: 'var(--color-gray-400)' }} /></div>
          <p className="empty-title">Aucune dépense</p>
          <p className="empty-body">
            {q ? `Aucun résultat pour « ${search} »`
              : tab ? 'Aucune dépense pour ce filtre.'
              : 'Ouvrez un budget approuvé pour enregistrer vos premières dépenses.'}
          </p>
          {!q && !tab && (
            <button onClick={() => navigate('/mes-budgets')} className="btn btn-primary btn-md" style={{ marginTop: 16, gap: 7 }}>
              <FileText size={15} strokeWidth={2} /> Voir mes budgets
            </button>
          )}
        </div>
      ) : (
        <div className="card p-0 overflow-hidden" style={{ overflowX: 'auto' }}>
          {/* Entêtes colonnes */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 180px 160px 120px',
            minWidth: 580, padding: '8px 20px',
            background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-200)',
            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--color-gray-500)',
          }}>
            <span>Budget</span>
            <span style={{ textAlign: 'right' }}>Montant total</span>
            <span style={{ textAlign: 'center' }}>Avancement</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {groups.map((g, i) => {
            const total     = g.items.reduce((s, d) => s + parseFloat(d.montant || 0), 0)
            const validated = g.items.filter(d => d.statut === 'VALIDEE').length
            const pending   = g.items.filter(d => d.statut === 'SAISIE').length
            const rejected  = g.items.filter(d => d.statut === 'REJETEE').length
            const tauxValid = g.items.length > 0 ? (validated / g.items.length) * 100 : 0

            return (
              <div key={g.reference} style={{
                display: 'grid', gridTemplateColumns: '1fr 180px 160px 120px',
                minWidth: 580, padding: '14px 20px',
                borderBottom: i < groups.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                alignItems: 'center', cursor: 'pointer', transition: 'background .12s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-gray-50)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
                onClick={() => setDetailGroup(g)}
              >
                {/* Info budget */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span className="code-tag">{g.reference}</span>
                    {pending > 0 && (
                      <span style={{ background: 'var(--color-warning-50)', color: 'var(--color-warning-700)', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: 9 }}>
                        {pending} en attente
                      </span>
                    )}
                    {rejected > 0 && (
                      <span style={{ background: 'var(--color-danger-50)', color: 'var(--color-danger-700)', fontSize: '10px', fontWeight: 700, padding: '1px 7px', borderRadius: 9 }}>
                        {rejected} rejetée{rejected > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}>
                    {g.nom}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
                    {g.items.length} dépense{g.items.length > 1 ? 's' : ''} · {validated} validée{validated !== 1 ? 's' : ''}
                  </div>
                </div>

                {/* Montant */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-900)' }}>{fmt(total)}</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-gray-400)', marginTop: 1 }}>FCFA</div>
                </div>

                {/* Jauge */}
                <div style={{ padding: '0 12px' }}>
                  <div className="progress-track">
                    <div className={`progress-fill ${tauxValid > 75 ? 'progress-fill-green' : tauxValid > 0 ? 'progress-fill-orange' : ''}`} style={{ width: `${Math.min(tauxValid, 100)}%` }} />
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-gray-500)', textAlign: 'center', marginTop: 3, fontWeight: 600 }}>
                    {tauxValid.toFixed(0)}% validé
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
                  <button onClick={() => setDetailGroup(g)} className="btn btn-secondary btn-sm" style={{ gap: 5 }}>
                    <Eye size={12} strokeWidth={2} /> Voir
                  </button>
                  <ChevronRight size={14} strokeWidth={2} style={{ color: 'var(--color-gray-300)' }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailGroup && (
        <DepenseGroupDetail group={detailGroup} onClose={() => setDetailGroup(null)} />
      )}
    </div>
  )
}

/* ── Modal détail d'un groupe de dépenses (lecture seule — gestionnaire) ── */
function DepenseGroupDetail({ group, onClose }) {
  const total          = group.items.reduce((s, d) => s + parseFloat(d.montant || 0), 0)
  const validated      = group.items.filter(d => d.statut === 'VALIDEE')
  const pending        = group.items.filter(d => d.statut === 'SAISIE')
  const rejected       = group.items.filter(d => d.statut === 'REJETEE')
  const totalValidated = validated.reduce((s, d) => s + parseFloat(d.montant || 0), 0)

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 700, padding: 0, overflow: 'hidden' }}>

        {/* En-tête gradient */}
        <div style={{ background: '#1E3A8A', padding: '24px 28px 20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,.06)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 80, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
          <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}>
            <X size={15} strokeWidth={2} />
          </button>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, paddingRight: 40 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ background: 'rgba(255,255,255,.18)', borderRadius: 7, padding: '4px 10px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.5px' }}>
                  {group.reference}
                </div>
                <span style={{ fontSize: '11px', opacity: .7 }}>{group.items.length} dépense{group.items.length > 1 ? 's' : ''}</span>
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', marginBottom: 8 }}>{group.nom}</div>
              <div style={{ display: 'flex', gap: 16, fontSize: '12px', opacity: .85 }}>
                <span>✓ {validated.length} validée{validated.length !== 1 ? 's' : ''}</span>
                <span>⏳ {pending.length} en attente</span>
                {rejected.length > 0 && <span>✕ {rejected.length} rejetée{rejected.length > 1 ? 's' : ''}</span>}
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', opacity: .6, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Total</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>{fmt(total)}</div>
              <div style={{ fontSize: '11px', opacity: .65, marginTop: 3 }}>FCFA</div>
            </div>
          </div>
        </div>

        {/* Mini KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderBottom: '1px solid var(--color-gray-100)' }}>
          {[
            { label: 'Validé',     val: fmt(totalValidated) + ' FCFA',                                         color: 'var(--color-success-700)', bg: 'var(--color-success-50)' },
            { label: 'En attente', val: pending.length + ' dépense' + (pending.length !== 1 ? 's' : ''),       color: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' },
            { label: 'Rejeté',     val: rejected.length + ' dépense' + (rejected.length !== 1 ? 's' : ''),     color: 'var(--color-danger-700)',  bg: 'var(--color-danger-50)'  },
          ].map((k, idx, arr) => (
            <div key={k.label} style={{ padding: '12px 20px', background: k.bg, borderRight: idx < arr.length - 1 ? '1px solid var(--color-gray-100)' : 'none', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: k.color, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: k.color }}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Pièces justificatives — niveau dépense (une pour tout le groupe) */}
        {(() => {
          const urls = [...new Set(group.items.map(d => d.piece_justificative_url).filter(Boolean))]
          const extras = group.items.flatMap(d => d.pieces || [])
          const note = group.items.find(d => d.note)?.note
          if (!urls.length && !extras.length && !note) return null
          return (
            <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--color-gray-100)', background: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.4px', flexShrink: 0 }}>
                Pièces justificatives
              </div>
              {urls.map((url, i) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: '#fff', border: '1px solid var(--color-primary-200)', fontSize: '12px', color: 'var(--color-primary-700)', fontWeight: 600, cursor: 'pointer' }}>
                    <Paperclip size={12} strokeWidth={2} /> Justificatif {urls.length > 1 ? i + 1 : ''}
                  </div>
                </a>
              ))}
              {extras.map((p, i) => (
                <a key={`extra-${i}`} href={p.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, background: '#fff', border: '1px solid var(--color-gray-200)', fontSize: '12px', color: 'var(--color-gray-600)', fontWeight: 600, cursor: 'pointer' }}>
                    <Paperclip size={12} strokeWidth={2} /> {p.nom || `Pièce ${i + 2}`}
                  </div>
                </a>
              ))}
              {note && (
                <span style={{ fontSize: '12px', color: 'var(--color-gray-500)', fontStyle: 'italic' }}>Note : {note}</span>
              )}
              {!urls.length && !extras.length && (
                <span style={{ fontSize: '12px', color: 'var(--color-gray-400)', fontStyle: 'italic' }}>Aucune pièce justificative jointe</span>
              )}
            </div>
          )
        })()}

        {/* Liste des lignes */}
        <div style={{ maxHeight: '48vh', overflowY: 'auto' }}>
          {group.items.map((d, i) => {
            const s = STATUT[d.statut] || { bg: 'var(--color-gray-100)', color: 'var(--color-gray-600)', label: d.statut }
            return (
              <div key={d.id} style={{
                padding: '14px 24px',
                borderBottom: i < group.items.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                display: 'grid', gridTemplateColumns: '1fr 130px',
                alignItems: 'center', gap: 16,
              }}>
                {/* Info ligne */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--color-gray-100)', color: 'var(--color-gray-700)', padding: '2px 7px', borderRadius: 5, fontWeight: 700 }}>
                      {d.reference}
                    </span>
                    <span style={{ padding: '2px 9px', borderRadius: 20, fontSize: '10px', fontWeight: 700, background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-gray-800)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.ligne_designation || '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
                    {fmtDate(d.date_depense)}
                    {d.fournisseur && d.fournisseur !== '—' && ` · ${d.fournisseur}`}
                  </div>
                  {d.statut === 'REJETEE' && d.motif_rejet && (
                    <div style={{ marginTop: 4, fontSize: '11px', color: 'var(--color-danger-600)', fontStyle: 'italic' }}>
                      Motif : {d.motif_rejet}
                    </div>
                  )}
                </div>

                {/* Montant */}
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-900)' }}>{fmt(d.montant)}</div>
                  <div style={{ fontSize: '10px', color: 'var(--color-gray-400)' }}>FCFA</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '14px 24px', borderTop: '1px solid var(--color-gray-100)', background: 'var(--color-gray-50)' }}>
          <button onClick={onClose} className="btn btn-primary btn-md">Fermer</button>
        </div>
      </div>
    </div>
  )
}
