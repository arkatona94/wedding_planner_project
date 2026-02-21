import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Calendar, DollarSign, Check, ChevronRight, Lock, Users } from 'lucide-react'
import { useWeddingStore } from '../store/weddingStore'
import { supabase } from '../lib/supabase'

// --- Types ---
type Stage = 1 | 2 | 3 | 4
type Step2 = 'a' | 'b' | 'c'

// --- Assets/Constants ---
// Using the requested colors as constants for reference/inline styles where Tailwind doesn't suffice


export default function Onboarding() {
    const navigate = useNavigate()
    const { setUser, setWedding, updateAppSettings } = useWeddingStore()

    // State
    const [stage, setStage] = useState<Stage>(1)
    const [step2, setStep2] = useState<Step2>('a')
    const [isLoading, setIsLoading] = useState(false)

    // Data State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        weddingDate: '',
        city: 'Cincinnati', // Default as per prompt example
        state: 'OH',
        guestCount: '100-150',
        budget: '',
        name: '',
        partnerName: '',
        partnerEmail: '',
        features: [] as string[]
    })

    // --- Handlers ---
    const handleNext = () => {
        if (stage === 1) {
            if (!formData.email || !formData.password) return alert('Please fill in all fields')
            // Simulate signup or actual signup here? 
            // For the flow, we'll just move next and sign up at the end or "hold" the data.
            // But to ensure they get an account, let's try to sign them up now or better, just validate.
            setStage(2)
        } else if (stage === 2) {
            if (step2 === 'a') setStep2('b')
            else if (step2 === 'b') setStep2('c')
            else setStage(3)
        } else if (stage === 3) {
            completeOnboarding()
        }
    }

    const completeOnboarding = async () => {
        setIsLoading(true)
        try {
            // 1. Sign Up User
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        city: formData.city,
                        state: formData.state
                    }
                }
            })

            if (authError) throw authError

            if (authData.user) {
                // 2. Create Wedding
                const { data: weddingData } = await supabase
                    .from('weddings')
                    .insert({
                        user_id: authData.user.id,
                        partner1_name: formData.name,
                        partner2_name: formData.partnerName,
                        wedding_date: formData.weddingDate || null,
                        total_budget: parseInt(formData.budget) || 0,
                        estimated_guests: parseInt(formData.guestCount.split('-')[1]) || 100,
                        venue_city: formData.city
                    })
                    .select()
                    .single()

                // 3. Update Store
                setUser({
                    id: authData.user.id,
                    email: formData.email,
                    name: formData.name,
                    city: formData.city,
                    state: formData.state,
                    zipCode: ''
                })

                if (weddingData) {
                    setWedding({
                        id: weddingData.id,
                        partner1Name: formData.name,
                        partner2Name: formData.partnerName,
                        weddingDate: formData.weddingDate,
                        totalBudget: parseInt(formData.budget) || 0,
                        estimatedGuests: parseInt(formData.guestCount.split('-')[1]) || 100
                    })
                }

                // 4. Set Features (Store in app settings)
                updateAppSettings({
                    enabledModules: ['dashboard', ...formData.features.map(f => f.toLowerCase().replace(/ /g, '_'))]
                })
            }

            setStage(4)

            // Auto redirect after a delay
            setTimeout(() => {
                navigate('/')
            }, 4000)
        } catch (error: any) {
            console.error('Onboarding error:', error)
            alert(error.message || 'Something went wrong during setup.')
        } finally {
            setIsLoading(false)
        }
    }

    // --- Render Helpers ---

    // Progress Bar
    const ProgressBar = () => {
        const stages = ['Proposal', 'Planning', 'Prep', 'Big Day']
        return (
            <div className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 px-4 py-3 border-b border-stone-200">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center relative">
                        {/* Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-[color:var(--color-wedding-gold)] -z-10 transition-all duration-1000"
                            style={{ width: `${((stage - 1) / 3) * 100}%` }}
                        />

                        {stages.map((label, idx) => {
                            const s = idx + 1
                            const isActive = s === stage
                            const isPast = s < stage
                            return (
                                <div key={label} className="flex flex-col items-center gap-2 bg-white px-2">
                                    <div
                                        className={`w-4 h-4 rounded-full border-2 transition-colors duration-500
                      ${isActive || isPast ? 'bg-[color:var(--color-wedding-gold)] border-[color:var(--color-wedding-gold)]' : 'border-gray-300 bg-white'}
                      ${isActive ? 'ring-4 ring-[#FFD700]/20' : ''}
                    `}
                                    />
                                    <span className={`text-xs font-medium transition-colors ${isActive || isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className="min-h-screen font-sans selection:bg-[#FFD700]/30 overflow-auto bg-cover bg-center bg-no-repeat bg-fixed"
            style={{
                backgroundImage: `linear-gradient(rgba(253, 252, 248, 0.85), rgba(253, 252, 248, 0.95)), url('/images/landing-bg.png')`,
            }}
        >
            <ProgressBar />

            <div className="min-h-screen flex items-center justify-center pt-20 pb-10 px-4">
                <AnimatePresence mode="wait">
                    {stage === 1 && (
                        <Stage1 key="stage1" formData={formData} setFormData={setFormData} onNext={handleNext} />
                    )}
                    {stage === 2 && (
                        <Stage2 key="stage2" step={step2} formData={formData} setFormData={setFormData} onNext={handleNext} />
                    )}
                    {stage === 3 && (
                        <Stage3 key="stage3" formData={formData} setFormData={setFormData} onNext={handleNext} isLoading={isLoading} />
                    )}
                    {stage === 4 && (
                        <Stage4 key="stage4" userName={formData.name} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

// --- Stages Components ---

function Stage1({ formData, setFormData, onNext }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md text-center"
        >
            <div className="mb-8 relative inline-block">
                <motion.div
                    animate={{ rotate: [0, -5, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 5, repeatDelay: 2 }}
                    className="text-6xl mb-2"
                >
                    💍
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute -top-2 -right-2 text-2xl"
                >
                    ✨
                </motion.div>
            </div>

            <h1 className="text-4xl font-serif mb-4 text-gray-900">
                It all starts with <span className="text-[#c97f66] italic">"Yes!"</span>
            </h1>

            <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                Plan Your Dream Wedding. <br />
                Without Selling Your Soul (or Your Data).
            </p>

            <div className="space-y-4 bg-white p-8 rounded-2xl shadow-xl shadow-[#FFD700]/10 border border-[#FFF8DC]">
                <div className="text-left space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none transition-all"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>

                <div className="text-left space-y-1">
                    <label className="text-sm font-medium text-gray-700">Password</label>
                    <div className="relative">
                        <input
                            type="password"
                            placeholder="Create a password"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-[#FFD700] focus:border-transparent outline-none transition-all"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                        <Lock className="absolute right-3 top-3.5 text-gray-400 w-4 h-4" />
                    </div>
                </div>

                <button
                    onClick={onNext}
                    className="w-full bg-[#c97f66] text-white font-medium py-4 rounded-lg hover:bg-[#b06a52] transition-colors flex items-center justify-center gap-2 group"
                >
                    Begin Your Journey
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </motion.div>
    )
}

function Stage2({ step, formData, setFormData, onNext }: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-lg bg-white p-2 rounded-2xl shadow-2xl relative"
            style={{ backgroundImage: 'linear-gradient(to bottom right, #fff, #fffaf0)' }}
        >
            <div className="absolute top-0 left-0 w-full h-2 bg-[repeating-linear-gradient(45deg,#FFD700,#FFD700_10px,#fff_10px,#fff_20px)] rounded-t-2xl opacity-50" />

            <div className="p-8 min-h-[400px] flex flex-col">
                <div className="flex-1">
                    {step === 'a' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="2a">
                            <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                                <Calendar className="text-[#c97f66]" /> Setting the Date & Place
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">When is the big day?</label>
                                    <input
                                        type="date"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#FFD700]/50 outline-none"
                                        value={formData.weddingDate}
                                        onChange={e => setFormData({ ...formData, weddingDate: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">It's okay if you're just guessing for now!</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Where's it happening?</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#FFD700]/50 outline-none"
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    >
                                        <option>Cincinnati, OH</option>
                                        <option>Columbus, OH</option>
                                        <option>Cleveland, OH</option>
                                        <option>Dayton, OH</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">How many guests?</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {['Just Us', 'Up to 50', '50-100', '100-150', '150-200', '200+'].map(opt => (
                                            <button
                                                key={opt}
                                                onClick={() => setFormData({ ...formData, guestCount: opt })}
                                                className={`py-2 px-3 rounded-lg text-sm transition-all border
                          ${formData.guestCount === opt
                                                        ? 'bg-[#ffe4e1] border-[#FFB6C1] text-[#c97f66]'
                                                        : 'bg-white border-gray-200 hover:border-[#FFB6C1]'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 'b' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="2b">
                            <h2 className="text-2xl font-serif text-gray-900 mb-2 flex items-center gap-3">
                                <DollarSign className="text-[#c97f66]" /> Dreaming About Budget
                            </h2>
                            <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg">
                                💡 Typical weddings in {formData.city} range from <strong>$28k - $38k</strong>.
                            </p>

                            <div className="space-y-8">
                                <div className="text-center py-6">
                                    <div className="text-5xl mb-2 transition-all">🐷</div>
                                    <input
                                        type="number"
                                        placeholder="30000"
                                        className="text-3xl font-bold text-center w-full bg-transparent border-b-2 border-gray-200 focus:border-[#FFD700] outline-none placeholder:text-gray-300"
                                        value={formData.budget}
                                        onChange={e => setFormData({ ...formData, budget: e.target.value })}
                                    />
                                    <span className="text-sm text-gray-400">Estimated Total Budget</span>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center">
                                    {['15000', '25000', '35000', '50000'].map(amt => (
                                        <button
                                            key={amt}
                                            onClick={() => setFormData({ ...formData, budget: amt })}
                                            className="px-4 py-2 rounded-full border border-gray-200 hover:border-[#FFD700] hover:bg-[#FFF8DC] transition-colors text-sm"
                                        >
                                            ${parseInt(amt).toLocaleString()}
                                        </button>
                                    ))}
                                </div>

                                <label className="flex items-center gap-2 justify-center text-gray-500 cursor-pointer">
                                    <input type="checkbox" className="rounded text-[#c97f66] focus:ring-[#c97f66]" />
                                    <span className="text-sm">I'm genuinely not sure yet</span>
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {step === 'c' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key="2c">
                            <h2 className="text-2xl font-serif text-gray-900 mb-6 flex items-center gap-3">
                                <Users className="text-[#c97f66]" /> Who's On This Journey?
                            </h2>

                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                                    <input
                                        type="text"
                                        placeholder="Jane Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#FFD700]/50 outline-none"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Partner's Name (Optional)</label>
                                    <input
                                        type="text"
                                        placeholder="John Smith"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#FFD700]/50 outline-none"
                                        value={formData.partnerName}
                                        onChange={e => setFormData({ ...formData, partnerName: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Partner's Email</label>
                                    <input
                                        type="email"
                                        placeholder="So you can invite them later!"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[#FFD700]/50 outline-none"
                                        value={formData.partnerEmail}
                                        onChange={e => setFormData({ ...formData, partnerEmail: e.target.value })}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="pt-8 flex justify-end">
                    <button
                        onClick={onNext}
                        className="bg-gray-900 text-white px-8 py-3 rounded-full hover:bg-gray-800 transition-all flex items-center gap-2"
                    >
                        Continue <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function Stage3({ formData, setFormData, onNext, isLoading }: any) {
    const features = [
        { id: 'try_on', label: 'Virtual Dress Try-On', icon: '👗', badge: '✨ Magic' },
        { id: 'budget', label: 'Budget Tracking', icon: '💰' },
        { id: 'vendors', label: 'Vendor Search', icon: '🏪' },
        { id: 'guests', label: 'Guest List & RSVPs', icon: '📫' },
        { id: 'seating', label: 'Seating Chart', icon: '🪑', badge: 'Premium' },
    ]

    const toggleFeature = (id: string) => {
        if (formData.features.includes(id)) {
            setFormData({ ...formData, features: formData.features.filter((f: string) => f !== id) })
        } else {
            setFormData({ ...formData, features: [...formData.features, id] })
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-4xl"
        >
            <div className="text-center mb-10">
                <h2 className="text-4xl font-serif mb-4">The Prep</h2>
                <p className="text-gray-600">Select the tools you want to start with</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {features.map(feat => {
                    const isSelected = formData.features.includes(feat.id)
                    return (
                        <motion.div
                            key={feat.id}
                            whileHover={{ y: -5 }}
                            onClick={() => toggleFeature(feat.id)}
                            className={`cursor-pointer relative p-6 rounded-xl border-2 transition-all duration-300
                 ${isSelected ? 'border-[#FFD700] bg-white shadow-lg' : 'border-dashed border-gray-300 bg-white/50 hover:border-gray-400'}
               `}
                        >
                            {feat.badge && (
                                <span className="absolute -top-3 -right-3 bg-gray-900 text-white text-xs px-2 py-1 rounded-full">{feat.badge}</span>
                            )}
                            <div className="text-4xl mb-4">{feat.icon}</div>
                            <h3 className="font-medium text-lg text-gray-900">{feat.label}</h3>

                            <div className={`absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-colors
                 ${isSelected ? 'bg-[#c97f66] text-white' : 'bg-gray-100'}
               `}>
                                {isSelected && <Check className="w-3 h-3" />}
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={onNext}
                    disabled={isLoading}
                    className="bg-[#c97f66] text-white px-12 py-4 rounded-full text-lg hover:bg-[#b06a52] transition-all flex items-center gap-2 shadow-xl shadow-[#c97f66]/20 disabled:opacity-70"
                >
                    {isLoading ? 'Setting up...' : 'Almost There!'}
                    {!isLoading && <ChevronRight className="w-5 h-5" />}
                </button>
            </div>
        </motion.div>
    )
}

function Stage4({ userName }: any) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl text-center"
        >
            {/* Confetti effect could be added here with separate library, using visual emoji for now */}
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="text-6xl mb-6"
            >
                🎉 🎊 🎉
            </motion.div>

            <h1 className="text-5xl font-serif text-gray-900 mb-6">
                Welcome, {userName || 'Beautiful'}!
            </h1>

            <p className="text-xl text-gray-600 mb-12">
                Your dashboard is ready. Let's make this happen.
            </p>

            {/* Progress Ring Simulation */}
            <div className="relative w-48 h-48 mx-auto mb-12">
                <svg className="w-full h-full transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="transparent"
                        stroke="#eee"
                        strokeWidth="12"
                    />
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        fill="transparent"
                        stroke="#FFD700"
                        strokeWidth="12"
                        strokeDasharray={552}
                        strokeDashoffset={552 - (552 * 0.32)}
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-gray-900">32%</span>
                    <span className="text-xs text-gray-400 uppercase tracking-widest">Complete</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {['Try Dresses', 'Set Budget', 'Find Vendors'].map((action, i) => (
                    <motion.div
                        key={action}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + (i * 0.1) }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    >
                        <h3 className="font-medium text-gray-800">{action}</h3>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
