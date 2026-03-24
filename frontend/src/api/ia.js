/**
 * BudgetFlow — API IA
 * Client pour les 6 fonctionnalités d'Intelligence Artificielle.
 */
import api from './axios'

const BASE = '/v1/ia'

/* ── F1 — Analyse Budgétaire ────────────────────────────────────────────── */
export const analyserBudget     = (budgetId)  => api.post(`${BASE}/analyser-budget/${budgetId}/`)
export const getAnalysesBudget  = (budgetId)  => api.get(`${BASE}/analyses/${budgetId}/`)

/* ── F2 — Chatbot Financier ─────────────────────────────────────────────── */
export const getConversations     = ()           => api.get(`${BASE}/conversations/`)
export const getConversation      = (id)         => api.get(`${BASE}/conversations/${id}/`)
export const creerConversation    = (data)        => api.post(`${BASE}/conversations/`, data)
export const supprimerConversation= (id)          => api.delete(`${BASE}/conversations/${id}/`)
export const envoyerMessage       = (convId, msg) => api.post(`${BASE}/conversations/${convId}/messages/`, { contenu: msg })

/* ── F3 — Anomalies ─────────────────────────────────────────────────────── */
export const detecterAnomalies  = (budgetId)      => api.post(`${BASE}/detecter-anomalies/${budgetId}/`)
export const getAnomalies       = (params)         => api.get(`${BASE}/anomalies/`, { params })
export const traiterAnomalie    = (id, statut)     => api.patch(`${BASE}/anomalies/${id}/traiter/`, { statut })

/* ── F4 — Rapports Narratifs ────────────────────────────────────────────── */
export const genererRapport     = (data)  => api.post(`${BASE}/rapports-narratifs/generer/`, data)
export const getRapports        = ()      => api.get(`${BASE}/rapports-narratifs/`)
export const getRapport         = (id)    => api.get(`${BASE}/rapports-narratifs/${id}/`)

/* ── F5 — Prédictions ───────────────────────────────────────────────────── */
export const predireDepassement = (budgetId) => api.post(`${BASE}/predire-depassement/${budgetId}/`)
export const getPredictions     = ()          => api.get(`${BASE}/predictions/`)

/* ── F6 — Scoring ───────────────────────────────────────────────────────── */
export const scorerBudget       = (budgetId) => api.post(`${BASE}/scorer-budget/${budgetId}/`)
export const getScoreBudget     = (budgetId) => api.get(`${BASE}/score-budget/${budgetId}/`)
