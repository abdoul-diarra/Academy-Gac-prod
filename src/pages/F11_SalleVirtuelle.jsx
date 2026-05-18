import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Video, Download, Shield, Calendar, Clock, Loader2, Lock } from 'lucide-react'

export default function F11_SalleVirtuelle() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [decharge, setDecharge] = useState(null)
  const [contenus, setContenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    checkAcces()
  }, [token])

  const checkAcces = async () => {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      navigate('/connexion')
      return
    }

    // 1. Vérifie décharge + ownership + paiement
    const { data, error } = await supabase
      .from('decharges')
      .select(`
        id,
        numero_decharge,
        url_pdf,
        token_verification,
        inscriptions!inner(
          id,
          statut_paiement,
          user_id,
          sessions(
            id,
            date_debut,
            date_fin,
            lien_zoom,
            formations(
              id,
              slug,
              appellation_commerciale,
              titre_pedagogique,
              description
            )
          )
        )
      `)
      .eq('token_verification', token)
      .eq('inscriptions.user_id', user.id)
      .single()

    if (error || !data) {
      setError('Décharge introuvable ou accès non autorisé')
      setLoading(false)
      return
    }

    if (data.inscriptions.statut_paiement !== 'paye') {
      setError('Paiement non confirmé. Accès bloqué.')
      setLoading(false)
      return
    }

    setDecharge(data)

    // 2. Charge les contenus de la session
    const sessionId = data.inscriptions.sessions.id
    const { data: contenusData } = await supabase
      .from('contenus')
      .select('*')
      .eq('session_id', sessionId)
      .order('ordre', { ascending: true })

    setContenus(contenusData || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#1FA9A2]" />
      </div>
    )
  }

  if (error || !decharge) {
    return (
      <div className="min-h-screen flex-col items-center justify-center px-4">
        <Lock size={48} className="text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-[#0F3D3E] mb-2">Accès refusé</h1>
        <p className="text-gray-600 mb-6 text-center">{error}</p>
        <Link to="/mes-formations" className="text-[#1FA9A2] hover:underline">
          Retour à mes formations
        </Link>
      </div>
    )
  }

  const formation = decharge.inscriptions.sessions.formations
  const session = decharge.inscriptions.sessions
  const sessionPassee = new Date(session.date_fin) < new Date()

  return (
    <div className="min-h-screen bg-[#F8FAF9]">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0F3D3E] mb-2">
                {formation.appellation_commerciale}
              </h1>
              <p className="text-gray-600">{formation.titre_pedagogique}</p>
            </div>
            <Link
              to={`/decharge/${decharge.inscriptions.id}`}
              className="flex items-center gap-2 text-sm text-[#1FA9A2] hover:underline"
            >
              <Shield size={16} />
              Vérifier la décharge
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            {/* Accès Zoom */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <Video size={24} className="text-[#1FA9A2]" />
                <h2 className="text-xl font-bold text-[#0F3D3E]">Session en direct</h2>
              </div>

              {session.lien_zoom && !sessionPassee ? (
                <>
                  <p className="text-gray-600 mb-4">
                    Rejoignez la session Zoom le jour J. Le lien est unique et personnel.
                  </p>
                  <a
                    href={session.lien_zoom}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#1FA9A2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0F3D3E] transition"
                  >
                    Rejoindre la salle Zoom
                  </a>
                </>
              ) : sessionPassee ? (
                <p className="text-gray-500">
                  Cette session est terminée. Le replay sera disponible sous 48h.
                </p>
              ) : (
                <p className="text-gray-500">
                  Le lien Zoom sera disponible 30min avant le début de la session.
                </p>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    {new Date(session.date_debut).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>
                    {new Date(session.date_debut).toLocaleTimeString('fr-FR', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Contenus */}
            <div className="bg-white rounded-xl p-6 shadow-sm border-gray-100">
              <h2 className="text-xl font-bold text-[#0F3D3E] mb-4">Support de formation</h2>

              {contenus.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">Contenu en cours de préparation</p>
                  <p className="text-sm">
                    Les supports PDF, vidéos et exercices seront disponibles ici après validation.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contenus.map(c => (
                    <a
                      key={c.id}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition"
                    >
                      <div>
                        <p className="font-semibold text-[#0F3D3E]">{c.titre}</p>
                        <p className="text-sm text-gray-500">{c.type}</p>
                      </div>
                      <Download size={18} className="text-[#1FA9A2]" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border-gray-100">
              <h3 className="font-bold text-[#0F3D3E] mb-3">Décharge officielle</h3>
              <p className="text-sm text-gray-600 mb-4">
                Numéro : {decharge.numero_decharge}
              </p>

              {decharge.url_pdf ? (
                <a
                  href={decharge.url_pdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-[#8DC63F] text-[#0F3D3E] px-4 py-2 rounded-lg font-semibold hover:bg-[#8DC63F]/90 transition"
                >
                  <Download size={18} />
                  Télécharger PDF
                </a>
              ) : (
                <p className="text-sm text-gray-500">Génération en cours...</p>
              )}

              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500">
                  Token : <br />
                  <code className="text-xs break-all">{decharge.token_verification}</code>
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAF9] rounded-xl p-6 border-gray-200">
              <h3 className="font-bold text-[#0F3D3E] mb-2">Besoin d'aide?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Contactez notre support technique sur WhatsApp.
              </p>
              <a
                href="https://wa.me/221777651010"
                target="_blank"
                className="text-sm text-[#1FA9A2] font-semibold hover:underline"
              >
                +221 77 765 10 10
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}