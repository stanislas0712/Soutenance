const STATUS_STYLES = {
  BROUILLON: { background: '#F3F4F6', color: '#6B7280' },
  SOUMIS:    { background: '#EFF6FF', color: '#2563EB' },
  APPROUVE:  { background: '#F0FDF4', color: '#16A34A' },
  REJETE:    { background: '#FEF2F2', color: '#DC2626' },
}

function formatMontant(montant) {
  return new Intl.NumberFormat('fr-FR').format(montant) + ' FCFA'
}

export default function BudgetCard({ titre, montant_alloue, montant_consomme, statut, departement }) {
  const badgeStyle = STATUS_STYLES[statut] || STATUS_STYLES['BROUILLON']
  const progression = montant_alloue > 0
    ? Math.min((montant_consomme / montant_alloue) * 100, 100)
    : 0

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      padding: '20px',
      fontFamily: 'sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontWeight: '700', fontSize: '16px', color: '#374151' }}>{titre}</span>
        <span style={{ ...badgeStyle, borderRadius: '12px', padding: '2px 10px', fontSize: '12px', fontWeight: '600' }}>
          {statut}
        </span>
      </div>
      <div style={{ color: '#6B7280', fontSize: '13px', marginBottom: '14px' }}>{departement}</div>
      <div style={{ background: '#E5E7EB', borderRadius: '4px', height: '8px', marginBottom: '12px', overflow: 'hidden' }}>
        <div style={{
          background: '#3B82F6',
          borderRadius: '4px',
          height: '100%',
          width: `${progression}%`,
          transition: 'width 0.3s ease',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '2px' }}>Alloué</div>
          <div style={{ color: '#374151', fontSize: '14px', fontWeight: '600' }}>{formatMontant(montant_alloue)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#6B7280', fontSize: '12px', marginBottom: '2px' }}>Consommé</div>
          <div style={{ color: '#374151', fontSize: '14px', fontWeight: '600' }}>{formatMontant(montant_consomme)}</div>
        </div>
      </div>
    </div>
  )
}
