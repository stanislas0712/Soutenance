import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAnomalies,
  getPredictions,
  getRapports,
  genererRapport,
  traiterAnomalie,
} from '../../api/ia'
import { Sparkles, AlertTriangle, TrendingUp, FileText, Search, Plus, CheckCircle2, XCircle, ExternalLink } from 'lucide-react'

const NIVEAU_CFG = {
  FAIBLE:   { color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)',  dot: 'var(--color-primary-500)'  },
  MOYEN:    { color: 'var(--color-warning-700)', bg: 'var(--color-warning-50)',  dot: 'var(--color-warning-500)'  },
  ELEVE:    { color: '#C2410C',                  bg: '#fff7ed',                  dot: '#F97316'                   },
  CRITIQUE: { color: 'var(--color-danger-700)',  bg: 'var(--color-danger-50)',   dot: 'var(--color-danger-500)'   },
}

export default function IADashboard() {
  const [onglet,  setOnglet]  = useState('anomalies')
  const [genOpen, setGenOpen] = useState(false)
  const qc = useQueryClient()

  const { data: anomaliesData }   = useQuery({ queryKey: ['ia-anomalies'],   queryFn: () => getAnomalies({ statut: 'DETECTEE' }).then(r => r.data),   retry: false })
  const { data: predictionsData } = useQuery({ queryKey: ['ia-predictions'], queryFn: () => getPredictions().then(r => r.data.data),                    retry: false })
  const { data: rapportsData }    = useQuery({ queryKey: ['ia-rapports'],    queryFn: () => getRapports().then(r => r.data.data),                       retry: false })

  const anomalies  = Array.isArray(anomaliesData?.data) ? anomaliesData.data : (anomaliesData?.data?.results || [])
  const predictions = Array.isArray(predictionsData) ? predictionsData : []
  const rapports   = Array.isArray(rapportsData) ? rapportsData : (rapportsData?.results || [])

  const critiques     = anomalies.filter(a => ['ELEVE', 'CRITIQUE'].includes(a.niveau))
  const risquesEleves = predictions.filter(p => p.probabilite_depassement >= 0.5)

  const ONGLETS = [
    { key: 'anomalies',   label: 'Anomalies',          count: anomalies.length  },
    { key: 'predictions', label: 'Prédictions',         count: predictions.length },
    { key: 'rapports',    label: 'Rapports narratifs',  count: rapports.length   },
  ]

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-info-500))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={20} strokeWidth={2} style={{ color: '#fff' }} />
          </div>
          <div>
            <h1 className="page-title">Intelligence Artificielle</h1>
            <p className="page-subtitle">Analyses, anomalies, prédictions et rapports générés par Claude IA</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 24 }}>
        {[
          { label: 'ANOMALIES CRITIQUES', value: critiques.length,     icon: <AlertTriangle size={20} strokeWidth={1.8} />, color: 'var(--color-danger-600)', bg: 'var(--color-danger-50)'  },
          { label: 'PRÉDICTIONS À RISQUE',value: risquesEleves.length, icon: <TrendingUp size={20} strokeWidth={1.8} />,    color: '#C2410C',                  bg: '#fff7ed'                 },
          { label: 'RAPPORTS GÉNÉRÉS',    value: rapports.length,      icon: <FileText size={20} strokeWidth={1.8} />,      color: 'var(--color-primary-600)', bg: 'var(--color-primary-50)' },
          { label: 'TOTAL ANOMALIES',     value: anomalies.length,     icon: <Search size={20} strokeWidth={1.8} />,        color: 'var(--color-warning-700)', bg: 'var(--color-warning-50)' },
        ].map(({ label, value, icon, color, bg }) => (
          <div key={label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-gray-500)', letterSpacing: '.5px', marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.5rem', color, lineHeight: 1 }}>{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Onglets */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 20, borderBottom: '1px solid var(--color-gray-200)', paddingBottom: 0 }}>
        {ONGLETS.map(t => (
          <button
            key={t.key}
            onClick={() => setOnglet(t.key)}
            style={{
              padding: '9px 18px', border: 'none', background: 'transparent',
              borderBottom: onglet === t.key ? '2px solid var(--color-primary-600)' : '2px solid transparent',
              color: onglet === t.key ? 'var(--color-primary-600)' : 'var(--color-gray-500)',
              fontWeight: onglet === t.key ? 700 : 500, fontSize: '13px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'color .15s',
            }}
          >
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: onglet === t.key ? 'var(--color-primary-600)' : 'var(--color-gray-200)',
                color: onglet === t.key ? '#fff' : 'var(--color-gray-600)',
                fontSize: '10px', padding: '1px 7px', borderRadius: 10, fontWeight: 700,
              }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {onglet === 'anomalies'   && <AnomaliesTab anomalies={anomalies} />}
      {onglet === 'predictions' && <PredictionsTab predictions={predictions} />}
      {onglet === 'rapports'    && <RapportsTab rapports={rapports} onGenerer={() => setGenOpen(true)} />}

      {genOpen && <GenererRapportModal onClose={() => setGenOpen(false)} />}
    </div>
  )
}

