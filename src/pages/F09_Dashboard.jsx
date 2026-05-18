import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import MesFormations from './F10_MesFormations'
import { BookOpen, Calendar, TrendingUp, Award, Loader2, LogOut } from 'lucide-react'

export default function F09_Dashboard() {
    const [stats, setStats] = useState({
        nbFormations: 0,
        prochaineSession: 'Aucune',
        nbCertificats: 0
    })
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            navigate('/connexion')
            return
        }
        setUser(user)

        const { data: inscriptions, error } = await supabase
            .from('inscriptions')
            .select(`
                id,
                statut_paiement,
                statut,
                session:sessions(
                    id,
                    date_debut,
                    date_fin,
                    statut
                )
            `)
            .eq('user_id', user.id)
            .eq('statut_paiement', 'paye')

        if (error) {
            console.error('Erreur fetch dashboard:', error)
            setLoading(false)
            return
        }

        if (inscriptions) {
            const sessionsFutures = inscriptions
                .map(i => i.session)
                .filter(s => s && s.date_debut && new Date(s.date_debut) > new Date())
                .sort((a, b) => new Date(a.date_debut) - new Date(b.date_debut))

            const prochaineDate = sessionsFutures[0]

            setStats({
                nbFormations: inscriptions.length,
                prochaineSession: prochaineDate
                    ? new Date(prochaineDate.date_debut).toLocaleString('fr-FR', {
                        day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
                    })
                    : 'Aucune',
                nbCertificats: 0
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

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-[#0F3D3E] mb-4">Mes Formations</h2>
                <MesFormations embedded={true} />
            </div>
        </div>
    )
}