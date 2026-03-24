import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getBudgets, deleteBudget } from '../../api/budget'
import { getDepartements } from '../../api/accounts'
import { StatutBadge, AlerteBadge } from '../../components/StatusBadge'
import { Search, Plus, Building2, ArrowLeft, Wallet, Trash2 } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

const jaugeColor = (taux) => {
  if (taux >= 95) return '#EF4444'
  if (taux >= 80) return '#F59E0B'
  if (taux >= 50) return '#22C55E'
  return '#3B82F6'
}

export default function MesBudgets() {
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const deptId         = searchParams.get('dept')

  const [budgets, setBudgets] = useState([])
  const [depts,   setDepts]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([getBudgets(), getDepartements()])
      .then(([b, d]) => {
        setBudgets(b.data.results ?? b.data)
        setDepts(d.data.results ?? d.data)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Supprimer ce budget ?')) return
    await deleteBudget(id).catch(err => alert(err.response?.data?.detail))
    load()
  }

  const deptCourant = deptId ? depts.find(d => String(d.id) === deptId) : null

  const filtered = budgets.filter(b => {
    const matchDept   = !deptId || String(b.departement) === deptId || String(b.departement_detail?.id) === deptId
    const matchSearch = !search || b.code?.toLowerCase().includes(search.toLowerCase()) || b.nom?.toLowerCase().includes(search.toLowerCase())
    return matchDept && matchSearch
  })

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <div>
          {deptCourant ? (
            <>
              <button
                onClick={() => navigate('/mes-budgets')}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'none', border: 'none',
                  color: 'var(--color-primary-600)', fontSize: '13px',
                  fontWeight: 500, cursor: 'pointer', padding: 0, marginBottom: 8,
                }}
              >
                <ArrowLeft size={14} strokeWidth={2} />
                Tous les budgets
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: 'var(--color-primary-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Building2 size={18} strokeWidth={2} style={{ color: 'var(--color-primary-600)' }} />
                </div>
                <div>
                  <h1 className="page-title">{deptCourant.nom}</h1>
                  <p className="page-subtitle">{filtered.length} budget{filtered.length !== 1 ? 's' : ''} dans ce département</p>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="page-title">Mes budgets</h1>
              <p className="page-subtitle">{budgets.length} budget{budgets.length !== 1 ? 's' : ''} au total</p>
            </>
          )}
        </div>
        <button
          onClick={() => navigate('/creer-budget')}
          className="btn btn-primary btn-md"
          style={{ gap: 7 }}
        >
          <Plus size={16} strokeWidth={2.5} />
          Créer un budget
        </button>
      </div>

      {/* Search */}
      <div className="filter-bar" style={{ marginBottom: 20 }}>
        <div className="search-wrapper" style={{ maxWidth: 420 }}>
          <Search size={15} strokeWidth={2} className="search-icon" />
          <input
            className="search-input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un budget…"
          />
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Wallet size={28} strokeWidth={1.5} style={{ color: 'var(--color-gray-400)' }} />
          </div>
          <p className="empty-title">Aucun budget</p>
          <p className="empty-body">
            {search ? 'Aucun résultat pour votre recherche.' : 'Créez votre premier budget pour commencer.'}
          </p>
          {!search && (
            <button
              onClick={() => navigate('/creer-budget')}
              className="btn btn-primary btn-md"
              style={{ marginTop: 16, gap: 7 }}
            >
              <Plus size={16} strokeWidth={2.5} />
              Créer un budget
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {filtered.map(b => {
            const taux    = parseFloat(b.taux_consommation || 0)
            const color   = jaugeColor(taux)
            const editable = ['BROUILLON', 'REJETE'].includes(b.statut)
            return (
              <div
                key={b.id}
                className="card card-hover"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/mes-budgets/${b.id}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span className="code-tag">{b.code}</span>
                      <StatutBadge statut={b.statut} />
                      <AlerteBadge niveau={b.niveau_alerte} />
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700,
                      fontSize: '15px', color: 'var(--color-gray-900)', marginBottom: 3,
                    }}>
                      {b.nom}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                      {b.departement_nom} · {b.date_debut} → {b.date_fin}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontWeight: 700,
                      fontSize: '16px', color: 'var(--color-gray-900)',
                    }}>
                      {fmt(b.montant_global)}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--color-gray-400)', marginTop: 1 }}>FCFA global</div>
                  </div>
                </div>

                <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div className="exec-bar" style={{ flex: 1 }}>
                    <div
                      className="exec-bar-fill"
                      style={{
                        width: `${Math.min(taux, 100)}%`,
                        background: `linear-gradient(90deg, ${jaugeColor(Math.max(0, taux - 20))}, ${color})`,
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    fontFamily: 'var(--font-mono)',
                    color: taux >= 95 ? 'var(--color-danger-600)' : taux >= 80 ? 'var(--color-warning-600)' : 'var(--color-gray-600)',
                    whiteSpace: 'nowrap',
                  }}>
                    {taux}% consommé
                  </span>
                  {editable && (
                    <button
                      onClick={e => handleDelete(b.id, e)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--color-gray-300)', padding: '4px',
                        display: 'flex', alignItems: 'center', borderRadius: 6,
                        transition: 'color .15s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger-500)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--color-gray-300)'}
                      title="Supprimer"
                    >
                      <Trash2 size={14} strokeWidth={2} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
