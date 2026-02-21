import React from 'react'
import { Link } from 'react-router-dom'
import {
    Camera,
    Video,
    Music,
    Flower,
    Cake,
    Utensils,
    MapPin,
    Users,
    Star,
    Car,
    Scissors,
    Truck,
    Heart
} from 'lucide-react'

const categories = [
    { id: 'photography', name: 'Photographers', icon: <Camera />, color: 'bg-rose-100 text-rose-600' },
    { id: 'videography', name: 'Videographers', icon: <Video />, color: 'bg-purple-100 text-purple-600' },
    { id: 'music', name: 'DJs/Bands', icon: <Music />, color: 'bg-blue-100 text-blue-600' },
    { id: 'florist', name: 'Florists', icon: <Flower />, color: 'bg-pink-100 text-pink-600' },
    { id: 'cake', name: 'Bakers', icon: <Cake />, color: 'bg-orange-100 text-orange-600' },
    { id: 'catering', name: 'Caterers', icon: <Utensils />, color: 'bg-emerald-100 text-emerald-600' },
    { id: 'venue', name: 'Venues', icon: <MapPin />, color: 'bg-indigo-100 text-indigo-600' },
    { id: 'officiant', name: 'Officiants', icon: <Users />, color: 'bg-cyan-100 text-cyan-600' },
    { id: 'hair-makeup', name: 'Beauty/Glam', icon: <Scissors />, color: 'bg-fuchsia-100 text-fuchsia-600' },
    { id: 'transportation', name: 'Transport', icon: <Car />, color: 'bg-slate-100 text-slate-600' },
    { id: 'rentals', name: 'Rentals', icon: <Truck />, color: 'bg-amber-100 text-amber-600' },
    { id: 'planner', name: 'Planners', icon: <Heart />, color: 'bg-red-100 text-red-600' },
    { id: 'other', name: 'Other', icon: <Star />, color: 'bg-gray-100 text-gray-600' }
]

export default function VendorDiscovery() {
    const [showRequestModal, setShowRequestModal] = React.useState(false)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-serif text-gray-900 mb-2">Find Your Perfect Team</h1>
                    <p className="text-lg text-gray-600">Discover elite vendors tailored to your style and location.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/vendors/manage" className="btn-secondary">Manage My Vendors</Link>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                    <Link
                        key={category.id}
                        to={`/vendors/search/${category.id}`}
                        className="group relative overflow-hidden rounded-2xl bg-white p-8 border border-gray-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 hover:border-primary-200"
                    >
                        <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl ${category.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                            {React.cloneElement(category.icon as React.ReactElement, { size: 32 })}
                        </div>
                        <h3 className="text-xl font-serif text-gray-900 mb-2">{category.name}</h3>
                        <p className="text-sm text-gray-500">Explore top rated {category.name.toLowerCase()} in your area.</p>
                        <div className="absolute bottom-0 left-0 h-1 w-0 bg-primary-500 transition-all group-hover:w-full" />
                    </Link>
                ))}
            </div>

            <div className="rounded-3xl bg-gradient-to-r from-primary-600 to-indigo-700 p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />

                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-serif mb-4">Can't find a vendor?</h2>
                    <p className="text-white/80 text-lg mb-8">
                        Tell us who you're looking for, and we'll help you find the perfect match or add them to our directory.
                    </p>
                    <button
                        onClick={() => setShowRequestModal(true)}
                        className="px-8 py-3 bg-white text-primary-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                    >
                        Request to Add Vendor
                    </button>
                </div>
            </div>

            {showRequestModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
                        <h2 className="text-2xl font-serif text-gray-900 mb-2">Request New Vendor</h2>
                        <p className="text-gray-500 text-sm mb-6">Send us the details and we'll verify them for our directory.</p>

                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowRequestModal(false); }}>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Vendor Name</label>
                                <input type="text" className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-primary-500 focus:border-primary-500" placeholder="e.g. Moonlight Studio" required />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-primary-500 focus:border-primary-500">
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Website or Social Link</label>
                                <input type="url" className="w-full px-4 py-3 bg-gray-50 border-gray-100 rounded-xl focus:ring-primary-500 focus:border-primary-500" placeholder="https://..." />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowRequestModal(false)} className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all">Cancel</button>
                                <button type="submit" className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
