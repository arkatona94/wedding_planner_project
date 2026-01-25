import { useState, useRef } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { QRCodeSVG } from 'qrcode.react'
import { format } from 'date-fns'
import type { Photo } from '../types'

export default function Photos() {
  const { photos, addPhoto, deletePhoto, likePhoto, wedding } = useWeddingStore()
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [filter, setFilter] = useState<'all' | 'most-liked'>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploadData, setUploadData] = useState({
    uploaderName: '',
    caption: '',
    tags: ''
  })

  const filteredPhotos = filter === 'most-liked'
    ? [...photos].sort((a, b) => b.likes - a.likes)
    : [...photos].sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const url = event.target?.result as string
        addPhoto({
          url,
          uploadedBy: uploadData.uploaderName || 'Guest',
          uploadedAt: new Date().toISOString(),
          caption: uploadData.caption,
          likes: 0,
          tags: uploadData.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      }
      reader.readAsDataURL(file)
    })

    setShowUploadModal(false)
    setUploadData({ uploaderName: '', caption: '', tags: '' })
  }

  const photoUploadUrl = `${window.location.origin}/upload-photos`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-gray-800">Photo Gallery</h1>
          <p className="text-gray-500">{photos.length} photos shared</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowQRModal(true)} className="btn-secondary">
            Share QR Code
          </button>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary">
            + Upload Photos
          </button>
        </div>
      </div>

      {/* Instructions Card */}
      <div className="card bg-gradient-to-r from-primary-50 to-wedding-blush">
        <h3 className="font-medium text-gray-800 mb-2">Zero-App Photo Sharing</h3>
        <p className="text-sm text-gray-600">
          Share the QR code with your guests so they can upload photos directly to your gallery
          without downloading any apps. All photos will appear here in real-time!
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'all' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Recent
        </button>
        <button
          onClick={() => setFilter('most-liked')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === 'most-liked' ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Most Liked
        </button>
      </div>

      {/* Photo Grid */}
      {filteredPhotos.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-gray-500 mb-4">No photos yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Upload your engagement photos or share the QR code with guests
          </p>
          <button onClick={() => setShowUploadModal(true)} className="btn-primary">
            Upload First Photo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-100 aspect-square"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={photo.caption || 'Wedding photo'}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-sm truncate">{photo.caption || 'No caption'}</p>
                <p className="text-white/70 text-xs">by {photo.uploadedBy}</p>
              </div>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); likePhoto(photo.id) }}
                  className="bg-white/90 rounded-full px-2 py-1 text-sm flex items-center gap-1"
                >
                  ❤️ {photo.likes}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-serif text-gray-800 mb-4">Upload Photos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your name"
                  value={uploadData.uploaderName}
                  onChange={(e) => setUploadData({ ...uploadData, uploaderName: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption (optional)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Add a caption"
                  value={uploadData.caption}
                  onChange={(e) => setUploadData({ ...uploadData, caption: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g., ceremony, reception, portraits"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({ ...uploadData, tags: e.target.value })}
                />
              </div>
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full btn-primary"
                >
                  Select Photos
                </button>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-4">
              <button onClick={() => setShowUploadModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 text-center">
            <h2 className="text-xl font-serif text-gray-800 mb-2">Share Photos QR Code</h2>
            <p className="text-sm text-gray-600 mb-4">
              Guests can scan this code to upload photos directly to your gallery
            </p>
            <div className="flex justify-center mb-4 p-4 bg-white rounded-lg">
              <QRCodeSVG value={photoUploadUrl} size={200} />
            </div>
            <p className="text-xs text-gray-400 mb-4">{photoUploadUrl}</p>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600">
                <strong>Tip:</strong> Print this QR code and place it on tables or near the photo booth!
              </p>
            </div>
            <button onClick={() => setShowQRModal(false)} className="btn-primary">Close</button>
          </div>
        </div>
      )}

      {/* Photo Viewer Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-4xl max-h-[90vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt={selectedPhoto.caption || 'Wedding photo'}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="bg-white rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  {selectedPhoto.caption && (
                    <p className="font-medium text-gray-800">{selectedPhoto.caption}</p>
                  )}
                  <p className="text-sm text-gray-500">
                    Uploaded by {selectedPhoto.uploadedBy} on{' '}
                    {format(new Date(selectedPhoto.uploadedAt), 'MMM d, yyyy')}
                  </p>
                  {selectedPhoto.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {selectedPhoto.tags.map((tag, i) => (
                        <span key={i} className="badge bg-gray-100 text-gray-600">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => likePhoto(selectedPhoto.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600"
                  >
                    ❤️ {selectedPhoto.likes}
                  </button>
                  <button
                    onClick={() => { deletePhoto(selectedPhoto.id); setSelectedPhoto(null) }}
                    className="text-gray-400 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}
