import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getDepenses } from '../../api/depenses'
import { getBudget, getBudgetArbre, exportDepensesExcel, exportDepensesPdf } from '../../api/budget'
import { ArrowLeft, ExternalLink, Download, ChevronDown, ChevronRight } from 'lucide-react'

const fmt     = (n)   => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

const STATUS_DOT = {
  VALIDEE: { bg: '#16A34A', label: 'Validée'    },
  SAISIE:  { bg: '#D97706', label: 'En attente' },
  REJETEE: { bg: '#DC2626', label: 'Rejetée'    },
}

export default function DepensesParBudget({ basePath = '/mes-depenses', depenseBasePath = '/mes-depenses' }) {
  const { budgetId } = useParams()
  const navigate     = useNavigate()
  const { isAdmin, isComptable } = useAuth()

  const [budget,     setBudget]     = useState(null)
  const [arbre,      setArbre]      = useState([])
  const [depenses,   setDepenses]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [openCats,   setOpenCats]   = useState({})
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting,  setExporting]  = useState('')
  const exportRef = useRef(null)

  const load = () => {
    setLoading(true)
    Promise.all([
      getBudget(budgetId),
      getBudgetArbre(budgetId),
      getDepenses({ budget: budgetId }),
    ])
      .then(([bRes, aRes, dRes]) => {
        setBudget(bRes.data)
        const cats = aRes.data?.data ?? []
        setArbre(cats)
        const open = {}
        cats.forEach(c => { open[c.id] = true })
        setOpenCats(open)
        setDepenses(dRes.data?.data ?? [])
      })
      .catch(() => navigate(basePath))
      .finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [budgetId])

  // Fermer le dropdown au clic extérieur
  useEffect(() => {
    const handler = (e) => { if (exportRef.current && !exportRef.current.contains(e.target)) setExportOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  const depByLigne = {}
  depenses.forEach(d => {
    if (!d.ligne_id) return
    if (!depByLigne[d.ligne_id]) depByLigne[d.ligne_id] = []
    depByLigne[d.ligne_id].push(d)
  })

  const total   = depenses.reduce((s, d) => s + parseFloat(d.montant || 0), 0)
  const budgetGlobal = parseFloat(budget?.montant_global || 0)
  const taux    = budgetGlobal > 0 ? Math.min(100, Math.round(total / budgetGlobal * 100)) : 0
  const tauxColor = taux >= 95 ? '#DC2626' : taux >= 80 ? '#D97706' : '#2563EB'

  const budgetPath = isAdmin
    ? `/budgets/${budgetId}`
    : isComptable
      ? `/validation/${budgetId}`
      : `/mes-budgets/${budgetId}`

  const handleExport = async (fn, key) => {
    if (exporting) return
    setExporting(key)
    setExportOpen(false)
    try { await fn(budgetId, budget?.code) }
    catch { /* silent */ }
    finally { setExporting('') }
  }

  return (
    <div>
      {/* Retour */}
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => navigate(basePath)} className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <ArrowLeft size={14} strokeWidth={2} /> Retour
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 20 }}>

        {/* ── Header navy ── */}
        <div style={{ background: '#1E3A8A', padding: '20px 28px', color: '#fff', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,.05)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(255,255,255,.18)', borderRadius: 7, padding: '3px 10px', fontSize: '11px', fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '.5px' }}>
                  {budget?.code}
                </span>
                <span style={{ fontSize: '12px', opacity: .7 }}>
                  {depenses.length} dépense{depenses.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', lineHeight: 1.3, marginBottom: 6 }}>{budget?.nom}</div>
              {budget?.departement_nom && (
                <div style={{ fontSize: '12px', opacity: .75 }}>{budget.departement_nom}</div>
              )}
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: '10px', opacity: .55, textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: 3 }}>Total dépensé</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '1.5rem', lineHeight: 1 }}>{fmt(total)}</div>
              <div style={{ fontSize: '11px', opacity: .6, marginTop: 2 }}>FCFA</div>
            </div>
          </div>

          {/* Barre de progression */}
          {budgetGlobal > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: '11px' }}>
                <span style={{ opacity: .6 }}>Consommation du budget alloué</span>
                <span style={{ fontWeight: 700, color: taux >= 95 ? '#FCA5A5' : taux >= 80 ? '#FCD34D' : '#93C5FD' }}>
                  {taux}%
                </span>
              </div>
              <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.15)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  width: `${taux}%`,
                  background: taux >= 95 ? '#FCA5A5' : taux >= 80 ? '#FCD34D' : '#60A5FA',
                  transition: 'width .4s',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '10px', opacity: .5, fontFamily: 'var(--font-mono)' }}>
                <span>{fmt(total)} FCFA dépensés</span>
                <span>{fmt(budgetGlobal)} FCFA alloués</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Bande budget parent + export ── */}
        <div style={{ padding: '10px 24px', borderBottom: '1px solid var(--color-gray-100)', background: 'var(--color-gray-50)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-400)', textTransform: 'uppercase', letterSpacing: '.4px' }}>Budget</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, background: 'var(--color-primary-100)', color: 'var(--color-primary-700)', padding: '2px 8px', borderRadius: 6 }}>
            {budget?.code}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-gray-700)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {budget?.nom}
          </span>
          <Link to={budgetPath} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '12px', fontWeight: 600, color: 'var(--color-primary-600)', textDecoration: 'none', flexShrink: 0 }}>
            <ExternalLink size={12} strokeWidth={2} /> Voir le budget
          </Link>

          {/* Bouton Export dropdown */}
          <div ref={exportRef} style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setExportOpen(o => !o)}
              disabled={!!exporting}
              className="btn btn-secondary btn-sm"
              style={{ gap: 6 }}
            >
              {exporting
                ? <><span className="spinner-sm" /> Export…</>
                : <><Download size={12} strokeWidth={2} /> Exporter <ChevronDown size={10} strokeWidth={2.5} /></>
              }
            </button>
            {exportOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 50,
                background: '#fff', border: '1px solid var(--color-gray-200)',
                borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,.12)',
                minWidth: 190, overflow: 'hidden',
              }}>
                <div style={{ padding: '6px 0' }}>
                  <button
                    onClick={() => handleExport(exportDepensesPdf, 'pdf')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '13px', color: 'var(--color-gray-700)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: '15px' }}>📄</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Exporter en PDF</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>Document imprimable</div>
                    </div>
                  </button>
                  <button
                    onClick={() => handleExport(exportDepensesExcel, 'xlsx')}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                      padding: '9px 16px', background: 'none', border: 'none',
                      cursor: 'pointer', fontSize: '13px', color: 'var(--color-gray-700)',
                      textAlign: 'left',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-gray-50)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <span style={{ fontSize: '15px' }}>📊</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>Exporter en Excel</div>
                      <div style={{ fontSize: '11px', color: 'var(--color-gray-400)'  }}>.xlsx — compatible Excel</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Titre section ── */}
        <div style={{ padding: '12px 24px 10px', borderBottom: '1px solid var(--color-gray-200)', background: '#fff' }}>
          <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--color-gray-700)' }}>Dépenses par ligne budgétaire</span>
        </div>

        {/* ── Arbre catégories ── */}
        {arbre.length === 0 ? (
          <div style={{ padding: '36px 24px', textAlign: 'center', color: 'var(--color-gray-400)', fontSize: '13px' }}>
            Aucune structure budgétaire trouvée.
          </div>
        ) : arbre.map(cat => {
          const catDeps = cat.sous_categories.flatMap(sc => sc.lignes.flatMap(l => depByLigne[l.id] || []))
          if (catDeps.length === 0) return null
          const catTotal = catDeps.reduce((s, d) => s + parseFloat(d.montant || 0), 0)
          const isOpen   = openCats[cat.id] !== false

          return (
            <div key={cat.id}>
              {/* ── Catégorie ── */}
              <div
                onClick={() => setOpenCats(o => ({ ...o, [cat.id]: !isOpen }))}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', cursor: 'pointer', background: '#EFF6FF', borderBottom: '1px solid var(--color-primary-100)', userSelect: 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = '#DBEAFE'}
                onMouseLeave={e => e.currentTarget.style.background = '#EFF6FF'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {isOpen
                    ? <ChevronDown  size={14} strokeWidth={2.5} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                    : <ChevronRight size={14} strokeWidth={2.5} style={{ color: 'var(--color-primary-600)', flexShrink: 0 }} />
                  }
                  {cat.code && <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--color-primary-800)' }}>{cat.code}</span>}
                  <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--color-primary-900)' }}>{cat.libelle}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '13px', color: 'var(--color-primary-800)', whiteSpace: 'nowrap' }}>
                  {fmt(catTotal)} FCFA
                </span>
              </div>

              {isOpen && cat.sous_categories.map(sc => {
                const scDeps = sc.lignes.flatMap(l => depByLigne[l.id] || [])
                if (scDeps.length === 0) return null
                const scTotal = scDeps.reduce((s, d) => s + parseFloat(d.montant || 0), 0)

                return (
                  <div key={sc.id}>
                    {/* ── Sous-catégorie ── */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 24px 8px 48px', background: '#F8FAFC', borderBottom: '1px solid var(--color-gray-100)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {sc.code && <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: 'var(--color-gray-600)' }}>{sc.code}</span>}
                        <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-gray-700)' }}>{sc.libelle}</span>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '12px', color: 'var(--color-gray-600)', whiteSpace: 'nowrap' }}>
                        {fmt(scTotal)} FCFA
                      </span>
                    </div>

                    {sc.lignes.map(ligne => {
                      const lignesDeps = depByLigne[ligne.id] || []
                      if (lignesDeps.length === 0) return null

                      return (
                        <div key={ligne.id}>
                          {/* ── En-tête ligne budgétaire ── */}
                          <div style={{
                            display: 'grid', gridTemplateColumns: '1fr 160px 90px',
                            padding: '6px 24px 6px 68px', gap: 12,
                            background: 'var(--color-gray-50)', borderBottom: '1px solid var(--color-gray-100)',
                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '.4px', color: 'var(--color-gray-400)',
                          }}>
                            <span style={{ color: 'var(--color-gray-600)', fontSize: '11px', textTransform: 'none', fontWeight: 600, letterSpacing: 0 }}>
                              {ligne.code && <span style={{ fontFamily: 'var(--font-mono)', marginRight: 8, color: 'var(--color-gray-500)' }}>{ligne.code}</span>}
                              {ligne.libelle}
                            </span>
                            <span style={{ textAlign: 'right' }}>Montant dépensé</span>
                            <span style={{ textAlign: 'center' }}>Date</span>
                          </div>

                          {/* ── Dépenses de cette ligne ── */}
                          {lignesDeps.map((d, idx) => {
                            const dot = STATUS_DOT[d.statut] || { bg: '#9CA3AF', label: d.statut }
                            return (
                              <div
                                key={d.id}
                                onClick={() => navigate(`${depenseBasePath}/${d.id}`)}
                                style={{
                                  display: 'grid', gridTemplateColumns: '1fr 160px 90px',
                                  padding: '11px 24px 11px 68px', gap: 12,
                                  borderBottom: idx < lignesDeps.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                                  alignItems: 'center', cursor: 'pointer', transition: 'background .1s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#EFF6FF'}
                                onMouseLeave={e => e.currentTarget.style.background = ''}
                              >
                                {/* Désignation + dot statut */}
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
                                    {/* Dot statut */}
                                    <span
                                      title={dot.label}
                                      style={{
                                        display: 'inline-block', width: 7, height: 7,
                                        borderRadius: '50%', background: dot.bg,
                                        flexShrink: 0, cursor: 'help',
                                      }}
                                    />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', background: 'var(--color-gray-100)', color: 'var(--color-gray-600)', padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>
                                      {d.reference}
                                    </span>
                                  </div>
                                  {d.fournisseur && (
                                    <div style={{ fontSize: '11px', color: 'var(--color-gray-400)', paddingLeft: 14 }}>{d.fournisseur}</div>
                                  )}
                                </div>

                                {/* Montant */}
                                <div style={{ textAlign: 'right' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '13px', color: 'var(--color-gray-900)' }}>
                                    {fmt(d.montant)}
                                  </span>
                                  <div style={{ fontSize: '10px', color: 'var(--color-gray-400)' }}>FCFA</div>
                                </div>

                                {/* Date */}
                                <div style={{ fontSize: '11px', color: 'var(--color-gray-500)', fontFamily: 'var(--font-mono)', textAlign: 'center' }}>
                                  {fmtDate(d.date_depense)}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* ── Total général ── */}
        {depenses.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', background: '#1E3A8A' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,.65)', textTransform: 'uppercase', letterSpacing: '.5px' }}>
              Total général
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900, fontSize: '16px', color: '#fff' }}>
              {fmt(total)} FCFA
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
