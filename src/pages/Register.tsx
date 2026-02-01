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
    const [name, setName] = useState('')
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
                    data: { full_name: name }
                }
            })

            if (signUpError) throw signUpError

            if (data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email!,
                    name: name
                })
                updateAppSettings({ enabledModules: selectedModules })
                navigate('/')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
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
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field mt-1"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Alex & Sam"
                                />
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
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                        >
                            {loading ? 'Creating account...' : 'Start Planning'}
                        </button>

                        {import.meta.env.DEV && (
                            <div className="pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUser({
                                            id: 'dev-user-id',
                                            email: 'dev@test.com',
                                            name: name || 'Dev Tester'
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
