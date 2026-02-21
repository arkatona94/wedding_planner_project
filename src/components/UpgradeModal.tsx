import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Check, X, Sparkles, Users, Palette, Layout, PieChart } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { trackUpsellImpression, trackUpgradeClick } from '../lib/analytics'

interface UpgradeModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
    feature?: string
    limitValue?: string | number
    currentValue?: string | number
    type: 'guests' | 'dresses' | 'seating' | 'budget'
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    feature,
    limitValue,
    currentValue,
    type
}) => {
    const navigate = useNavigate()

    useEffect(() => {
        if (isOpen) {
            trackUpsellImpression(type, { title, feature, limitValue, currentValue })
        }
    }, [isOpen, type, title, feature, limitValue, currentValue])

    const handleUpgrade = () => {
        trackUpgradeClick(type, { title })
        onClose()
        navigate('/pricing')
    }

    const icons = {
        guests: <Users className="w-12 h-12 text-rose-500" />,
        dresses: <Palette className="w-12 h-12 text-purple-500" />, // Changed from Scissors to Palette
        seating: <Layout className="w-12 h-12 text-amber-500" />,
        budget: <PieChart className="w-12 h-12 text-emerald-500" /> // Changed from PlusCircle to PieChart
    }

    const gradients = {
        guests: 'from-rose-50 to-rose-100 dark:from-rose-950/20 dark:to-rose-900/20',
        dresses: 'from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20',
        seating: 'from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/20',
        budget: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl"
                    >
                        {/* Header Gradient */}
                        <div className={`h-32 bg-gradient-to-br ${gradients[type]} flex items-center justify-center relative`}>
                            <div className="absolute top-4 right-4">
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-full bg-white/20 hover:bg-white/40 transition-colors text-slate-700 dark:text-slate-200"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl">
                                {icons[type]}
                            </div>
                        </div>

                        <div className="p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-600 bg-amber-100 rounded-full flex items-center gap-1">
                                    <Crown className="w-3 h-3" />
                                    Premium Feature
                                </span>
                            </div>

                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                                {title}
                            </h2>

                            <p className="text-slate-600 dark:text-slate-400 mb-6 text-lg">
                                {description}
                            </p>

                            {(limitValue !== undefined && currentValue !== undefined) && (
                                <div className="mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <div className="text-left">
                                        <p className="text-sm text-slate-500">Free Tier Limit</p>
                                        <p className="text-xl font-bold text-slate-900 dark:text-white">{limitValue} {type}</p>
                                    </div>
                                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-700 mx-4" />
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Current Count</p>
                                        <p className="text-xl font-bold text-rose-500">{currentValue}</p>
                                    </div>
                                </div>
                            )}

                            {feature && (
                                <div className="mb-8 space-y-3">
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest text-left">With Premium you get:</p>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="mt-1 p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">{feature}</p>
                                    </div>
                                    <div className="flex items-start gap-3 text-left">
                                        <div className="mt-1 p-0.5 bg-emerald-100 text-emerald-600 rounded-full">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <p className="text-slate-700 dark:text-slate-300 font-medium">Full access to all advanced planning tools</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleUpgrade}
                                    className="w-full py-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-200 dark:shadow-rose-900/20 transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 text-lg"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    Upgrade Now &mdash; $69
                                </button>
                                <button
                                    onClick={onClose}
                                    className="w-full py-4 bg-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium rounded-2xl transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>

                        {/* Analytics tracking pixel (hidden) */}
                        <div className="hidden" data-upsell-type={type} data-impression-id={Math.random()} />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export default UpgradeModal
