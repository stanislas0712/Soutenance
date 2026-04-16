import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getRapport } from '../../api/ia'
import { printRapportIA } from '../../utils/export'
import { ArrowLeft, Download, FileText, Sparkles } from 'lucide-react'

const TYPE_LABELS = {
  MENSUEL:     { label: 'Rapport mensuel',      color: '#78350F', bg: '#FEF9EC', border: '#F3D07A' },
  TRIMESTRIEL: { label: 'Rapport trimestriel',  color: '#15803D', bg: '#F0FDF4', border: '#BBF7D0' },
  ANNUEL:      { label: 'Rapport annuel',        color: '#5B21B6', bg: '#F5F3FF', border: '#DDD6FE' },
  AD_HOC:      { label: 'Rapport ad-hoc',        color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
}

/* ── Rendu markdown minimal ────────────────────────────────────────────────── */
function MarkdownBlock({ content }) {
  if (!content) return null

  const lines = content.split('\n')
  const nodes = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Table
    if (line.match(/^\|.+\|/) && lines[i + 1]?.match(/^\|[\s\-:|]+\|/)) {
      const headers = line.split('|').slice(1, -1).map(c => c.trim())
      i += 2
      const bodyRows = []
      while (i < lines.length && lines[i].match(/^\|.+\|/)) {
        bodyRows.push(lines[i].split('|').slice(1, -1).map(c => c.trim()))
        i++
      }
      nodes.push(
        <div key={i} style={{ overflowX: 'auto', marginBottom: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#0D1E35' }}>
                {headers.map((h, j) => (
                  <th key={j} style={{ padding: '8px 14px', textAlign: 'left', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: '7px 14px', borderBottom: '1px solid #F3F4F6', color: '#374151', verticalAlign: 'top' }}>
                      <InlineMarkdown text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      continue
    }

    if (line.startsWith('### ')) {
      nodes.push(<h3 key={i} style={{ fontSize: '13px', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '.4px', margin: '20px 0 8px' }}><InlineMarkdown text={line.slice(4)} /></h3>)
      i++; continue
    }
    if (line.startsWith('## ')) {
      nodes.push(
        <h2 key={i} style={{ fontSize: '16px', fontWeight: 700, color: '#1E3A8A', margin: '28px 0 12px', paddingLeft: 14, borderLeft: '3px solid #C9910A' }}>
          <InlineMarkdown text={line.slice(3)} />
        </h2>
      )
      i++; continue
    }
    if (line.startsWith('# ')) {
      nodes.push(
        <h1 key={i} style={{ fontSize: '20px', fontWeight: 800, color: '#0D1E35', margin: '32px 0 14px', paddingBottom: 10, borderBottom: '2px solid #C9910A' }}>
          <InlineMarkdown text={line.slice(2)} />
        </h1>
      )
      i++; continue
    }
    if (line.match(/^---+$/)) {
      nodes.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #E5E7EB', margin: '20px 0' }} />)
      i++; continue
    }
    if (line.match(/^[-*] /)) {
      const items = []
      while (i < lines.length && lines[i].match(/^[-*] /)) {
        items.push(<li key={i} style={{ marginBottom: 5, color: '#374151', lineHeight: 1.65 }}><InlineMarkdown text={lines[i].slice(2)} /></li>)
        i++
      }
      nodes.push(<ul key={`ul-${i}`} style={{ margin: '8px 0 14px 22px', padding: 0 }}>{items}</ul>)
      continue
    }
    if (!line.trim()) { nodes.push(<div key={i} style={{ height: 8 }} />); i++; continue }

    nodes.push(
      <p key={i} style={{ margin: '0 0 10px', color: '#374151', lineHeight: 1.7, fontSize: '13.5px' }}>
        <InlineMarkdown text={line} />
      </p>
    )
    i++
  }

  return <>{nodes}</>
}

function InlineMarkdown({ text }) {
  const parts = []
  let remaining = String(text || '')
  let key = 0

  while (remaining) {
    // **bold**
    const boldMatch = remaining.match(/^(.*?)\*\*(.+?)\*\*(.*)$/)
    if (boldMatch) {
      if (boldMatch[1]) parts.push(boldMatch[1])
      parts.push(<strong key={key++} style={{ color: '#111827' }}>{boldMatch[2]}</strong>)
      remaining = boldMatch[3]
      continue
    }
    // *italic*
    const italicMatch = remaining.match(/^(.*?)\*(.+?)\*(.*)$/)
    if (italicMatch) {
      if (italicMatch[1]) parts.push(italicMatch[1])
      parts.push(<em key={key++}>{italicMatch[2]}</em>)
      remaining = italicMatch[3]
      continue
    }
    // `code`
    const codeMatch = remaining.match(/^(.*?)`(.+?)`(.*)$/)
    if (codeMatch) {
      if (codeMatch[1]) parts.push(codeMatch[1])
      parts.push(
        <code key={key++} style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 3, padding: '1px 5px', fontFamily: 'monospace', fontSize: '12px', color: '#B45309' }}>
          {codeMatch[2]}
        </code>
      )
      remaining = codeMatch[3]
      continue
    }
    parts.push(remaining)
    break
  }

  return <>{parts}</>
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function RapportIADetail() {
  const { id }     = useParams()
  const navigate   = useNavigate()

  const { data: rapport, isLoading, error } = useQuery({
    queryKey: ['ia-rapport', id],
    queryFn:  () => getRapport(id).then(r => r.data?.data ?? r.data),
    enabled:  !!id,
  })

  const typeMeta = rapport ? (TYPE_LABELS[rapport.type_rapport] || { label: rapport.type_rapport, color: '#374151', bg: '#F3F4F6', border: '#E5E7EB' }) : null
  const dateCreation = rapport?.created_at
    ? new Date(rapport.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—'

  if (isLoading) return (
    <div style={{ padding: '80px 0', textAlign: 'center' }}>
      <div className="spinner" style={{ margin: '0 auto 14px' }} />
      <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Chargement du rapport…</p>
    </div>
  )

  if (error || !rapport) return (
    <div className="empty-state">
      <div className="empty-icon"><FileText size={28} strokeWidth={1.5} style={{ color: 'var(--color-gray-400)' }} /></div>
      <p className="empty-title">Rapport introuvable</p>
      <p className="empty-body">Ce rapport n'existe pas ou a été supprimé.</p>
      <button onClick={() => navigate(-1)} className="btn btn-primary btn-md" style={{ marginTop: 16 }}>
        Retour
      </button>
    </div>
  )

  return (
    <div>
      {/* En-tête page */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/ia')}
            className="btn btn-secondary btn-sm"
            style={{ gap: 6 }}
          >
            <ArrowLeft size={13} strokeWidth={2} /> Retour
          </button>
          <div>
            <h1 className="page-title">{rapport.titre}</h1>
            <p className="page-subtitle">Rapport d'analyse IA</p>
          </div>
        </div>
        <button
          onClick={() => printRapportIA(rapport)}
          className="btn btn-primary btn-sm"
          style={{ gap: 7 }}
        >
          <Download size={13} strokeWidth={2} /> Imprimer / PDF
        </button>
      </div>

      {/* Card couverture */}
      <div style={{
        background: '#1E3A8A',
        borderRadius: 14, padding: '24px 32px', marginBottom: 24,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} strokeWidth={2} style={{ color: '#C9910A' }} />
            </div>
            {typeMeta && (
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '.8px',
                textTransform: 'uppercase', color: typeMeta.color,
                background: typeMeta.bg, border: `1px solid ${typeMeta.border}`,
                padding: '3px 10px', borderRadius: 20,
              }}>
                {typeMeta.label}
              </span>
            )}
          </div>
          <div style={{ fontSize: '21px', fontWeight: 800, color: '#fff', lineHeight: 1.2, maxWidth: 520 }}>
            {rapport.titre}
          </div>
        </div>
        <div style={{ fontSize: '11px', color: 'rgba(255,255,255,.5)', textAlign: 'right', lineHeight: 1.8 }}>
          <div>Généré le</div>
          <div style={{ color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>{dateCreation}</div>
          {rapport.tokens_utilises && (
            <>
              <div style={{ marginTop: 6 }}>Tokens utilisés</div>
              <div style={{ color: 'rgba(255,255,255,.8)', fontWeight: 600 }}>
                {rapport.tokens_utilises.toLocaleString('fr-FR')}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Corps du rapport */}
      <div style={{
        background: '#fff', borderRadius: 12, padding: '32px 36px',
        boxShadow: '0 1px 8px rgba(0,0,0,.07)',
        lineHeight: 1.7,
      }}>
        <MarkdownBlock content={rapport.contenu} />
      </div>
    </div>
  )
}
