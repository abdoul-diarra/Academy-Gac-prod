import jsPDF from 'jspdf'
import { useParams, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { CheckCircle, Loader2, ArrowRight, FileText, Download, Video } from 'lucide-react'

export default function F17_Confirmation() {
    const { id } = useParams()
    const location = useLocation()

    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [inscription, setInscription] = useState(null)
    const [decharge, setDecharge] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [generating, setGenerating] = useState(false)
    const [successMessage] = useState(location.state?.message || '')

    useEffect(() => {
        loadData()
    }, [id])

    const loadData = async () => {
        try {
            setLoading(true)
            setError('')

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError('Non connecté')
                setLoading(false)
                return
            }
            setUser(user)

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()
            setProfile(profile)

            const { data, error } = await supabase
                .from('inscriptions')
                .select(`
                    *,
                    session:sessions(
                        *,
                        formation:formations(*)
                    ),
                    decharges(*)
                `)
                .eq('id', id)
                .maybeSingle()

            if (error) {
                setError('Erreur de chargement')
            } else if (!data) {
                setError('Inscription introuvable ou accès non autorisé')
            } else {
                setInscription(data)
                setDecharge(data.decharges?.[0] || null)
            }
        } catch (err) {
            console.error('Erreur loadData:', err)
            setError('Erreur de chargement')
        } finally {
            setLoading(false)
        }
    }

    const generateAndUploadPDF = async () => {
        if (!inscription || !decharge) return

        setGenerating(true)
        try {
            const fileName = `${decharge.numero_decharge}.pdf`

            // 1. Supprime l'ancien fichier pour forcer l'écrasement
            await supabase.storage.from('decharges').remove([fileName])

            // 2. Génère le PDF avec le texte complet
            const doc = new jsPDF()
            const dateStr = new Date().toLocaleDateString('fr-FR')

            const texte = `
DÉCHARGE DE RESPONSABILITÉ

Nous, GAC Academy, dont le siège est à Thiès, Sénégal,

Attestons que ${inscription.prenom_contact} ${inscription.nom_contact} s’est inscrit(e)
à la formation "${inscription.session.formation.appellation_commerciale}".

L’étudiant(e) reconnaît avoir pris connaissance du programme, des conditions d’inscription
et du règlement intérieur de GAC Academy.

Par la présente, l’étudiant(e) décharge GAC Academy de toute responsabilité concernant
les accidents, pertes ou dommages survenant en dehors du fait direct de GAC Academy.

L’étudiant(e) s’engage à respecter les consignes de sécurité et de conduite durant la formation.
Cette décharge est signée avant le démarrage de la session.

L’étudiant(e) confirme avoir reçu toutes les informations nécessaires concernant le déroulement
de la formation, les horaires, et les prérequis techniques le cas échéant.
Il/elle s’engage à utiliser le matériel mis à disposition avec soin et à respecter les règles
de confidentialité relatives aux supports de cours et aux données partagées.
GAC Academy se réserve le droit de modifier le planning en cas de force majeure,
en informant les participants dans les meilleurs délais.
La présente décharge est valable pour l’intégralité de la session et ne peut être modifiée
qu’avec l’accord écrit des deux parties.

N° Décharge : ${decharge.numero_decharge}
Fait à Thiès, le ${dateStr}

Signature de l’étudiant(e) Cachet & Signature GAC Academy
            `.trim()

            doc.setFontSize(16)
            doc.text('DÉCHARGE DE RESPONSABILITÉ', 105, 25, { align: 'center' })
            doc.setFontSize(11)
            doc.setFont("helvetica", "normal")
            const lignes = doc.splitTextToSize(texte, 170)
            doc.text(lignes, 20, 45)

            const pdfBlob = doc.output('blob')

            // 3. Upload avec upsert
            const { error: uploadError } = await supabase.storage
                .from('decharges')
                .upload(fileName, pdfBlob, {
                    upsert: true,
                    contentType: 'application/pdf'
                })

            if (uploadError) throw uploadError

            // 4. Récupère l'URL publique avec timestamp pour casser le cache
            const { data: { publicUrl } } = supabase.storage
                .from('decharges')
                .getPublicUrl(fileName)

            const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`

            // 5. Update la DB
            const { error: updateError } = await supabase
                .from('decharges')
                .update({
                    url_pdf: urlWithTimestamp,
                    statut: 'valide'
                })
                .eq('id', decharge.id)

            if (updateError) throw updateError

            setDecharge({ ...decharge, url_pdf: urlWithTimestamp, statut: 'valide' })
            alert('PDF régénéré avec succès')

        } catch (err) {
            console.error(err)
            alert('Erreur lors de la génération du PDF : ' + err.message)
        } finally {
            setGenerating(false)
        }
    }

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
                    <Link to="/formations" className="inline-block bg-[#1FA9A2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0F3D3E] transition">
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
                {successMessage && (
                    <div className="bg-green-50 border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                        <CheckCircle size={20} />
                        {successMessage}
                    </div>
                )}

                <div className="bg-white p-8 md:p-12 rounded-xl shadow-sm border-gray-100 text-center">
                    <div className="mb-6">
                        <CheckCircle size={64} className="text-[#8DC63F] mx-auto" />
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-[#0F3D3E] mb-4">
                        Inscription confirmée!
                    </h1>

                    <p className="text-xl text-gray-700 mb-4">
                        Pour la formation : <strong className="text-[#0F3D3E]">{formation?.appellation_commerciale}</strong>
                    </p>

                    {decharge ? (
                        <div className="bg-green-50 border-green-200 p-4 mb-6 rounded-lg">
                            <div className="flex items-center gap-3 justify-center mb-3">
                                <FileText size={20} className="text-[#8DC63F]" />
                                <p className="text-[#0F3D3E] font-semibold">
                                    N° Décharge : {decharge.numero_decharge}
                                </p>
                            </div>

                            {profile?.role === 'admin' && (
                                <div className="flex flex-col gap-3 items-center">
                                    <button
                                        onClick={generateAndUploadPDF}
                                        disabled={generating}
                                        className="inline-flex items-center gap-2 bg-[#1FA9A2] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0F3D3E] transition disabled:opacity-50"
                                    >
                                        {generating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                                        {generating ? 'Génération...' : decharge.url_pdf ? 'Régénérer la décharge PDF' : 'Générer la décharge PDF'}
                                    </button>

                                    {decharge.url_pdf && (
                                        <a
                                            href={decharge.url_pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-[#1FA9A2] hover:text-[#0F3D3E] font-semibold transition"
                                        >
                                            <Download size={18} />
                                            Télécharger la décharge PDF
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-yellow-50 border-yellow-300 p-4 mb-6 rounded-lg">
                            <p className="text-[#0F3D3E] font-semibold">
                                En attente de génération de la décharge
                            </p>
                        </div>
                    )}

                    {inscription.session?.lien_zoom && inscription.statut_inscription === 'validée' && (
                        <div className="bg-[#8DC63F]/10 border-l-4 border-[#8DC63F] p-4 mb-6 rounded-lg text-left">
                            <p className="font-bold text-[#0F3D3E] mb-2">Accès à la session</p>
                            <a
                                href={inscription.session.lien_zoom}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#1FA9A2] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#0F3D3E]"
                            >
                                <Video size={18} />
                                Rejoindre la session Zoom
                            </a>
                        </div>
                    )}

                    <div className="bg-blue-50 border-l-4 border-[#1FA9A2] p-4 mb-8 text-left">
                        <p className="text-gray-700">
                            <strong>Prochaine étape :</strong> On te contacte sur WhatsApp dans les 24h pour finaliser ton inscription.
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            Montant : {inscription.montant || formation?.prix_fcfa} FCFA
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/formations" className="bg-[#1FA9A2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0F3D3E] transition flex items-center justify-center gap-2">
                            Voir d'autres formations
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/dashboard" className="border-2 border-[#1FA9A2] text-[#1FA9A2] px-6 py-3 rounded-lg font-semibold hover:bg-[#1FA9A2] hover:text-white transition">
                            Aller au dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}