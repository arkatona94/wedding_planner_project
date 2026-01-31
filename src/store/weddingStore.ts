import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import type {
  WeddingDetails,
  ChecklistItem,
  BudgetItem,
  Guest,
  Vendor,
  Table,
  TimelineEvent,
  Photo,
  WebsiteSettings
} from '../types'

const vendorCategoryMap: Record<string, string> = {
  venue: 'Venue',
  catering: 'Catering',
  photography: 'Photography',
  videography: 'Videography',
  florist: 'Flowers',
  music: 'Music/DJ',
  officiant: 'Officiant',
  cake: 'Cake',
  rentals: 'Decor',
  transportation: 'Transportation',
  'hair-makeup': 'Hair & Makeup',
  other: 'Other'
}

interface WeddingState {
  // Wedding Details
  wedding: WeddingDetails
  setWedding: (wedding: Partial<WeddingDetails>) => void

  // Checklist
  checklist: ChecklistItem[]
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void
  updateChecklistItem: (id: string, item: Partial<ChecklistItem>) => void
  deleteChecklistItem: (id: string) => void
  toggleChecklistItem: (id: string) => void

  // Budget
  budgetItems: BudgetItem[]
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void
  deleteBudgetItem: (id: string) => void

  // Guests
  guests: Guest[]
  addGuest: (guest: Omit<Guest, 'id'>) => void
  updateGuest: (id: string, guest: Partial<Guest>) => void
  deleteGuest: (id: string) => void
  importGuests: (guests: Omit<Guest, 'id'>[]) => void

  // Vendors
  vendors: Vendor[]
  addVendor: (vendor: Omit<Vendor, 'id'>) => void
  updateVendor: (id: string, vendor: Partial<Vendor>) => void
  deleteVendor: (id: string) => void

  // Seating
  tables: Table[]
  addTable: (table: Omit<Table, 'id'>) => void
  updateTable: (id: string, table: Partial<Table>) => void
  deleteTable: (id: string) => void
  assignGuestToTable: (guestId: string, tableId: string) => void
  removeGuestFromTable: (guestId: string) => void

  // Timeline
  timelineEvents: TimelineEvent[]
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void
  updateTimelineEvent: (id: string, event: Partial<TimelineEvent>) => void
  deleteTimelineEvent: (id: string) => void

  // Photos
  photos: Photo[]
  addPhoto: (photo: Omit<Photo, 'id'>) => void
  deletePhoto: (id: string) => void
  likePhoto: (id: string) => void

  // Website
  websiteSettings: WebsiteSettings
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => void

  // Maintenance
  recalculateBudget: () => void
  populateDefaultBudget: () => void
}

const defaultWedding: WeddingDetails = {
  id: uuidv4(),
  partner1Name: '',
  partner2Name: '',
  weddingDate: '',
  venue: '',
  theme: '',
  estimatedGuests: 100,
  totalBudget: 30000
}

const defaultWebsiteSettings: WebsiteSettings = {
  enabled: false,
  url: '',
  template: 'classic',
  primaryColor: '#c97f66',
  coverPhoto: '',
  story: '',
  showRegistry: true,
  showPhotos: true,
  showRsvp: true,
  password: ''
}

