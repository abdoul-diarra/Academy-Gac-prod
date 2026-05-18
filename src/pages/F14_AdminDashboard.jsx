import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import jsPDF from 'jspdf'
import { Loader2, LogOut, Plus, Edit, Trash2, Check, Calendar } from 'lucide-react'

export default function F14_AdminDashboard() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('formations')

  const [formations, setFormations] = useState([])
  const [sessions, setSessions] = useState([])
  const [inscriptions, setInscriptions] = useState([])
  const [decharges, setDecharges] = useState([])

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFormation, setEditingFormation] = useState(null)
  const [showNewSession, setShowNewSession] = useState(false)
  const [newSession, setNewSession] = useState({
    formation_id: '',
    date_debut: '',
    date_fin: '',
    capacite_max: 20,
    lien_zoom: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return navigate('/connexion')
    }

    setUser(user)
    fetchAllData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/connexion')
  }

  const fetchAllData = async () => {
    setLoading(true)
    setError('')

    const [formationsRes, sessionsRes, inscriptionsRes, dechargesRes] = await Promise.all([
      supabase.from('formations').select('*').order('cree_le', { ascending: false }),

      supabase.from('sessions')
        .select('*, formations(appellation_commerciale)')
        .order('date_debut', { ascending: false }),

      supabase.from('inscriptions')
        .select(`
          *,
          session:sessions(
            formation:formations(appellation_commerciale)
          )
        `)
        .order('created_at', { ascending: false }),

      supabase.from('decharges')
        .select(`
          *,
          inscription:inscriptions(
            id,
            prenom_contact,
            nom_contact,
            email_contact,
            session:sessions(
              formation:formations(appellation_commerciale)
            )
          )
        `)
        .order('created_at', { ascending: false })
    ])

    if (formationsRes.error) setError(formationsRes.error.message)
    else setFormations(formationsRes.data)

    if (sessionsRes.error) setError(sessionsRes.error.message)
    else setSessions(sessionsRes.data)

    if (inscriptionsRes.error) setError(inscriptionsRes.error.message)
    else setInscriptions(inscriptionsRes.data)

    if (dechargesRes.error) setError(dechargesRes.error.message)
    else setDecharges(dechargesRes.data)

    setLoading(false)
  }

  const handleCreateFormation = async () => {
    setError('')

    if (!editingFormation?.code_pole || !editingFormation?.appellation_commerciale || !editingFormation?.duree_heures) {
      return setError('Code Pôle, Appellation et Durée sont obligatoires')
    }

    try {
      const { data: formation, error } = await supabase
        .from('formations')
        .insert([{
          code_pole: editingFormation.code_pole,
          appellation_commerciale: editingFormation.appellation_commerciale,
          titre_pedagogique: editingFormation.titre_pedagogique || null,
          description: editingFormation.description || null,
          duree_heures: editingFormation.duree_heures,
          prix_fcfa: editingFormation.prix_fcfa || null,
          image_couverture: editingFormation.image_couverture || null,
          statut: editingFormation.statut || 'brouillon'
        }])
        .select()
        .single()

      if (error) return setError(error.message)

      // Création session auto J+7 à J+14
      const dateDebut = new Date()
      dateDebut.setDate(dateDebut.getDate() + 7)
      const dateFin = new Date()
      dateFin.setDate(dateFin.getDate() + 14)

      await supabase.from('sessions').insert([{
        formation_id: formation.id,
        date_debut: dateDebut.toISOString().split('T')[0],
        date_fin: dateFin.toISOString().split('T')[0],
        capacite_max: 20,
        statut: 'ouverte'
      }])

      setShowEditModal(false)
      setEditingFormation(null)
      fetchAllData()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateFormation = async () => {
    const { error } = await supabase
      .from('formations')
      .update({
        code_pole: editingFormation.code_pole,
        appellation_commerciale: editingFormation.appellation_commerciale,
        titre_pedagogique: editingFormation.titre_pedagogique,
        description: editingFormation.description,
        duree_heures: editingFormation.duree_heures,
        prix_fcfa: editingFormation.prix_fcfa,
        image_couverture: editingFormation.image_couverture,
        statut: editingFormation.statut
      })
      .eq('id', editingFormation.id)

    if (error) setError(error.message)
    else {
      setShowEditModal(false)
      setEditingFormation(null)
      fetchAllData()
    }
  }

  const handleDeleteFormation = async (id, nom) => {
    if (!confirm(`Supprimer "${nom}"? Les sessions et inscriptions liées seront aussi supprimées.`)) return

    const { error } = await supabase.from('formations').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchAllData()
  }

  const handleCreateSession = async () => {
    const { error } = await supabase.from('sessions').insert([{
      ...newSession,
      statut: 'ouverte'
    }])

    if (error) setError(error.message)
    else {
      setNewSession({ formation_id: '', date_debut: '', date_fin: '', capacite_max: 20, lien_zoom: '' })
      setShowNewSession(false)
      fetchAllData()
    }
  }

  const handleValiderInscription = async (id) => {
    const { error } = await supabase
      .from('inscriptions')
      .update({ statut: 'paye' })
      .eq('id', id)

    if (error) setError(error.message)
    else fetchAllData()
  }

  const handleConfirmerDecharge = async (decharge) => {
    const { error } = await supabase
      .from('paiements')
      .update({ statut: 'valide' })
      .eq('id', decharge.paiement_id)

    if (error) return setError(error.message)

    const doc = new jsPDF()
    const nomComplet = `${decharge.inscription?.prenom_contact} ${decharge.inscription?.nom_contact}`

    doc.setFontSize(22)
    doc.text('CERTIFICAT GAC ACADEMY', 105, 30, { align: 'center' })
    doc.setFontSize(16)
    doc.text('Décharge de formation', 105, 40, { align: 'center' })
    doc.setFontSize(12)
    doc.text(`Décerné à : ${nomComplet}`, 20, 80)
    doc.text(`Numéro : ${decharge.numero_decharge}`, 20, 100)
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 20, 110)
    doc.save(`Decharge_${decharge.numero_decharge}.pdf`)

    fetchAllData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#1FA9A2]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#0F3D3E]">GAC ACADEMY - Admin</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <div className="border-b-2 border-[#1FA9A2] mb-6 overflow-x-auto">
        {['formations', 'sessions', 'inscriptions', 'decharges'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 mr-2 rounded-t-lg font-semibold transition whitespace-nowrap ${activeTab === tab
              ? 'bg-[#1FA9A2] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* FORMATIONS */}
      {activeTab === 'formations' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-[#0F3D3E]">Formations</h2>
              <p className="text-gray-600">{formations.length} formations</p>
            </div>
            <button
              onClick={() => {
                setEditingFormation({
                  code_pole: '',
                  appellation_commerciale: '',
                  titre_pedagogique: '',
                  description: '',
                  duree_heures: 0,
                  prix_fcfa: 0,
                  image_couverture: '',
                  statut: 'brouillon'
                })
                setShowEditModal(true)
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold hover:bg-[#8DC63F]/90"
            >
              <Plus size={18} />
              Nouvelle Formation
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F3D3E] text-white">
                <tr>
                  <th className="p-3 text-left">Code Pôle</th>
                  <th className="p-3 text-left">Appellation</th>
                  <th className="p-3 text-left">Prix</th>
                  <th className="p-3 text-left">Durée</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {formations.map(f => (
                  <tr key={f.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-mono text-sm">{f.code_pole}</td>
                    <td className="p-3 font-semibold">{f.appellation_commerciale}</td>
                    <td className="p-3 font-bold">{f.prix_fcfa?.toLocaleString() || '-'} FCFA</td>
                    <td className="p-3">{f.duree_heures}h</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${f.statut === 'publiee' ? 'bg-green-100 text-green-800' :
                        f.statut === 'brouillon' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {f.statut}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setNewSession({ ...newSession, formation_id: f.id })
                            setShowNewSession(true)
                          }}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="Ajouter session"
                        >
                          <Calendar size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingFormation(f); setShowEditModal(true) }}
                          className="p-2 bg-[#1FA9A2] text-white rounded hover:bg-[#0F3D3E]"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteFormation(f.id, f.appellation_commerciale)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#0F3D3E]">Sessions</h2>
            <button
              onClick={() => setShowNewSession(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold"
            >
              <Plus size={18} />
              Nouvelle Session
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F3D3E] text-white">
                <tr>
                  <th className="p-3 text-left">Formation</th>
                  <th className="p-3 text-left">Dates</th>
                  <th className="p-3 text-left">Capacité</th>
                  <th className="p-3 text-left">Statut</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{s.formations?.appellation_commerciale}</td>
                    <td className="p-3">{new Date(s.date_debut).toLocaleDateString()} - {new Date(s.date_fin).toLocaleDateString()}</td>
                    <td className="p-3">{s.capacite_max}</td>
                    <td className="p-3">{s.statut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSCRIPTIONS */}
      {activeTab === 'inscriptions' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4">Inscriptions</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F3D3E] text-white">
                <tr>
                  <th className="p-3 text-left">Étudiant</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Formation</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map(i => (
                  <tr key={i.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{i.prenom_contact} {i.nom_contact}</td>
                    <td className="p-3 text-sm">{i.email_contact}</td>
                    <td className="p-3">{i.session?.formation?.appellation_commerciale}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${i.statut === 'paye' ? 'bg-green-100 text-green-800' :
                        i.statut === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {i.statut}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{new Date(i.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3">
                      {i.statut === 'en_attente' && (
                        <button
                          onClick={() => handleValiderInscription(i.id)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          <Check size={14} />
                          Valider
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DECHARGES */}
      {activeTab === 'decharges' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4">Décharges à valider</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F3D3E] text-white">
                <tr>
                  <th className="p-3 text-left">Étudiant</th>
                  <th className="p-3 text-left">Formation</th>
                  <th className="p-3 text-left">Numéro</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {decharges.map(d => (
                  <tr key={d.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{d.inscription?.prenom_contact} {d.inscription?.nom_contact}</td>
                    <td className="p-3">{d.inscription?.session?.formation?.appellation_commerciale}</td>
                    <td className="p-3 font-mono text-sm">{d.numero_decharge}</td>
                    <td className="p-3">{d.statut}</td>
                    <td className="p-3">
                      {d.statut === 'en_attente' && (
                        <button
                          onClick={() => handleConfirmerDecharge(d)}
                          className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          <Check size={16} />
                          Valider
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FORMATION */}
      {showEditModal && editingFormation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingFormation.id ? 'Modifier' : 'Nouvelle'} Formation
            </h3>
            <div className="space-y-4">
              <input type="text" placeholder="Code Pôle *" value={editingFormation.code_pole}
                onChange={e => setEditingFormation({ ...editingFormation, code_pole: e.target.value })}
                className="w-full p-3 border rounded-lg" />

              <input type="text" placeholder="Appellation commerciale *" value={editingFormation.appellation_commerciale}
                onChange={e => setEditingFormation({ ...editingFormation, appellation_commerciale: e.target.value })}
                className="w-full p-3 border rounded-lg" />

              <input type="text" placeholder="Titre pédagogique" value={editingFormation.titre_pedagogique || ''}
                onChange={e => setEditingFormation({ ...editingFormation, titre_pedagogique: e.target.value })}
                className="w-full p-3 border rounded-lg" />

              <textarea placeholder="Description" value={editingFormation.description || ''}
                onChange={e => setEditingFormation({ ...editingFormation, description: e.target.value })}
                className="w-full p-3 border rounded-lg" rows="3" />

              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Durée heures *" value={editingFormation.duree_heures || ''}
                  onChange={e => setEditingFormation({ ...editingFormation, duree_heures: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg" />

                <input type="number" placeholder="Prix FCFA" value={editingFormation.prix_fcfa || ''}
                  onChange={e => setEditingFormation({ ...editingFormation, prix_fcfa: parseInt(e.target.value) || 0 })}
                  className="w-full p-3 border rounded-lg" />
              </div>

              <input type="text" placeholder="URL Image couverture" value={editingFormation.image_couverture || ''}
                onChange={e => setEditingFormation({ ...editingFormation, image_couverture: e.target.value })}
                className="w-full p-3 border rounded-lg" />

              <select value={editingFormation.statut || 'brouillon'}
                onChange={e => setEditingFormation({ ...editingFormation, statut: e.target.value })}
                className="w-full p-3 border rounded-lg">
                <option value="brouillon">Brouillon</option>
                <option value="publiee">Publiée</option>
                <option value="archivee">Archivée</option>
              </select>

              <p className="text-xs text-gray-500">* Champs obligatoires</p>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Annuler</button>
              <button onClick={editingFormation.id ? handleUpdateFormation : handleCreateFormation} className="px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">
                {editingFormation.id ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SESSION */}
      {showNewSession && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Nouvelle Session</h3>
            <div className="space-y-4">
              <select value={newSession.formation_id} onChange={e => setNewSession({ ...newSession, formation_id: e.target.value })} className="w-full p-3 border rounded-lg">
                <option value="">Sélectionne une formation</option>
                {formations.map(f => <option key={f.id} value={f.id}>{f.appellation_commerciale}</option>)}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" value={newSession.date_debut} onChange={e => setNewSession({ ...newSession, date_debut: e.target.value })} className="w-full p-3 border rounded-lg" />
                <input type="date" value={newSession.date_fin} onChange={e => setNewSession({ ...newSession, date_fin: e.target.value })} className="w-full p-3 border rounded-lg" />
              </div>
              <input type="number" placeholder="Capacité max" value={newSession.capacite_max} onChange={e => setNewSession({ ...newSession, capacite_max: parseInt(e.target.value) })} className="w-full p-3 border rounded-lg" />
              <input type="url" placeholder="Lien Zoom" value={newSession.lien_zoom} onChange={e => setNewSession({ ...newSession, lien_zoom: e.target.value })} className="w-full p-3 border rounded-lg" />
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowNewSession(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Annuler</button>
              <button onClick={handleCreateSession} className="px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}