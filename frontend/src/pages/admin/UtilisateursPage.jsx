import { useEffect, useState, useMemo } from 'react'
import { getUtilisateurs, createUtilisateur, updateUtilisateur, deleteUtilisateur, adminResetPassword } from '../../api/accounts'
import { Plus, KeyRound, Trash2, UserCheck, UserX, Building2, Search, X } from 'lucide-react'
import { RoleBadge } from '../../components/StatusBadge'

const ROLES = ['ADMINISTRATEUR', 'GESTIONNAIRE', 'COMPTABLE']

export default function UtilisateursPage() {
  const [users,      setUsers]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)   // null | 'create' | 'resetPwd'
  const [targetUser, setTargetUser] = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [success,    setSuccess]    = useState('')
  const [createForm, setCreateForm] = useState({ email: '', matricule: '', nom: '', prenom: '', role: 'GESTIONNAIRE', password: '' })
  const [pwdForm,    setPwdForm]    = useState({ nouveau_password: '', confirmer: '' })
  const [search,     setSearch]     = useState('')
  const [filterRole, setFilterRole] = useState('')
  const [filterActif, setFilterActif] = useState('')

  const load = () => {
    setLoading(true)
    getUtilisateurs()
      .then(u => setUsers(u.data.results ?? u.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    try {
      const payload = { ...createForm }
      if (!payload.departement) delete payload.departement
      await createUtilisateur(payload)
      setModal(null)
      setCreateForm({ email: '', matricule: '', nom: '', prenom: '', role: 'GESTIONNAIRE', password: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Erreur serveur')
    } finally { setSaving(false) }
  }

  const handleToggle = async (user) => {
    try {
      await updateUtilisateur(user.id, { actif: !user.actif })
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Erreur')
    }
  }

  const handleDelete = async (user) => {
    if (!confirm(`Supprimer l'utilisateur ${user.prenom} ${user.nom} ? Cette action est irréversible.`)) return
    try {
      await deleteUtilisateur(user.id)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Impossible de supprimer cet utilisateur.')
    }
  }

  const openResetPwd = (user) => {
    setTargetUser(user)
    setPwdForm({ nouveau_password: '', confirmer: '' })
    setError(''); setSuccess('')
    setModal('resetPwd')
  }

  const handleResetPwd = async (e) => {
    e.preventDefault(); setError(''); setSaving(true)
    if (pwdForm.nouveau_password !== pwdForm.confirmer) {
      setError('Les mots de passe ne correspondent pas.')
      setSaving(false); return
    }
    try {
      await adminResetPassword(targetUser.id, { nouveau_password: pwdForm.nouveau_password })
      setSuccess(`Mot de passe de ${targetUser.prenom} ${targetUser.nom} réinitialisé.`)
      setPwdForm({ nouveau_password: '', confirmer: '' })
      setTimeout(() => { setModal(null); setSuccess('') }, 2000)
    } catch (err) {
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Erreur')
    } finally { setSaving(false) }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    return users.filter(u => {
      if (q && !(
        u.prenom?.toLowerCase().includes(q) ||
        u.nom?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.matricule?.toLowerCase().includes(q) ||
        u.departement_detail?.nom?.toLowerCase().includes(q)
      )) return false
      if (filterRole && u.role !== filterRole) return false
      if (filterActif === 'actif' && !u.actif) return false
      if (filterActif === 'inactif' && u.actif) return false
      return true
    })
  }, [users, search, filterRole, filterActif])

  const hasFilters = search || filterRole || filterActif

  if (loading) return <div className="page-loader"><div className="spinner" /></div>

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">
            {filtered.length} / {users.length} compte{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setCreateForm({ email: '', matricule: '', nom: '', prenom: '', role: 'GESTIONNAIRE', password: '' }); setError(''); setModal('create') }}
          className="btn btn-primary btn-md gap-[7px]"
        >
          <Plus size={16} strokeWidth={2.5} /> Nouvel utilisateur
        </button>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="flex flex-wrap gap-3 mb-5 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[340px]">
          <Search size={15} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, matricule…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: 34, height: 38, fontSize: 13 }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtre rôle */}
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="form-select"
          style={{ height: 38, fontSize: 13, minWidth: 160 }}
        >
          <option value="">Tous les rôles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        {/* Filtre statut */}
        <select
          value={filterActif}
          onChange={e => setFilterActif(e.target.value)}
          className="form-select"
          style={{ height: 38, fontSize: 13, minWidth: 140 }}
        >
          <option value="">Tous les statuts</option>
          <option value="actif">Actifs</option>
          <option value="inactif">Inactifs</option>
        </select>

        {/* Réinitialiser */}
        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilterRole(''); setFilterActif('') }}
            className="btn btn-secondary btn-sm gap-[5px]"
          >
            <X size={13} /> Réinitialiser
          </button>
        )}
      </div>

      {/* Grille utilisateurs */}
      <div className="grid gap-[14px]" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">
            Aucun utilisateur ne correspond à votre recherche.
          </div>
        )}
        {filtered.map(u => (
          <div
            key={u.id}
            className="card"
            style={{ opacity: u.actif ? 1 : 0.65 }}
          >
            {/* Avatar + nom */}
            <div className="flex items-center gap-3 mb-[14px]">
              <div
                className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-white font-bold text-[16px]"
                style={{
                  background: u.actif
                    ? 'linear-gradient(135deg, var(--color-primary-400), var(--color-primary-700))'
                    : 'var(--color-gray-300)',
                }}
              >
                {(u.prenom?.[0] || u.email[0]).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-[7px]">
                  <span className="font-bold text-[14px] overflow-hidden text-ellipsis whitespace-nowrap text-gray-900">
                    {u.prenom} {u.nom}
                  </span>
                  {!u.actif && (
                    <span className="text-[9px] font-bold px-[6px] py-[1px] rounded-[20px] bg-[#E5E7EB] text-[#6B7280] shrink-0 tracking-[.3px]">
                      INACTIF
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-[#9CA3AF] overflow-hidden text-ellipsis whitespace-nowrap">
                  {u.email}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-[7px] flex-wrap mb-[10px]">
              <RoleBadge role={u.role} />
              {u.matricule && (
                <span className="px-[10px] py-[3px] rounded-[20px] text-[11px] font-semibold bg-[#F3F4F6] text-[#4B5563] font-mono">
                  {u.matricule}
                </span>
              )}
            </div>

            {u.departement_detail?.nom && (
              <div className="flex items-center gap-[6px] mb-[14px] text-[12px] text-[#6B7280]">
                <Building2 size={12} strokeWidth={2} />
                {u.departement_detail.nom}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-[6px] pt-3 border-t border-[#F3F4F6]">
              <button
                onClick={() => handleToggle(u)}
                className={`btn btn-sm flex-1 gap-[5px] ${u.actif ? 'btn-warning' : 'btn-success'}`}
              >
                {u.actif
                  ? <><UserX  size={12} strokeWidth={2} /> Désactiver</>
                  : <><UserCheck size={12} strokeWidth={2} /> Activer</>
                }
              </button>
              <button
                onClick={() => openResetPwd(u)}
                className="btn btn-secondary btn-sm flex-1 gap-[5px]"
              >
                <KeyRound size={12} strokeWidth={2} /> Mot de passe
              </button>
              <button
                onClick={() => handleDelete(u)}
                className="btn btn-danger btn-sm gap-[5px]"
                title="Supprimer"
              >
                <Trash2 size={12} strokeWidth={2} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal création */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-panel max-w-[500px]" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-display font-bold text-[15px]">Créer un utilisateur</h2>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="grid grid-cols-2 gap-[14px]">
                  <div>
                    <label className="form-label">Prénom</label>
                    <input className="form-input" required value={createForm.prenom} onChange={e => setCreateForm(f => ({ ...f, prenom: e.target.value }))} />
                  </div>
                  <div>
                    <label className="form-label">Nom</label>
                    <input className="form-input" required value={createForm.nom} onChange={e => setCreateForm(f => ({ ...f, nom: e.target.value }))} />
                  </div>
                </div>
                <div className="mt-[14px]">
                  <label className="form-label">Email</label>
                  <input className="form-input" type="email" required value={createForm.email} onChange={e => setCreateForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="mt-[14px]">
                  <label className="form-label">Matricule</label>
                  <input className="form-input" required value={createForm.matricule} onChange={e => setCreateForm(f => ({ ...f, matricule: e.target.value }))} />
                </div>
                <div className="mt-[14px]">
                  <label className="form-label">Rôle</label>
                  <select className="form-select" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="mt-[14px]">
                  <label className="form-label">Mot de passe temporaire</label>
                  <input className="form-input" type="password" required minLength={4} value={createForm.password} onChange={e => setCreateForm(f => ({ ...f, password: e.target.value }))} placeholder="Minimum 4 caractères" />
                </div>
                {error && <p className="text-[#DC2626] text-[12px] mt-[10px]">{error}</p>}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(null)} className="btn btn-secondary btn-md">Annuler</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-md">
                  {saving ? <><span className="spinner-sm" /> Création…</> : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal réinitialisation mot de passe */}
      {modal === 'resetPwd' && targetUser && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-panel max-w-[440px]" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="font-display font-bold text-[15px]">Réinitialiser le mot de passe</h2>
            </div>
            <form onSubmit={handleResetPwd}>
              <div className="modal-body">
                <div className="mb-[18px] px-[14px] py-[10px] rounded-[9px] bg-[#EFF6FF] border border-[#BFDBFE] text-[13px] text-[#1D4ED8]">
                  Utilisateur : <strong>{targetUser.prenom} {targetUser.nom}</strong> ({targetUser.email})
                </div>
                <div className="mb-[14px]">
                  <label className="form-label">Nouveau mot de passe</label>
                  <input className="form-input" type="password" required minLength={8} value={pwdForm.nouveau_password}
                    onChange={e => setPwdForm(f => ({ ...f, nouveau_password: e.target.value }))} placeholder="Minimum 8 caractères" />
                </div>
                <div>
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input className="form-input" type="password" required value={pwdForm.confirmer}
                    onChange={e => setPwdForm(f => ({ ...f, confirmer: e.target.value }))} placeholder="••••••••" />
                </div>
                {error   && <p className="text-[#DC2626]  text-[12px] mt-[10px]">{error}</p>}
                {success && <p className="text-[#16A34A] text-[12px] mt-[10px]">{success}</p>}
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setModal(null)} className="btn btn-secondary btn-md">Annuler</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-md">
                  {saving ? <><span className="spinner-sm" /> Réinitialisation…</> : 'Réinitialiser'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
