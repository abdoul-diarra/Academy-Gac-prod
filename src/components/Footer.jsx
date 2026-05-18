import { Link } from 'react-router-dom'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const liensRapides = [
        { name: 'Accueil', path: '/' },
        { name: 'Formations', path: '/formations' },
        { name: 'À propos', path: '/a-propos' },
        { name: 'Blog', path: '/blog' },
        { name: 'Contact', path: '/contact' },
    ]

    const poles = [
        { name: 'POLICY IMPACT LAB', filter: 'policy-impact-lab' },
        { name: 'ECONOMICS POWER HUB', filter: 'economics-power-hub' },
        { name: 'STRATEGY & DELIVERY', filter: 'strategy-delivery-academy' },
        { name: 'DATA SCIENCE FACTORY', filter: 'data-science-factory' },
        { name: 'LEADERSHIP & VOICE', filter: 'leadership-voice-institute' }
    ]

    return (
        <footer className="bg-[#0F3D3E] text-white">

            {/* TOP SECTION */}
            <div className="container mx-auto px-4 py-12 lg:py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* 1. Bloc GAC */}
                    <div>
                        <Link to="/" className="flex items-center gap-3 mb-4 group">
                            <div className="h-12 w-12 bg-[#8DC63F] flex items-center justify-center rounded-xl text-white font-bold text-xl 
                                            group-hover:scale-105 transition-transform shadow-lg">
                                GAC
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">GAC ACADEMY</h3>
                                <p className="text-xs text-white/70">Étude • Conseil • Formation</p>
                            </div>
                        </Link>

                        <p className="text-sm text-white/70 leading-relaxed">
                            Depuis 2017, référence en économie appliquée, évaluation des politiques publiques et renforcement des capacités
                            dans l'espace UEMOA/CEDEAO.
                        </p>
                    </div>

                    {/* 2. Navigation */}
                    <div>
                        <h4 className="font-bold text-[#1FA9A2] mb-4 text-sm uppercase tracking-wider">Navigation</h4>
                        <ul className="space-y-3">
                            {liensRapides.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block"
                                    >
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Pôles */}
                    <div>
                        <h4 className="font-bold text-[#1FA9A2] mb-4 text-sm uppercase tracking-wider">Nos Pôles</h4>
                        <ul className="space-y-3">
                            {poles.map((pole) => (
                                <li key={pole.filter}>
                                    <Link
                                        to={`/formations?pole=${pole.filter}`}
                                        className="text-sm text-white/80 hover:text-white hover:translate-x-1 transition-all inline-block"
                                    >
                                        {pole.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 4. Contact */}
                    <div>
                        <h4 className="font-bold text-[#1FA9A2] mb-4 text-sm uppercase tracking-wider">Contact</h4>
                        <ul className="space-y-4 text-sm text-white/80">

                            <li>
                                <p className="font-semibold text-white mb-1">Adresse</p>
                                <p>Apecsy 2, Yoff près de Via-Via<br />Dakar, Sénégal</p>
                            </li>

                            <li>
                                <p className="font-semibold text-white mb-1">Téléphone</p>
                                <a href="tel:+221777651010" className="hover:text-[#8DC63F] transition-colors">
                                    +221 77 765 10 10
                                </a>
                            </li>

                            <li>
                                <p className="font-semibold text-white mb-1">Email</p>
                                <a href="mailto:contact@cabinetgac.com" className="hover:text-[#8DC63F] transition-colors">
                                    contact@cabinetgac.com
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="border-t border-white/10 bg-black/20">
                <div className="container mx-auto px-4 py-5">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/60">
                        <p>© {currentYear} Cabinet Gaye & Associés Consulting. Tous droits réservés.</p>

                        <div className="flex gap-6">
                            <Link to="/mentions-legales" className="hover:text-[#8DC63F] transition-colors">Mentions légales</Link>
                            <Link to="/confidentialite" className="hover:text-[#8DC63F] transition-colors">Confidentialité</Link>
                            <Link to="/cgv" className="hover:text-[#8DC63F] transition-colors">CGV</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}