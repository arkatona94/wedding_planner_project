import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { QRCodeSVG } from 'qrcode.react'
import type { Guest, RSVPStatus } from '../types'


const mealOptions = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal']
const dietaryOptions = ['Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Kosher', 'Halal']

export default function Guests() {
  const { guests, addGuest, updateGuest, deleteGuest, importGuests, tables } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [rsvpFilter, setRsvpFilter] = useState<RSVPStatus | 'all'>('all')
  const [groupFilter, setGroupFilter] = useState<string>('all')

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
    rsvpStatus: 'pending' as RSVPStatus,
    mealChoice: '',
    dietaryRestrictions: [] as string[],
    plusOne: false,
    plusOneName: '',
    tableAssignment: null as string | null,
    group: '',
    notes: ''
  })

  const uniqueGroups = [...new Set(guests.map(g => g.group).filter(Boolean))]

  const filteredGuests = guests.filter(guest => {
    const matchesSearch = `${guest.firstName} ${guest.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRSVP = rsvpFilter === 'all' || guest.rsvpStatus === rsvpFilter
    const matchesGroup = groupFilter === 'all' || guest.group === groupFilter
    return matchesSearch && matchesRSVP && matchesGroup
  })

  const stats = {
    total: guests.length,
    attending: guests.filter(g => g.rsvpStatus === 'attending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    withPlusOne: guests.filter(g => g.plusOne && g.rsvpStatus === 'attending').length
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGuest) {
      updateGuest(editingGuest.id, formData)
    } else {
      addGuest(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      firstName: '', lastName: '', email: '', phone: '',
      address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
      rsvpStatus: 'pending', mealChoice: '', dietaryRestrictions: [],
      plusOne: false, plusOneName: '', tableAssignment: null, group: '', notes: ''
    })
    setShowAddModal(false)
    setEditingGuest(null)
  }

  const startEdit = (guest: Guest) => {
    setEditingGuest(guest)
    setFormData({
      firstName: guest.firstName,
      lastName: guest.lastName,
      email: guest.email,
      phone: guest.phone,
      address: guest.address,
      rsvpStatus: guest.rsvpStatus,
      mealChoice: guest.mealChoice,
      dietaryRestrictions: guest.dietaryRestrictions,
      plusOne: guest.plusOne,
      plusOneName: guest.plusOneName,
      tableAssignment: guest.tableAssignment,
      group: guest.group,
      notes: guest.notes
    })
    setShowAddModal(true)
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      const lines = text.split('\n').filter(line => line.trim())
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())

      const newGuests = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim())
        const guest: Omit<Guest, 'id'> = {
          firstName: values[headers.indexOf('first name')] || values[headers.indexOf('firstname')] || '',
          lastName: values[headers.indexOf('last name')] || values[headers.indexOf('lastname')] || '',
          email: values[headers.indexOf('email')] || '',
          phone: values[headers.indexOf('phone')] || '',
          address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
          rsvpStatus: 'pending',
          mealChoice: '',
          dietaryRestrictions: [],
          plusOne: false,
          plusOneName: '',
          tableAssignment: null,
          group: values[headers.indexOf('group')] || '',
          notes: ''
        }
        return guest
      }).filter(g => g.firstName || g.lastName)

      importGuests(newGuests)
      setShowImportModal(false)
    }
    reader.readAsText(file)
  }

  const exportCSV = () => {
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'RSVP Status', 'Meal Choice', 'Dietary Restrictions', 'Plus One', 'Plus One Name', 'Group', 'Table']
    const rows = guests.map(g => [
      g.firstName, g.lastName, g.email, g.phone, g.rsvpStatus, g.mealChoice,
      g.dietaryRestrictions.join('; '), g.plusOne ? 'Yes' : 'No', g.plusOneName, g.group,
      tables.find(t => t.id === g.tableAssignment)?.name || ''
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-list.csv'
    a.click()
  }

  const rsvpUrl = `${window.location.origin}/rsvp`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Guest Management</h1>
          <p className="text-gray-500">{stats.total} guests invited</p>
        </div>
        <div className="flex gap-3">
          <Link to="/seating" className="btn-secondary flex items-center gap-2">
            <span className="text-xl">🪑</span>
            Seating Chart
          </Link>
          <button onClick={() => setShowQRModal(true)} className="btn-secondary">RSVP QR Code</button>
          <button onClick={() => setShowImportModal(true)} className="btn-secondary">Import CSV</button>
          <button onClick={exportCSV} className="btn-secondary">Export</button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Add Guest</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-serif text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Invited</p>
        </div>
        <div className="card text-center bg-green-50">
          <p className="text-3xl font-serif text-green-600">{stats.attending}</p>
          <p className="text-sm text-gray-500">Attending</p>
        </div>
        <div className="card text-center bg-red-50">
          <p className="text-3xl font-serif text-red-600">{stats.declined}</p>
          <p className="text-sm text-gray-500">Declined</p>
        </div>
        <div className="card text-center bg-yellow-50">
          <p className="text-3xl font-serif text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-500">Pending</p>
        </div>
        <div className="card text-center bg-purple-50">
          <p className="text-3xl font-serif text-purple-600">{stats.attending + stats.withPlusOne}</p>
          <p className="text-sm text-gray-500">Total Attending</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder="Search guests..."
          className="input-field w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select className="input-field w-auto" value={rsvpFilter} onChange={(e) => setRsvpFilter(e.target.value as RSVPStatus | 'all')}>
          <option value="all">All RSVP Status</option>
          <option value="attending">Attending</option>
          <option value="declined">Declined</option>
          <option value="pending">Pending</option>
          <option value="maybe">Maybe</option>
        </select>
        <select className="input-field w-auto" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}>
          <option value="all">All Groups</option>
          {uniqueGroups.map(group => (
            <option key={group} value={group}>{group}</option>
          ))}
        </select>
      </div>

      {/* Guest List */}
      <div className="card overflow-hidden">
        {filteredGuests.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No guests found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Contact</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">RSVP</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Meal</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Table</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Group</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{guest.firstName} {guest.lastName}</p>
                      {guest.plusOne && (
                        <p className="text-sm text-gray-500">+1: {guest.plusOneName || 'TBD'}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <p>{guest.email}</p>
                      <p>{guest.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        className={`text-sm px-2 py-1 rounded ${guest.rsvpStatus === 'attending' ? 'bg-green-100 text-green-800' :
                          guest.rsvpStatus === 'declined' ? 'bg-red-100 text-red-800' :
                            guest.rsvpStatus === 'maybe' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}
                        value={guest.rsvpStatus}
                        onChange={(e) => updateGuest(guest.id, { rsvpStatus: e.target.value as RSVPStatus })}
                      >
                        <option value="pending">Pending</option>
                        <option value="attending">Attending</option>
                        <option value="declined">Declined</option>
                        <option value="maybe">Maybe</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{guest.mealChoice || '-'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {tables.find(t => t.id === guest.tableAssignment)?.name || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{guest.group || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(guest)} className="text-primary-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => deleteGuest(guest.id)} className="text-red-600 hover:underline">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">{editingGuest ? 'Edit Guest' : 'Add Guest'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" required className="input-field" value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" required className="input-field" value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <input type="text" className="input-field" placeholder="e.g., Bride's Family" value={formData.group}
                    onChange={(e) => setFormData({ ...formData, group: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meal Choice</label>
                  <select className="input-field" value={formData.mealChoice}
                    onChange={(e) => setFormData({ ...formData, mealChoice: e.target.value })}>
                    <option value="">Select meal</option>
                    {mealOptions.map(meal => <option key={meal} value={meal}>{meal}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {dietaryOptions.map(diet => (
                    <label key={diet} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={formData.dietaryRestrictions.includes(diet)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, dietaryRestrictions: [...formData.dietaryRestrictions, diet] })
                          } else {
                            setFormData({ ...formData, dietaryRestrictions: formData.dietaryRestrictions.filter(d => d !== diet) })
                          }
                        }} />
                      {diet}
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.plusOne}
                    onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })} />
                  <span className="text-sm font-medium text-gray-700">Plus One</span>
                </label>
                {formData.plusOne && (
                  <input type="text" className="input-field flex-1" placeholder="Plus one name"
                    value={formData.plusOneName}
                    onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })} />
                )}
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingGuest ? 'Save Changes' : 'Add Guest'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">Import Guests from CSV</h2>
            <p className="text-sm text-gray-600 mb-4">
              Upload a CSV file with columns: First Name, Last Name, Email, Phone, Group
            </p>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="input-field" />
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => setShowImportModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 text-center">
            <h2 className="text-xl font-serif text-gray-800 mb-4">RSVP QR Code</h2>
            <p className="text-sm text-gray-600 mb-4">Guests can scan this code to RSVP online</p>
            <div className="flex justify-center mb-4">
              <QRCodeSVG value={rsvpUrl} size={200} />
            </div>
            <p className="text-sm text-gray-500 mb-4">{rsvpUrl}</p>
            <button onClick={() => setShowQRModal(false)} className="btn-primary">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
