import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Star,
    MapPin,
    Heart,
    CheckCircle,
    Mail,
    MessageSquare,
    Globe,
    Phone,
    ChevronRight,
    Share2,
    ShieldCheck,
    Calendar,
    Clock,
    DollarSign
} from 'lucide-react'
import { generateVendorsForLocation } from '../utils/vendorGenerator'
import { useWeddingStore } from '../store/weddingStore'
import type { Vendor } from '../types'

export default function VendorProfile() {
    const { id } = useParams<{ id: string }>()
    const { user } = useWeddingStore()
    const [vendor, setVendor] = useState<Vendor | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'portfolio' | 'reviews' | 'pricing'>('portfolio')
    const [selectedImage, setSelectedImage] = useState<string | null>(null)

    const city = user?.city || 'Cincinnati'
    const state = user?.state || 'OH'

    useEffect(() => {
        // In a real app, we'd fetch by ID. 
        // For MVP/Mock, we'll generate the same vendor if we use the ID as a seed if possible, 
        // but for now we'll just find it in a generated set or create a mock.
        setLoading(true)
        setTimeout(() => {
            // Find or generate
            const allVendors = generateVendorsForLocation('photography', city, state, 100)
            const found = allVendors.find(v => v.id === id) || allVendors[0]
            setVendor(found)
            setLoading(false)
        }, 500)
    }, [id, city, state])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[80vh]">
                <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
            </div>
        )
    }

    if (!vendor) return <div>Vendor not found</div>

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header & Hero */}
            <div className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl group">
                <img
                    src={vendor.images?.[0]}
                    alt={vendor.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Link to={`/vendors/search/${vendor.category}`} className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/30 transition-colors">
                                    {vendor.category}
                                </Link>
                                {vendor.verified && (
                                    <span className="bg-blue-500/90 backdrop-blur-md px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                        <CheckCircle size={12} />
                                        Verified
                                    </span>
                                )}
                            </div>
                            <h1 className="text-5xl font-serif">{vendor.name}</h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <Star fill="#fbbf24" className="text-amber-400" size={24} />
                                    <span className="text-2xl font-bold">{vendor.rating}</span>
                                    <span className="text-white/60">({vendor.reviewCount} reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/80">
                                    <MapPin size={20} />
                                    <span>{vendor.address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white">
                                <Heart size={24} />
                            </button>
                            <button className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all text-white">
                                <Share2 size={24} />
                            </button>
                            <button className="h-14 px-8 rounded-2xl bg-primary-600 text-white font-bold hover:bg-primary-700 hover:shadow-xl transition-all shadow-lg active:scale-95">
                                Request Quote
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                <div className="space-y-8">
                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-gray-100">
                        {[
                            { id: 'portfolio', label: 'Portfolio' },
                            { id: 'pricing', label: 'Pricing & Packages' },
                            { id: 'reviews', label: 'Reviews' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`pb-4 text-sm font-bold uppercase tracking-widest transition-all relative ${activeTab === tab.id ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                {tab.label}
                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-full" />}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'portfolio' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {vendor.images?.map((img, i) => (
                                    <div
                                        key={i}
                                        className="aspect-square rounded-2xl overflow-hidden bg-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                                        onClick={() => setSelectedImage(img)}
                                    >
                                        <img src={img} alt={`${vendor.name} portfolio ${i}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { name: 'Classic Collection', price: vendor.price, features: ['6 Hours Coverage', 'Online Gallery', 'Digital Downloads', '1 Photographer'] },
                                    { name: 'Elite Experience', price: Math.round(vendor.price * 1.5), features: ['8 Hours Coverage', 'Engagement Session', 'Social Media Previews', '2 Photographers'] },
                                    { name: 'The Grand Celebration', price: Math.round(vendor.price * 2.2), features: ['Full Day Coverage', 'Heirloom Album', 'Rehearsal Dinner Coverage', 'Express Edits'] }
                                ].map((pkg, i) => (
                                    <div key={i} className={`p-8 rounded-3xl border-2 transition-all ${i === 1 ? 'border-primary-500 bg-primary-50 shadow-xl' : 'border-gray-100 bg-white shadow-sm'}`}>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                                        <p className="text-3xl font-serif text-primary-700 mb-6">${pkg.price.toLocaleString()}</p>
                                        <ul className="space-y-4 mb-8">
                                            {pkg.features.map((f, j) => (
                                                <li key={j} className="flex items-center gap-3 text-gray-600 text-sm">
                                                    <CheckCircle className="text-emerald-500" size={16} />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <button className={`w-full py-4 rounded-2xl font-bold transition-all ${i === 1 ? 'bg-primary-600 text-white' : 'bg-white border text-gray-900'}`}>
                                            Select Package
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'reviews' && (
                        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-serif text-gray-900">{vendor.reviewCount} Reviews</h3>
                                <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl text-amber-700 font-bold border border-amber-100">
                                    <Star fill="currentColor" size={20} />
                                    {vendor.rating} Out of 5
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic text-gray-600 relative">
                                        <div className="flex items-center gap-3 mb-4 not-italic">
                                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                {['S', 'M', 'J', 'A', 'K'][i - 1]}
                                            </div>
                                            <div>
                                                <span className="block font-bold text-gray-900">Guest {i}</span>
                                                <div className="flex items-center text-amber-400">
                                                    <Star fill="currentColor" size={12} />
                                                    <Star fill="currentColor" size={12} />
                                                    <Star fill="currentColor" size={12} />
                                                    <Star fill="currentColor" size={12} />
                                                    <Star fill="currentColor" size={12} />
                                                </div>
                                            </div>
                                            <span className="ml-auto text-xs text-gray-400 not-italic">Oct 12, 2025</span>
                                        </div>
                                        "{vendor.sampleReview} We couldn't have asked for a better experience. Every detail was handled with care and we felt so comfortable."
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* About Section */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                        <h3 className="text-2xl font-serif text-gray-900">About {vendor.name}</h3>
                        <p className="text-gray-600 leading-relaxed max-w-2xl">
                            {vendor.description} Based in {city}, we specialize in creating unforgettable moments for modern couples.
                            Our philosophy is built on three pillars: authenticity, luxury, and seamless execution.
                            We believe every wedding is a unique story waiting to be told, and we're here to provide the perfect backdrop and service for yours.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            {vendor.tags?.map(tag => (
                                <span key={tag} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Quick Actions Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden sticky top-6">
                        <div className="bg-primary-600 p-6 text-white">
                            <h4 className="font-bold flex items-center gap-2">
                                <MessageSquare size={18} />
                                Connect with Vendor
                            </h4>
                        </div>
                        <div className="p-6 space-y-4">
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:text-primary-700 transition-all font-medium">
                                <div className="flex items-center gap-3">
                                    <Mail size={18} className="text-primary-600" />
                                    Email Inquiry
                                </div>
                                <ChevronRight size={16} />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:text-primary-700 transition-all font-medium">
                                <div className="flex items-center gap-3">
                                    <Globe size={18} className="text-primary-600" />
                                    Visit Website
                                </div>
                                <ChevronRight size={16} />
                            </button>
                            <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-primary-50 hover:text-primary-700 transition-all font-medium">
                                <div className="flex items-center gap-3">
                                    <Phone size={18} className="text-primary-600" />
                                    Call Now
                                </div>
                                <ChevronRight size={16} />
                            </button>

                            <div className="pt-6 mt-6 border-t border-gray-100 space-y-4">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <Clock className="text-gray-400" size={18} />
                                    <span>Responds within 24 hours</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <Calendar className="text-gray-400" size={18} />
                                    <span>2 spots left for 2026</span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <ShieldCheck className="text-indigo-500" size={18} />
                                    <span>Elite Member Protection</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Pricing Summary */}
                    <div className="bg-gray-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                        <DollarSign className="absolute -top-4 -right-4 text-white/5" size={120} />
                        <h4 className="text-sm font-bold uppercase tracking-widest text-primary-400 mb-2">Estimated Investment</h4>
                        <p className="text-4xl font-serif mb-6">${vendor.price.toLocaleString()}+</p>
                        <p className="text-sm text-white/60 leading-relaxed mb-6">
                            This is a starting price estimate. Final pricing may vary based on date, guest count, and specific requests.
                        </p>
                        <button className="w-full py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-primary-50 transition-all">
                            Check Availability
                        </button>
                    </div>

                    {/* Location Map Placeholder */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-2">
                        <div className="h-48 rounded-2xl bg-gray-200 relative overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop"
                                alt="Map placeholder"
                                className="w-full h-full object-cover grayscale opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="p-3 bg-white rounded-full shadow-2xl animate-bounce">
                                    <MapPin size={24} className="text-primary-600" />
                                </div>
                            </div>
                        </div>
                        <div className="p-4">
                            <span className="block text-sm font-bold text-gray-900 mb-1">Service Area</span>
                            <span className="text-xs text-gray-500">Available within 50 miles of {city}, {state}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} alt="Portfolio Large" className="max-w-full max-h-full rounded-xl shadow-2xl" />
                    <button className="absolute top-8 right-8 text-white hover:text-primary-400 transition-colors">
                        <Clock size={32} className="rotate-45" /> {/* Close button replacement */}
                    </button>
                </div>
            )}
        </div>
    )
}
