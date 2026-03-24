import { useEffect, useState } from 'react'
import { getDepartements } from '../../api/accounts'
import {
  getBudgetAnnuels, createBudgetAnnuel, updateBudgetAnnuel, deleteBudgetAnnuel,
  getAllocations, createAllocation, updateAllocation, deleteAllocation,
} from '../../api/budget'
import { Plus, Pencil, Trash2, Building2, CalendarDays, ChevronDown, AlertTriangle } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n ?? 0)

const jaugeColor = (pct) => {
  if (pct >= 100) return 'var(--color-danger-600)'
  if (pct >= 80)  return 'var(--color-warning-600)'
  return 'var(--color-primary-600)'
}

/* ─── Page principale ──────────────────────────────────────────────────────── */
export default function BudgetAnnuelPage() {
  const [budgets,     setBudgets]     = useState([])
  const [selected,    setSelected]    = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [showNewBA,   setShowNewBA]   = useState(false)
  const [editBA,      setEditBA]      = useState(null)
  const [showAllouer, setShowAllouer] = useState(false)

  const load = () => {
    setLoading(true)
    getBudgetAnnuels()
      .then(r => setBudgets(r.data.results ?? r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleAllouerSaved = () => {
    setShowAllouer(false)
    getBudgetAnnuels().then(r => {
      const list = r.data.results ?? r.data
      setBudgets(list)
      setSelected(prev => prev ? (list.find(b => b.id === prev.id) ?? null) : null)
    })
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget annuel</h1>
          <p className="page-subtitle">Budget global voté par l'entreprise — allouez-le aux départements</p>
        </div>
        <div className="flex gap-[10px]">
          {budgets.length > 0 && (
            <button onClick={() => setShowAllouer(true)} className="btn btn-secondary btn-md gap-[7px]">
              <Building2 size={15} strokeWidth={2} /> Allouer un département
            </button>
          )}
          <button onClick={() => setShowNewBA(true)} className="btn btn-primary btn-md gap-[7px]">
            <Plus size={16} strokeWidth={2.5} /> Voter le budget annuel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <CalendarDays size={28} strokeWidth={1.5} className="text-gray-400" />
          </div>
          <p className="empty-title">Aucun budget annuel voté</p>
          <p className="empty-body">
            L'entreprise vote un budget global unique par exercice.<br />
            Ce budget sera ensuite alloué aux départements.
          </p>
          <button onClick={() => setShowNewBA(true)} className="btn btn-primary btn-md mt-4 gap-[7px]">
            <Plus size={16} strokeWidth={2.5} /> Voter le budget annuel
          </button>
        </div>
      ) : (
        <div className="flex gap-6 items-start">
          {/* Liste budgets annuels */}
          <div className="w-[340px] shrink-0">
            {budgets.map(ba => (
              <BudgetAnnuelCard
                key={ba.id}
                ba={ba}
                active={selected?.id === ba.id}
                onClick={() => setSelected(prev => prev?.id === ba.id ? null : ba)}
                onEdit={() => setEditBA(ba)}
                onDelete={() => {
                  if (!confirm(`Supprimer le budget annuel ${ba.periode_display ?? ba.annee} ?`)) return
                  deleteBudgetAnnuel(ba.id).then(() => {
                    if (selected?.id === ba.id) setSelected(null)
                    load()
                  })
                }}
              />
            ))}
          </div>

          {/* Panneau allocations */}
          {selected && (
            <AllocationsPanel
              key={selected.id}
              budgetAnnuel={selected}
              onRefresh={() => {
                getBudgetAnnuels().then(r => {
                  const list = r.data.results ?? r.data
                  setBudgets(list)
                  setSelected(list.find(b => b.id === selected.id) ?? null)
                })
              }}
            />
          )}
        </div>
      )}

      {showNewBA && <BudgetAnnuelModal onClose={() => setShowNewBA(false)} onSaved={() => { setShowNewBA(false); load() }} />}
      {editBA    && <BudgetAnnuelModal initial={editBA} onClose={() => setEditBA(null)} onSaved={() => { setEditBA(null); load() }} />}
      {showAllouer && <AllocationRapideModal budgets={budgets} onClose={() => setShowAllouer(false)} onSaved={handleAllouerSaved} />}
    </div>
  )
}

/* ─── Carte budget annuel ──────────────────────────────────────────────────── */
function BudgetAnnuelCard({ ba, active, onClick, onEdit, onDelete }) {
  const pct     = ba.montant_global > 0 ? Math.min(100, (ba.montant_alloue_depts / ba.montant_global) * 100) : 0
  const restant = ba.montant_disponible_global
  const color   = jaugeColor(pct)

  return (
    <div
      onClick={onClick}
      className="card cursor-pointer mb-[12px]"
      style={{
        border: `2px solid ${active ? 'var(--color-primary-500)' : 'var(--color-gray-200)'}`,
        boxShadow: active ? '0 0 0 3px rgba(59,130,246,.15)' : undefined,
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      <div className="flex items-start justify-between mb-[14px]">
        <div>
          <div className="font-display font-extrabold text-[15px] text-gray-900">
            Exercice {ba.periode_display ?? ba.annee}
          </div>
          {ba.description && (
            <div className="text-[#9CA3AF] text-[12px] mt-[3px]">{ba.description}</div>
          )}
        </div>
        <div className="flex gap-[5px]" onClick={e => e.stopPropagation()}>
          <button onClick={onEdit} className="btn btn-secondary btn-sm" title="Modifier">
            <Pencil size={12} strokeWidth={2} />
          </button>
          <button onClick={onDelete} className="btn btn-danger btn-sm" title="Supprimer">
            <Trash2 size={12} strokeWidth={2} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[10px] mb-[14px]">
        <div>
          <div className="text-[10px] text-[#9CA3AF] font-semibold tracking-[.4px] mb-[3px]">BUDGET GLOBAL</div>
          <div className="font-mono font-bold text-[13px] text-primary-600">{fmt(ba.montant_global)} FCFA</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9CA3AF] font-semibold tracking-[.4px] mb-[3px]">DISPONIBLE</div>
          <div
            className="font-mono font-bold text-[13px]"
            style={{ color: restant < 0 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}
          >
            {fmt(restant)} FCFA
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-[11px] text-[#6B7280] mb-[5px]">
          <span>Alloué aux départements</span>
          <span className="font-bold font-mono" style={{ color }}>{Math.round(pct)}%</span>
        </div>
        <div className="exec-bar">
          <div className="exec-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${jaugeColor(Math.max(0, pct - 20))}, ${color})` }} />
        </div>
      </div>

      {active && (
        <div className="mt-[10px] flex items-center gap-[5px] text-[12px] text-primary-600 font-semibold">
          <ChevronDown size={14} strokeWidth={2.5} /> Voir les allocations
        </div>
      )}
    </div>
  )
}

/* ─── Panneau allocations ──────────────────────────────────────────────────── */
function AllocationsPanel({ budgetAnnuel, onRefresh }) {
  const [allocs,    setAllocs]    = useState([])
  const [depts,     setDepts]     = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showForm,  setShowForm]  = useState(false)
  const [editAlloc, setEditAlloc] = useState(null)

  const load = () => {
    Promise.all([getAllocations(budgetAnnuel.id), getDepartements()])
      .then(([a, d]) => { setAllocs(a.data.results ?? a.data); setDepts(d.data.results ?? d.data) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [budgetAnnuel.id])

  const handleDelete = (alloc) => {
    if (!confirm(`Supprimer l'allocation de ${alloc.departement_nom} ?`)) return
    deleteAllocation(budgetAnnuel.id, alloc.id).then(() => { load(); onRefresh() })
  }

  const allocDeptIds = allocs.map(a => String(a.departement))
  const deptsDispos  = depts.filter(d => !allocDeptIds.includes(String(d.id)))
  const totalAlloue  = allocs.reduce((s, a) => s + parseFloat(a.montant_alloue || 0), 0)
  const disponible   = parseFloat(budgetAnnuel.montant_global) - totalAlloue

  return (
    <div className="flex-1">
      {/* Header panel */}
      <div
        className="rounded-[var(--radius-lg)] px-6 py-5 mb-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0F2547 0%, #1E3A8A 60%, #1D4ED8 100%)' }}
      >
        <div className="absolute rounded-full pointer-events-none" style={{ top: -30, right: -30, width: 140, height: 140, background: 'rgba(255,255,255,.05)' }} />
        <div className="relative">
          <div className="flex justify-between items-center mb-4">
            <div>
              <div className="font-display font-extrabold text-[15px]">
                Allocations — Exercice {budgetAnnuel.periode_display ?? budgetAnnuel.annee}
              </div>
              <div className="opacity-65 text-[12px] mt-[2px]">
                Budget global : {fmt(budgetAnnuel.montant_global)} FCFA
              </div>
            </div>
            {deptsDispos.length > 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-[7px] px-4 py-2 rounded-[9px] text-white font-semibold text-[13px] cursor-pointer"
                style={{ border: '1.5px solid rgba(255,255,255,.3)', background: 'rgba(255,255,255,.12)' }}
              >
                <Plus size={14} strokeWidth={2.5} /> Allouer
              </button>
            )}
          </div>

          {/* KPIs inline */}
          <div className="grid grid-cols-3 gap-[10px]">
            {[
              { label: 'Global',  value: fmt(budgetAnnuel.montant_global), color: '#93C5FD' },
              { label: 'Alloué',  value: fmt(totalAlloue),                 color: '#FCD34D' },
              { label: 'Restant', value: fmt(disponible),                  color: disponible < 0 ? '#FCA5A5' : '#6EE7B7' },
            ].map(k => (
              <div key={k.label} className="rounded-[9px] px-[14px] py-[10px]" style={{ background: 'rgba(255,255,255,.08)' }}>
                <div className="text-[10px] opacity-65 uppercase tracking-[.5px] mb-1">{k.label}</div>
                <div className="font-mono font-bold text-[13px]" style={{ color: k.color }}>{k.value} FCFA</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table allocations */}
      {loading ? (
        <div className="p-10 text-center"><div className="spinner mx-auto" /></div>
      ) : allocs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <Building2 size={28} strokeWidth={1.5} className="text-gray-400" />
          </div>
          <p className="empty-title">Aucune allocation</p>
          <p className="empty-body">Cliquez sur "+ Allouer" pour commencer.</p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                {['Département', 'Alloué', 'Consommé', 'Disponible', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allocs.map(a => {
                const pct   = parseFloat(a.montant_alloue) > 0 ? Math.min(100, (parseFloat(a.montant_consomme) / parseFloat(a.montant_alloue)) * 100) : 0
                const color = jaugeColor(pct)
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold text-[13px] mb-[5px]">{a.departement_nom}</div>
                      <div className="exec-bar w-[80px]">
                        <div className="exec-bar-fill" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </td>
                    <td className="font-mono font-semibold">{fmt(a.montant_alloue)} <span className="text-[10px] text-[#9CA3AF]">FCFA</span></td>
                    <td className="font-mono text-[#6B7280]">{fmt(a.montant_consomme)} <span className="text-[10px] text-[#9CA3AF]">FCFA</span></td>
                    <td>
                      <span
                        className="font-mono font-bold"
                        style={{ color: parseFloat(a.montant_disponible) < 0 ? 'var(--color-danger-600)' : 'var(--color-success-600)' }}
                      >
                        {fmt(a.montant_disponible)} <span className="text-[10px] font-normal text-[#9CA3AF]">FCFA</span>
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-[6px]">
                        <button onClick={() => setEditAlloc(a)} className="btn btn-secondary btn-sm" title="Modifier">
                          <Pencil size={12} strokeWidth={2} />
                        </button>
                        <button onClick={() => handleDelete(a)} className="btn btn-danger btn-sm" title="Supprimer">
                          <Trash2 size={12} strokeWidth={2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <AllocationModal
          budgetAnnuel={budgetAnnuel}
          deptsDispos={deptsDispos}
          disponible={disponible}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); onRefresh() }}
        />
      )}
      {editAlloc && (
        <AllocationModal
          budgetAnnuel={budgetAnnuel}
          deptsDispos={[...deptsDispos, depts.find(d => String(d.id) === String(editAlloc.departement))].filter(Boolean)}
          disponible={disponible + parseFloat(editAlloc.montant_alloue)}
          initial={editAlloc}
          onClose={() => setEditAlloc(null)}
          onSaved={() => { setEditAlloc(null); load(); onRefresh() }}
        />
      )}
    </div>
  )
}

/* ─── Modal budget annuel ──────────────────────────────────────────────────── */
function BudgetAnnuelModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState({
    annee:          initial?.annee ?? '',
    annee_fin:      initial?.annee_fin ?? '',
    montant_global: initial?.montant_global ?? '',
    description:    initial?.description ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const periodeLabel = form.annee
    ? (form.annee_fin && form.annee_fin !== form.annee ? `${form.annee}-${form.annee_fin}` : String(form.annee))
    : ''

  const handle = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      const payload = { ...form, annee_fin: form.annee_fin || null }
      initial ? await updateBudgetAnnuel(initial.id, payload) : await createBudgetAnnuel(payload)
      onSaved()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'string' ? d : d?.detail || d?.annee?.[0] || d?.montant_global?.[0] || JSON.stringify(d))
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel max-w-[460px]" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="font-display font-bold text-[15px]">
            {initial ? 'Modifier le budget annuel' : 'Voter le budget annuel'}
          </h2>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body">
            {periodeLabel && (
              <div className="mb-4 px-[14px] py-2 rounded-[9px] bg-[#EFF6FF] border border-[#BFDBFE] text-[13px] font-bold text-[#1D4ED8] font-mono tracking-[.5px]">
                Exercice : {periodeLabel}
              </div>
            )}
            <div className="grid grid-cols-2 gap-[14px] mb-[14px]">
              <div>
                <label className="form-label">Année de début</label>
                <input className="form-input" type="number" required min="2000" max="2099" value={form.annee}
                  onChange={e => setForm(f => ({ ...f, annee: e.target.value }))} placeholder="Ex : 2026" />
              </div>
              <div>
                <label className="form-label">
                  Année de fin <span className="font-normal normal-case text-[#9CA3AF]">(optionnel)</span>
                </label>
                <input className="form-input" type="number" min={form.annee || 2000} max="2099" value={form.annee_fin}
                  onChange={e => setForm(f => ({ ...f, annee_fin: e.target.value }))}
                  placeholder={form.annee ? `Ex : ${parseInt(form.annee) + 1}` : '2027'} />
                <p className="form-hint">Laisser vide si l'exercice tient sur 1 an</p>
              </div>
            </div>
            <div className="mb-[14px]">
              <label className="form-label">Budget global (FCFA)</label>
              <input className="form-input font-mono" type="number" required min="0" step="0.01" value={form.montant_global}
                onChange={e => setForm(f => ({ ...f, montant_global: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Description <span className="font-normal normal-case text-[#9CA3AF]">(optionnel)</span></label>
              <textarea className="form-input h-auto px-[14px] py-[10px]" value={form.description} rows={2}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            {error && (
              <div className="flex items-start gap-[9px] px-[14px] py-[10px] rounded-[9px] bg-[#FEF2F2] border border-[#FECACA] mt-[14px]">
                <AlertTriangle size={14} strokeWidth={2} className="text-[#EF4444] shrink-0 mt-[1px]" />
                <p className="text-[12px] text-[#B91C1C] m-0">{error}</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-md">Annuler</button>
            <button type="submit" disabled={saving} className="btn btn-primary btn-md">
              {saving ? <><span className="spinner-sm" /> Enregistrement…</> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Modal allocation ─────────────────────────────────────────────────────── */
function AllocationModal({ budgetAnnuel, deptsDispos, disponible, initial, onClose, onSaved }) {
  const [form, setForm] = useState({ departement: initial?.departement ?? '', montant_alloue: initial?.montant_alloue ?? '' })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')

  const montantSaisi = parseFloat(form.montant_alloue) || 0
  const depassement  = montantSaisi > disponible

  const handle = async (e) => {
    e.preventDefault(); setError('')
    if (depassement) { setError(`Le montant dépasse le disponible (${fmt(disponible)} FCFA). Réduisez le montant.`); return }
    setSaving(true)
    try {
      initial
        ? await updateAllocation(budgetAnnuel.id, initial.id, { montant_alloue: form.montant_alloue })
        : await createAllocation(budgetAnnuel.id, form)
      onSaved()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'string' ? d : d?.detail || d?.non_field_errors?.[0] || JSON.stringify(d))
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel max-w-[440px]" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="font-display font-bold text-[15px]">
            {initial ? "Modifier l'allocation" : 'Allouer un budget département'}
          </h2>
        </div>
        <form onSubmit={handle}>
          <div className="modal-body">
            <div className="mb-[18px] px-[14px] py-[10px] rounded-[9px] bg-[#EFF6FF] border border-[#BFDBFE] text-[13px]">
              <span className="text-[#4B5563]">Disponible dans le budget global : </span>
              <span
                className="font-bold font-mono"
                style={{ color: disponible < 0 ? 'var(--color-danger-600)' : 'var(--color-primary-700)' }}
              >
                {fmt(disponible)} FCFA
              </span>
            </div>
            {!initial ? (
              <div className="mb-[14px]">
                <label className="form-label">Département</label>
                <select className="form-select" required value={form.departement}
                  onChange={e => setForm(f => ({ ...f, departement: e.target.value }))}>
                  <option value="">— Sélectionner —</option>
                  {deptsDispos.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
              </div>
            ) : (
              <div className="mb-[14px]">
                <label className="form-label">Département</label>
                <input className="form-input opacity-60 cursor-not-allowed" value={initial.departement_nom} disabled />
              </div>
            )}
            <div>
              <label className="form-label">Montant alloué (FCFA)</label>
              <input
                className="form-input font-mono"
                type="number" required min="1" step="0.01"
                value={form.montant_alloue}
                onChange={e => setForm(f => ({ ...f, montant_alloue: e.target.value }))}
                style={{ borderColor: depassement ? 'var(--color-danger-400)' : undefined }}
              />
              {depassement && (
                <p className="text-[#DC2626] text-[12px] mt-1">
                  Dépasse le disponible de {fmt(montantSaisi - disponible)} FCFA
                </p>
              )}
            </div>
            {error && (
              <div className="flex items-start gap-[9px] px-[14px] py-[10px] rounded-[9px] bg-[#FEF2F2] border border-[#FECACA] mt-[14px]">
                <AlertTriangle size={14} strokeWidth={2} className="text-[#EF4444] shrink-0 mt-[1px]" />
                <p className="text-[12px] text-[#B91C1C] m-0">{error}</p>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary btn-md">Annuler</button>
            <button type="submit" disabled={saving || depassement} className="btn btn-primary btn-md"
              style={{ opacity: depassement ? 0.5 : 1 }}>
              {saving ? <><span className="spinner-sm" /> Enregistrement…</> : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─── Modal allocation rapide ──────────────────────────────────────────────── */
function AllocationRapideModal({ budgets, onClose, onSaved }) {
  const [depts,    setDepts]    = useState([])
  const [allocs,   setAllocs]   = useState([])
  const [loadingD, setLoadingD] = useState(true)
  const [form,     setForm]     = useState({ budget_annuel: '', departement: '', montant_alloue: '' })
  const [saving,   setSaving]   = useState(false)
  const [error,    setError]    = useState('')

  useEffect(() => {
    getDepartements()
      .then(r => setDepts(r.data.results ?? r.data))
      .finally(() => setLoadingD(false))
  }, [])

  useEffect(() => {
    if (!form.budget_annuel) { setAllocs([]); return }
    getAllocations(form.budget_annuel).then(r => setAllocs(r.data.results ?? r.data))
  }, [form.budget_annuel])

  const allocDeptIds = allocs.map(a => String(a.departement))
  const deptsDispos  = depts.filter(d => !allocDeptIds.includes(String(d.id)))
  const budgetChoisi = budgets.find(b => String(b.id) === String(form.budget_annuel))
  const totalAlloue  = allocs.reduce((s, a) => s + parseFloat(a.montant_alloue || 0), 0)
  const disponible   = budgetChoisi ? parseFloat(budgetChoisi.montant_global) - totalAlloue : null
  const montantSaisi = parseFloat(form.montant_alloue) || 0
  const depassement  = disponible !== null && montantSaisi > disponible

  const handle = async (e) => {
    e.preventDefault(); setError('')
    if (depassement) { setError(`Le montant dépasse le disponible (${fmt(disponible)} FCFA). Réduisez le montant.`); return }
    setSaving(true)
    try {
      await createAllocation(form.budget_annuel, { departement: form.departement, montant_alloue: form.montant_alloue })
      onSaved()
    } catch (err) {
      const d = err.response?.data
      setError(typeof d === 'string' ? d : d?.detail || d?.non_field_errors?.[0] || JSON.stringify(d))
    } finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-panel max-w-[460px]" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="font-display font-bold text-[15px]">Allouer un budget à un département</h2>
        </div>
        {loadingD ? (
          <div className="p-10 text-center"><div className="spinner mx-auto" /></div>
        ) : (
          <form onSubmit={handle}>
            <div className="modal-body">
              <div className="mb-[14px]">
                <label className="form-label">Exercice budgétaire</label>
                <select className="form-select" required value={form.budget_annuel}
                  onChange={e => setForm(f => ({ ...f, budget_annuel: e.target.value, departement: '' }))}>
                  <option value="">— Sélectionner l'exercice —</option>
                  {budgets.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.periode_display ?? b.annee} — {fmt(b.montant_global)} FCFA
                    </option>
                  ))}
                </select>
              </div>
              {form.budget_annuel && disponible !== null && (
                <div className="mb-[14px] px-[14px] py-[10px] rounded-[9px] bg-[#EFF6FF] border border-[#BFDBFE] text-[13px]">
                  <span className="text-[#4B5563]">Disponible : </span>
                  <span
                    className="font-bold font-mono"
                    style={{ color: disponible < 0 ? 'var(--color-danger-600)' : 'var(--color-primary-700)' }}
                  >
                    {fmt(disponible)} FCFA
                  </span>
                </div>
              )}
              <div className="mb-[14px]">
                <label className="form-label">Département</label>
                <select className="form-select" required value={form.departement}
                  onChange={e => setForm(f => ({ ...f, departement: e.target.value }))}
                  disabled={!form.budget_annuel}>
                  <option value="">— Sélectionner le département —</option>
                  {deptsDispos.map(d => <option key={d.id} value={d.id}>{d.nom}</option>)}
                </select>
                {form.budget_annuel && deptsDispos.length === 0 && (
                  <p className="text-[#D97706] text-[12px] mt-1">
                    Tous les départements ont déjà une allocation pour cet exercice.
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Montant à allouer (FCFA)</label>
                <input className="form-input font-mono" type="number" required min="1" step="0.01"
                  value={form.montant_alloue}
                  onChange={e => setForm(f => ({ ...f, montant_alloue: e.target.value }))}
                  placeholder="Ex : 5 000 000"
                  style={{ borderColor: depassement ? 'var(--color-danger-400)' : undefined }}
                  disabled={!form.departement} />
                {depassement && (
                  <p className="text-[#DC2626] text-[12px] mt-1">
                    Dépasse le disponible de {fmt(montantSaisi - disponible)} FCFA
                  </p>
                )}
              </div>
              {error && (
                <div className="flex items-start gap-[9px] px-[14px] py-[10px] rounded-[9px] bg-[#FEF2F2] border border-[#FECACA] mt-[14px]">
                  <AlertTriangle size={14} strokeWidth={2} className="text-[#EF4444] shrink-0 mt-[1px]" />
                  <p className="text-[12px] text-[#B91C1C] m-0">{error}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" onClick={onClose} className="btn btn-secondary btn-md">Annuler</button>
              <button type="submit" disabled={saving || deptsDispos.length === 0 || depassement} className="btn btn-primary btn-md"
                style={{ opacity: (deptsDispos.length === 0 || depassement) ? 0.5 : 1 }}>
                {saving ? <><span className="spinner-sm" /> Enregistrement…</> : 'Allouer'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
