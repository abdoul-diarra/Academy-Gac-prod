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
        { icon: Award, label: 'Formations certifiantes', value: '24' },
        { icon: Users, label: 'Professionnels formés', value: '50' },
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
                { icon: Award, label: 'Formations certifiantes', value: `${formations?.length || 24}+` },
                { icon: Users, label: 'Professionnels formés', value: `${nbInscrits || 50}+` },
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
                    <div className={`max-w-3xl mx-auto text-center transition-all duration-700 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
                    </div>
                </div>
            </section>

            {/* STATS SECTION */}
            <section className="py-16 -mt-12 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-6">
                        {stats.map((stat, idx) => (
                            <div
                                key={stat.label}
                                className={`bg-white p-8 rounded-2xl shadow-xl border-gray-100 hover:shadow-2xl transition-all duration-500 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                                style={{ transitionDelay: `${idx * 150}ms` }}
                            >
                                <stat.icon className="text-[#8DC63F] mb-4" size={40} strokeWidth={1.5} />
                                <div className="text-5xl font-bold text-[#0F3D3E] mb-2">{stat.value}</div>
                                <div className="text-gray-600 font-medium">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* MOT DU DG */}
            <section className="relative bg-gradient-to-b from-[#F8FAF9] via-white to-[#F8FAF9] py-24 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#8DC63F]/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1FA9A2]/15 rounded-full blur-3xl"></div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border-white/40 overflow-hidden transition-all duration-500 hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)]">

                        <div className="relative bg-gradient-to-r from-[#0F3D3E] via-[#145F5F] to-[#1FA9A2] px-10 py-6 overflow-hidden">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                            <div className="relative flex items-center gap-3">
                                <div className="w-2 h-8 bg-[#8DC63F] rounded-full"></div>
                                <h2 className="text-white text-2xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                                    Mot du Directeur Général
                                </h2>
                            </div>
                        </div>

                        <div className="p-8 md:p-14">
                            <div className="flex flex-col lg:flex-row-reverse gap-12 items-start">

                                {/* Photo */}
                                <div className="w-full lg:w-80 flex-shrink-0">
                                    <div className="relative group">
                                        <div className="relative bg-gradient-to-br from-[#8DC63F] via-[#1FA9A2] to-[#0F3D3E] p-[2px] rounded- shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]">
                                            <div className="bg-white p-3 rounded-[1.9rem]">
                                                <img
                                                    src="/gag-academy-dg.jpeg"
                                                    alt="Babacar GAYE, Directeur Général GAC Academy"
                                                    className="w-full h-96 object-cover rounded-2xl transition-all duration-500 group-hover:saturate-110"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-10 text-center">
                                            <p className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Playfair Display, serif' }}>
                                                Babacar GAYE
                                            </p>
                                            <p className="text-gray-600 mt-1 font-medium">Économiste-Statisticien</p>
                                            <p className="text-sm text-gray-500">Directeur Général Cabinet GAC</p>
                                            <div className="w-16 h-1 bg-gradient-to-r from-[#8DC63F] to-[#1FA9A2] mx-auto mt-4 rounded-full"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Texte */}
                                <div className="flex-1">
                                    <div className="relative bg-gradient-to-r from-[#8DC63F]/10 to-[#1FA9A2]/10 border-l-4 border-[#8DC63F] p-6 md:p-8 rounded-r-2xl mb-10">
                                        <div className="absolute -top-3 -left-3 text-6xl text-[#8DC63F]/20 font-serif">“</div>
                                        <p className="relative text-2xl md:text-3xl font-bold text-gray-900 italic leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
                                            On ne forme pas des apprenants. On forge des architectes du développement.
                                        </p>
                                    </div>

                                    <div className="text-gray-700 space-y-6 leading-relaxed text-">
                                        <p>
                                            GAC ACADEMY naît d'une conviction simple mais exigeante : <span className="font-semibold text-[#0F3D3E] bg-[#8DC63F]/10 px-1.5 py-0.5 rounded">la rigueur analytique est le seul luxe que l'Afrique ne peut pas se permettre d'ignorer.</span>
                                        </p>
                                        <p>
                                            Dans un monde où les décisions publiques engagent des milliards, où les politiques économiques font ou défont des trajectoires nationales,
                                            <span className="font-semibold text-[#0F3D3E]"> la médiocrité intellectuelle n'est plus une option : elle est une faute.</span>
                                        </p>
                                        <p>
                                            Ici, on apprend à <span className="font-semibold text-[#1FA9A2]">modéliser</span>, à <span className="font-semibold text-[#1FA9A2]">mesurer</span>, à convaincre avec des <span className="font-semibold text-[#1FA9A2]">données</span>.
                                            On apprend à penser avant de parler, à calculer avant de décider.
                                        </p>
                                        <div className="bg-[#F8FAF9] p-5 rounded-xl border-gray-100">
                                            <p className="font-medium text-gray-800">
                                                GAC ACADEMY, c'est l'excellence mise à portée de ceux qui ont la volonté d'y accéder : pas un privilège, une exigence.
                                            </p>
                                        </div>
                                        <p className="text-xl font-bold text-[#0F3D3E] pt-2">
                                            Bienvenue dans l'espace où la compétence devient une identité.
                                        </p>
                                    </div>

                                    <div className="mt-10 flex-wrap gap-4">
                                        <Link
                                            to="/formations"
                                            className="group inline-flex items-center gap-2 bg-gradient-to-r from-[#8DC63F] to-[#1FA9A2] text-white px-8 py-3.5 rounded-xl font-bold shadow-lg shadow-[#8DC63F]/30 hover:shadow-xl hover:shadow-[#8DC63F]/40 transition-all duration-300 hover:-translate-y-0.5"
                                        >
                                            Découvrir nos formations
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                                        </Link>

                                        <Link
                                            to="/a-propos"
                                            className="inline-flex items-center gap-2 bg-white text-[#0F3D3E] px-8 py-3.5 rounded-xl font-semibold border-2 border-gray-200 hover:border-[#8DC63F] transition-all duration-300 hover:bg-[#F8FAF9]"
                                        >
                                            En savoir plus
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS SECTION */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4">
                            Pourquoi choisir GAC?
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
            </section>

            {/* POLES SECTION */}
            <section className="py-20">
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
                        {polesData.map((pole) => (
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
            </section>

        </div>
    )
}