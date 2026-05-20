import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { BookOpen, Calendar, TrendingUp, Award, Loader2, LogOut, Video, FileText } from 'lucide-react'

export default function F09_Dashboard() {
    const [stats, setStats] = useState({
        nbFormations: 0,
        prochaineSession: 'Aucune',
        nbCertificats: 0
    })
    const [inscriptions, setInscriptions] = useState([])
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchDashboardData()

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchDashboardData()
            }
        }

        document.addEventListener('visibilitychange', handleVisibilityChange)
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            navigate('/connexion')
            return
        }
        setUser(user)

        const { data, error } = await supabase
            .from('inscriptions')
            .select(`
                id,
                statut_inscription,
                statut_paiement,
                session:sessions(
                    id,
                    date_debut,
                    date_fin,
                    statut,
                    lien_zoom,
                    formation:formations(
                        id,
                        appellation_commerciale
                    )
                ),
                decharges(
                    id,
                    numero_decharge,
                    url_pdf,
                    statut,
                    created_at
                )
            `)
            .eq('user_id', user.id)
            .eq('statut_inscription', 'confirmee')

        if (error) {
            console.error('Erreur fetch dashboard:', error)
            setLoading(false)
            return
        }

        setInscriptions(data || [])

        if (data) {
            const sessionsFutures = data
                .map(i => i.session)
                .filter(s => s && s.date_debut && s.statut === 'ouverte' && new Date(s.date_debut) > new Date())
                .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))

            const prochaineDate = sessionsFutures[0]

            setStats({
                nbFormations: data.length,
                prochaineSession: prochaineDate
                    ? new Date(prochaineDate.date_debut).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                    })
                    : 'Aucune',
                nbCertificats: data.filter(i => {
                    const decharges = Array.isArray(i.decharges) ? i.decharges : i.decharges ? [i.decharges] : []
                    return decharges.some(d => d.statut === 'valide')
                }).length
            })
        }

        setLoading(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        navigate('/connexion')
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#1FA9A2]" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-[#0F3D3E]">Tableau de bord apprenant</h1>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 hidden sm:block">{user?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <LogOut size={18} />
                        Déconnexion
                    </button>
                </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-3 mb-2">
                        <BookOpen size={24} className="text-[#1FA9A2]" />
                        <div className="text-3xl font-bold text-[#8DC63F]">{stats.nbFormations}</div>
                    </div>
                    <p className="text-gray-600">Formations en cours</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar size={24} className="text-[#1FA9A2]" />
                        <div className="text-3xl font-bold text-[#8DC63F]">
                            {stats.prochaineSession !== 'Aucune' ? '1' : '0'}
                        </div>
                    </div>
                    <p className="text-gray-600 text-sm">{stats.prochaineSession}</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp size={24} className="text-[#1FA9A2]" />
                        <div className="text-3xl font-bold text-[#8DC63F]">-</div>
                    </div>
                    <p className="text-gray-600">Progression</p>
                    <p className="text-xs text-gray-400 mt-1">Bientôt disponible</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center gap-3 mb-2">
                        <Award size={24} className="text-[#1FA9A2]" />
                        <div className="text-3xl font-bold text-[#8DC63F]">{stats.nbCertificats}</div>
                    </div>
                    <p className="text-gray-600">Certificats obtenus</p>
                </div>
            </div>

            {/* MES FORMATIONS */}
            <div className="mt-8">
                <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4">Mes Formations</h2>

                <div className="space-y-4">
                    {inscriptions.length === 0 && (
                        <p className="text-gray-500">Aucune formation pour le moment</p>
                    )}

                    {inscriptions.map(i => {
                        const decharges = Array.isArray(i.decharges) ? i.decharges : i.decharges ? [i.decharges] : []
                        const dechargeValide = decharges.find(d => d.statut === 'valide')

                        return (
                            <div key={i.id} className="bg-white p-5 rounded-lg shadow-sm border">
                                <div className="flex flex-col gap-4">
                                    {/* Infos formation */}
                                    <div>
                                        <p className="font-semibold text-[#0F3D3E] text-lg">
                                            {i.session?.formation?.appellation_commerciale || 'Formation'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Du {new Date(i.session.date_debut).toLocaleDateString('fr-FR')}
                                            au {new Date(i.session.date_fin).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>

                                    {/* 1. Télécharger PDF en haut */}
                                    {dechargeValide && (
                                        <a
                                            href={dechargeValide.url_pdf || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#1FA9A2] text-white rounded-lg hover:bg-[#168f89] transition-colors"
                                            onClick={(e) => {
                                                if (!dechargeValide.url_pdf) {
                                                    e.preventDefault()
                                                    alert('Aucun fichier PDF associé à cette décharge')
                                                }
                                            }}
                                        >
                                            <FileText size={18} />
                                            Télécharger PDF
                                        </a>
                                    )}

                                    {/* 2. Rejoindre le cours en dessous */}
                                    {i.session?.statut === 'ouverte' && (
                                        <a
                                            href={i.session.lien_zoom || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-3 px-6 py-3 bg-[#0F3D3E] text-white text-lg font-semibold rounded-lg hover:bg-[#0c3233] transition-colors"
                                            onClick={(e) => {
                                                if (!i.session.lien_zoom) {
                                                    e.preventDefault()
                                                    alert('Aucun lien Zoom disponible pour cette session')
                                                }
                                            }}
                                        >
                                            <Video size={22} />
                                            Rejoindre mon cours
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}