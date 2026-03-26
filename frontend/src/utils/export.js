/**
 * BudgetFlow — Utilitaires d'export (CSV et impression PDF)
 */

/**
 * Export CSV (compatible Excel avec séparateur ; et BOM UTF-8)
 * @param {string} filename  - nom du fichier sans extension
 * @param {string[]} headers - titres des colonnes
 * @param {Array[]} rows     - tableau de tableaux de valeurs
 */
export function exportCSV(filename, headers, rows) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const lines = [
    headers.map(escape).join(';'),
    ...rows.map(r => r.map(escape).join(';')),
  ]
  const blob = new Blob(['\uFEFF' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${filename}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Impression PDF via fenêtre dédiée avec mise en page propre
 * @param {string} title      - titre du document
 * @param {string[]} headers  - colonnes du tableau
 * @param {Array[]} rows      - données
 * @param {object} meta       - métadonnées {subtitle, filters, stats}
 */
export function printPDF(title, headers, rows, meta = {}) {
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  const statsHtml = meta.stats
    ? `<div class="stats">${meta.stats.map(s =>
        `<div class="stat-box"><div class="stat-val">${s.value}</div><div class="stat-lbl">${s.label}</div></div>`
      ).join('')}</div>`
    : ''

  const thead = headers.map(h => `<th>${h}</th>`).join('')
  const tbody = rows.map((r, i) =>
    `<tr class="${i % 2 === 0 ? '' : 'alt'}">${r.map(c => `<td>${c ?? '—'}</td>`).join('')}</tr>`
  ).join('')

  const html = `<!DOCTYPE html><html lang="fr"><head>
<meta charset="UTF-8"/>
<title>${title}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11px; color: #1F2937; background: #fff; padding: 24px 28px; }
  .toolbar { display: flex; gap: 8px; justify-content: flex-end; margin-bottom: 16px; }
  .toolbar button { padding: 7px 18px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; font-weight: 600; }
  .btn-print { background: #1E3A8A; color: #fff; }
  .btn-close { background: #F3F4F6; color: #374151; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 2px solid #1E3A8A; }
  .header-left h1 { font-size: 16px; font-weight: 800; color: #1E3A8A; margin-bottom: 3px; }
  .header-left p  { font-size: 10px; color: #6B7280; }
  .header-right   { text-align: right; font-size: 10px; color: #6B7280; }
  .logo { font-size: 18px; font-weight: 900; color: #1E3A8A; letter-spacing: -0.5px; }
  .stats { display: flex; gap: 12px; margin-bottom: 14px; flex-wrap: wrap; }
  .stat-box { background: #EFF6FF; border: 1px solid #DBEAFE; border-radius: 6px; padding: 8px 14px; min-width: 100px; }
  .stat-val { font-size: 15px; font-weight: 800; color: #1E3A8A; }
  .stat-lbl { font-size: 9px; color: #6B7280; text-transform: uppercase; letter-spacing: .4px; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-top: 4px; }
  thead tr { background: #1E3A8A; }
  thead th { color: #fff; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; padding: 7px 8px; text-align: left; white-space: nowrap; }
  tbody td { padding: 6px 8px; font-size: 10px; border-bottom: 1px solid #F3F4F6; vertical-align: top; }
  tr.alt td { background: #F9FAFB; }
  .footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #E5E7EB; display: flex; justify-content: space-between; font-size: 9px; color: #9CA3AF; }
  @media print {
    .toolbar { display: none !important; }
    body { padding: 10px 14px; }
    @page { margin: 1cm; size: A4 landscape; }
  }
</style>
</head><body>
<div class="toolbar no-print">
  <button class="btn-close" onclick="window.close()">✕ Fermer</button>
  <button class="btn-print" onclick="window.print()">🖨 Imprimer / Enregistrer PDF</button>
</div>
<div class="header">
  <div class="header-left">
    <div class="logo">BudgetFlow</div>
    <h1>${title}</h1>
    ${meta.subtitle ? `<p>${meta.subtitle}</p>` : ''}
  </div>
  <div class="header-right">
    <div>Généré le ${now}</div>
    ${meta.filters ? `<div style="margin-top:4px">${meta.filters}</div>` : ''}
    <div style="margin-top:4px">${rows.length} enregistrement${rows.length !== 1 ? 's' : ''}</div>
  </div>
</div>
${statsHtml}
<table>
  <thead><tr>${thead}</tr></thead>
  <tbody>${tbody}</tbody>
</table>
<div class="footer">
  <span>BudgetFlow — Système de Gestion Budgétaire</span>
  <span>Document confidentiel — usage interne</span>
</div>
</body></html>`

  // Utiliser un Blob URL pour éviter le blocage des popups
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const w    = window.open(url, '_blank')
  if (!w) {
    // Fallback : téléchargement direct du fichier HTML
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
