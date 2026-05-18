import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { Quote, Loader2, Star, TrendingUp, Users, Award } from 'lucide-react'

const POLES_COLOR = {
    'POLICY_IMPACT_LAB': '#8DC63F',
    'ECONOMICS_POWER_HUB': '#1FA9A2',
    'STRATEGY_DELIVERY_ACADEMY': '#0F3D3E',
    'DATA_SCIENCE_FACTORY': '#8DC63F',
    'LEADERSHIP_VOICE_INSTITUTE': '#1FA9A2'
}

const POLES_LABEL = {
    'POLICY_IMPACT_LAB': 'Policy Impact Lab',
    'ECONOMICS_POWER_HUB': 'Economics Power Hub',
    'STRATEGY_DELIVERY_ACADEMY': 'Strategy & Delivery',
    'DATA_SCIENCE_FACTORY': 'Data Science Factory',
    'LEADERSHIP_VOICE_INSTITUTE': 'Leadership & Voice'
}

export default function F05_Temoignages() {
    const [temoignages, setTemoignages] = useState([])
    const [indicateurs, setIndicateurs] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeIdx, setActiveIdx] = useState(0)

    useEffect(() => {
        fetchData()
    }, [])

    // Auto-slide du carrousel
    useEffect(() => {
        if (temoignages.length <= 3) return
        const interval = setInterval(() => {
            setActiveIdx((prev) => (prev + 1) % Math.ceil(temoignages.length / 3))
        }, 5000)
        return () => clearInterval(interval)
    }, [temoignages])

    const fetchData = async () => {
        setLoading(true)

        const { data: temoignagesData } = await supabase
            .from('temoignages')
            .select(`
                id, nom, poste, texte, photo_url,
                formations(code_pole, appellation_commerciale)
            `)
            .eq('valide', true)
            .order('created_at', { ascending: false })
            .limit(9)

        const { data: indData } = await supabase
            .from('indicateurs_satisfaction')
            .select('*')
            .single()

        setTemoignages(temoignagesData || [])
        setIndicateurs(indData ? [
            {
                icon: Star,
                label: "Taux de satisfaction",
                value: indData.taux_satisfaction,
                desc: indData.detail_satisfaction,
                color: '#8DC63F'
            },
            {
                icon: TrendingUp,
                label: "Taux de complétion",
                value: indData.taux_completion,
                desc: indData.detail_completion,
                color: '#1FA9A2'
            },
            {
                icon: Users,
                label: "Recommandation",
                value: indData.nps,
                desc: "Net Promoter Score NPS",
                color: '#0F3D3E'
            },
        ] : [])

        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center py-24 bg-gray-50">
                <div className="text-center">
                    <Loader2 size={48} className="animate-spin text-[#1FA9A2] mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">Chargement des témoignages...</p>
                </div>
            </div>
        )
    }

    const groupedTemoignages = []
    for (let i = 0; i < temoignages.length; i += 3) {
        groupedTemoignages.push(temoignages.slice(i, i + 3))
    }

    return (
        <div className="bg-gray-50">

            {/* HERO */}
            <section className="bg-gradient-to-br from-[#0F3D3E] via-[#1FA9A2] to-[#8DC63F] py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Témoignages & Impact
                        </h1>
                        <p className="text-xl text-white/90">
                            Ce que disent nos apprenants. Ce que mesurent nos résultats.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16">

                {/* TEMOIGNAGES CARROUSEL */}
                <div className="mb-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4">
                            Ils nous font confiance
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Des professionnels formés qui partagent leur expérience
                        </p>
                    </div>

                    {temoignages.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-2xl">
                            <Quote size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500">Aucun témoignage pour le moment</p>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Grid */}
                            <div className="hidden md:block overflow-hidden">
                                <div
                                    className="flex transition-transform duration-700 ease-out"
                                    style={{ transform: translateX(`-${activeIdx * 100} % `) }}
                                >
                                    {groupedTemoignages.map((group, groupIdx) => (
                                        <div key={groupIdx} className="w-full flex-shrink-0 grid md:grid-cols-3 gap-6">
                                            {group.map((t) => (
                                                <TemoignageCard key={t.id} t={t} />
                                            ))}
                                        </div>
                                    ))}
                                </div>

                                {/* Dots */}
                                {groupedTemoignages.length > 1 && (
                                    <div className="flex justify-center gap-2 mt-8">
                                        {groupedTemoignages.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveIdx(idx)}
                                                className={`h-2 rounded-full transition-all ${idx === activeIdx
                                                    ? 'w-8 bg-[#8DC63F]'
                                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Mobile Stack */}
                            <div className="md:hidden grid gap-6">
                                {temoignages.slice(0, 6).map((t) => (
                                    <TemoignageCard key={t.id} t={t} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* INDICATEURS */}
                {indicateurs.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-[#0F3D3E] mb-4">
                                Indicateurs de satisfaction
                            </h3>
                            <p className="text-gray-600">
                                Des résultats mesurés, pas des promesses
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {indicateurs.map((ind, idx) => (
                                <IndicateurCard key={idx} ind={ind} />
                            ))}
                        </div>

                        <div className="mt-10 pt-8 border-t-gray-200 text-center">
                            <p className="text-sm text-gray-500">
                                Données issues de {temoignages.length}+ évaluations post-formation
                                collectées entre 2023 et 2025
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// Composant Carte Témoignage
function TemoignageCard({ t }) {
    const poleKey = t.formations?.code_pole?.replace(/-/g, '_').toUpperCase()
    const color = POLES_COLOR[poleKey] || '#1FA9A2'
    const poleLabel = POLES_LABEL[poleKey] || t.formations?.appellation_commerciale

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start gap-3 mb-4">
                <Quote size={28} className="text-[#8DC63F] flex-shrink-0" strokeWidth={1.5} />
                <div className="flex-1">
                    <div
                        className="text-xs font-bold uppercase tracking-wider mb-1"
                        style={{ color }}
                    >
                        {poleLabel}
                    </div>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill="#8DC63F" className="text-[#8DC63F]" />
                        ))}
                    </div>
                </div>
            </div>

            <p className="text-gray-700 mb-5 italic leading-relaxed line-clamp-4">
                "{t.texte}"
            </p>

            <div className="flex items-center gap-3 pt-4 border-t-gray-100">
                {t.photo_url ? (
                    <img
                        src={t.photo_url}
                        alt={t.nom}
                        className="w-12 h-12 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#1FA9A2] to-[#8DC63F] flex items-center justify-center text-white font-bold">
                        {t.nom?.charAt(0)}
                    </div>
                )}
                <div>
                    <div className="font-bold text-[#0F3D3E]">{t.nom}</div>
                    <div className="text-sm text-gray-500">{t.poste}</div>
                </div>
            </div>
        </div>
    )
}

// Composant Carte Indicateur
function IndicateurCard({ ind }) {
    const [animatedValue, setAnimatedValue] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedValue(ind.value)
        }, 300)
        return () => clearTimeout(timer)
    }, [ind.value])

    return (
        <div className="text-center">
            <div className="mb-4 flex justify-center">
                <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${ind.color}15  ` }}
                >
                    <ind.icon size={32} style={{ color: ind.color }} />
                </div>
            </div>

            <div
                className="text-5xl font-bold mb-2"
                style={{ color: ind.color }}
            >
                {animatedValue}%
            </div>

            <p className="font-semibold text-[#0F3D3E] mb-2">{ind.label}</p>
            <p className="text-sm text-gray-600">{ind.desc}</p>

            {/* Barre de progression */}
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={`{ 
                width: ${animatedValue} %  ,
                backgroundColor: ind.color
             `}
                />
            </div>
        </div >
    )
}