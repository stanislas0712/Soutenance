const STATUS_STYLES = {
  BROUILLON: { background: '#F3F4F6', color: '#6B7280' },
  SOUMIS:    { background: '#EFF6FF', color: '#2563EB' },
  APPROUVE:  { background: '#F0FDF4', color: '#16A34A' },
  REJETE:    { background: '#FEF2F2', color: '#DC2626' },
}

function formatMontant(montant) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

const th = {
  padding: '10px 14px',
  textAlign: 'left',
  fontSize: '12px',
  fontWeight: '600',
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const td = {
  padding: '12px 14px',
  fontSize: '14px',
  color: '#374151',
  borderBottom: '1px solid #F3F4F6',
}

export default function BudgetTable({ budgets = [], onEdit, onDelete }) {
  return (
    <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F9FAFB' }}>
            <th style={th}>ID</th>
            <th style={th}>Titre</th>
            <th style={th}>Département</th>
            <th style={th}>Alloué</th>
            <th style={th}>Consommé</th>
            <th style={th}>Statut</th>
            <th style={th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {budgets.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ ...td, textAlign: 'center', color: '#6B7280', padding: '24px' }}>
                Aucun budget.
              </td>
            </tr>
          ) : (
            budgets.map((b, i) => {
              const badge = STATUS_STYLES[b.statut] || STATUS_STYLES['BROUILLON']
              return (
                <tr key={b.id ?? i} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                  <td style={td}>{b.id}</td>
                  <td style={{ ...td, fontWeight: '600' }}>{b.titre}</td>
                  <td style={td}>{b.departement}</td>
                  <td style={td}>{formatMontant(b.montant_alloue)}</td>
                  <td style={td}>{formatMontant(b.montant_consomme)}</td>
                  <td style={td}>
                    <span style={{ ...badge, borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
                      {b.statut}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => onEdit?.(b)}
                      style={{ marginRight: '8px', padding: '4px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #D1D5DB', background: '#FFFFFF', color: '#374151', cursor: 'pointer' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => onDelete?.(b)}
                      style={{ padding: '4px 10px', fontSize: '13px', borderRadius: '4px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
