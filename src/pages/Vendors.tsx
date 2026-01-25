import { useState } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import type { Vendor, VendorCategory } from '../types'

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
  const { vendors, addVendor, updateVendor, deleteVendor } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<VendorCategory | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

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
    depositPaid: false
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
      website: '', price: 0, rating: 5, notes: '', contracted: false, depositPaid: false
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
      depositPaid: vendor.depositPaid
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
      <div className="flex flex-wrap gap-4">
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
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-yellow-500">{renderStars(vendor.rating)}</span>
                  <span className="font-medium text-gray-800">${vendor.price.toLocaleString()}</span>
                </div>
                {vendor.depositPaid && (
                  <p className="text-sm text-green-600 mt-1">Deposit paid</p>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(vendor)} className="btn-secondary flex-1 text-sm py-2">Edit</button>
                <button onClick={() => deleteVendor(vendor.id)} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                  <input type="text" required className="input-field" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
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
                  <input type="number" min="1" max="5" className="input-field" value={formData.rating}
                    onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea className="input-field" rows={2} value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
              </div>
              <div className="flex gap-4">
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
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingVendor ? 'Save Changes' : 'Add Vendor'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
