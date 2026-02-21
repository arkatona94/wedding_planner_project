import { useState, useEffect, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Star,
    MapPin,
    Heart,
    Filter,
    Search,
    ChevronRight,
    CheckCircle
} from 'lucide-react'
import { generateVendorsForLocation } from '../utils/vendorGenerator'
import { useWeddingStore } from '../store/weddingStore'
import type { Vendor, VendorCategory } from '../types'

const CATEGORY_NAMES: Record<string, string> = {
    photography: 'Photographers',
    videography: 'Videographers',
    music: 'DJs/Bands',
    florist: 'Florists',
    cake: 'Bakers',
    catering: 'Caterers',
    venue: 'Venues',
    officiant: 'Officiants',
    'hair-makeup': 'Hair & Makeup',
    transportation: 'Transportation',
    rentals: 'Rentals',
    planner: 'Planners',
    other: 'Other Vendors'
}

export default function VendorSearch() {
    const { categoryId } = useParams<{ categoryId: string }>()
    const { user } = useWeddingStore()
    const [vendors, setVendors] = useState<Vendor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    // Filters
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
    const [minRating, setMinRating] = useState<number>(0)
    const [verifiedOnly, setVerifiedOnly] = useState(false)
    const [distance, setDistance] = useState<number>(50)
    const [showFilters, setShowFilters] = useState(false)

    const city = user?.city || 'Cincinnati'
    const state = user?.state || 'OH'

    useEffect(() => {
        // Simulate API fetch
        setLoading(true)
        setTimeout(() => {
            const data = generateVendorsForLocation(categoryId as VendorCategory || 'other', city, state, 50)
            setVendors(data)
            setLoading(false)
        }, 800)
    }, [categoryId, city, state])

    const filteredVendors = useMemo(() => {
        return vendors.filter(v => {
            const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesPrice = v.price >= priceRange[0] && v.price <= priceRange[1]
            const matchesRating = v.rating >= minRating
            const matchesVerified = !verifiedOnly || v.verified
            return matchesSearch && matchesPrice && matchesRating && matchesVerified
        })
    }, [vendors, searchTerm, priceRange, minRating, verifiedOnly])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    <p className="text-gray-500 font-medium">Seeking the best {CATEGORY_NAMES[categoryId || ''] || 'vendors'}...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Breadcrumbs & Header */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link to="/vendors/discovery" className="hover:text-primary-600 transition-colors">Vendors</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">{CATEGORY_NAMES[categoryId || ''] || 'Search'}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-serif text-gray-900 flex items-center gap-3">
                            {CATEGORY_NAMES[categoryId || ''] || 'Vendors'} in {city}
                            {verifiedOnly && <CheckCircle size={24} className="text-blue-500" />}
                        </h1>
                        <p className="text-gray-500 mt-1">{filteredVendors.length} vendors available for your wedding</p>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder={`Search ${CATEGORY_NAMES[categoryId || '']?.toLowerCase() || 'vendors'}...`}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all md:hidden ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-200 text-gray-700'}`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-[280px_1fr] gap-8">
                {/* Sidebar Filters */}
                <aside className={`${showFilters ? 'block' : 'hidden'} md:block space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit sticky top-6`}>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Filter size={18} className="text-primary-600" />
                            Refine Search
                        </h3>

                        <div className="space-y-6">
                            {/* Price Range */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-4">Price Range</label>
                                <div className="space-y-4">
                                    <input
                                        type="range"
                                        min="0"
                                        max="10000"
                                        step="500"
                                        value={priceRange[1]}
                                        onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primary-600"
                                    />
                                    <div className="flex justify-between text-sm text-gray-500 font-medium">
                                        <span>$0</span>
                                        <span className="text-primary-600 font-bold">${priceRange[1].toLocaleString()}+</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Minimum Rating</label>
                                <div className="space-y-2">
                                    {[4, 4.5, 5].map((rate) => (
                                        <button
                                            key={rate}
                                            onClick={() => setMinRating(minRating === rate ? 0 : rate)}
                                            className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${minRating === rate ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'}`}
                                        >
                                            <div className="flex items-center gap-2 text-sm font-medium">
                                                <div className="flex items-center text-yellow-500">
                                                    <Star size={14} fill="currentColor" />
                                                </div>
                                                {rate}+ Stars
                                            </div>
                                            {minRating === rate && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Verified */}
                            <div className="flex items-center justify-between p-3 rounded-xl border border-blue-50 bg-blue-50/30">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                        <CheckCircle size={18} />
                                    </div>
                                    <div>
                                        <span className="block text-sm font-bold text-blue-900">Verified</span>
                                        <span className="text-[10px] text-blue-600 uppercase font-bold tracking-wider">Top Tier only</span>
                                    </div>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={verifiedOnly}
                                    onChange={(e) => setVerifiedOnly(e.target.checked)}
                                    className="w-5 h-5 rounded-md border-blue-200 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                            </div>

                            {/* Distance */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">Distance</label>
                                <select
                                    className="w-full p-3 bg-gray-50 border-gray-100 rounded-xl text-sm font-medium focus:ring-primary-500 focus:border-primary-500"
                                    value={distance}
                                    onChange={(e) => setDistance(parseInt(e.target.value))}
                                >
                                    <option value={10}>Within 10 miles</option>
                                    <option value={25}>Within 25 miles</option>
                                    <option value={50}>Within 50 miles</option>
                                </select>
                            </div>

                            <button
                                onClick={() => {
                                    setPriceRange([0, 10000])
                                    setMinRating(0)
                                    setVerifiedOnly(false)
                                    setDistance(50)
                                    setSearchTerm('')
                                }}
                                className="w-full py-3 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
                            >
                                Reset All Filters
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Results */}
                <div className="space-y-6">
                    {filteredVendors.length === 0 ? (
                        <div className="bg-white p-16 rounded-3xl border border-dashed border-gray-300 text-center space-y-4">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gray-50 text-gray-400 mb-4">
                                <Search size={40} />
                            </div>
                            <h3 className="text-2xl font-serif text-gray-900">No vendors found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                We couldn't find any {CATEGORY_NAMES[categoryId || '']?.toLowerCase()} matching your specific filters. Try broadening your criteria.
                            </p>
                            <button
                                onClick={() => {
                                    setPriceRange([0, 10000])
                                    setMinRating(0)
                                    setVerifiedOnly(false)
                                }}
                                className="btn-primary mt-4"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredVendors.map((vendor) => (
                                <div key={vendor.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                    {/* Portfolio Preview Grid */}
                                    <div className="grid grid-cols-3 gap-1 h-48 bg-gray-100">
                                        <img
                                            src={vendor.images?.[0]}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <img
                                            src={vendor.images?.[1]}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <img
                                            src={vendor.images?.[2]}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Link to={`/vendors/profile/${vendor.id}`} className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm shadow-xl hover:bg-primary-50">
                                                View Portfolio
                                            </Link>
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:underline cursor-pointer">
                                                        <Link to={`/vendors/profile/${vendor.id}`}>{vendor.name}</Link>
                                                    </h3>
                                                    {vendor.verified && (
                                                        <span className="text-blue-500 bg-blue-50 p-1 rounded-full border border-blue-100" title="Verified Vendor">
                                                            <CheckCircle size={14} fill="currentColor" className="text-white" />
                                                            <CheckCircle size={14} className="absolute inset-0 text-blue-500" />
                                                            {/* Replaced with simpler CheckCircle handled by size */}
                                                            <CheckCircle size={14} className="text-blue-500" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1 font-bold text-amber-500">
                                                        <Star size={16} fill="currentColor" />
                                                        {vendor.rating}
                                                        <span className="font-medium text-gray-400">({vendor.reviewCount} reviews)</span>
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MapPin size={14} />
                                                        {city}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-100 flex flex-col items-center">
                                                <span className="text-[10px] uppercase opacity-70">Quality Score</span>
                                                {vendor.qualityScore}/100
                                            </div>
                                        </div>

                                        <div className="space-y-3 mb-6">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {vendor.description}
                                            </p>
                                            {vendor.sampleReview && (
                                                <div className="bg-gray-50 p-3 rounded-xl border-l-4 border-primary-300">
                                                    <p className="text-xs italic text-gray-500 text-pretty">
                                                        "{vendor.sampleReview}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div>
                                                <span className="block text-xs text-gray-400 uppercase font-bold tracking-wider">Starts at</span>
                                                <span className="text-lg font-bold text-gray-900">
                                                    ${vendor.price.toLocaleString()}
                                                    <span className="text-sm text-gray-400 font-normal ml-1">avg.</span>
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100">
                                                    <Heart size={20} />
                                                </button>
                                                <Link
                                                    to={`/vendors/profile/${vendor.id}`}
                                                    className="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 hover:shadow-lg transition-all"
                                                >
                                                    View Profile
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
