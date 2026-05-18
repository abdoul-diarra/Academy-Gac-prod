import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function F12_MonProfil() {
    const [profile, setProfile] = useState(null)
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState('idle') // idle, success, error
    const [errorMsg, setErrorMsg] = useState('')

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            setLoading(false)
            return
        }

        setEmail(user.email || '')

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (error) {
            console.error(error)
        } else {
            setProfile(data)
        }
        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!profile) return

        setSaving(true)
        setStatus('idle')
        setErrorMsg('')

        const { error } = await supabase
            .from('profiles')
            .update({
                prenom: profile.prenom,
                nom: profile.nom,
                telephone: profile.telephone,
                notif_email: profile.notif_email,
                notif_sms: profile.notif_sms,
                updated_at: new Date().toISOString()
            })
            .eq('id', profile.id)

        setSaving(false)

        if (error) {
            setStatus('error')
            setErrorMsg(error.message)
        } else {
            setStatus('success')
            setTimeout(() => setStatus('idle'), 3000)
        }
    }

    const handlePhotoUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file || !profile) return

        const fileExt = file.name.split('.').pop()
        const filePath = `${profile.id}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, file, { upsert: true })

        if (uploadError) {
            setStatus('error')
            setErrorMsg(uploadError.message)
            return
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ photo_url: publicUrl })
            .eq('id', profile.id)

        if (!updateError) {
            setProfile({ ...profile, photo_url: publicUrl })
            setStatus('success')
        }
    }

    const handlePasswordReset = async () => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`
        })
        if (error) alert('Erreur : ' + error.message)
        else alert('Email de réinitialisation envoyé')
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12 flex justify-center">
                <Loader2 size={32} className="animate-spin text-[#1FA9A2]" />
            </div>
        )
    }

    if (!profile) {
        return <div className="container mx-auto px-4 py-12">Profil introuvable</div>
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-4xl font-bold text-[#0F3D3E] mb-8">Mon profil</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border-gray-100 space-y-6">

                {/* Photo de profil */}
                <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden">
                        {profile.photo_url ? (
                            <img src={profile.photo_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                                {profile.prenom?.[0]}{profile.nom?.[0]}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-2">Photo de profil</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1FA9A2] file:text-white file:cursor-pointer hover:file:bg-[#0F3D3E]"
                        />
                    </div>
                </div>

                <h2 className="text-xl font-bold pt-4">Données personnelles</h2>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Prénom</label>
                        <input
                            type="text"
                            className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none"
                            value={profile.prenom || ''}
                            onChange={e => setProfile({ ...profile, prenom: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">Nom</label>
                        <input
                            type="text"
                            className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none"
                            value={profile.nom || ''}
                            onChange={e => setProfile({ ...profile, nom: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Email</label>
                    <input
                        type="email"
                        className="w-full border-gray-300 p-3 rounded-lg bg-gray-50"
                        value={email}
                        disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié ici</p>
                </div>

                <div>
                    <label className="block text-sm font-semibold mb-1">Téléphone</label>
                    <input
                        type="tel"
                        className="w-full border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#1FA9A2] focus:border-transparent outline-none"
                        value={profile.telephone || ''}
                        onChange={e => setProfile({ ...profile, telephone: e.target.value })}
                    />
                </div>

                <h2 className="text-xl font-bold pt-4">Préférences de notification</h2>

                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={profile.notif_email || false}
                            onChange={e => setProfile({ ...profile, notif_email: e.target.checked })}
                            className="w-4 h-4 text-[#1FA9A2] rounded focus:ring-[#1FA9A2]"
                        />
                        <span>Recevoir les notifications par email</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={profile.notif_sms || false}
                            onChange={e => setProfile({ ...profile, notif_sms: e.target.checked })}
                            className="w-4 h-4 text-[#1FA9A2] rounded focus:ring-[#1FA9A2]"
                        />
                        <span>Recevoir les notifications par SMS</span>
                    </label>
                </div>

                {/* Messages d'état */}
                {status === 'success' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 text-green-800 rounded-lg">
                        <CheckCircle size={18} />
                        <span>Profil mis à jour</span>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-800 rounded-lg">
                        <AlertCircle size={18} />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="pt-4 border-t flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handlePasswordReset}
                        className="text-[#1FA9A2] text-sm font-semibold hover:underline"
                    >
                        Changer le mot de passe
                    </button>

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#8DC63F] text-[#0F3D3E] px-6 py-2 rounded-lg font-bold hover:bg-[#8DC63F]/90 transition disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving && <Loader2 size={18} className="animate-spin" />}
                        Enregistrer
                    </button>
                </div>
            </form>
        </div>
    )
}