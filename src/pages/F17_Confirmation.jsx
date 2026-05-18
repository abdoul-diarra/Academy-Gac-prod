import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle, Loader2, ArrowRight, FileText } from 'lucide-react'

export default function F17_Confirmation() {
    const { id } = useParams() // id = inscription_id
    const [inscription, setInscription] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const getData = async () => {
            console.log('ID dans l URL:', id)

            const { data, error } = await supabase
                .from('inscriptions')
                .select(`
                    *,
                    session:sessions(
                        *,
                        formation:formations(*)
                    )
                `)
                .eq('id', id)
                .maybeSingle()

            console.log('Data:', data)
            console.log('Error:', error)

            if (error || !data) {
                setError('Inscription introuvable')
            } else {
                setInscription(data)
                setError('')
            }
            setLoading(false)
        }
        getData()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-[#1FA9A2] mx-auto mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        )
    }

    if (error || !inscription) {
        return (
            <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-sm text-center">
                    <h1 className="text-2xl font-bold text-[#0F3D3E] mb-4">Oups</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        to="/formations"
                        className="inline-block bg-[#1FA9A2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0F3D3E] transition"
                    >
                        Voir les formations
                    </Link>
                </div>
            </div>
        )
    }

    const formation = inscription.session?.formation

    return (
        <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border-gray-100 text-center">

                    <div className="mb-6">
                        <CheckCircle size={64} className="text-[#8DC63F] mx-auto" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4">
                        Inscription confirmée!
                    </h1>

                    <p className="text-xl text-gray-700 mb-4">
                        Pour la formation : <strong className="text-[#0F3D3E]">
                            {formation?.appellation_commerciale || 'Chargement...'}
                        </strong>
                    </p>

                    {/* Bloc Décharge */}
                    {inscription.numero_decharge ? (
                        <div className="bg-green-50 border-[#8DC63F] p-4 mb-6 rounded-lg flex items-center gap-3 justify-center">
                            <FileText size={20} className="text-[#8DC63F]" />
                            <p className="text-[#0F3D3E] font-semibold">
                                N° Décharge : {inscription.numero_decharge}
                            </p>
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border border-yellow-300 p-4 mb-6 rounded-lg">
                            <p className="text-[#0F3D3E] font-semibold">
                                En attente de génération de la décharge
                            </p>
                        </div>
                    )}

                    <div className="bg-blue-50 border-l-4 border-[#1FA9A2] p-4 mb-8 text-left">
                        <p className="text-gray-700">
                            <strong>Prochaine étape :</strong> On te contacte sur WhatsApp dans les 24h
                            pour finaliser ton inscription et le paiement.
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Montant : {inscription.montant} FCFA
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/formations"
                            className="bg-[#1FA9A2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0F3D3E] transition flex items-center justify-center gap-2"
                        >
                            Voir d'autres formations
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            to="/dashboard"
                            className="border-2 border-[#1FA9A2] text-[#1FA9A2] px-6 py-3 rounded-lg font-semibold hover:bg-[#1FA9A2] hover:text-white transition"
                        >
                            Aller au dashboard
                        </Link>
                    </div>

                    <p className="text-xs text-gray-500 mt-8">
                        Une question? Contacte-nous au +221 77 765 10 10
                    </p>
                </div>
            </div>
        </div>
    )
}