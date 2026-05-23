import React from 'react'
import { Target, Eye, Heart, MapPin, Phone, Mail, Users, BookOpen, Clock, Award, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

function F04_APropos() {
    const avantages = [
        { icon: Users, title: 'Formateurs experts', desc: 'Économistes-statisticiens avec 10+ ans d’expérience terrain en Afrique de l’Ouest', color: 'from-[#8DC63F] to-[#1FA9A2]' },
        { icon: BookOpen, title: 'Méthode pratique', desc: '70% pratique, 30% théorie. Vous repartez avec des outils utilisables dès le lendemain', color: 'from-[#1FA9A2] to-[#0F3D3E]' },
        { icon: Clock, title: 'Flexibilité', desc: 'Sessions en présentiel, en ligne ou hybride. Replays disponibles 30 jours', color: 'from-[#0F3D3E] to-[#8DC63F]' },
        { icon: Award, title: 'Certification reconnue', desc: 'Certificat GAC reconnu par les organisations publiques et privées de la zone UEMOA/CEDEAO', color: 'from-[#8DC63F] to-[#0F3D3E]' }
    ]

    const processus = [
        { step: '01', title: 'Analyse des besoins', desc: 'Nous échangeons avec vous pour comprendre vos enjeux et objectifs' },
        { step: '02', title: 'Conception sur-mesure', desc: 'Programme adapté à votre contexte et niveau de l’équipe' },
        { step: '03', title: 'Formation intensive', desc: 'Sessions interactives avec cas pratiques et données réelles' },
        { step: '04', title: 'Suivi post-formation', desc: 'Accompagnement 30 jours pour assurer l’application sur le terrain' }
    ]

    return (
        <div className="bg-white font-sans overflow-hidden">

            {/* HERO - Version premium */}
            <div className="relative bg-gradient-to-br from-[#0F3D3E] via-[#145F5F] to-[#1FA9A2] text-white py-28 px-6 overflow-hidden">
                {/* Déco */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#8DC63F]/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#1FA9A2]/30 rounded-full blur-3xl"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                <div className="relative max-w-4xl mx-auto text-center z-10">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 border-white/20">
                        Depuis 2017
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif leading-tight">
                        À propos du Cabinet GAC
                    </h1>
                    <p className="text-xl text-gray-100 max-w-2xl mx-auto leading-relaxed">
                        Structure de référence en étude, conseil et formation pour l’excellence analytique en Afrique de l’Ouest
                    </p>
                </div>
            </div>

            {/* MISSION / VISION / VALEURS */}
            <section className="py-24 px-6 -mt-12 relative z-20">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-6">

                        {[
                            {
                                icon: Target, title: 'Notre Mission', color: 'text-[#8DC63F]', bg: 'bg-[#8DC63F]/10',
                                desc: 'Renforcer les capacités des cadres et décideurs de l’UEMOA/CEDEAO par des formations pratiques, certifiantes et basées sur des données probantes.'
                            },
                            {
                                icon: Eye, title: 'Notre Vision', color: 'text-[#1FA9A2]', bg: 'bg-[#1FA9A2]/10',
                                desc: 'Devenir le hub de référence pour l’excellence analytique et décisionnelle en Afrique de l’Ouest francophone.'
                            },
                            {
                                icon: Heart, title: 'Nos Valeurs', color: 'text-[#0F3D3E]', bg: 'bg-[#0F3D3E]/10',
                                desc: 'Rigueur, Éthique, Innovation et Impact. Nous formons des professionnels qui transforment leurs organisations par la donnée.'
                            }
                        ].map((item, i) => (
                            <div key={i} className="group bg-white/80 backdrop-blur-xl border-gray-100 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon className={item.color} size={28} />
                                </div>
                                <h3 className="text-2xl font-bold text-[#0F3D3E] mb-3 font-serif">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* POURQUOI NOUS CHOISIR */}
            <section className="bg-gradient-to-b from-[#F8FAF9] to-white py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-block w-16 h-1 bg-gradient-to-r from-[#8DC63F] to-[#1FA9A2] rounded-full mb-4"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4 font-serif">Pourquoi choisir GAC Academy</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            Une approche qui allie excellence académique et réalité du terrain
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {avantages.map((item, index) => (
                            <div key={index} className="group bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-400 border-gray-100 hover:border-[#8DC63F]/30">
                                <div className="flex gap-5 items-start">
                                    <div className={`flex-shrink-0 w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className="text-white" size={26} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-xl text-[#0F3D3E] mb-2">{item.title}</h4>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CHIFFRES CLES - Version impact */}
            <section className="relative py-20 px-6 bg-gradient-to-r from-[#0F3D3E] to-[#1FA9A2] overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="relative max-w-5xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-16 font-serif">
                        GAC en chiffres depuis 2017
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        {[
                            { value: '5000+', label: 'Professionnels formés', sub: '+300 par an' },
                            { value: '14', label: 'Formations expertes', sub: '5 pôles d’excellence' },
                            { value: '98%', label: 'Taux de satisfaction', sub: 'Recommandé par nos clients' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border-white/20 hover:bg-white/20 transition-all duration-300">
                                <div className="text-5xl md:text-6xl font-bold text-white mb-3 font-serif">{stat.value}</div>
                                <p className="text-white/90 font-semibold text-lg mb-1">{stat.label}</p>
                                <p className="text-white/70 text-sm">{stat.sub}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROCESSUS */}
            <section className="bg-[#F8FAF9] py-24 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4 font-serif">Notre processus d’accompagnement</h2>
                        <p className="text-gray-600 text-lg">Simple, transparent et orienté résultats</p>
                    </div>

                    <div className="relative">
                        {/* Ligne de connexion desktop */}
                        <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8DC63F] via-[#1FA9A2] to-[#8DC63F] opacity-30"></div>

                        <div className="grid md:grid-cols-4 gap-8 relative">
                            {processus.map((item, index) => (
                                <div key={index} className="relative group">
                                    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-400 h-full border-gray-100">
                                        <div className="w-16 h-16 bg-gradient-to-br from-[#8DC63F] to-[#1FA9A2] rounded-2xl flex items-center justify-center mb-5 shadow-lg">
                                            <span className="text-2xl font-bold text-white font-serif">{item.step}</span>
                                        </div>
                                        <h4 className="font-bold text-xl text-[#0F3D3E] mb-3">{item.title}</h4>
                                        <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* EXPERTISE */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block px-4 py-1.5 bg-[#8DC63F]/10 rounded-full text-sm font-semibold text-[#8DC63F] mb-4">
                                Notre expertise
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-6 font-serif leading-tight">
                                L’excellence analytique au service du développement
                            </h2>
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    Le Cabinet Gaye & Associés Consulting (GAC), basé à Dakar, capitalise une expertise transversale
                                    en économie appliquée, statistique, évaluation des politiques publiques, planification stratégique
                                    et data science.
                                </p>
                                <p>
                                    Fort d'une équipe pluridisciplinaire d'économistes, statisticiens, gestionnaires et formateurs,
                                    GAC se positionne comme un acteur structurant du renforcement des capacités dans la zone
                                    UEMOA/CEDEAO.
                                </p>
                            </div>
                            <Link to="/formations" className="inline-flex items-center gap-2 mt-6 text-[#1FA9A2] font-semibold hover:gap-3 transition-all">
                                Découvrir nos 5 pôles d’excellence
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        <div className="relative">
                            <div className="bg-gradient-to-br from-[#8DC63F] to-[#1FA9A2] p-1 rounded-3xl shadow-2xl">
                                <div className="bg-white rounded-3xl p-8">
                                    <h3 className="font-bold text-xl text-[#0F3D3E] mb-4">Nos 5 pôles d’excellence</h3>
                                    <ul className="space-y-3">
                                        {[
                                            'Policy Impact Lab',
                                            'Economics Power Hub',
                                            'Strategy & Delivery Academy',
                                            'Data Science Factory',
                                            'Leadership & Voice Institute'
                                        ].map((pole, i) => (
                                            <li key={i} className="flex items-center gap-3 text-gray-700">
                                                <div className="w-2 h-2 bg-[#8DC63F] rounded-full"></div>
                                                {pole}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8DC63F]/20 rounded-full blur-2xl -z-10"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CONTACT */}
            <section className="bg-[#0F3D3E] text-white py-20 px-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#8DC63F]/20 rounded-full blur-3xl"></div>
                <div className="relative max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">Nous contacter</h2>
                        <p className="text-gray-300">Notre équipe est disponible pour discuter de vos besoins</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: MapPin, label: 'Siège social', value: 'Apecsy 2, Yoff près de Via-Via\nDakar, Sénégal' },
                            { icon: Phone, label: 'Téléphone', value: '+221 77 765 10 10' },
                            { icon: Mail, label: 'Email', value: 'contact@cabinetgac.com' }
                        ].map((contact, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-sm border-white/10 rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-300">
                                <div className="w-14 h-14 bg-[#8DC63F]/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <contact.icon className="text-[#8DC63F]" size={28} />
                                </div>
                                <p className="font-semibold mb-2 text-lg">{contact.label}</p>
                                <p className="text-gray-300 text-sm whitespace-pre-line">{contact.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    )
}
export default F04_APropos