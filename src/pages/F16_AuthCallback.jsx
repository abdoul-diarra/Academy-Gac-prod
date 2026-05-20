import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function F16_AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        const handleAuthCallback = async () => {
            // Attend que Supabase traite le hash dans l'URL
            const { data, error } = await supabase.auth.getSession()

            if (error) {
                console.error('Erreur auth callback:', error)
                navigate('/connexion')
                return
            }

            // Si pas de session fraîche après OAuth, on redirige vers login
            if (!data.session) {
                navigate('/connexion')
                return
            }

            const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/dashboard'
            localStorage.removeItem('redirectAfterLogin')
            localStorage.removeItem('pending_session_id')

            // Si on vient d'une page inscription, vérifie si l'user est déjà inscrit
            if (redirectUrl.includes('/inscription')) {
                const match = redirectUrl.match(/\/formation\/[^/]+\/inscription\/([^/]+)/)
                const sessionId = match ? match[1] : null

                if (sessionId) {
                    const { data: inscription } = await supabase
                        .from('inscriptions')
                        .select('id, statut')
                        .eq('user_id', data.session.user.id)
                        .eq('session_id', sessionId)
                        .maybeSingle()

                    if (!inscription || inscription.statut === 'annulee') {
                        navigate(redirectUrl, { replace: true })
                        return
                    }
                }
            }

            navigate(redirectUrl, { replace: true })
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