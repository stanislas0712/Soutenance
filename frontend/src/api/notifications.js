import api from './axios'

export const getNotifications    = (params) => api.get('/v1/notifications/', { params })
export const marquerLue          = (id)      => api.patch(`/v1/notifications/${id}/lire/`)
export const marquerToutesLues   = ()        => api.post('/v1/notifications/lire-tout/')
