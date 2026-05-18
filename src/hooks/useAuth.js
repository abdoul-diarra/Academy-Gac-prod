import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useAuth = () => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Récupère l'user au chargement
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
            setLoading(false)
        }

        getUser()

        // Écoute les changements de connexion/déconnexion
        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })

        return () => {
            listener.subscription.unsubscribe()
        }
    }, [])

    return { user, loading }
}