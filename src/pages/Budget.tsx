import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import {
  Plus, Edit2, CheckCircle,
  DollarSign, Upload, ArrowUpRight, Crown, FileText, AlertTriangle, Lock
} from 'lucide-react'
import type { BudgetItem } from '../types'

// --- Constants ---

const PREFERRED_CATEGORIES = [
  { name: 'Venue', defaultAlloc: 8000, icon: '🏰' },
  { name: 'Catering', defaultAlloc: 6000, icon: '🍽️' },
  { name: 'Photography', defaultAlloc: 3500, icon: '📸' },
  { name: 'Videography', defaultAlloc: 2500, icon: '🎥' },
  { name: 'Flowers', defaultAlloc: 2000, icon: '🌸' }, // Mapped from Florist
  { name: 'Music/DJ', defaultAlloc: 1500, icon: '🎵' }, // Mapped from DJ/Band
  { name: 'Attire', defaultAlloc: 2500, icon: '👗' }, // Dress & Attire
  { name: 'Invitations', defaultAlloc: 500, icon: '💌' },
  { name: 'Decor', defaultAlloc: 1000, icon: '✨' }, // Favors & Decor
  { name: 'Transportation', defaultAlloc: 0, icon: '🚗' }, // Extra
  { name: 'Hair & Makeup', defaultAlloc: 0, icon: '💄' }, // Extra
  { name: 'Other', defaultAlloc: 2500, icon: '🧩' } // Miscellaneous
]

const CATEGORY_COLORS: Record<string, string> = {
  'Venue': '#c97f66',
  'Catering': '#9dc183',
  'Photography': '#f7e7ce',
  'Videography': '#d4a5a5',
  'Music/DJ': '#d4af37',
  'Flowers': '#f8e1e4',
  'Attire': '#b5644d',
  'Invitations': '#97503e',
  'Decor': '#f3d9d0',
  'Other': '#999999',
  'Transportation': '#7d4336',
  'Hair & Makeup': '#dba08b',
  'Favors': '#683a30',
  'Officiant': '#f9ede8',
  'Cake': '#e9bfb0'
}

