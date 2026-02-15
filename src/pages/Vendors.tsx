import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { generateVendorsForLocation, hasRealVendorData } from '../utils/vendorGenerator'
import type { Vendor, VendorCategory } from '../types'
import venuesData from '../data/venues.json'
import photographyData from '../data/photography.json'
import cateringData from '../data/catering.json'
import videographyData from '../data/videography.json'
import floristData from '../data/florist.json'
import musicData from '../data/music.json'
import officiantData from '../data/officiant.json'
import cakeData from '../data/cake.json'
import rentalsData from '../data/rentals.json'
import transportationData from '../data/transportation.json'
import hairMakeupData from '../data/hair_makeup.json'

// Map categories to their data sources
const vendorDataMap: Partial<Record<VendorCategory, any>> = {
  venue: venuesData,
  photography: photographyData,
  catering: cateringData,
  videography: videographyData,
  florist: floristData,
  music: musicData,
  officiant: officiantData,
  cake: cakeData,
  rentals: rentalsData,
  transportation: transportationData,
  'hair-makeup': hairMakeupData
}

// Location-aware vendor list - generates appropriate data based on user's location
const getVendorList = (category: VendorCategory, userState?: string, userCity?: string): any[] => {
  // If user has a state set and we don't have real data for that location,
  // generate location-appropriate vendors
  if (userState && !hasRealVendorData(userState, userCity)) {
    return generateVendorsForLocation(category, userCity || 'Downtown', userState, 8)
  }

  // Otherwise use static data (Cincinnati/OH area)
  const data = vendorDataMap[category]
  if (!data) return []
  const vendors = data.results || data.all_venues || []

  // If state filter matches existing data's state, use it directly
  return vendors
}

const vendorCategories: { value: VendorCategory; label: string }[] = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'photography', label: 'Photography' },
  { value: 'videography', label: 'Videography' },
  { value: 'florist', label: 'Florist' },
  { value: 'music', label: 'Music/DJ' },
  { value: 'officiant', label: 'Officiant' },
  { value: 'cake', label: 'Cake' },
  { value: 'rentals', label: 'Rentals' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'hair-makeup', label: 'Hair & Makeup' },
  { value: 'other', label: 'Other' },
]

