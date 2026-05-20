import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, Users, Award, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

const POLES_META = {
    'policy-impact-lab': {
        nom: 'POLICY IMPACT LAB',
        desc: "Maîtrisez l'évaluation d'impact pour piloter vos politiques publiques avec des données probantes.",
        color: '#8DC63F',
        code: 'policy-impact-lab'
    },
    'economics-power-hub': {
        nom: 'ECONOMICS POWER HUB',
        desc: "Analysez l'économie UEMOA/CEDEAO et prenez des décisions stratégiques basées sur des modèles rigoureux.",
        color: '#1FA9A2',
        code: 'economics-power-hub'
    },
    'strategy-delivery-academy': {
        nom: 'STRATEGY & DELIVERY',
        desc: 'Transformez vos plans en résultats mesurables. Méthodes GAR, S&E, planification opérationnelle.',
        color: '#0F3D3E',
        code: 'strategy-delivery-academy'
    },
    'data-science-factory': {
        nom: 'DATA SCIENCE FACTORY',
        desc: 'Passez de l’intuition aux insights. R, Python, Power BI pour décideurs et analystes.',
        color: '#8DC63F',
        code: 'data-science-factory'
    },
    'leadership-voice-institute': {
        nom: 'LEADERSHIP & VOICE',
        desc: 'Développez votre influence. Prise de parole, leadership, intelligence émotionnelle pour cadres.',
        color: '#1FA9A2',
        code: 'leadership-voice-institute'
    }
}

export default function F01_Accueil() {
    const [polesData, setPolesData] = useState([])
    const [stats, setStats] = useState([
        { icon: Award, label: 'Formations certifiantes', value: '0' },
        { icon: Users, label: 'Professionnels formés', value: '0' },
        { icon: TrendingUp, label: 'Taux de satisfaction', value: '97%' },
    ])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            const { data: formations } = await supabase
                .from('formations')
                .select('id, slug, appellation_commerciale, code_pole, prix_fcfa')
                .eq('statut', 'publiee')

            const { count: nbInscrits } = await supabase
                .from('inscriptions')
                .select('*', { count: 'exact', head: true })
                .eq('statut_paiement', 'paye')

            setStats([
                {
                    icon: Award, label: 'Formations certifiantes', value: `${formations?.length || 5000}`
                },
                { icon: Users, label: 'Professionnels formés', value: `${nbInscrits || 24} + ` },
                { icon: TrendingUp, label: 'Taux de satisfaction', value: '97%' },
            ])

            setPolesData(Object.values(POLES_META))
            setLoaded(true)
        }

        fetchData()
    }, [])

    const benefits = [
        'Formations animées par des économistes-statisticiens expérimentés',
        'Méthodes pratiques directement applicables sur le terrain',
        'Certification reconnue par le Cabinet GAC',
        'Sessions live via Zoom + replays disponibles 30 jours'
    ]

    return (
        <div className="bg-white font-sans">

            {/* HERO SECTION */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0F3D3E] via-[#1FA9A2] to-[#8DC63F] py-24">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className={`max - w - 3xl mx-auto text-center transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium mb-6">
                            <Sparkles size={16} />
                            Cabinet de référence en Afrique de l'Ouest
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                            Transformez vos données en <span className="text-[#8DC63F]">impact réel</span>
                        </h1>

                        <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                            Études, conseil et formation pour les décideurs publics et privés de l'UEMOA et CEDEAO
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/formations" className="bg-[#8DC63F] hover:bg-[#7AB836] text-white px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 shadow-lg">
                                Voir les formations
                            </Link>
                            <Link to="/contact" className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-lg font-semibold transition-all border-white/20">
                                Nous contacter
                            </Link>
                        </div>
                    </div>
                </div>
            </section >

            {/* STATS SECTION */}
            < section className="py-16 -mt-12 relative z-20" >
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                className={`bg-white p-8 rounded-2xl shadow-xl border-gray-100 hover:shadow-2xl transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: ` ${idx * 150}ms ` }}
                            >
                                <stat.icon className="text-[#8DC63F] mb-4" size={40} strokeWidth={1.5} />
                                <div className="text-5xl font-bold text-[#0F3D3E] mb-2">{stat.value}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* BENEFITS SECTION */}
            < section className="py-20 bg-gray-50" >
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4">
                            Pourquoi choisir GAC ?
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Une expertise reconnue au service de votre montée en compétences
                        </p>
                    </div>

                    <div className="max-w-2xl mx-auto grid gap-4">
                        {benefits.map((benefit, idx) => (
                            <div
                                key={idx}
                                className="flex items-start gap-3 bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-all"
                            >
                                <CheckCircle className="text-[#8DC63F] flex-shrink-0 mt-1" size={24} />
                                <p className="text-gray-700 font-medium">{benefit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

            {/* POLES SECTION */}
            < section className="py-20" >
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4">
                            Nos 5 Pôles d'Excellence
                        </h2>
                        <p className="text-gray-600 text-lg">
                            Des parcours ciblés pour chaque enjeu stratégique
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {polesData.map((pole, idx) => (
                            <div
                                key={pole.code}
                                className="group bg-white border-gray-200 rounded-2xl p-8 hover:shadow-2xl hover:border-[#8DC63F] transition-all duration-300 hover:-translate-y-2"
                            >
                                <div className="w-16 h-1.5 mb-6 rounded-full transition-all group-hover:w-24" style={{ backgroundColor: pole.color }}></div>
                                <h3 className="text-xl font-bold text-[#0F3D3E] mb-3">{pole.nom}</h3>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{pole.desc}</p>
                                <Link
                                    to={`/formations?pole=${pole.code}`}
                                    className="inline-flex items-center gap-2 text-[#1FA9A2] font-semibold group-hover:gap-3 transition-all"
                                >
                                    Découvrir le pôle
                                    <ArrowRight size={18} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section >

        </div >
    )
}