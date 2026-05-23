import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ArrowRight, Filter, Headphones, FileText, BarChart3, ExternalLink } from 'lucide-react'

const POLES_COLOR = {
    'DATA SCIENCE FACTORY': '#8DC63F',
    'POLICY IMPACT LAB': '#1FA9A2',
    'STRATEGY & DELIVERY': '#0F3D3E',
    'ECONOMICS POWER HUB': '#1FA9A2',
    'LEADERSHIP & VOICE': '#8DC63F'
}

const TYPE_ICON = {
    'Article': FileText,
    'Podcast': Headphones,
    'Infographie': BarChart3,
    'Événement': Clock
}

function F06_Blog() {
    const [filterType, setFilterType] = useState('Tous')

    const articles = [
        {
            id: 1,
            titre: "Les Échos de l'Éco #XX : Titre de la vidéo",
            date: "22 mai 2026",
            tag: "POLICY IMPACT LAB",
            type: "Podcast",
            excerpt: "Résumé court de la vidéo pour donner envie de cliquer. Change ça avec le vrai sujet de la vidéo.",
            image: "https://img.youtube.com/vi/ZXkvIX37nrY/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/ZXkvIX37nrY"
        },
        {
            id: 2,
            titre: "Vidéo GAC #4",
            date: "22 mai 2026",
            tag: "ECONOMICS POWER HUB",
            type: "Podcast",
            excerpt: "Remplace par le résumé de la vidéo",
            image: "https://img.youtube.com/vi/7S__44lwJEM/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/7S__44lwJEM"
        },


        {
            id: 3,
            titre: "Titre de la vidéo",
            date: "22 mai 2026",
            tag: "POLICY IMPACT LAB",
            type: "Podcast",
            excerpt: "Résumé court de la vidéo",
            image: "https://img.youtube.com/vi/Vv4TUHMJ9RY/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/Vv4TUHMJ9RY"
        },
        {
            id: 5,
            titre: "Vidéo GAC #1",
            date: "22 mai 2026",
            tag: "POLICY IMPACT LAB",
            type: "Podcast",
            excerpt: "Remplace par le résumé de la vidéo",
            image: "https://img.youtube.com/vi/y1c_onSU3zo/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/y1c_onSU3zo"
        },
        {
            id: 3,
            titre: "Titre de la vidéo",
            date: "22 mai 2026",
            tag: "POLICY IMPACT LAB",
            type: "Podcast",
            excerpt: "Résumé court de la vidéo",
            image: "https://img.youtube.com/vi/ty-K8SgqhQ8/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/ty-K8SgqhQ8"
        },

        {
            id: 6,
            titre: "Vidéo GAC #3",
            date: "22 mai 2026",
            tag: "STRATEGY & DELIVERY",
            type: "Podcast",
            excerpt: "Remplace par le résumé de la vidéo",
            image: "https://img.youtube.com/vi/Tkp5JtV1NhE/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/Tkp5JtV1NhE"
        },

        {
            id: 7,
            titre: "Vidéo GAC #2",
            date: "22 mai 2026",
            tag: "DATA SCIENCE FACTORY",
            type: "Podcast",
            excerpt: "Remplace par le résumé de la vidéo",
            image: "https://img.youtube.com/vi/6nVnz_uqCE8/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/6nVnz_uqCE8"
        },

        {
            id: 8,
            titre: "Titre de la vidéo",
            date: "22 mai 2026",
            tag: "POLICY IMPACT LAB",
            type: "Podcast",
            excerpt: "Résumé court de la vidéo",
            image: "https://img.youtube.com/vi/oi3CBI8rP6U/maxresdefault.jpg",
            readTime: "XX min",
            youtubeLink: "https://youtu.be/oi3CBI8rP6U"
        }


    ]

    const types = ['Tous', 'Article', 'Podcast', 'Infographie', 'Événement']
    const filteredArticles = filterType === 'Tous'
        ? articles
        : articles.filter(a => a.type === filterType)

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* HERO */}
            <section className="bg-white border-b">
                <div className="container mx-auto px-4 py-16">
                    <div className="max-w-3xl">
                        <h1 className="text-4xl md:text-5xl font-bold text-[#0F3D3E] mb-4">
                            Blog & Ressources
                        </h1>
                        <p className="text-lg text-gray-600">
                            Articles, podcasts, infographies, échos économiques, événements (Les Échos de l'Éco)
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-12">

                {/* FILTRES */}
                <div className="mb-10 flex gap-3 overflow-x-auto pb-2">
                    {types.map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-5 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${filterType === type
                                ? 'bg-[#0F3D3E] text-white shadow-lg'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-[#1FA9A2]'
                                }`}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* GRID ARTICLES */}
                {filteredArticles.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl">
                        <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">Aucun contenu pour ce filtre</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map((a, idx) => {
                            const Icon = TYPE_ICON[a.type] || FileText
                            const color = POLES_COLOR[a.tag] || '#1FA9A2'

                            return (
                                <article
                                    key={a.id}
                                    className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex-col"
                                    style={{ animationDelay: `${idx * 80}ms` }}
                                >
                                    {/* IMAGE */}
                                    <div className="relative h-48 overflow-hidden">
                                        <img
                                            src={a.image}
                                            alt={a.titre}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                        {/* BADGES */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <span
                                                className="text-xs font-bold text-white px-3 py-1.5 rounded-full backdrop-blur-sm"
                                                style={{ backgroundColor: `${color}CC ` }}
                                            >
                                                {a.tag}
                                            </span>
                                            <span className="text-xs font-bold bg-white/90 text-gray-800 px-3 py-1.5 rounded-full flex items-center gap-1">
                                                <Icon size={14} />
                                                {a.type}
                                            </span>
                                        </div>

                                        {/* TEMPS DE LECTURE */}
                                        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                                            {a.readTime}
                                        </div>
                                    </div>

                                    {/* CONTENU */}
                                    <div className="p-6 flex-1 flex-col">
                                        <div className="text-xs text-gray-500 mb-2">{a.date}</div>

                                        <h2 className="text-xl font-bold text-[#0F3D3E] mb-3 line-clamp-2 group-hover:text-[#1FA9A2] transition-colors">
                                            {a.titre}
                                        </h2>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                                            {a.excerpt}
                                        </p>

                                        {/* CTA CONDITIONNEL */}
                                        {a.youtubeLink ? (
                                            <a
                                                href={a.youtubeLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-[#1FA9A2] font-semibold group-hover:gap-3 transition-all mt-auto"
                                            >
                                                Regarder sur YouTube
                                                <ExternalLink size={18} />
                                            </a>
                                        ) : (
                                            <Link
                                                to={`/blog/${a.id}`}
                                                className="inline-flex items-center gap-2 text-[#1FA9A2] font-semibold group-hover:gap-3 transition-all mt-auto"
                                            >
                                                Lire / Écouter
                                                <ArrowRight size={18} />
                                            </Link>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                )}

                {/* NEWSLETTER CTA */}
                <div className="mt-16 bg-gradient-to-r from-[#0F3D3E] to-[#1FA9A2] rounded-3xl p-8 md:p-12 text-white text-center">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                        Ne ratez aucun contenu
                    </h3>
                    <p className="text-white/90 mb-6 max-w-2xl mx-auto">
                        Recevez nos derniers articles, podcasts et invitations aux événements directement dans votre boîte mail.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder="votre@email.com"
                            className="flex-1 px-5 py-3 rounded-lg text-gray-900 outline-none"
                        />
                        <button className="bg-[#8DC63F] hover:bg-[#7AB836] text-[#0F3D3E] px-6 py-3 rounded-lg font-bold transition-all hover:scale-105">
                            S'abonner
                        </button>
                    </div>
                    <p className="text-xs text-white/70 mt-4">
                        Pas de spam. Désabonnement en 1 clic.
                    </p>
                </div>
            </div>
        </div>
    )
}
export default F06_Blog