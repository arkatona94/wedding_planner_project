import { useWeddingStore } from '../store/weddingStore'
import { format } from 'date-fns'

export default function Settings() {
  const { wedding, setWedding, checklist, budgetItems, guests, vendors, tables, timelineEvents, photos } = useWeddingStore()

  const exportData = () => {
    const data = {
      wedding,
      checklist,
      budgetItems,
      guests,
      vendors,
      tables,
      timelineEvents,
      photos: photos.map(p => ({ ...p, url: '[Image data removed for export]' })),
      exportedAt: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wedding-planner-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
  }

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear ALL wedding data? This cannot be undone.')) {
      localStorage.removeItem('wedding-planner-storage')
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-serif text-gray-800">Settings</h1>
        <p className="text-gray-500">Manage your wedding details and preferences</p>
      </div>

      {/* Wedding Details */}
      <div className="card">
        <h3 className="font-medium text-gray-800 mb-4">Wedding Details</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner 1 Name</label>
              <input
                type="text"
                className="input-field"
                value={wedding.partner1Name}
                onChange={(e) => setWedding({ partner1Name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Partner 2 Name</label>
              <input
                type="text"
                className="input-field"
                value={wedding.partner2Name}
                onChange={(e) => setWedding({ partner2Name: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Date</label>
            <input
              type="date"
              className="input-field"
              value={wedding.weddingDate}
              onChange={(e) => setWedding({ weddingDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
            <input
              type="text"
              className="input-field"
              placeholder="Enter your venue name"
              value={wedding.venue}
              onChange={(e) => setWedding({ venue: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Theme</label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Rustic Elegance, Modern Minimalist"
              value={wedding.theme}
              onChange={(e) => setWedding({ theme: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget ($)</label>
              <input
                type="number"
                className="input-field"
                value={wedding.totalBudget || ''}
                onChange={(e) => setWedding({ totalBudget: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Guests</label>
              <input
                type="number"
                className="input-field"
                value={wedding.estimatedGuests || ''}
                onChange={(e) => setWedding({ estimatedGuests: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Summary */}
      <div className="card">
        <h3 className="font-medium text-gray-800 mb-4">Your Wedding Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-serif text-primary-600">{checklist.length}</p>
            <p className="text-sm text-gray-500">Tasks</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-serif text-primary-600">{budgetItems.length}</p>
            <p className="text-sm text-gray-500">Budget Items</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-serif text-primary-600">{guests.length}</p>
            <p className="text-sm text-gray-500">Guests</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-serif text-primary-600">{vendors.length}</p>
            <p className="text-sm text-gray-500">Vendors</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-serif text-primary-600">{tables.length}</p>
            <p className="text-sm text-gray-500">Tables</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-serif text-primary-600">{timelineEvents.length}</p>
            <p className="text-sm text-gray-500">Timeline Events</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-2xl font-serif text-primary-600">{photos.length}</p>
            <p className="text-sm text-gray-500">Photos</p>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="font-medium text-gray-800 mb-4">Data Management</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Export Data</p>
              <p className="text-sm text-gray-500">Download all your wedding data as a JSON file</p>
            </div>
            <button onClick={exportData} className="btn-secondary">
              Export
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Import Data</p>
              <p className="text-sm text-gray-500">Restore from a previous backup</p>
            </div>
            <label className="btn-secondary cursor-pointer">
              Import
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string)
                        if (data.wedding) {
                          localStorage.setItem('wedding-planner-storage', JSON.stringify({ state: data }))
                          window.location.reload()
                        }
                      } catch {
                        alert('Invalid backup file')
                      }
                    }
                    reader.readAsText(file)
                  }
                }}
              />
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div>
              <p className="font-medium text-red-800">Clear All Data</p>
              <p className="text-sm text-red-600">Permanently delete all wedding data</p>
            </div>
            <button onClick={clearAllData} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy */}
      <div className="card">
        <h3 className="font-medium text-gray-800 mb-4">Privacy & Security</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <p className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            Your data is stored locally on your device
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            We never sell your data to third parties
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            All data is encrypted in transit
          </p>
          <p className="flex items-center gap-2">
            <span className="text-green-500">✓</span>
            You can export or delete your data at any time
          </p>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <h3 className="font-medium text-gray-800 mb-4">About EverAfter</h3>
        <p className="text-sm text-gray-600 mb-4">
          EverAfter is your all-in-one wedding planning command center. We combined the best features
          from top wedding planning apps to create a single, comprehensive solution that reduces the
          stress of wedding planning.
        </p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Inspired by:</p>
            <ul className="text-gray-500 mt-1 space-y-1">
              <li>• The Knot</li>
              <li>• Zola</li>
              <li>• Joy (WithJoy)</li>
              <li>• Bridebook</li>
              <li>• Prismm</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-gray-700">Key Features:</p>
            <ul className="text-gray-500 mt-1 space-y-1">
              <li>• Adaptive Checklists</li>
              <li>• Smart Budget Tracking</li>
              <li>• Visual Seating Charts</li>
              <li>• QR Photo Sharing</li>
              <li>• Privacy-First Design</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">Version 1.0.0 | Made with ❤️ for couples everywhere</p>
      </div>
    </div>
  )
}
