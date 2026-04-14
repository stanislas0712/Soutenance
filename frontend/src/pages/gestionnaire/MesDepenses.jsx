import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDepenses } from '../../api/depenses'
import { exportCSV, printPDF } from '../../utils/export'
import { CreditCard, AlertTriangle, RotateCcw, FileText, Paperclip, Search, Eye, ExternalLink, Tag, Building2, Receipt, Calendar, User, AlertCircle, Download, Printer } from 'lucide-react'

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
  const [depenses,     setDepenses]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [filtre,       setFiltre]       = useState('')
  const [search,       setSearch]       = useState('')
  const [detailModal,  setDetailModal]  = useState(null)
  const [visibleCount, setVisibleCount] = useState(10)

  const [allDepenses, setAllDepenses] = useState([])

  const load = (statut) => {
    setLoading(true); setError('')
    getDepenses({ statut: statut || undefined })
      .then(r => setDepenses(r.data?.data ?? r.data?.results ?? r.data ?? []))
      .catch(err => setError(err.response?.data?.detail || err.message || 'Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load(filtre) }, [filtre])

  // Charger toutes les dépenses (sans filtre statut) pour les comptages des pills
  useEffect(() => {
    getDepenses({})
      .then(r => setAllDepenses(r.data?.data ?? r.data?.results ?? r.data ?? []))
      .catch(() => {})
  }, [])

  const countFor = (key) => key
    ? allDepenses.filter(d => d.statut === key).length
    : allDepenses.length

  const totaux = {
    saisies:  allDepenses.filter(d => d.statut === 'SAISIE').length,
    validees: allDepenses.filter(d => d.statut === 'VALIDEE').length,
    rejetees: allDepenses.filter(d => d.statut === 'REJETEE').length,
    montant:  allDepenses.reduce((s, d) => s + parseFloat(d.montant || 0), 0),
  }

  const q = search.trim().toLowerCase()
  const filtered = q
    ? depenses.filter(d =>
        d.reference?.toLowerCase().includes(q) ||
        d.budget_reference?.toLowerCase().includes(q) ||
        d.ligne_designation?.toLowerCase().includes(q) ||
        d.note?.toLowerCase().includes(q)
      )
    : depenses
  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

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
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => exportCSV('Mes_Depenses', ['Référence', 'Budget', 'Ligne', 'Montant (FCFA)', 'Statut', 'Date', 'Note'],
              visible.map(d => [d.reference || '—', d.budget_reference || '—', d.ligne_designation || '—', d.montant, d.statut, d.date_creation?.slice(0,10) || '—', d.note || '—']))}
            className="btn btn-secondary btn-md" style={{ gap: 7 }}
          >
            <Download size={15} strokeWidth={2} /> CSV
          </button>
          <button
            onClick={() => printPDF('Mes Dépenses', ['Référence', 'Budget', 'Ligne', 'Montant', 'Statut', 'Date'],
              visible.map(d => [d.reference || '—', d.budget_reference || '—', d.ligne_designation || '—', `${fmt(d.montant)} F`, d.statut, d.date_creation?.slice(0,10) || '—']),
              { subtitle: 'Relevé de mes dépenses budgétaires', stats: [
                { label: 'Total affiché', value: visible.length },
                { label: 'Montant total', value: `${fmt(visible.reduce((s,d)=>s+parseFloat(d.montant||0),0))} FCFA` },
              ]})}
            className="btn btn-secondary btn-md" style={{ gap: 7 }}
          >
            <Printer size={15} strokeWidth={2} /> PDF
          </button>
          <button
            onClick={() => navigate('/mes-budgets')}
            className="btn btn-primary btn-md"
            style={{ gap: 7 }}
          >
            <CreditCard size={15} strokeWidth={2} />
            Saisir depuis un budget
          </button>
        </div>
      </div>

      {/* KPI cards */}
      {!loading && !error && (
        <div className="kpi-grid">
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

      {/* Barre recherche + filtres statut */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="search-wrapper" style={{ maxWidth: 360 }}>
          <Search size={14} strokeWidth={2} className="search-icon" />
          <input
            className="search-input"
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(10) }}
            placeholder="Rechercher référence, budget, ligne…"
          />
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTRES.map(f => (
            <button
              key={f.key}
              onClick={() => { setFiltre(f.key); setVisibleCount(10) }}
              className={`filter-pill${filtre === f.key ? ' active' : ''}`}
            >
              {f.label}
              <span style={{
                marginLeft: 5,
                background: filtre === f.key ? 'rgba(255,255,255,.25)' : 'var(--color-gray-200)',
                color: filtre === f.key ? '#fff' : 'var(--color-gray-600)',
                fontSize: '10px', padding: '0px 5px', borderRadius: 8, fontWeight: 700,
              }}>
                {countFor(f.key)}
              </span>
            </button>
          ))}
          {(filtre || search) && (
            <button
              onClick={() => { setFiltre(''); setSearch(''); setVisibleCount(10) }}
              className="btn btn-secondary btn-sm"
              style={{ gap: 5, marginLeft: 4 }}
            >
              <RotateCcw size={12} strokeWidth={2} /> Réinitialiser
            </button>
          )}
        </div>
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
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <CreditCard size={28} strokeWidth={1.5} style={{ color: 'var(--color-gray-400)' }} />
          </div>
          <p className="empty-title">Aucune dépense</p>
          <p className="empty-body">
            {q ? `Aucun résultat pour « ${search} »`
              : filtre ? 'Aucune dépense pour ce filtre.'
              : 'Ouvrez un budget approuvé pour enregistrer vos premières dépenses.'}
          </p>
          {!q && !filtre && (
            <button
              onClick={() => navigate('/mes-budgets')}
              className="btn btn-primary btn-md"
              style={{ marginTop: 16, gap: 7 }}
            >
              <FileText size={15} strokeWidth={2} /> Voir mes budgets
            </button>
          )}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                {['Référence', 'Budget', 'Ligne', 'Montant', 'Date', 'Statut', 'Note', ''].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(d => {
                const s = STATUT_STYLE[d.statut] || { bg: 'var(--color-gray-100)', color: 'var(--color-gray-600)', label: d.statut }
                return (
                  <tr
                    key={d.id}
                    className="cursor-pointer"
                    onClick={() => setDetailModal(d)}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
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
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
                        {s.label}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', color: d.statut === 'REJETEE' ? 'var(--color-danger-600)' : 'var(--color-gray-500)', maxWidth: 180, fontStyle: d.statut === 'REJETEE' ? 'italic' : 'normal' }}>
                      {d.statut === 'REJETEE' && d.motif_rejet ? d.motif_rejet : (d.note || '—')}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button onClick={() => setDetailModal(d)} className="btn btn-secondary btn-sm gap-[4px]">
                        <Eye size={12} strokeWidth={2} /> Voir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal détail dépense */}
      {detailModal && (
        <DepenseDetailModal dep={detailModal} onClose={() => setDetailModal(null)} />
      )}

      {/* Charger plus */}
      {!loading && hasMore && (
        <div className="flex flex-col items-center gap-[6px] mt-[20px]">
          <button
            onClick={() => setVisibleCount(c => c + 10)}
            className="btn btn-secondary btn-md gap-[7px]"
            style={{ minWidth: 180 }}
          >
            Charger plus
            <span style={{ background: 'var(--color-gray-200)', color: 'var(--color-gray-600)', fontSize: '11px', padding: '1px 7px', borderRadius: 8, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              +{Math.min(10, filtered.length - visibleCount)}
            </span>
          </button>
          <p style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
            {visibleCount} sur {filtered.length} dépenses affichées
          </p>
        </div>
      )}

      {/* Info */}
      {!loading && visible.length > 0 && (
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

/* ── Modal détail d'une dépense (lecture seule pour le gestionnaire) ──────── */
function DepenseDetailModal({ dep, onClose }) {
  const cfg = {
    SAISIE:  { gradient: 'linear-gradient(135deg, #92400E, #D97706)', label: 'En attente', icon: '⏳' },
    VALIDEE: { gradient: 'linear-gradient(135deg, #065F46, #059669)', label: 'Validée',    icon: '✓'  },
    REJETEE: { gradient: 'linear-gradient(135deg, #7F1D1D, #DC2626)', label: 'Rejetée',    icon: '✕'  },
  }
  const c    = cfg[dep.statut] || { gradient: 'linear-gradient(135deg, #374151, #6B7280)', label: dep.statut, icon: '?' }
  const fmtD = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'
  const fmtN = (n)   => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 580, padding: 0, overflow: 'hidden' }}>

        {/* Hero header */}
        <div style={{ background: c.gradient, padding: '24px 28px 20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -20, right: 60, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{ background: 'rgba(255,255,255,.18)', borderRadius: 7, padding: '4px 10px', fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.5px' }}>
                  {dep.reference}
                </div>
                <span style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.3)', borderRadius: 20, padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>
                  {c.icon} {c.label}
                </span>
              </div>
              <div style={{ fontSize: '12px', opacity: .75, marginBottom: 4 }}>Détail de la dépense</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', opacity: .95 }}>
                {dep.budget_nom && dep.budget_nom !== '—' ? dep.budget_nom : dep.budget_reference}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', opacity: .65, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Montant</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>
                {fmtN(dep.montant)}
              </div>
              <div style={{ fontSize: '11px', opacity: .7, marginTop: 3 }}>FCFA</div>
            </div>
          </div>
        </div>

        {/* Corps */}
        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Grille infos */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px,100%), 1fr))', gap: '16px 32px', marginBottom: 20 }}>
            <InfoFieldG icon={<Tag size={13} />}      label="Référence"         value={dep.reference} mono />
            <InfoFieldG icon={<Building2 size={13} />} label="Budget"           value={`${dep.budget_reference}${dep.budget_nom && dep.budget_nom !== '—' ? ` — ${dep.budget_nom}` : ''}`} />
            <InfoFieldG icon={<Receipt size={13} />}   label="Ligne budgétaire" value={dep.ligne_designation} />
            <InfoFieldG icon={<Calendar size={13} />}  label="Date"             value={fmtD(dep.date_depense)} mono />
            <InfoFieldG icon={<User size={13} />}      label="Saisi par"        value={dep.enregistre_par} />
            {dep.validateur_nom && (
              <InfoFieldG
                icon={<User size={13} />}
                label={dep.statut === 'REJETEE' ? 'Rejeté par' : 'Validé par'}
                value={dep.validateur_nom}
              />
            )}
            {dep.fournisseur && dep.fournisseur !== '—' && (
              <InfoFieldG icon={<User size={13} />} label="Fournisseur" value={dep.fournisseur} />
            )}
            {dep.note && (
              <div style={{ gridColumn: 'span 2' }}>
                <InfoFieldG icon={<FileText size={13} />} label="Note" value={dep.note} />
              </div>
            )}
          </div>

          {/* Séparateur */}
          <div style={{ height: 1, background: 'var(--color-gray-100)', marginBottom: 20 }} />

          {/* Pièces justificatives */}
          <div style={{ marginBottom: dep.statut === 'REJETEE' ? 20 : 0 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 10 }}>
              Pièces justificatives
            </div>
            {dep.piece_justificative_url && (
              <a href={dep.piece_justificative_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'var(--color-primary-50)', border: '1.5px solid var(--color-primary-200)', cursor: 'pointer' }}>
                  <Paperclip size={15} strokeWidth={2} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-800)', flex: 1 }}>Justificatif principal</span>
                  <ExternalLink size={13} strokeWidth={2} style={{ color: 'var(--color-primary-400)', flexShrink: 0 }} />
                </div>
              </a>
            )}
            {dep.pieces && dep.pieces.map((p, i) => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', cursor: 'pointer' }}>
                  <Paperclip size={14} strokeWidth={2} style={{ color: 'var(--color-gray-500)', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--color-gray-700)', flex: 1 }}>{p.nom || `Pièce ${i + 2}`}</span>
                  <ExternalLink size={13} strokeWidth={2} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                </div>
              </a>
            ))}
            {!dep.piece_justificative_url && (!dep.pieces || dep.pieces.length === 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: 'var(--color-gray-50)', border: '1.5px dashed var(--color-gray-200)' }}>
                <Paperclip size={16} strokeWidth={1.5} style={{ color: 'var(--color-gray-300)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--color-gray-400)', fontStyle: 'italic' }}>Aucune pièce justificative jointe</span>
              </div>
            )}
          </div>

          {/* Motif rejet */}
          {dep.statut === 'REJETEE' && dep.motif_rejet && (
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '14px 16px', borderRadius: 10, background: '#FFF1F2', border: '1.5px solid #FECDD3' }}>
              <AlertCircle size={16} strokeWidth={2} style={{ color: '#E11D48', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#BE123C', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>Motif du rejet</div>
                <p style={{ fontSize: '13px', color: '#9F1239', margin: 0, lineHeight: 1.5 }}>{dep.motif_rejet}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 28px', borderTop: '1px solid var(--color-gray-100)', background: 'var(--color-gray-50)' }}>
          <button onClick={onClose} className="btn btn-primary btn-md">Fermer</button>
        </div>
      </div>
    </div>
  )
}

function InfoFieldG({ label, value, icon, mono }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        <span style={{ color: 'var(--color-gray-400)' }}>{icon}</span>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '.4px' }}>{label}</span>
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-800)', fontFamily: mono ? 'var(--font-mono)' : 'inherit' }}>
        {value || '—'}
      </div>
    </div>
  )
}
