import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Loader2, AlertCircle, Calendar, Clock, Shield, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function F18_Inscription() {
    const { id } = useParams()
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
        loadFormation()
    }, [id])

    useEffect(() => {
        if (user?.email) {
            setFormData(prev => ({ ...prev, email: user.email }))
        }
    }, [user])

    async function loadFormation() {
        try {
            setLoading(true)
            setError('')
            const { data: formationData, error: formationError } = await supabase
                .from('formations')
                .select('*')
                .eq('id', id)
                .eq('statut', 'publiee')
                .single()

            if (formationError || !formationData) {
                setError('Formation introuvable ou non publiée')
                setLoading(false)
                return
            }
            setFormation(formationData)

            const { data: sessionData, error: sessionError } = await supabase
                .from('sessions')
                .select('*')
                .eq('formation_id', formationData.id)
                .eq('statut', 'ouverte')
                .gte('date_debut', new Date().toISOString())
                .order('date_debut', { ascending: true })
                .limit(1)
                .single()

            if (sessionError || !sessionData) {
                setError('Aucune session disponible pour cette formation')
                setLoading(false)
                return
            }
            setSession(sessionData)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setError('Erreur de chargement')
            setLoading(false)
        }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        setError('')
        try {
            const { data: inscription, error: insertError } = await supabase
                .from('inscriptions')
                .insert({
                    session_id: session.id,
                    prenom_contact: formData.prenom,
                    nom_contact: formData.nom,
                    email_contact: formData.email,
                    telephone_contact: formData.telephone,
                    methode_paiement: formData.methode_paiement,
                    reference_transaction: formData.reference_paiement,
                    montant: formation.prix_fcfa,
                    statut: 'en_attente',
                    user_id: user?.id
                })
                .select()
                .single()

            if (insertError) throw insertError

            navigate('/dashboard', {
                state: { message: 'Inscription envoyée! Vérification en cours.' }
            })

        } catch (err) {
            console.error(err)
            setError(err.message || "Erreur lors de l'inscription. Vérifie la référence de paiement.")
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
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F8FAF9] to-white">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-[#1FA9A2] mx-auto mb-3" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F8FAF9] to-white px-4">
                <div className="bg-white border-red-200 rounded-2xl p-8 max-w-md w-full shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle size={22} className="text-red-600" />
                        </div>
                        <h2 className="text-xl font-bold text-[#0F3D3E]">Oups</h2>
                    </div>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        to="/formations"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1FA9A2] text-white rounded-xl hover:bg-[#0F3D3E] transition font-medium"
                    >
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

                {/* Breadcrumb */}
                <Link to="/formations" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#1FA9A2] mb-6 transition">
                    <ArrowLeft size={16} />
                    Retour aux formations
                </Link>

                <div className="bg-white rounded-3xl shadow-xl border-gray-100 overflow-hidden">

                    {/* HEADER FORMATION */}
                    <div className="relative bg-gradient-to-r from-[#0F3D3E] to-[#1A5A5B] text-white p-8 md:p-10 overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#8DC63F] opacity-10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold mb-3">
                                Formation certifiante
                            </span>
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">
                                {formation?.appellation_commerciale}
                            </h1>
                            <p className="text-gray-200 text-lg mb-6 max-w-2xl">
                                {formation?.titre_pedagogique}
                            </p>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <Calendar size={20} className="text-[#8DC63F]" />
                                    <div>
                                        <p className="text-xs text-gray-300">Prochaine session</p>
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

                                <div className="flex items-center justify-between md:justify-end bg-[#8DC63F] rounded-xl p-4">
                                    <div className="text-[#0F3D3E]">
                                        <p className="text-xs font-medium">Prix</p>
                                        <p className="text-2xl md:text-3xl font-bold">
                                            {formation?.prix_fcfa?.toLocaleString('fr-FR')} FCFA
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FORMULAIRE */}
                    <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-[#1FA9A2]/10 rounded-xl flex items-center justify-center">
                                <Shield size={20} className="text-[#1FA9A2]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#0F3D3E]">Finaliser l'inscription</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Prénom *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.prenom}
                                    onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none transition"
                                    placeholder="Mamadou"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nom *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nom}
                                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none transition"
                                    placeholder="Diallo"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none transition disabled:bg-gray-50 disabled:text-gray-500"
                                disabled={!!user}
                            />
                            {user && (
                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                    <CheckCircle2 size={14} className="text-green-600" />
                                    Email lié à ton compte
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone WhatsApp *</label>
                            <input
                                type="tel"
                                required
                                value={formData.telephone}
                                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none transition"
                                placeholder="77 000 00 00"
                            />
                        </div>

                        <div className="bg-gradient-to-r from-[#1FA9A2]/10 to-[#8DC63F]/10 border-l-4 border-[#1FA9A2] p-5 rounded-xl">
                            <p className="font-bold text-[#0F3D3E] mb-2 flex items-center gap-2">
                                <Shield size={18} className="text-[#1FA9A2]" />
                                Paiement Mobile Money
                            </p>
                            <p className="text-sm text-gray-700 leading-relaxed">
                                1. Envoie <strong>{formation?.prix_fcfa?.toLocaleString('fr-FR')} FCFA</strong> sur <strong className="text-[#1FA9A2]">77 765 10 10</strong> via Wave ou Orange Money<br />
                                2. Copie le numéro de transaction reçu par SMS ci-dessous
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Méthode de paiement *</label>
                                <select
                                    value={formData.methode_paiement}
                                    onChange={(e) => setFormData({ ...formData, methode_paiement: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none transition bg-white"
                                >
                                    <option value="wave">Wave</option>
                                    <option value="orange_money">Orange Money</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Référence transaction *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.reference_paiement}
                                    onChange={(e) => setFormData({ ...formData, reference_paiement: e.target.value })}
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#1FA9A2]/20 focus:border-[#1FA9A2] outline-none transition"
                                    placeholder="WV-2026-123456"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-gradient-to-r from-[#8DC63F] to-[#9DD94F] text-[#0F3D3E] py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:scale-[1.02] transition-all disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 size={22} className="animate-spin" />}
                            {submitting ? 'Envoi en cours...' : "Confirmer l'inscription"}
                        </button>

                        <p className="text-xs text-center text-gray-500">
                            En confirmant, tu acceptes nos conditions d'utilisation et notre politique de confidentialité
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}