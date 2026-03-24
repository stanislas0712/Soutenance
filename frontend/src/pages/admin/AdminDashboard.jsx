import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBudgets, getBudgetAnnuels } from '../../api/budget'
import { getUtilisateurs } from '../../api/accounts'
import KpiCard from '../../components/KpiCard'
import { StatutBadge, AlerteBadge } from '../../components/StatusBadge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { ArrowRight, TrendingUp } from 'lucide-react'

const fmt     = n => new Intl.NumberFormat('fr-FR', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
const fmtFull = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)

const STATUT_COLORS = {
  BROUILLON: '#D1D5DB', SOUMIS:  '#8B5CF6',
  APPROUVE:  '#22C55E', REJETE:  '#EF4444',
  CLOTURE:   '#F59E0B', ARCHIVE: '#7C3AED',
}

/* Couleur jauge selon taux */
function jaugeColor(taux) {
  if (taux >= 100) return '#DC2626'
  if (taux >= 95)  return '#EF4444'
  if (taux >= 80)  return '#F59E0B'
  if (taux >= 50)  return '#22C55E'
  return '#3B82F6'
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [budgets,      setBudgets]      = useState([])
  const [annuels,      setAnnuels]      = useState([])
  const [users,        setUsers]        = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [filtreStatut, setFiltreStatut] = useState('')

  useEffect(() => {
    Promise.all([getBudgets(), getBudgetAnnuels(), getUtilisateurs()])
      .then(([b, a, u]) => {
        setBudgets(b.data.results ?? b.data)
        setAnnuels(a.data.results ?? a.data)
        setUsers(u.data.results ?? u.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="page-loader">
      <div className="spinner" />
      <span>Chargement du tableau de bord…</span>
    </div>
  )

  /* ── KPIs ── */
  const totalBudgets     = budgets.length
  const budgetsApprouves = budgets.filter(b => b.statut === 'APPROUVE').length
  const budgetsSoumis    = budgets.filter(b => b.statut === 'SOUMIS').length
  const budgetsRejetes   = budgets.filter(b => b.statut === 'REJETE').length
  const montantTotal     = budgets.reduce((s, b) => s + parseFloat(b.montant_global || 0), 0)
  const montantConsom    = budgets.reduce((s, b) => s + parseFloat(b.montant_consomme || 0), 0)
  const tauxGlobal       = montantTotal > 0 ? Math.round(montantConsom / montantTotal * 100) : 0

  /* ── Charts ── */
  const statutData = Object.entries(
    budgets.reduce((acc, b) => { acc[b.statut] = (acc[b.statut] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  const envData = annuels.slice(0, 6).map(a => ({
    name: String(a.annee),
    alloue:   parseFloat(a.montant_alloue_depts ?? 0),
    consomme: parseFloat(a.montant_global ?? 0) - parseFloat(a.montant_disponible_global ?? 0),
  }))

  /* ── Table ── */
  const q = search.trim().toLowerCase()
  const recents = [...budgets]
    .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
    .filter(b =>
      (!filtreStatut || b.statut === filtreStatut) &&
      (!q || b.nom?.toLowerCase().includes(q) || b.code?.toLowerCase().includes(q) ||
        b.departement_detail?.nom?.toLowerCase().includes(q))
    )
    .slice(0, 20)

  return (
    <div>
      {/* Page header */}
      <div className="page-header">
        <h1 className="page-title">Tableau de bord</h1>
        <p className="page-subtitle">Vue globale de la gestion budgétaire — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* KPI grid */}
      <div className="kpi-grid">
        <KpiCard icon="💰" label="Budget total alloué"   value={fmt(montantTotal)}    sub="Toutes enveloppes"        color="var(--color-primary-600)" bgColor="var(--color-primary-50)" />
        <KpiCard icon="📤" label="Montant consommé"      value={fmt(montantConsom)}   sub={`${tauxGlobal}% du total`} color="var(--color-warning-600)" bgColor="var(--color-warning-50)" />
        <KpiCard icon="✅" label="Budgets approuvés"     value={budgetsApprouves}     sub={`sur ${totalBudgets} total`} color="var(--color-success-600)" bgColor="var(--color-success-50)" />
        <KpiCard icon="⏳" label="En attente validation" value={budgetsSoumis}        sub="À traiter"                 color="var(--color-info-600)"    bgColor="var(--color-info-50)" />
        <KpiCard icon="👥" label="Utilisateurs actifs"  value={users.length}         sub="Comptes configurés"        color="#7C3AED"                  bgColor="#F5F3FF" />
      </div>

      {/* Barre de consommation globale */}
      <div className="card p-[20px_24px] mb-6">
        <div className="flex items-center justify-between mb-[14px]">
          <div>
            <div className="font-bold text-[14px] text-[#1F2937] mb-[2px]">
              Taux de consommation global
            </div>
            <div className="font-mono text-[13px] text-[#6B7280]">
              {fmtFull(montantConsom)} / {fmtFull(montantTotal)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} color={jaugeColor(tauxGlobal)} />
            <span className="font-mono font-extrabold text-[22px] tracking-[-0.03em]" style={{ color: jaugeColor(tauxGlobal) }}>
              {tauxGlobal}%
            </span>
          </div>
        </div>
        <div className="exec-bar h-[10px]">
          <div
            className="exec-bar-fill"
            style={{
              width: `${Math.min(tauxGlobal, 100)}%`,
              background: `linear-gradient(90deg, ${jaugeColor(Math.max(0, tauxGlobal - 30))}, ${jaugeColor(tauxGlobal)})`,
            }}
          />
        </div>
        {/* Légende mini */}
        <div className="flex gap-4 mt-[10px] flex-wrap">
          {[
            { label: `${budgetsApprouves} approuvés`, color: '#22C55E' },
            { label: `${budgetsSoumis} en attente`, color: '#8B5CF6' },
            { label: `${budgetsRejetes} rejetés`, color: '#EF4444' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-[6px] text-[12px] text-[#6B7280]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-[18px] mb-6">

        {/* Répartition statuts */}
        <div className="card p-[20px_24px]">
          <div className="font-bold text-[14px] text-[#1F2937] mb-[18px]">
            Répartition par statut
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statutData} dataKey="value" nameKey="name"
                cx="50%" cy="50%" outerRadius={78} innerRadius={40}
                paddingAngle={3}
              >
                {statutData.map(entry => (
                  <Cell key={entry.name} fill={STATUT_COLORS[entry.name] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n) => [v, n.charAt(0) + n.slice(1).toLowerCase()]}
                contentStyle={{ fontSize: '12px', borderRadius: 8, border: '1px solid var(--color-gray-200)', boxShadow: 'var(--shadow-md)' }}
              />
              <Legend
                formatter={v => <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>{v.charAt(0) + v.slice(1).toLowerCase()}</span>}
                iconSize={8}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Budget par exercice */}
        <div className="card p-[20px_24px]">
          <div className="font-bold text-[14px] text-[#1F2937] mb-[18px]">
            Budgets par exercice
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={envData} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-gray-500)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }} tickFormatter={v => fmt(v)} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={v => fmtFull(v)}
                contentStyle={{ fontSize: '12px', borderRadius: 8, border: '1px solid var(--color-gray-200)', boxShadow: 'var(--shadow-md)' }}
              />
              <Legend iconSize={8} iconType="circle" formatter={v => <span style={{ fontSize: '12px', color: 'var(--color-gray-600)' }}>{v}</span>} />
              <Bar dataKey="alloue"   name="Alloué"   fill="var(--color-primary-100)" radius={[4,4,0,0]} />
              <Bar dataKey="consomme" name="Consommé" fill="var(--color-primary-500)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tableau budgets récents */}
      <div className="card overflow-hidden">
        {/* Header table */}
        <div className="px-6 py-[18px] border-b border-[#F3F4F6]">
          <div className="flex justify-between items-center mb-[14px]">
            <div>
              <div className="font-bold text-[14px] text-[#1F2937]">Budgets récents</div>
              <div className="text-[12px] text-[#9CA3AF] mt-[2px]">{recents.length} résultat{recents.length !== 1 ? 's' : ''}</div>
            </div>
            <button
              onClick={() => navigate('/budgets')}
              className="btn btn-ghost btn-sm gap-[5px]"
            >
              Voir tout <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>

          {/* Filtres */}
          <div className="flex gap-[10px] items-center">
            <div className="search-wrapper max-w-[320px]">
              <svg className="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="search"
                className="search-input"
                placeholder="Rechercher par nom, code, département…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                aria-label="Rechercher un budget"
              />
            </div>
            <select
              value={filtreStatut}
              onChange={e => setFiltreStatut(e.target.value)}
              className="form-select w-auto h-[38px] text-[13px] min-w-[160px]"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous les statuts</option>
              <option value="BROUILLON">Brouillon</option>
              <option value="SOUMIS">Soumis</option>
              <option value="APPROUVE">Approuvé</option>
              <option value="REJETE">Rejeté</option>
              <option value="CLOTURE">Clôturé</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <table className="data-table" role="table" aria-label="Liste des budgets">
          <thead>
            <tr>
              {['Code', 'Nom', 'Département', 'Montant global', 'Taux', 'Statut', 'Alerte'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recents.map(b => {
              const taux = b.montant_global > 0
                ? Math.round(parseFloat(b.montant_consomme || 0) / parseFloat(b.montant_global) * 100)
                : 0
              return (
                <tr
                  key={b.id}
                  className="clickable"
                  onClick={() => navigate(`/budgets/${b.id}`)}
                  aria-label={`Budget ${b.nom}`}
                >
                  <td>
                    <span className="code-tag">{b.code}</span>
                  </td>
                  <td className="font-medium text-[#111827] max-w-[200px]">
                    <div className="truncate">{b.nom}</div>
                  </td>
                  <td className="text-[#6B7280]">
                    {b.departement_detail?.nom || <span className="text-[#D1D5DB]">—</span>}
                  </td>
                  <td className="font-mono font-semibold text-[#1F2937]">
                    {fmt(b.montant_global)} FCFA
                  </td>
                  <td className="min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="exec-bar flex-1 h-[5px]">
                        <div className="exec-bar-fill" style={{ width: `${Math.min(taux, 100)}%`, background: jaugeColor(taux) }} />
                      </div>
                      <span className="font-mono text-[12px] font-bold min-w-[34px]" style={{ color: jaugeColor(taux) }}>
                        {taux}%
                      </span>
                    </div>
                  </td>
                  <td><StatutBadge statut={b.statut} /></td>
                  <td><AlerteBadge niveau={b.niveau_alerte} /></td>
                </tr>
              )
            })}
            {recents.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <div className="empty-title">
                      {q || filtreStatut ? 'Aucun résultat pour cette recherche' : 'Aucun budget'}
                    </div>
                    <div className="empty-body">
                      {!q && !filtreStatut && 'Créez votre premier budget pour commencer.'}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