// Default checklist items based on wedding planning best practices
const defaultChecklist: ChecklistItem[] = [
  { id: uuidv4(), title: 'Set wedding date', description: 'Choose your perfect wedding date', category: 'other', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Determine budget', description: 'Establish your total wedding budget', category: 'other', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Create guest list', description: 'Draft your initial guest list', category: 'other', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Book venue', description: 'Research and book your ceremony and reception venues', category: 'venue', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Hire photographer', description: 'Find and book a wedding photographer', category: 'photography', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Choose catering', description: 'Select your catering service and menu', category: 'catering', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Order invitations', description: 'Design and order wedding invitations', category: 'invitations', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Book florist', description: 'Choose flowers and book florist', category: 'flowers', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Arrange music/DJ', description: 'Book band or DJ for reception', category: 'music', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Shop for attire', description: 'Find wedding dress/suit and accessories', category: 'attire', dueDate: '', completed: false, priority: 'medium', notes: '' },
]

const defaultBudget: BudgetItem[] = [
  // Venue & Catering
  { id: uuidv4(), category: 'Venue', vendor: 'Venue Rental', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Catering', vendor: 'Catering / Food', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Catering', vendor: 'Bar & Beverages', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Cake', vendor: 'Wedding Cake & Desserts', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Decor', vendor: 'Equipment Rentals (Tables/Chairs)', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },

  // Attire & Beauty
  { id: uuidv4(), category: 'Attire', vendor: 'Wedding Dress', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Attire', vendor: 'Tuxedo / Suit', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Attire', vendor: 'Alterations', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Hair & Makeup', vendor: 'Hair & Makeup Services', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Attire', vendor: 'Wedding Rings', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },

  // Flowers & Decor
  { id: uuidv4(), category: 'Flowers', vendor: 'Florist (Bouquets & Ceremony)', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Flowers', vendor: 'Reception Centerpieces', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Decor', vendor: 'Lighting & Decor Extras', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },

  // Photography & Videography
  { id: uuidv4(), category: 'Photography', vendor: 'Photographer', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Videography', vendor: 'Videographer', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Photography', vendor: 'Photo Booth', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },

  // Music & Entertainment
  { id: uuidv4(), category: 'Music/DJ', vendor: 'DJ / Band', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Music/DJ', vendor: 'Ceremony Musicians', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },

  // Stationery
  { id: uuidv4(), category: 'Invitations', vendor: 'Invitations & Save the Dates', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Invitations', vendor: 'Postage & Stationery', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },

  // Transportation & Travel
  { id: uuidv4(), category: 'Transportation', vendor: 'Wedding Day Transportation', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Transportation', vendor: 'Guest Shuttles', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Other', vendor: 'Hotel Accommodations', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },

  // Legal & Planning
  { id: uuidv4(), category: 'Officiant', vendor: 'Marriage License & Officiant', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Other', vendor: 'Wedding Planner / Coordinator', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Favors', vendor: 'Wedding Favors & Gifts', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Other', vendor: 'Rehearsal Dinner', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '' },
  { id: uuidv4(), category: 'Other', vendor: 'Contingency Fund', estimatedCost: 0, actualCost: 0, paid: 0, dueDate: '', notes: '10% of total budget' },
]

export const useWeddingStore = create<WeddingState>()(
  persist(
    (set) => ({
      // Wedding Details
      wedding: defaultWedding,
      setWedding: (updates) =>
        set((state) => ({ wedding: { ...state.wedding, ...updates } })),

      // Checklist
      checklist: defaultChecklist,
      addChecklistItem: (item) =>
        set((state) => ({
          checklist: [...state.checklist, { ...item, id: uuidv4() }]
        })),
      updateChecklistItem: (id, updates) =>
        set((state) => ({
          checklist: state.checklist.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        })),
      deleteChecklistItem: (id) =>
        set((state) => ({
          checklist: state.checklist.filter((item) => item.id !== id)
        })),
      toggleChecklistItem: (id) =>
        set((state) => ({
          checklist: state.checklist.map((item) =>
            item.id === id ? { ...item, completed: !item.completed } : item
          )
        })),

      // Budget
      budgetItems: defaultBudget,
      addBudgetItem: (item) =>
        set((state) => ({
          budgetItems: [...state.budgetItems, { ...item, id: uuidv4() }]
        })),
      updateBudgetItem: (id, updates) =>
        set((state) => ({
          budgetItems: state.budgetItems.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )
        })),
      deleteBudgetItem: (id) =>
        set((state) => ({
          budgetItems: state.budgetItems.filter((item) => item.id !== id)
        })),

      // Guests
      guests: [],
      addGuest: (guest) =>
        set((state) => ({
          guests: [...state.guests, { ...guest, id: uuidv4() }]
        })),
      updateGuest: (id, updates) =>
        set((state) => ({
          guests: state.guests.map((guest) =>
            guest.id === id ? { ...guest, ...updates } : guest
          )
        })),
      deleteGuest: (id) =>
        set((state) => ({
          guests: state.guests.filter((guest) => guest.id !== id)
        })),
      importGuests: (newGuests) =>
        set((state) => ({
          guests: [
            ...state.guests,
            ...newGuests.map((guest) => ({ ...guest, id: uuidv4() }))
          ]
        })),

      // Vendors
      vendors: [],
      addVendor: (vendor) =>
        set((state) => {
          const newVendorId = uuidv4()
          const newVendor = { ...vendor, id: newVendorId }

          // Create corresponding budget item
          const budgetCategory = vendorCategoryMap[vendor.category] || 'Other'
          const newBudgetItem: BudgetItem = {
            id: uuidv4(),
            category: budgetCategory,
            vendor: vendor.name,
            vendorId: newVendorId,
            estimatedCost: vendor.price || 0,
            actualCost: vendor.contracted ? (vendor.price || 0) : 0,
            paid: vendor.depositPaid ? (vendor.depositAmount || 0) : 0,
            dueDate: '',
            notes: `Generated from Vendor: ${vendor.name}`
          }

          return {
            vendors: [...state.vendors, newVendor],
            budgetItems: [...state.budgetItems, newBudgetItem]
          }
        }),
      updateVendor: (id, updates) =>
        set((state) => {
          const updatedVendors = state.vendors.map((vendor) =>
            vendor.id === id ? { ...vendor, ...updates } : vendor
          )
          const updatedVendor = updatedVendors.find(v => v.id === id)

          let updatedBudgetItems = state.budgetItems
          if (updatedVendor) {
            updatedBudgetItems = state.budgetItems.map(item => {
              if (item.vendorId === id) {
                const budgetCategory = vendorCategoryMap[updatedVendor.category] || 'Other'
                return {
                  ...item,
                  category: budgetCategory,
                  vendor: updatedVendor.name,
                  estimatedCost: updatedVendor.price || 0,
                  actualCost: updatedVendor.contracted ? (updatedVendor.price || 0) : 0,
                  paid: updatedVendor.depositPaid ? (updatedVendor.depositAmount || 0) : 0
                }
              }
              return item
            })
          }

          return {
            vendors: updatedVendors,
            budgetItems: updatedBudgetItems
          }
        }),
      deleteVendor: (id) =>
        set((state) => ({
          vendors: state.vendors.filter((vendor) => vendor.id !== id),
          budgetItems: state.budgetItems.filter(item => item.vendorId !== id)
        })),

      // Seating
      tables: [],
      addTable: (table) =>
        set((state) => ({
          tables: [...state.tables, { ...table, id: uuidv4() }]
        })),
      updateTable: (id, updates) =>
        set((state) => ({
          tables: state.tables.map((table) =>
            table.id === id ? { ...table, ...updates } : table
          )
        })),
      deleteTable: (id) =>
        set((state) => ({
          tables: state.tables.filter((table) => table.id !== id)
        })),
      assignGuestToTable: (guestId, tableId) =>
        set((state) => ({
          tables: state.tables.map((table) => {
            if (table.id === tableId) {
              return { ...table, guests: [...table.guests, guestId] }
            }
            return { ...table, guests: table.guests.filter((id) => id !== guestId) }
          }),
          guests: state.guests.map((guest) =>
            guest.id === guestId ? { ...guest, tableAssignment: tableId } : guest
          )
        })),
      removeGuestFromTable: (guestId) =>
        set((state) => ({
          tables: state.tables.map((table) => ({
            ...table,
            guests: table.guests.filter((id) => id !== guestId)
          })),
          guests: state.guests.map((guest) =>
            guest.id === guestId ? { ...guest, tableAssignment: null } : guest
          )
        })),

      // Timeline
      timelineEvents: [],
      addTimelineEvent: (event) =>
        set((state) => ({
          timelineEvents: [...state.timelineEvents, { ...event, id: uuidv4() }]
        })),
      updateTimelineEvent: (id, updates) =>
        set((state) => ({
          timelineEvents: state.timelineEvents.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          )
        })),
      deleteTimelineEvent: (id) =>
        set((state) => ({
          timelineEvents: state.timelineEvents.filter((event) => event.id !== id)
        })),

      // Photos
      photos: [],
      addPhoto: (photo) =>
        set((state) => ({
          photos: [...state.photos, { ...photo, id: uuidv4() }]
        })),
      deletePhoto: (id) =>
        set((state) => ({
          photos: state.photos.filter((photo) => photo.id !== id)
        })),
      likePhoto: (id) =>
        set((state) => ({
          photos: state.photos.map((photo) =>
            photo.id === id ? { ...photo, likes: photo.likes + 1 } : photo
          )
        })),

      // Website
      websiteSettings: defaultWebsiteSettings,
      updateWebsiteSettings: (updates) =>
        set((state) => ({
          websiteSettings: { ...state.websiteSettings, ...updates }
        })),

      // Maintenance
      recalculateBudget: () =>
        set((state) => {
          const vendors = state.vendors
          let currentBudgetItems = state.budgetItems

          // 1. Update/Add items for all existing vendors
          const vendorBudgetItems = vendors.map((vendor) => {
            const budgetCategory = vendorCategoryMap[vendor.category] || 'Other'
            const existingItem = currentBudgetItems.find(item => item.vendorId === vendor.id)

            return {
              id: existingItem?.id || uuidv4(),
              category: budgetCategory,
              vendor: vendor.name,
              vendorId: vendor.id,
              estimatedCost: vendor.price || 0,
              actualCost: vendor.contracted ? (vendor.price || 0) : 0,
              paid: vendor.depositPaid ? (vendor.depositAmount || 0) : 0,
              dueDate: existingItem?.dueDate || '',
              notes: existingItem?.notes || `Generated from Vendor: ${vendor.name}`
            }
          })

          // 2. Keep manual budget items (those without a vendorId)
          const manualBudgetItems = currentBudgetItems.filter(item => !item.vendorId)

          // 3. Remove duplicates (in case logic failed before) by keeping only the mapping we just built
          return {
            budgetItems: [...manualBudgetItems, ...vendorBudgetItems]
          }
        }),
      populateDefaultBudget: () =>
        set(() => ({
          budgetItems: defaultBudget
        }))
    }),
    {
      name: 'wedding-planner-storage'
    }
  )
)
