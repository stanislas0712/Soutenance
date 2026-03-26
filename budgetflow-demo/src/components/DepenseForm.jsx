import { useState } from 'react'

const inputStyle = {
  width: '100%',
  border: '1px solid #D1D5DB',
  borderRadius: '4px',
  padding: '8px 10px',
  fontSize: '14px',
  color: '#374151',
  boxSizing: 'border-box',
  outline: 'none',
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '600',
  color: '#374151',
  marginBottom: '4px',
}

export default function DepenseForm({ onSave, onCancel, budgetId }) {
  const [description,  setDescription]  = useState('')
  const [montant,      setMontant]      = useState('')
  const [date,         setDate]         = useState('')
  const [justificatif, setJustificatif] = useState('')

  function handleSave() {
    onSave?.({ description, montant: Number(montant), date, justificatif, budget_id: budgetId })
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      padding: '24px',
      fontFamily: 'sans-serif',
      maxWidth: '480px',
    }}>
      <div style={{ fontWeight: '700', fontSize: '16px', color: '#374151', marginBottom: '20px' }}>
        Nouvelle Dépense
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Description</label>
        <input style={inputStyle} type="text" placeholder="Ex: Achat matériel" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Montant</label>
        <input style={inputStyle} type="number" placeholder="0" value={montant} onChange={e => setMontant(e.target.value)} />
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={labelStyle}>Date</label>
        <input style={inputStyle} type="date" value={date} onChange={e => setDate(e.target.value)} />
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Justificatif</label>
        <input style={inputStyle} type="text" placeholder="Référence ou numéro de pièce" value={justificatif} onChange={e => setJustificatif(e.target.value)} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button
          onClick={onCancel}
          style={{ padding: '8px 18px', fontSize: '14px', borderRadius: '4px', border: '1px solid #D1D5DB', background: '#F9FAFB', color: '#374151', cursor: 'pointer' }}
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          style={{ padding: '8px 18px', fontSize: '14px', borderRadius: '4px', border: 'none', background: '#3B82F6', color: '#FFFFFF', fontWeight: '600', cursor: 'pointer' }}
        >
          Enregistrer
        </button>
      </div>
    </div>
  )
}
