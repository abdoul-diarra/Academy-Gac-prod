import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const [loading, setLoading] = useState(true)
    const [authState, setAuthState] = useState('checking')
    const location = useLocation()

    useEffect(() => {
        checkAuth()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            checkAuth()
        })

        return () => subscription.unsubscribe()
    }, [requireAdmin, location.pathname])

    const checkAuth = async () => {
        setLoading(true)

        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            setAuthState('not_authed')
            setLoading(false)
            return
        }

        if (requireAdmin) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single()

            if (error || profile?.role !== 'admin') {
                setAuthState('not_admin')
                setLoading(false)
                return
            }
        }

        setAuthState('authed')
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#F8FAF9]">
                <div className="text-center">
                    <Loader2 size={40} className="animate-spin text-[#1FA9A2] mx-auto mb-4" />
                    <p className="text-gray-600">Vérification de l'accès...</p>
                </div>
            </div>
        )
    }

    if (authState === 'not_authed') {
        return <Navigate to="/connexion" state={{ from: location }} replace />
    }

    if (authState === 'not_admin') {
        return <Navigate to="/dashboard" replace />
    }

    return children
}