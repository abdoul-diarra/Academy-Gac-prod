import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Calendar, Clock, Download, X, Loader2 } from 'lucide-react'

export default function F10_MesFormations({ embedded = false }) {
    const [inscriptions, setInscriptions] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchMesFormations()
    }, [navigate, embedded])

    const fetchMesFormations = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            if (!embedded) navigate('/connexion')
            setLoading(false)
            return
        }

        const { data, error } = await supabase
            .from('inscriptions')
            .select(`
                id,
                statut_paiement,
                statut,
                sessions (
                    id,
                    date_debut,
                    date_fin,
                    formations (
                        id,
                        slug,
                        appellation_commerciale,
                        titre_pedagogique,
                        description,
                        prix_fcfa,
                        duree_heures
                    )
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Erreur Supabase:', error)
        } else {
            setInscriptions(data || [])
        }
        setLoading(false)
    }

    const handleAnnuler = async (inscriptionId) => {
        if (!confirm('Annuler cette inscription?')) return

        const { error } = await supabase
            .from('inscriptions')
            .update({ statut: 'annule' })
            .eq('id', inscriptionId)

        if (!error) {
            setInscriptions(inscriptions.filter(i => i.id !== inscriptionId))
        } else {
            alert('Erreur : ' + error.message)
        }
    }

    const getStatutBadge = (paiement, statut) => {
        if (statut === 'annule') return { text: 'Annulé', color: 'bg-gray-200 text-gray-700' }
        if (paiement === 'paye') return { text: 'Confirmé', color: 'bg-green-100 text-green-800' }
        if (paiement === 'en_attente') return { text: 'En attente paiement', color: 'bg-yellow-100 text-yellow-800' }
        return { text: 'En cours', color: 'bg-blue-100 text-blue-800' }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-[#1FA9A2]" />
            </div>
        )
    }

    return (
        <div className={embedded ? '' : 'p-4 max-w-7xl mx-auto'}>
            {!embedded && <h1 className="text-2xl font-bold mb-6 text-[#0F3D3E]">Mes Formations</h1>}

            {inscriptions.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-500 text-lg mb-4">Tu n’es inscrit à aucune formation pour l’instant.</p>
                    <Link to="/formations" className="mt-4 inline-block bg-[#1FA9A2] text-white px-6 py-3 rounded-lg hover:bg-[#0F3D3E] transition font-semibold">
                        Voir les formations disponibles
                    </Link>
                </div>
            ) : (
                <div className="grid gap-6">
                    {inscriptions.map((insc) => {
                        const session = insc.sessions
                        const formation = session?.formations
                        const badge = getStatutBadge(insc.statut_paiement, insc.statut)

                        return (
                            <div key={insc.id} className="bg-white border rounded-lg p-6 shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#0F3D3E]">{formation?.appellation_commerciale}</h3>
                                        <p className="text-gray-600 text-sm">{formation?.titre_pedagogique}</p>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                                        {badge.text}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={16} />
                                        <span>{new Date(session?.date_debut).toLocaleDateString('fr-FR')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>{formation?.duree_heures}h</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <Link
                                        to={`/formation/${formation?.slug}`}
                                        className="text-[#1FA9A2] font-semibold hover:underline"
                                    >
                                        Voir la formation
                                    </Link>
                                    {insc.statut_paiement === 'paye' && (
                                        <button className="text-[#1FA9A2] font-semibold hover:underline flex items-center gap-1">
                                            <Download size={16} /> Télécharger décharge
                                        </button>
                                    )}
                                    {insc.statut_paiement !== 'paye' && (
                                        <button
                                            onClick={() => handleAnnuler(insc.id)}
                                            className="text-red-600 font-semibold hover:underline flex items-center gap-1"
                                        >
                                            <X size={16} /> Annuler
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}