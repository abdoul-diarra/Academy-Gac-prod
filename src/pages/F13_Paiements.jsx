import { useState, useEffect } from 'react'
import { Download, ExternalLink, Receipt, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function F13_Paiements({ session }) {
    const [paiements, setPaiements] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadPaiements()
    }, [session])

    const loadPaiements = async () => {
        try {
            const { data, error } = await supabase
                .from('paiements')
                .select(`
          *,
          inscriptions(
            sessions(
              formations(appellation_commerciale)
            )
          ),
          decharges(url_pdf, numero_decharge, token_verification)
        `)
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setPaiements(data || [])
        } catch (error) {
            console.error('Erreur chargement paiements:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatutBadge = (statut) => {
        switch (statut) {
            case 'valide':
                return 'bg-green-100 text-green-800'
            case 'en_attente':
                return 'bg-yellow-100 text-yellow-800'
            case 'echoue':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getMethodeBadge = (methode) => {
        switch (methode) {
            case 'mobile_money':
                return 'bg-blue-100 text-blue-800'
            case 'carte':
                return 'bg-purple-100 text-purple-800'
            case 'virement':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FA9A2]"></div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-[#0F3D3E] flex items-center gap-3">
                    <Receipt size={32} />
                    Mes Paiements & Décharges
                </h1>
                <p className="text-gray-600 mt-2">
                    Historique de tes transactions et téléchargement des décharges
                </p>
            </div>

            {paiements.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border-gray-200 p-12 text-center">
                    <Receipt size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg mb-4">Aucun paiement trouvé</p>
                    <p className="text-gray-400 text-sm">
                        Tes factures et décharges apparaîtront ici après un paiement
                    </p>
                </div>
            ) : (
                <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold text-gray-700">Formation</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-700">Montant</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-700">Date</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-700">Méthode</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-700">Référence</th>
                                <th className="text-left p-4 text-sm font-semibold text-gray-700">Décharge</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paiements.map(p => {
                                const formation = p.inscriptions?.sessions?.formations?.appellation_commerciale
                                return (
                                    <tr key={p.id} className="border-t hover:bg-gray-50">
                                        <td className="p-4 font-semibold text-[#0F3D3E]">
                                            {formation || 'N/A'}
                                        </td>
                                        <td className="p-4 font-bold">
                                            {p.montant?.toLocaleString('fr-FR')} FCFA
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            {new Date(p.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getMethodeBadge(p.methode_paiement)}`}>
                                                {p.methode_paiement?.replace('_', '')}
                                            </span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-600 font-mono">
                                            {p.reference_transaction}
                                        </td>
                                        <td className="p-4">
                                            {p.decharges ? (
                                                <div className="flex flex-col gap-1">
                                                    <a
                                                        href={p.decharges.url_pdf || '#'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[#1FA9A2] font-semibold text-sm flex items-center gap-1 hover:underline"
                                                    >
                                                        <Download size={16} />
                                                        {p.decharges.numero_decharge}.pdf
                                                    </a>
                                                    <a
                                                        href={`/verify/${p.decharges.token_verification}`}
                                                        target="_blank"
                                                        className="text-xs text-gray-500 flex items-center gap-1 hover:text-[#1FA9A2]"
                                                    >
                                                        <ExternalLink size={12} />
                                                        Vérifier QR Code
                                                    </a>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">Génération en cours</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}