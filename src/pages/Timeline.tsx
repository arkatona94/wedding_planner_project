import { useState } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { format } from 'date-fns'
import type { TimelineEvent } from '../types'

const eventColors = [
  { value: '#c97f66', label: 'Rose' },
  { value: '#9dc183', label: 'Sage' },
  { value: '#f7e7ce', label: 'Champagne' },
  { value: '#d4a5a5', label: 'Dusty Rose' },
  { value: '#d4af37', label: 'Gold' },
  { value: '#6b7280', label: 'Gray' },
]

const defaultEvents = [
  { title: 'Hair & Makeup', startTime: '08:00', endTime: '11:00', color: '#d4a5a5' },
  { title: 'Photography - Getting Ready', startTime: '10:00', endTime: '12:00', color: '#c97f66' },
  { title: 'Ceremony', startTime: '14:00', endTime: '15:00', color: '#d4af37' },
  { title: 'Cocktail Hour', startTime: '15:00', endTime: '16:00', color: '#9dc183' },
  { title: 'Reception', startTime: '16:00', endTime: '17:00', color: '#f7e7ce' },
  { title: 'Dinner', startTime: '17:00', endTime: '19:00', color: '#c97f66' },
  { title: 'First Dance', startTime: '19:00', endTime: '19:15', color: '#d4af37' },
  { title: 'Dancing', startTime: '19:15', endTime: '22:00', color: '#9dc183' },
  { title: 'Send Off', startTime: '22:00', endTime: '22:30', color: '#d4a5a5' },
]

export default function Timeline() {
  const { wedding, timelineEvents, addTimelineEvent, updateTimelineEvent, deleteTimelineEvent, vendors } = useWeddingStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    vendors: [] as string[],
    color: '#c97f66'
  })

  const sortedEvents = [...timelineEvents].sort((a, b) => a.startTime.localeCompare(b.startTime))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingEvent) {
      updateTimelineEvent(editingEvent.id, formData)
    } else {
      addTimelineEvent(formData)
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      title: '', startTime: '', endTime: '', location: '',
      description: '', vendors: [], color: '#c97f66'
    })
    setShowAddModal(false)
    setEditingEvent(null)
  }

  const startEdit = (event: TimelineEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      description: event.description,
      vendors: event.vendors,
      color: event.color
    })
    setShowAddModal(true)
  }

  const applyTemplate = () => {
    defaultEvents.forEach(event => {
      addTimelineEvent({
        ...event,
        location: wedding.venue || '',
        description: '',
        vendors: []
      })
    })
    setShowTemplateModal(false)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const calculateDuration = (start: string, end: string) => {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    const duration = endMinutes - startMinutes
    const hours = Math.floor(duration / 60)
    const mins = duration % 60
    if (hours === 0) return `${mins}m`
    if (mins === 0) return `${hours}h`
    return `${hours}h ${mins}m`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Wedding Day Timeline</h1>
          {wedding.weddingDate && (
            <p className="text-gray-500">{format(new Date(wedding.weddingDate), 'EEEE, MMMM d, yyyy')}</p>
          )}
        </div>
        <div className="flex gap-3">
          {timelineEvents.length === 0 && (
            <button onClick={() => setShowTemplateModal(true)} className="btn-secondary">
              Use Template
            </button>
          )}
          <button onClick={() => setShowAddModal(true)} className="btn-primary">+ Add Event</button>
        </div>
      </div>

      {/* Timeline */}
      {sortedEvents.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">No events scheduled yet</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => setShowTemplateModal(true)} className="btn-secondary">
              Start with Template
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              Add Custom Event
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-4">
            {sortedEvents.map((event) => (
              <div key={event.id} className="relative flex gap-6">
                {/* Time marker */}
                <div className="w-16 text-right flex-shrink-0 pt-1">
                  <p className="text-sm font-medium text-gray-600">{formatTime(event.startTime)}</p>
                </div>

                {/* Dot */}
                <div
                  className="w-4 h-4 rounded-full border-4 border-white flex-shrink-0 mt-1.5 z-10"
                  style={{ backgroundColor: event.color }}
                />

                {/* Event Card */}
                <div
                  className="flex-1 card"
                  style={{ borderLeft: `4px solid ${event.color}` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-500">
                        {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        <span className="text-gray-400 ml-2">
                          ({calculateDuration(event.startTime, event.endTime)})
                        </span>
                      </p>
                      {event.location && (
                        <p className="text-sm text-gray-500 mt-1">@ {event.location}</p>
                      )}
                      {event.description && (
                        <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                      )}
                      {event.vendors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.vendors.map(vendorId => {
                            const vendor = vendors.find(v => v.id === vendorId)
                            return vendor ? (
                              <span key={vendorId} className="badge bg-gray-100 text-gray-600">
                                {vendor.name}
                              </span>
                            ) : null
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(event)} className="text-gray-400 hover:text-primary-600 text-sm">
                        Edit
                      </button>
                      <button onClick={() => deleteTimelineEvent(event.id)} className="text-gray-400 hover:text-red-600 text-sm">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">
              {editingEvent ? 'Edit Event' : 'Add Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
                <input type="text" required className="input-field" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="time" required className="input-field" value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="time" required className="input-field" value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input type="text" className="input-field" value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={2} value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-2">
                  {eventColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, color: color.value })}
                      className={`w-8 h-8 rounded-full border-2 ${formData.color === color.value ? 'border-gray-800' : 'border-transparent'
                        }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
              {vendors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Vendors</label>
                  <div className="flex flex-wrap gap-2">
                    {vendors.filter(v => v.contracted).map((vendor) => (
                      <label key={vendor.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.vendors.includes(vendor.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({ ...formData, vendors: [...formData.vendors, vendor.id] })
                            } else {
                              setFormData({ ...formData, vendors: formData.vendors.filter(v => v !== vendor.id) })
                            }
                          }}
                        />
                        {vendor.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingEvent ? 'Save Changes' : 'Add Event'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">Use Timeline Template</h2>
            <p className="text-gray-600 mb-4">
              This will add a standard wedding day timeline with the following events:
            </p>
            <ul className="space-y-2 mb-6">
              {defaultEvents.map((event, index) => (
                <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: event.color }} />
                  {event.title} ({formatTime(event.startTime)} - {formatTime(event.endTime)})
                </li>
              ))}
            </ul>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowTemplateModal(false)} className="btn-secondary">Cancel</button>
              <button onClick={applyTemplate} className="btn-primary">Apply Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
