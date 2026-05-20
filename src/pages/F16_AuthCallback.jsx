import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function F16_AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleAuthCallback = async () => {
            const { data: { session }, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Erreur auth callback:', error)
                navigate('/connexion')
                return
            }

            if (!session) {
                navigate('/connexion')
                return
            }

            const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/dashboard'
            localStorage.removeItem('redirectAfterLogin')
            localStorage.removeItem('pending_session_id')

            // Si on vient d'une page inscription, vérifie si l'user est déjà inscrit
            if (redirectUrl.includes('/inscription')) {
                const sessionId = redirectUrl.split('/formation/')[1]?.split('/inscription')[0]

                if (sessionId) {
                    const { data: inscription } = await supabase
                        .from('inscriptions')
                        .select('id, statut')
                        .eq('user_id', session.user.id)
                        .eq('session_id', sessionId)
                        .maybeSingle()

                    // Pas d'inscription ou annulée → on garde la redirection vers le formulaire
                    if (!inscription || inscription.statut === 'annulee') {
                        navigate(redirectUrl)
                        return
                    }
                }
            }

            // Sinon go dashboard ou autre page prévue
            navigate(redirectUrl)
        }

        handleAuthCallback()
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9]">
            <div className="text-center">
                <Loader2 size={40} className="animate-spin text-[#1FA9A2] mx-auto mb-4" />
                <p className="text-gray-600">Connexion en cours...</p>
            </div>
        </div>
    )
}