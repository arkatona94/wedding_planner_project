import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { format } from 'date-fns'
import type { BudgetItem } from '../types'
import { exportBudgetPDF } from '../utils/exports'
import { generateSmartBudget, BUDGET_ALLOCATIONS } from '../utils/budgetCalculator'
import { generateVendorsForLocation, hasRealVendorData } from '../utils/vendorGenerator'

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

const budgetCategories = [
  'Venue', 'Catering', 'Photography', 'Videography', 'Music/DJ',
  'Flowers', 'Attire', 'Cake', 'Invitations', 'Transportation',
  'Hair & Makeup', 'Decor', 'Favors', 'Officiant', 'Other'
]

const categoryToVendorKey: Record<string, string> = {
  'Venue': 'venue',
  'Catering': 'catering',
  'Photography': 'photography',
  'Videography': 'videography',
  'Music/DJ': 'music',
  'Flowers': 'florist',
  'Cake': 'cake',
  'Transportation': 'transportation',
  'Hair & Makeup': 'hair-makeup',
  'Decor': 'rentals',
  'Officiant': 'officiant'
}

const vendorDataMap: Record<string, any> = {
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

// Location-aware vendor list function - uses generated data for user's location
const getVendorList = (budgetCategory: string, userState?: string, userCity?: string) => {
  const vendorKey = categoryToVendorKey[budgetCategory]
  if (!vendorKey) return []

  // If user has location set and it's different from our real data (Cincinnati/OH)
  // generate location-appropriate vendors
  if (userState && !hasRealVendorData(userState, userCity)) {
    return generateVendorsForLocation(vendorKey, userCity || 'Downtown', userState, 5)
  }

  // Fall back to static data for Cincinnati/OH area
  const data = vendorDataMap[vendorKey]
  if (!data) return []
  return data.results || data.all_venues || []
}

const categoryColors: Record<string, string> = {
  'Venue': '#c97f66', 'Catering': '#9dc183', 'Photography': '#f7e7ce',
  'Videography': '#d4a5a5', 'Music/DJ': '#d4af37', 'Flowers': '#f8e1e4',
  'Attire': '#b5644d', 'Cake': '#e9bfb0', 'Invitations': '#97503e',
  'Transportation': '#7d4336', 'Hair & Makeup': '#dba08b', 'Decor': '#f3d9d0',
  'Favors': '#683a30', 'Officiant': '#f9ede8', 'Other': '#999'
}

export default function Budget() {
  const { wedding, budgetItems, addBudgetItem, updateBudgetItem, deleteBudgetItem, setWedding, recalculateBudget, user } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)
  const [syncSuccess, setSyncSuccess] = useState(false)
  const [showSmartBudgetModal, setShowSmartBudgetModal] = useState(false)
  const [smartBudgetPreview, setSmartBudgetPreview] = useState<Omit<BudgetItem, 'id'>[]>([])

  const [formData, setFormData] = useState({
    category: 'Venue',
    vendor: '',
    estimatedCost: 0,
    actualCost: 0,
    paid: 0,
    dueDate: '',
    notes: ''
  })

  const totalBudget = wedding.totalBudget
  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0)
  const totalActual = budgetItems.reduce((sum, item) => sum + item.actualCost, 0)
  const totalPaid = budgetItems.reduce((sum, item) => sum + item.paid, 0)
  const remaining = totalBudget - totalActual
  const unpaid = totalActual - totalPaid

  const budgetByCategory = budgetCategories.map(category => {
    const items = budgetItems.filter(item => item.category === category)
    const total = items.reduce((sum, item) => sum + item.actualCost, 0)
    return { name: category, value: total, color: categoryColors[category] }
  }).filter(item => item.value > 0)

  const isOverBudget = totalActual > totalBudget
  const budgetWarning = totalActual > totalBudget * 0.9

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateBudgetItem(editingItem.id, formData)
    } else {
      addBudgetItem(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      category: 'Venue',
      vendor: '',
      estimatedCost: 0,
      actualCost: 0,
      paid: 0,
      dueDate: '',
      notes: ''
    })
    setShowAddModal(false)
    setEditingItem(null)
  }

  const startEdit = (item: BudgetItem) => {
    setEditingItem(item)
    setFormData({
      category: item.category,
      vendor: item.vendor,
      estimatedCost: item.estimatedCost,
      actualCost: item.actualCost,
      paid: item.paid,
      dueDate: item.dueDate,
      notes: item.notes
    })
    setShowAddModal(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Budget</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800">Budget Tracker</h1>
          <p className="text-gray-500">Track your wedding expenses</p>
        </div>
        <div className="flex gap-3">
          <Link to="/budget/detailed" className="btn-secondary flex items-center gap-2">
            📊 View Full Table
          </Link>
          <button
            onClick={() => {
              recalculateBudget()
              setSyncSuccess(true)
              setTimeout(() => setSyncSuccess(false), 3000)
            }}
            className="btn-secondary flex items-center gap-2"
            title="Ensures all vendors have budget items and updates costs"
          >
            {syncSuccess ? '✅ Synced' : '🔄 Sync Vendors'}
          </button>
          <button
            onClick={() => {
              const coupleNames = wedding.partner1Name && wedding.partner2Name
                ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                : 'Wedding'
              const weddingDate = wedding.weddingDate
                ? format(new Date(wedding.weddingDate), 'MMMM d, yyyy')
                : ''
              exportBudgetPDF(budgetItems, wedding.totalBudget, coupleNames, weddingDate)
            }}
            className="btn-secondary"
          >
            Export PDF
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >+ Add Expense</button>
          <button
            onClick={() => {
              const preview = generateSmartBudget(totalBudget, user?.state, user?.city)
              setSmartBudgetPreview(preview)
              setShowSmartBudgetModal(true)
            }}
            className="btn-secondary flex items-center gap-2"
            title={user?.state
              ? `Budget adjusted for ${user.city ? user.city + ', ' : ''}${user.state} pricing`
              : 'Auto-generate budget breakdown based on industry standards'
            }
          >
            ✨ Smart Breakdown{user?.state ? ` (${user.state})` : ''}
          </button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Budget</p>
          <p className="text-2xl font-serif text-gray-800">${totalBudget.toLocaleString()}</p>
          <input
            type="number"
            className="input-field mt-2 text-sm"
            value={totalBudget}
            onChange={(e) => setWedding({ totalBudget: Number(e.target.value) })}
          />
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Estimated</p>
          <p className="text-2xl font-serif text-gray-800">${totalEstimated.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Actual Spent</p>
          <p className={`text-2xl font-serif ${isOverBudget ? 'text-red-600' : 'text-gray-800'}`}>
            ${totalActual.toLocaleString()}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-2xl font-serif text-green-600">${totalPaid.toLocaleString()}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Remaining</p>
          <p className={`text-2xl font-serif ${remaining < 0 ? 'text-red-600' : 'text-gray-800'}`}>
            ${remaining.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Budget Warning */}
      {budgetWarning && (
        <div className={`p-4 rounded-lg ${isOverBudget ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'}`}>
          <p className="font-medium">
            {isOverBudget
              ? `You're over budget by $${Math.abs(remaining).toLocaleString()}!`
              : `Warning: You've used ${Math.round((totalActual / totalBudget) * 100)}% of your budget.`}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Spending by Category</h3>
          {budgetByCategory.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={budgetByCategory}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {budgetByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Add expenses to see breakdown</p>
          )}
        </div>

        {/* Payment Status */}
        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Payment Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Paid</span>
                <span className="text-green-600">${totalPaid.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill bg-green-500" style={{ width: `${totalActual > 0 ? (totalPaid / totalActual) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Unpaid</span>
                <span className="text-orange-600">${unpaid.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill bg-orange-500" style={{ width: `${totalActual > 0 ? (unpaid / totalActual) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Items Table */}
      <div className="card overflow-hidden">
        <h3 className="text-lg font-medium text-gray-800 mb-4">All Expenses</h3>
        {budgetItems.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expenses added yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Vendor</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Estimated</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actual</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Paid</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {budgetItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryColors[item.category] || '#999' }} />
                        {item.category}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{item.vendor || '-'}</td>
                    <td className="px-4 py-3 text-right">${item.estimatedCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${item.actualCost.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right text-green-600">${item.paid.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(item)} className="text-primary-600 hover:underline mr-3">Edit</button>
                      <button onClick={() => deleteBudgetItem(item.id)} className="text-red-600 hover:underline">Delete</button>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">{editingItem ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {budgetCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                  {getVendorList(formData.category).length > 0 ? (
                    <div className="space-y-2">
                      <select
                        className="input-field"
                        onChange={(e) => {
                          const list = getVendorList(formData.category)
                          const selectedVendor = list.find((v: any) => v.name === e.target.value)

                          if (selectedVendor) {
                            setFormData({
                              ...formData,
                              vendor: selectedVendor.name,
                              estimatedCost: (selectedVendor.price_range?.length || 0) * 1000,
                              notes: formData.notes || selectedVendor.website || ''
                            })
                          } else {
                            // Custom selection or clear
                            if (e.target.value === 'custom') {
                              setFormData({ ...formData, vendor: '' })
                            }
                          }
                        }}
                        value={getVendorList(formData.category).some((v: any) => v.name === formData.vendor) ? formData.vendor : 'custom'}
                      >
                        <option value="custom">Select a vendor...</option>
                        {getVendorList(formData.category).map((vendor: any, index: number) => (
                          <option key={index} value={vendor.name}>
                            {vendor.name} ({vendor.city}) - Est. ${(selectedVendor => (selectedVendor.price_range?.length || 0) * 1000)(vendor)}
                          </option>
                        ))}
                        <option value="custom">Enter Custom Name...</option>
                      </select>
                      {(!getVendorList(formData.category).some((v: any) => v.name === formData.vendor)) && (
                        <input
                          type="text"
                          placeholder="Enter vendor name"
                          className="input-field"
                          value={formData.vendor}
                          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      className="input-field"
                      value={formData.vendor}
                      onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                    />
                  )}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated ($)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.estimatedCost || ''}
                    onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Actual ($)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.actualCost || ''}
                    onChange={(e) => setFormData({ ...formData, actualCost: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Paid ($)</label>
                  <input
                    type="number"
                    className="input-field"
                    value={formData.paid || ''}
                    onChange={(e) => setFormData({ ...formData, paid: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingItem ? 'Save Changes' : 'Add Expense'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Smart Budget Modal */}
      {showSmartBudgetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif text-gray-800 mb-2">✨ Smart Budget Breakdown</h2>
            <p className="text-gray-500 mb-4">
              Based on your ${totalBudget.toLocaleString()} budget, here's an industry-standard allocation:
            </p>

            <div className="space-y-2 mb-6">
              {smartBudgetPreview.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categoryColors[item.category] || '#999' }}
                    />
                    <span className="font-medium text-gray-800">{item.category}</span>
                    <span className="text-xs text-gray-500">
                      ({Math.round((BUDGET_ALLOCATIONS[item.category] || 0) * 100)}%)
                    </span>
                  </div>
                  <span className="font-mono text-gray-700">
                    ${item.estimatedCost.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4 flex gap-3 justify-end">
              <button
                onClick={() => setShowSmartBudgetModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add all smart budget items
                  smartBudgetPreview.forEach(item => addBudgetItem(item))
                  setShowSmartBudgetModal(false)
                }}
                className="btn-primary"
              >
                Apply Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
