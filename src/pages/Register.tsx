import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useWeddingStore } from '../store/weddingStore'
import { CheckCircle2, LayoutDashboard, Calculator, Users, Globe, Grid, Clock, Camera, Sparkles, Scale } from 'lucide-react'

const modules = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, required: true },
    { id: 'checklist', label: 'Checklist', icon: CheckCircle2 },
    { id: 'budget', label: 'Budget', icon: Calculator },
    { id: 'guests', label: 'Guest List', icon: Users },
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'seating', label: 'Seating Chart', icon: Grid },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'inspiration', label: 'Inspiration', icon: Sparkles },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'marriage-laws', label: 'Marriage Laws', icon: Scale },
]

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [brideName, setBrideName] = useState('')
    const [groomName, setGroomName] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [selectedModules, setSelectedModules] = useState<string[]>(['dashboard', 'checklist', 'budget'])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    const setUser = useWeddingStore(state => state.setUser)
    const updateAppSettings = useWeddingStore(state => state.updateAppSettings)

    const toggleModule = (moduleId: string) => {
        if (modules.find(m => m.id === moduleId)?.required) return
        setSelectedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        )
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: `${brideName} & ${groomName}`,
                        bride_name: brideName,
                        groom_name: groomName,
                        enabled_modules: selectedModules,
                        city: city,
                        state: state
                    }
                }
            })

            if (signUpError) throw signUpError

            if (data.user) {
                // 1. Set local store user
                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    name: `${brideName} & ${groomName}`,
                    city: city,
                    state: state
                })
                updateAppSettings({ enabledModules: selectedModules })

                // 2. Create initial wedding record in Supabase
                // We use a try-catch for the profile/wedding creation in case 
                // triggers are already handling it or there are RLS issues.
                try {
                    // Check if profile exists (might be created by trigger)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', data.user.id)
                        .single()

                    if (!profile) {
                        await supabase.from('profiles').insert({
                            id: data.user.id,
                            email: data.user.email,
                            full_name: `${brideName} & ${groomName}`,
                            app_settings: { enabledModules: selectedModules, darkMode: false }
                        })
                    }

                    // Create the wedding record
                    const { error: weddingError } = await supabase
                        .from('weddings')
                        .insert({
                            user_id: data.user.id,
                            partner1_name: brideName || 'Partner 1',
                            partner2_name: groomName || 'Partner 2',
                            total_budget: 30000,
                            estimated_guests: 100
                        })
                        .select()
                        .single()

                    if (weddingError) {
                        console.error('Error creating wedding record:', weddingError)
                    }
                } catch (dbErr) {
                    console.error('Database initialization error during signup:', dbErr)
                }

                navigate('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        setLoading(true)
        setError(null)
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            })
            if (oauthError) throw oauthError
        } catch (err: any) {
            setError(err.message)
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
                <div className="text-center">
                    <h2 className="text-3xl font-serif text-gray-900">Create your wedding account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
                            Sign in here
                        </Link>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Auth Details */}
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Bride Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field mt-1"
                                        value={brideName}
                                        onChange={(e) => setBrideName(e.target.value)}
                                        placeholder="e.g. Sarah"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Groom Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field mt-1"
                                        value={groomName}
                                        onChange={(e) => setGroomName(e.target.value)}
                                        placeholder="e.g. Michael"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="input-field mt-1"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="input-field mt-1"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Min. 6 characters"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">City</label>
                                    <input
                                        type="text"
                                        required
                                        className="input-field mt-1"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        placeholder="Your city"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">State</label>
                                    <select
                                        required
                                        className="input-field mt-1"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                    >
                                        <option value="">Select state</option>
                                        <option value="AL">Alabama</option>
                                        <option value="AK">Alaska</option>
                                        <option value="AZ">Arizona</option>
                                        <option value="AR">Arkansas</option>
                                        <option value="CA">California</option>
                                        <option value="CO">Colorado</option>
                                        <option value="CT">Connecticut</option>
                                        <option value="DE">Delaware</option>
                                        <option value="FL">Florida</option>
                                        <option value="GA">Georgia</option>
                                        <option value="HI">Hawaii</option>
                                        <option value="ID">Idaho</option>
                                        <option value="IL">Illinois</option>
                                        <option value="IN">Indiana</option>
                                        <option value="IA">Iowa</option>
                                        <option value="KS">Kansas</option>
                                        <option value="KY">Kentucky</option>
                                        <option value="LA">Louisiana</option>
                                        <option value="ME">Maine</option>
                                        <option value="MD">Maryland</option>
                                        <option value="MA">Massachusetts</option>
                                        <option value="MI">Michigan</option>
                                        <option value="MN">Minnesota</option>
                                        <option value="MS">Mississippi</option>
                                        <option value="MO">Missouri</option>
                                        <option value="MT">Montana</option>
                                        <option value="NE">Nebraska</option>
                                        <option value="NV">Nevada</option>
                                        <option value="NH">New Hampshire</option>
                                        <option value="NJ">New Jersey</option>
                                        <option value="NM">New Mexico</option>
                                        <option value="NY">New York</option>
                                        <option value="NC">North Carolina</option>
                                        <option value="ND">North Dakota</option>
                                        <option value="OH">Ohio</option>
                                        <option value="OK">Oklahoma</option>
                                        <option value="OR">Oregon</option>
                                        <option value="PA">Pennsylvania</option>
                                        <option value="RI">Rhode Island</option>
                                        <option value="SC">South Carolina</option>
                                        <option value="SD">South Dakota</option>
                                        <option value="TN">Tennessee</option>
                                        <option value="TX">Texas</option>
                                        <option value="UT">Utah</option>
                                        <option value="VT">Vermont</option>
                                        <option value="VA">Virginia</option>
                                        <option value="WA">Washington</option>
                                        <option value="WV">West Virginia</option>
                                        <option value="WI">Wisconsin</option>
                                        <option value="WY">Wyoming</option>
                                        <option value="DC">Washington D.C.</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            {loading ? 'Creating account...' : 'Start Planning'}
                        </button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-3 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignUp}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all shadow-sm hover:shadow disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Sign up with Google
                        </button>

                        {import.meta.env.DEV && (
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUser({
                                            id: 'dev-user-id',
                                            email: 'dev@test.com',
                                            name: brideName && groomName ? `${brideName} & ${groomName}` : 'Dev Tester'
                                        })
                                        updateAppSettings({ enabledModules: selectedModules })
                                        navigate('/')
                                    }}
                                    className="w-full py-2 px-4 border-2 border-dashed border-red-200 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="text-lg">🛠️</span>
                                    DEV: Skip & Test Modules
                                </button>
                                <p className="text-[10px] text-gray-400 text-center mt-2 italic">
                                    * Bypasses Supabase but applies your module selection.
                                </p>
                            </div>
                        )}
                    </form>

                    {/* Module Selection */}
                    <div className="space-y-4 border-l border-gray-100 pl-8">
                        <h3 className="text-lg font-medium text-gray-800">Customize your workspace</h3>
                        <p className="text-sm text-gray-500">Select the features you'd like to include in your dashboard.</p>

                        <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                            {modules.map((mod) => (
                                <div
                                    key={mod.id}
                                    onClick={() => toggleModule(mod.id)}
                                    className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col items-center gap-2 text-center
                    ${selectedModules.includes(mod.id)
                                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                                            : 'border-gray-100 hover:border-primary-200 text-gray-400'}
                    ${mod.required ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    <mod.icon className={`w-6 h-6 ${selectedModules.includes(mod.id) ? 'text-primary-600' : 'text-gray-300'}`} />
                                    <span className="text-[11px] font-bold uppercase tracking-wider">{mod.label}</span>
                                    {mod.required && <span className="text-[8px] italic">(Default)</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
