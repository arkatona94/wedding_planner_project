import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { CheckCircle2, Search, Users, Utensils, AlertCircle } from 'lucide-react'

export default function RSVP() {
    const { weddingId } = useParams<{ weddingId: string }>()
    const [wedding, setWedding] = useState<any>(null)
    const [step, setStep] = useState<'search' | 'confirm' | 'form' | 'success'>('search')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [foundGuests, setFoundGuests] = useState<any[]>([])
    const [selectedGuest, setSelectedGuest] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form State
    const [status, setStatus] = useState<'attending' | 'declined'>('attending')
    const [meal, setMeal] = useState('')
    const [dietary, setDietary] = useState<string[]>([])
    const [plusOneAttending, setPlusOneAttending] = useState(false)
    const [plusOneName, setPlusOneName] = useState('')
    const [notes, setNotes] = useState('')

    const mealOptions = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal']
    const dietaryOptions = ['Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Kosher', 'Halal']

    useEffect(() => {
        if (weddingId) {
            fetchWeddingDetails()
        }
    }, [weddingId])

    const fetchWeddingDetails = async () => {
        const { data, error } = await supabase
            .from('weddings')
            .select(`
                *,
                profiles (email, full_name)
            `)
            .eq('id', weddingId)
            .single()

        if (error) {
            setError('Could not find wedding details. Please check the link.')
        } else {
            setWedding(data)
        }
    }

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: searchError } = await supabase
                .from('guests')
                .select('*')
                .eq('wedding_id', weddingId)
                .ilike('first_name', firstName.trim())
                .ilike('last_name', lastName.trim())

            if (searchError) throw searchError

            if (data && data.length > 0) {
                setFoundGuests(data)
                setStep('confirm')
            } else {
                setError("We couldn't find an invitation for that name. Please check the spelling or contact the couple.")
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSelectGuest = (guest: any) => {
        setSelectedGuest(guest)
        setStatus(guest.rsvp_status === 'declined' ? 'declined' : 'attending')
        setMeal(guest.meal_choice || '')
        setDietary(guest.dietary_restrictions || [])
        setPlusOneAttending(!!guest.plus_one_name)
        setPlusOneName(guest.plus_one_name || '')
        setNotes(guest.notes || '')
        setStep('form')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: updateError } = await supabase
                .from('guests')
                .update({
                    rsvp_status: status,
                    meal_choice: status === 'attending' ? meal : null,
                    dietary_restrictions: status === 'attending' ? dietary : [],
                    plus_one_name: (status === 'attending' && plusOneAttending) ? plusOneName : null,
                    notes: notes,
                    updated_at: new Date().toISOString()
                })
                .eq('id', selectedGuest.id)

            if (updateError) throw updateError

            // Notify the couple
            if (wedding?.profiles?.email) {
                await supabase.functions.invoke('send-notification', {
                    body: {
                        weddingId: wedding.id,
                        guestId: selectedGuest.id,
                        type: 'rsvp_received',
                        channel: 'email',
                        recipient: wedding.profiles.email,
                        subject: `New RSVP: ${selectedGuest.first_name} ${selectedGuest.last_name}`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px;">
                                <h2>Good news!</h2>
                                <p><strong>${selectedGuest.first_name} ${selectedGuest.last_name}</strong> has RSVP'd to your wedding.</p>
                                <p><strong>Status:</strong> ${status.toUpperCase()}</p>
                                ${status === 'attending' ? `
                                    <p><strong>Meal:</strong> ${meal}</p>
                                    <p><strong>Notes:</strong> ${notes || 'None'}</p>
                                ` : ''}
                                <p>View your guest list in the app for more details.</p>
                            </div>
                        `
                    }
                })
            }

            setStep('success')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!wedding && !error) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

    return (
        <div className="min-h-screen bg-wedding-ivory py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif text-primary-900 mb-2">
                        {wedding?.partner1_name} & {wedding?.partner2_name}
                    </h1>
                    <div className="h-px w-24 bg-primary-200 mx-auto mb-4" />
                    <p className="text-primary-600 font-serif italic text-lg">
                        {wedding?.wedding_date ? format(new Date(wedding.wedding_date), 'MMMM d, yyyy') : 'Wedding Date'}
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-primary-50">
                    <div className="p-8 sm:p-12">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {step === 'search' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-2xl font-serif text-gray-800 mb-6 text-center">Find Your Invitation</h2>
                                <form onSubmit={handleSearch} className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">First Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="rsvp-input"
                                                placeholder="e.g. John"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-primary-400 uppercase tracking-widest mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                required
                                                className="rsvp-input"
                                                placeholder="e.g. Smith"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary-100 hover:bg-primary-700 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {loading ? 'Searching...' : <><Search className="w-5 h-5" /> Search Registry</>}
                                    </button>
                                </form>
                            </div>
                        )}

                        {step === 'confirm' && (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                                <h2 className="text-2xl font-serif text-gray-800 mb-6 text-center">Is this you?</h2>
                                <div className="space-y-3">
                                    {foundGuests.map((guest) => (
                                        <button
                                            key={guest.id}
                                            onClick={() => handleSelectGuest(guest)}
                                            className="w-full p-6 text-left border-2 border-primary-50 rounded-2xl hover:border-primary-500 hover:bg-primary-50 transition-all group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-bold text-xl text-gray-800">{guest.first_name} {guest.last_name}</p>
                                                    <p className="text-primary-500 text-sm mt-1">{guest.group || 'Guest'}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                    →
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setStep('search')}
                                        className="w-full py-3 text-gray-400 text-sm hover:text-primary-600 transition-colors"
                                    >
                                        None of these are me. Try again.
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'form' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-center mb-8">
                                    <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center">
                                        <Users className="w-8 h-8 text-primary-600" />
                                    </div>
                                </div>
                                <h2 className="text-2xl font-serif text-gray-800 mb-8 text-center">
                                    {selectedGuest.first_name}, will you be attending?
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Attendance Toggle */}
                                    <div className="flex gap-4 p-1 bg-gray-100 rounded-2xl">
                                        <button
                                            type="button"
                                            onClick={() => setStatus('attending')}
                                            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${status === 'attending'
                                                ? 'bg-white text-primary-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Attending
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setStatus('declined')}
                                            className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${status === 'declined'
                                                ? 'bg-white text-red-600 shadow-sm'
                                                : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            Declined
                                        </button>
                                    </div>

                                    {status === 'attending' && (
                                        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                            {/* Plus One */}
                                            {selectedGuest.plus_one && (
                                                <div className="card-inner p-6 bg-primary-50/50 rounded-2xl border border-primary-100">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <input
                                                            type="checkbox"
                                                            id="plus-one"
                                                            className="w-5 h-5 text-primary-600 rounded border-primary-200 focus:ring-primary-500"
                                                            checked={plusOneAttending}
                                                            onChange={(e) => setPlusOneAttending(e.target.checked)}
                                                        />
                                                        <label htmlFor="plus-one" className="font-bold text-gray-800">
                                                            I'm bringing a guest
                                                        </label>
                                                    </div>
                                                    {plusOneAttending && (
                                                        <input
                                                            type="text"
                                                            required
                                                            className="rsvp-input bg-white"
                                                            placeholder="Guest Full Name"
                                                            value={plusOneName}
                                                            onChange={(e) => setPlusOneName(e.target.value)}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {/* Meal Choice */}
                                            <div>
                                                <label className="block text-xs font-bold text-primary-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Utensils className="w-4 h-4" /> Meal Preference
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {mealOptions.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setMeal(opt)}
                                                            className={`p-4 rounded-xl border-2 text-left text-sm font-medium transition-all ${meal === opt
                                                                ? 'border-primary-500 bg-primary-50 text-primary-700'
                                                                : 'border-gray-100 hover:border-primary-200 text-gray-600'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Dietary */}
                                            <div>
                                                <label className="block text-xs font-bold text-primary-400 uppercase tracking-widest mb-4">
                                                    Dietary Restrictions
                                                </label>
                                                <div className="flex flex-wrap gap-2">
                                                    {dietaryOptions.map((opt) => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => {
                                                                setDietary(prev =>
                                                                    prev.includes(opt) ? prev.filter(d => d !== opt) : [...prev, opt]
                                                                )
                                                            }}
                                                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${dietary.includes(opt)
                                                                ? 'bg-primary-600 text-white'
                                                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Personal Note */}
                                    <div>
                                        <label className="block text-xs font-bold text-primary-400 uppercase tracking-widest mb-3">
                                            {status === 'attending' ? 'Notes for the couple' : 'Message for the couple'}
                                        </label>
                                        <textarea
                                            className="rsvp-input min-h-[100px]"
                                            placeholder="Write something sweet..."
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep('search')}
                                            className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading || (status === 'attending' && !meal)}
                                            className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:bg-primary-700 disabled:opacity-50 transition-all"
                                        >
                                            {loading ? 'Submitting...' : 'Submit RSVP'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="text-center py-8 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-12 h-12 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-serif text-gray-800 mb-4">
                                    {status === 'attending' ? "We'll see you there!" : "We'll miss you!"}
                                </h2>
                                <p className="text-gray-600 mb-10 text-lg">
                                    {status === 'attending'
                                        ? "Your RSVP has been confirmed. We can't wait to celebrate with you!"
                                        : "Your response has been sent. Thank you for letting us know."}
                                </p>
                                <button
                                    onClick={() => setStep('search')}
                                    className="px-8 py-3 bg-primary-50 text-primary-600 font-bold rounded-xl hover:bg-primary-100 transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-12 text-center text-primary-400 max-w-xs mx-auto">
                    <p className="text-xs font-serif italic mb-4">"Love is old, love is new, love is all, love is you."</p>
                    <div className="flex items-center justify-center gap-2">
                        <div className="h-px grow bg-primary-100" />
                        <span className="text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">Powered by Beginnings and Endings</span>
                        <div className="h-px grow bg-primary-100" />
                    </div>
                </div>
            </div>

            <style>{`
                .rsvp-input {
                    width: 100%;
                    padding: 1rem 1.25rem;
                    background-color: #f8fafc;
                    border: 2px solid #f1f5f9;
                    border-radius: 1rem;
                    font-size: 1rem;
                    transition: all 0.3s ease;
                }
                .rsvp-input:focus {
                    outline: none;
                    border-color: #c97f66;
                    background-color: white;
                    box-shadow: 0 0 0 4px rgba(201, 127, 102, 0.1);
                }
                .bg-wedding-ivory {
                    background-color: #fdfbf7;
                }
            `}</style>
        </div>
    )
}
