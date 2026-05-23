import React, { useState, useEffect } from 'react'
import { X, ArrowLeft, ArrowRight, Users, BookOpen, Award, Calendar } from 'lucide-react'

function Promotion() {
    const [lightbox, setLightbox] = useState({ open: false, index: 0 })
    const [scrollY, setScrollY] = useState(0)

    // 1 seul tableau photos, mets-le ici en haut
    const photos = Array.from({ length: 19 }).map((_, i) => ({
        id: i + 1,
        src: `/images/img${i + 1}.jpeg`,
        alt: `Photo ${i + 1}`,
        caption: `Moment ${i + 1}`
    }));

    const stats = [
        { icon: Users, value: "120+", label: "Étudiants formés" },
        { icon: BookOpen, value: "15", label: "Modules pratiques" },
        { icon: Award, value: "95%", label: "Taux de réussite" },
        { icon: Calendar, value: "6 mois", label: "Durée formation" },
    ]

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in')
                    }
                })
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        )

        document.querySelectorAll('.scroll-animate').forEach(el => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    const openLightbox = (index) => setLightbox({ open: true, index })
    const closeLightbox = () => setLightbox({ open: false, index: 0 })
    const nextPhoto = () => setLightbox(prev => ({ open: true, index: (prev.index + 1) % photos.length }))
    const prevPhoto = () => setLightbox(prev => ({ open: true, index: (prev.index - 1 + photos.length) % photos.length }))

    return (
        <div className="bg-white font-sans overflow-hidden">

            {/* HERO PARALLAX */}
            <div className="relative bg-gradient-to-br from-[#0F3D3E] via-[#145F5F] to-[#1FA9A2] text-white py-32 px-6 overflow-hidden">
                <div
                    className="absolute top-0 left-1/4 w-96 h-96 bg-[#8DC63F]/20 rounded-full blur-3xl"
                    style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                ></div>
                <div
                    className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#1FA9A2]/30 rounded-full blur-3xl"
                    style={{ transform: `translateY(${scrollY * -0.2}px)` }}
                ></div>

                <div className="relative max-w-4xl mx-auto text-center z-10 animate-fade-up">
                    <div className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 border-white/20">
                        Promotion 2025-2026
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif leading-tight">
                        Moments forts de la formation
                    </h1>
                    <p className="text-xl text-gray-100 max-w-2xl mx-auto">
                        Revivez en images les sessions, ateliers et échanges qui ont marqué cette promotion
                    </p>
                </div>
            </div>

            {/* STATS */}
            <section className="py-16 px-6 bg-gray-50">
                <div className="max-w-6xl mx-auto grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center scroll-animate" style={{ animationDelay: `${index * 100}ms` }}>
                            <stat.icon className="w-10 h-10 mx-auto mb-3 text-[#1FA9A2]" />
                            <div className="text-3xl font-bold text-[#0F3D3E] mb-1">{stat.value}</div>
                            <div className="text-gray-600 text-sm">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* GALERIE */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 scroll-animate">
                        <div className="inline-block w-16 h-1 bg-gradient-to-r from-[#8DC63F] to-[#1FA9A2] rounded-full mb-4"></div>
                        <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4 font-serif">
                            Galerie photo
                        </h2>
                        <p className="text-gray-600 text-lg">19 moments capturés pendant la formation</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {photos.map((photo, index) => (
                            <div
                                key={photo.id}
                                onClick={() => openLightbox(index)}
                                className="group relative aspect-[4/3] overflow-hidden rounded-2xl cursor-pointer shadow-md hover:shadow-2xl transition-all duration-500 scroll-animate"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <img
                                    src={photo.src}
                                    alt={photo.alt}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400">
                                        <p className="text-white text-sm font-semibold">{photo.caption}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TEMOIGNAGES */}
            <section className="py-20 px-6 bg-gradient-to-br from-[#0F3D3E] to-[#145F5F] text-white">
                <div className="max-w-4xl mx-auto text-center scroll-animate">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">
                        Une expérience qui marque
                    </h2>
                    <p className="text-xl text-gray-200 leading-relaxed">
                        "Cette formation m'a permis d'acquérir des compétences concrètes en Data Science.
                        L'accompagnement des formateurs et l'esprit de promotion ont fait toute la différence."
                    </p>
                    <div className="mt-6">
                        <div className="font-semibold">Marie K.</div>
                        <div className="text-sm text-gray-300">Promotion 2024</div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center scroll-animate">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4 font-serif">
                        Rejoignez la prochaine promotion
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        Les inscriptions pour la promotion 2026-2027 sont ouvertes
                    </p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-4 bg-gradient-to-r from-[#8DC63F] to-[#1FA9A2] text-white font-semibold rounded-xl hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                    >
                        Candidater maintenant
                    </a>
                </div>
            </section>

            {/* LIGHTBOX */}
            {lightbox.open && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={closeLightbox}>
                    <button onClick={(e) => { e.stopPropagation(); closeLightbox() }} className="absolute top-6 right-6 text-white hover:text-[#8DC63F] transition-colors z-10">
                        <X size={32} />
                    </button>

                    <button onClick={(e) => { e.stopPropagation(); prevPhoto() }} className="absolute left-6 text-white hover:text-[#8DC63F] transition-colors">
                        <ArrowLeft size={40} />
                    </button>

                    <div className="max-w-5xl max-h-[90vh] relative animate-scale-in" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={photos[lightbox.index].src}
                            alt={photos[lightbox.index].alt}
                            className="w-full h-full object-contain rounded-lg"
                        />
                        <p className="text-white text-center mt-4 text-lg">
                            {photos[lightbox.index].caption} • {lightbox.index + 1} / {photos.length}
                        </p>
                    </div>

                    <button onClick={(e) => { e.stopPropagation(); nextPhoto() }} className="absolute right-6 text-white hover:text-[#8DC63F] transition-colors">
                        <ArrowRight size={40} />
                    </button>
                </div>
            )}

        </div>
    )
}

export default Promotion