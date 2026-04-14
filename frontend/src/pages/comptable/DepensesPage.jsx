import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDepenses, validerDepense, rejeterDepense } from '../../api/depenses'
import {
  Search, CheckCircle2, XCircle, Receipt, Eye,
  Paperclip, User, Calendar, Tag, Building2,
  AlertCircle, FileText, ExternalLink, Download, Printer,
} from 'lucide-react'
import { DepenseBadge } from '../../components/StatusBadge'
import { exportCSV, printPDF } from '../../utils/export'
import { notifRefresh } from '../../utils/notifRefresh'

const fmt     = (n)   => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'

/* ══════════════════════════════════════════════════════════
   Page principale
══════════════════════════════════════════════════════════ */
export default function DepensesPage() {
  const [filtreStatut, setFiltreStatut] = useState('SAISIE')
  const [search,       setSearch]       = useState('')
  const [detailModal,  setDetailModal]  = useState(null)
  const [rejetModal,   setRejetModal]   = useState(null)
  const [visibleCount, setVisibleCount] = useState(10)
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['depenses', filtreStatut, search],
    queryFn: () => getDepenses({ statut: filtreStatut || undefined, search }).then(r => r.data),
  })

  const { mutate: valider, isPending: validating } = useMutation({
    mutationFn: (id) => validerDepense(id, {}),
    onSuccess: () => { qc.invalidateQueries(['depenses']); notifRefresh(); setDetailModal(null) },
  })

  const { mutate: rejeter } = useMutation({
    mutationFn: ({ id, motif }) => rejeterDepense(id, { motif }),
    onSuccess: () => { qc.invalidateQueries(['depenses']); notifRefresh(); setRejetModal(null); setDetailModal(null) },
  })

  const depenses       = Array.isArray(data?.data) ? data.data : (data?.data?.results || data?.results || [])
  const visibleDep     = depenses.slice(0, visibleCount)
  const hasMore        = visibleCount < depenses.length

  const { data: allData } = useQuery({
    queryKey: ['depenses-all'],
    queryFn: () => getDepenses({}).then(r => r.data),
    retry: false,
  })
  const allDepenses = Array.isArray(allData?.data) ? allData.data : (allData?.data?.results || allData?.results || [])

  const FILTRES = [
    { val: '',        label: 'Toutes'     },
    { val: 'SAISIE',  label: 'En attente' },
    { val: 'VALIDEE', label: 'Validées'   },
    { val: 'REJETEE', label: 'Rejetées'   },
  ]
  const countFor = (val) => val ? allDepenses.filter(d => d.statut === val).length : allDepenses.length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Suivi des dépenses</h1>
          <p className="page-subtitle">Examinez et validez les dépenses soumises par les gestionnaires</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              const headers = ['Référence', 'Budget', 'Ligne budgétaire', 'Fournisseur', 'Montant (FCFA)', 'Saisi par', 'Date', 'Statut']
              const rows = depenses.map(d => [
                d.reference, d.budget_reference, d.ligne_designation,
                d.fournisseur || '—', fmt(d.montant), d.enregistre_par || '—',
                d.date_depense ? new Date(d.date_depense).toLocaleDateString('fr-FR') : '—',
                d.statut,
              ])
              exportCSV(`depenses-${new Date().toISOString().slice(0,10)}`, headers, rows)
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Download size={13} strokeWidth={2} /> CSV
          </button>
          <button
            onClick={() => {
              const headers = ['Référence', 'Budget', 'Ligne', 'Montant', 'Saisi par', 'Date', 'Statut']
              const rows = depenses.map(d => [
                d.reference, d.budget_reference, d.ligne_designation,
                fmt(d.montant) + ' FCFA', d.enregistre_par || '—',
                d.date_depense ? new Date(d.date_depense).toLocaleDateString('fr-FR') : '—',
                d.statut,
              ])
              printPDF('Rapport des dépenses', headers, rows, {
                subtitle: filtreStatut ? `Filtre : ${filtreStatut}` : 'Toutes les dépenses',
                stats: [
                  { value: countFor('SAISIE'),  label: 'En attente' },
                  { value: countFor('VALIDEE'), label: 'Validées'   },
                  { value: countFor('REJETEE'), label: 'Rejetées'   },
                  { value: fmt(depenses.reduce((s, d) => s + parseFloat(d.montant || 0), 0)) + ' FCFA', label: 'Total affiché' },
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

      {/* KPI */}
      <div className="kpi-grid">
        {[
          { label: 'EN ATTENTE',  val: countFor('SAISIE'),  color: 'var(--color-warning-600)',  bg: 'var(--color-warning-50)'  },
          { label: 'VALIDÉES',    val: countFor('VALIDEE'), color: 'var(--color-success-600)',  bg: 'var(--color-success-50)'  },
          { label: 'REJETÉES',    val: countFor('REJETEE'), color: 'var(--color-danger-600)',   bg: 'var(--color-danger-50)'   },
          { label: 'TOTAL',       val: countFor(''),        color: 'var(--color-primary-600)',  bg: 'var(--color-primary-50)'  },
        ].map(k => (
          <div key={k.label} className="card" style={{ borderTop: `3px solid ${k.color}` }}>
            <div style={{ fontSize: '10px', fontWeight: 700, color: k.color, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '22px', color: 'var(--color-gray-900)' }}>{k.val}</div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="filter-bar mb-[20px]">
        <div className="search-wrapper flex-1 max-w-[360px]">
          <Search size={14} strokeWidth={2} className="search-icon" />
          <input
            className="search-input"
            value={search}
            onChange={e => { setSearch(e.target.value); setVisibleCount(10) }}
            placeholder="Rechercher fournisseur, référence, note…"
          />
        </div>
        <div className="flex gap-[6px]">
          {FILTRES.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => { setFiltreStatut(val); setVisibleCount(10) }}
              className={`filter-pill${filtreStatut === val ? ' active' : ''}`}
            >
              {label}
              <span style={{
                marginLeft: 5,
                background: filtreStatut === val ? 'rgba(255,255,255,.25)' : 'var(--color-gray-200)',
                color: filtreStatut === val ? '#fff' : 'var(--color-gray-600)',
                fontSize: '10px', padding: '0px 5px', borderRadius: 8, fontWeight: 700,
              }}>
                {countFor(val)}
              </span>
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
                {['Référence', 'Budget / Ligne', 'Montant', 'Saisi par', 'Validé / Rejeté par', 'Date', 'Statut', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleDep.map(d => (
                <tr
                  key={d.id}
                  className="cursor-pointer"
                  onClick={() => setDetailModal(d)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td><span className="code-tag">{d.reference}</span></td>
                  <td>
                    <div className="font-semibold text-[13px] text-gray-800">{d.budget_reference}</div>
                    <div className="text-[11px] text-gray-400 mt-[1px] max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap">
                      {d.ligne_designation}
                    </div>
                  </td>
                  <td className="font-mono font-bold whitespace-nowrap">
                    {fmt(d.montant)} <span className="text-[10px] text-gray-400 font-normal">FCFA</span>
                  </td>
                  <td className="text-gray-500 text-[12px]">{d.enregistre_par || '—'}</td>
                  <td className="text-[12px]" style={{ color: d.validateur_nom ? (d.statut === 'REJETEE' ? 'var(--color-danger-600)' : 'var(--color-success-700)') : 'var(--color-gray-300)' }}>
                    {d.validateur_nom || '—'}
                  </td>
                  <td className="text-gray-400 text-[12px] font-mono">
                    {d.date_depense ? new Date(d.date_depense).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td><DepenseBadge statut={d.statut} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button onClick={() => setDetailModal(d)} className="btn btn-secondary btn-sm gap-[5px]">
                      <Eye size={12} strokeWidth={2} /> Examiner
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && hasMore && (
        <div className="flex flex-col items-center gap-[6px] mt-[20px]">
          <button
            onClick={() => setVisibleCount(c => c + 10)}
            className="btn btn-secondary btn-md gap-[7px]"
            style={{ minWidth: 180 }}
          >
            Charger plus
            <span style={{ background: 'var(--color-gray-200)', color: 'var(--color-gray-600)', fontSize: '11px', padding: '1px 7px', borderRadius: 8, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              +{Math.min(10, depenses.length - visibleCount)}
            </span>
          </button>
          <p style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
            {visibleCount} sur {depenses.length} dépenses affichées
          </p>
        </div>
      )}

      {detailModal && (
        <DepenseDetailModal
          dep={detailModal}
          onValider={() => valider(detailModal.id)}
          onRejeter={() => setRejetModal(detailModal.id)}
          onClose={() => setDetailModal(null)}
          validating={validating}
        />
      )}

      {rejetModal && (
        <RejetModal
          onConfirm={(motif) => rejeter({ id: rejetModal, motif })}
          onClose={() => setRejetModal(null)}
        />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Modal détail dépense — version Comptable (avec actions)
══════════════════════════════════════════════════════════ */
function DepenseDetailModal({ dep, onValider, onRejeter, onClose, validating }) {
  const cfg = {
    SAISIE:  { gradient: 'linear-gradient(135deg, #92400E, #D97706)', label: 'En attente', icon: '⏳' },
    VALIDEE: { gradient: 'linear-gradient(135deg, #065F46, #059669)', label: 'Validée',    icon: '✓'  },
    REJETEE: { gradient: 'linear-gradient(135deg, #7F1D1D, #DC2626)', label: 'Rejetée',    icon: '✕'  },
  }
  const c = cfg[dep.statut] || { gradient: 'linear-gradient(135deg, #374151, #6B7280)', label: dep.statut, icon: '?' }

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="modal-panel"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }}
      >
        {/* ── Hero header ─────────────────────────────────────── */}
        <div style={{ background: c.gradient, padding: '24px 28px 20px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          {/* Cercle déco */}
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
              <div style={{ fontSize: '12px', opacity: .75, marginBottom: 4 }}>Examen de la dépense</div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.05rem', opacity: .95 }}>
                {dep.budget_nom && dep.budget_nom !== '—' ? dep.budget_nom : dep.budget_reference}
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', opacity: .65, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 4 }}>Montant</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.6rem', lineHeight: 1 }}>
                {fmt(dep.montant)}
              </div>
              <div style={{ fontSize: '11px', opacity: .7, marginTop: 3 }}>FCFA</div>
            </div>
          </div>
        </div>

        {/* ── Corps ───────────────────────────────────────────── */}
        <div style={{ padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Grille 2 colonnes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px,100%), 1fr))', gap: '16px 32px', marginBottom: 20 }}>
            <InfoField icon={<Tag size={13} />}       label="Référence"         value={dep.reference} mono />
            <InfoField icon={<Building2 size={13} />} label="Budget"            value={`${dep.budget_reference}${dep.budget_nom && dep.budget_nom !== '—' ? ` — ${dep.budget_nom}` : ''}`} />
            <InfoField icon={<Receipt size={13} />}   label="Ligne budgétaire"  value={dep.ligne_designation} />
            <InfoField icon={<Calendar size={13} />}  label="Date d'enregistrement" value={fmtDate(dep.date_depense)} mono />
            <InfoField icon={<User size={13} />}      label="Saisi par"         value={dep.enregistre_par} />
            {dep.validateur_nom && (
              <InfoField
                icon={<CheckCircle2 size={13} />}
                label={dep.statut === 'REJETEE' ? 'Rejeté par' : 'Validé par'}
                value={dep.validateur_nom}
              />
            )}
            {dep.fournisseur && dep.fournisseur !== '—' && (
              <InfoField icon={<FileText size={13} />} label="Fournisseur" value={dep.fournisseur} />
            )}
            {dep.note && (
              <div style={{ gridColumn: 'span 2' }}>
                <InfoField icon={<FileText size={13} />} label="Note / Description" value={dep.note} />
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
            {/* Pièce principale */}
            {dep.piece_justificative_url && (
              <a href={dep.piece_justificative_url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderRadius: 10,
                  background: 'var(--color-primary-50)', border: '1.5px solid var(--color-primary-200)', cursor: 'pointer',
                }}>
                  <Paperclip size={16} strokeWidth={2} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-primary-800)', flex: 1 }}>Justificatif principal</span>
                  <ExternalLink size={14} strokeWidth={2} style={{ color: 'var(--color-primary-400)', flexShrink: 0 }} />
                </div>
              </a>
            )}
            {/* Pièces supplémentaires */}
            {dep.pieces && dep.pieces.length > 0 && dep.pieces.map((p, i) => (
              <a key={p.id} href={p.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', display: 'block', marginBottom: 6 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10,
                  background: 'var(--color-gray-50)', border: '1px solid var(--color-gray-200)', cursor: 'pointer',
                }}>
                  <Paperclip size={14} strokeWidth={2} style={{ color: 'var(--color-gray-500)', flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', color: 'var(--color-gray-700)', flex: 1 }}>{p.nom || `Pièce ${i + 2}`}</span>
                  <ExternalLink size={13} strokeWidth={2} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                </div>
              </a>
            ))}
            {!dep.piece_justificative_url && (!dep.pieces || dep.pieces.length === 0) && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10,
                background: 'var(--color-gray-50)', border: '1.5px dashed var(--color-gray-200)',
              }}>
                <Paperclip size={16} strokeWidth={1.5} style={{ color: 'var(--color-gray-300)', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: 'var(--color-gray-400)', fontStyle: 'italic' }}>
                  Aucune pièce justificative jointe
                </span>
              </div>
            )}
          </div>

          {/* Motif rejet */}
          {dep.statut === 'REJETEE' && dep.motif_rejet && (
            <div style={{
              display: 'flex', gap: 12, alignItems: 'flex-start',
              padding: '14px 16px', borderRadius: 10,
              background: '#FFF1F2', border: '1.5px solid #FECDD3',
            }}>
              <AlertCircle size={16} strokeWidth={2} style={{ color: '#E11D48', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#BE123C', textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 4 }}>
                  Motif du rejet
                </div>
                <p style={{ fontSize: '13px', color: '#9F1239', margin: 0, lineHeight: 1.5 }}>{dep.motif_rejet}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 10,
          padding: '16px 28px', borderTop: '1px solid var(--color-gray-100)',
          background: 'var(--color-gray-50)',
        }}>
          <button onClick={onClose} className="btn btn-secondary btn-md">Fermer</button>
          {dep.statut === 'SAISIE' && (
            <>
              <button
                onClick={onRejeter}
                className="btn btn-danger btn-md"
                style={{ gap: 7 }}
              >
                <XCircle size={15} strokeWidth={2} /> Rejeter
              </button>
              <button
                onClick={onValider}
                disabled={validating}
                className="btn btn-success btn-md"
                style={{ gap: 7 }}
              >
                <CheckCircle2 size={15} strokeWidth={2} />
                {validating ? 'Validation…' : 'Valider la dépense'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Champ d'info avec label + icône
══════════════════════════════════════════════════════════ */
function InfoField({ label, value, icon, mono }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 5 }}>
        <span style={{ color: 'var(--color-gray-400)' }}>{icon}</span>
        <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
          {label}
        </span>
      </div>
      <div style={{
        fontSize: '13px', fontWeight: 600,
        color: 'var(--color-gray-800)',
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
      }}>
        {value || '—'}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   Modal rejet
══════════════════════════════════════════════════════════ */
function RejetModal({ onConfirm, onClose }) {
  const [motif, setMotif] = useState('')
  const valid = motif.length >= 10

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel" style={{ maxWidth: 440, padding: 0, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

        {/* Header rouge */}
        <div style={{ background: 'linear-gradient(135deg, #7F1D1D, #DC2626)', padding: '20px 24px', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <XCircle size={18} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '15px' }}>Rejeter la dépense</div>
            <div style={{ fontSize: '12px', opacity: .75 }}>Indiquez la raison du rejet</div>
          </div>
        </div>

        <div style={{ padding: '22px 24px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--color-gray-600)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.4px' }}>
            Motif du rejet
          </label>
          <textarea
            value={motif}
            onChange={e => setMotif(e.target.value)}
            placeholder="Ex : Pièce justificative illisible, montant non justifié…"
            rows={4}
            autoFocus
            style={{
              width: '100%', boxSizing: 'border-box',
              border: `1.5px solid ${motif && !valid ? 'var(--color-danger-400)' : 'var(--color-gray-200)'}`,
              borderRadius: 9, padding: '10px 14px',
              fontSize: '13px', resize: 'vertical',
              outline: 'none', fontFamily: 'inherit',
              transition: 'border-color .15s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--color-danger-400)'}
            onBlur={e => e.target.style.borderColor = motif && !valid ? 'var(--color-danger-400)' : 'var(--color-gray-200)'}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: '11px' }}>
            <span style={{ color: valid ? 'var(--color-success-600)' : 'var(--color-gray-400)' }}>
              {valid ? '✓ Longueur suffisante' : `Minimum 10 caractères`}
            </span>
            <span style={{ color: 'var(--color-gray-400)', fontFamily: 'var(--font-mono)' }}>
              {motif.length} / 10+
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '14px 24px', borderTop: '1px solid var(--color-gray-100)', background: 'var(--color-gray-50)' }}>
          <button onClick={onClose} className="btn btn-secondary btn-md">Annuler</button>
          <button
            onClick={() => valid && onConfirm(motif)}
            disabled={!valid}
            className="btn btn-danger btn-md"
            style={{ gap: 7, opacity: valid ? 1 : 0.5 }}
          >
            <XCircle size={14} strokeWidth={2} />
            Confirmer le rejet
          </button>
        </div>
      </div>
    </div>
  )
}
