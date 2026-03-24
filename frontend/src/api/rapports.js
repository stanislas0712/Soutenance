/**
 * BudgetFlow — API Rapports & KPIs
 */
import api from './axios'

export const getKpis                   = ()       => api.get('/v1/rapports/kpis/')
export const getEvolutionMensuelle     = (params) => api.get('/v1/rapports/evolution-mensuelle/', { params })
export const getParDepartement         = ()       => api.get('/v1/rapports/par-departement/')
export const getTauxUtilisationEnvelop = ()       => api.get('/v1/rapports/taux-utilisation-enveloppes/')
export const getExecutionBudgetaire    = (params) => api.get('/v1/rapports/execution-budgetaire/', { params })
export const getDepensesParFournisseur = ()       => api.get('/v1/rapports/depenses-par-fournisseur/')
