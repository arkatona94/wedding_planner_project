import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Heart, KeyRound, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function GuestRegister() {
    const { inviteCode: urlInviteCode } = useParams<{ inviteCode?: string }>()


    const [step, setStep] = useState<'code' | 'verify' | 'register' | 'success'>('code')
    const [inviteCode, setInviteCode] = useState(urlInviteCode || '')
    const [guest, setGuest] = useState<any>(null)
    const [wedding, setWedding] = useState<any>(null)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Auto-verify if invite code is in URL
    useEffect(() => {
        if (urlInviteCode) {
            handleVerifyCode()
        }
    }, [urlInviteCode])

    const handleVerifyCode = async (e?: React.FormEvent) => {
        e?.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Find guest by invite code
            const { data: guestData, error: guestError } = await supabase
                .from('guests')
                .select(`
          *,
          weddings (
            id,
            partner1_name,
            partner2_name,
            wedding_date,
            venue_name
          )
        `)
                .eq('invite_code', inviteCode.toUpperCase().trim())
                .single()

            if (guestError || !guestData) {
                throw new Error('Invalid invite code. Please check your code and try again.')
            }

            // Check if guest already has an account
            if (guestData.user_id) {
                throw new Error('This invite code has already been used. Please log in instead.')
            }

            setGuest(guestData)
            setWedding(guestData.weddings)
            setEmail(guestData.email || '')
            setStep('verify')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleConfirmIdentity = () => {
        setStep('register')
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // Create Supabase auth account
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        guest_id: guest.id,
                        is_guest: true,
                        full_name: `${guest.first_name} ${guest.last_name}`
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // Link guest record to auth user
                const { error: updateError } = await supabase
                    .from('guests')
                    .update({
                        user_id: authData.user.id,
                        email: email
                    })
                    .eq('id', guest.id)

                if (updateError) throw updateError

                setStep('success')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-full shadow-sm mb-4">
                        <Heart className="w-5 h-5 text-primary-500" />
                        <span className="font-serif text-primary-700">Guest Registration</span>
                    </div>
                    <h1 className="text-3xl font-serif text-gray-800">Welcome to the Wedding</h1>
                    <p className="text-gray-500 mt-2">Enter your invite code to RSVP and manage your details</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}

                        {step === 'code' && (
                            <form onSubmit={handleVerifyCode} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Enter Your Invite Code
                                    </label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            className="input-field pl-10 text-center uppercase tracking-widest text-lg font-mono"
                                            placeholder="ABCD1234"
                                            value={inviteCode}
                                            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                            maxLength={8}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">
                                        Find this code in your invitation or email from the couple
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || inviteCode.length < 8}
                                    className="btn-primary w-full py-3 disabled:opacity-50"
                                >
                                    {loading ? 'Verifying...' : 'Continue'}
                                </button>
                            </form>
                        )}

                        {step === 'verify' && guest && wedding && (
                            <div className="text-center space-y-6">
                                <div className="p-6 bg-primary-50 rounded-xl">
                                    <p className="text-sm text-primary-600 mb-2">You've been invited to</p>
                                    <h2 className="text-2xl font-serif text-gray-800">
                                        {wedding.partner1_name} & {wedding.partner2_name}'s Wedding
                                    </h2>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Registered as</p>
                                    <p className="text-xl font-bold text-gray-800">
                                        {guest.first_name} {guest.last_name}
                                    </p>
                                    {guest.group && (
                                        <p className="text-sm text-primary-500 mt-1">{guest.group}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3">
                                    <button
                                        onClick={handleConfirmIdentity}
                                        className="btn-primary w-full py-3"
                                    >
                                        Yes, that's me!
                                    </button>
                                    <button
                                        onClick={() => {
                                            setStep('code')
                                            setInviteCode('')
                                            setGuest(null)
                                            setWedding(null)
                                        }}
                                        className="text-gray-500 hover:text-gray-700 text-sm"
                                    >
                                        That's not me, try a different code
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 'register' && (
                            <form onSubmit={handleRegister} className="space-y-6">
                                <div className="text-center mb-6">
                                    <p className="text-gray-600">
                                        Create your account to RSVP and manage your guest details
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            className="input-field pl-10"
                                            placeholder="your@email.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Create Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="password"
                                            required
                                            minLength={6}
                                            className="input-field pl-10"
                                            placeholder="At least 6 characters"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary w-full py-3 disabled:opacity-50"
                                >
                                    {loading ? 'Creating Account...' : 'Create Account & RSVP'}
                                </button>

                                <p className="text-xs text-gray-400 text-center">
                                    By registering, you'll be able to update your RSVP, meal preferences, and more
                                </p>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-serif text-gray-800 mb-2">You're All Set!</h2>
                                <p className="text-gray-600 mb-6">
                                    Check your email to verify your account, then you can start managing your RSVP.
                                </p>
                                <Link to="/guest/portal" className="btn-primary inline-block py-3 px-8">
                                    Go to Guest Portal
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 text-gray-400 text-sm">
                    <p>Powered by Beginnings and Endings</p>
                </div>
            </div>
        </div>
    )
}
