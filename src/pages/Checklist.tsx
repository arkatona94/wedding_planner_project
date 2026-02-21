import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { format, isPast, isToday, differenceInDays, parseISO, isValid } from 'date-fns'
import confetti from 'canvas-confetti'
import type { ChecklistCategory, ChecklistItem } from '../types'
import { exportChecklistPDF } from '../utils/exports'
import {
  CheckCircle,
  Clock,
  Calendar,
  Tag,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  User,
  MoreVertical,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const categories: { value: ChecklistCategory; label: string; color: string }[] = [
  { value: 'venue', label: 'Venue', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'catering', label: 'Catering', color: 'bg-orange-100 text-orange-800' },
  { value: 'attire', label: 'Attire', color: 'bg-pink-100 text-pink-800' },
  { value: 'photography', label: 'Photography', color: 'bg-blue-100 text-blue-800' },
  { value: 'music', label: 'Music', color: 'bg-purple-100 text-purple-800' },
  { value: 'flowers', label: 'Flowers', color: 'bg-rose-100 text-rose-800' },
  { value: 'invitations', label: 'Invitations', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'transportation', label: 'Transportation', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'accommodations', label: 'Accommodations', color: 'bg-teal-100 text-teal-800' },
  { value: 'legal', label: 'Legal', color: 'bg-slate-100 text-slate-800' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' },
]

export default function Checklist() {
  const { checklist, addChecklistItem, updateChecklistItem, deleteChecklistItem, toggleChecklistItem, wedding } = useWeddingStore()

  // State
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null)

  // Filter States
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'upcoming' | 'overdue'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ChecklistCategory | 'all'>('all')
  const [sortBy, setSortBy] = useState<'timeline' | 'category' | 'priority'>('timeline')
  const [searchQuery, setSearchQuery] = useState('')

  // Expanded states for notes
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({})

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other' as ChecklistCategory,
    dueDate: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    notes: '',
    assignedTo: 'us' as 'us' | 'partner1' | 'partner2'
  })

  // Calculations
  const completedCount = checklist.filter(item => item.completed).length
  const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : 0

  // Derived Data
  const filteredChecklist = useMemo(() => {
    let items = [...checklist]

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      items = items.filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
      )
    }

    // 2. Status Filter
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (statusFilter === 'completed') {
      items = items.filter(item => item.completed)
    } else if (statusFilter === 'upcoming') {
      items = items.filter(item => !item.completed && (!item.dueDate || new Date(item.dueDate) >= today))
    } else if (statusFilter === 'overdue') {
      items = items.filter(item => !item.completed && item.dueDate && new Date(item.dueDate) < today)
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      items = items.filter(item => item.category === categoryFilter)
    }

    // 4. Sort
    items.sort((a, b) => {
      if (sortBy === 'timeline') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 9999999999999
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 9999999999999
        if (dateA !== dateB) return dateA - dateB
        return a.title.localeCompare(b.title)
      } else if (sortBy === 'priority') {
        const priorityScore = { high: 3, medium: 2, low: 1 }
        return priorityScore[b.priority] - priorityScore[a.priority]
      } else if (sortBy === 'category') {
        return a.category.localeCompare(b.category)
      }
      return 0
    })

    return items
  }, [checklist, searchQuery, statusFilter, categoryFilter, sortBy])

  // Handlers
  const handleToggle = (id: string, currentlyCompleted: boolean) => {
    toggleChecklistItem(id)
    if (!currentlyCompleted) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#c97f66', '#d4af37', '#9dc183', '#f7e7ce']
      })
    }
  }

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
      notes: '',
      assignedTo: 'us'
    })
    setShowAddModal(false)
    setEditingItem(null)
  }

  const startEdit = (item: ChecklistItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category,
      dueDate: item.dueDate || '',
      priority: item.priority,
      notes: item.notes || '',
      assignedTo: 'us'
    })
    setShowAddModal(true)
  }

  const toggleNotes = (id: string) => {
    setExpandedNotes(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const getDueText = (dateStr?: string) => {
    if (!dateStr) return null
    const date = parseISO(dateStr)
    if (!isValid(date)) return null

    if (isPast(date) && !isToday(date)) {
      const days = differenceInDays(new Date(), date)
      return <span className="text-red-500 font-medium">Overdue by {days} days</span>
    }

    if (isToday(date)) {
      return <span className="text-amber-600 font-medium">Due Today</span>
    }

    const days = differenceInDays(date, new Date())
    if (days < 30) {
      return <span className="text-emerald-600">Due in {days} days</span>
    }

    const months = Math.round(days / 30)
    return <span className="text-gray-500">Due in ~{months} months</span>
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Checklist</span>
          </div>
          <h1 className="text-3xl font-serif text-gray-800">Wedding Checklist</h1>
          <p className="text-gray-500 mt-1">Keep track of every detail for your big day</p>
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
            className="btn-secondary flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Export PDF
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Custom Task
          </button>
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-2xl font-serif text-primary-600">{progress}%</span>
            <span className="text-gray-500 ml-2">Complete ({completedCount} of {checklist.length} tasks)</span>
          </div>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-4 z-10 space-y-4 md:space-y-0 md:flex md:gap-4 md:items-center">

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-2 w-full"
          />
        </div>

        {/* Status Filter */}
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['all', 'completed', 'upcoming', 'overdue'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${statusFilter === f
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort & Category */}
        <div className="flex gap-2">
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none input-field py-2 pl-3 pr-8 min-w-[120px] cursor-pointer"
            >
              <option value="timeline">Timeline</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
            </select>
            <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ChecklistCategory | 'all')}
              className="appearance-none input-field py-2 pl-3 pr-8 min-w-[140px] cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredChecklist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="text-gray-500">Try adjusting your filters or search query</p>
          </div>
        ) : (
          filteredChecklist.map((item) => {
            const categoryConfig = categories.find(c => c.value === item.category)
            const isExpanded = expandedNotes[item.id]

            return (
              <div
                key={item.id}
                className={`group bg-white rounded-xl border p-4 transition-all duration-200 hover:shadow-md ${item.completed ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200'
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${item.completed
                      ? 'bg-primary-500 border-primary-500 text-white scale-110'
                      : 'border-gray-300 hover:border-primary-400 text-transparent'
                      }`}
                  >
                    <CheckCircle className="w-4 h-4" fill="currentColor" />
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div onClick={() => toggleNotes(item.id)} className="cursor-pointer">
                        <h3 className={`font-medium text-lg leading-tight mb-1 ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'
                          }`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(item)}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary-600"
                          title="Edit"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                      {/* Due Date */}
                      <div className="flex items-center gap-1.5 min-w-[140px]">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {item.dueDate ? (
                          getDueText(item.dueDate)
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </div>

                      {/* Category Tag */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${categoryConfig?.color || 'bg-gray-100 text-gray-800'
                        }`}>
                        <Tag className="w-3 h-3" />
                        {categoryConfig?.label || item.category}
                      </span>

                      {/* Priority Tag */}
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${item.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                        item.priority === 'medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                        <AlertCircle className="w-3 h-3" />
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                      </span>

                      {/* Assignment */}
                      {item.assignedTo && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.assignedTo === 'us' ? 'All of Us' : item.assignedTo === 'partner1' ? 'Me' : 'Partner'}
                        </span>
                      )}
                    </div>

                    {/* Expandable Notes */}
                    {(item.notes || isExpanded) && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => toggleNotes(item.id)}
                          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors font-medium mb-1"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Hide Notes
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Show Notes {item.notes && '(1)'}
                            </>
                          )}
                        </button>

                        {isExpanded && (
                          <div className="bg-amber-50 rounded-lg p-3 text-sm text-gray-700 mt-1 animate-in fade-in slide-in-from-top-1">
                            {item.notes || <span className="text-gray-400 italic">No notes yet...</span>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl transform transition-all animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-gray-800">
                {editingItem ? 'Edit Task' : 'New Task'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Book the venue"
                  className="input-field w-full"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  className="input-field w-full"
                  rows={2}
                  placeholder="Add some details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="input-field w-full"
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
                    className="input-field w-full"
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
                  className="input-field w-full"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assignedTo: 'us' })}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.assignedTo === 'us' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'
                      }`}
                  >
                    All of Us
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assignedTo: 'partner1' })}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.assignedTo === 'partner1' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'
                      }`}
                  >
                    Me
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, assignedTo: 'partner2' })}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${formData.assignedTo === 'partner2' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500'
                      }`}
                  >
                    Partner
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  className="input-field w-full"
                  rows={3}
                  placeholder="Any extra thoughts or links..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 mt-2">
                {editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this task?')) {
                        // Fix: deleteChecklistItem expects void return, wrapped in event handler
                        deleteChecklistItem(editingItem.id);
                        resetForm();
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-medium mr-auto"
                  >
                    Delete Task
                  </button>
                )}

                <button type="button" onClick={resetForm} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingItem ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
