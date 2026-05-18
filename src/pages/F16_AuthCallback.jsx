import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function F16_AuthCallback() {
    const navigate = useNavigate()

    useEffect(() => {
        let subscription // déclare-le ici pour y avoir accès partout

        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
            subscription = data.subscription // récupère la sub

            if (event === 'SIGNED_IN' && session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                const redirectTo = localStorage.getItem('redirectAfterLogin') || '/f14-admin'
                localStorage.removeItem('redirectAfterLogin')

                if (redirectTo === '/f14-admin' && profile?.role !== 'admin') {
                    navigate('/dashboard', { replace: true })
                } else {
                    navigate(redirectTo, { replace: true })
                }

                subscription.unsubscribe()
            }
        })

        // Fallback si rien ne se passe en 5s
        const timeout = setTimeout(() => {
            subscription?.unsubscribe()
            navigate('/connexion', { replace: true })
        }, 5000)

        return () => {
            clearTimeout(timeout)
            subscription?.unsubscribe()
        }
    }, [navigate])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[#1FA9A2]" size={32} />
            <p className="ml-3 text-gray-600">Connexion en cours...</p>
        </div>
    )
}