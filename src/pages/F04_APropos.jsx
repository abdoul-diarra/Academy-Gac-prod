import { useState } from 'react'
import { Quote, MapPin, Phone, Mail, Target, Eye, Heart, Award } from 'lucide-react'

function F04_APropos() {
    const [showMore, setShowMore] = useState(false)

    const valeurs = [
        {
            icon: Target,
            titre: 'Excellence',
            desc: 'Des standards élevés sur chaque formation, chaque conseil, chaque étude.'
        },
        {
            icon: Heart,
            titre: 'Impact',
            desc: 'Notre objectif : transformer vos compétences en résultats mesurables sur le terrain.'
        },
        {
            icon: Eye,
            titre: 'Rigueur',
            desc: 'Méthodes scientifiques, données probantes, analyses sans concession.'
        }
    ]

    return (
        <div className="bg-white">

            {/* HERO */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#0F3D3E] via-[#1FA9A2] to-[#8DC63F] py-20">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            À propos du Cabinet GAC
                        </h1>
                        <p className="text-xl text-white/90">
                            8 ans d’expertise au service du renforcement des capacités en Afrique de l’Ouest
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-5xl mx-auto">

                    {/* MOT DU DIRECTEUR */}
                    <div className="bg-gradient-to-r from-[#0F3D3E] to-[#1FA9A2] rounded-3xl p-8 md:p-12 mb-16 relative overflow-hidden">
                        <Quote size={64} className="absolute top-6 left-6 text-white/10" />

                        <div className="relative z-10">
                            <h2 className="text-3xl font-bold text-white mb-6">Mot du Directeur</h2>

                            <p className="text-xl md:text-2xl text-white/95 italic leading-relaxed mb-8">
                                "La formation est un levier stratégique de transformation des idées en actions et des intentions en impacts."
                            </p>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-[#8DC63F] rounded-full flex items-center justify-center text-[#0F3D3E] font-bold text-xl">
                                    BG
                                </div>
                                <div>
                                    <p className="font-bold text-white text-lg">Babacar GAYE</p>
                                    <p className="text-white/80">Économiste-Statisticien, Directeur</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTRE HISTOIRE */}
                    <div className="mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-6">
                            Notre expertise depuis 2017
                        </h2>

                        <div className="grid md:grid-cols-2 gap-8 items-start">
                            <div className="space-y-4 text-gray-700 leading-relaxed">
                                <p>
                                    Le Cabinet Gaye & Associés Consulting (GAC), structure de référence en étude, conseil et formation basée à Dakar,
                                    capitalise une expertise transversale en économie appliquée, statistique, évaluation des politiques publiques,
                                    planification stratégique et data science.
                                </p>
                                <p>
                                    Fort d'une équipe pluridisciplinaire d'économistes, statisticiens, gestionnaires et formateurs, GAC se positionne
                                    comme un acteur structurant du renforcement des capacités dans la zone UEMOA/CEDEAO.
                                </p>

                                {!showMore && (
                                    <button
                                        onClick={() => setShowMore(true)}
                                        className="text-[#1FA9A2] font-semibold hover:underline"
                                    >
                                        Lire la suite →
                                    </button>
                                )}
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6">
                                <img
                                    src="gac-academy.jpeg"
                                    alt="Cabinet GAC Dakar"
                                    className="rounded-xl w-full object-cover"
                                />
                            </div>
                        </div>

                        {showMore && (
                            <div className="mt-6 space-y-4 text-gray-700 leading-relaxed animate-fadeIn">
                                <p>
                                    Depuis 2017, nous accompagnons des institutions publiques, ONG, entreprises et organisations internationales
                                    dans l'analyse de données, l'évaluation d'impact et le développement de compétences techniques.
                                </p>
                                <p>
                                    Notre approche combine rigueur académique et pragmatisme opérationnel. Chaque formation est co-construite
                                    avec des praticiens pour garantir une application immédiate sur le terrain.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* CHIFFRES CLES */}
                    <div className="bg-gray-50 rounded-3xl p-8 md:p-12 mb-16">
                        <h2 className="text-3xl font-bold text-[#0F3D3E] mb-10 text-center">Nos chiffres clés</h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <div className="text-5xl md:text-6xl font-bold text-[#8DC63F] mb-2">5000+</div>
                                <p className="text-gray-700 font-medium">Apprenants formés</p>
                                <p className="text-sm text-gray-500 mt-1">Depuis 2017</p>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl md:text-6xl font-bold text-[#1FA9A2] mb-2">14</div>
                                <p className="text-gray-700 font-medium">Formations expertes</p>
                                <p className="text-sm text-gray-500 mt-1">5 pôles d'excellence</p>
                            </div>
                            <div className="text-center">
                                <div className="text-5xl md:text-6xl font-bold text-[#0F3D3E] mb-2">98%</div>
                                <p className="text-gray-700 font-medium">Satisfaction</p>
                                <p className="text-sm text-gray-500 mt-1">Taux de recommandation</p>
                            </div>
                        </div>
                    </div>

                    {/* VALEURS */}
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-[#0F3D3E] mb-10 text-center">Nos valeurs</h2>

                        <div className="grid md:grid-cols-3 gap-6">
                            {valeurs.map((valeur, idx) => (
                                <div
                                    key={idx}
                                    className="bg-white border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-[#8DC63F] transition-all hover:-translate-y-1"
                                >
                                    <valeur.icon size={40} className="text-[#8DC63F] mb-4" />
                                    <h3 className="text-xl font-bold text-[#0F3D3E] mb-2">{valeur.titre}</h3>
                                    <p className="text-gray-600">{valeur.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CONTACT */}
                    <div className="bg-[#0F3D3E] rounded-3xl p-8 md:p-12 text-white">
                        <div className="max-w-2xl mx-auto text-center">
                            <h2 className="text-3xl font-bold mb-6">Rendez-nous visite</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-3">
                                    <MapPin size={20} className="text-[#8DC63F]" />
                                    <p>Apecsy 2, Yoff près de Via-Via — Dakar, Sénégal</p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
                                    <a href="tel:+221777651010" className="flex items-center gap-2 hover:text-[#8DC63F] transition">
                                        <Phone size={18} />
                                        +221 77 765 10 10
                                    </a>
                                    <a href="mailto:contact@cabinetgac.com" className="flex items-center gap-2 hover:text-[#8DC63F] transition">
                                        <Mail size={18} />
                                        contact@cabinetgac.com
                                    </a>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/20">
                                <p className="text-white/80 text-sm">
                                    Ouvert du lundi au vendredi, 8h30 - 17h30 GMT
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
export default F04_APropos