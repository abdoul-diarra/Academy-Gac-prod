import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function F08_Login() {
    const [email, setEmail] = useState('')
    const [mdp, setMdp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const redirectAfterAuth = searchParams.get('redirect') || '/dashboard'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password: mdp,
            })

            if (error) throw error

            // Redirection auto si y'a une inscription en attente
            const pendingSession = localStorage.getItem('pending_session_id')
            if (pendingSession) {
                localStorage.removeItem('pending_session_id')
                navigate(`/formation/${pendingSession}/inscription`)
            } else {
                navigate(redirectAfterAuth)
            }

        } catch (err) {
            if (err.message.includes('Invalid login credentials')) {
                setError('Email ou mot de passe incorrect')
            } else if (err.message.includes('Email not confirmed')) {
                setError('Email non confirmé. Vérifie ta boîte mail.')
            } else {
                setError(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setLoading(true)
        setError('')
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: ` ${window.location.origin}/auth/callback`
            }
        })
        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F8FAF9] flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="h-16 w-16 bg-[#8DC63F] flex items-center justify-center rounded-lg text-white font-bold text-2xl mx-auto mb-4">
                        GAC
                    </div>
                    <h1 className="text-3xl font-bold text-[#0F3D3E]">Connexion</h1>
                    <p className="text-[#222] mt-2">GAC ACADEMY</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                placeholder="votre@email.com"
                                required
                                autoComplete="email"
                                className="w-full px-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FA9A2] focus:border-[#1FA9A2] outline-none"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-semibold text-gray-700">Mot de passe</label>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-[#1FA9A2] hover:underline"
                                >
                                    {showPassword ? 'Cacher' : 'Afficher'}
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••"
                                    required
                                    autoComplete="current-password"
                                    minLength={6}
                                    className="w-full px-4 py-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1FA9A2] focus:border-[#1FA9A2] outline-none text-lg tracking-widest text-black pr-10"
                                    value={mdp}
                                    onChange={e => setMdp(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-lg text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#8DC63F] text-[#0F3D3E] py-3 rounded-lg font-bold hover:bg-[#7AB836] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? 'Chargement...' : 'Se connecter'}
                        </button>
                    </form>

                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">ou</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                    >
                        Continuer avec Google
                    </button>

                    <div className="mt-4 text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Pas encore de compte?{' '}
                            <a href="/signup" className="text-[#1FA9A2] font-semibold hover:underline">
                                S'inscrire
                            </a>
                        </p>
                        <a href="/" className="text-[#222] hover:text-[#8DC63F] text-sm">
                            ← Retour à l'accueil
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}