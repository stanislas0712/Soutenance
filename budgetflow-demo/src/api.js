// Helper fetch — proxy Vite redirige /api → http://localhost:3001
const BASE = '/api'

export async function apiFetch(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Erreur API')
  return json.data
}

export const api = {
  // Budgets
  getBudgets:      ()         => apiFetch('/budgets'),
  getBudget:       (id)       => apiFetch(`/budgets/${id}`),
  createBudget:    (body)     => apiFetch('/budgets', { method: 'POST', body }),
  updateBudget:    (id, body) => apiFetch(`/budgets/${id}`, { method: 'PUT', body }),
  deleteBudget:    (id)       => apiFetch(`/budgets/${id}`, { method: 'DELETE' }),

  // Lignes budgétaires
  getLignes:       (budgetId) => apiFetch(budgetId ? `/lignes?budget_id=${budgetId}` : '/lignes'),
  createLigne:     (body)     => apiFetch('/lignes', { method: 'POST', body }),
  updateLigne:     (id, body) => apiFetch(`/lignes/${id}`, { method: 'PUT', body }),
  deleteLigne:     (id)       => apiFetch(`/lignes/${id}`, { method: 'DELETE' }),

  // Dépenses
  getDepenses:     (budgetId) => apiFetch(budgetId ? `/depenses?budget_id=${budgetId}` : '/depenses'),
  createDepense:   (body)     => apiFetch('/depenses', { method: 'POST', body }),
  updateDepense:   (id, body) => apiFetch(`/depenses/${id}`, { method: 'PUT', body }),
  deleteDepense:   (id)       => apiFetch(`/depenses/${id}`, { method: 'DELETE' }),
}
