import { Link } from 'react-router-dom'
import { useState, useRef, useMemo } from 'react'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import html2canvas from 'html2canvas'
import { useWeddingStore } from '../store/weddingStore'
import type { Table } from '../types'

const tableShapes = [
  { value: 'round', label: 'Round', icon: '⭕' },
  { value: 'rectangular', label: 'Rectangular', icon: '▬' },
  { value: 'square', label: 'Square', icon: '⬜' },
  { value: 'head', label: 'Head Table', icon: '👑' },
]

const STICKERS = [
  { type: 'bride-side', label: "Bride's Side", icon: '👰', width: 200, height: 60, color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { type: 'groom-side', label: "Groom's Side", icon: '🤵', width: 200, height: 60, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { type: 'table-round', label: 'Round Table', icon: '⭕', width: 100, height: 100, color: 'bg-white border-primary-200 text-primary-700' },
  { type: 'table-rect', label: 'Rectangle Table', icon: '▬', width: 150, height: 80, color: 'bg-white border-primary-200 text-primary-700' },
  { type: 'table-head', label: 'Head Table', icon: '👑', width: 300, height: 80, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { type: 'dj', label: 'DJ Booth', icon: '🎧', width: 80, height: 60, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { type: 'bar', label: 'Bar', icon: '🍹', width: 100, height: 50, color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { type: 'dance', label: 'Dance Floor', icon: '💃', width: 250, height: 250, color: 'bg-pink-50 border-pink-200 text-pink-700 opacity-50' },
  { type: 'gift', label: 'Gifts Table', icon: '🎁', width: 80, height: 50, color: 'bg-green-50 border-green-200 text-green-700' },
  { type: 'cake', label: 'Cake Stand', icon: '🎂', width: 60, height: 60, color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { type: 'photo', label: 'Photo Booth', icon: '📸', width: 100, height: 100, color: 'bg-blue-50 border-blue-200 text-blue-700' },
]

export default function Seating() {
  const {
    guests, tables, addTable, updateTable, deleteTable, assignGuestToTable, removeGuestFromTable,
    roomElements, addRoomElement, updateRoomElement, deleteRoomElement, resetFloorPlan
  } = useWeddingStore()

  const [showAddTableModal, setShowAddTableModal] = useState(false)
  const [editingTable, setEditingTable] = useState<Table | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const [draggedGuest, setDraggedGuest] = useState<string | null>(null)
  const [isDraggingTable, setIsDraggingTable] = useState<string | null>(null)
  const [draggedSticker, setDraggedSticker] = useState<typeof STICKERS[0] | null>(null)
  const [isDraggingElement, setIsDraggingElement] = useState<string | null>(null)
  const [activeTransform, setActiveTransform] = useState<{ id: string, type: 'resize' | 'rotate', startX: number, startY: number, startW: number, startH: number, startRot: number } | null>(null)
  const floorPlanRef = useRef<HTMLDivElement>(null)

  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    capacity: 8,
    shape: 'round' as 'round' | 'rectangular' | 'square' | 'head',
    side: 'general' as 'bride' | 'groom' | 'general',
    x: 50,
    y: 50,
    quantity: 1
  })

  const guestsToSeat = guests.filter(g => g.rsvpStatus !== 'declined')
  const unseatedGuests = guestsToSeat.filter(g => !g.tableAssignment)
  const seatedCount = guestsToSeat.filter(g => g.tableAssignment).length

  // Calculate room size based on table positions and room elements
  const roomSize = useMemo(() => {
    let maxX = 800
    let maxY = 600

    tables.forEach(t => {
      maxX = Math.max(maxX, t.x + (t.width || 100) + 50)
      maxY = Math.max(maxY, t.y + (t.height || 100) + 50)
    })

    roomElements.forEach(el => {
      maxX = Math.max(maxX, el.x + el.width + 50)
      maxY = Math.max(maxY, el.y + el.height + 50)
    })

    return { width: maxX, height: maxY }
  }, [tables, roomElements])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingTable) {
      const { quantity, ...updateData } = formData
      const storeShape = updateData.shape === 'head' ? 'rectangular' : updateData.shape
      updateTable(editingTable.id, { ...updateData, shape: storeShape as any })
    } else {
      const quantity = formData.quantity || 1
      const baseName = formData.name.trim()

      for (let i = 0; i < quantity; i++) {
        const finalName = quantity > 1 ? `${baseName} ${tables.length + i + 1}` : baseName
        const tableShape = formData.shape === 'head' ? 'rectangular' : formData.shape
        const tableCapacity = formData.shape === 'head' ? Math.max(formData.capacity, 10) : formData.capacity

        addTable({
          name: finalName,
          capacity: tableCapacity,
          shape: tableShape as 'round' | 'rectangular' | 'square',
          x: formData.x + (i * 40),
          y: formData.y + (i * 40),
          width: tableShape === 'round' ? 100 : 150,
          height: tableShape === 'round' ? 100 : 80,
          rotation: 0,
          guests: []
        })
      }
    }
    resetForm()
  }

  const resetForm = () => {
    setFormData({ name: '', capacity: 8, shape: 'round', side: 'general', x: 50, y: 50, quantity: 1 })
    setShowAddTableModal(false)
    setEditingTable(null)
  }

  const startEditTable = (table: Table) => {
    setEditingTable(table)
    setFormData({
      name: table.name,
      capacity: table.capacity,
      shape: table.shape as any,
      side: table.side || 'general',
      x: table.x,
      y: table.y,
      quantity: 1
    })
    setShowAddTableModal(true)
  }

  const handleTableDragStart = (e: React.DragEvent, tableId: string) => {
    setIsDraggingTable(tableId)
    // Create a ghost image for dragging table
    const img = new Image()
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    e.dataTransfer.setDragImage(img, 0, 0)
  }

  const handleFloorPlanDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (isDraggingTable && floorPlanRef.current) {
      const rect = floorPlanRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - 50
      const y = e.clientY - rect.top - 50

      updateTable(isDraggingTable, {
        x: Math.max(0, x),
        y: Math.max(0, y)
      })
    } else if (isDraggingElement && floorPlanRef.current) {
      const rect = floorPlanRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - 40
      const y = e.clientY - rect.top - 20

      updateRoomElement(isDraggingElement, {
        x: Math.max(0, x),
        y: Math.max(0, y)
      })
    }
  }

  const handleFloorPlanDrop = (e: React.DragEvent) => {
    if (draggedSticker && floorPlanRef.current) {
      const rect = floorPlanRef.current.getBoundingClientRect()
      const scrollLeft = floorPlanRef.current.scrollLeft
      const scrollTop = floorPlanRef.current.scrollTop

      const x = Math.max(0, e.clientX - rect.left + scrollLeft - (draggedSticker.width / 2))
      const y = Math.max(0, e.clientY - rect.top + scrollTop - (draggedSticker.height / 2))

      if (draggedSticker.type.startsWith('table-')) {
        const shape = draggedSticker.type.includes('round') ? 'round' : 'rectangular'
        const capacity = draggedSticker.type.includes('head') ? 12 : 8
        const count = tables.length + 1
        addTable({
          name: draggedSticker.type.includes('head') ? 'Head Table' : `Table ${count}`,
          capacity,
          shape,
          x,
          y,
          width: draggedSticker.width,
          height: draggedSticker.height,
          rotation: 0,
          guests: []
        })
      } else {
        addRoomElement({
          ...draggedSticker,
          x,
          y,
          rotation: 0
        })
      }
      setDraggedSticker(null)
    }
    setIsDraggingTable(null)
    setIsDraggingElement(null)
  }

  const handleDropOnTable = (tableId: string) => {
    if (draggedGuest) {
      const table = tables.find(t => t.id === tableId)
      const guest = guests.find(g => g.id === draggedGuest)

      if (table && guest) {
        // Calculate total party size: main guest + plus-one + party members
        const partyMemberCount = guest.partyMembers?.length || 0
        const plusOneCount = guest.plusOne ? 1 : 0
        const totalPartySize = 1 + plusOneCount + partyMemberCount

        // Count current seated guests at this table
        const currentSeated = table.guests.length
        const availableSeats = table.capacity - currentSeated

        if (totalPartySize <= availableSeats) {
          // Assign main guest - party members are tracked on the guest record
          // They share the same table assignment as the primary guest
          assignGuestToTable(draggedGuest, tableId)
        } else {
          // Show warning if not enough seats for entire party
          const partyDetails = []
          if (plusOneCount > 0) partyDetails.push('plus-one')
          if (partyMemberCount > 0) partyDetails.push(`${partyMemberCount} party member${partyMemberCount > 1 ? 's' : ''}`)

          const partyInfo = partyDetails.length > 0
            ? ` (includes ${partyDetails.join(' and ')})`
            : ''

          alert(`Not enough seats! ${guest.firstName}'s party needs ${totalPartySize} seats${partyInfo}, but only ${availableSeats} available at ${table.name}.`)
        }
      }
      setDraggedGuest(null)
    }
    setIsDraggingTable(null)
  }

  const handleDropOnUnseated = () => {
    if (draggedGuest) {
      removeGuestFromTable(draggedGuest)
      setDraggedGuest(null)
    }
    setIsDraggingTable(null)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!activeTransform || !floorPlanRef.current) return

    const isElement = roomElements.some(item => item.id === activeTransform.id)
    const el = isElement
      ? roomElements.find(item => item.id === activeTransform.id)
      : tables.find(item => item.id === activeTransform.id)

    if (!el) return

    if (activeTransform.type === 'resize') {
      const dx = e.clientX - activeTransform.startX
      const dy = e.clientY - activeTransform.startY
      const width = Math.max(40, activeTransform.startW + dx)
      const height = Math.max(30, activeTransform.startH + dy)

      if (isElement) {
        updateRoomElement(el.id, { width, height })
      } else {
        updateTable(el.id, { width, height })
      }
    } else if (activeTransform.type === 'rotate') {
      const rect = floorPlanRef.current.getBoundingClientRect()
      const centerX = el.x + (el as any).width / 2 + rect.left
      const centerY = el.y + (el as any).height / 2 + rect.top

      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
      const rotation = (angle + 90) % 360

      if (isElement) {
        updateRoomElement(el.id, { rotation })
      } else {
        updateTable(el.id, { rotation })
      }
    }
  }

  const handleMouseUp = () => {
    setActiveTransform(null)
  }

  const getTableGuests = (tableId: string) => {
    return guests.filter(g => g.tableAssignment === tableId)
  }

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the floor plan? This will unseat all guests and clear all decorations.')) {
      resetFloorPlan()
    }
  }

  const handleExportPDF = async () => {
    if (!floorPlanRef.current) return

    const doc = new jsPDF('l', 'mm', 'a4') // Landscape for better floor plan fit
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    // 1. Capture Floor Plan
    const canvas = await html2canvas(floorPlanRef.current.querySelector('div') as HTMLElement, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    })

    const imgData = canvas.toDataURL('image/png')

    // Header for Page 1
    doc.setFontSize(22)
    doc.setTextColor(51, 65, 85)
    doc.text('Wedding Floor Plan', pageWidth / 2, 15, { align: 'center' })

    // Adjust image to fit page while maintaining aspect ratio
    const imgWidth = pageWidth - 20
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let finalImgHeight = imgHeight
    let finalImgWidth = imgWidth

    if (imgHeight > pageHeight - 30) {
      finalImgHeight = pageHeight - 30
      finalImgWidth = (canvas.width * finalImgHeight) / canvas.height
    }

    doc.addImage(imgData, 'PNG', (pageWidth - finalImgWidth) / 2, 20, finalImgWidth, finalImgHeight)

    // 2. Guest List Sheet
    doc.addPage('a4', 'p') // Portrait for the list
    const pWidth = doc.internal.pageSize.getWidth()
    let yPos = 20

    doc.setFontSize(22)
    doc.setTextColor(51, 65, 85)
    doc.text('Guest Seating List', pWidth / 2, yPos, { align: 'center' })

    yPos += 15
    doc.setFontSize(10)
    doc.setTextColor(100, 116, 139)
    doc.text(`${seatedCount} seated of ${guestsToSeat.length} total guests`, pWidth / 2, yPos, { align: 'center' })

    yPos += 15

    const sortedTables = [...tables].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

    sortedTables.forEach((table) => {
      const tableGuests = getTableGuests(table.id)
      const guestLineHeight = 7
      const headerHeight = 15
      const boxHeight = Math.max(25, headerHeight + (tableGuests.length * guestLineHeight) + 5)

      if (yPos + boxHeight > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage()
        yPos = 20
      }

      // Table Name Header
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(51, 65, 85)
      doc.text(table.name, 20, yPos)

      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(148, 163, 184)
      doc.text(`(${tableGuests.length}/${table.capacity} seats filled)`, 20 + doc.getTextWidth(table.name) + 5, yPos)

      yPos += 8

      // Divider line
      doc.setDrawColor(226, 232, 240)
      doc.line(20, yPos - 2, pWidth - 20, yPos - 2)

      // Guest List
      doc.setFontSize(11)
      doc.setTextColor(71, 85, 105)

      if (tableGuests.length === 0) {
        doc.setFont('helvetica', 'italic')
        doc.text('No guests seated at this table', 25, yPos + 5)
        yPos += 12
      } else {
        tableGuests.forEach((guest, gIdx) => {
          doc.text(`${guest.firstName} ${guest.lastName}`, 25, yPos + 5 + (gIdx * guestLineHeight))
        })
        yPos += (tableGuests.length * guestLineHeight) + 10
      }

      yPos += 5 // Spacing between tables
    })

    doc.save('Wedding_Seating_Chart.pdf')
  }

  const getTableStyles = (table: Table) => {
    return {
      left: `${table.x}px`,
      top: `${table.y}px`,
      width: `${table.width}px`,
      height: `${table.height}px`,
      transform: `rotate(${table.rotation || 0}deg)`,
      borderRadius: table.shape === 'round' ? '50%' : '8px',
      backgroundColor: table.side === 'bride' ? '#fff1f2' : table.side === 'groom' ? '#eff6ff' : '#ffffff',
      borderColor: table.side === 'bride' ? '#fecdd3' : table.side === 'groom' ? '#bfdbfe' : '#e5e7eb',
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Seating Chart</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800">Seating Arrangement</h1>
          <p className="text-gray-500">Design your floor plan and assign guests to tables</p>
          <p className="text-gray-500 text-sm mt-1">
            {seatedCount} of {guestsToSeat.length} guests seated across {tables.length} tables
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReset} className="btn-secondary text-red-600 hover:bg-red-50 border-red-200">
            🔄 Reset Layout
          </button>
          <button onClick={handleExportPDF} className="btn-secondary flex items-center gap-2">
            📄 Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Unseated Guests List */}
        <div
          className="lg:col-span-1 card h-[700px] flex flex-col"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropOnUnseated}
        >
          <h3 className="text-lg font-medium text-gray-800 mb-4 px-2">
            Unseated Guests ({unseatedGuests.length})
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 px-2 pb-4">
            {unseatedGuests.length === 0 ? (
              <p className="text-gray-500 text-center py-4">All guests are seated!</p>
            ) : (
              unseatedGuests.map((guest) => (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => setDraggedGuest(guest.id)}
                  className="p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 border border-gray-200 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{guest.firstName} {guest.lastName}</p>
                      <p className="text-xs text-gray-500">{guest.group || 'Individual'}</p>
                    </div>
                    {((guest.plusOne) || (guest.partyMembers && guest.partyMembers.length > 0)) && (
                      <span className="bg-primary-100 text-primary-700 text-[10px] font-bold px-2 py-1 rounded-full" title="Total seats needed">
                        👥 {1 + (guest.plusOne ? 1 : 0) + (guest.partyMembers?.length || 0)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Floor Plan Area */}
        <div className="lg:col-span-2 space-y-4">
          <div
            ref={floorPlanRef}
            className="relative bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 overflow-auto shadow-inner"
            style={{ height: '700px' }}
            onDragOver={handleFloorPlanDragOver}
            onDrop={handleFloorPlanDrop}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Room Canvas */}
            <div
              className="absolute bg-white shadow-lg transition-all duration-300"
              style={{
                width: roomSize.width,
                height: roomSize.height,
                backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              {/* Room Elements Rendering */}
              {roomElements.map(el => (
                <div
                  key={el.id}
                  draggable
                  onDragStart={(e) => {
                    setIsDraggingElement(el.id);
                    const img = new Image();
                    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
                    e.dataTransfer.setDragImage(img, 0, 0);
                  }}
                  className={`absolute flex flex-col items-center justify-center p-2 cursor-move rounded-lg border-2 shadow-sm hover:shadow-md group transition-all z-20 ${el.color || 'bg-white border-primary-200 hover:border-primary-400'}`}
                  style={{
                    left: `${el.x}px`,
                    top: `${el.y}px`,
                    width: `${el.width}px`,
                    height: `${el.height}px`,
                    transform: `rotate(${el.rotation || 0}deg)`
                  }}
                >
                  <span className="text-xl">{el.icon}</span>
                  <span className="text-[9px] font-bold text-gray-600 uppercase truncate w-full text-center px-1">{el.label}</span>

                  {/* Resize Handle */}
                  <div
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 rounded-sm cursor-nwse-resize opacity-0 group-hover:opacity-100 z-30 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setActiveTransform({
                        id: el.id,
                        type: 'resize',
                        startX: e.clientX,
                        startY: e.clientY,
                        startW: el.width,
                        startH: el.height,
                        startRot: el.rotation || 0
                      })
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>

                  {/* Rotation Handle */}
                  <div
                    className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 z-30 flex items-center justify-center"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      setActiveTransform({
                        id: el.id,
                        type: 'rotate',
                        startX: e.clientX,
                        startY: e.clientY,
                        startW: el.width,
                        startH: el.height,
                        startRot: el.rotation || 0
                      })
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    <div className="absolute top-4 w-0.5 h-2 bg-primary-500"></div>
                  </div>

                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRoomElement(el.id) }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-[10px] items-center justify-center hidden group-hover:flex shadow-lg z-40"
                  >
                    ×
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newLabel = window.prompt('Enter name:', el.label);
                      if (newLabel) updateRoomElement(el.id, { label: newLabel });
                    }}
                    className="absolute -top-2 -left-2 bg-white border border-gray-200 text-gray-600 w-5 h-5 rounded-full text-[10px] items-center justify-center hidden group-hover:flex shadow-lg z-40 hover:bg-gray-50"
                  >
                    ✏️
                  </button>
                </div>
              ))}

              {tables.map((table) => {
                const tableGuests = getTableGuests(table.id)
                const isFull = tableGuests.length >= table.capacity
                const isSelected = selectedTable === table.id
                const styles = getTableStyles(table)
                const isDraggingThis = isDraggingTable === table.id

                return (
                  <div
                    key={table.id}
                    draggable
                    onDragStart={(e) => handleTableDragStart(e, table.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDropOnTable(table.id)}
                    onClick={() => setSelectedTable(isSelected ? null : table.id)}
                    className={`absolute flex flex-col items-center justify-center p-2 cursor-move transition-all border-2 group
                      ${isSelected || isDraggingThis ? 'ring-4 ring-primary-200 border-primary-500 z-50' : 'border-gray-200 hover:border-primary-300 z-10'}
                      ${isFull ? 'bg-green-50' : 'bg-white shadow-md hover:shadow-lg'}
                    `}
                    style={styles}
                  >
                    <div className="text-center w-full">
                      <p className="text-[10px] font-bold text-gray-700 truncate px-1">{table.name}</p>
                      <p className="text-[9px] text-gray-500">{tableGuests.length}/{table.capacity}</p>
                    </div>

                    {/* Transform Handles for Tables */}
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary-500 rounded-sm cursor-nwse-resize opacity-0 group-hover:opacity-100 z-30 flex items-center justify-center"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setActiveTransform({
                          id: table.id,
                          type: 'resize',
                          startX: e.clientX,
                          startY: e.clientY,
                          startW: table.width,
                          startH: table.height,
                          startRot: table.rotation || 0
                        })
                      }}
                    >
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>

                    <div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-2 border-primary-500 rounded-full cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 z-30 flex items-center justify-center"
                      onMouseDown={(e) => {
                        e.stopPropagation()
                        setActiveTransform({
                          id: table.id,
                          type: 'rotate',
                          startX: e.clientX,
                          startY: e.clientY,
                          startW: table.width,
                          startH: table.height,
                          startRot: table.rotation || 0
                        })
                      }}
                    >
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                      <div className="absolute top-4 w-0.5 h-2 bg-primary-500"></div>
                    </div>

                    {/* Guest Names Overlay */}
                    <div className={`absolute top-full left-0 mt-2 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-2xl border border-primary-200 min-w-[180px] transition-all duration-300 z-[100]
                      ${isSelected || isDraggingThis ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 pointer-events-none'}`}>
                      <div className="flex items-center justify-between mb-2 border-b border-primary-100 pb-1.5">
                        <p className="text-[10px] uppercase tracking-[0.1em] text-primary-600 font-black">Guest List</p>
                        <span className="text-[9px] font-mono bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full">{tableGuests.length}/{table.capacity}</span>
                      </div>
                      {tableGuests.length === 0 ? (
                        <p className="text-[10px] text-gray-400 italic py-2 text-center">Empty Table</p>
                      ) : (
                        <div className="space-y-1 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                          {tableGuests.map(g => (
                            <div key={g.id} className="flex items-center gap-2 group/guest">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary-300 group-hover/guest:scale-150 transition-transform" />
                              <p className="text-[12px] text-gray-700 font-bold whitespace-nowrap">
                                {g.firstName} {g.lastName}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-2 pt-1 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-[8px] text-gray-400 uppercase tracking-tighter">Drag to rearrange</span>
                        <div className="flex gap-0.5">
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                          <div className="w-1 h-1 rounded-full bg-gray-200" />
                        </div>
                      </div>
                    </div>

                    {/* Table Actions */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:flex gap-1 bg-white p-1 rounded-lg shadow-xl border border-gray-100 z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); startEditTable(table) }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTable(table.id) }}
                        className="p-1 hover:bg-red-50 rounded text-red-600"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend / Instructions */}
          <div className="flex gap-6 text-sm text-gray-500 bg-white p-4 rounded-lg shadow-sm overflow-x-auto whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary-400"></span>
              <span>Seat guests</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-300"></span>
              <span>Arrange plan</span>
            </div>
            <div className="flex items-center gap-2 text-primary-600 font-medium">
              <span>Size: {roomSize.width}px x {roomSize.height}px</span>
            </div>
          </div>
        </div>

        {/* Room Elements Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card h-[700px] flex flex-col p-4">
            <h3 className="text-lg font-medium text-gray-800 mb-2">Decor & Labels</h3>
            <p className="text-xs text-gray-500 mb-4 italic">Drag and "peel off" labels to the floor plan.</p>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2">
              {STICKERS.map(sticker => (
                <div
                  key={sticker.type}
                  draggable
                  onDragStart={() => setDraggedSticker(sticker)}
                  className={`p-3 rounded-lg border-2 cursor-grab active:cursor-grabbing sticker-peel transition-all flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md ${sticker.color}`}
                >
                  <span className="text-2xl mb-1">{sticker.icon}</span>
                  <span className="text-[10px] font-bold uppercase">{sticker.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Table Modal */}
      {showAddTableModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-serif text-gray-800 mb-4">
              {editingTable ? 'Edit Table' : 'Add Table'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
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
                    className="input-field"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
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
                <div className="grid grid-cols-4 gap-2">
                  {tableShapes.map((shape) => (
                    <button
                      key={shape.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, shape: shape.value as any })}
                      className={`p-2 rounded-lg border-2 flex flex-col items-center transition-all ${formData.shape === shape.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <span className="text-xl">{shape.icon}</span>
                      <span className="text-[10px] text-gray-600 font-medium">{shape.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Side Assignment</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'bride' })}
                    className={`p-2 rounded-lg border-2 flex flex-col items-center transition-all ${formData.side === 'bride'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-100 hover:border-rose-100'
                      }`}
                  >
                    <span className="text-xl">👰</span>
                    <span className="text-[10px] text-gray-600 font-medium">Bride</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'groom' })}
                    className={`p-2 rounded-lg border-2 flex flex-col items-center transition-all ${formData.side === 'groom'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-100 hover:border-blue-100'
                      }`}
                  >
                    <span className="text-xl">🤵</span>
                    <span className="text-[10px] text-gray-600 font-medium">Groom</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, side: 'general' })}
                    className={`p-2 rounded-lg border-2 flex flex-col items-center transition-all ${formData.side === 'general'
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-gray-200'
                      }`}
                  >
                    <span className="text-xl">⚪</span>
                    <span className="text-[10px] text-gray-600 font-medium">General</span>
                  </button>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingTable ? 'Save Changes' : 'Add Table(s)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
