import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import type { Table } from '../types'

const tableShapes = [
  { value: 'round', label: 'Round', icon: '⭕' },
  { value: 'rectangular', label: 'Rectangular', icon: '▬' },
  { value: 'square', label: 'Square', icon: '⬜' },
]

export default function Seating() {
  const { guests, tables, addTable, updateTable, deleteTable, assignGuestToTable, removeGuestFromTable } = useWeddingStore()
  const [showAddTableModal, setShowAddTableModal] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null)

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    capacity: 8,
    shape: 'round' as 'round' | 'rectangular' | 'square',
    x: 100,
    y: 100,
    quantity: 1
  })

  const guestsToSeat = guests.filter(g => g.rsvpStatus !== 'declined')
  const unseatedGuests = guestsToSeat.filter(g => !g.tableAssignment)
  const seatedCount = guestsToSeat.filter(g => g.tableAssignment).length

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTable) {
      // Remove quantity from update
      const { quantity, ...updateData } = formData
      updateTable(editingTable.id, updateData)
    } else {
      // Handle multiple table creation
      const quantity = formData.quantity || 1
      const baseName = formData.name.trim()

      // Check if name ends with a number
      const match = baseName.match(/^(.*?)(\d+)$/)
      let namePrefix = baseName
      let startNum = 1

      if (match) {
        namePrefix = match[1]
        startNum = parseInt(match[2])
      } else {
        namePrefix = baseName + ' '
      }

      let currentSeqNum = startNum

      // Force numbered logic if there's a collision with baseName for Qty=1
      let forceNumbering = false
      if (quantity === 1 && !match && tables.some(t => t.name === baseName)) {
        forceNumbering = true
        namePrefix = baseName + ' '
        currentSeqNum = 1 // Start looking from 1 (e.g. Table 1, Table 2)
      }

      for (let i = 0; i < quantity; i++) {
        let finalName = ''

        while (true) {
          if (quantity > 1 || match || forceNumbering) {
            finalName = `${namePrefix}${currentSeqNum}`.trim()
          } else {
            // For Qty=1 non-numbered, unique name. 
            // We already checked collision above (forceNumbering), so this branch implies safe to use baseName or match failed?
            // Actually if forceNumbering is false, it means baseName is free.
            finalName = baseName
          }

          if (tables.some(t => t.name === finalName)) {
            // Collision detected (likely in loop iteration). Increment and retry.
            currentSeqNum++
            // If we weren't numbering, we MUST start numbering now?
            // But forceNumbering logic above handles the initial collision.
            // This branch handles collision with e.g. "Table 3" when we wanted "Table 3".
            forceNumbering = true
            // Ensure prefix is set if we just switched
            if (!namePrefix.endsWith(' ')) namePrefix = match ? namePrefix : baseName + ' '
          } else {
            // Unique found
            // If we used a number, ensure next iteration starts AFTER this one
            if (quantity > 1 || match || forceNumbering) {
              currentSeqNum++
            }
            break
          }
        }

        addTable({
          name: finalName,
          capacity: formData.capacity,
          shape: formData.shape,
          x: formData.x + (i * 20),
          y: formData.y + (i * 20),
          guests: []
        })
      }
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ name: '', capacity: 8, shape: 'round', x: 100, y: 100, quantity: 1 })
    setShowAddTableModal(false)
    setEditingTable(null)
  }

  const startEditTable = (table: Table) => {
    setEditingTable(table)
    setFormData({
      name: table.name,
      capacity: table.capacity,
      shape: table.shape,
      x: table.x,
      y: table.y,
      quantity: 1
    })
    setShowAddTableModal(true)
  }

  const handleDragStart = (guestId: string) => {
    setDraggedGuest(guestId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDropOnTable = (tableId: string) => {
    if (draggedGuest) {
      const table = tables.find(t => t.id === tableId)
      if (table && table.guests.length < table.capacity) {
        assignGuestToTable(draggedGuest, tableId)
      }
      setDraggedGuest(null)
    }
  }

  const handleDropOnUnseated = () => {
    if (draggedGuest) {
      removeGuestFromTable(draggedGuest)
      setDraggedGuest(null)
    }
  }

  const getTableGuests = (tableId: string) => {
    return guests.filter(g => g.tableAssignment === tableId)
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/guests" className="text-gray-500 hover:text-primary-600">
            ← Back to Guests
          </Link>
          <div>
            <h1 className="text-2xl font-serif text-gray-800">Seating Chart</h1>
            <p className="text-gray-500">
              {seatedCount} of {guestsToSeat.length} guests seated across {tables.length} tables
            </p>
          </div>
        </div>
        <button onClick={() => setShowAddTableModal(true)} className="btn-primary">+ Add Table</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-3xl font-serif text-gray-800">{tables.length}</p>
          <p className="text-sm text-gray-500">Tables</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-serif text-gray-800">{tables.reduce((sum, t) => sum + t.capacity, 0)}</p>
          <p className="text-sm text-gray-500">Total Capacity</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-serif text-green-600">{seatedCount}</p>
          <p className="text-sm text-gray-500">Seated</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-serif text-orange-600">{unseatedGuests.length}</p>
          <p className="text-sm text-gray-500">Unseated</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unseated Guests */}
        <div
          className="card h-fit lg:max-h-[600px] overflow-y-auto"
          onDragOver={handleDragOver}
          onDrop={handleDropOnUnseated}
        >
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Unseated Guests ({unseatedGuests.length})
          </h3>
          {unseatedGuests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">All guests are seated!</p>
          ) : (
            <div className="space-y-2">
              {unseatedGuests.map((guest) => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => handleDragStart(guest.id)}
                  className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
                >
                  <p className="font-medium text-gray-800">{guest.firstName} {guest.lastName}</p>
                  {guest.group && <p className="text-sm text-gray-500">{guest.group}</p>}
                  {guest.mealChoice && <p className="text-xs text-gray-400">{guest.mealChoice}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tables */}
        <div className="lg:col-span-2 space-y-4">
          {tables.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 mb-4">No tables created yet</p>
              <button onClick={() => setShowAddTableModal(true)} className="btn-primary">
                Create Your First Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tables.map((table) => {
                const tableGuests = getTableGuests(table.id)
                const isFull = tableGuests.length >= table.capacity
                const isSelected = selectedTable === table.id

                return (
                  <div
                    key={table.id}
                    className={`card cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary-400' : ''
                      } ${isFull ? 'bg-green-50' : ''}`}
                    onClick={() => setSelectedTable(isSelected ? null : table.id)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDropOnTable(table.id)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">
                          {tableShapes.find(s => s.value === table.shape)?.icon}
                        </span>
                        <div>
                          <h4 className="font-medium text-gray-800">{table.name}</h4>
                          <p className="text-sm text-gray-500">
                            {tableGuests.length}/{table.capacity} seats
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); startEditTable(table) }}
                          className="text-gray-400 hover:text-primary-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteTable(table.id) }}
                          className="text-gray-400 hover:text-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Capacity Bar */}
                    <div className="progress-bar mb-3">
                      <div
                        className={`progress-bar-fill ${isFull ? 'bg-green-500' : ''}`}
                        style={{ width: `${(tableGuests.length / table.capacity) * 100}%` }}
                      />
                    </div>

                    {/* Guest List */}
                    <div className="space-y-1">
                      {tableGuests.map((guest) => (
                        <div
                          key={guest.id}
                          draggable
                          onDragStart={() => handleDragStart(guest.id)}
                          className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 cursor-move hover:border-gray-200"
                        >
                          <span className="text-sm text-gray-700">
                            {guest.firstName} {guest.lastName}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeGuestFromTable(guest.id) }}
                            className="text-gray-400 hover:text-red-600 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      {tableGuests.length < table.capacity && (
                        <div className="p-2 border-2 border-dashed border-gray-200 rounded text-center text-sm text-gray-400">
                          Drop guest here
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">
              {editingTable ? 'Edit Table' : 'Add Table'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {editingTable || formData.quantity === 1 ? 'Table Name' : 'Base Table Name (e.g. "Table 1")'}
                </label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g., Table 1, Head Table"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {!editingTable && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    className="input-field"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                  />
                  <p className="text-xs text-gray-500 mt-1">Creating multiple tables will auto-number them (e.g., Table 1, Table 2...)</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity per Table</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  required
                  className="input-field"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shape</label>
                <div className="grid grid-cols-3 gap-2">
                  {tableShapes.map((shape) => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, shape: shape.value as typeof formData.shape })}
                      className={`p-3 rounded-lg border-2 flex flex-col items-center transition-colors ${formData.shape === shape.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <span className="text-2xl">{shape.icon}</span>
                      <span className="text-sm text-gray-600">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingTable ? 'Save Changes' : `Add ${formData.quantity > 1 ? formData.quantity + ' Tables' : 'Table'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
