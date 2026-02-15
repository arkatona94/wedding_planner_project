import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { format } from 'date-fns'

const templates = [
  { id: 'classic', name: 'Classic Elegance', preview: 'Timeless design with serif fonts' },
  { id: 'modern', name: 'Modern Minimal', preview: 'Clean lines and sans-serif typography' },
  { id: 'romantic', name: 'Romantic Garden', preview: 'Floral accents and soft colors' },
  { id: 'rustic', name: 'Rustic Charm', preview: 'Warm tones and natural textures' },
]

const colorOptions = [
  { value: '#c97f66', label: 'Rose' },
  { value: '#9dc183', label: 'Sage' },
  { value: '#d4af37', label: 'Gold' },
  { value: '#6b7280', label: 'Slate' },
  { value: '#1e3a5f', label: 'Navy' },
  { value: '#7c3aed', label: 'Purple' },
]

export default function Website() {
  const { wedding, websiteSettings, updateWebsiteSettings } = useWeddingStore()
  const [activeTab, setActiveTab] = useState<'design' | 'content' | 'settings'>('design')
  const [showPreview, setShowPreview] = useState(false)

  const websiteUrl = websiteSettings.url || `${wedding.partner1Name?.toLowerCase() || 'partner1'}-and-${wedding.partner2Name?.toLowerCase() || 'partner2'}.beginnings-and-endings.com`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Link to="/" className="hover:text-primary-600 transition-colors">Dashboard</Link>
            <span>/</span>
            <span className="text-gray-400">Website</span>
          </div>
          <h1 className="text-2xl font-serif text-gray-800">Wedding Website</h1>
          <p className="text-gray-500">Create your personalized wedding website</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowPreview(true)} className="btn-secondary">Preview</button>
          <button
            onClick={() => updateWebsiteSettings({ enabled: !websiteSettings.enabled })}
            className={websiteSettings.enabled ? 'btn-primary' : 'btn-secondary'}
          >
            {websiteSettings.enabled ? 'Published' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className={`card ${websiteSettings.enabled ? 'bg-green-50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">
              {websiteSettings.enabled ? 'Your website is live!' : 'Your website is not published yet'}
            </p>
            <p className="text-sm text-gray-500">{websiteUrl}</p>
          </div>
          {websiteSettings.enabled && (
            <a
              href={`https://${websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:underline"
            >
              Visit Site →
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['design', 'content', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === tab
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Design Tab */}
      {activeTab === 'design' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Choose a Template</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => updateWebsiteSettings({ template: template.id })}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${websiteSettings.template === template.id
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="h-24 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
                    Preview
                  </div>
                  <h4 className="font-medium text-gray-800">{template.name}</h4>
                  <p className="text-sm text-gray-500">{template.preview}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Primary Color</h3>
            <div className="flex gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateWebsiteSettings({ primaryColor: color.value })}
                  className={`w-12 h-12 rounded-full border-4 transition-all ${websiteSettings.primaryColor === color.value
                    ? 'border-gray-800 scale-110'
                    : 'border-transparent hover:scale-105'
                    }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Your Love Story</h3>
            <textarea
              className="input-field"
              rows={6}
              placeholder="Share how you met, your journey together, and what makes your love special..."
              value={websiteSettings.story}
              onChange={(e) => updateWebsiteSettings({ story: e.target.value })}
            />
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Cover Photo</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
              {websiteSettings.coverPhoto ? (
                <div className="relative inline-block">
                  <img
                    src={websiteSettings.coverPhoto}
                    alt="Cover"
                    className="max-h-48 rounded-lg"
                  />
                  <button
                    onClick={() => updateWebsiteSettings({ coverPhoto: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-500 mb-2">Drag and drop an image or</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="cover-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        const reader = new FileReader()
                        reader.onload = (event) => {
                          updateWebsiteSettings({ coverPhoto: event.target?.result as string })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                  <label htmlFor="cover-upload" className="btn-secondary cursor-pointer">
                    Choose File
                  </label>
                </>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Sections to Display</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Photo Gallery</span>
                <input
                  type="checkbox"
                  checked={websiteSettings.showPhotos}
                  onChange={(e) => updateWebsiteSettings({ showPhotos: e.target.checked })}
                  className="w-5 h-5 text-primary-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Gift Registry</span>
                <input
                  type="checkbox"
                  checked={websiteSettings.showRegistry}
                  onChange={(e) => updateWebsiteSettings({ showRegistry: e.target.checked })}
                  className="w-5 h-5 text-primary-500"
                />
              </label>
              <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">Online RSVP</span>
                <input
                  type="checkbox"
                  checked={websiteSettings.showRsvp}
                  onChange={(e) => updateWebsiteSettings({ showRsvp: e.target.checked })}
                  className="w-5 h-5 text-primary-500"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Website URL</h3>
            <div className="flex gap-2">
              <span className="flex items-center px-3 bg-gray-100 rounded-l-lg text-gray-500 text-sm">
                https://
              </span>
              <input
                type="text"
                className="input-field flex-1 rounded-l-none"
                placeholder="yournames.beginnings-and-endings.com"
                value={websiteSettings.url}
                onChange={(e) => updateWebsiteSettings({ url: e.target.value })}
              />
            </div>
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Password Protection</h3>
            <p className="text-sm text-gray-500 mb-3">
              Optionally protect your website with a password
            </p>
            <input
              type="text"
              className="input-field"
              placeholder="Leave empty for public access"
              value={websiteSettings.password}
              onChange={(e) => updateWebsiteSettings({ password: e.target.value })}
            />
          </div>

          <div className="card">
            <h3 className="font-medium text-gray-800 mb-4">Privacy</h3>
            <p className="text-sm text-gray-600 mb-4">
              Your privacy is important to us. We never sell your data to third parties.
              All information is stored securely and only used for your wedding planning.
            </p>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800 font-medium">
                ✓ Privacy-First Policy: Your data is yours alone
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Preview Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-4 flex items-center justify-between">
              <h2 className="font-medium text-gray-800">Website Preview</h2>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                Close ×
              </button>
            </div>

            {/* Preview Content */}
            <div style={{ backgroundColor: websiteSettings.primaryColor + '10' }}>
              {/* Hero */}
              <div
                className="relative h-96 flex items-center justify-center text-center"
                style={{
                  backgroundColor: websiteSettings.coverPhoto ? 'transparent' : websiteSettings.primaryColor,
                  backgroundImage: websiteSettings.coverPhoto ? `url(${websiteSettings.coverPhoto})` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                <div className={websiteSettings.coverPhoto ? 'bg-black/40 absolute inset-0' : ''} />
                <div className="relative z-10 text-white">
                  <h1 className="text-5xl font-serif mb-2">
                    {wedding.partner1Name || 'Partner 1'} & {wedding.partner2Name || 'Partner 2'}
                  </h1>
                  <p className="text-xl opacity-90">
                    {wedding.weddingDate
                      ? format(new Date(wedding.weddingDate), 'MMMM d, yyyy')
                      : 'Wedding Date'}
                  </p>
                  {wedding.venue && (
                    <p className="mt-2 opacity-75">{wedding.venue}</p>
                  )}
                </div>
              </div>

              {/* Story */}
              {websiteSettings.story && (
                <div className="max-w-2xl mx-auto py-16 px-4 text-center">
                  <h2 className="text-3xl font-serif mb-6" style={{ color: websiteSettings.primaryColor }}>
                    Our Story
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                    {websiteSettings.story}
                  </p>
                </div>
              )}

              {/* RSVP Section */}
              {websiteSettings.showRsvp && (
                <div className="py-16 px-4 text-center" style={{ backgroundColor: websiteSettings.primaryColor + '15' }}>
                  <h2 className="text-3xl font-serif mb-4" style={{ color: websiteSettings.primaryColor }}>
                    RSVP
                  </h2>
                  <p className="text-gray-600 mb-6">We can't wait to celebrate with you!</p>
                  <button
                    className="px-8 py-3 rounded-lg text-white font-medium"
                    style={{ backgroundColor: websiteSettings.primaryColor }}
                  >
                    Respond Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
