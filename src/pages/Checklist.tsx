import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { format } from 'date-fns'
import type { ChecklistCategory, ChecklistItem } from '../types'
import { exportChecklistPDF } from '../utils/exports'

const categories: { value: ChecklistCategory; label: string }[] = [
  { value: 'venue', label: 'Venue' },
  { value: 'catering', label: 'Catering' },
  { value: 'attire', label: 'Attire' },
  { value: 'photography', label: 'Photography' },
  { value: 'music', label: 'Music' },
  { value: 'flowers', label: 'Flowers' },
  { value: 'invitations', label: 'Invitations' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'accommodations', label: 'Accommodations' },
  { value: 'legal', label: 'Legal' },
  { value: 'other', label: 'Other' },
]

export default function Checklist() {
  const { checklist, addChecklistItem, updateChecklistItem, deleteChecklistItem, toggleChecklistItem, wedding } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ChecklistCategory | 'all'>('all')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as ChecklistCategory,
    dueDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: ''
  })

  const filteredChecklist = checklist.filter(item => {
    if (filter === 'pending' && item.completed) return false
    if (filter === 'completed' && !item.completed) return false
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false
    return true
  })

  const completedCount = checklist.filter(item => item.completed).length
  const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingItem) {
      updateChecklistItem(editingItem.id, formData)
    } else {
      addChecklistItem({ ...formData, completed: false })
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'other',
      dueDate: '',
      priority: 'medium',
      notes: ''
    })
    setShowAddModal(false)
    setEditingItem(null)
  }

  const startEdit = (item: ChecklistItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      dueDate: item.dueDate,
      priority: item.priority,
      notes: item.notes
    })
    setShowAddModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Checklist</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800">Wedding Checklist</h1>
          <p className="text-gray-500">{completedCount} of {checklist.length} tasks completed</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const coupleNames = wedding.partner1Name && wedding.partner2Name
                ? `${wedding.partner1Name} & ${wedding.partner2Name}`
                : 'Wedding'
              const weddingDate = wedding.weddingDate
                ? format(new Date(wedding.weddingDate), 'MMMM d, yyyy')
                : ''
              exportChecklistPDF(checklist, coupleNames, weddingDate)
            }}
            className="btn-secondary"
          >
            Export PDF
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary">
            + Add Task
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Overall Progress</span>
          <span className="text-sm font-medium text-primary-600">{progress}%</span>
        </div>
        <div className="progress-bar h-3">
          <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as ChecklistCategory | 'all')}
          className="input-field w-auto"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {filteredChecklist.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No tasks found</p>
          </div>
        ) : (
          filteredChecklist.map((item) => (
            <div
              key={item.id}
              className={`card flex items-start gap-4 ${item.completed ? 'opacity-60' : ''}`}
            >
              <button
                onClick={() => toggleChecklistItem(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-colors ${item.completed
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-gray-300 hover:border-primary-400'
                  }`}
              >
                {item.completed && '✓'}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className={`font-medium ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {item.title}
                  </h3>
                  <span className={`badge ${item.priority === 'high' ? 'badge-danger' :
                      item.priority === 'medium' ? 'badge-warning' : 'badge-success'
                    }`}>
                    {item.priority}
                  </span>
                  <span className="badge bg-gray-100 text-gray-600">
                    {categories.find(c => c.value === item.category)?.label}
                  </span>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
                {item.dueDate && (
                  <p className="text-sm text-gray-400 mt-1">
                    Due: {format(new Date(item.dueDate), 'MMM d, yyyy')}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(item)}
                  className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteChecklistItem(item.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">
              {editingItem ? 'Edit Task' : 'Add New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="input-field"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="input-field"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ChecklistCategory })}
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    className="input-field"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
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
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