/* ── Onglet Anomalies ─────────────────────────────────────────────────────── */
function AnomaliesTab({ anomalies }) {
  const qc = useQueryClient()
  const { mutate: traiter } = useMutation({
    mutationFn: ({ id, statut }) => traiterAnomalie(id, statut),
    onSuccess: () => qc.invalidateQueries(['ia-anomalies']),
  })

  if (!anomalies.length) return (
    <div className="empty-state">
      <div className="empty-icon">
        <CheckCircle2 size={28} strokeWidth={1.5} style={{ color: 'var(--color-success-400)' }} />
      </div>
      <p className="empty-title">Aucune anomalie détectée</p>
      <p className="empty-body">Le système surveille les budgets en continu.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {anomalies.map(a => {
        const cfg = NIVEAU_CFG[a.niveau] || NIVEAU_CFG.FAIBLE
        return (
          <div
            key={a.id}
            className="card"
            style={{
              display: 'flex', gap: 16, alignItems: 'flex-start',
              borderLeft: `4px solid ${cfg.dot}`,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: '13px', color: cfg.color }}>
                  {a.type_anomalie}
                </span>
                <span style={{
                  fontSize: '10px', background: cfg.bg, color: cfg.color,
                  padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                }}>
                  {a.niveau}
                </span>
                {a.budget_reference && (
                  <span className="code-tag">{a.budget_reference}</span>
                )}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--color-gray-600)', lineHeight: 1.6, margin: 0, marginBottom: 6 }}>
                {a.description}
              </p>
              <div style={{ fontSize: '11px', color: 'var(--color-gray-400)' }}>
                Confiance: <strong style={{ fontFamily: 'var(--font-mono)' }}>{Math.round(a.score_confiance * 100)}%</strong>
                &nbsp;·&nbsp;{new Date(a.created_at).toLocaleDateString('fr-FR')}
              </div>
            </div>
            {a.statut === 'DETECTEE' && (
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button
                  onClick={() => traiter({ id: a.id, statut: 'CONFIRMEE' })}
                  className="btn btn-danger btn-sm"
                  style={{ gap: 5 }}
                >
                  <AlertTriangle size={12} strokeWidth={2} /> Confirmer
                </button>
                <button
                  onClick={() => traiter({ id: a.id, statut: 'FAUX_POSITIF' })}
                  className="btn btn-secondary btn-sm"
                  style={{ gap: 5 }}
                >
                  <XCircle size={12} strokeWidth={2} /> Faux positif
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Onglet Prédictions ───────────────────────────────────────────────────── */
function PredictionsTab({ predictions }) {
  if (!predictions.length) return (
    <div className="empty-state">
      <div className="empty-icon">
        <TrendingUp size={28} strokeWidth={1.5} style={{ color: 'var(--color-gray-400)' }} />
      </div>
      <p className="empty-title">Aucune prédiction active</p>
      <p className="empty-body">Déclenchez des prédictions depuis les détails d'un budget.</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {predictions.map(p => {
        const pct   = Math.round(p.probabilite_depassement * 100)
        const color = pct >= 75 ? 'var(--color-danger-600)' : pct >= 50 ? '#C2410C' : pct >= 25 ? 'var(--color-warning-600)' : 'var(--color-success-600)'
        return (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-800)', marginBottom: 4 }}>
                  {p.budget_reference}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-500)' }}>
                  Montant prévu : <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{Number(p.montant_prevu_final).toLocaleString('fr-FR')} FCFA</span>
                  &nbsp;·&nbsp;Écart :
                  <span style={{ color, fontWeight: 700, fontFamily: 'var(--font-mono)', marginLeft: 4 }}>
                    {Number(p.ecart_prevu) >= 0 ? '+' : ''}{Number(p.ecart_prevu).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.4rem', color, lineHeight: 1 }}>
                  {pct}%
                </div>
                <div style={{ fontSize: '10px', color, fontWeight: 700, marginTop: 2 }}>risque</div>
              </div>
            </div>
            <div className="exec-bar">
              <div
                className="exec-bar-fill"
                style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${pct >= 50 ? 'var(--color-warning-500)' : 'var(--color-success-500)'}, ${color})` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Onglet Rapports ──────────────────────────────────────────────────────── */
function RapportsTab({ rapports, onGenerer }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
        <button onClick={onGenerer} className="btn btn-primary btn-md" style={{ gap: 7 }}>
          <Plus size={16} strokeWidth={2.5} /> Générer un rapport
        </button>
      </div>
      {!rapports.length ? (
        <div className="empty-state">
          <div className="empty-icon">
            <FileText size={28} strokeWidth={1.5} style={{ color: 'var(--color-gray-400)' }} />
          </div>
          <p className="empty-title">Aucun rapport généré</p>
          <p className="empty-body">Cliquez sur "Générer un rapport" pour commencer.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rapports.map(r => (
            <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-gray-800)', marginBottom: 5 }}>
                  {r.titre}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-gray-400)' }}>
                  <span className="code-tag" style={{ marginRight: 8 }}>{r.type_rapport}</span>
                  {new Date(r.created_at).toLocaleDateString('fr-FR')}
                  &nbsp;·&nbsp;{r.tokens_utilises?.toLocaleString()} tokens
                </div>
              </div>
              <a
                href={`/ia/rapports/${r.id}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: '12px', color: 'var(--color-primary-600)',
                  fontWeight: 600, textDecoration: 'none', flexShrink: 0,
                }}
              >
                Voir <ExternalLink size={12} strokeWidth={2} />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Modal génération rapport ─────────────────────────────────────────────── */
function GenererRapportModal({ onClose }) {
  const [type, setType] = useState('MENSUEL')
  const qc = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: () => genererRapport({ type_rapport: type }),
    onSuccess: () => { qc.invalidateQueries(['ia-rapports']); onClose() },
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'linear-gradient(135deg, var(--color-primary-600), var(--color-info-500))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Sparkles size={16} strokeWidth={2} style={{ color: '#fff' }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-gray-900)' }}>
              Générer un rapport narratif IA
            </h3>
          </div>
        </div>
        <div className="modal-body">
          <label className="form-label">Type de rapport</label>
          <select
            className="form-select"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="MENSUEL">Rapport mensuel</option>
            <option value="TRIMESTRIEL">Rapport trimestriel</option>
            <option value="ANNUEL">Rapport annuel</option>
            <option value="AD_HOC">Rapport ad-hoc</option>
          </select>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary btn-md">Annuler</button>
          <button
            onClick={() => mutate()}
            disabled={isPending}
            className="btn btn-primary btn-md"
            style={{ gap: 7, opacity: isPending ? .7 : 1 }}
          >
            {isPending ? (
              <><span className="spinner-sm" /> Génération…</>
            ) : (
              <><Sparkles size={14} strokeWidth={2} /> Générer</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
