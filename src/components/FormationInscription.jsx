import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function FormationInscription({ formation, session }) {
    const [methode, setMethode] = useState('wave')
    const [reference, setReference] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [numeroDecharge, setNumeroDecharge] = useState('')

    const [userData, setUserData] = useState(null)

    useEffect(() => {
        fetchUserData()
    }, [])

    const fetchUserData = async () => {
        const { data: { user }} = await supabase.auth.getUser()
        if (!user) return

        // Récupère téléphone depuis profiles en priorité
        const { data: profile } = await supabase
            .from('profiles')
            .select('prenom, nom, telephone')
            .eq('id', user.id)
            .single()

        setUserData({
            prenom: profile?.prenom || user.user_metadata?.prenom || '',
            nom: profile?.nom || user.user_metadata?.nom || '',
            email: user.email,
            telephone: profile?.telephone || user.user_metadata?.telephone || ''
        })
    }

    const handlePaiement = async () => {
        if (!reference.trim()) {
            setError('Saisis la référence de transaction')
            return
        }

        setLoading(true)
        setError('')

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setError('Connecte-toi pour t\'inscrire')
            setLoading(false)
            return
        }

        try {
            const { data, error: rpcError } = await supabase.rpc('traiter_paiement_inscription', {
                p_session_id: session.id,
                p_prenom: userData.prenom,
                p_nom: userData.nom,
                p_email: userData.email,
                p_telephone: userData.telephone,
                p_methode: methode, // wave, orange_money, virement, espece
                p_reference: reference.trim(),
                p_montant: formation.prix_fcfa
            })

            if (rpcError) throw new Error(rpcError.message)
            if (data?.erreur) throw new Error(data.erreur)

            setNumeroDecharge(data.numero_decharge)
            setSuccess(true)

        } catch (err) {
            console.error(err)
            setError(err.message || 'Erreur lors du paiement')
        } finally {
            setLoading(false)
        }
    }

    if (success) return (
        <div className="bg-green-50 border-l-4 border-[#8DC63F] p-6 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
                <CheckCircle size={28} className="text-[#8DC63F]" />
                <h3 className="text-xl font-bold text-[#0F3D3E]">Inscription confirmée</h3>
            </div>

            <div className="space-y-2 text-sm text-gray-700">
                <p>Décharge N° <span className="font-mono font-semibold">{numeroDecharge}</span></p>
                <p>Montant payé : <span className="font-semibold">{formation.prix_fcfa?.toLocaleString('fr-FR')} FCFA</span></p>
                <p>Méthode : <span className="font-semibold">{methode.replace('_', ' ').toUpperCase()}</span></p>
                <p>Référence : <span className="font-mono">{reference}</span></p>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded text-sm text-gray-700">
                Tu peux accéder à ta salle virtuelle depuis <strong>Mes Formations</strong>.
                Le lien Zoom sera envoyé 24h avant la session.
            </div>
        </div>
    )

    return (
        <div className="border-gray-200 border p-6 rounded-lg bg-white shadow-sm">
            <h2 className="text-2xl font-bold text-[#0F3D3E]">{formation.appellation_commerciale}</h2>
            <p className="text-3xl font-bold text-[#1FA9A2] mt-4">
                {formation.prix_fcfa?.toLocaleString('fr-FR')} FCFA
            </p>

            <div className="mt-6">
                <label className="block font-semibold text-sm mb-2">Mode de paiement</label>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { value: 'wave', label: 'Wave' },
                        { value: 'orange_money', label: 'Orange Money' },
                        { value: 'virement', label: 'Virement' }
                    ].map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => setMethode(opt.value)}
                            className={`px-4 py-3 rounded-lg text-sm font-semibold transition ${methode === opt.value
                                ? 'bg-[#8DC63F] text-[#0F3D3E]'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-4">
                <label className="block font-semibold text-sm mb-1">
                    Référence transaction *
                </label>
                <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="WV-2026-123456"
                    className="w-full border-gray-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none"
                    required
                />
                <p className="text-xs text-gray-500 mt-1">
                    Copie le numéro de transaction reçu par SMS après paiement
                </p>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center gap-2">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            <button
                onClick={handlePaiement}
                disabled={!reference.trim() || loading}
                className="w-full bg-[#1FA9A2] hover:bg-[#0F3D3E] text-white py-3 rounded-lg mt-6 font-bold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
            >
                {loading && <Loader2 size={18} className="animate-spin" />}
                {loading ? 'Traitement...' : `Payer ${formation.prix_fcfa?.toLocaleString('fr-FR')} FCFA`}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
                CDC §11 : Validation immédiate après paiement. Décharge générée automatiquement.
            </p>
        </div>
    )
}