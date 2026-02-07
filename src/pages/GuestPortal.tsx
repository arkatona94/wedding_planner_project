import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import {
    Heart, Calendar, MapPin, Users, Utensils, Save, Plus, X,
    CheckCircle2, AlertCircle, UserPlus
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import type { PartyMember } from '../types'

export default function GuestPortal() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const [guest, setGuest] = useState<any>(null)
    const [wedding, setWedding] = useState<any>(null)

    // Form state
    const [rsvpStatus, setRsvpStatus] = useState<'pending' | 'attending' | 'declined'>('pending')
    const [mealChoice, setMealChoice] = useState('')
    const [dietary, setDietary] = useState<string[]>([])
    const [partyMembers, setPartyMembers] = useState<PartyMember[]>([])
    const [phone, setPhone] = useState('')
    const [street, setStreet] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [notes, setNotes] = useState('')

    const mealOptions = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal']
    const dietaryOptions = ['Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Kosher', 'Halal']

    useEffect(() => {
        fetchGuestData()
    }, [])

    const fetchGuestData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                navigate('/guest/register')
                return
            }

            // Check if this is a guest user
            const isGuest = user.user_metadata?.is_guest
            if (!isGuest) {
                setError('This portal is for wedding guests only. Couples should use the main app.')
                setLoading(false)
                return
            }

            // Fetch guest data
            const { data: guestData, error: guestError } = await supabase
                .from('guests')
                .select(`
          *,
          weddings (
            id,
            partner1_name,
            partner2_name,
            wedding_date,
            venue_name,
            venue_address
          )
        `)
                .eq('user_id', user.id)
                .single()

            if (guestError || !guestData) {
                throw new Error('Could not find your guest record.')
            }

            setGuest(guestData)
            setWedding(guestData.weddings)

            // Populate form with existing data
            setRsvpStatus(guestData.rsvp_status || 'pending')
            setMealChoice(guestData.meal_choice || '')
            setDietary(guestData.dietary_restrictions || [])
            setPartyMembers(guestData.party_members || [])
            setPhone(guestData.phone || '')
            setStreet(guestData.address?.street || '')
            setCity(guestData.address?.city || '')
            setState(guestData.address?.state || '')
            setZipCode(guestData.address?.zipCode || '')
            setNotes(guestData.notes || '')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleAddPartyMember = () => {
        setPartyMembers([
            ...partyMembers,
            {
                id: uuidv4(),
                name: '',
                mealChoice: '',
                dietaryRestrictions: [],
                isChild: false
            }
        ])
    }

    const handleUpdatePartyMember = (id: string, updates: Partial<PartyMember>) => {
        setPartyMembers(partyMembers.map(pm =>
            pm.id === id ? { ...pm, ...updates } : pm
        ))
    }

    const handleRemovePartyMember = (id: string) => {
        setPartyMembers(partyMembers.filter(pm => pm.id !== id))
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            const { error: updateError } = await supabase
                .from('guests')
                .update({
                    rsvp_status: rsvpStatus,
                    meal_choice: rsvpStatus === 'attending' ? mealChoice : null,
                    dietary_restrictions: rsvpStatus === 'attending' ? dietary : [],
                    party_members: rsvpStatus === 'attending' ? partyMembers : [],
                    phone,
                    address: { street, city, state, zipCode, country: 'USA' },
                    notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', guest.id)

            if (updateError) throw updateError

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-wedding-ivory">
                <div className="animate-pulse text-primary-500">Loading your details...</div>
            </div>
        )
    }

    if (error && !guest) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-wedding-ivory p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-serif text-gray-800 mb-2">Oops!</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => navigate('/guest/register')} className="btn-primary">
                        Back to Registration
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-wedding-ivory py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4">
                        <Heart className="w-5 h-5 text-primary-500" />
                        <span className="font-serif text-primary-700">Guest Portal</span>
                    </div>
                    <h1 className="text-3xl font-serif text-gray-800">
                        {wedding?.partner1_name} & {wedding?.partner2_name}
                    </h1>
                </div>

                {/* Wedding Details Card */}
                <div className="card mb-6">
                    <div className="flex flex-wrap gap-4 text-sm">
                        {wedding?.wedding_date && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar className="w-4 h-4 text-primary-500" />
                                <span>{format(new Date(wedding.wedding_date), 'MMMM d, yyyy')}</span>
                            </div>
                        )}
                        {wedding?.venue_name && (
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4 text-primary-500" />
                                <span>{wedding.venue_name}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">Your details have been saved!</p>
                    </div>
                )}

                {/* RSVP Section */}
                <div className="card mb-6">
                    <h2 className="text-lg font-serif text-gray-800 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary-500" />
                        RSVP
                    </h2>

                    <div className="flex gap-3 p-1 bg-gray-100 rounded-xl mb-4">
                        <button
                            type="button"
                            onClick={() => setRsvpStatus('attending')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${rsvpStatus === 'attending'
                                ? 'bg-white text-green-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Attending
                        </button>
                        <button
                            type="button"
                            onClick={() => setRsvpStatus('declined')}
                            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${rsvpStatus === 'declined'
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Can't Attend
                        </button>
                    </div>

                    {rsvpStatus === 'attending' && (
                        <>
                            {/* Meal Choice */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-primary-500" />
                                    Meal Preference
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {mealOptions.map((meal) => (
                                        <button
                                            key={meal}
                                            type="button"
                                            onClick={() => setMealChoice(meal)}
                                            className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${mealChoice === meal
                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                : 'border-gray-100 hover:border-primary-200 text-gray-600'
                                                }`}
                                        >
                                            {meal}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dietary Restrictions */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Dietary Restrictions
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {dietaryOptions.map((option) => (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => {
                                                setDietary(prev =>
                                                    prev.includes(option)
                                                        ? prev.filter(d => d !== option)
                                                        : [...prev, option]
                                                )
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${dietary.includes(option)
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Party Members */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-primary-500" />
                                        Party Members (Companions/Children)
                                    </label>
                                    <button
                                        type="button"
                                        onClick={handleAddPartyMember}
                                        className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
                                    >
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>

                                {partyMembers.length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">No additional party members added</p>
                                ) : (
                                    <div className="space-y-4">
                                        {partyMembers.map((member) => (
                                            <div key={member.id} className="p-4 bg-gray-50 rounded-xl relative">
                                                <button
                                                    onClick={() => handleRemovePartyMember(member.id)}
                                                    className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        className="input-field"
                                                        value={member.name}
                                                        onChange={(e) => handleUpdatePartyMember(member.id, { name: e.target.value })}
                                                    />
                                                    <div className="flex gap-3">
                                                        <select
                                                            className="input-field flex-1"
                                                            value={member.mealChoice}
                                                            onChange={(e) => handleUpdatePartyMember(member.id, { mealChoice: e.target.value })}
                                                        >
                                                            <option value="">Select Meal</option>
                                                            {mealOptions.map(m => <option key={m} value={m}>{m}</option>)}
                                                        </select>
                                                        <label className="flex items-center gap-2 text-sm">
                                                            <input
                                                                type="checkbox"
                                                                checked={member.isChild}
                                                                onChange={(e) => handleUpdatePartyMember(member.id, { isChild: e.target.checked })}
                                                                className="rounded text-primary-600"
                                                            />
                                                            Child
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Contact Info Section */}
                <div className="card mb-6">
                    <h2 className="text-lg font-serif text-gray-800 mb-4">Contact Information</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                type="tel"
                                className="input-field"
                                placeholder="(555) 123-4567"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="123 Main St"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={zipCode}
                                    onChange={(e) => setZipCode(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section */}
                <div className="card mb-6">
                    <h2 className="text-lg font-serif text-gray-800 mb-4">Message to the Couple</h2>
                    <textarea
                        className="input-field min-h-[100px]"
                        placeholder="Share a message or note any special requirements..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>

                {/* Save Button */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-primary w-full py-4 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                    {saving ? (
                        'Saving...'
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Changes
                        </>
                    )}
                </button>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-400 text-sm">
                    <p>Powered by EverAfter</p>
                </div>
            </div>

            <style>{`
        .bg-wedding-ivory {
          background-color: #fdfbf7;
        }
      `}</style>
        </div>
    )
}
