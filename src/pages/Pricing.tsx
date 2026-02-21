import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Crown, Sparkles, Star, Shield, Zap, TrendingUp, HelpCircle, ArrowRight } from 'lucide-react'
import { useWeddingStore } from '../store/weddingStore'

const Pricing = () => {
    const [billingPeriod, setBillingPeriod] = useState<3 | 6 | 12 | 18>(6)
    const user = useWeddingStore(state => state.user)
    const updateUser = useWeddingStore(state => state.updateUser)

    const handleUpgrade = async () => {
        if (!user) return
        // In a real app, this would trigger Stripe or another payment gateway
        await updateUser({ isPremium: true })
        alert('Congratulations! You are now a Premium member. ✨')
        window.location.href = '/'
    }

    const features = [
        { name: 'Guest List Limit', free: '100 Guests', premium: 'Unlimited Guests', icon: <Check className="w-5 h-5 text-emerald-500" /> },
        { name: 'Virtual Try-On', free: '5 Saved Dresses', premium: 'Unlimited Dresses', icon: <Check className="w-5 h-5 text-emerald-500" /> },
        { name: 'Seating Chart', free: 'View Only', premium: 'Interactive Drag & Drop', icon: <Check className="w-5 h-5 text-emerald-500" /> },
        { name: 'Budget Categories', free: '10 Categories', premium: 'Unlimited Categories', icon: <Check className="w-5 h-5 text-emerald-500" /> },
        { name: 'AI Planning Assistant', free: 'Limited', premium: 'Unlimited Access', icon: <Check className="w-5 h-5 text-emerald-500" /> },
        { name: 'Custom Wedding Website', free: 'Basic', premium: 'Premium Templates', icon: <Check className="w-5 h-5 text-emerald-500" /> },
        { name: 'Export Tools (PDF/CSV)', free: <div className="h-1 w-4 bg-slate-300 rounded-full" />, premium: 'Full Access', icon: <Check className="w-5 h-5 text-emerald-500" /> },
        { name: 'Priority Support', free: <div className="h-1 w-4 bg-slate-300 rounded-full" />, premium: '24/7 Priority', icon: <Check className="w-5 h-5 text-emerald-500" /> },
    ]

    const faqs = [
        { q: "Can I upgrade later?", a: "Affirmative! You can start on the free tier and upgrade whenever your guest list or planning needs grow." },
        { q: "Is the price a one-time fee?", a: "Our pricing is based on access duration. $69 gives you 6 full months of premium access, perfect for the average planning cycle." },
        { q: "What happens when my premium expires?", a: "Your data is always safe. You'll simply revert to the free tier limits for new additions, but all your existing data remains accessible." },
        { q: "Can I share my account?", a: "Premium accounts are designed for couples. You can both log in with the same credentials to plan together." }
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 font-bold text-sm mb-6"
                >
                    <Crown className="w-4 h-4" />
                    Premium Anniversary Sale
                </motion.div>

                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                    Unlock the Full <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">EverAfter Experience</span>
                </h1>

                <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Take the stress out of wedding planning with our most powerful tools and unlimited everything.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                {/* Free Tier */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col"
                >
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Free Starter</h2>
                        <p className="text-slate-500">Perfect for getting started</p>
                        <div className="mt-6 flex items-baseline">
                            <span className="text-5xl font-black text-slate-900 dark:text-white">$0</span>
                            <span className="ml-2 text-slate-500">forever</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-12 flex-grow">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                                <span className="text-sm">{f.name}</span>
                                <span className="font-medium">{typeof f.free === 'string' ? f.free : f.free}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        disabled
                        className="w-full py-4 text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-2xl font-bold cursor-not-allowed"
                    >
                        Current Plan
                    </button>
                </motion.div>

                {/* Premium Tier */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative bg-white dark:bg-slate-900 rounded-3xl p-8 border-4 border-rose-500 shadow-2xl shadow-rose-200 dark:shadow-rose-900/20 flex flex-col"
                >
                    <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-rose-500 to-amber-500 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest shadow-lg">
                        Best Value
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Premium Full Access</h2>
                            <Sparkles className="w-5 h-5 text-amber-500" />
                        </div>
                        <p className="text-slate-500">Everything you need for a perfect day</p>

                        <div className="mt-6 flex items-baseline">
                            <span className="text-5xl font-black text-slate-900 dark:text-white">$69</span>
                            <span className="ml-2 text-slate-500">/ 6 months</span>
                        </div>

                        {/* Billing Period Selector */}
                        <div className="mt-8 flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            {[3, 6, 12, 18].map((period) => (
                                <button
                                    key={period}
                                    onClick={() => setBillingPeriod(period as any)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${billingPeriod === period
                                        ? 'bg-white dark:bg-slate-700 text-rose-500 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {period}M
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4 mb-12 flex-grow">
                        {features.map((f, i) => (
                            <div key={i} className="flex items-center justify-between text-slate-900 dark:text-white">
                                <div className="flex items-center gap-2">
                                    {f.icon}
                                    <span className="text-sm font-medium">{f.name}</span>
                                </div>
                                <span className="font-bold">{f.premium}</span>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
                    >
                        Upgrade Now <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Shield className="w-3 h-3" />
                        Secure payment & instant activation
                    </p>
                </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 opacity-60">
                <div className="flex flex-col items-center text-center gap-2">
                    <Zap className="w-8 h-8 text-rose-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Instant Access</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <Star className="w-8 h-8 text-amber-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Top Rated App</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <Shield className="w-8 h-8 text-emerald-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Money-Back Guarantee</p>
                </div>
                <div className="flex flex-col items-center text-center gap-2">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Stress Reduction</p>
                </div>
            </div>

            {/* FAQ */}
            <div className="max-w-4xl mx-auto">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 text-center flex items-center justify-center gap-3">
                    <HelpCircle className="w-8 h-8 text-rose-500" />
                    Frequently Asked Questions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">{faq.q}</h4>
                            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Pricing
