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

export default function PostList() {
  const [posts, setPosts]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [adding, setAdding]     = useState(false)
  const [editId, setEditId]     = useState(null)
  const [form, setForm]         = useState({ title: '', content: '', userId: '' })
  const [editForm, setEditForm] = useState({ title: '', content: '' })

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch('/posts')
      setPosts(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAdd = async () => {
    try {
      await apiFetch('/posts', {
        method: 'POST',
        body: { ...form, userId: Number(form.userId) },
      })
      setForm({ title: '', content: '', userId: '' })
      setAdding(false)
      load()
    } catch (e) { alert(e.message) }
  }

  const handleEdit = async (id) => {
    try {
      await apiFetch(`/posts/${id}`, { method: 'PUT', body: editForm })
      setEditId(null)
      load()
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      await apiFetch(`/posts/${id}`, { method: 'DELETE' })
      load()
    } catch (e) { alert(e.message) }
  }

  if (loading) return <p style={{ color: '#6B7280' }}>Loading posts…</p>
  if (error)   return <p style={{ color: '#DC2626' }}>Error: {error}</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Posts <span style={{ color: '#9CA3AF', fontWeight: 400, fontSize: 14 }}>({posts.length})</span></h2>
        {!adding && <button style={btn()} onClick={() => setAdding(true)}>+ Add Post</button>}
      </div>

      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Title</th>
              <th style={th}>Content</th>
              <th style={th}>User ID</th>
              <th style={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adding && (
              <tr style={{ background: '#EFF6FF' }}>
                <td style={td}>—</td>
                <td style={td}><input style={input} placeholder="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></td>
                <td style={td}><input style={input} placeholder="Content" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></td>
                <td style={td}><input style={{ ...input, width: 70 }} type="number" placeholder="1" value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))} /></td>
                <td style={td}>
                  <button style={{ ...btn(), marginRight: 6 }} onClick={handleAdd}>Save</button>
                  <button style={btn('#6B7280')} onClick={() => { setAdding(false); setForm({ title: '', content: '', userId: '' }) }}>Cancel</button>
                </td>
              </tr>
            )}
            {posts.map((p, i) => (
              <tr key={p.id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                <td style={td}>{p.id}</td>
                {editId === p.id ? (
                  <>
                    <td style={td}><input style={input} value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))} /></td>
                    <td style={td}><input style={input} value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))} /></td>
                    <td style={td}>{p.userId}</td>
                    <td style={td}>
                      <button style={{ ...btn(), marginRight: 6 }} onClick={() => handleEdit(p.id)}>Save</button>
                      <button style={btn('#6B7280')} onClick={() => setEditId(null)}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={td}>{p.title}</td>
                    <td style={{ ...td, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.content}</td>
                    <td style={td}>{p.userId}</td>
                    <td style={td}>
                      <button style={{ ...btn('#374151'), marginRight: 6 }} onClick={() => { setEditId(p.id); setEditForm({ title: p.title, content: p.content }) }}>Edit</button>
                      <button style={btn('#DC2626')} onClick={() => handleDelete(p.id, p.title)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
            {posts.length === 0 && !adding && (
              <tr><td colSpan={5} style={{ ...td, textAlign: 'center', color: '#9CA3AF' }}>No posts yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
