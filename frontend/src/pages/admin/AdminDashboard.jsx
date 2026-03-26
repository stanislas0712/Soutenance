import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBudgets, getBudgetAnnuels } from '../../api/budget'
import { getUtilisateurs } from '../../api/accounts'
import KpiCard from '../../components/KpiCard'
import { StatutBadge, AlerteBadge } from '../../components/StatusBadge'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts'
import {
  ArrowRight, CheckCircle2, Clock,
  Building2, TrendingUp, Wallet, ShieldAlert,
} from 'lucide-react'

const fmt     = n => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(parseFloat(n || 0))
const fmtFull = n => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', maximumFractionDigits: 0 }).format(n)

const STATUT_COLORS = {
  BROUILLON: '#D1D5DB', SOUMIS: '#8B5CF6',
  APPROUVE: '#22C55E', REJETE: '#F43F5E',
  CLOTURE: '#F59E0B', ARCHIVE: '#7C3AED',
}

function jaugeColor(t) {
  if (t > 75) return '#F43F5E'
  if (t > 50) return '#F59E0B'
  return '#22C55E'
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [budgets, setBudgets] = useState([])
  const [annuels, setAnnuels] = useState([])
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

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
  const ba = annuels[0]
  const enveloppeGlobale = parseFloat(ba?.montant_global || 0)
  const enveloppeAllouee = parseFloat(ba?.montant_alloue_depts || 0)
  const totalBudgets     = budgets.length
  const budgetsApprouves = budgets.filter(b => b.statut === 'APPROUVE').length
  const budgetsSoumis    = budgets.filter(b => b.statut === 'SOUMIS').length
  const budgetsRejetes   = budgets.filter(b => b.statut === 'REJETE').length
  const montantTotal     = budgets.reduce((s, b) => s + parseFloat(b.montant_global || 0), 0)
  const montantConsom    = budgets.reduce((s, b) => s + parseFloat(b.montant_consomme || 0), 0)
  const tauxGlobal       = montantTotal > 0 ? Math.round(montantConsom / montantTotal * 100) : 0

  /* ── Budgets en attente ── */
  const enAttente = budgets
    .filter(b => b.statut === 'SOUMIS')
    .sort((a, b) => new Date(a.date_soumission || 0) - new Date(b.date_soumission || 0))
    .slice(0, 5)

  /* ── Budgets en alerte ── */
  const enAlerte = budgets
    .filter(b => ['ROUGE', 'CRITIQUE'].includes(b.niveau_alerte) && b.statut === 'APPROUVE')
    .slice(0, 5)

  /* ── Répartition par statut ── */
  const statutData = Object.entries(
    budgets.reduce((acc, b) => { acc[b.statut] = (acc[b.statut] || 0) + 1; return acc }, {})
  ).map(([name, value]) => ({ name, value }))

  /* ── Consommation par département ── */
  const deptMap = {}
  budgets.filter(b => b.statut === 'APPROUVE').forEach(b => {
    const dept = b.departement_detail?.nom || b.departement_nom || 'Autre'
    const short = dept.replace(/^Ministère (de |du |des |de l')?/i, '').slice(0, 14)
    if (!deptMap[short]) deptMap[short] = { alloue: 0, consomme: 0 }
    deptMap[short].alloue   += parseFloat(b.montant_global || 0)
    deptMap[short].consomme += parseFloat(b.montant_consomme || 0)
  })
  const deptData = Object.entries(deptMap)
    .map(([name, v]) => ({ name, ...v, taux: v.alloue > 0 ? Math.round(v.consomme / v.alloue * 100) : 0 }))
    .sort((a, b) => b.alloue - a.alloue)

  const now = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  /* ── Évolution mensuelle (6 derniers mois) ── */
  const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  const evolutionData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - (5 - i))
    const m = d.getMonth(), y = d.getFullYear()
    const bMois = budgets.filter(b => {
      const c = new Date(b.date_creation)
      return c.getMonth() === m && c.getFullYear() === y
    })
    return {
      name: MOIS_LABELS[m],
      budgets: bMois.length,
      montant: Math.round(bMois.reduce((s, b) => s + parseFloat(b.montant_global || 0), 0) / 1e6),
      consomme: Math.round(bMois.reduce((s, b) => s + parseFloat(b.montant_consomme || 0), 0) / 1e6),
    }
  })

  return (
    <div>

      {/* ── Hero header ───────────────────────────────────────────────────── */}
      <div style={{
        background: 'linear-gradient(135deg, #0F2547 0%, #1E3A8A 55%, #2563EB 100%)',
        borderRadius: 18, padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(13,27,62,.3)',
      }}>
        {/* Decoration circles */}
        <div style={{ position:'absolute', top:-60, right:-40, width:220, height:220, borderRadius:'50%', background:'rgba(99,102,241,.12)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', bottom:-40, right:140, width:140, height:140, borderRadius:'50%', background:'rgba(99,102,241,.08)', pointerEvents:'none' }} />

        <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:20 }}>
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:'rgba(165,180,252,.7)', letterSpacing:'.8px', textTransform:'uppercase', marginBottom:6 }}>
              TABLEAU DE BORD ADMINISTRATEUR
            </div>
            <h1 style={{ fontWeight:800, fontSize:'1.6rem', color:'#fff', letterSpacing:'-.03em', marginBottom:6 }}>
              Gestion Budgétaire — Exercice {ba?.annee ?? new Date().getFullYear()}
            </h1>
            <p style={{ fontSize:13, color:'rgba(255,255,255,.5)', marginBottom:0 }}>{now}</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(255,255,255,.12)', borderRadius:9999, padding:'3px 12px', border:'1px solid rgba(255,255,255,.2)', marginTop:6 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#4ADE80' }} />
              <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,.85)', letterSpacing:'.4px' }}>ADMINISTRATEUR</span>
            </div>
          </div>

          {/* Mini stats inline */}
          <div style={{ display:'flex', gap:24, flexWrap:'wrap' }}>
            {[
              { label:'Budgets',    value: totalBudgets,    color:'#A5B4FC' },
              { label:'Approuvés',  value: budgetsApprouves, color:'#6EE7B7' },
              { label:'En attente', value: budgetsSoumis,    color:'#FDE68A' },
              { label:'Rejetés',    value: budgetsRejetes,   color:'#FCA5A5' },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:'1.6rem', color:s.color, lineHeight:1, letterSpacing:'-.04em' }}>{s.value}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,.4)', marginTop:3, letterSpacing:'.3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Barre de consommation globale */}
        <div style={{ position:'relative', marginTop:24, paddingTop:18, borderTop:'1px solid rgba(255,255,255,.08)' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
            <span style={{ fontSize:12, color:'rgba(255,255,255,.5)', fontWeight:600 }}>Taux de consommation global</span>
            <span style={{ fontSize:15, fontWeight:800, color: tauxGlobal >= 85 ? '#FCA5A5' : '#A5B4FC', fontFamily:'var(--font-mono)' }}>
              {tauxGlobal}%
            </span>
          </div>
          <div style={{ height:8, background:'rgba(255,255,255,.1)', borderRadius:99, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:99,
              width:`${Math.min(tauxGlobal,100)}%`,
              background:`linear-gradient(90deg, #6366F1, ${jaugeColor(tauxGlobal)})`,
              transition:'width .7s ease',
            }} />
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:11, color:'rgba(255,255,255,.35)', fontFamily:'var(--font-mono)' }}>
            <span>{fmtFull(montantConsom)} consommés</span>
            <span>sur {fmtFull(montantTotal)} alloués</span>
          </div>
        </div>
      </div>

      {/* ── KPI grid ─────────────────────────────────────────────────────── */}
      <div className="kpi-grid">
        <KpiCard
          icon="🏛️" label="Enveloppe annuelle"
          value={`${fmt(enveloppeGlobale)} F`}
          sub={`${fmt(enveloppeAllouee)} F alloués aux depts`}
          color="var(--color-primary-600)" bgColor="var(--color-primary-50)"
          sparklineData={evolutionData.map(d => d.montant)}
        />
        <KpiCard
          icon="✅" label="Budgets approuvés"
          value={budgetsApprouves}
          sub={`${Math.round(budgetsApprouves/Math.max(totalBudgets,1)*100)}% du total`}
          color="var(--color-success-600)" bgColor="var(--color-success-50)"
          onClick={() => navigate('/budgets')}
          sparklineData={evolutionData.map(d => d.budgets)}
        />
        <KpiCard
          icon="⏳" label="En attente validation"
          value={budgetsSoumis}
          sub="À traiter en priorité"
          color="var(--color-info-600)" bgColor="var(--color-info-50)"
          onClick={() => navigate('/budgets')}
        />
        <KpiCard
          icon="📊" label="Taux consommation"
          value={`${tauxGlobal} %`}
          sub={`${fmt(montantConsom)} FCFA utilisés`}
          color={jaugeColor(tauxGlobal)} bgColor="var(--color-warning-50)"
          sparklineData={evolutionData.map(d => d.consomme)}
        />
        <KpiCard
          icon="👥" label="Utilisateurs"
          value={users.length}
          sub={`${users.filter(u=>u.role==='GESTIONNAIRE').length} gestionnaires`}
          color="#7C3AED" bgColor="#F5F3FF"
          onClick={() => navigate('/utilisateurs')}
        />
      </div>

      {/* ── Charts ───────────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:22 }}>

        {/* Consommation par département */}
        <div className="card" style={{ padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <Building2 size={15} strokeWidth={2} color="var(--color-primary-600)" />
            <span style={{ fontWeight:700, fontSize:14, color:'var(--color-gray-900)' }}>Consommation par département</span>
          </div>
          {deptData.length === 0 ? (
            <div className="empty-state" style={{ padding:'30px 0' }}>
              <div className="empty-icon">📊</div>
              <div className="empty-title">Aucun budget approuvé</div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={deptData} barSize={14} barGap={3} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:10, fill:'var(--color-gray-400)' }} tickFormatter={v=>fmt(v/1e6)+'M'} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:'var(--color-gray-500)' }} axisLine={false} tickLine={false} width={70} />
                <Tooltip
                  formatter={v => fmtFull(v)}
                  contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid var(--color-gray-150)', boxShadow:'var(--shadow-md)' }}
                />
                <Legend iconSize={7} iconType="circle" formatter={v=><span style={{fontSize:11,color:'var(--color-gray-500)'}}>{v}</span>} />
                <Bar dataKey="alloue"   name="Alloué"   fill="#E0E7FF" radius={[0,3,3,0]} />
                <Bar dataKey="consomme" name="Consommé" fill="var(--color-primary-500)" radius={[0,3,3,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Répartition statuts */}
        <div className="card" style={{ padding:'20px 24px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
            <TrendingUp size={15} strokeWidth={2} color="var(--color-primary-600)" />
            <span style={{ fontWeight:700, fontSize:14, color:'var(--color-gray-900)' }}>Répartition par statut</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <PieChart>
              <Pie data={statutData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={44} paddingAngle={3}>
                {statutData.map(e => (
                  <Cell key={e.name} fill={STATUT_COLORS[e.name] || '#9CA3AF'} />
                ))}
              </Pie>
              <Tooltip formatter={(v,n)=>[v, n.charAt(0)+n.slice(1).toLowerCase()]} contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid var(--color-gray-150)', boxShadow:'var(--shadow-md)' }} />
              <Legend formatter={v=><span style={{fontSize:11,color:'var(--color-gray-500)'}}>{v.charAt(0)+v.slice(1).toLowerCase()}</span>} iconSize={7} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Évolution mensuelle ───────────────────────────────────────────── */}
      <div className="card" style={{ padding:'20px 24px', marginBottom:22 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:18 }}>
          <TrendingUp size={15} strokeWidth={2} color="var(--color-primary-600)" />
          <span style={{ fontWeight:700, fontSize:14, color:'var(--color-gray-900)' }}>Évolution budgétaire — 6 derniers mois</span>
          <span style={{ fontSize:11, color:'var(--color-gray-400)', marginLeft:4 }}>(montants en millions FCFA)</span>
        </div>
        {evolutionData.every(d => d.montant === 0 && d.budgets === 0) ? (
          <div className="empty-state" style={{ padding:'30px 0' }}>
            <div className="empty-icon">📈</div>
            <div className="empty-title">Aucune donnée pour cette période</div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={evolutionData} margin={{ top:4, right:16, left:0, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-gray-100)" />
              <XAxis dataKey="name" tick={{ fontSize:11, fill:'var(--color-gray-500)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:10, fill:'var(--color-gray-400)' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                formatter={(v, n) => [`${v} M FCFA`, n === 'montant' ? 'Alloué' : n === 'consomme' ? 'Consommé' : 'Budgets']}
                contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid var(--color-gray-150)', boxShadow:'var(--shadow-md)' }}
              />
              <Legend iconSize={7} iconType="circle" formatter={v => <span style={{ fontSize:11, color:'var(--color-gray-500)' }}>{v === 'montant' ? 'Alloué (M)' : v === 'consomme' ? 'Consommé (M)' : 'Nb budgets'}</span>} />
              <Line type="monotone" dataKey="montant"  stroke="#6366F1" strokeWidth={2} dot={{ r:3 }} activeDot={{ r:5 }} />
              <Line type="monotone" dataKey="consomme" stroke="#22C55E" strokeWidth={2} dot={{ r:3 }} activeDot={{ r:5 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ── Action panels ────────────────────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:18, marginBottom:22 }}>

        {/* Budgets en attente de validation */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{
            padding:'14px 20px', borderBottom:'1px solid var(--color-gray-100)',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'var(--color-gray-25)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'#F5F3FF', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Clock size={14} strokeWidth={2} color="#7C3AED" />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'var(--color-gray-900)' }}>En attente de validation</div>
                <div style={{ fontSize:11, color:'var(--color-gray-400)', marginTop:1 }}>{budgetsSoumis} budget{budgetsSoumis!==1?'s':''} soumis</div>
              </div>
            </div>
            <button onClick={() => navigate('/budgets')} className="btn btn-ghost btn-xs" style={{ gap:4 }}>
              Tout voir <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {enAttente.length === 0 ? (
              <div className="empty-state" style={{ padding:'28px 0' }}>
                <div style={{ fontSize:'1.8rem', marginBottom:8 }}>🎉</div>
                <div className="empty-title">Aucun budget en attente</div>
              </div>
            ) : enAttente.map(b => (
              <div
                key={b.id}
                onClick={() => navigate(`/budgets/${b.id}`)}
                style={{
                  padding:'10px 20px', borderBottom:'1px solid var(--color-gray-50)',
                  cursor:'pointer', transition:'background .1s',
                  display:'flex', justifyContent:'space-between', alignItems:'center', gap:12,
                }}
                onMouseEnter={e=>e.currentTarget.style.background='#FAFAFF'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}
              >
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--color-gray-900)', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {b.nom}
                  </div>
                  <div style={{ fontSize:11, color:'var(--color-gray-400)' }}>
                    <span className="code-tag" style={{ fontSize:10, marginRight:6 }}>{b.code}</span>
                    {b.departement_nom || b.departement_detail?.nom || '—'}
                  </div>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:12, fontWeight:700, color:'var(--color-gray-700)', flexShrink:0 }}>
                  {fmt(b.montant_global)} F
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets en alerte */}
        <div className="card" style={{ overflow:'hidden' }}>
          <div style={{
            padding:'14px 20px', borderBottom:'1px solid var(--color-gray-100)',
            display:'flex', justifyContent:'space-between', alignItems:'center',
            background:'var(--color-gray-25)',
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'#FFF1F2', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <ShieldAlert size={14} strokeWidth={2} color="#E11D48" />
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:13, color:'var(--color-gray-900)' }}>Budgets en alerte critique</div>
                <div style={{ fontSize:11, color:'var(--color-gray-400)', marginTop:1 }}>{enAlerte.length} budget{enAlerte.length!==1?'s':''} ROUGE / CRITIQUE</div>
              </div>
            </div>
            <button onClick={() => navigate('/budgets')} className="btn btn-ghost btn-xs" style={{ gap:4 }}>
              Tout voir <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {enAlerte.length === 0 ? (
              <div className="empty-state" style={{ padding:'28px 0' }}>
                <CheckCircle2 size={28} color="var(--color-success-500)" style={{ marginBottom:8, opacity:.6 }} />
                <div className="empty-title">Aucune alerte critique</div>
              </div>
            ) : enAlerte.map(b => {
              const taux = b.montant_global > 0
                ? Math.round(parseFloat(b.montant_consomme||0)/parseFloat(b.montant_global)*100) : 0
              return (
                <div
                  key={b.id}
                  onClick={() => navigate(`/budgets/${b.id}`)}
                  style={{
                    padding:'10px 20px', borderBottom:'1px solid var(--color-gray-50)',
                    cursor:'pointer', transition:'background .1s',
                    display:'flex', justifyContent:'space-between', alignItems:'center', gap:12,
                  }}
                  onMouseEnter={e=>e.currentTarget.style.background='#FFF1F2'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                >
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--color-gray-900)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:4 }}>
                      {b.nom}
                    </div>
                    <div style={{ height:4, background:'var(--color-gray-100)', borderRadius:99, overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${Math.min(taux,100)}%`, background:'#E11D48', borderRadius:99 }} />
                    </div>
                  </div>
                  <div style={{ flexShrink:0, textAlign:'right' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:800, color:'#E11D48' }}>{taux}%</div>
                    <AlerteBadge niveau={b.niveau_alerte} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Tableau budgets récents ───────────────────────────────────────── */}
      <div className="card" style={{ overflow:'hidden' }}>
        <div style={{
          padding:'16px 20px', borderBottom:'1px solid var(--color-gray-100)',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          background:'var(--color-gray-25)',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <Wallet size={15} strokeWidth={2} color="var(--color-primary-600)" />
            <span style={{ fontWeight:700, fontSize:14, color:'var(--color-gray-900)' }}>Tous les budgets</span>
            <span style={{ fontSize:12, color:'var(--color-gray-400)', fontFamily:'var(--font-mono)' }}>
              ({totalBudgets})
            </span>
          </div>
          <button onClick={() => navigate('/budgets')} className="btn btn-secondary btn-sm" style={{ gap:5 }}>
            Gérer les budgets <ArrowRight size={13} strokeWidth={2} />
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              {['Code', 'Budget', 'Département', 'Montant global', 'Consommation', 'Statut', 'Alerte'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...budgets]
              .sort((a,b)=>new Date(b.date_creation)-new Date(a.date_creation))
              .slice(0,10)
              .map(b => {
                const taux = b.montant_global > 0
                  ? Math.round(parseFloat(b.montant_consomme||0)/parseFloat(b.montant_global)*100) : 0
                return (
                  <tr key={b.id} className="clickable" onClick={() => navigate(`/budgets/${b.id}`)}>
                    <td><span className="code-tag">{b.code}</span></td>
                    <td>
                      <div style={{ fontWeight:600, fontSize:13, color:'var(--color-gray-900)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {b.nom}
                      </div>
                      <div style={{ fontSize:11, color:'var(--color-gray-400)', marginTop:1 }}>{b.gestionnaire_nom || '—'}</div>
                    </td>
                    <td style={{ color:'var(--color-gray-500)', fontSize:13 }}>
                      {b.departement_detail?.nom || b.departement_nom || <span style={{color:'var(--color-gray-300)'}}>—</span>}
                    </td>
                    <td style={{ fontFamily:'var(--font-mono)', fontWeight:600, fontSize:13 }}>
                      {fmt(b.montant_global)} F
                    </td>
                    <td style={{ minWidth:130 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ flex:1, height:5, background:'var(--color-gray-100)', borderRadius:99, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${Math.min(taux,100)}%`, background:jaugeColor(taux), borderRadius:99 }} />
                        </div>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, color:jaugeColor(taux), minWidth:34, textAlign:'right' }}>
                          {taux}%
                        </span>
                      </div>
                    </td>
                    <td><StatutBadge statut={b.statut} /></td>
                    <td><AlerteBadge niveau={b.niveau_alerte} /></td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