export default function Vendors() {
  const { vendors, addVendor, updateVendor, deleteVendor, user } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [nearMeFilter, setNearMeFilter] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    category: 'venue' as VendorCategory,
    contactName: '',
    email: '',
    phone: '',
    website: '',
    price: 0,
    rating: 5,
    notes: '',
    contracted: false,
    depositPaid: false,
    depositAmount: 0,
    tags: [] as string[]
  })

  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = categoryFilter === 'all' || vendor.category === categoryFilter
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contactName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const bookedCount = vendors.filter(v => v.contracted).length
  const totalCost = vendors.filter(v => v.contracted).reduce((sum, v) => sum + v.price, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingVendor) {
      updateVendor(editingVendor.id, formData)
    } else {
      addVendor(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: '', category: 'venue', contactName: '', email: '', phone: '',
      website: '', price: 0, rating: 5, notes: '', contracted: false, depositPaid: false,
      depositAmount: 0, tags: []
    })
    setShowAddModal(false)
    setEditingVendor(null)
  }

  const startEdit = (vendor: Vendor) => {
    setEditingVendor(vendor)
    setFormData({
      name: vendor.name,
      category: vendor.category,
      contactName: vendor.contactName,
      email: vendor.email,
      phone: vendor.phone,
      website: vendor.website,
      price: vendor.price,
      rating: vendor.rating,
      notes: vendor.notes,
      contracted: vendor.contracted,
      depositPaid: vendor.depositPaid,
      depositAmount: vendor.depositAmount || 0,
      tags: vendor.tags || []
    })
    setShowAddModal(true)
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Vendors</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800">Vendor Management</h1>
          <p className="text-gray-500">{bookedCount} of {vendors.length} vendors booked</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Add Vendor</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Vendors</p>
          <p className="text-3xl font-serif text-gray-800">{vendors.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Booked</p>
          <p className="text-3xl font-serif text-green-600">{bookedCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Contracted Cost</p>
          <p className="text-3xl font-serif text-primary-600">${totalCost.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search vendors..."
          className="input-field w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="input-field w-auto"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as VendorCategory | 'all')}
        >
          <option value="all">All Categories</option>
          {vendorCategories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
        {user?.state && (
          <button
            onClick={() => setNearMeFilter(!nearMeFilter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${nearMeFilter
              ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
              : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
              }`}
          >
            📍 Near Me {user.state && `(${user.state})`}
          </button>
        )}
        {!user?.state && (
          <span className="text-sm text-gray-400 italic">
            Add your location in Settings to filter vendors
          </span>
        )}
      </div>

      {/* Vendor Grid */}
      {filteredVendors.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500">No vendors found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor) => (
            <div key={vendor.id} className={`card ${vendor.contracted ? 'ring-2 ring-green-200' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-800">{vendor.name}</h3>
                  <p className="text-sm text-gray-500">
                    {vendorCategories.find(c => c.value === vendor.category)?.label}
                  </p>
                </div>
                {vendor.contracted && (
                  <span className="badge badge-success">Booked</span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {vendor.contactName && (
                  <p className="text-gray-600">Contact: {vendor.contactName}</p>
                )}
                {vendor.email && (
                  <p className="text-gray-600">{vendor.email}</p>
                )}
                {vendor.phone && (
                  <p className="text-gray-600">{vendor.phone}</p>
                )}
                {vendor.website && (
                  <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline block">
                    Website
                  </a>
                )}
                {vendor.tags && vendor.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {vendor.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {vendor.tags.length > 3 && (
                      <span className="text-xs text-gray-500 py-0.5">+{vendor.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                {vendor.address && (
                  <p className="text-gray-600 truncate">{vendor.address}</p>
                )}
                {vendor.notes && vendor.notes.includes('Generated Suggestion.') && (
                  <p className="text-xs text-gray-500 italic mt-2 line-clamp-2">
                    "{vendor.notes.split('Generated Suggestion. ')[1]}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">{renderStars(vendor.rating)}</span>
                  {vendor.reviewCount && (
                    <span className="text-xs text-gray-400">({vendor.reviewCount})</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {vendor.costRange && (
                    <span className="text-gray-500 font-medium text-sm">{vendor.costRange}</span>
                  )}
                  <span className="font-medium text-gray-800">${vendor.price.toLocaleString()}</span>
                </div>
              </div>
              {(vendor.contracted || vendor.depositPaid) && (
                <div className="mt-2 text-sm space-y-1">
                  {vendor.depositPaid && (
                    <div className="flex justify-between text-green-600">
                      <span>Deposit Paid:</span>
                      <span>${(vendor.depositAmount || 0).toLocaleString()}</span>
                    </div>
                  )}
                  {vendor.price > 0 && (
                    <div className="flex justify-between font-medium text-gray-600">
                      <span>Balance:</span>
                      <span>${(vendor.price - (vendor.depositAmount || 0)).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(vendor)} className="btn-secondary flex-1 text-sm py-2">Edit</button>
                <button onClick={() => deleteVendor(vendor.id)} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Add/Edit Modal */}
      {
        showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
              <h2 className="text-xl font-serif text-gray-800 mb-4">{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                    {getVendorList(formData.category).length > 0 ? (
                      <div className="space-y-2">
                        <select
                          className="input-field"
                          onChange={(e) => {
                            const list = getVendorList(formData.category)
                            const selectedVendor = list.find((v: any) => v.name === e.target.value)

                            if (selectedVendor) {
                              let notes = ''
                              if (selectedVendor.capacity) notes += `Capacity: ${selectedVendor.capacity} guests\n`
                              if (selectedVendor.address) notes += `Address: ${selectedVendor.address}, ${selectedVendor.city}, ${selectedVendor.state || 'OH'} ${selectedVendor.zip_code || ''}\n`

                              const tags = selectedVendor.tags || selectedVendor.amenities || []

                              setFormData({
                                ...formData,
                                name: selectedVendor.name,
                                contactName: '',
                                phone: selectedVendor.phone || '',
                                email: '',
                                website: selectedVendor.website || '',
                                price: (selectedVendor.price_range?.length || 0) * 1000,
                                rating: selectedVendor.rating || 5,
                                notes: notes.trim(),
                                tags: tags
                              })
                            } else {
                              setFormData({ ...formData, name: e.target.value })
                            }
                          }}
                          value={getVendorList(formData.category).some((v: any) => v.name === formData.name) ? formData.name : ''}
                        >
                          <option value="">Select a {vendorCategories.find(c => c.value === formData.category)?.label}...</option>
                          {getVendorList(formData.category).map((vendor: any, index: number) => (
                            <option key={index} value={vendor.name}>
                              {vendor.name} ({vendor.city})
                            </option>
                          ))}
                          <option value="custom">Enter Custom Name...</option>
                        </select>
                        {(!getVendorList(formData.category).some((v: any) => v.name === formData.name)) && (
                          <input
                            type="text"
                            placeholder="Enter vendor name"
                            required
                            className="input-field"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        )}
                      </div>
                    ) : (
                      <input type="text" required className="input-field" value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select className="input-field" value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as VendorCategory })}>
                      {vendorCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Highlights Display */}
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="col-span-2 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Highlights & Offerings</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, idx) => (
                          <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input type="text" className="input-field" value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" className="input-field" value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="tel" className="input-field" value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input type="url" className="input-field" value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                    <input type="number" className="input-field" value={formData.price || ''}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      className={`input-field ${getVendorList(formData.category).some((v: any) => v.name === formData.name) ? 'bg-gray-100 text-gray-500' : ''}`}
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      disabled={getVendorList(formData.category).some((v: any) => v.name === formData.name)}
                    />
                    {getVendorList(formData.category).some((v: any) => v.name === formData.name) && (
                      <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        Verified from source
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea className="input-field" rows={2} value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.contracted}
                        onChange={(e) => setFormData({ ...formData, contracted: e.target.checked })} />
                      <span className="text-sm font-medium text-gray-700">Contracted/Booked</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.depositPaid}
                        onChange={(e) => setFormData({ ...formData, depositPaid: e.target.checked })} />
                      <span className="text-sm font-medium text-gray-700">Deposit Paid</span>
                    </label>
                  </div>

                  {formData.depositPaid && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount ($)</label>
                      <input
                        type="number"
                        className="input-field bg-white"
                        value={formData.depositAmount || ''}
                        onChange={(e) => setFormData({ ...formData, depositAmount: Number(e.target.value) })}
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">{editingVendor ? 'Save Changes' : 'Add Vendor'}</button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </div >
  )
}
