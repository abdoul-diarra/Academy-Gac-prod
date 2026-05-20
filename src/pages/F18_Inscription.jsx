import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Loader2, AlertCircle, Calendar, Clock, Shield, ArrowLeft } from 'lucide-react'

export default function F18_Inscription() {
    const { formationId, sessionId } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [formation, setFormation] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const [formData, setFormData] = useState({
        prenom: '',
        nom: '',
        email: user?.email || '',
        telephone: '',
        methode_paiement: 'wave',
        reference_paiement: ''
    })

    useEffect(() => {
        loadData()
    }, [sessionId]) // <-- corrigé

    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }))
        }
    }, [user?.email])

    async function loadData() {
        try {
            setLoading(true)
            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select(`
    *,
    formation:formations(
      id,
      code_pole,
      appellation_commerciale,
      titre_pedagogique,
      description,
      duree_heures,
      prix_fcfa,
      image_couverture,
      statut
    )
  `)
                .eq('id', sessionId)
                .single()

            console.log('sessionError:', sessionError) // <-- ajoute ça
            console.log('sessionData:', sessionData)

            if (sessionError || !sessionData) {
                setError(sessionError?.message || 'Session introuvable')
                setLoading(false)
                return
            }

            setSession(sessionData)
            setFormation(sessionData.formation)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setError(err.message)
            setLoading(false)
        }
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        try {
            const { data: existing } = await supabase
                .from('inscriptions')
                .select('id')
                .eq('session_id', sessionId)
                .eq('user_id', user.id)
                .maybeSingle()

            if (existing) {
                navigate(`/confirmation/${existing.id}`)
                return
            }

            const numero_decharge = `GAC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

            const { data: inscription, error } = await supabase
                .from('inscriptions')
                .insert({
                    session_id: sessionId, // <-- corrigé
                    user_id: user.id,
                    prenom_contact: formData.prenom,
                    nom_contact: formData.nom,
                    email_contact: formData.email,
                    telephone_contact: formData.telephone,
                    methode_paiement: formData.methode_paiement,
                    reference_transaction: formData.reference_paiement,
                    montant: formation.prix_fcfa,
                    numero_decharge: numero_decharge,
                    statut: 'en_attente',
                    statut_paiement: 'en_attente'
                })
                .select()
                .single()

            if (error) throw error
            navigate(`/confirmation/${inscription.id}`)

        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    function formatDate(dateString) {
        if (!dateString) return 'Date à confirmer'
        return new Date(dateString).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
                <Loader2 size={40} className="animate-spin text-[#1FA9A2] mx-auto" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-white border-red-200 rounded-2xl p-8 max-w-md w-full shadow-lg">
                    <AlertCircle size={28} className="text-red-600 mb-4" />
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link to="/formations" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FA9A2] text-white rounded-xl hover:bg-[#0F3D3E] transition font-medium">
                        <ArrowLeft size={18} />
                        Retour aux formations
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#F8FAF9] to-white py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to="/formations" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1FA9A2] mb-6 transition">
                    <ArrowLeft size={16} />
                    Retour aux formations
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#0F3D3E] to-[#1A5A5B] text-white p-8 md:p-10">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{formation?.appellation_commerciale}</h1>
                        <p className="text-gray-200 text-lg mb-6">{formation?.titre_pedagogique}</p>

                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <Calendar size={20} className="text-[#8DC63F]" />
                                <div>
                                    <p className="text-xs text-gray-300">Date</p>
                                    <p className="font-semibold text-sm">{formatDate(session?.date_debut)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <Clock size={20} className="text-[#8DC63F]" />
                                <div>
                                    <p className="text-xs text-gray-300">Durée</p>
                                    <p className="font-semibold text-sm">{formation?.duree_heures}h</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end bg-[#8DC63F] rounded-xl p-4">
                                <div className="text-[#0F3D3E]">
                                    <p className="text-xs font-medium">Prix</p>
                                    <p className="text-2xl font-bold">{formation?.prix_fcfa?.toLocaleString('fr-FR')} FCFA</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                        <h2 className="text-2xl font-bold text-[#0F3D3E] flex items-center gap-2">
                            <Shield size={20} className="text-[#1FA9A2]" />
                            Finaliser l'inscription
                        </h2>

                        <div className="grid md:grid-cols-2 gap-5">
                            <input type="text" required placeholder="Prénom *" value={formData.prenom}
                                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none" />
                            <input type="text" required placeholder="Nom *" value={formData.nom}
                                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none" />
                        </div>

                        <input type="email" required placeholder="Email *" value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none disabled:bg-gray-50"
                            disabled={!!user} />

                        <input type="tel" required placeholder="Téléphone WhatsApp *" value={formData.telephone}
                            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none" />

                        <div className="bg-gradient-to-r from-[#1FA9A2]/10 to-[#8DC63F]/10 border-l-4 border-[#1FA9A2] p-5 rounded-xl">
                            <p className="font-bold text-[#0F3D3E] mb-2">Paiement Mobile Money</p>
                            <p className="text-sm text-gray-700">
                                1. Envoie <strong>{formation?.prix_fcfa?.toLocaleString('fr-FR')} FCFA</strong> sur <strong>77 765 10 10</strong><br />
                                2. Copie le numéro de transaction reçu par SMS ci-dessous
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <select value={formData.methode_paiement}
                                onChange={(e) => setFormData({ ...formData, methode_paiement: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none bg-white">
                                <option value="wave">Wave</option>
                                <option value="orange_money">Orange Money</option>
                            </select>
                            <input type="text" required placeholder="Référence transaction *" value={formData.reference_paiement}
                                onChange={(e) => setFormData({ ...formData, reference_paiement: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none" />
                        </div>

                        {error && (
                            <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={submitting}
                            className="w-full bg-gradient-to-r from-[#8DC63F] to-[#9DD94F] text-[#0F3D3E] py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            {submitting && <Loader2 size={22} className="animate-spin" />}
                            {submitting ? 'Envoi en cours...' : "Confirmer l'inscription"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}