import { Link, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function Header() {
    const [open, setOpen] = useState(false)

    const links = [
        { to: '/', label: 'Accueil' },
        { to: '/formations', label: 'Formations' },
        { to: '/promotion', label: 'Promotion' },
        { to: '/a-propos', label: 'À propos' },
        { to: '/blog', label: 'Blog' },
        { to: '/contact', label: 'Contact' },
    ]

    // Ferme le menu mobile quand on repasse en desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) setOpen(false)
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Empêche le scroll quand le menu mobile est ouvert
    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : 'auto'
        return () => { document.body.style.overflow = 'auto' }
    }, [open])

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

                {/* Logo + Texte */}
                <Link to="/" className="flex items-center gap-3 sm:gap-5 shrink-0 group">
                    <img
                        src="/gac-academy.jpeg"
                        alt="GAC Academy"
                        className="h-12 sm:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                    />
                    <div className="border-l-2 border-gray-200 pl-3 sm:pl-5 hidden sm:block">
                        <h1 className="font-bold text-lg sm:text-2xl text-[#0F3D3E] leading-tight">
                            GAC ACADEMY
                        </h1>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                            Etude • Conseil • Formation
                        </p>
                    </div>
                </Link>

                {/* Nav desktop */}
                <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={({ isActive }) =>
                                `relative text-sm lg:text-base font-medium transition-colors py-2 ${isActive
                                    ? 'text-[#1FA9A2]'
                                    : 'text-gray-700 hover:text-[#1FA9A2]'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#1FA9A2] rounded-full"></span>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}

                    <Link
                        to="/connexion"
                        className="text-sm font-semibold text-[#1FA9A2] hover:text-[#0F3D3E] transition-colors"
                    >
                        Se connecter
                    </Link>

                    <Link
                        to="/formations"
                        className="bg-[#8DC63F] text-[#0F3D3E] px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#7AB836] transition-all hover:scale-105 shadow-md"
                    >
                        S'inscrire
                    </Link>
                </nav>

                {/* Burger mobile */}
                <button
                    onClick={() => setOpen(!open)}
                    className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
                    aria-expanded={open}
                >
                    {open ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
                </button>
            </div>

            {/* Menu mobile avec animation */}
            <div
                className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <nav className="px-4 py-3 flex-col gap-2 border-t-gray-200 bg-white">
                    {links.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setOpen(false)}
                            className={({ isActive }) =>
                                `block py-3 px-4 rounded-lg text-base font-medium transition-colors ${isActive
                                    ? 'bg-[#1FA9A2]/10 text-[#1FA9A2]'
                                    : 'text-gray-700 hover:bg-gray-50'
                                }`
                            }
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <div className="pt-2 mt-2 border-t-gray-200 flex-col gap-2">
                        <Link
                            to="/connexion"
                            onClick={() => setOpen(false)}
                            className="block text-center py-3 px-4 rounded-lg font-semibold text-[#1FA9A2] border-gray-200"
                        >
                            Se connecter
                        </Link>
                        <Link
                            to="/formations"
                            onClick={() => setOpen(false)}
                            className="block text-center bg-[#8DC63F] text-[#0F3D3E] py-3 px-4 rounded-lg font-bold"
                        >
                            S'inscrire
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}