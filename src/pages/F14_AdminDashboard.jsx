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
  const [blogArticles, setBlogArticles] = useState([])
  const [showBlogModal, setShowBlogModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState(null)
  const [success, setSuccess] = useState('')

  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFormation, setEditingFormation] = useState(null)
  const [showNewSession, setShowNewSession] = useState(false)
  const [showNewInscription, setShowNewInscription] = useState(false)

  const [newSession, setNewSession] = useState({
    id: null,
    formation_id: '',
    date_debut: '',
    date_fin: '',
    capacite_max: 20,
    lien_zoom: '',
    statut: 'ouverte'
  })

  const [newInscription, setNewInscription] = useState({
    id: null,
    profil_id: '',
    session_id: '',
    statut_inscription: 'en_attente',
    prenom_contact: '',
    nom_contact: '',
    email_contact: ''
  })

  const navigate = useNavigate()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return navigate('/connexion')
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

    const [formationsRes, sessionsRes, inscriptionsRes, dechargesRes, blogRes] = await Promise.all([
      supabase.from('formations').select('*').order('cree_le', { ascending: false }),
      supabase.from('sessions')
        .select(`
          *,
          formation:formations(appellation_commerciale)
        `)
        .order('date_debut', { ascending: false }),
      supabase.from('inscriptions')
        .select(`
          *,
          session:sessions(
            id,
            date_debut,
            date_fin,
            formation:formations(appellation_commerciale)
          )
        `)
        .order('created_at', { ascending: false }),
      supabase.from('decharges')
        .select(`id, inscription_id, numero_decharge, url_pdf, statut, created_at,
          inscription:inscriptions(id, prenom_contact, nom_contact, email_contact,
          session:sessions(formation:formations(appellation_commerciale)))`)
        .order('created_at', { ascending: false }),
      supabase.from('blog_articles').select('*').order('ordre', { ascending: true })
    ])

    if (formationsRes.error) setError(formationsRes.error.message)
    else setFormations(formationsRes.data)

    if (sessionsRes.error) setError(sessionsRes.error.message)
    else setSessions(sessionsRes.data)

    if (inscriptionsRes.error) setError(inscriptionsRes.error.message)
    else setInscriptions(inscriptionsRes.data)

    if (dechargesRes.error) setError(dechargesRes.error.message)
    else setDecharges(dechargesRes.data)
    if (blogRes.error) setError(blogRes.error.message)
    else setBlogArticles(blogRes.data)

    //const blogRes = await supabase.from('blog_articles').select('*').order('ordre', { ascending: true })
    //if (blogRes.error) setError(blogRes.error.message)
    //else setBlogArticles(blogRes.data)

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

      if (error) {
        console.error('Supabase error:', error)
        return setError(error.message)
      }

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
      .update(editingFormation)
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
    if (!newSession.formation_id) return setError('Il faut sélectionner une formation')

    const payload = {
      formation_id: newSession.formation_id,
      date_debut: newSession.date_debut ? new Date(newSession.date_debut).toISOString() : null,
      date_fin: newSession.date_fin ? new Date(newSession.date_fin).toISOString() : null,
      capacite_max: newSession.capacite_max,
      lien_zoom: newSession.lien_zoom || null,
      statut: 'ouverte'
    }

    if (newSession.id) {
      const { error } = await supabase.from('sessions').update(payload).eq('id', newSession.id)
      if (error) return setError(error.message)
    } else {
      const { error } = await supabase.from('sessions').insert([payload])
      if (error) {
        console.error(error)
        return setError(error.message)
      }
    }

    setNewSession({ id: null, formation_id: '', date_debut: '', date_fin: '', capacite_max: 20, lien_zoom: '', statut: 'ouverte' })
    setShowNewSession(false)
    fetchAllData()
  }

  const handleEditSession = (session) => {
    setNewSession({
      ...session,
      date_debut: session.date_debut?.split('T')[0],
      date_fin: session.date_fin?.split('T')[0]
    })
    setShowNewSession(true)
  }
  const handleDeleteSession = async (id) => {
    if (!confirm('Supprimer cette session?')) return
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchAllData()
  }

  const handleCreateInscription = async () => {
    if (!newInscription.session_id) return setError('Sélectionne une session')

    if (newInscription.id) {
      const { error } = await supabase.from('inscriptions').update(newInscription).eq('id', newInscription.id)
      if (error) return setError(error.message)
    } else {
      const { error } = await supabase.from('inscriptions').insert([newInscription])
      if (error) return setError(error.message)
    }

    setNewInscription({ id: null, profil_id: '', session_id: '', statut_inscription: 'en_attente', prenom_contact: '', nom_contact: '', email_contact: '' })
    setShowNewInscription(false)
    fetchAllData()
  }

  const handleEditInscription = (insc) => {
    setNewInscription(insc)
    setShowNewInscription(true)
  }

  const handleValiderInscription = async (inscriptionId) => {
    const { error } = await supabase
      .from('inscriptions')
      .update({ statut_inscription: 'confirmee' })
      .eq('id', inscriptionId)

    if (error) {
      setError(error.message)
    } else {
      fetchAllData()
    }
  }



  const handleEditDecharge = async (decharge) => {
    const newStatut = prompt('Nouveau statut: en_attente, valide, refuse', decharge.statut)
    if (!newStatut) return
    const { error } = await supabase.from('decharges').update({ statut: newStatut }).eq('id', decharge.id)
    if (error) setError(error.message)
    else fetchAllData()
  }

  const handleDeleteDecharge = async (id) => {
    if (!confirm('Supprimer cette décharge?')) return
    const { error } = await supabase.from('decharges').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchAllData()
  }
  const handleDeleteInscription = async (id) => {
    if (!confirm('Supprimer cette inscription?')) return
    const { error } = await supabase.from('inscriptions').delete().eq('id', id)
    if (error) setError(error.message)
    else fetchAllData()
  }



  const handleConfirmerDecharge = async (decharge) => {
    try {
      setError('')

      const { error: updateError } = await supabase
        .from('decharges')
        .update({ statut: 'valide' })
        .eq('id', decharge.id)
      if (updateError) throw updateError

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

      const pdfBlob = doc.output('blob')
      const fileName = `decharge-${decharge.numero_decharge}.pdf`

      const { error: uploadError } = await supabase.storage
        .from('decharges')
        .upload(fileName, pdfBlob, { contentType: 'application/pdf', upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('decharges').getPublicUrl(fileName)

      const { error: urlError } = await supabase
        .from('decharges')
        .update({ url_pdf: publicUrl }) // <- url_pdf partout
        .eq('id', decharge.id)
      if (urlError) throw urlError

      alert('Décharge validée et PDF généré')
      fetchAllData()

    } catch (err) {
      setError(err.message)
    }
  }

  // 3. SUPPRIME fetchBlogArticles ENTIEREMENT

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
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-lg">{error}</div>}

      <div className="border-b-2 border-[#1FA9A2] mb-6 overflow-x-auto">
        {['formations', 'sessions', 'inscriptions', 'decharges', 'blog'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 mr-2 rounded-t-lg font-semibold transition whitespace-nowrap ${activeTab === tab ? 'bg-[#1FA9A2] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                  code_pole: '', appellation_commerciale: '', titre_pedagogique: '', description: '',
                  duree_heures: 0, prix_fcfa: 0, image_couverture: '', statut: 'brouillon'
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
                        <button onClick={() => { setNewSession({ ...newSession, formation_id: f.id }); setShowNewSession(true) }}
                          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700" title="Ajouter session">
                          <Calendar size={16} />
                        </button>
                        <button onClick={() => { setEditingFormation(f); setShowEditModal(true) }}
                          className="p-2 bg-[#1FA9A2] text-white rounded hover:bg-[#0F3D3E]">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteFormation(f.id, f.appellation_commerciale)}
                          className="p-2 bg-red-600 text-white rounded hover:bg-red-700">
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
            <button onClick={() => { setNewSession({ id: null, formation_id: '', date_debut: '', date_fin: '', capacite_max: 20, lien_zoom: '', statut: 'ouverte' }); setShowNewSession(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">
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
                  <th className="p-3 text-left">Lien Zoom</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{s.formation?.appellation_commerciale}</td>
                    <td className="p-3">{new Date(s.date_debut).toLocaleDateString()} - {new Date(s.date_fin).toLocaleDateString()}</td>
                    <td className="p-3">{s.capacite_max}</td>
                    <td className="p-3 max-w-[200px] truncate">
                      {s.lien_zoom ? (
                        <div className="flex gap-2">
                          <a href={s.lien_zoom} target="_blank" className="text-[#1FA9A2] hover:underline text-sm">Ouvrir</a>
                          <button onClick={() => navigator.clipboard.writeText(s.lien_zoom)} className="text-gray-500 hover:text-gray-800 text-xs">Copier</button>
                        </div>
                      ) : <span className="text-gray-400 text-sm">Aucun</span>}
                    </td>
                    <td className="p-3">{s.statut}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEditSession(s)} className="p-2 bg-[#1FA9A2] text-white rounded hover:bg-[#0F3D3E]"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteSession(s.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#0F3D3E]">Inscriptions</h2>
            <button onClick={() => { setNewInscription({ id: null, profil_id: '', session_id: '', statut_inscription: 'en_attente', prenom_contact: '', nom_contact: '', email_contact: '' }); setShowNewInscription(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">
              <Plus size={18} />
              Ajouter Inscription
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F3D3E] text-white">
                <tr>
                  <th className="p-3 text-left">Étudiant</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Formation</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inscriptions.map(i => (
                  <tr key={i.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{i.profiles?.prenom || i.prenom_contact} {i.profiles?.nom || i.nom_contact}</td>
                    <td className="p-3 text-sm">{i.profiles?.email || i.email_contact}</td>
                    <td className="p-3">{i.session?.formation?.appellation_commerciale}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${i.statut_inscription === 'confirmee' ? 'bg-green-100 text-green-800' :
                        i.statut_inscription === 'en_attente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {i.statut_inscription}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-500">{new Date(i.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        {i.statut_inscription === 'en_attente' && (
                          <button onClick={() => handleValiderInscription(i.id)} className="p-2 bg-green-600 text-white rounded hover:bg-green-700"><Check size={16} /></button>
                        )}
                        <button onClick={() => handleEditInscription(i)} className="p-2 bg-[#1FA9A2] text-white rounded hover:bg-[#0F3D3E]"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteInscription(i.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 size={16} /></button>
                      </div>
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
          <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4">Décharges</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F3D3E] text-white">
                <tr>
                  <th className="p-3 text-left">Étudiant</th>
                  <th className="p-3 text-left">Formation</th>
                  <th className="p-3 text-left">Numéro</th>
                  <th className="p-3 text-left">Statut</th>
                  <th className="p-3 text-left">Actions</th>
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
                      <div className="flex gap-2">
                        {d.statut === 'en_attente' && (
                          <button onClick={() => handleConfirmerDecharge(d)} className="p-2 bg-green-600 text-white rounded hover:bg-green-700"><Check size={16} /></button>
                        )}
                        <button onClick={() => handleEditDecharge(d)} className="p-2 bg-[#1FA9A2] text-white rounded hover:bg-[#0F3D3E]"><Edit size={16} /></button>
                        <button onClick={() => handleDeleteDecharge(d.id)} className="p-2 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* BLOG */}
      {activeTab === 'blog' && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-[#0F3D3E]">Blog & Ressources</h2>
            <button onClick={() => { setEditingArticle({ titre: '', date: '', tag: 'POLICY IMPACT LAB', type: 'Podcast', excerpt: '', image_url: '', read_time: '', youtube_link: '', ordre: blogArticles.length, actif: true }); setShowBlogModal(true) }}
              className="flex items-center gap-2 px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">
              <Plus size={18} /> Nouvel Article
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0F3D3E] text-white">
                <tr><th className="p-3 text-left">Titre</th><th className="p-3 text-left">Tag</th><th className="p-3 text-left">Type</th><th className="p-3 text-left">Statut</th><th className="p-3 text-left">Actions</th></tr>
              </thead>
              <tbody>
                {blogArticles.map(a => (
                  <tr key={a.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-semibold">{a.titre}</td>
                    <td className="p-3 text-sm">{a.tag}</td>
                    <td className="p-3 text-sm">{a.type}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${a.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {a.actif ? 'Actif' : 'Masqué'}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button onClick={() => { setEditingArticle(a); setShowBlogModal(true) }} className="p-2 bg-[#1FA9A2] text-white rounded hover:bg-[#0F3D3E]"><Edit size={16} /></button>
                      <button onClick={async () => { if (confirm('Supprimer?')) { await supabase.from('blog_articles').delete().eq('id', a.id); fetchAllData() } }} className="p-2 bg-red-600 text-white rounded hover:bg-red-700"><Trash2 size={16} /></button>
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
            <h3 className="text-xl font-bold mb-4">{editingFormation.id ? 'Modifier' : 'Nouvelle'} Formation</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Code Pôle *" value={editingFormation.code_pole}
                onChange={e => setEditingFormation({ ...editingFormation, code_pole: e.target.value })} className="w-full p-3 border rounded-lg" />
              <input type="text" placeholder="Appellation commerciale *" value={editingFormation.appellation_commerciale}
                onChange={e => setEditingFormation({ ...editingFormation, appellation_commerciale: e.target.value })} className="w-full p-3 border rounded-lg" />
              <input type="text" placeholder="Titre pédagogique" value={editingFormation.titre_pedagogique || ''}
                onChange={e => setEditingFormation({ ...editingFormation, titre_pedagogique: e.target.value })} className="w-full p-3 border rounded-lg" />
              <textarea placeholder="Description" value={editingFormation.description || ''}
                onChange={e => setEditingFormation({ ...editingFormation, description: e.target.value })} className="w-full p-3 border rounded-lg" rows="3" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="Durée heures *" value={editingFormation.duree_heures || ''}
                  onChange={e => setEditingFormation({ ...editingFormation, duree_heures: parseInt(e.target.value) || 0 })} className="w-full p-3 border rounded-lg" />
                <input type="number" placeholder="Prix FCFA" value={editingFormation.prix_fcfa || ''}
                  onChange={e => setEditingFormation({ ...editingFormation, prix_fcfa: parseInt(e.target.value) || 0 })} className="w-full p-3 border rounded-lg" />
              </div>
              <input type="text" placeholder="URL Image couverture" value={editingFormation.image_couverture || ''}
                onChange={e => setEditingFormation({ ...editingFormation, image_couverture: e.target.value })} className="w-full p-3 border rounded-lg" />
              <select value={editingFormation.statut || 'brouillon'}
                onChange={e => setEditingFormation({ ...editingFormation, statut: e.target.value })} className="w-full p-3 border rounded-lg">
                <option value="brouillon">Brouillon</option>
                <option value="publiee">Publiée</option>
                <option value="archivee">Archivée</option>
              </select>
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
            <h3 className="text-xl font-bold mb-4">{newSession.id ? 'Modifier' : 'Nouvelle'} Session</h3>
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
              <select value={newSession.statut} onChange={e => setNewSession({ ...newSession, statut: e.target.value })} className="w-full p-3 border rounded-lg">
                <option value="ouverte">Ouverte</option>
                <option value="fermee">Fermée</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowNewSession(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Annuler</button>
              <button onClick={handleCreateSession} className="px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSCRIPTION */}
      {showNewInscription && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">{newInscription.id ? 'Modifier' : 'Ajouter'} Inscription</h3>
            <div className="space-y-4">
              <select value={newInscription.session_id} onChange={e => setNewInscription({ ...newInscription, session_id: e.target.value })} className="w-full p-3 border rounded-lg">
                <option value="">Sélectionne une session</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.formation?.appellation_commerciale} - {new Date(s.date_debut).toLocaleDateString()}</option>)}
              </select>
              <input type="text" placeholder="Prénom contact" value={newInscription.prenom_contact}
                onChange={e => setNewInscription({ ...newInscription, prenom_contact: e.target.value })} className="w-full p-3 border rounded-lg" />
              <input type="text" placeholder="Nom contact" value={newInscription.nom_contact}
                onChange={e => setNewInscription({ ...newInscription, nom_contact: e.target.value })} className="w-full p-3 border rounded-lg" />
              <input type="email" placeholder="Email contact" value={newInscription.email_contact}
                onChange={e => setNewInscription({ ...newInscription, email_contact: e.target.value })} className="w-full p-3 border rounded-lg" />
              <select value={newInscription.statut_inscription} onChange={e => setNewInscription({ ...newInscription, statut_inscription: e.target.value })} className="w-full p-3 border rounded-lg">
                <option value="en_attente">En attente</option>
                <option value="confirmee">Confirmée</option>
                <option value="annule">Annulée</option>
              </select>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => setShowNewInscription(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Annuler</button>
              <button onClick={handleCreateInscription} className="px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL BLOG */}
      {showBlogModal && editingArticle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto space-y-3">
            <h3 className="text-xl font-bold">{editingArticle.id ? 'Modifier' : 'Nouvel'} Article</h3>
            <input placeholder="Titre *" value={editingArticle.titre || ''} onChange={e => setEditingArticle({ ...editingArticle, titre: e.target.value })} className="w-full p-3 border rounded-lg" />
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Date ex: 22 mai 2026" value={editingArticle.date || ''} onChange={e => setEditingArticle({ ...editingArticle, date: e.target.value })} className="p-3 border rounded-lg" />
              <input placeholder="Temps lecture ex: 5 min" value={editingArticle.read_time || ''} onChange={e => setEditingArticle({ ...editingArticle, read_time: e.target.value })} className="p-3 border rounded-lg" />
              <select value={editingArticle.tag || ''} onChange={e => setEditingArticle({ ...editingArticle, tag: e.target.value })} className="p-3 border rounded-lg">
                <option value="">Pôle</option>{['DATA SCIENCE FACTORY', 'POLICY IMPACT LAB', 'STRATEGY & DELIVERY', 'ECONOMICS POWER HUB', 'LEADERSHIP & VOICE'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select value={editingArticle.type || 'Podcast'} onChange={e => setEditingArticle({ ...editingArticle, type: e.target.value })} className="p-3 border rounded-lg">
                {['Article', 'Podcast', 'Infographie', 'Événement'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <input placeholder="URL Image YouTube thumbnail" value={editingArticle.image_url || ''} onChange={e => setEditingArticle({ ...editingArticle, image_url: e.target.value })} className="w-full p-3 border rounded-lg" />
            <input placeholder="Lien YouTube" value={editingArticle.youtube_link || ''} onChange={e => setEditingArticle({ ...editingArticle, youtube_link: e.target.value })} className="w-full p-3 border rounded-lg" />
            <textarea placeholder="Résumé/Excerpt" value={editingArticle.excerpt || ''} onChange={e => setEditingArticle({ ...editingArticle, excerpt: e.target.value })} className="w-full p-3 border rounded-lg" rows="3" />
            <input type="number" placeholder="Ordre d'affichage" value={editingArticle.ordre || 0} onChange={e => setEditingArticle({ ...editingArticle, ordre: parseInt(e.target.value) || 0 })} className="w-full p-3 border rounded-lg" />
            <label className="flex items-center gap-2"><input type="checkbox" checked={editingArticle.actif} onChange={e => setEditingArticle({ ...editingArticle, actif: e.target.checked })} /> Article actif/visible</label>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowBlogModal(false)} className="px-4 py-2 bg-gray-600 text-white rounded-lg">Annuler</button>
              <button onClick={async () => {
                const { error } = editingArticle.id
                  ? await supabase.from('blog_articles').update(editingArticle).eq('id', editingArticle.id)
                  : await supabase.from('blog_articles').insert([editingArticle])
                if (error) setError(error.message)
                else { setShowBlogModal(false); setEditingArticle(null); fetchAllData() }
              }} className="px-4 py-2 bg-[#8DC63F] text-[#0F3D3E] rounded-lg font-semibold">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}