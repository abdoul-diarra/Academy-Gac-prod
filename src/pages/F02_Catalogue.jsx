import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Clock, ArrowRight, Filter, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

const POLES_LABEL = {
    'policy-impact-lab': 'Policy Impact Lab',
    'economics-power-hub': 'Economics Power Hub',
    'strategy-delivery-academy': 'Strategy & Delivery',
    'data-science-factory': 'Data Science Factory',
    'leadership-voice-institute': 'Leadership & Voice'
}

const POLES_COLORS = {
    'policy-impact-lab': '#8DC63F',
    'economics-power-hub': '#1FA9A2',
    'strategy-delivery-academy': '#0F3D3E',
    'data-science-factory': '#8DC63F',
    'leadership-voice-institute': '#1FA9A2'
}

export default function F02_Catalogue() {
    const [formations, setFormations] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()
    const poleFilter = searchParams.get('pole')

    useEffect(() => {
        const fetchFormations = async () => {
            setLoading(true)

            let query = supabase
                .from('formations')
                .select('id, code_pole, appellation_commerciale, titre_pedagogique, description, duree_heures, prix_fcfa')
                .eq('statut', 'publiee')
                .order('cree_le', { ascending: false })

            if (poleFilter && POLES_LABEL[poleFilter]) {
                query = query.eq('code_pole', poleFilter)
            }

            const { data, error } = await query

            if (error) {
                console.error('Erreur Supabase:', error)
                setFormations([])
            } else {
                setFormations(data || [])
            }
            setLoading(false)
        }
        fetchFormations()
    }, [poleFilter])

    const clearFilter = () => setSearchParams({})

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#0F3D3E] mb-4">
                            {poleFilter ? POLES_LABEL[poleFilter] : 'Nos Formations'}
                        </h1>
                        <p className="text-lg text-gray-600">
                            {poleFilter
                                ? `Découvrez les formations du pôle ${POLES_LABEL[poleFilter]}`
                                : 'Choisissez parmi nos 5 pôles d’excellence pour booster vos compétences'}
                        </p>

                        {poleFilter && (
                            <button
                                onClick={clearFilter}
                                className="mt-4 inline-flex items-center gap-2 text-[#1FA9A2] font-medium hover:gap-3 transition-all"
                            >
                                <X size={18} />
                                Voir toutes les formations
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">

                {/* FILTRES VISUELS */}
                <div className="mb-10 overflow-x-auto pb-2">
                    <div className="flex gap-3 w-max">
                        <button
                            onClick={clearFilter}
                            className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${!poleFilter
                                ? 'bg-[#0F3D3E] text-white shadow-lg'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#1FA9A2]'
                                }`}
                        >
                            Toutes
                        </button>
                        {Object.entries(POLES_LABEL).map(([code, label]) => (
                            <button
                                key={code}
                                onClick={() => setSearchParams({ pole: code })}
                                className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap border-2 ${poleFilter === code
                                    ? 'text-white border-transparent shadow-lg'
                                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                                    }`}
                                style={poleFilter === code ? { backgroundColor: POLES_COLORS[code] } : {}}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* LOADING SKELETON */}
                {loading ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                ) : formations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucune formation trouvée</h3>
                        <p className="text-gray-500 mb-6">Essayez un autre pôle ou revenez plus tard</p>
                        <button
                            onClick={clearFilter}
                            className="text-[#1FA9A2] font-semibold hover:underline"
                        >
                            Voir toutes les formations
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formations.map((f, idx) => (
                            <div
                                key={f.id}
                                className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex-col"
                                style={{ animationDelay: `${idx * 80}ms ` }}
                            >
                                <div
                                    className="h-2"
                                    style={{ backgroundColor: POLES_COLORS[f.code_pole] }}
                                ></div>

                                <div className="p-6 flex-1 flex-col">
                                    <span
                                        className="text-xs font-bold uppercase tracking-wider mb-3 inline-block"
                                        style={{ color: POLES_COLORS[f.code_pole] }}
                                    >
                                        {POLES_LABEL[f.code_pole] || f.code_pole}
                                    </span>

                                    <h3 className="text-xl font-bold mb-3 text-[#0F3D3E] leading-tight">
                                        {f.appellation_commerciale}
                                    </h3>

                                    <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                                        {f.description || f.titre_pedagogique}
                                    </p>

                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                        <Clock size={16} />
                                        <span>{f.duree_heures}h de formation</span>
                                    </div>

                                    <div className="flex justify-between items-center pt-4 border-t-gray-100">
                                        <div className="text-2xl font-bold text-[#0F3D3E]">
                                            {f.prix_fcfa?.toLocaleString('fr-FR')} <span className="text-sm font-normal">FCFA</span>
                                        </div>
                                        <Link
                                            to={`/formation/${f.id}`}
                                            className="inline-flex items-center gap-2 bg-[#1FA9A2] hover:bg-[#0F3D3E] text-white px-5 py-2.5 rounded-lg font-semibold transition-all group-hover:gap-3"
                                        >
                                            Voir détail
                                            <ArrowRight size={18} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    )
}