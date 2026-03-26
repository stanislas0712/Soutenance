import { useState, useEffect } from 'react'
import { api } from './api.js'
import BudgetCard    from './components/BudgetCard.jsx'
import BudgetTable   from './components/BudgetTable.jsx'
import DepenseForm   from './components/DepenseForm.jsx'
import StatCard      from './components/StatCard.jsx'

const page = { minHeight: '100vh', background: '#F9FAFB', fontFamily: 'sans-serif' }
const header = {
  background: '#1D4ED8',
  color: '#FFFFFF',
  padding: '0 32px',
  height: '56px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}
const container = { maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }
const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }
const btn = (bg = '#3B82F6') => ({
  padding: '8px 18px', fontSize: '14px', borderRadius: '6px',
  border: 'none', background: bg, color: '#FFFFFF', fontWeight: '600', cursor: 'pointer',
})
const sectionTitle = { fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '16px' }

function formatMontant(n) {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA'
}

export default function App() {
  const [budgets,        setBudgets]        = useState([])
  const [depenses,       setDepenses]       = useState([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState(null)
  const [showAddBudget,  setShowAddBudget]  = useState(false)
  const [selectedBudget, setSelectedBudget] = useState(null)
  const [showDepForm,    setShowDepForm]    = useState(false)
  const [newBudget,      setNewBudget]      = useState({ titre: '', montant_alloue: '', departement: '' })

  async function loadBudgets() {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getBudgets()
      setBudgets(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadDepenses(budgetId) {
    try {
      const data = await api.getDepenses(budgetId)
      setDepenses(data)
    } catch {
      setDepenses([])
    }
  }

  useEffect(() => { loadBudgets() }, [])

  async function handleDeleteBudget(b) {
    if (!confirm(`Supprimer "${b.titre}" ?`)) return
    try {
      await api.deleteBudget(b.id)
      loadBudgets()
      if (selectedBudget?.id === b.id) setSelectedBudget(null)
    } catch (e) { alert(e.message) }
  }

  async function handleAddBudget() {
    try {
      await api.createBudget({ ...newBudget, montant_alloue: Number(newBudget.montant_alloue) })
      setNewBudget({ titre: '', montant_alloue: '', departement: '' })
      setShowAddBudget(false)
      loadBudgets()
    } catch (e) { alert(e.message) }
  }

  async function handleAddDepense(body) {
    try {
      await api.createDepense(body)
      setShowDepForm(false)
      loadDepenses(body.budget_id)
    } catch (e) { alert(e.message) }
  }

  function handleSelectBudget(b) {
    setSelectedBudget(b)
    setShowDepForm(false)
    loadDepenses(b.id)
  }

  // Stats
  const totalAlloue    = budgets.reduce((s, b) => s + b.montant_alloue,    0)
  const totalConsomme  = budgets.reduce((s, b) => s + b.montant_consomme,  0)
  const nbApprouves    = budgets.filter(b => b.statut === 'APPROUVE').length

  if (loading) return <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}>Chargement…</div>
  if (error)   return <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626' }}>Erreur : {error}</div>

  return (
    <div style={page}>
      {/* Header */}
      <div style={header}>
        <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.5px' }}>
          BudgetFlow
        </span>
        <span style={{ fontSize: '13px', opacity: 0.8 }}>Gestion Budgétaire</span>
      </div>

      <div style={container}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <StatCard label="Total Budgets"  value={budgets.length}          color="#3B82F6" />
          <StatCard label="Budgets Approuvés" value={nbApprouves}          color="#16A34A" />
          <StatCard label="Total Alloué"   value={formatMontant(totalAlloue)}   color="#1D4ED8" subtitle="Enveloppe globale" />
          <StatCard label="Total Consommé" value={formatMontant(totalConsomme)} color="#7C3AED" subtitle={`${totalAlloue > 0 ? Math.round(totalConsomme / totalAlloue * 100) : 0}% utilisé`} />
        </div>

        {/* Cartes budgets */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={sectionTitle}>Budgets</div>
          <button style={btn()} onClick={() => setShowAddBudget(v => !v)}>
            {showAddBudget ? 'Annuler' : '+ Nouveau Budget'}
          </button>
        </div>

        {/* Formulaire nouveau budget */}
        {showAddBudget && (
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '8px', padding: '20px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '2 1 200px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#1D4ED8', display: 'block', marginBottom: '4px' }}>Titre</label>
              <input style={{ width: '100%', border: '1px solid #BFDBFE', borderRadius: '4px', padding: '7px 10px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="Ex: Budget Informatique 2025"
                value={newBudget.titre}
                onChange={e => setNewBudget(v => ({ ...v, titre: e.target.value }))} />
            </div>
            <div style={{ flex: '1 1 140px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#1D4ED8', display: 'block', marginBottom: '4px' }}>Montant alloué</label>
              <input style={{ width: '100%', border: '1px solid #BFDBFE', borderRadius: '4px', padding: '7px 10px', fontSize: '14px', boxSizing: 'border-box' }}
                type="number" placeholder="0"
                value={newBudget.montant_alloue}
                onChange={e => setNewBudget(v => ({ ...v, montant_alloue: e.target.value }))} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#1D4ED8', display: 'block', marginBottom: '4px' }}>Département</label>
              <input style={{ width: '100%', border: '1px solid #BFDBFE', borderRadius: '4px', padding: '7px 10px', fontSize: '14px', boxSizing: 'border-box' }}
                placeholder="Ex: INFO"
                value={newBudget.departement}
                onChange={e => setNewBudget(v => ({ ...v, departement: e.target.value }))} />
            </div>
            <button style={btn()} onClick={handleAddBudget}>Enregistrer</button>
          </div>
        )}

        {/* Grille de cartes */}
        <div style={grid3}>
          {budgets.map(b => (
            <div key={b.id}
              onClick={() => handleSelectBudget(b)}
              style={{ cursor: 'pointer', outline: selectedBudget?.id === b.id ? '2px solid #3B82F6' : 'none', borderRadius: '8px' }}>
              <BudgetCard
                titre={b.titre}
                montant_alloue={b.montant_alloue}
                montant_consomme={b.montant_consomme}
                statut={b.statut}
                departement={b.departement}
              />
            </div>
          ))}
        </div>

        {/* Tableau complet */}
        <div style={{ marginBottom: '40px' }}>
          <div style={sectionTitle}>Tableau des Budgets</div>
          <BudgetTable
            budgets={budgets}
            onEdit={b => handleSelectBudget(b)}
            onDelete={handleDeleteBudget}
          />
        </div>

        {/* Détail budget sélectionné */}
        {selectedBudget && (
          <div style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#374151' }}>
                Dépenses — {selectedBudget.titre}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={btn()} onClick={() => setShowDepForm(v => !v)}>
                  {showDepForm ? 'Annuler' : '+ Nouvelle Dépense'}
                </button>
                <button style={btn('#6B7280')} onClick={() => setSelectedBudget(null)}>Fermer</button>
              </div>
            </div>

            {showDepForm && (
              <div style={{ marginBottom: '24px' }}>
                <DepenseForm
                  budgetId={selectedBudget.id}
                  onSave={handleAddDepense}
                  onCancel={() => setShowDepForm(false)}
                />
              </div>
            )}

            {depenses.length === 0 ? (
              <p style={{ color: '#6B7280', fontSize: '14px' }}>Aucune dépense enregistrée pour ce budget.</p>
            ) : (
              <div style={{ border: '1px solid #E5E7EB', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#F9FAFB' }}>
                      {['ID', 'Description', 'Montant', 'Date', 'Justificatif'].map(h => (
                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {depenses.map((d, i) => (
                      <tr key={d.id} style={{ background: i % 2 === 0 ? '#FFFFFF' : '#FAFAFA' }}>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F3F4F6', color: '#374151' }}>{d.id}</td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F3F4F6', color: '#374151', fontWeight: '500' }}>{d.description}</td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F3F4F6', color: '#374151' }}>{formatMontant(d.montant)}</td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{d.date}</td>
                        <td style={{ padding: '11px 14px', borderBottom: '1px solid #F3F4F6', color: '#6B7280' }}>{d.justificatif || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
