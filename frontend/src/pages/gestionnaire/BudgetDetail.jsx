import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getBudget, deleteBudget, consommerLigne, updateBudget, soumettrebudget,
} from '../../api/budget'
import { StatutBadge, AlerteBadge } from '../../components/StatusBadge'
import LignesBudgetaires from '../../components/budget/LignesBudgetaires'
import SelecteurLigne from '../../components/budget/SelecteurLigne'
import {
  ArrowLeft, Trash2, Pencil, Send, DollarSign,
  CheckCircle2, AlertTriangle, Paperclip, Info,
  Check, FileText,
} from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))

const jaugeColor = (taux) => {
  if (taux >= 95) return '#EF4444'
  if (taux >= 80) return '#F59E0B'
  if (taux >= 50) return '#22C55E'
  return '#3B82F6'
}

export default function BudgetDetail({ basePath = '/mes-budgets' }) {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [budget,    setBudget]    = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [hasLignes, setHasLignes] = useState(false)

  const [showDepenseModal, setShowDepenseModal] = useState(false)
  const [depForm,          setDepForm]          = useState({ ligne_id: '', montant: '', note: '', file: null })
  const [depSaving,        setDepSaving]        = useState(false)
  const [depError,         setDepError]         = useState('')

  const [showEdit,   setShowEdit]   = useState(false)
  const [editForm,   setEditForm]   = useState({ nom: '', date_debut: '', date_fin: '' })
  const [editSaving, setEditSaving] = useState(false)
  const [editError,  setEditError]  = useState('')

  const [showSoumission,   setShowSoumission]   = useState(false)
  const [soumissionSaving, setSoumissionSaving] = useState(false)
  const [soumissionError,  setSoumissionError]  = useState('')

  const load = () => {
    getBudget(id)
      .then(b => setBudget(b.data))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [id])

  const handleDelete = async () => {
    if (!confirm('Supprimer définitivement ce budget ?')) return
    try { await deleteBudget(id); navigate(basePath) }
    catch (err) { alert(err.response?.data?.detail || 'Erreur') }
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
      await soumettrebudget(id)
      setShowSoumission(false); load()
    } catch (err) {
      setSoumissionError(err.response?.data?.detail || 'Erreur lors de la soumission')
    } finally { setSoumissionSaving(false) }
  }

  const openDepense = () => {
    setDepForm({ ligne_id: '', montant: '', note: '', file: null })
    setDepError(''); setShowDepenseModal(true)
  }
  const handleDepense = async (e) => {
    e.preventDefault()
    if (!depForm.file)     { setDepError('La pièce justificative est obligatoire.'); return }
    if (!depForm.ligne_id) { setDepError('Sélectionnez une ligne budgétaire.'); return }
    setDepSaving(true); setDepError('')
    try {
      await consommerLigne(id, depForm.ligne_id, parseFloat(depForm.montant), depForm.file, depForm.note)
      setShowDepenseModal(false); load()
    } catch (err) { setDepError(err.response?.data?.detail || 'Erreur') }
    finally { setDepSaving(false) }
  }

  if (loading || !budget) return <div className="page-loader"><div className="spinner" /></div>

  const editable  = ['BROUILLON', 'REJETE'].includes(budget.statut)
  const brouillon = budget.statut === 'BROUILLON'
  const approuve  = budget.statut === 'APPROUVE'

  const alloc           = budget.allocation_detail
  const allocAlloue     = parseFloat(alloc?.montant_alloue    || 0)
  const allocConsomme   = parseFloat(alloc?.montant_consomme  || 0)
  const allocDisponible = parseFloat(alloc?.montant_disponible || 0)
  const allocTaux       = allocAlloue > 0 ? Math.min(Math.round(allocConsomme / allocAlloue * 100), 100) : 0

  return (
    <div>

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <button
          onClick={() => navigate(basePath)}
          className="btn btn-secondary btn-sm"
          style={{ gap: 6, marginBottom: 16 }}
        >
          <ArrowLeft size={14} strokeWidth={2} /> Retour
        </button>

        <div style={{
          background: 'linear-gradient(160deg, #0F2547 0%, #1E3A8A 60%, #1D4ED8 100%)',
          borderRadius: 'var(--radius-lg)', padding: '24px 28px',
          color: '#fff', position: 'relative', overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(30,58,138,.3)',
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
      {brouillon && !hasLignes && (
        <StatusBanner type="info" icon={<FileText size={15} strokeWidth={2} />}>
          Budget en brouillon — ajoutez au moins une ligne budgétaire pour pouvoir le soumettre.
        </StatusBanner>
      )}
      {brouillon && hasLignes && (
        <StatusBanner type="primary" icon={<Info size={15} strokeWidth={2} />}>
          Budget prêt — cliquez sur <strong>Soumettre</strong> pour l'envoyer en validation.
        </StatusBanner>
      )}
      {budget.statut === 'SOUMIS' && (
        <StatusBanner type="primary" icon={<Info size={15} strokeWidth={2} />}>
          Budget soumis — en attente de validation par le comptable.
        </StatusBanner>
      )}
      {approuve && (
        <StatusBanner type="success" icon={<CheckCircle2 size={15} strokeWidth={2} />}>
          Budget approuvé — enregistrez les dépenses réelles avec leurs pièces justificatives.
        </StatusBanner>
      )}
      {budget.statut === 'REJETE' && (
        <StatusBanner type="danger" icon={<AlertTriangle size={15} strokeWidth={2} />}>
          Budget rejeté — corrigez les lignes puis soumettez à nouveau.
        </StatusBanner>
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
            readOnly={!editable}
            onTotalChange={(total) => setHasLignes(total > 0)}
          />
        </div>
      </div>

      {/* ── Barre d'actions ──────────────────────────────────────────────────── */}
      {(editable || approuve) && (
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

      {/* ── Modal dépense ────────────────────────────────────────────────────── */}
      {showDepenseModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowDepenseModal(false) }}>
          <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '15px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <DollarSign size={16} strokeWidth={2} style={{ color: 'var(--color-success-600)' }} />
                Enregistrer une dépense
              </h2>
            </div>
            <form onSubmit={handleDepense}>
              <div className="modal-body">
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">
                    Ligne budgétaire <span style={{ color: 'var(--color-danger-600)' }}>*</span>
                  </label>
                  <SelecteurLigne
                    budgetId={budget.id}
                    value={depForm.ligne_id}
                    onChange={(ligneId) => setDepForm(f => ({ ...f, ligne_id: ligneId }))}
                    error={depError && !depForm.ligne_id ? 'Sélectionnez une ligne budgétaire' : null}
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">Montant (FCFA) <span style={{ color: 'var(--color-danger-600)' }}>*</span></label>
                  <input
                    type="number" required min={0.01} step="0.01"
                    className="form-input" style={{ fontFamily: 'var(--font-mono)' }}
                    value={depForm.montant}
                    onChange={e => setDepForm(f => ({ ...f, montant: e.target.value }))}
                    placeholder="Ex : 50 000"
                  />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label className="form-label">Note / Description</label>
                  <input
                    className="form-input" value={depForm.note}
                    onChange={e => setDepForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="Ex : Facture fournisseur n°…"
                  />
                </div>
                <div style={{ marginBottom: 4 }}>
                  <label className="form-label">
                    Pièce justificative <span style={{ color: 'var(--color-danger-600)' }}>*</span>
                  </label>
                  <div style={{
                    border: '1.5px dashed var(--color-gray-300)', borderRadius: 'var(--radius-md)',
                    padding: '14px', display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--color-gray-50)',
                  }}>
                    <Paperclip size={15} strokeWidth={2} style={{ color: 'var(--color-gray-400)', flexShrink: 0 }} />
                    <input
                      type="file" required accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                      onChange={e => setDepForm(f => ({ ...f, file: e.target.files[0] || null }))}
                      style={{ fontSize: '13px', flex: 1 }}
                    />
                  </div>
                  <p className="form-hint">Formats acceptés : PDF, image, Word, Excel</p>
                </div>
                {depError && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', borderRadius: 8, background: 'var(--color-danger-50)', border: '1px solid var(--color-danger-200)', marginTop: 12 }}>
                    <AlertTriangle size={13} style={{ color: 'var(--color-danger-500)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--color-danger-700)', fontSize: '12px' }}>{depError}</span>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowDepenseModal(false)} className="btn btn-secondary btn-md">Annuler</button>
                <button
                  type="submit"
                  disabled={depSaving || !depForm.file || !depForm.ligne_id || !depForm.montant}
                  className="btn btn-success btn-md" style={{ gap: 6 }}
                >
                  {depSaving ? <><span className="spinner-sm" /> Enregistrement…</> : <><Check size={14} strokeWidth={2.5} /> Confirmer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
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
