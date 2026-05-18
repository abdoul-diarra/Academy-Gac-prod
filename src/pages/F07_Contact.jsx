import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export default function F07_Contact() {
    const [form, setForm] = useState({
        nom: '',
        email: '',
        telephone: '',
        sujet: '',
        message: ''
    })
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null) // null, 'success', 'error'
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setStatus(null)
        setErrorMsg('')

        const { error } = await supabase
            .from('contacts')
            .insert({
                nom: form.nom,
                email: form.email,
                telephone: form.telephone,
                sujet: form.sujet,
                message: form.message
            })

        if (error) {
            setStatus('error')
            setErrorMsg(error.message)
        } else {
            setStatus('success')
            setForm({ nom: '', email: '', telephone: '', sujet: '', message: '' })
        }
        setLoading(false)
    }

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    return (
        <div className="bg-gray-50 min-h-screen">

            {/* HERO */}
            <section className="bg-gradient-to-br from-[#0F3D3E] via-[#1FA9A2] to-[#8DC63F] py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-3xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Contactez-nous
                        </h1>
                        <p className="text-xl text-white/90">
                            Une question sur une formation, un projet de conseil, un partenariat ? On vous répond.
                        </p>
                    </div>
                </div>
            </section>

            <div className="container mx-auto px-4 py-16">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">

                    {/* COLONNE GAUCHE : INFOS */}
                    <div className="lg:col-span-1 space-y-6">

                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-[#0F3D3E] mb-4">Nos coordonnées</h3>

                            <div className="space-y-4">
                                <a href="tel:+221777651010" className="flex items-start gap-3 group">
                                    <Phone size={20} className="text-[#8DC63F] flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-[#0F3D3E]">Téléphone</p>
                                        <p className="text-gray-600 group-hover:text-[#1FA9A2] transition">+221 77 765 10 10</p>
                                    </div>
                                </a>

                                <a href="mailto:contact@cabinetgac.com" className="flex items-start gap-3 group">
                                    <Mail size={20} className="text-[#8DC63F] flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-[#0F3D3E]">Email</p>
                                        <p className="text-gray-600 group-hover:text-[#1FA9A2] transition">contact@cabinetgac.com</p>
                                    </div>
                                </a>

                                <div className="flex items-start gap-3">
                                    <MapPin size={20} className="text-[#8DC63F] flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-[#0F3D3E]">Adresse</p>
                                        <p className="text-gray-600">Apecsy 2, Yoff près de Via-Via<br />Dakar, Sénégal</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock size={20} className="text-[#8DC63F] flex-shrink-0 mt-1" />
                                    <div>
                                        <p className="font-semibold text-[#0F3D3E]">Horaires</p>
                                        <p className="text-gray-600">Lun - Ven : 8h30 - 17h30 GMT</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MAP */}
                        <div className="bg-white rounded-2xl overflow-hidden shadow-sm h-64">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3858.123456789!2d-17.4!3d14.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTTCsDQyJzAwLjAiTiAxN8KwMjQnMDAuMCJX!5e0!3m2!1sfr!2ssn!4v1234567890"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>

                        {/* TEMPS DE RÉPONSE */}
                        <div className="bg-[#0F3D3E] rounded-2xl p-6 text-white">
                            <h4 className="font-bold mb-2">Temps de réponse moyen</h4>
                            <p className="text-white/80 text-sm">
                                Nous répondons sous 1 à 4h ouvrées. Pour les demandes urgentes, appelez-nous directement.
                            </p>
                        </div>
                    </div>

                    {/* COLONNE DROITE : FORMULAIRE */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-8 shadow-sm">

                            {status === 'success' ? (
                                <div className="text-center py-12">
                                    <CheckCircle size={64} className="text-[#8DC63F] mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-[#0F3D3E] mb-2">Message envoyé !</h3>
                                    <p className="text-gray-600 mb-6">
                                        Merci pour votre message. Nous revenons vers vous rapidement.
                                    </p>
                                    <button
                                        onClick={() => setStatus(null)}
                                        className="text-[#1FA9A2] font-semibold hover:underline"
                                    >
                                        Envoyer un autre message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-[#0F3D3E] mb-6">
                                        Envoyez-nous un message
                                    </h2>

                                    {status === 'error' && (
                                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6 flex items-start gap-3">
                                            <AlertCircle size={20} className="text-red-600 flex-shrink-0" />
                                            <div>
                                                <p className="font-semibold text-red-800">Erreur d'envoi</p>
                                                <p className="text-sm text-red-700">{errorMsg}</p>
                                            </div>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F3D3E] mb-2">
                                                    Nom complet *
                                                </label>
                                                <input
                                                    type="text"
                                                    name="nom"
                                                    placeholder="Votre nom"
                                                    value={form.nom}
                                                    onChange={handleChange}
                                                    className="w-full p-3.5 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none transition"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F3D3E] mb-2">
                                                    Email *
                                                </label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    placeholder="votre@email.com"
                                                    value={form.email}
                                                    onChange={handleChange}
                                                    className="w-full p-3.5 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none transition"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F3D3E] mb-2">
                                                    Téléphone
                                                </label>
                                                <input
                                                    type="tel"
                                                    name="telephone"
                                                    placeholder="+221 77 000 00 00"
                                                    value={form.telephone}
                                                    onChange={handleChange}
                                                    className="w-full p-3.5 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none transition"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-[#0F3D3E] mb-2">
                                                    Sujet *
                                                </label>
                                                <select
                                                    name="sujet"
                                                    value={form.sujet}
                                                    onChange={handleChange}
                                                    className="w-full p-3.5 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none transition bg-white"
                                                    required
                                                >
                                                    <option value="">Choisissez un sujet</option>
                                                    <option value="formation">Information formation</option>
                                                    <option value="conseil">Demande de conseil</option>
                                                    <option value="partenariat">Partenariat</option>
                                                    <option value="autre">Autre</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-[#0F3D3E] mb-2">
                                                Message *
                                            </label>
                                            <textarea
                                                name="message"
                                                placeholder="Décrivez votre demande en quelques lignes..."
                                                rows="6"
                                                value={form.message}
                                                onChange={handleChange}
                                                className="w-full p-3.5 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none transition resize-none"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-[#8DC63F] hover:bg-[#7AB836] text-[#0F3D3E] px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 size={20} className="animate-spin" />
                                                    Envoi en cours...
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={20} />
                                                    Envoyer le message
                                                </>
                                            )}
                                        </button>

                                        <p className="text-xs text-gray-500 text-center">
                                            En envoyant ce formulaire, vous acceptez que vos données soient utilisées pour vous recontacter.
                                        </p>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}