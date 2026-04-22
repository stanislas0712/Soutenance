import api from './axios'

const BASE = '/v1/ia'

/* ── Chatbot Financier ──────────────────────────────────────────────────── */
export const getConversations      = ()           => api.get(`${BASE}/conversations/`)
export const getConversation       = (id)         => api.get(`${BASE}/conversations/${id}/`)
export const creerConversation     = (data)        => api.post(`${BASE}/conversations/`, data)
export const supprimerConversation = (id)          => api.delete(`${BASE}/conversations/${id}/`)
export const envoyerMessage        = (convId, msg) => api.post(`${BASE}/conversations/${convId}/messages/`, { contenu: msg })

/* ── Anomalies ──────────────────────────────────────────────────────────── */
export const detecterAnomalies = (budgetId) => api.post(`${BASE}/detecter-anomalies/${budgetId}/`)
export const getAnomalies      = (params)   => api.get(`${BASE}/anomalies/`, { params })
export const traiterAnomalie   = (id, statut) => api.patch(`${BASE}/anomalies/${id}/traiter/`, { statut })

/* ── Prédictions ────────────────────────────────────────────────────────── */
export const predireDepassement = (budgetId) => api.post(`${BASE}/predire-depassement/${budgetId}/`)
export const getPredictions     = ()          => api.get(`${BASE}/predictions/`)

/* ── Scoring ────────────────────────────────────────────────────────────── */
export const scorerBudget   = (budgetId) => api.post(`${BASE}/scorer-budget/${budgetId}/`)
export const getScoreBudget = (budgetId) => api.get(`${BASE}/score-budget/${budgetId}/`)