export default function Budget() {
  const { wedding, budgetItems, addBudgetItem, updateBudgetItem, setWedding, setBudgetItems } = useWeddingStore()

  // UI State
  const [showAddModal, setShowAddModal] = useState(false)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    category: 'Venue',
    vendor: '',
    estimatedCost: 0,
    actualCost: 0,
    paid: 0,
    dueDate: '',
    notes: '',
    paymentStatus: 'pending' as 'pending' | 'deposit' | 'paid',
    receiptUrl: ''
  })

  // --- Calculations ---

  const totalBudget = wedding.totalBudget
  const totalSpent = budgetItems.reduce((sum, item) => sum + item.actualCost, 0)
  const totalRemaining = totalBudget - totalSpent
  const percentUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const isOverBudget = totalSpent > totalBudget

  // Group items by category for cards
  const categoryStats = useMemo(() => {
    // Start with all preferred categories
    const stats: Record<string, { allocated: number, spent: number, items: BudgetItem[], icon: string }> = {}

    // Initialize defaults
    PREFERRED_CATEGORIES.forEach(cat => {
      stats[cat.name] = { allocated: 0, spent: 0, items: [], icon: cat.icon }
    })

    // Aggregate items
    budgetItems.forEach(item => {
      if (!stats[item.category]) {
        // Handle custom categories not in default list
        stats[item.category] = { allocated: 0, spent: 0, items: [], icon: '📦' }
      }
      stats[item.category].allocated += item.estimatedCost
      stats[item.category].spent += item.actualCost
      stats[item.category].items.push(item)
    })

    return Object.entries(stats).map(([name, data]) => ({
      name,
      ...data,
      remaining: data.allocated - data.spent,
      progress: data.allocated > 0 ? (data.spent / data.allocated) * 100 : 0,
      isOver: data.spent > data.allocated
    })).sort((a, b) => {
      // Sort by preferred order, then others
      const idxA = PREFERRED_CATEGORIES.findIndex(c => c.name === a.name)
      const idxB = PREFERRED_CATEGORIES.findIndex(c => c.name === b.name)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      return 0
    })
  }, [budgetItems])

  // Pie Chart Data
  const pieData = categoryStats
    .filter(cat => cat.spent > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.spent,
      color: CATEGORY_COLORS[cat.name] || '#999'
    }))

  // --- Handlers ---

  const handleResetToDefault = () => {
    if (window.confirm('This will replace your current budget items with the recommended layout. Existing items will be removed. Continue?')) {
      const newItems = PREFERRED_CATEGORIES.map(cat => ({
        // Using a "General Allocation" item for the category target
        id: crypto.randomUUID(),
        category: cat.name,
        vendor: `${cat.name} Allocation`,
        estimatedCost: cat.defaultAlloc,
        actualCost: 0,
        paid: 0,
        dueDate: '',
        notes: 'Initial Budget Allocation',
        paymentStatus: 'pending' as const
      })).filter(item => item.estimatedCost > 0)

      setBudgetItems(newItems)
      setWedding({ totalBudget: 30000 }) // Set default total
    }
  }

  const handleOpenAddModal = (category?: string) => {
    setEditingItem(null)
    setFormData({
      category: category || 'Venue',
      vendor: '',
      estimatedCost: 0,
      actualCost: 0,
      paid: 0,
      dueDate: '',
      notes: '',
      paymentStatus: 'pending',
      receiptUrl: ''
    })
    setShowAddModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateBudgetItem(editingItem.id, formData)
    } else {
      addBudgetItem(formData)
    }
    setShowAddModal(false)
  }

  // --- Render ---

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Budget</span>
          </div>
          <h1 className="text-3xl font-serif text-gray-800">Budget Tracker</h1>
          <p className="text-gray-500">Manage your wedding expenses effectively</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleResetToDefault}
            className="btn-secondary text-sm flex items-center gap-2"
          >
            <FileText size={16} /> Load Template
          </button>
          <Link to="/budget/detailed" className="btn-secondary text-sm flex items-center gap-2">
            <FileText size={16} /> View Full Table
          </Link>
          <button
            onClick={() => setShowPremiumModal(true)}
            className="btn-secondary text-sm flex items-center gap-2 text-primary-600 border-primary-200"
          >
            <Crown size={16} /> Premium Categories
          </button>
        </div>
      </div>

      {/* Budget Overview Cards */}
      <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-50" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Total Budget */}
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Budget</p>
            <div className="flex items-center gap-2">
              <span className="text-4xl font-serif text-gray-800">${totalBudget.toLocaleString()}</span>
              <button className="p-1 hover:bg-gray-100 rounded-full text-gray-400">
                <Edit2 size={14} />
              </button>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isOverBudget ? 'bg-red-500' : 'bg-primary-500'}`}
                style={{ width: `${Math.min(percentUsed, 100)}%` }}
              />
            </div>
            {totalBudget > 0 && (
              <p className={`text-sm font-medium mt-2 ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalRemaining >= 0 ? (
                  <>🎉 You're {Math.round((totalRemaining / totalBudget) * 100)}% under budget!</>
                ) : (
                  <>⚠️ You're ${(totalSpent - totalBudget).toLocaleString()} over budget!</>
                )}
              </p>
            )}
          </div>

          {/* Spent */}
          <div className="md:border-l md:pl-8 border-gray-100">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Spent</p>
            <p className={`text-3xl font-serif ${isOverBudget ? 'text-red-600' : 'text-primary-600'}`}>
              ${totalSpent.toLocaleString()}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Across {budgetItems.length} expenses
            </p>
          </div>

          {/* Remaining */}
          <div className="md:border-l md:pl-8 border-gray-100">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Remaining</p>
            <p className="text-3xl font-serif text-gray-800">
              ${totalRemaining.toLocaleString()}
            </p>
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <CheckCircle size={14} /> On Track
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif text-gray-800">Budget Categories</h2>
            <button
              onClick={() => setShowPremiumModal(true)}
              className="text-sm text-primary-600 font-medium hover:underline flex items-center gap-1"
            >
              <Plus size={16} /> Add Custom Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categoryStats.map((cat) => (
              <div key={cat.name} className="group bg-white rounded-xl p-5 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-xl">
                      {cat.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{cat.name}</h3>
                      <p className="text-xs text-gray-500">${cat.allocated.toLocaleString()} allocated</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold block ${cat.isOver ? 'text-red-600' : 'text-gray-700'}`}>
                      ${cat.remaining.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Left</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-gray-100 rounded-full mb-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cat.isOver ? 'bg-red-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(cat.progress, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-500">Spent: <span className="text-gray-800 font-medium">${cat.spent.toLocaleString()}</span></span>
                  <button
                    onClick={() => handleOpenAddModal(cat.name)}
                    className="text-primary-600 hover:bg-primary-50 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    + Add Expense
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Charts & Quick Actions */}
        <div className="space-y-6">

          {/* Visual Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Allocation Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number) => `$${val.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overspend Warnings */}
          {categoryStats.filter(c => c.isOver).length > 0 && (
            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="text-red-500" size={20} />
                <h3 className="text-red-800 font-medium">Overspend Alerts</h3>
              </div>
              <div className="space-y-3">
                {categoryStats.filter(c => c.isOver).map(cat => (
                  <div key={cat.name} className="bg-white p-3 rounded-lg border border-red-100 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">{cat.name}</span>
                      <span className="text-red-600 font-bold">-${Math.abs(cat.remaining).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-red-400">
                      Exceeded ${cat.allocated.toLocaleString()} budget
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips Card */}
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Lock size={20} />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">Unlock Premium</h3>
                <p className="text-indigo-100 text-sm mb-4">
                  Get unlimited custom categories, export to Excel, and AI budget insights.
                </p>
                <button
                  onClick={() => setShowPremiumModal(true)}
                  className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors w-full"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-serif text-gray-800">
                {editingItem ? 'Edit Expense' : 'Add New Expense'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category</label>
                  <select
                    className="input-field w-full"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    {PREFERRED_CATEGORIES.map(c => (
                      <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                    ))}
                    <option value="Other">🧩 Other</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Vendor Name</label>
                  <input
                    type="text"
                    className="input-field w-full"
                    placeholder="e.g. The Plaza Hotel"
                    value={formData.vendor}
                    onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Estimated Cost</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="number"
                      className="input-field w-full pl-8"
                      value={formData.estimatedCost || ''}
                      onChange={e => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Actual Amount</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="number"
                      className="input-field w-full pl-8"
                      value={formData.actualCost || ''}
                      onChange={e => setFormData({ ...formData, actualCost: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Date</label>
                  <input
                    type="date"
                    className="input-field w-full"
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Status</label>
                  <select
                    className="input-field w-full"
                    value={formData.paymentStatus}
                    onChange={e => setFormData({ ...formData, paymentStatus: e.target.value as any })}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="deposit">💳 Deposit Paid</option>
                    <option value="paid">✅ Fully Paid</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Receipt / Invoice</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Upload className="mx-auto text-gray-400 mb-2" size={20} />
                    <p className="text-sm text-gray-500">Click to upload receipt</p>
                    <p className="text-xs text-gray-400">(Supports PDF, JPG, PNG)</p>
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notes</label>
                  <textarea
                    className="input-field w-full"
                    rows={2}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingItem ? 'Save Changes' : 'Add Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center text-white">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                <Crown size={32} className="text-yellow-400" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Upgrade to Premium</h2>
              <p className="text-gray-300 text-sm">Unlock unlimited categories & insights</p>
            </div>
            <div className="p-8 space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle size={18} className="text-green-500" />
                  Unlimited Custom Categories
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle size={18} className="text-green-500" />
                  PDF & Excel Exports
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle size={18} className="text-green-500" />
                  AI Contract Scanning
                </li>
                <li className="flex items-center gap-3 text-gray-700">
                  <CheckCircle size={18} className="text-green-500" />
                  Vendor Recommendations
                </li>
              </ul>

              <button className="btn-primary w-full py-3 flex items-center justify-center gap-2 group">
                Get Premium - $4.99/mo <ArrowUpRight size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
              <button
                onClick={() => setShowPremiumModal(false)}
                className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
