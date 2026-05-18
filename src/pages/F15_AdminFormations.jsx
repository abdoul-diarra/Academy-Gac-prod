import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react'

const POLES = [
    'POLICY_IMPACT_LAB',
    'ECONOMICS_POWER_HUB',
    'STRATEGY_DELIVERY_ACADEMY',
    'DATA_SCIENCE_FACTORY',
    'LEADERSHIP_VOICE_INSTITUTE'
]

export default function F15_AdminFormations() {
    const [formations, setFormations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)

    const [filters, setFilters] = useState({
        pole: '',
        statut: '',
        search: ''
    })

    const [form, setForm] = useState({
        code_pole: '',
        appellation_commerciale: '',
        titre_pedagogique: '',
        description: '',
        duree_heures: 0,
        prix_fcfa: 0,
        capacite_max: 20,
        format: 'Présentiel',
        statut: 'brouillon'
    })

    useEffect(() => {
        fetchFormations()
    }, [filters])

    const fetchFormations = async () => {
        setLoading(true)

        let query = supabase
            .from('formations')
            .select(`
                *,
                sessions(count),
                inscriptions(count)
            `)
            .order('created_at', { ascending: false })

        if (filters.pole) query = query.eq('code_pole', filters.pole)
        if (filters.statut) query = query.eq('statut', filters.statut)
        if (filters.search) query = query.ilike('appellation_commerciale', ` % ${filters.search} %`)

        const { data, error } = await query

        if (error) console.error(error)
        else setFormations(data || [])

        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const slug = form.appellation_commerciale
            .toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')

        const payload = {
            ...form,
            slug,
            updated_at: new Date().toISOString()
        }

        let error
        if (editing) {
            ({ error } = await supabase.from('formations').update(payload).eq('id', editing.id))
        } else {
            ({ error } = await supabase.from('formations').insert([payload]))
        }

        if (error) {
            alert('Erreur: ' + error.message)
        } else {
            setShowModal(false)
            setEditing(null)
            resetForm()
            fetchFormations()
        }
    }

    const handleEdit = (f) => {
        setEditing(f)
        setForm({
            code_pole: f.code_pole,
            appellation_commerciale: f.appellation_commerciale,
            titre_pedagogique: f.titre_pedagogique,
            description: f.description,
            duree_heures: f.duree_heures,
            prix_fcfa: f.prix_fcfa,
            capacite_max: f.capacite_max || 20,
            format: f.format,
            statut: f.statut
        })
        setShowModal(true)
    }

    const handleDelete = async (id, nom) => {
        if (!confirm(`Supprimer "${nom}" ? Ça supprime sessions et inscriptions liées.`)) return

        const { error } = await supabase.from('formations').delete().eq('id', id)
        if (error) alert('Erreur: ' + error.message)
        else fetchFormations()
    }

    const handleImageUpload = async (e, id) => {
        const file = e.target.files?.[0]
        if (!file) return

        const filePath = `formations / ${id}/${Date.now()}.${file.name.split('.').pop()}`

        const { error: uploadError } = await supabase.storage
            .from('formations')
            .upload(filePath, file, { upsert: true })

        if (uploadError) return alert(uploadError.message)

        const { data: { publicUrl } } = supabase.storage
            .from('formations')
            .getPublicUrl(filePath)

        await supabase.from('formations').update({ image_url: publicUrl }).eq('id', id)
        fetchFormations()
    }

    const resetForm = () => {
        setForm({
            code_pole: '',
            appellation_commerciale: '',
            titre_pedagogique: '',
            description: '',
            duree_heures: 0,
            prix_fcfa: 0,
            capacite_max: 20,
            format: 'Présentiel',
            statut: 'brouillon'
        })
    }

    const getStatutColor = (statut) => {
        return statut === 'publiee'
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-gray-800'
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-[#0F3D3E]">Gestion des formations</h1>
                    <p className="text-gray-600 mt-2">
                        CRUD formations, planification sessions Zoom, attribution formateurs - CDC 5.3
                    </p>
                </div>
                <button
                    onClick={() => { setEditing(null); resetForm(); setShowModal(true) }}
                    className="bg-[#8DC63F] text-[#0F3D3E] px-6 py-3 rounded-lg font-bold hover:bg-[#8DC63F]/90 flex items-center gap-2"
                >
                    <Plus size={18} />
                    Créer formation
                </button>
            </div>

            {/* Filtres */}
            <div className="bg-white p-4 rounded-lg shadow-sm border mb-6 flex-wrap gap-4">
                <select
                    value={filters.pole}
                    onChange={e => setFilters({ ...filters, pole: e.target.value })}
                    className="border-gray-300 p-2 rounded-lg"
                >
                    <option value="">Tous les pôles CDC 6</option>
                    {POLES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>

                <select
                    value={filters.statut}
                    onChange={e => setFilters({ ...filters, statut: e.target.value })}
                    className="border-gray-300 p-2 rounded-lg"
                >
                    <option value="">Tous statuts</option>
                    <option value="publiee">Publiée</option>
                    <option value="brouillon">Brouillon</option>
                    <option value="archivee">Archivée</option>
                </select>

                <div className="flex-1 relative min-w-[200px]">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Recherche..."
                        value={filters.search}
                        onChange={e => setFilters({ ...filters, search: e.target.value })}
                        className="w-full border-gray-300 pl-10 p-2 rounded-lg"
                    />
                </div>
            </div>

            {/* Tableau */}
            <div className="bg-white rounded-lg shadow-sm border overflow-x-auto">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <Loader2 size={32} className="animate-spin text-[#1FA9A2]" />
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="text-left p-4 text-sm font-semibold">Formation</th>
                                <th className="text-left p-4 text-sm font-semibold">Pôle</th>
                                <th className="text-left p-4 text-sm font-semibold">Inscrits</th>
                                <th className="text-left p-4 text-sm font-semibold">Prix</th>
                                <th className="text-left p-4 text-sm font-semibold">Durée</th>
                                <th className="text-left p-4 text-sm font-semibold">Sessions</th>
                                <th className="text-left p-4 text-sm font-semibold">Statut</th>
                                <th className="text-left p-4 text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formations.map(f => (
                                <tr key={f.id} className="border-t hover:bg-gray-50">
                                    <td className="p-4">
                                        <div className="font-bold text-[#0F3D3E]">{f.appellation_commerciale}</div>
                                        <div className="text-xs text-gray-500">{f.titre_pedagogique}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs bg-[#1FA9A2] text-white px-2 py-1 rounded-full">
                                            {f.code_pole}
                                        </span>
                                    </td>
                                    <td className="p-4 font-semibold">{f.inscriptions?.[0]?.count || 0}</td>
                                    <td className="p-4 font-bold">{f.prix_fcfa.toLocaleString('fr-FR')} FCFA</td>
                                    <td className="p-4">{f.duree_heures}h</td>
                                    <td className="p-4">{f.sessions?.[0]?.count || 0}</td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutColor(f.statut)}`}>
                                            {f.statut}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(f)}
                                                className="p-2 text-[#1FA9A2] hover:bg-gray-100 rounded"
                                                title="Modifier"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(f.id, f.appellation_commerciale)}
                                                className="p-2 text-red-600 hover:bg-gray-100 rounded"
                                                title="Supprimer"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={e => handleImageUpload(e, f.id)}
                                            className="text-xs mt-2"
                                            title="Changer l'image"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-[#0F3D3E]">
                            {editing ? 'Modifier' : 'Créer'} une formation - CDC 8.3
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">code_pole *</label>
                                    <select
                                        value={form.code_pole}
                                        onChange={e => setForm({ ...form, code_pole: e.target.value })}
                                        className="w-full border-gray-300 p-2 rounded-lg"
                                        required
                                    >
                                        <option value="">Sélectionner</option>
                                        {POLES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold mb-1">statut *</label>
                                    <select
                                        value={form.statut}
                                        onChange={e => setForm({ ...form, statut: e.target.value })}
                                        className="w-full border-gray-300 p-2 rounded-lg"
                                        required
                                    >
                                        <option value="brouillon">Brouillon</option>
                                        <option value="publiee">Publiée</option>
                                        <option value="archivee">Archivée</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">appellation_commerciale *</label>
                                <input
                                    type="text"
                                    value={form.appellation_commerciale}
                                    onChange={e => setForm({ ...form, appellation_commerciale: e.target.value })}
                                    className="w-full border-gray-300 p-2 rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">titre_pedagogique *</label>
                                <input
                                    type="text"
                                    value={form.titre_pedagogique}
                                    onChange={e => setForm({ ...form, titre_pedagogique: e.target.value })}
                                    className="w-full border-gray-300 p-2 rounded-lg"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-1">description *</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                    className="w-full border-gray-300 p-2 rounded-lg"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">durée_heures *</label>
                                    <input
                                        type="number"
                                        value={form.duree_heures}
                                        onChange={e => setForm({ ...form, duree_heures: parseInt(e.target.value) || 0 })}
                                        className="w-full border-gray-300 p-2 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">prix_FCFA *</label>
                                    <input
                                        type="number"
                                        value={form.prix_fcfa}
                                        onChange={e => setForm({ ...form, prix_fcfa: parseInt(e.target.value) || 0 })}
                                        className="w-full border-gray-300 p-2 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">capacité_max</label>
                                    <input
                                        type="number"
                                        value={form.capacite_max}
                                        onChange={e => setForm({ ...form, capacite_max: parseInt(e.target.value) || 0 })}
                                        className="w-full border-gray-300 p-2 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-4 rounded text-sm border-l-4 border-[#1FA9A2]">
                                <strong>CDC 9.1 :</strong> Après création, va dans l'onglet Sessions pour planifier les dates et générer le lien Zoom.
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 border-gray-300 border py-2 rounded-lg hover:bg-gray-50"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#8DC63F] text-[#0F3D3E] py-2 rounded-lg font-bold hover:bg-[#8DC63F]/90"
                                >
                                    {editing ? 'Modifier' : 'Créer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}