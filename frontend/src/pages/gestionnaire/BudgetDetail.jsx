import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  getBudget, deleteBudget, updateBudget, soumettreBudget,
} from '../../api/budget'
import { getDepenses } from '../../api/depenses'
import { StatutBadge, AlerteBadge } from '../../components/StatusBadge'
import LignesBudgetaires from '../../components/budget/LignesBudgetaires'
import DepenseMultiModal from '../../components/budget/DepenseMultiModal'
import { exportCSV, printPDF } from '../../utils/export'
import { notifRefresh } from '../../utils/notifRefresh'
import { ConfirmModal } from '../../components/ui'
import {
  ArrowLeft, Trash2, Pencil, Send, DollarSign,
  CheckCircle2, AlertTriangle, Info,
  FileText, Receipt, ExternalLink,
  Download, Printer,
} from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))

const jaugeColor = (taux) => {
  if (taux > 75) return '#F43F5E'
  if (taux > 50) return '#F59E0B'
  return '#22C55E'
}

export default function BudgetDetail({ basePath = '/mes-budgets' }) {
  const { id }   = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const [budget,    setBudget]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [hasLignes, setHasLignes] = useState(false)

  const [showDepenseModal, setShowDepenseModal] = useState(false)

  const [showEdit,   setShowEdit]   = useState(false)
  const [editForm,   setEditForm]   = useState({ nom: '', date_debut: '', date_fin: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError,  setEditError]  = useState('')

  const [showSoumission,   setShowSoumission]   = useState(false)
  const [soumissionSaving, setSoumissionSaving] = useState(false)
  const [soumissionError,  setSoumissionError]  = useState('')

  const [depenses,       setDepenses]       = useState([])
  const [depensesLoaded, setDepensesLoaded] = useState(false)

  const [confirmModal, setConfirmModal] = useState(null)

  const load = () => {
    getBudget(id)
      .then(b => setBudget(b.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const loadDepenses = () => {
    getDepenses({ budget: id })
      .then(r => setDepenses(r.data?.data ?? []))
      .catch(() => {})
      .finally(() => setDepensesLoaded(true))
  }

  const handleDelete = () => {
    setConfirmModal({
      title: 'Supprimer le budget',
      message: `Supprimer définitivement ce budget "${budget?.nom || ''}" ? Toutes les lignes budgétaires seront effacées.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try { await deleteBudget(id); navigate(basePath) }
        catch (err) { alert(err.response?.data?.detail || 'Erreur') }
      },
    })
  }

  const openEdit = () => {
    setEditForm({ nom: budget.nom, date_debut: budget.date_debut, date_fin: budget.date_fin })
    setEditError(''); setShowEdit(true)
  }
  const handleEdit = async (e) => {
    e.preventDefault(); setEditError(''); setEditSaving(true)
    try { await updateBudget(id, editForm); setShowEdit(false); load() }
    catch (err) { setEditError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Erreur') }
    finally { setEditSaving(false) }
  }

  const openSoumission = () => { setSoumissionError(''); setShowSoumission(true) }
  const handleSoumettre = async (e) => {
    e.preventDefault()
    setSoumissionSaving(true); setSoumissionError('')
    try {
      await soumettreBudget(id)
      notifRefresh()
      setShowSoumission(false); load()
    } catch (err) {
      setSoumissionError(err.response?.data?.detail || 'Erreur lors de la soumission')
    } finally { setSoumissionSaving(false) }
  }

  const openDepense  = () => setShowDepenseModal(true)
  const closeDepense = () => setShowDepenseModal(false)
  const onDepenseSuccess = () => { setShowDepenseModal(false); load(); loadDepenses() }

  // Charger les dépenses dès que le budget est approuvé
  useEffect(() => {
    if (budget?.statut === 'APPROUVE' && !depensesLoaded) loadDepenses()
  }, [budget?.statut])

  if (loading || !budget) return <div className="page-loader"><div className="spinner" /></div>

  const editable  = ['BROUILLON', 'REJETE'].includes(budget.statut)
  const brouillon = budget.statut === 'BROUILLON'
  const approuve  = budget.statut === 'APPROUVE'

  const handleExportCSV = () => {
    const lignes = budget.lignes ?? []
    const headers = ['Code', 'Désignation', 'Unité', 'Quantité', 'Prix Unitaire', 'Alloué (FCFA)', 'Consommé (FCFA)', 'Disponible (FCFA)']
    const rows = lignes.map(l => [
      l.code || '—',
      l.libelle,
      l.unite,
      l.quantite,
      l.prix_unitaire,
      l.montant_alloue,
      l.montant_consomme,
      l.montant_disponible,
    ])
    if (approuve && depenses.length) {
      rows.push([])
      rows.push(['=== DÉPENSES ===', '', '', '', '', '', '', ''])
      depenses.forEach(d => rows.push([
        d.reference || '—', d.ligne_designation || '—', '—', '—', '—',
        d.montant, d.statut, d.date_creation?.slice(0, 10) || '—',
      ]))
    }
    exportCSV(`Budget_${budget.code}`, headers, rows)
  }

  const handleExportPDF = () => {
    const lignes = budget.lignes ?? []
    const headers = ['Code', 'Désignation', 'Unité', 'Qté', 'P.U.', 'Alloué', 'Consommé', 'Disponible']
    const rows = lignes.map(l => [
      l.code || '—', l.libelle, l.unite,
      fmt(l.quantite), `${fmt(l.prix_unitaire)} F`,
      `${fmt(l.montant_alloue)} F`, `${fmt(l.montant_consomme)} F`, `${fmt(l.montant_disponible)} F`,
    ])
    printPDF(`Budget ${budget.code}`, headers, rows, {
      subtitle: budget.nom,
      filters: `${budget.departement_nom} · Statut : ${budget.statut_display || budget.statut}`,
      stats: [
        { label: 'Budget global', value: `${fmt(budget.montant_global)} FCFA` },
        { label: 'Consommé',      value: `${fmt(budget.montant_consomme)} FCFA` },
        { label: 'Disponible',    value: `${fmt(budget.montant_disponible)} FCFA` },
        { label: 'Taux',          value: `${Math.round(budget.taux_consommation || 0)} %` },
      ],
    })
  }

  const alloc           = budget.allocation_detail
  const allocAlloue     = parseFloat(alloc?.montant_alloue    || 0)
  const allocConsomme   = parseFloat(alloc?.montant_consomme  || 0)
  const allocDisponible = parseFloat(alloc?.montant_disponible || 0)
  const allocTaux       = allocAlloue > 0 ? Math.min(Math.round(allocConsomme / allocAlloue * 100), 100) : 0

  return (
    <div>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button
            onClick={() => navigate(basePath)}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <ArrowLeft size={14} strokeWidth={2} /> Retour
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleExportCSV} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
              <Download size={13} strokeWidth={2} /> CSV
            </button>
            <button onClick={handleExportPDF} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
              <Printer size={13} strokeWidth={2} /> PDF
            </button>
          </div>
        </div>

        <div style={{
          background: '#1E3A8A',
          borderRadius: 'var(--radius-lg)', padding: '24px 28px',
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(15,34,64,.4)',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,.05)' }} />
          <div style={{ position: 'absolute', bottom: -30, right: 80, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.04)' }} />

          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
              <span className="code-tag" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)', fontFamily: 'var(--font-mono)' }}>
                {budget.code}
              </span>
              <StatutBadge statut={budget.statut} />
              <AlerteBadge niveau={budget.niveau_alerte} />
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '-.4px', marginBottom: 6 }}>
              {budget.nom}
            </h1>
            <p style={{ opacity: .75, fontSize: '13px' }}>
              {budget.departement_nom}
              {budget.date_debut && ` · ${budget.date_debut} → ${budget.date_fin}`}
              {budget.annee && ` · Exercice ${budget.annee}`}
            </p>
            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {budget.gestionnaire_detail && (
                <span style={{ fontSize: '12px', opacity: .8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ opacity: .6 }}>Gestionnaire :</span>
                  <strong>{budget.gestionnaire_detail.prenom} {budget.gestionnaire_detail.nom}</strong>
                </span>
              )}
              {budget.comptable_detail && (
                <span style={{ fontSize: '12px', opacity: .8, display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ opacity: .6 }}>{budget.statut === 'APPROUVE' ? 'Approuvé par :' : budget.statut === 'REJETE' ? 'Rejeté par :' : 'Traité par :'}</span>
                  <strong>{budget.comptable_detail.prenom} {budget.comptable_detail.nom}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Enveloppe du département ─────────────────────────────────────────── */}
      {alloc && (
        <div className="card" style={{
          marginBottom: 16,
          borderLeft: `4px solid ${allocDisponible <= 0 ? 'var(--color-danger-500)' : 'var(--color-primary-500)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-gray-700)' }}>
              Enveloppe {budget.departement_nom} – Exercice {budget.annee}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
              background: allocTaux >= 100 ? 'var(--color-danger-50)' : allocTaux >= 90 ? 'var(--color-warning-50)' : 'var(--color-success-50)',
              color:      allocTaux >= 100 ? 'var(--color-danger-700)' : allocTaux >= 90 ? 'var(--color-warning-700)' : 'var(--color-success-700)',
            }}>
              {allocTaux}% utilisé
            </span>
          </div>
          <div className="exec-bar" style={{ marginBottom: 10 }}>
            <div className="exec-bar-fill" style={{
              width: `${allocTaux}%`,
              background: `linear-gradient(90deg, ${jaugeColor(Math.max(0, allocTaux - 20))}, ${jaugeColor(allocTaux)})`,
            }} />
          </div>
          <div style={{ display: 'flex', gap: 24, fontSize: '12px', color: 'var(--color-gray-500)', fontFamily: 'var(--font-mono)' }}>
            <span>Alloué : <strong style={{ color: 'var(--color-gray-700)' }}>{fmt(allocAlloue)} FCFA</strong></span>
            <span>Consommé : <strong style={{ color: 'var(--color-gray-700)' }}>{fmt(allocConsomme)} FCFA</strong></span>
            <span style={{ color: allocDisponible <= 0 ? 'var(--color-danger-600)' : 'var(--color-success-700)', fontWeight: 700 }}>
              Disponible : {fmt(allocDisponible)} FCFA
            </span>
          </div>
        </div>
      )}

      {/* ── Bandeaux de statut ───────────────────────────────────────────────── */}
      {!isAdmin && brouillon && !hasLignes && (
        <StatusBanner type="info" icon={<FileText size={15} strokeWidth={2} />}>
          Budget en brouillon — ajoutez au moins une ligne budgétaire pour pouvoir le soumettre.
        </StatusBanner>
      )}
      {!isAdmin && brouillon && hasLignes && (
        <StatusBanner type="primary" icon={<Info size={15} strokeWidth={2} />}>
          Budget prêt — cliquez sur <strong>Soumettre</strong> pour l'envoyer en validation.
        </StatusBanner>
      )}
      {budget.statut === 'SOUMIS' && (
        <StatusBanner type="primary" icon={<Info size={15} strokeWidth={2} />}>
          Budget soumis — en attente de validation par le comptable.
        </StatusBanner>
      )}
      {!isAdmin && approuve && (
        <StatusBanner type="success" icon={<CheckCircle2 size={15} strokeWidth={2} />}>
          Budget approuvé — enregistrez les dépenses réelles avec leurs pièces justificatives.
        </StatusBanner>
      )}
      {budget.statut === 'REJETE' && (
        <>
          <StatusBanner type="danger" icon={<AlertTriangle size={15} strokeWidth={2} />}>
            Budget rejeté — corrigez les lignes puis soumettez à nouveau.
          </StatusBanner>
          {budget.motif_rejet && (
            <div style={{
              marginBottom: 12, padding: '12px 16px',
              background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-200)',
              borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--color-danger-500)',
            }}>
              <div style={{ fontWeight: 700, fontSize: '12px', color: 'var(--color-danger-700)', marginBottom: 4 }}>
                Motif de rejet
              </div>
              <div style={{ fontSize: '13px', color: 'var(--color-danger-800)', lineHeight: 1.55 }}>
                {budget.motif_rejet}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Contenu principal ────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

        <CVPanel
          montantGlobal={parseFloat(budget.montant_global || 0)}
          montantConsomme={parseFloat(budget.montant_consomme || 0)}
          montantDisponible={parseFloat(budget.montant_disponible || 0)}
          taux={parseFloat(budget.taux_consommation || 0)}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <LignesBudgetaires
            budgetId={budget.id}
            readOnly={isAdmin || !editable}
            onTotalChange={(total) => setHasLignes(total > 0)}
          />
        </div>
      </div>

      {/* ── Barre d'actions ──────────────────────────────────────────────────── */}
      {!isAdmin && (editable || approuve) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 20, padding: '14px 18px',
          background: '#fff', border: '1px solid var(--color-gray-200)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 -2px 8px rgba(0,0,0,.04)',
        }}>
          <div>
            {editable && (
              <button onClick={handleDelete} className="btn btn-danger btn-sm" style={{ gap: 6 }}>
                <Trash2 size={13} strokeWidth={2} /> Supprimer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editable && (
              <button onClick={openEdit} className="btn btn-secondary btn-md" style={{ gap: 6 }}>
                <Pencil size={14} strokeWidth={2} /> Modifier
              </button>
            )}
            {brouillon && hasLignes && (
              <button onClick={openSoumission} className="btn btn-primary btn-md" style={{ gap: 6 }}>
                <Send size={14} strokeWidth={2} /> Soumettre
              </button>
            )}
            {approuve && (
              <button onClick={openDepense} className="btn btn-success btn-md" style={{ gap: 6 }}>
                <DollarSign size={14} strokeWidth={2} /> Enregistrer une dépense
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Dépenses enregistrées (budget approuvé) ──────────────────────────── */}
      {approuve && (
        <div style={{ marginTop: 20 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{
              padding: '14px 20px', background: '#F8FAFF',
              borderBottom: '1px solid var(--color-gray-100)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Receipt size={16} strokeWidth={2} style={{ color: 'var(--color-primary-600)' }} />
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-900)' }}>
                  Dépenses enregistrées
                </span>
                {depenses.length > 0 && (
                  <span style={{
                    background: 'var(--color-primary-100)', color: 'var(--color-primary-700)',
                    fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  }}>
                    {depenses.length}
                  </span>
                )}
              </div>
            </div>

            {!depensesLoaded ? (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div className="spinner" style={{ margin: '0 auto 8px' }} />
                <p style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>Chargement…</p>
              </div>
            ) : depenses.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '13px' }}>
                Aucune dépense enregistrée sur ce budget.
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    {['Référence', 'Ligne budgétaire', 'Montant', 'Date', 'Statut', 'Note', 'Justificatif'].map(h => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {depenses.map(d => {
                    const STATUT_STYLE = {
                      SAISIE:  { bg: 'var(--color-warning-50)',  color: 'var(--color-warning-700)', label: 'En attente' },
                      VALIDEE: { bg: 'var(--color-success-50)',  color: 'var(--color-success-700)', label: 'Validée'    },
                      REJETEE: { bg: 'var(--color-danger-50)',   color: 'var(--color-danger-700)',  label: 'Rejetée'    },
                    }
                    const s = STATUT_STYLE[d.statut] || { bg: '#f3f4f6', color: '#374151', label: d.statut }
                    return (
                      <tr key={d.id}>
                        <td><span className="code-tag">{d.reference}</span></td>
                        <td style={{ fontSize: '12px', color: 'var(--color-gray-600)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.ligne_designation}
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, whiteSpace: 'nowrap' }}>
                          {fmt(d.montant)} <span style={{ fontSize: '10px', color: 'var(--color-gray-400)', fontWeight: 400 }}>FCFA</span>
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--color-gray-400)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
                          {d.date_depense ? new Date(d.date_depense).toLocaleDateString('fr-FR') : '—'}
                        </td>
                        <td>
                          <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: '11px', fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
                            {s.label}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: d.statut === 'REJETEE' ? 'var(--color-danger-600)' : 'var(--color-gray-500)', fontStyle: d.statut === 'REJETEE' ? 'italic' : 'normal' }}>
                          {d.statut === 'REJETEE' && d.motif_rejet ? d.motif_rejet : (d.note || '—')}
                        </td>
                        <td>
                          {d.piece_justificative_url ? (
                            <a
                              href={d.piece_justificative_url}
                              target="_blank"
                              rel="noreferrer"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '12px', color: 'var(--color-primary-600)', fontWeight: 600 }}
                              onClick={e => e.stopPropagation()}
                            >
                              <ExternalLink size={12} strokeWidth={2} /> Voir
                            </a>
                          ) : (
                            <span style={{ fontSize: '12px', color: 'var(--color-gray-300)' }}>—</span>
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
      )}

      {/* ── Modal dépense multi-lignes ──────────────────────────────────────── */}
      {showDepenseModal && (
        <DepenseMultiModal
          budgetId={budget.id}
          onClose={closeDepense}
          onSuccess={onDepenseSuccess}
        />
      )}

      {/* ── Modal soumission ─────────────────────────────────────────────────── */}
      {showSoumission && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowSoumission(false) }}>
          <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Send size={15} strokeWidth={2} style={{ color: 'var(--color-primary-600)' }} />
                Soumettre le budget
              </h2>
            </div>
            <form onSubmit={handleSoumettre}>
              <div className="modal-body">
                <div style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: 9,
                  background: 'var(--color-warning-50)', border: '1px solid var(--color-warning-200)',
                  marginBottom: 12,
                }}>
                  <AlertTriangle size={14} style={{ color: 'var(--color-warning-600)', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: '13px', color: 'var(--color-warning-800)' }}>
                    Une fois soumis, ce budget <strong>ne pourra plus être modifié</strong>. Il sera transmis au comptable pour validation.
                  </p>
                </div>
                <div style={{
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                  padding: '12px 14px', borderRadius: 9,
                  background: 'var(--color-success-50)', border: '1px solid var(--color-success-200)',
                }}>
                  <Info size={14} style={{ color: 'var(--color-success-600)', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: '13px', color: 'var(--color-success-800)' }}>
                    Après approbation, vous pourrez enregistrer les dépenses réelles avec leurs pièces justificatives.
                  </p>
                </div>
                {soumissionError && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-200)', marginTop: 12 }}>
                    <AlertTriangle size={13} style={{ color: 'var(--color-danger-500)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--color-danger-700)', fontSize: '12px' }}>{soumissionError}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowSoumission(false)} className="btn btn-secondary btn-md">Annuler</button>
                <button type="submit" disabled={soumissionSaving} className="btn btn-primary btn-md" style={{ gap: 6 }}>
                  {soumissionSaving ? <><span className="spinner-sm" /> Soumission…</> : <><Send size={14} strokeWidth={2} /> Confirmer la soumission</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal édition ────────────────────────────────────────────────────── */}
      {showEdit && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowEdit(false) }}>
          <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px' }}>Modifier le budget</h2>
            </div>
            <form onSubmit={handleEdit}>
              <div className="modal-body">
                <div style={{ marginBottom: 16 }}>
                  <label className="form-label">Nom du budget</label>
                  <input required className="form-input" value={editForm.nom}
                    onChange={e => setEditForm(f => ({ ...f, nom: e.target.value }))} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="form-label">Date début</label>
                    <input type="date" required className="form-input" value={editForm.date_debut}
                      onChange={e => setEditForm(f => ({ ...f, date_debut: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Date fin</label>
                    <input type="date" required className="form-input" value={editForm.date_fin}
                      onChange={e => setEditForm(f => ({ ...f, date_fin: e.target.value }))} />
                  </div>
                </div>
                {editError && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-200)', marginTop: 12 }}>
                    <AlertTriangle size={13} style={{ color: 'var(--color-danger-500)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--color-danger-700)', fontSize: '12px' }}>{editError}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowEdit(false)} className="btn btn-secondary btn-md">Annuler</button>
                <button type="submit" disabled={editSaving} className="btn btn-primary btn-md">
                  {editSaving ? <><span className="spinner-sm" /> Enregistrement…</> : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmModal && <ConfirmModal {...confirmModal} onClose={() => setConfirmModal(null)} />}
    </div>
  )
}

/* ── StatusBanner helper ───────────────────────────────────────────────────── */
function StatusBanner({ type, icon, children }) {
  const cfg = {
    info:    { bg: 'var(--color-gray-50)',    border: 'var(--color-gray-200)',    color: 'var(--color-gray-700)'    },
    primary: { bg: 'var(--color-primary-50)', border: 'var(--color-primary-200)', color: 'var(--color-primary-800)' },
    success: { bg: 'var(--color-success-50)', border: 'var(--color-success-200)', color: 'var(--color-success-800)' },
    danger:  { bg: 'var(--color-danger-50)',  border: 'var(--color-danger-200)',  color: 'var(--color-danger-800)'  },
  }[type] || {}
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '10px 16px', borderRadius: 10, marginBottom: 14,
      background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color,
      fontSize: '13px',
    }}>
      <span style={{ flexShrink: 0, marginTop: 1 }}>{icon}</span>
      <span>{children}</span>
    </div>
  )
}

/* ── CVPanel — Synthèse budgétaire ────────────────────────────────────────── */
function Row({ label, value, color, bold }) {
  return (
    <div style={{
      padding: '9px 14px', borderBottom: '1px solid var(--color-gray-100)',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <span style={{ fontSize: '12px', color: 'var(--color-gray-600)', fontWeight: bold ? 600 : 400 }}>{label}</span>
      <span style={{
        fontWeight: bold ? 800 : 700, fontSize: '12px',
        color: color || 'var(--color-gray-800)',
        whiteSpace: 'nowrap', marginLeft: 8,
        fontFamily: 'var(--font-mono)',
      }}>
        {new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(value || 0))} FCFA
      </span>
    </div>
  )
}

function CVPanel({ montantGlobal, montantConsomme, montantDisponible, taux }) {
  const tauxColor = jaugeColor(taux)
  return (
    <div style={{ width: 260, flexShrink: 0 }}>
      <div style={{
        fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-500)',
        letterSpacing: '.5px', textTransform: 'uppercase', marginBottom: 8,
      }}>
        Synthèse budgétaire
      </div>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Row label="Budget global"  value={montantGlobal}     color="var(--color-primary-700)" />
        <Row label="Consommé"       value={montantConsomme}   color="#6a2fa0" />
        <Row
          label="Disponible"
          value={montantDisponible}
          color={montantDisponible <= 0 ? 'var(--color-danger-600)' : 'var(--color-success-700)'}
          bold
        />

        <div style={{ padding: '12px 14px', background: 'var(--color-gray-50)', borderTop: '1px solid var(--color-gray-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-500)', textTransform: 'uppercase', letterSpacing: '.3px' }}>
              Taux de consommation
            </span>
            <span style={{ fontWeight: 800, fontSize: '13px', color: tauxColor, fontFamily: 'var(--font-mono)' }}>
              {taux.toFixed(1)}%
            </span>
          </div>
          <div className="exec-bar">
            <div className="exec-bar-fill" style={{
              width: `${Math.min(taux, 100)}%`,
              background: `linear-gradient(90deg, ${jaugeColor(Math.max(0, taux - 20))}, ${tauxColor})`,
            }} />
          </div>
        </div>
      </div>
    </div>
  )
}
