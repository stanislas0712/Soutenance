import { useState, useEffect } from 'react'
import { apiFetch } from '../api.js'

const th = { padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 700,
  color: '#6B7280', textTransform: 'uppercase', letterSpacing: '.5px', background: '#F9FAFB' }
const td = { padding: '11px 14px', fontSize: 14, color: '#374151', borderBottom: '1px solid #F3F4F6' }
const btn = (color = '#2563EB') => ({
  padding: '5px 12px', borderRadius: 4, border: 'none', cursor: 'pointer',
  background: color, color: '#fff', fontWeight: 600, fontSize: 13,
})
const input = {
  border: '1px solid #D1D5DB', padding: '6px 10px', borderRadius: 4, fontSize: 14, width: '100%',
}

export default function UserList() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [adding, setAdding]     = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({ name: '', email: '' })
  const [editForm, setEditForm] = useState({ name: '', email: '' })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch('/users')
      setUsers(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    try {
      await apiFetch('/users', { method: 'POST', body: form })
      setForm({ name: '', email: '' })
      setAdding(false)
      load()
    } catch (e) { alert(e.message) }
  }

  const handleEdit = async (id) => {
    try {
      await apiFetch(`/users/${id}`, { method: 'PUT', body: editForm })
      setEditId(null)
      load()
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return
    try {
      await apiFetch(`/users/${id}`, { method: 'DELETE' })
      load()
    } catch (e) { alert(e.message) }
  }

  if (loading) return <p style={{ color: '#6B7280' }}>Loading users…</p>
  if (error)   return <p style={{ color: '#DC2626' }}>Error: {error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Users <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: 14 }}>({users.length})</span></h2>
        {!adding && <button style={btn()} onClick={() => setAdding(true)}>+ Add User</button>}
      </div>

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Add row */}
            {adding && (
              <tr style={{ background: '#EFF6FF' }}>
                <td style={td}>—</td>
                <td style={td}><input style={input} placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></td>
                <td style={td}><input style={input} placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></td>
                <td style={td}>
                  <button style={{ ...btn(), marginRight: 6 }} onClick={handleAdd}>Save</button>
                  <button style={btn('#6B7280')} onClick={() => { setAdding(false); setForm({ name: '', email: '' }) }}>Cancel</button>
                </td>
              </tr>
            )}
            {users.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={td}>{u.id}</td>
                {editId === u.id ? (
                  <>
                    <td style={td}><input style={input} value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} /></td>
                    <td style={td}><input style={input} value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} /></td>
                    <td style={td}>
                      <button style={{ ...btn(), marginRight: 6 }} onClick={() => handleEdit(u.id)}>Save</button>
                      <button style={btn('#6B7280')} onClick={() => setEditId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={td}>{u.name}</td>
                    <td style={td}>{u.email}</td>
                    <td style={td}>
                      <button style={{ ...btn('#374151'), marginRight: 6 }} onClick={() => { setEditId(u.id); setEditForm({ name: u.name, email: u.email }) }}>Edit</button>
                      <button style={btn('#DC2626')} onClick={() => handleDelete(u.id, u.name)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {users.length === 0 && !adding && (
              <tr><td colSpan={4} style={{ ...td, textAlign: 'center', color: '#9CA3AF' }}>No users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
