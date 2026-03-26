const BASE = '/api'

export async function apiFetch(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message || 'Request failed')
  return json.data
}
