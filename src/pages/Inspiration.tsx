import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import type { BoardCategory, InspirationBoard, InspirationImage } from '../types'

const categoryConfig: Record<BoardCategory, { label: string; icon: string; color: string }> = {
  colors: { label: 'Color Palettes', icon: '🎨', color: 'bg-pink-100 text-pink-700' },
  florals: { label: 'Florals', icon: '💐', color: 'bg-green-100 text-green-700' },
  fashion: { label: 'Fashion', icon: '👗', color: 'bg-purple-100 text-purple-700' },
  venue: { label: 'Venue', icon: '🏛️', color: 'bg-amber-100 text-amber-700' },
  cake: { label: 'Cake & Desserts', icon: '🍰', color: 'bg-orange-100 text-orange-700' },
  photography: { label: 'Photography', icon: '📸', color: 'bg-blue-100 text-blue-700' },
  decor: { label: 'Decor', icon: '✨', color: 'bg-yellow-100 text-yellow-700' },
  stationery: { label: 'Stationery', icon: '💌', color: 'bg-rose-100 text-rose-700' },
  other: { label: 'Other', icon: '📌', color: 'bg-gray-100 text-gray-700' }
}

export default function Inspiration() {
  const [showNewBoardModal, setShowNewBoardModal] = useState(false)
  const [showAddImageModal, setShowAddImageModal] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<InspirationBoard | null>(null)
  const [viewingImage, setViewingImage] = useState<InspirationImage | null>(null)
  const [editingBoard, setEditingBoard] = useState<InspirationBoard | null>(null)

  const inspirationBoards = useWeddingStore((state) => state.inspirationBoards)
  const addInspirationBoard = useWeddingStore((state) => state.addInspirationBoard)
  const updateInspirationBoard = useWeddingStore((state) => state.updateInspirationBoard)
  const deleteInspirationBoard = useWeddingStore((state) => state.deleteInspirationBoard)
  const addImageToBoard = useWeddingStore((state) => state.addImageToBoard)
  const removeImageFromBoard = useWeddingStore((state) => state.removeImageFromBoard)

  const [newBoard, setNewBoard] = useState({
    name: '',
    category: 'other' as BoardCategory,
    description: ''
  })

  const [newImage, setNewImage] = useState({
    url: '',
    source: '',
    notes: '',
    tags: ''
  })

  const handleCreateBoard = () => {
    if (!newBoard.name.trim()) return
    addInspirationBoard(newBoard)
    setNewBoard({ name: '', category: 'other', description: '' })
    setShowNewBoardModal(false)
  }

  const handleUpdateBoard = () => {
    if (!editingBoard || !editingBoard.name.trim()) return
    updateInspirationBoard(editingBoard.id, {
      name: editingBoard.name,
      category: editingBoard.category,
      description: editingBoard.description
    })
    setEditingBoard(null)
  }

  const handleDeleteBoard = (id: string) => {
    if (confirm('Delete this board and all its images?')) {
      deleteInspirationBoard(id)
      if (selectedBoard?.id === id) {
        setSelectedBoard(null)
      }
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedBoard) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        addImageToBoard(selectedBoard.id, {
          url,
          source: 'Upload',
          notes: '',
          tags: []
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const handleAddImageUrl = () => {
    if (!newImage.url.trim() || !selectedBoard) return
    addImageToBoard(selectedBoard.id, {
      url: newImage.url,
      source: newImage.source || 'URL',
      notes: newImage.notes,
      tags: newImage.tags.split(',').map((t) => t.trim()).filter(Boolean)
    })
    setNewImage({ url: '', source: '', notes: '', tags: '' })
    setShowAddImageModal(false)
  }

  const handleDeleteImage = (imageId: string) => {
    if (!selectedBoard) return
    if (confirm('Remove this image from the board?')) {
      removeImageFromBoard(selectedBoard.id, imageId)
    }
  }

  const totalImages = inspirationBoards.reduce((sum, b) => sum + b.images.length, 0)

  // Board Detail View
  if (selectedBoard) {
    const board = inspirationBoards.find((b) => b.id === selectedBoard.id) || selectedBoard
    const config = categoryConfig[board.category]

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSelectedBoard(null)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 shadow-sm"
              title="Back to Overview"
            >
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
                <span>/</span>
                <button onClick={() => setSelectedBoard(null)} className="hover:text-primary-600 transition-colors">Inspiration</button>
                <span>/</span>
                <span className="text-gray-400">{board.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{config.icon}</span>
                <h1 className="text-2xl font-serif text-gray-800 dark:text-gray-200">{board.name}</h1>
                <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                  {config.label}
                </span>
              </div>
              {board.description && (
                <p className="text-gray-500 dark:text-gray-400 mt-1">{board.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditingBoard(board)}
              className="btn-secondary text-sm py-2"
            >
              Edit Board
            </button>
            <label className="btn-primary text-sm py-2 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              Upload Images
            </label>
            <button
              onClick={() => setShowAddImageModal(true)}
              className="btn-secondary text-sm py-2"
            >
              Add URL
            </button>
          </div>
        </div>

        {/* Image Grid */}
        {board.images.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">{config.icon}</div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              No images yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start adding inspiration images to this board
            </p>
            <label className="btn-primary cursor-pointer inline-block">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              Upload Your First Image
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {board.images.map((image) => (
              <div
                key={image.id}
                className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                onClick={() => setViewingImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.notes || 'Inspiration'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {image.notes && (
                      <p className="text-white text-sm truncate">{image.notes}</p>
                    )}
                    {image.source && (
                      <p className="text-white/70 text-xs">{image.source}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteImage(image.id)
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
                >
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            {/* Add more card */}
            <label className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm text-gray-500">Add Image</span>
            </label>
          </div>
        )}

        {/* Image Viewer Modal */}
        {viewingImage && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <button
              onClick={() => setViewingImage(null)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="max-w-4xl max-h-[90vh] flex flex-col">
              <img
                src={viewingImage.url}
                alt={viewingImage.notes || 'Inspiration'}
                className="max-h-[80vh] object-contain rounded-lg"
              />
              <div className="mt-4 text-center">
                {viewingImage.notes && (
                  <p className="text-white text-lg">{viewingImage.notes}</p>
                )}
                {viewingImage.source && (
                  <p className="text-white/60 text-sm mt-1">Source: {viewingImage.source}</p>
                )}
                {viewingImage.tags.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    {viewingImage.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 bg-white/20 rounded-full text-white text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Image URL Modal */}
        {showAddImageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-serif text-gray-800 dark:text-gray-200 mb-4">
                Add Image from URL
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    value={newImage.url}
                    onChange={(e) => setNewImage({ ...newImage, url: e.target.value })}
                    placeholder="https://..."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Source
                  </label>
                  <input
                    type="text"
                    value={newImage.source}
                    onChange={(e) => setNewImage({ ...newImage, source: e.target.value })}
                    placeholder="Pinterest, Instagram, etc."
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={newImage.notes}
                    onChange={(e) => setNewImage({ ...newImage, notes: e.target.value })}
                    placeholder="Love this style!"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newImage.tags}
                    onChange={(e) => setNewImage({ ...newImage, tags: e.target.value })}
                    placeholder="rustic, outdoor, romantic"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddImageModal(false)
                    setNewImage({ url: '', source: '', notes: '', tags: '' })
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button onClick={handleAddImageUrl} className="btn-primary">
                  Add Image
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Board Modal */}
        {editingBoard && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-serif text-gray-800 dark:text-gray-200 mb-4">
                Edit Board
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Board Name *
                  </label>
                  <input
                    type="text"
                    value={editingBoard.name}
                    onChange={(e) => setEditingBoard({ ...editingBoard, name: e.target.value })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingBoard.category}
                    onChange={(e) => setEditingBoard({ ...editingBoard, category: e.target.value as BoardCategory })}
                    className="input-field"
                  >
                    {Object.entries(categoryConfig).map(([key, { label, icon }]) => (
                      <option key={key} value={key}>
                        {icon} {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingBoard.description}
                    onChange={(e) => setEditingBoard({ ...editingBoard, description: e.target.value })}
                    rows={3}
                    className="input-field"
                    placeholder="Notes about this board..."
                  />
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => handleDeleteBoard(editingBoard.id)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete Board
                </button>
                <div className="flex gap-3">
                  <button onClick={() => setEditingBoard(null)} className="btn-secondary">
                    Cancel
                  </button>
                  <button onClick={handleUpdateBoard} className="btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Board Overview
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Inspiration</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800 dark:text-gray-200">
            Inspiration Boards
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {inspirationBoards.length} boards · {totalImages} images saved
          </p>
        </div>
        <button onClick={() => setShowNewBoardModal(true)} className="btn-primary">
          + New Board
        </button>
      </div>

      {/* Boards Grid */}
      {inspirationBoards.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            Start Your Inspiration Collection
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
            Create boards to organize your wedding inspiration by category - colors, florals,
            fashion, venues, and more!
          </p>
          <button onClick={() => setShowNewBoardModal(true)} className="btn-primary">
            Create Your First Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {inspirationBoards.map((board) => {
            const config = categoryConfig[board.category]
            return (
              <div
                key={board.id}
                onClick={() => setSelectedBoard(board)}
                className="card card-hover cursor-pointer group"
              >
                {/* Cover Image */}
                <div className="aspect-video -mx-6 -mt-6 mb-4 bg-gray-100 dark:bg-gray-700 rounded-t-xl overflow-hidden">
                  {board.coverImage ? (
                    <img
                      src={board.coverImage}
                      alt={board.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-5xl opacity-50">{config.icon}</span>
                    </div>
                  )}
                </div>

                {/* Board Info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{config.icon}</span>
                      <h3 className="font-medium text-gray-800 dark:text-gray-200">
                        {board.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {board.images.length} image{board.images.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                    {config.label}
                  </span>
                </div>

                {board.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                    {board.description}
                  </p>
                )}

                {/* Image Previews */}
                {board.images.length > 1 && (
                  <div className="flex gap-1 mt-3 -mx-1">
                    {board.images.slice(0, 4).map((img) => (
                      <div
                        key={img.id}
                        className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100"
                      >
                        <img
                          src={img.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {board.images.length > 4 && (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
                        +{board.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {/* Create New Board Card */}
          <div
            onClick={() => setShowNewBoardModal(true)}
            className="card border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center py-12 cursor-pointer hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-medium text-gray-600 dark:text-gray-400">Create New Board</p>
          </div>
        </div>
      )}

      {/* Vendor Suggestions */}
      {inspirationBoards.length > 0 && (
        <div className="card">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
            Vendors to Consider Based on Your Boards
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(categoryConfig)
              .filter(([key]) => inspirationBoards.some((b) => b.category === key))
              .map(([key, { label, icon, color }]) => (
                <div key={key} className={`p-3 rounded-lg ${color} text-center`}>
                  <span className="text-2xl">{icon}</span>
                  <p className="text-sm font-medium mt-1">{label}</p>
                  <p className="text-xs opacity-75">
                    {inspirationBoards.filter((b) => b.category === key).reduce((sum, b) => sum + b.images.length, 0)} ideas saved
                  </p>
                </div>
              ))}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Use these boards when meeting with vendors to show them your vision!
          </p>
        </div>
      )}

      {/* New Board Modal */}
      {showNewBoardModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-serif text-gray-800 dark:text-gray-200 mb-4">
              Create New Board
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Board Name *
                </label>
                <input
                  type="text"
                  value={newBoard.name}
                  onChange={(e) => setNewBoard({ ...newBoard, name: e.target.value })}
                  placeholder="e.g., Our Color Palette"
                  className="input-field"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  value={newBoard.category}
                  onChange={(e) => setNewBoard({ ...newBoard, category: e.target.value as BoardCategory })}
                  className="input-field"
                >
                  {Object.entries(categoryConfig).map(([key, { label, icon }]) => (
                    <option key={key} value={key}>
                      {icon} {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newBoard.description}
                  onChange={(e) => setNewBoard({ ...newBoard, description: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="What's this board about?"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowNewBoardModal(false)
                  setNewBoard({ name: '', category: 'other', description: '' })
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button onClick={handleCreateBoard} className="btn-primary">
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
