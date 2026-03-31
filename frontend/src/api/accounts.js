import api from './axios'

export const getMe            = ()       => api.get('/accounts/me/')
export const updateMe         = (data)   => api.patch('/accounts/me/', data)
export const changePassword   = (data)   => api.post('/accounts/me/password/', data)
export const getUtilisateurs  = (params) => api.get('/accounts/utilisateurs/', { params })
export const createUtilisateur= (data)   => api.post('/accounts/utilisateurs/', data)
export const updateUtilisateur= (id, d)  => api.patch(`/accounts/utilisateurs/${id}/`, d)
export const deleteUtilisateur= (id)     => api.delete(`/accounts/utilisateurs/${id}/`)

export const adminResetPassword   = (id, data) => api.post(`/accounts/utilisateurs/${id}/reset-password/`, data)
export const getUtilisateurActivite = (id)     => api.get(`/accounts/utilisateurs/${id}/activite/`)

export const getDepartements    = ()         => api.get('/accounts/departements/')
export const createDepartement  = (data)     => api.post('/accounts/departements/', data)
export const updateDepartement  = (id, data) => api.patch(`/accounts/departements/${id}/`, data)
export const deleteDepartement  = (id)       => api.delete(`/accounts/departements/${id}/`)

// Mot de passe oublié (public — pas de JWT requis)
export const forgotPassword       = (email)  => api.post('/accounts/forgot-password/', { email })
export const resetPasswordConfirm = (data)   => api.post('/accounts/reset-password/', data)
