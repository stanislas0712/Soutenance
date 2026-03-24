import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getBudgets } from '../../api/budget'
import KpiCard from '../../components/KpiCard'
import { Search, Clock, CheckCircle2, XCircle, LayoutList, ArrowRight } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)

export default function ComptableDashboard() {
  const { user }   = useAuth()
  const navigate   = useNavigate()
  const [aValider, setAValider] = useState([])
  const [tous,     setTous]     = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')

  useEffect(() => {
    Promise.all([getBudgets({ statut: 'SOUMIS' }), getBudgets()])
      .then(([v, t]) => {
        setAValider(v.data.results ?? v.data)
        setTous(t.data.results ?? t.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  const approuves = tous.filter(b => b.statut === 'APPROUVE').length
  const rejetes   = tous.filter(b => b.statut === 'REJETE').length

  const q    = search.trim().toLowerCase()
  const rows = q
    ? aValider.filter(b =>
        b.nom?.toLowerCase().includes(q) ||
        b.code?.toLowerCase().includes(q) ||
        b.gestionnaire_nom?.toLowerCase().includes(q) ||
        b.departement_nom?.toLowerCase().includes(q)
      )
    : aValider

  return (
    <div>
      {/* Hero banner */}
      <div
        className="rounded-[var(--radius-lg)] px-8 py-7 mb-7 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0F2547 0%, #1E3A8A 60%, #1D4ED8 100%)' }}
      >
        <div className="absolute rounded-full pointer-events-none" style={{ top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,.05)' }} />
        <div className="absolute rounded-full pointer-events-none" style={{ bottom: -30, right: 80, width: 120, height: 120, background: 'rgba(255,255,255,.04)' }} />
        <div className="relative">
          <div className="text-[12px] opacity-70 mb-[6px] font-medium tracking-[.3px]">
            ESPACE COMPTABLE
          </div>
          <h1 className="font-extrabold text-[1.6rem] tracking-[-0.3px] mb-2">
            Bonjour, {user?.prenom} {user?.nom} 👋
          </h1>
          <p className={`opacity-80 text-[14px]${aValider.length > 0 ? ' mb-5' : ''}`}>
            {aValider.length > 0
              ? `Vous avez ${aValider.length} budget${aValider.length > 1 ? 's' : ''} en attente de validation`
              : 'Aucun budget en attente — tout est à jour ✓'
            }
          </p>
          {aValider.length > 0 && (
            <button
              onClick={() => navigate('/validation')}
              className="inline-flex items-center gap-2 px-5 py-[9px] rounded-[9px] text-white font-bold text-[13px] cursor-pointer"
              style={{ border: '1.5px solid rgba(255,255,255,.35)', background: 'rgba(255,255,255,.12)' }}
            >
              Voir les budgets à valider
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid mb-[28px]">
        <KpiCard
          icon={<Clock size={20} strokeWidth={1.8} />}
          label="EN ATTENTE"
          value={aValider.length}
          color="var(--color-primary-600)"
          bgColor="var(--color-primary-50)"
          sub="À valider maintenant"
          onClick={aValider.length > 0 ? () => navigate('/validation') : undefined}
        />
        <KpiCard
          icon={<CheckCircle2 size={20} strokeWidth={1.8} />}
          label="APPROUVÉS"
          value={approuves}
          color="var(--color-success-600)"
          bgColor="var(--color-success-50)"
        />
        <KpiCard
          icon={<XCircle size={20} strokeWidth={1.8} />}
          label="REJETÉS"
          value={rejetes}
          color="var(--color-danger-600)"
          bgColor="var(--color-danger-50)"
        />
        <KpiCard
          icon={<LayoutList size={20} strokeWidth={1.8} />}
          label="TOTAL BUDGETS"
          value={tous.length}
          color="var(--color-info-600)"
          bgColor="var(--color-info-50)"
        />
      </div>

      {/* Budgets en attente */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-[18px] border-b border-b-gray-100">
          <div className={`flex justify-between items-center${aValider.length > 0 ? ' mb-[14px]' : ''}`}>
            <div className="flex items-center gap-[10px]">
              <h3 className="font-display font-bold text-[15px] text-gray-900">
                Budgets en attente de validation
              </h3>
              {aValider.length > 0 && (
                <span className="bg-primary-50 text-primary-700 px-[9px] py-[2px] rounded-[20px] text-[12px] font-bold">
                  {aValider.length}
                </span>
              )}
            </div>
            {aValider.length > 0 && (
              <button
                onClick={() => navigate('/validation')}
                className="inline-flex items-center gap-[5px] bg-none border-none text-primary-600 font-semibold text-[13px] cursor-pointer"
              >
                Voir tout <ArrowRight size={13} strokeWidth={2.5} />
              </button>
            )}
          </div>
          {aValider.length > 0 && (
            <div className="search-wrapper">
              <Search size={14} strokeWidth={2} className="search-icon" />
              <input
                className="search-input"
                type="text"
                placeholder="Rechercher par nom, code, gestionnaire, département…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <CheckCircle2 size={28} strokeWidth={1.5} className="text-success-400" />
            </div>
            <p className="empty-title">
              {q ? `Aucun résultat pour « ${search} »` : 'Aucun budget en attente'}
            </p>
            <p className="empty-body">
              {q ? 'Essayez un autre terme de recherche.' : 'Tous les budgets soumis ont été traités.'}
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {['Code', 'Nom', 'Département', 'Gestionnaire', 'Montant global', 'Date soumission', 'Action'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(b => (
                <tr
                  key={b.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/validation/${b.id}`)}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-50)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td><span className="code-tag">{b.code}</span></td>
                  <td className="font-medium">{b.nom}</td>
                  <td className="text-gray-500">{b.departement_nom || '—'}</td>
                  <td className="text-gray-500">{b.gestionnaire_nom || '—'}</td>
                  <td className="font-mono font-semibold">
                    {fmt(b.montant_global)} <span className="text-[10px] text-gray-400">FCFA</span>
                  </td>
                  <td className="text-gray-400 text-[12px]">
                    {b.date_soumission ? new Date(b.date_soumission).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => navigate(`/validation/${b.id}`)}
                      className="btn btn-primary btn-sm gap-[5px]"
                    >
                      Examiner <ArrowRight size={12} strokeWidth={2.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
