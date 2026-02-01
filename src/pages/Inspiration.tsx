import { useState, useCallback, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { generateDressTryOn } from '../lib/gemini'
import { compressImage, fileToCompressedDataUrl } from '../lib/imageUtils'
import type { BoardCategory, InspirationBoard, InspirationImage } from '../types'

const extractImageUrl = (dataTransfer: DataTransfer): string | null => {
  // Check HTML first - most reliable for web images (Pinterest, etc.)
  const html = dataTransfer.getData('text/html')
  if (html) {
    // 1. Try to find the highest resolution image in a srcset
    const srcsetMatch = html.match(/srcset=["']([^"']+)["']/i)
    if (srcsetMatch && srcsetMatch[1]) {
      const sources = srcsetMatch[1].split(',').map(s => s.trim().split(' ')[0])
      // Return the last one (usually highest res)
      if (sources.length > 0) return sources[sources.length - 1]
    }

    // 2. Try Pinterest specific data attributes if present
    const pinMatch = html.match(/src=["']([^"']+)["']/i)
    if (pinMatch && pinMatch[1] && pinMatch[1].includes('pinimg.com')) {
      // Pinterest URLs like /236x/ can be converted to /originals/ or /736x/ for better quality
      return pinMatch[1].replace(/\/\d+x\//, '/736x/')
    }

    // 3. Try standard data-src or src
    const dataSrcMatch = html.match(/data-src=["']([^"']+)["']/i)
    if (dataSrcMatch && dataSrcMatch[1]) return dataSrcMatch[1]

    const srcMatch = html.match(/src=["']([^"']+)["']/i)
    if (srcMatch && srcMatch[1]) {
      // Ignore tiny tracking pixels or icons (usually small data URLs)
      if (srcMatch[1].startsWith('data:')) {
        if (srcMatch[1].length > 1000) return srcMatch[1] // Keep if large enough to be an image
      } else {
        return srcMatch[1]
      }
    }

    // 4. Look for any https URL that looks like an image in the HTML
    const urlMatch = html.match(/https?:\/\/[^"'\s<>]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^"'\s<>]*)?/i)
    if (urlMatch) return urlMatch[0]
  }

  // Check URI list
  const uri = dataTransfer.getData('text/uri-list')
  if (uri) {
    const firstUri = uri.split('\n')[0].trim()
    if (firstUri && (firstUri.startsWith('http') || firstUri.startsWith('data:image'))) {
      return firstUri
    }
  }

  // Check plain text
  const text = dataTransfer.getData('text/plain')
  if (text) {
    if (text.startsWith('http') || text.startsWith('data:image')) {
      return text.trim()
    }
    // Check if it contains an image URL anywhere
    const urlMatch = text.match(/https?:\/\/[^"'\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(?:\?[^"'\s]*)?/i)
    if (urlMatch) return urlMatch[0]
  }

  return null
}

// Helper to convert a File to compressed data URL 
// (Moved to lib/imageUtils.ts but kept usage here)
const fileToDataUrl = (file: File) => fileToCompressedDataUrl(file, 1200, 1200, 0.7)

const fetchImageAsDataUrl = async (url: string): Promise<string | null> => {
  // If already a data URL, return as-is
  if (url.startsWith('data:')) {
    return url
  }

  // Normalize Pinterest URLs to higher resolution if possible
  let targetUrl = url
  if (url.includes('pinimg.com')) {
    // Pinterest URLs like /236x/ or /564x/ can often be converted to /originals/ or /736x/
    // We'll try /736x/ as it's a good balance of quality and size
    targetUrl = url.replace(/\/\d+x\//, '/736x/')
  }

  try {
    // Try direct fetch first
    const response = await fetch(targetUrl, { mode: 'cors', credentials: 'omit' })
    if (response.ok) {
      const blob = await response.blob()
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = async () => {
          const result = reader.result as string
          const compressed = await compressImage(result)
          resolve(compressed)
        }
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    }
  } catch {
    // CORS error or fetch failed, try canvas method with next fallback
  }

  // Fallback to original URL if normalization failed to fetch
  if (targetUrl !== url) {
    try {
      const response = await fetch(url, { mode: 'cors', credentials: 'omit' })
      if (response.ok) {
        const blob = await response.blob()
        const dataUrl = await new Promise<string | null>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => resolve(null)
          reader.readAsDataURL(blob)
        })
        if (dataUrl) return await compressImage(dataUrl)
      }
    } catch { }
  }

  // Try loading via canvas (works for some CORS-blocked images)
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    const timeout = setTimeout(() => resolve(null), 8000)

    img.onload = async () => {
      clearTimeout(timeout)
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
        const compressed = await compressImage(dataUrl)
        resolve(compressed)
      } catch {
        resolve(null)
      }
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(null)
    }

    img.src = targetUrl
  })
}

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
  const navigate = useNavigate()
  const [showNewBoardModal, setShowNewBoardModal] = useState(false)
  const [showAddImageModal, setShowAddImageModal] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<InspirationBoard | null>(null)
  const [viewingImage, setViewingImage] = useState<InspirationImage | null>(null)
  const [editingBoard, setEditingBoard] = useState<InspirationBoard | null>(null)

  // Try-on state
  const [tryOnImage, setTryOnImage] = useState<InspirationImage | null>(null)
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false)
  const [tryOnResult, setTryOnResult] = useState<string | null>(null)
  const [tryOnError, setTryOnError] = useState<string | null>(null)

  const inspirationBoards = useWeddingStore((state) => state.inspirationBoards)
  const addInspirationBoard = useWeddingStore((state) => state.addInspirationBoard)
  const updateInspirationBoard = useWeddingStore((state) => state.updateInspirationBoard)
  const deleteInspirationBoard = useWeddingStore((state) => state.deleteInspirationBoard)
  const addImageToBoard = useWeddingStore((state) => state.addImageToBoard)
  const removeImageFromBoard = useWeddingStore((state) => state.removeImageFromBoard)
  const reorderBoardImages = useWeddingStore((state) => state.reorderBoardImages)
  const updateBoardImage = useWeddingStore((state) => state.updateBoardImage)
  // uploadFile removed - using data URLs directly for reliability
  const appSettings = useWeddingStore((state) => state.appSettings)

  const [isUploading, setIsUploading] = useState(false)

  // Drag and drop state
  const [isDraggingExternal, setIsDraggingExternal] = useState(false)
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)

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

  const handleCreateBoard = async () => {
    if (!newBoard.name.trim()) return
    await addInspirationBoard(newBoard)
    setNewBoard({ name: '', category: 'other', description: '' })
    setShowNewBoardModal(false)
  }

  const handleUpdateBoard = async () => {
    if (!editingBoard || !editingBoard.name.trim()) return
    await updateInspirationBoard(editingBoard.id, {
      name: editingBoard.name,
      category: editingBoard.category,
      description: editingBoard.description
    })
    setEditingBoard(null)
  }

  const handleDeleteBoard = async (id: string) => {
    if (confirm('Delete this board and all its images?')) {
      await deleteInspirationBoard(id)
      if (selectedBoard?.id === id) {
        setSelectedBoard(null)
      }
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !selectedBoard) return

    setIsUploading(true)
    try {
      for (const file of Array.from(files)) {
        // Use data URL directly for reliable, fast uploads
        const url = await fileToDataUrl(file)
        if (url) {
          await addImageToBoard(selectedBoard.id, {
            url,
            source: 'Upload',
            notes: '',
            tags: []
          })
        }
      }
    } catch (err) {
      console.error('Failed to upload images:', err)
      alert('Failed to upload images. Please try again.')
    } finally {
      setIsUploading(false)
      // Reset input so same file can be selected again
      e.target.value = ''
    }
  }

  const handleAddImageUrl = async () => {
    if (!newImage.url.trim() || !selectedBoard) return
    await addImageToBoard(selectedBoard.id, {
      url: newImage.url,
      source: newImage.source || 'URL',
      notes: newImage.notes,
      tags: newImage.tags.split(',').map((t) => t.trim()).filter(Boolean)
    })
    setNewImage({ url: '', source: '', notes: '', tags: '' })
    setShowAddImageModal(false)
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!selectedBoard) return
    if (confirm('Remove this image from the board?')) {
      await removeImageFromBoard(selectedBoard.id, imageId)
    }
  }

  // External drag-and-drop handlers
  const handleExternalDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only show drop zone for external drags (not internal reordering)
    if (!draggedImageId) {
      setIsDraggingExternal(true)
    }
  }, [draggedImageId])

  const handleExternalDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Only hide if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDraggingExternal(false)
    }
  }, [])

  const handleExternalDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingExternal(false)

    if (!selectedBoard || draggedImageId) return

    // Check for dropped files first (images dragged from desktop or browser)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setIsUploading(true)
      try {
        for (const file of Array.from(e.dataTransfer.files)) {
          if (file.type.startsWith('image/')) {
            // Use data URL directly for fast, reliable uploads
            const url = await fileToDataUrl(file)
            if (url) {
              await addImageToBoard(selectedBoard.id, {
                url,
                source: 'Drag & Drop',
                notes: '',
                tags: []
              })
            }
          }
        }
      } catch (err) {
        console.error('Failed to upload dropped images:', err)
      } finally {
        setIsUploading(false)
      }
      return
    }

    // Try to extract image URL from drag data
    const imageUrl = extractImageUrl(e.dataTransfer)
    if (imageUrl) {
      setIsUploading(true)
      try {
        // fetchImageAsDataUrl now automatically compresses the image
        const dataUrl = await fetchImageAsDataUrl(imageUrl)

        await addImageToBoard(selectedBoard.id, {
          url: dataUrl || imageUrl, // Fall back to original URL if conversion fails
          source: dataUrl ? 'Web (compressed)' : 'Web URL',
          notes: dataUrl ? '' : 'Note: External URL may not work with AI Try-On',
          tags: []
        })
      } finally {
        setIsUploading(false)
      }
    }
  }, [selectedBoard, draggedImageId, addImageToBoard])

  // Internal reorder drag handlers
  const handleImageDragStart = useCallback((e: React.DragEvent, imageId: string) => {
    setDraggedImageId(imageId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', imageId)
    // Add a slight delay to allow the drag image to be created
    setTimeout(() => {
      (e.target as HTMLElement).style.opacity = '0.5'
    }, 0)
  }, [])

  const handleImageDragEnd = useCallback((e: React.DragEvent) => {
    (e.target as HTMLElement).style.opacity = '1'
    setDraggedImageId(null)
    setDropTargetId(null)
  }, [])

  const handleImageDragOver = useCallback((e: React.DragEvent, imageId: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (draggedImageId && draggedImageId !== imageId) {
      setDropTargetId(imageId)
    }
  }, [draggedImageId])

  const handleImageDragLeave = useCallback(() => {
    setDropTargetId(null)
  }, [])

  const handleImageDrop = useCallback(async (e: React.DragEvent, targetImageId: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!selectedBoard || !draggedImageId || draggedImageId === targetImageId) {
      setDropTargetId(null)
      return
    }

    const board = inspirationBoards.find(b => b.id === selectedBoard.id)
    if (!board) return

    const images = [...board.images]
    const draggedIndex = images.findIndex(img => img.id === draggedImageId)
    const targetIndex = images.findIndex(img => img.id === targetImageId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Remove dragged image and insert at target position
    const [draggedImage] = images.splice(draggedIndex, 1)
    images.splice(targetIndex, 0, draggedImage)

    // Update the order
    await reorderBoardImages(selectedBoard.id, images.map(img => img.id))

    setDraggedImageId(null)
    setDropTargetId(null)
  }, [selectedBoard, draggedImageId, inspirationBoards, reorderBoardImages])

  // Clipboard paste handler
  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    if (!selectedBoard) return

    const items = e.clipboardData?.items
    if (!items) return

    // Check for pasted image files first (Copy Image from browser)
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        if (file) {
          setIsUploading(true)
          try {
            // Use data URL directly for fast, reliable uploads
            const url = await fileToDataUrl(file)
            if (url) {
              await addImageToBoard(selectedBoard.id, {
                url,
                source: 'Clipboard Paste',
                notes: '',
                tags: []
              })
            }
          } catch (err) {
            console.error('Failed to upload pasted image:', err)
          } finally {
            setIsUploading(false)
          }
        }
        return
      }
    }

    // Check for pasted image in HTML or Text (URL)
    const imageUrl = extractImageUrl(e.clipboardData as any)
    if (imageUrl) {
      e.preventDefault()
      setIsUploading(true)
      try {
        const dataUrl = await fetchImageAsDataUrl(imageUrl)
        await addImageToBoard(selectedBoard.id, {
          url: dataUrl || imageUrl,
          source: dataUrl ? 'Clipboard (compressed)' : 'Clipboard URL',
          notes: dataUrl ? '' : 'Note: External URL may not work with AI Try-On',
          tags: []
        })
      } finally {
        setIsUploading(false)
      }
    }
  }, [selectedBoard, addImageToBoard])

  // Set up paste listener when viewing a board
  useEffect(() => {
    if (selectedBoard) {
      document.addEventListener('paste', handlePaste)
      return () => document.removeEventListener('paste', handlePaste)
    }
  }, [selectedBoard, handlePaste])

  // AI Try-on handler
  const handleTryOn = useCallback(async (image: InspirationImage) => {
    // Check if bride photo exists
    if (!appSettings.bridePhoto) {
      if (confirm('You need to upload your photo first to use the Try On feature. Go to Settings?')) {
        navigate('/settings')
      }
      return
    }

    // Check if API key exists (only if not using local VTON)
    if (!appSettings.geminiApiKey && !appSettings.vtonApiUrl) {
      if (confirm('You need to add your Google Gemini API key or a Local VTON URL to use the Try On feature. Go to Settings?')) {
        navigate('/settings')
      }
      return
    }

    // If we already have a try-on for this image, just show it
    if (image.tryOnUrl) {
      setTryOnImage(image)
      setTryOnResult(image.tryOnUrl)
      return
    }

    // Start generation
    setTryOnImage(image)
    setTryOnResult(null)
    setTryOnError(null)
    setIsGeneratingTryOn(true)

    try {
      const result = await generateDressTryOn(
        appSettings.geminiApiKey || '',
        appSettings.bridePhoto,
        image.url,
        appSettings.vtonApiUrl
      )

      if (result.success && result.imageUrl) {
        setTryOnResult(result.imageUrl)
        // Save the result to the image
        if (selectedBoard) {
          await updateBoardImage(selectedBoard.id, image.id, { tryOnUrl: result.imageUrl })
        }
      } else {
        setTryOnError(result.error || 'Failed to generate try-on image')
      }
    } catch (err) {
      setTryOnError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGeneratingTryOn(false)
    }
  }, [appSettings.bridePhoto, appSettings.geminiApiKey, appSettings.vtonApiUrl, navigate, selectedBoard, updateBoardImage])

  const closeTryOnModal = () => {
    setTryOnImage(null)
    setTryOnResult(null)
    setTryOnError(null)
    setIsGeneratingTryOn(false)
  }

  const totalImages = inspirationBoards.reduce((sum, b) => sum + b.images.length, 0)

  // Board Detail View
  if (selectedBoard) {
    const board = inspirationBoards.find((b) => b.id === selectedBoard.id) || selectedBoard
    const config = categoryConfig[board.category]

    return (
      <div
        className="space-y-6 relative"
        onDragOver={handleExternalDragOver}
        onDragLeave={handleExternalDragLeave}
        onDrop={handleExternalDrop}
      >
        {/* External drag overlay */}
        {isDraggingExternal && (
          <div className="fixed inset-0 bg-primary-500/20 z-40 pointer-events-none flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-2xl border-4 border-dashed border-primary-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto text-primary-500 mb-4\" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-xl font-medium text-gray-800 dark:text-gray-200">Drop image here</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Add to your inspiration board</p>
              </div>
            </div>
          </div>
        )}

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
            <label className={`btn-primary text-sm py-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={isUploading}
                className="hidden"
              />
              {isUploading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Uploading...
                </span>
              ) : 'Upload Images'}
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
          <div className={`card text-center py-16 border-2 border-dashed transition-colors ${isDraggingExternal ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-transparent'
            }`}>
            <div className="text-6xl mb-4">{config.icon}</div>
            <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
              No images yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Upload images, paste a URL, or drag & drop images from other websites
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <label className="btn-primary cursor-pointer inline-block">
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
                className="btn-secondary"
              >
                Add from URL
              </button>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
              Tip: Drag or copy images from Pinterest, Google, or any website and paste here (Ctrl+V)!
            </p>
          </div>
        ) : (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {board.images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleImageDragStart(e, image.id)}
                onDragEnd={handleImageDragEnd}
                onDragOver={(e) => handleImageDragOver(e, image.id)}
                onDragLeave={handleImageDragLeave}
                onDrop={(e) => handleImageDrop(e, image.id)}
                className={`group relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-grab active:cursor-grabbing transition-all duration-200 break-inside-avoid mb-4 ${draggedImageId === image.id ? 'opacity-50 scale-95' : ''
                  } ${dropTargetId === image.id ? 'ring-4 ring-primary-500 ring-offset-2 scale-105' : ''
                  }`}
                onClick={() => !draggedImageId && setViewingImage(image)}
              >
                <img
                  src={image.url}
                  alt={image.notes || 'Inspiration'}
                  className="w-full h-auto object-contain transition-transform group-hover:scale-[1.02] pointer-events-none"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    {image.notes && (
                      <p className="text-white text-sm truncate">{image.notes}</p>
                    )}
                    {image.source && (
                      <p className="text-white/70 text-xs">{image.source}</p>
                    )}
                  </div>
                </div>
                {/* Drag handle indicator */}
                <div className="absolute top-2 left-2 p-1.5 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </div>
                {/* Try On button - show for fashion boards or if image already has try-on */}
                {(board.category === 'fashion' || image.tryOnUrl) && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleTryOn(image)
                    }}
                    className={`absolute top-2 left-10 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${image.tryOnUrl
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-white/90 text-primary-600 hover:bg-primary-100'
                      }`}
                    title={image.tryOnUrl ? 'View Try-On' : 'Try On Dress'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </button>
                )}
                {/* Try-on badge */}
                {image.tryOnUrl && (
                  <div className="absolute bottom-2 right-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-full flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Try-On
                  </div>
                )}
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
            <label className={`rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all py-12 break-inside-avoid mb-4 ${isDraggingExternal
              ? 'border-primary-500 bg-primary-100 dark:bg-primary-900/30 scale-105'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 hover:bg-primary-50/50'
              }`}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
              <svg className={`w-8 h-8 mb-2 ${isDraggingExternal ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isDraggingExternal ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                )}
              </svg>
              <span className={`text-sm ${isDraggingExternal ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                {isDraggingExternal ? 'Drop here!' : 'Add Image'}
              </span>
              <span className="text-xs text-gray-400 mt-1">drag, paste, or click</span>
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

        {/* AI Try-On Modal */}
        {tryOnImage && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
            <button
              onClick={closeTryOnModal}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-lg z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="max-w-6xl w-full max-h-[90vh] overflow-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-serif text-white mb-2">AI Dress Try-On</h2>
                <p className="text-white/60">See yourself in this dress</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Original Dress */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="text-white text-sm font-medium mb-3 text-center">Original Dress</h3>
                  <img
                    src={tryOnImage.url}
                    alt="Original dress"
                    className="w-full max-h-[60vh] object-contain rounded-lg"
                  />
                </div>

                {/* Try-On Result */}
                <div className="bg-white/10 rounded-xl p-4">
                  <h3 className="text-white text-sm font-medium mb-3 text-center">Your Try-On</h3>

                  {isGeneratingTryOn && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-white">
                      <div className="relative mb-6">
                        <svg className="animate-spin h-16 w-16 text-primary-400" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium">Creating your look...</p>
                      <p className="text-white/60 text-sm mt-2">This may take a moment</p>
                    </div>
                  )}

                  {tryOnError && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-white">
                      <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-lg font-medium text-red-400">Generation Failed</p>
                      <p className="text-white/60 text-sm mt-2 max-w-xs text-center">{tryOnError}</p>
                      <button
                        onClick={() => handleTryOn(tryOnImage)}
                        className="mt-4 btn-primary"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {tryOnResult && !isGeneratingTryOn && (
                    <img
                      src={tryOnResult}
                      alt="Your try-on"
                      className="w-full max-h-[60vh] object-contain rounded-lg"
                    />
                  )}

                  {!isGeneratingTryOn && !tryOnResult && !tryOnError && (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-white">
                      <button
                        onClick={() => handleTryOn(tryOnImage)}
                        className="btn-primary text-lg px-8 py-3"
                      >
                        Generate Try-On
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {tryOnResult && !isGeneratingTryOn && (
                <div className="mt-6 text-center">
                  <p className="text-white/60 text-sm mb-3">
                    This is an AI-generated visualization. Results are artistic interpretations.
                  </p>
                  <button
                    onClick={() => {
                      setTryOnResult(null)
                      setTryOnError(null)
                      handleTryOn(tryOnImage)
                    }}
                    className="btn-secondary mr-3"
                  >
                    Regenerate
                  </button>
                  <a
                    href={tryOnResult}
                    download="dress-try-on.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    Download Image
                  </a>
                </div>
              )}
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
