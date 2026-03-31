import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { getBudgets, getBudget, getLignes, approuverBudget, rejeterBudget, cloturerBudget } from '../../api/budget'
import { StatutBadge } from '../../components/StatusBadge'
import { Search, ArrowLeft, ArrowRight, CheckCircle2, XCircle, TrendingUp, BarChart3, Download, Printer } from 'lucide-react'
import { exportCSV, printPDF } from '../../utils/export'

const fmt  = (n) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))
const fmtK = fmt

/* ══════════════════════════════════════════════════════════════════════════════
   Liste des budgets à valider
══════════════════════════════════════════════════════════════════════════════ */
export function BudgetsAValiderList() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const [budgets,    setBudgets]    = useState([])
  const [allBudgets, setAllBudgets] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [filtre,     setFiltre]     = useState(searchParams.get('statut') || 'SOUMIS')
  const deptId = searchParams.get('dept')

  useEffect(() => {
    const s = searchParams.get('statut') || 'SOUMIS'
    if (s !== filtre) { setFiltre(s); setLoading(true) }
  }, [searchParams])

  // Charger tous les budgets une seule fois pour les comptages
  useEffect(() => {
    getBudgets().then(r => setAllBudgets(r.data.results ?? r.data)).catch(() => {})
  }, [])

  useEffect(() => {
    const params = { statut: filtre || undefined }
    if (deptId) params.departement = deptId
    getBudgets(params)
      .then(r => setBudgets(r.data.results ?? r.data))
      .finally(() => setLoading(false))
  }, [filtre, deptId])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  // R-COMPT-01 : le Comptable ne voit jamais BROUILLON (filtré côté API)
  const FILTRES = [
    { key: 'SOUMIS',   label: 'En attente', countKey: 'SOUMIS'   },
    { key: 'APPROUVE', label: 'Approuvés',  countKey: 'APPROUVE' },
    { key: 'REJETE',   label: 'Rejetés',    countKey: 'REJETE'   },
    { key: '',         label: 'Tous',       countKey: null        },
  ]

  const countFor = (key) => key
    ? allBudgets.filter(b => b.statut === key).length
    : allBudgets.length

  const q       = search.trim().toLowerCase()
  const visible = q
    ? budgets.filter(b =>
        b.nom?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.gestionnaire_nom?.toLowerCase().includes(q) ||
        b.departement_nom?.toLowerCase().includes(q)
      )
    : budgets

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budgets à valider</h1>
          <p className="page-subtitle">{visible.length} budget{visible.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              const headers = ['Code','Nom','Département','Gestionnaire','Statut','Montant (FCFA)','Date soumission']
              const rows = visible.map(b => [
                b.code, b.nom, b.departement_nom || '—', b.gestionnaire_nom || '—', b.statut,
                fmt(b.montant_global),
                b.date_soumission ? new Date(b.date_soumission).toLocaleDateString('fr-FR') : '—',
              ])
              exportCSV(`budgets-validation-${new Date().toISOString().slice(0,10)}`, headers, rows)
            }}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <Download size={13} strokeWidth={2} /> CSV
          </button>
          <button
            onClick={() => {
              const headers = ['Code','Nom','Gestionnaire','Statut','Montant']
              const rows = visible.map(b => [
                b.code, b.nom, b.gestionnaire_nom || '—', b.statut,
                fmt(b.montant_global) + ' FCFA',
              ])
              printPDF('Budgets à valider', headers, rows, {
                subtitle: `Filtre : ${FILTRES.find(f => f.key === filtre)?.label || 'Tous'}`,
                stats: [
                  { value: countFor('SOUMIS'),   label: 'En attente' },
                  { value: countFor('APPROUVE'), label: 'Approuvés'  },
                  { value: countFor('REJETE'),   label: 'Rejetés'    },
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

      {/* Barre recherche + filtres */}
      <div className="filter-bar mb-5">
        <div className="search-wrapper flex-[1_1_240px] max-w-[360px]">
          <Search size={14} strokeWidth={2} className="search-icon" />
          <input
            className="search-input"
            type="text"
            placeholder="Rechercher par nom, code, gestionnaire…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-[6px] flex-wrap">
          {FILTRES.map(f => {
            const cnt = countFor(f.countKey)
            return (
              <button
                key={f.key}
                onClick={() => { setLoading(true); setFiltre(f.key) }}
                className={`filter-pill${filtre === f.key ? ' active' : ''}`}
              >
                {f.label}
                <span style={{
                  marginLeft: 5,
                  background: filtre === f.key ? 'rgba(255,255,255,.25)' : 'var(--color-gray-200)',
                  color: filtre === f.key ? '#fff' : 'var(--color-gray-600)',
                  fontSize: '10px', padding: '0px 5px', borderRadius: 8, fontWeight: 700,
                }}>
                  {cnt}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <CheckCircle2 size={28} strokeWidth={1.5} className="text-[var(--color-success-400)]" />
          </div>
          <p className="empty-title">Aucun budget</p>
          <p className="empty-body">
            {q ? `Aucun résultat pour « ${search} »` : 'Aucun budget pour ce filtre'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {visible.map(b => (
            <div
              key={b.id}
              className="card card-hover cursor-pointer border-l-4 border-primary-500"
              onClick={() => navigate(`/validation/${b.id}`)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-[6px] flex-wrap">
                    <span className="code-tag">{b.code}</span>
                    <StatutBadge statut={b.statut} />
                  </div>
                  <div className="font-display font-bold text-[15px] text-gray-900 mb-1">
                    {b.nom}
                  </div>
                  <div className="text-[12px] text-[#6B7280]">
                    {b.departement_nom} · Gestionnaire : <strong>{b.gestionnaire_nom || '—'}</strong>
                    {b.comptable_nom && (
                      <span style={{ marginLeft: 8 }}>
                        · {b.statut === 'APPROUVE' ? 'Approuvé' : 'Rejeté'} par : <strong>{b.comptable_nom}</strong>
                      </span>
                    )}
                  </div>
                  {b.date_soumission && (
                    <div className="text-[11px] text-[#9CA3AF] mt-1">
                      Soumis le {new Date(b.date_soumission).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-[16px] text-gray-900">
                    {fmt(b.montant_global)}
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] mb-3">FCFA global</div>
                  <button
                    className="btn btn-primary btn-sm gap-[5px]"
                    onClick={e => { e.stopPropagation(); navigate(`/validation/${b.id}`) }}
                  >
                    Examiner <ArrowRight size={12} strokeWidth={2.5} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════════════════
   Détail budget — vue comptable (Budget vs Réel)
══════════════════════════════════════════════════════════════════════════════ */
export function BudgetValidationDetail() {
  const { id }   = useParams()
  const navigate = useNavigate()
  const [budget,      setBudget]      = useState(null)
  const [lignes,      setLignes]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [showRejet,   setShowRejet]   = useState(false)
  const [motifRejet,  setMotifRejet]  = useState('')
  const [motifError,  setMotifError]  = useState('')

  const load = () => {
    Promise.all([getBudget(id), getLignes(id)])
      .then(([b, l]) => { setBudget(b.data); setLignes(l.data.results ?? l.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [id])

  const handleAction = async (type) => {
    if (type === 'rejeter') {
      setMotifRejet(''); setMotifError(''); setShowRejet(true)
      return
    }
    if (!confirm('Approuver ce budget ?')) return
    setSaving(true)
    try {
      await approuverBudget(id)
      navigate('/validation')
    } catch (err) { alert(err.response?.data?.detail || 'Erreur') }
    finally { setSaving(false) }
  }

  const handleRejeterConfirm = async () => {
    if (motifRejet.trim().length < 10) {
      setMotifError('Le motif doit faire au moins 10 caractères.')
      return
    }
    setSaving(true)
    try {
      await rejeterBudget(id, { motif: motifRejet })
      setShowRejet(false)
      navigate('/validation')
    } catch (err) { setMotifError(err.response?.data?.detail || 'Erreur') }
    finally { setSaving(false) }
  }

  const handleCloturer = async () => {
    if (!confirm('Clôturer ce budget ? Cette action est irréversible.')) return
    setSaving(true)
    try {
      await cloturerBudget(id)
      navigate('/validation')
    } catch (err) { alert(err.response?.data?.detail || 'Erreur') }
    finally { setSaving(false) }
  }

  if (loading || !budget) return <div className="page-loader"><div className="spinner" /></div>

  const depenses    = lignes.filter(l => l.section === 'DEPENSE')
  const revenus     = lignes.filter(l => l.section === 'REVENU')
  const totalBudget = lignes.reduce((s, l) => s + parseFloat(l.montant_alloue   || 0), 0)
  const totalReel   = lignes.reduce((s, l) => s + parseFloat(l.montant_consomme || 0), 0)
  const ecartGlobal = totalBudget - totalReel
  const tauxGlobal  = totalBudget > 0 ? Math.round(totalReel / totalBudget * 100) : 0

  const tauColor = (t) => t >= 95 ? 'var(--color-danger-600)' : t >= 80 ? 'var(--color-warning-600)' : t >= 50 ? 'var(--color-success-600)' : 'var(--color-primary-600)'

  return (
    <div>
      {/* Hero header */}
      <div
        className="rounded-[var(--radius-lg)] px-[30px] py-[26px] mb-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #1C1917 0%, #252120 60%, #2E2A27 100%)' }}
      >
        <div className="absolute rounded-full pointer-events-none" style={{ top: -50, right: -50, width: 200, height: 200, background: 'rgba(201,168,76,.06)' }} />
        <div className="relative flex items-start gap-4">
          <button
            onClick={() => navigate('/validation')}
            className="rounded-[9px] px-[10px] py-2 cursor-pointer text-white flex items-center shrink-0 mt-[2px]"
            style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.2)' }}
          >
            <ArrowLeft size={16} strokeWidth={2} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-[10px] mb-2 flex-wrap">
              <code
                className="rounded-[6px] px-[10px] py-[3px] text-[12px] font-bold font-mono"
                style={{ background: 'rgba(255,255,255,.15)' }}
              >
                {budget.code}
              </code>
              <StatutBadge statut={budget.statut} />
              <span className="text-[12px] opacity-70">{budget.date_debut} → {budget.date_fin}</span>
            </div>
            <h1 className="font-display font-extrabold text-[1.4rem] tracking-[-0.4px] mb-[6px]">
              {budget.nom}
            </h1>
            <p className="opacity-75 text-[13px]">
              Gestionnaire : <strong>{budget.gestionnaire_nom || '—'}</strong>
              &nbsp;·&nbsp;Département : <strong>{budget.departement_nom}</strong>
            </p>
          </div>
          <div className="flex gap-[10px] shrink-0">
            {budget.statut === 'SOUMIS' && (
              <>
                <button
                  onClick={() => handleAction('rejeter')}
                  disabled={saving}
                  className="inline-flex items-center gap-[7px] px-[18px] py-[9px] rounded-[9px] font-bold text-[13px] cursor-pointer"
                  style={{ border: '1.5px solid rgba(252,165,165,.5)', background: 'rgba(239,68,68,.15)', color: '#fca5a5' }}
                >
                  <XCircle size={15} strokeWidth={2} /> Rejeter
                </button>
                <button
                  onClick={() => handleAction('approuver')}
                  disabled={saving}
                  className="inline-flex items-center gap-[7px] px-[18px] py-[9px] rounded-[9px] border-none text-white font-bold text-[13px] cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 2px 10px rgba(5,150,105,.4)' }}
                >
                  <CheckCircle2 size={15} strokeWidth={2} /> Approuver
                </button>
              </>
            )}
            {budget.statut === 'APPROUVE' && (
              <button
                onClick={handleCloturer}
                disabled={saving}
                className="inline-flex items-center gap-[7px] px-[18px] py-[9px] rounded-[9px] border-none text-white font-bold text-[13px] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 2px 10px rgba(124,58,237,.4)' }}
              >
                Clôturer
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 KPI cards */}
      <div className="grid grid-cols-4 gap-[14px] mb-[22px]">
        {[
          {
            label: 'BUDGET GLOBAL', value: fmt(totalBudget), unit: 'FCFA',
            sub: 'Montant alloué total',
            color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)',
            icon: <BarChart3 size={18} strokeWidth={1.8} />,
          },
          {
            label: 'MONTANT RÉEL', value: fmt(totalReel), unit: 'FCFA',
            sub: 'Dépenses enregistrées',
            color: 'var(--color-warning-600)', bg: 'var(--color-warning-50)',
            icon: <TrendingUp size={18} strokeWidth={1.8} />,
          },
          {
            label: 'ÉCART',
            value: `${ecartGlobal >= 0 ? '+' : ''}${fmt(ecartGlobal)}`, unit: 'FCFA',
            sub: ecartGlobal >= 0 ? 'Sous le budget' : 'Dépassement',
            color: ecartGlobal >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)',
            bg:    ecartGlobal >= 0 ? 'var(--color-success-50)'  : 'var(--color-danger-50)',
            icon: ecartGlobal >= 0
              ? <CheckCircle2 size={18} strokeWidth={1.8} />
              : <XCircle size={18} strokeWidth={1.8} />,
          },
          {
            label: 'TAUX CONSOMMATION', value: `${tauxGlobal}%`, unit: '',
            sub: `${lignes.length} ligne${lignes.length !== 1 ? 's' : ''}`,
            color: tauColor(tauxGlobal),
            bg: tauxGlobal >= 95 ? 'var(--color-danger-50)' : tauxGlobal >= 80 ? 'var(--color-warning-50)' : 'var(--color-primary-50)',
            icon: <BarChart3 size={18} strokeWidth={1.8} />,
          },
        ].map(({ label, value, unit, sub, color, bg, icon }) => (
          <div key={label} className="card px-5 py-[18px] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: color }} />
            <div className="flex justify-between items-start mb-3">
              <span className="text-[10px] font-bold text-[#6B7280] tracking-[.5px]">{label}</span>
              <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ background: bg, color }}>{icon}</div>
            </div>
            <div className="font-mono font-extrabold text-[1.2rem] tracking-[-0.3px] mb-1" style={{ color }}>
              {value} {unit && <span className="text-[11px] font-medium opacity-70">{unit}</span>}
            </div>
            <div className="text-[11px] text-[#9CA3AF]">{sub}</div>
          </div>
        ))}
      </div>

      {/* Barre de progression globale */}
      <div className="card mb-[22px]">
        <div className="flex justify-between items-center mb-[10px]">
          <span className="text-[13px] font-semibold text-[#374151]">Consommation globale</span>
          <span className="text-[13px] font-bold font-mono" style={{ color: tauColor(tauxGlobal) }}>
            {tauxGlobal}%
          </span>
        </div>
        <div className="h-[10px] bg-[#F3F4F6] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-[width_.4s]"
            style={{
              width: `${Math.min(tauxGlobal, 100)}%`,
              background: `linear-gradient(90deg, ${tauColor(Math.max(0, tauxGlobal - 20))}, ${tauColor(tauxGlobal)})`,
            }}
          />
        </div>
        <div className="flex justify-between mt-[6px] text-[11px] text-[#9CA3AF] font-mono">
          <span>0</span>
          <span>{fmt(totalReel)} / {fmt(totalBudget)} FCFA</span>
          <span>{fmt(totalBudget)} FCFA</span>
        </div>
      </div>

      {/* Sections */}
      <SectionBudget
        titre="Dépenses"
        lignes={depenses}
        couleur="#D97706"
        couleurBg="var(--color-warning-50)"
        couleurBorder="var(--color-warning-200)"
      />
      <div className="h-4" />
      <SectionBudget
        titre="Revenus"
        lignes={revenus}
        couleur="#0D9488"
        couleurBg="#f0fdfa"
        couleurBorder="#99f6e4"
      />

      {/* Zone de décision */}
      {(budget.statut === 'SOUMIS' || budget.statut === 'APPROUVE') && (
        <div
          className="mt-6 rounded-[var(--radius-lg)] px-7 py-[22px] flex justify-between items-center flex-wrap gap-4"
          style={{ background: 'linear-gradient(135deg, #1C1917, #252120)' }}
        >
          <div>
            <div className="font-display font-bold text-white mb-1 text-[15px]">
              {budget.statut === 'APPROUVE' ? 'Clôture budgétaire' : 'Décision de validation'}
            </div>
            <div className="text-[13px] text-white/65">
              {budget.statut === 'APPROUVE'
                ? 'Clôturez le budget pour figer la consommation finale'
                : 'Analysez les lignes ci-dessus avant de valider ou rejeter ce budget'
              }
            </div>
          </div>
          <div className="flex gap-3">
            {budget.statut === 'SOUMIS' && (
              <>
                <button
                  onClick={() => handleAction('rejeter')}
                  disabled={saving}
                  className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[9px] font-bold text-[14px] cursor-pointer"
                  style={{ border: '1.5px solid rgba(252,165,165,.5)', background: 'rgba(239,68,68,.15)', color: '#fca5a5' }}
                >
                  <XCircle size={15} strokeWidth={2} /> Rejeter le budget
                </button>
                <button
                  onClick={() => handleAction('approuver')}
                  disabled={saving}
                  className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[9px] border-none text-white font-bold text-[14px] cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #059669, #10b981)', boxShadow: '0 2px 14px rgba(5,150,105,.4)' }}
                >
                  <CheckCircle2 size={15} strokeWidth={2} /> Approuver le budget
                </button>
              </>
            )}
            {budget.statut === 'APPROUVE' && (
              <button
                onClick={handleCloturer}
                disabled={saving}
                className="inline-flex items-center gap-[7px] px-[22px] py-[10px] rounded-[9px] border-none text-white font-bold text-[14px] cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)', boxShadow: '0 2px 14px rgba(124,58,237,.4)' }}
              >
                Clôturer le budget
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de rejet avec motif */}
      {showRejet && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowRejet(false) }}>
          <div className="modal-panel" style={{ maxWidth: 480 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={16} style={{ color: 'var(--color-danger-600)' }} />
                Rejeter le budget
              </h2>
            </div>
            <div className="modal-body" style={{ padding: '20px' }}>
              <p style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: 16 }}>
                Indiquez un motif de rejet détaillé (minimum 10 caractères). Il sera transmis au gestionnaire.
              </p>
              <label className="form-label">Motif de rejet <span style={{ color: 'var(--color-danger-600)' }}>*</span></label>
              <textarea
                className="form-input"
                rows={4}
                value={motifRejet}
                onChange={e => { setMotifRejet(e.target.value); setMotifError('') }}
                placeholder="Ex : Les montants des lignes B.1 et B.2 semblent surestimés par rapport à l'exercice précédent…"
                style={{ resize: 'vertical', fontFamily: 'inherit' }}
              />
              {motifError && (
                <p style={{ fontSize: '12px', color: 'var(--color-danger-600)', marginTop: 6 }}>{motifError}</p>
              )}
              <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: 4 }}>
                {motifRejet.length} / 500 caractères
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowRejet(false)} className="btn btn-secondary btn-md">Annuler</button>
              <button
                onClick={handleRejeterConfirm}
                disabled={saving}
                className="btn btn-danger btn-md"
                style={{ gap: 6 }}
              >
                <XCircle size={14} /> Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


/* ══════════════════════════════════════════════════════════════════════════════
   Composant section (Revenus ou Dépenses)
══════════════════════════════════════════════════════════════════════════════ */
function SectionBudget({ titre, lignes, couleur, couleurBg, couleurBorder }) {
  const totalAlloue   = lignes.reduce((s, l) => s + parseFloat(l.montant_alloue   || 0), 0)
  const totalConsomme = lignes.reduce((s, l) => s + parseFloat(l.montant_consomme || 0), 0)
  const difference    = totalAlloue - totalConsomme
  const tauxGlobal    = totalAlloue > 0 ? Math.round(totalConsomme / totalAlloue * 100) : 0
  const maxVal        = Math.max(...lignes.map(l => parseFloat(l.montant_alloue || 0)), 1)

  const pctBadge = (pct) => {
    if (pct >= 90) return { bg: 'var(--color-danger-50)',   color: 'var(--color-danger-700)'  }
    if (pct >= 75) return { bg: 'var(--color-warning-50)',  color: 'var(--color-warning-700)' }
    return              { bg: 'var(--color-success-50)',  color: 'var(--color-success-700)' }
  }

  return (
    <div className="card p-0 overflow-hidden">
      {/* En-tête section */}
      <div
        className="px-5 py-3 flex justify-between items-center"
        style={{ borderBottom: `1px solid ${couleurBorder}`, background: couleurBg }}
      >
        <h3 className="font-display font-extrabold text-[15px]" style={{ color: couleur }}>
          {titre}
        </h3>
        <div className="flex gap-[18px] text-[12px]">
          <span className="text-[#6B7280]">
            Budget : <strong style={{ color: couleur }}>{fmtK(totalAlloue)} FCFA</strong>
          </span>
          <span className="text-[#6B7280]">
            Réel : <strong className="text-[#374151]">{fmtK(totalConsomme)} FCFA</strong>
          </span>
          <span className="font-bold" style={{ color: difference >= 0 ? 'var(--color-success-600)' : 'var(--color-danger-600)' }}>
            {difference >= 0 ? '▲ +' : '▼ '}{fmtK(difference)} FCFA
          </span>
        </div>
      </div>

      {lignes.length === 0 ? (
        <div className="text-center py-8 text-[#9CA3AF] text-[13px]">
          Aucune ligne de type « {titre.toLowerCase()} »
        </div>
      ) : (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px,100%), 1fr))', gap: 0 }}>

          {/* Panneau gauche : KPI */}
          <div className="p-5 border-r border-[#F3F4F6]">
            <div className="mb-[14px]">
              <span
                className="font-mono font-extrabold text-[1.4rem]"
                style={{ color: difference >= 0 ? 'var(--color-success-700)' : 'var(--color-danger-600)' }}
              >
                {difference >= 0 ? '+' : ''}{fmtK(difference)} FCFA
              </span>
            </div>
            <div className="flex justify-between text-[12px] mb-1">
              <span className="text-[#6B7280]">Budget alloué</span>
              <span className="font-bold font-mono">{fmtK(totalAlloue)}</span>
            </div>
            <div className="flex justify-between text-[12px] mb-[18px]">
              <span className="text-[#6B7280]">Consommé</span>
              <span className="font-bold font-mono">{fmtK(totalConsomme)}</span>
            </div>

            <div className="text-[10px] font-bold text-[#9CA3AF] mb-[6px] tracking-[.3px]">
              {titre.toUpperCase()} % DU BUDGET
            </div>
            <div
              className="h-6 rounded-[6px] overflow-hidden relative mb-1"
              style={{ background: couleurBg, border: `1px solid ${couleurBorder}` }}
            >
              <div
                className="h-full rounded-[6px] transition-[width_.4s]"
                style={{ width: `${Math.min(tauxGlobal, 100)}%`, background: couleur }}
              />
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[11px] font-bold"
                style={{ color: tauxGlobal > 40 ? '#fff' : couleur }}
              >
                {tauxGlobal}%
              </span>
            </div>
          </div>

          {/* Centre : graphe barres horizontales */}
          <div className="p-4 border-r border-[#F3F4F6] overflow-y-auto max-h-[300px]">
            <div className="flex gap-4 text-[10px] font-bold text-[#9CA3AF] mb-3">
              <span className="flex items-center gap-[5px]">
                <span className="w-[10px] h-[10px] rounded-[2px] inline-block" style={{ background: couleur }} />
                Alloué
              </span>
              <span className="flex items-center gap-[5px]">
                <span
                  className="w-[10px] h-[10px] rounded-[2px] inline-block"
                  style={{ background: `${couleur}55`, border: `1.5px dashed ${couleur}` }}
                />
                Consommé
              </span>
            </div>
            {lignes.map(l => {
              const pctAlloue   = (parseFloat(l.montant_alloue   || 0) / maxVal) * 100
              const pctConsomme = (parseFloat(l.montant_consomme || 0) / maxVal) * 100
              return (
                <div key={l.id} className="mb-[14px]">
                  <div className="text-[12px] font-medium text-[#374151] mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {l.libelle}
                  </div>
                  <div className="h-[9px] bg-[#F3F4F6] rounded-full overflow-hidden mb-[3px]">
                    <div className="h-full rounded-full" style={{ width: `${pctAlloue}%`, background: couleur }} />
                  </div>
                  <div className="h-[9px] bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pctConsomme}%`, background: `${couleur}88`, border: `1px dashed ${couleur}` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-[2px] font-mono">
                    <span>{fmtK(l.montant_alloue)} FCFA</span>
                    <span>{fmtK(l.montant_consomme)} FCFA</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Droite : tableau des lignes */}
          <div className="overflow-y-auto max-h-[300px]">
            <table className="data-table rounded-none">
              <thead className="sticky top-0 z-[1]">
                <tr style={{ background: couleur }}>
                  {['Libellé', 'Budget', 'Réel', 'Écart', '% Budget'].map(h => (
                    <th
                      key={h}
                      className="text-[10px] font-bold text-white tracking-[.3px] whitespace-nowrap px-[10px] py-2"
                      style={{ textAlign: h === 'Libellé' ? 'left' : 'right', background: couleur }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lignes.map((l, i) => {
                  const alloue   = parseFloat(l.montant_alloue   || 0)
                  const consomme = parseFloat(l.montant_consomme || 0)
                  const ecart    = alloue - consomme
                  const pct      = totalAlloue > 0 ? Math.round(alloue / totalAlloue * 100) : 0
                  const { bg, color } = pctBadge(pct)
                  return (
                    <tr key={l.id} style={{ background: i % 2 === 0 ? '#fff' : couleurBg }}>
                      <td className="px-[10px] py-2 text-[12px] font-medium max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {l.libelle}
                      </td>
                      <td className="px-[10px] py-2 text-[12px] text-right font-semibold font-mono">
                        {fmtK(alloue)}
                      </td>
                      <td className="px-[10px] py-2 text-[12px] text-right text-[#6B7280] font-mono">
                        {fmtK(consomme)}
                      </td>
                      <td
                        className="px-[10px] py-2 text-[12px] text-right font-semibold font-mono"
                        style={{ color: ecart >= 0 ? 'var(--color-success-700)' : 'var(--color-danger-600)' }}
                      >
                        {fmtK(ecart)}
                      </td>
                      <td className="px-[10px] py-2 text-right">
                        <span
                          className="rounded-full px-2 py-[2px] text-[10px] font-bold"
                          style={{ background: bg, color }}
                        >
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
