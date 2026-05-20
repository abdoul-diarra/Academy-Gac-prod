import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2, Calendar, Clock, MapPin, Users, ArrowLeft, AlertCircle, CheckCircle, Shield, Award } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

const POLES_COLORS = {
    'policy-impact-lab': '#8DC63F',
    'economics-power-hub': '#1FA9A2',
    'strategy-delivery-academy': '#0F3D3E',
    'data-science-factory': '#8DC63F',
    'leadership-voice-institute': '#1FA9A2'
}

const POLES_LABEL = {
    'policy-impact-lab': 'Policy Impact Lab',
    'economics-power-hub': 'Economics Power Hub',
    'strategy-delivery-academy': 'Strategy & Delivery',
    'data-science-factory': 'Data Science Factory',
    'leadership-voice-institute': 'Leadership & Voice'
}

export default function F03_FicheFormation() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuth()

    const [formation, setFormation] = useState(null)
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        loadFormation()
    }, [id])

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

            const { data: sessionData } = await supabase
                .from('sessions')
                .select(`
                    id,
                    formation_id,
                    date_debut,
                    date_fin,
                    capacite_max,
                    statut,
                    lien_zoom,
                    inscriptions!session_id(count),
                    formations!inner(duree_heures, prix_fcfa, appellation_commerciale)
                `)
                .eq('formation_id', id)
                .eq('statut', 'ouverte')
                .gte('date_debut', new Date().toISOString())
                .order('date_debut', { ascending: true })
                .limit(1)

            const session = sessionData?.[0]
            if (session) {
                session.places_disponibles = session.capacite_max - (session.inscriptions?.[0]?.count || 0)
            }
            setSession(session)
            setLoading(false)
        } catch (err) {
            console.error(err)
            setError('Erreur de chargement')
            setLoading(false)
        }
    }

    function handleInscription() {
        if (!session) return

        if (!user) {
            localStorage.setItem('pending_session_id', session.id)
            navigate('/connexion')
        } else {
            navigate(`/formation/${id}/inscription/${session.id}`)
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

    const poleColor = formation ? POLES_COLORS[formation.code_pole] : '#1FA9A2'

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#1FA9A2] mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Chargement de la formation...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white border-red-200 rounded-2xl p-8 max-w-md w-full shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle size={28} className="text-red-600" />
                        <h2 className="text-2xl font-bold text-[#0F3D3E]">Oups!</h2>
                    </div>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        to="/formations"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1FA9A2] text-white rounded-lg hover:bg-[#0F3D3E] transition font-semibold"
                    >
                        <ArrowLeft size={18} />
                        Retour aux formations
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="relative overflow-hidden" style={{ backgroundColor: poleColor }}>
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10"></div>
                <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16">
                    <Link
                        to="/formations"
                        className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-all hover:gap-3"
                    >
                        <ArrowLeft size={18} />
                        Retour aux formations
                    </Link>

                    <div className="max-w-3xl">
                        <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm font-bold rounded-full mb-4 uppercase tracking-wider">
                            {POLES_LABEL[formation?.code_pole] || formation?.mode_formation}
                        </span>

                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {formation.appellation_commerciale}
                        </h1>

                        <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                            {formation.titre_pedagogique}
                        </p>

                        <div className="flex flex-wrap gap-4 md:gap-6 text-white/90">
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <span className="font-medium">{session?.formations?.[0]?.prix_fcfa?.toLocaleString('fr-FR') || formation?.prix_fcfa?.toLocaleString('fr-FR') || 0}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={20} />
                                <span className="font-medium">{formation.niveau || 'Tous niveaux'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin size={20} />
                                <span className="font-medium">{formation.lieu || 'Dakar'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4">À propos de cette formation</h2>
                            <p className="text-gray-700 leading-relaxed text-lg">
                                {formation.description || 'Formation certifiante dispensée par des experts GAC'}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4 flex items-center gap-2">
                                <CheckCircle size={24} className="text-[#8DC63F]" />
                                Objectifs pédagogiques
                            </h2>
                            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {formation.objectifs || 'Objectifs en cours de rédaction'}
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border-gray-100 p-6 md:p-8">
                            <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4 flex items-center gap-2">
                                <Award size={24} className="text-[#1FA9A2]" />
                                Programme détaillé
                            </h2>
                            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                                {formation.programme || 'Programme détaillé disponible sur demande.'}
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-[#0F3D3E] to-[#1FA9A2] rounded-2xl p-6 md:p-8 text-white shadow-lg">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Shield size={24} />
                                Pourquoi faire confiance à GAC?
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-white/90">
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={18} className="flex-shrink-0 mt-1" />
                                    <span>Formateurs économistes-statisticiens expérimentés</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={18} className="flex-shrink-0 mt-1" />
                                    <span>Méthodes pratiques applicables immédiatement</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={18} className="flex-shrink-0 mt-1" />
                                    <span>Certification reconnue par le Cabinet GAC</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle size={18} className="flex-shrink-0 mt-1" />
                                    <span>Support post-formation 30 jours</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-xl border-gray-100 p-6 md:p-8 sticky top-6">
                            <div className="text-center mb-6 pb-6 border-b border-gray-100">
                                <p className="text-sm text-gray-600 mb-2">Investissement formation</p>
                                <p className="text-4xl font-bold text-[#0F3D3E]">
                                    {session?.formations?.[0]?.prix_fcfa?.toLocaleString('fr-FR') || formation?.prix_fcfa?.toLocaleString('fr-FR') || 0}
                                    <span className="text-xl font-normal"> FCFA</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">TTC - Paiement en 1 fois</p>
                            </div>

                            {session ? (
                                <div className="bg-[#F8FAF9] rounded-xl p-5 mb-6 border-l-4" style={{ borderColor: poleColor }}>
                                    <div className="flex items-center gap-2 text-[#0F3D3E] mb-3">
                                        <Calendar size={20} className="text-[#1FA9A2]" />
                                        <span className="font-bold">Prochaine session</span>
                                    </div>
                                    <p className="text-gray-800 font-medium mb-2">{formatDate(session.date_debut)}</p>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${session.places_disponibles > 5 ? 'bg-[#8DC63F]' : 'bg-yellow-500'}`}></div>
                                        <p className="text-sm text-gray-600">
                                            {session.places_disponibles} place{session.places_disponibles > 1 ? 's' : ''} disponible{session.places_disponibles > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded-lg">
                                    <p className="text-sm text-yellow-800 font-medium">
                                        Aucune session ouverte pour le moment.
                                        <Link to="/contact" className="underline ml-1 hover:text-yellow-900">Contacte-nous</Link> pour être alerté.
                                    </p>
                                </div>
                            )}

                            <button
                                onClick={handleInscription}
                                disabled={!session}
                                className="w-full bg-[#8DC63F] text-[#0F3D3E] py-4 rounded-xl font-bold text-lg hover:bg-[#7AB836] transition-all hover:scale-[1.02] shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-98"
                            >
                                S'inscrire maintenant
                            </button>

                            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <Shield size={16} className="text-[#8DC63F]" />
                                    <span>Paiement sécurisé Wave / Orange Money</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-[#8DC63F]" />
                                    <span>Validation sous 1 à 4h ouvrées</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle size={16} className="text-[#8DC63F]" />
                                    <span>Facture et attestation fournies</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}