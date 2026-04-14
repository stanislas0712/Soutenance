/**
 * BudgetFlow — API Dépenses
 */
import api from './axios'

export const getDepenses       = (params)         => api.get('/v1/depenses/', { params })
export const getDepense        = (id)              => api.get(`/v1/depenses/${id}/`)
export const validerDepense    = (id, data)        => api.post(`/v1/depenses/${id}/valider/`, data)
export const rejeterDepense    = (id, data)        => api.post(`/v1/depenses/${id}/rejeter/`, data)
export const getDepensesBudget = (budgetId)        => api.get('/v1/depenses/', { params: { budget: budgetId } })
