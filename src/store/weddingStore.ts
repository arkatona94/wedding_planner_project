import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '../lib/supabase'
import { fileToCompressedDataUrl, dataUrlToFile } from '../lib/imageUtils'
import type {
  WeddingDetails,
  ChecklistItem,
  BudgetItem,
  Guest,
  Vendor,
  Table,
  TimelineEvent,
  Photo,
  WebsiteSettings,
  AppSettings,
  Notification,
  RoomElement,
  InspirationBoard,
  InspirationImage,
  AuthUser
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
  setChecklist: (items: ChecklistItem[]) => void
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void
  updateChecklistItem: (id: string, item: Partial<ChecklistItem>) => void
  deleteChecklistItem: (id: string) => void
  toggleChecklistItem: (id: string) => void

  // Budget
  budgetItems: BudgetItem[]
  setBudgetItems: (items: BudgetItem[]) => void
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void
  updateBudgetItem: (id: string, item: Partial<BudgetItem>) => void
  deleteBudgetItem: (id: string) => void

  // Guests
  guests: Guest[]
  setGuests: (items: Guest[]) => void
  addGuest: (guest: Omit<Guest, 'id'>) => void
  updateGuest: (id: string, guest: Partial<Guest>) => void
  deleteGuest: (id: string) => void
  importGuests: (guests: Omit<Guest, 'id'>[]) => void
  updateGuestCommunication: (id: string, type: 'saveTheDate' | 'reminder') => void

  // Vendors
  vendors: Vendor[]
  setVendors: (items: Vendor[]) => void
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

  // Room Elements
  roomElements: RoomElement[]
  addRoomElement: (element: Omit<RoomElement, 'id'>) => void
  updateRoomElement: (id: string, element: Partial<RoomElement>) => void
  deleteRoomElement: (id: string) => void
  resetFloorPlan: () => void

  // Timeline
  timelineEvents: TimelineEvent[]
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void
  updateTimelineEvent: (id: string, event: Partial<TimelineEvent>, autoShift?: boolean) => void
  deleteTimelineEvent: (id: string) => void
  shiftTimelineEvents: (id: string, minutes: number) => void
  applyTimelineTemplate: () => void

  // Photos
  photos: Photo[]
  setPhotos: (photos: Photo[]) => void
  addPhoto: (photo: Omit<Photo, 'id'>) => Promise<void>
  deletePhoto: (id: string) => Promise<void>
  likePhoto: (id: string) => Promise<void>

  // Website
  websiteSettings: WebsiteSettings
  updateWebsiteSettings: (settings: Partial<WebsiteSettings>) => void

  // App Settings
  appSettings: AppSettings
  setDarkMode: (enabled: boolean) => void
  updateAppSettings: (settings: Partial<AppSettings>) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'dismissed'>) => void
  markNotificationRead: (id: string) => void
  dismissNotification: (id: string) => void
  clearAllNotifications: () => void
  getActiveNotifications: () => Notification[]

  // Inspiration Boards
  inspirationBoards: InspirationBoard[]
  setInspirationBoards: (boards: InspirationBoard[]) => void
  addInspirationBoard: (board: Omit<InspirationBoard, 'id' | 'createdAt' | 'updatedAt' | 'images'>) => Promise<void>
  updateInspirationBoard: (id: string, board: Partial<InspirationBoard>) => Promise<void>
  deleteInspirationBoard: (id: string) => Promise<void>
  addImageToBoard: (boardId: string, image: Omit<InspirationImage, 'id' | 'addedAt'>) => Promise<void>
  updateBoardImage: (boardId: string, imageId: string, updates: Partial<InspirationImage>) => Promise<void>
  removeImageFromBoard: (boardId: string, imageId: string) => Promise<void>
  reorderBoardImages: (boardId: string, imageIds: string[]) => Promise<void>

  // Storage
  uploadFile: (bucket: 'photos' | 'inspiration', file: File, path?: string) => Promise<string | null>

  // User & Auth
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  updateUser: (updates: Partial<AuthUser>) => Promise<void>
  signOut: () => Promise<void>
  resetStore: () => void

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
  totalBudget: 30000,
  ceremonyVenue: '',
  ceremonyAddress: '',
  ceremonyLink: '',
  ceremonyTime: '',
  receptionVenue: '',
  receptionAddress: '',
  receptionTime: '',
  sameLocation: false,
  timelineStartTime: '08:00',
  timelineEndTime: '23:00'
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

const defaultAppSettings: AppSettings = {
  darkMode: false,
  notifications: {
    enableInApp: true,
    paymentReminderDays: [7, 3, 1],
    taskReminderDays: [3, 1],
    rsvpReminderEnabled: true,
    budgetAlertThresholds: [80, 90, 100]
  },
  enabledModules: ['dashboard', 'checklist', 'budget'],
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  replicateApiToken: import.meta.env.VITE_REPLICATE_API_TOKEN || '',
  fashnApiKey: import.meta.env.VITE_FASHN_API_KEY || ''
}

// Default checklist items based on wedding planning best practices
const defaultChecklist: ChecklistItem[] = [
  // 12+ Months Before
  { id: uuidv4(), title: 'Determine wedding budget', description: 'Establish your total budget and how it will be spent', category: 'other', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Draft guest list', description: 'Create a preliminary list of guests to determine venue size', category: 'other', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Book ceremony & reception venues', description: 'Research and secure locations for your wedding', category: 'venue', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Hire wedding planner (if needed)', description: 'Decide if you want professional help for planning', category: 'other', dueDate: '', completed: false, priority: 'medium', notes: '' },

  // 9-11 Months Before
  { id: uuidv4(), title: 'Hire photographer & videographer', description: 'Secure your visual storytellers early', category: 'photography', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Choose catering & menu', description: 'Select your food service and begin menu planning', category: 'catering', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Shop for wedding attire', description: 'Start looking for the perfect dress or suit', category: 'attire', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Select wedding party', description: 'Ask your closest friends to be part of your day', category: 'other', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Create wedding website', description: 'Build a central hub for guest information', category: 'other', dueDate: '', completed: false, priority: 'low', notes: '' },

  // 6-8 Months Before
  { id: uuidv4(), title: 'Order save-the-dates', description: 'Design and send your initial announcement', category: 'invitations', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Book florist', description: 'Design your floral arrangements and book a florist', category: 'flowers', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Arrange music & entertainment', description: 'Book your DJ, band, or ceremony musicians', category: 'music', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Book hotel blocks', description: 'Reserve rooms for out-of-town guests', category: 'other', dueDate: '', completed: false, priority: 'low', notes: '' },
  { id: uuidv4(), title: 'Register for gifts', description: 'Choose items for your wedding registry', category: 'other', dueDate: '', completed: false, priority: 'low', notes: '' },

  // 4-5 Months Before
  { id: uuidv4(), title: 'Order wedding cake', description: 'Attend tastings and choose your cake design', category: 'catering', dueDate: '', completed: false, priority: 'low', notes: '' },
  { id: uuidv4(), title: 'Book transportation', description: 'Arrange limos, shuttles, or getaway cars', category: 'transportation', dueDate: '', completed: false, priority: 'low', notes: '' },
  { id: uuidv4(), title: 'Purchase wedding rings', description: 'Select and order your wedding bands', category: 'attire', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Book hair & makeup artists', description: 'Schedule trials and secure your glam team', category: 'other', dueDate: '', completed: false, priority: 'medium', notes: '' },

  // 2-3 Months Before
  { id: uuidv4(), title: 'Mail formal invitations', description: 'Send out your invitations and track RSVPs', category: 'invitations', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Order wedding favors', description: 'Choose small gifts for your guests', category: 'other', dueDate: '', completed: false, priority: 'low', notes: '' },
  { id: uuidv4(), title: 'Apply for marriage license', description: 'Check local seasonal requirements for the license', category: 'other', dueDate: '', completed: false, priority: 'high', notes: '' },

  // 1 Month Before
  { id: uuidv4(), title: 'Finalize seating chart', description: 'Assign guests to tables for the reception', category: 'other', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Write wedding vows', description: 'Personalize your ceremony with your own words', category: 'other', dueDate: '', completed: false, priority: 'high', notes: '' },
  { id: uuidv4(), title: 'Confirm details with vendors', description: 'Double-check times and requirements with everyone', category: 'other', dueDate: '', completed: false, priority: 'medium', notes: '' },
  { id: uuidv4(), title: 'Organize rehearsal dinner', description: 'Finalize counts and details for the rehearsal', category: 'other', dueDate: '', completed: false, priority: 'medium', notes: '' },
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
    (set, get) => ({
      // User & Auth
      user: null,
      setUser: (user) => {
        const state = get()
        // If user changed or logging out, reset wedding data
        if (state.user?.id !== user?.id) {
          state.resetStore()
        }
        set({ user })
      },
      updateUser: async (updates) => {
        const state = get()
        if (!state.user) return

        // Update local state
        set({ user: { ...state.user, ...updates } })

        // Sync to Supabase profiles table
        const dbUpdates: Record<string, any> = {}
        if (updates.name !== undefined) dbUpdates.full_name = updates.name
        if (updates.city !== undefined) dbUpdates.city = updates.city
        if (updates.state !== undefined) dbUpdates.state = updates.state
        if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode

        if (Object.keys(dbUpdates).length > 0) {
          const { error } = await supabase
            .from('profiles')
            .update(dbUpdates)
            .eq('id', state.user.id)

          if (error) console.error('Error updating user profile:', error)
        }
      },
      signOut: async () => {
        try {
          // Attempt a clean sign out from Supabase
          const { error } = await supabase.auth.signOut()
          if (error) console.warn('Supabase sign out error:', error)
        } catch (err) {
          console.error('Failed to sign out from Supabase:', err)
        } finally {
          const state = get()
          state.resetStore()
          set({ user: null })

          // Clear persistence and force a hard reload to the login page
          // This ensures any broken auth loops are broken
          localStorage.removeItem('wedding-planner-storage')
          window.location.href = '/login'
        }
      },

      resetStore: () => {
        set({
          wedding: defaultWedding,
          checklist: defaultChecklist,
          budgetItems: defaultBudget,
          guests: [],
          vendors: [],
          tables: [],
          roomElements: [],
          timelineEvents: [],
          photos: [],
          inspirationBoards: [],
          websiteSettings: defaultWebsiteSettings,
          notifications: []
        })
      },

      // Wedding Details
      wedding: defaultWedding,
      setWedding: (updates) =>
        set((state) => ({ wedding: { ...state.wedding, ...updates } })),

      // Checklist
      checklist: defaultChecklist,
      setChecklist: (checklist) => set({ checklist }),
      addChecklistItem: (item) =>
        set((state) => {
          const newItem = { ...item, id: uuidv4() }
          const weddingId = state.wedding.id

          if (state.user && weddingId) {
            supabase
              .from('checklist_items')
              .insert({
                id: newItem.id,
                wedding_id: weddingId,
                title: newItem.title,
                description: newItem.description,
                category: newItem.category,
                due_date: newItem.dueDate || null,
                completed: newItem.completed,
                priority: newItem.priority
              })
              .then(({ error }) => {
                if (error) console.error('Error adding checklist item to Supabase:', error)
              })
          }

          return { checklist: [...state.checklist, newItem] }
        }),
      updateChecklistItem: (id, updates) =>
        set((state) => {
          const newChecklist = state.checklist.map((item) =>
            item.id === id ? { ...item, ...updates } : item
          )

          if (state.user) {
            const dbUpdates: any = {}
            if (updates.title !== undefined) dbUpdates.title = updates.title
            if (updates.description !== undefined) dbUpdates.description = updates.description
            if (updates.category !== undefined) dbUpdates.category = updates.category
            if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate || null
            if (updates.completed !== undefined) dbUpdates.completed = updates.completed
            if (updates.priority !== undefined) dbUpdates.priority = updates.priority

            supabase
              .from('checklist_items')
              .update(dbUpdates)
              .eq('id', id)
              .then(({ error }) => {
                if (error) console.error('Error updating checklist item in Supabase:', error)
              })
          }

          return { checklist: newChecklist }
        }),
      deleteChecklistItem: (id) =>
        set((state) => {
          if (state.user) {
            supabase
              .from('checklist_items')
              .delete()
              .eq('id', id)
              .then(({ error }) => {
                if (error) console.error('Error deleting checklist item from Supabase:', error)
              })
          }
          return { checklist: state.checklist.filter((item) => item.id !== id) }
        }),
      toggleChecklistItem: (id) =>
        set((state) => {
          const item = state.checklist.find(i => i.id === id)
          if (!item) return state

          const newCompleted = !item.completed

          if (state.user) {
            supabase
              .from('checklist_items')
              .update({ completed: newCompleted })
              .eq('id', id)
              .then(({ error }) => {
                if (error) console.error('Error toggling checklist item in Supabase:', error)
              })
          }

          return {
            checklist: state.checklist.map((item) =>
              item.id === id ? { ...item, completed: newCompleted } : item
            )
          }
        }),

      // Budget
      budgetItems: defaultBudget,
      setBudgetItems: (budgetItems) => set({ budgetItems }),
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
      setGuests: (guests) => set({ guests }),
      addGuest: (guest) =>
        set((state) => {
          // Generate 8-character alphanumeric invite code
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Removed confusing chars: 0, O, I, 1
          const inviteCode = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')

          return {
            guests: [...state.guests, {
              ...guest,
              id: uuidv4(),
              inviteCode,
              partyMembers: guest.partyMembers || []
            }]
          }
        }),
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
      updateGuestCommunication: (id, type) =>
        set((state) => {
          const now = new Date().toISOString()
          const updates = {
            [type === 'saveTheDate' ? 'save_the_date_sent' : 'reminder_sent']: true,
            last_communication_at: now
          }

          if (state.user) {
            supabase
              .from('guests')
              .update(updates)
              .eq('id', id)
              .then(({ error }) => {
                if (error) console.error('Error updating guest communication in Supabase:', error)
              })
          }

          return {
            guests: state.guests.map((guest) =>
              guest.id === id
                ? {
                  ...guest,
                  [type === 'saveTheDate' ? 'saveTheDateSent' : 'reminderSent']: true,
                  lastCommunicationAt: now
                }
                : guest
            )
          }
        }),

      // Vendors
      vendors: [],
      setVendors: (vendors) => set({ vendors }),
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

      // Room Elements
      roomElements: [],
      addRoomElement: (element) =>
        set((state) => ({
          roomElements: [...state.roomElements, { ...element, id: uuidv4() }]
        })),
      updateRoomElement: (id, updates) =>
        set((state) => ({
          roomElements: state.roomElements.map((el) =>
            el.id === id ? { ...el, ...updates } : el
          )
        })),
      deleteRoomElement: (id) =>
        set((state) => ({
          roomElements: state.roomElements.filter((el) => el.id !== id)
        })),
      resetFloorPlan: () =>
        set((state) => ({
          tables: state.tables.map(t => ({ ...t, guests: [] })), // Unseat everyone
          guests: state.guests.map(g => ({ ...g, tableAssignment: null })), // Clear assignments
          roomElements: [] // Clear all decor
        })),

      // Timeline
      timelineEvents: [],
      addTimelineEvent: (event) =>
        set((state) => ({
          timelineEvents: [...state.timelineEvents, { ...event, id: uuidv4() }]
        })),
      updateTimelineEvent: (id, updates, autoShift = false) =>
        set((state) => {
          const oldEvent = state.timelineEvents.find(e => e.id === id)
          if (!oldEvent) return state

          // Helper to convert time string to minutes
          const toMins = (t: string) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
          }

          // Helper to convert minutes to time string
          const fromMins = (m: number) => {
            const hh = Math.floor(m / 60).toString().padStart(2, '0')
            const mm = (m % 60).toString().padStart(2, '0')
            return `${hh}:${mm}`
          }

          let newEvents = state.timelineEvents.map((event) =>
            event.id === id ? { ...event, ...updates } : event
          )

          if (autoShift) {
            // Sort events by startTime to process them in chronological order
            // We only need to shift events that start at or after the modified event
            newEvents.sort((a, b) => toMins(a.startTime) - toMins(b.startTime))

            const updatedIndex = newEvents.findIndex(e => e.id === id)

            // Iterate forward from the updated event and push subsequent events if they overlap
            for (let i = updatedIndex; i < newEvents.length - 1; i++) {
              const current = newEvents[i]
              const next = newEvents[i + 1]

              const currentEnd = toMins(current.endTime)
              const nextStart = toMins(next.startTime)

              if (currentEnd > nextStart) {
                const duration = toMins(next.endTime) - nextStart
                const newNextStart = currentEnd
                const newNextEnd = newNextStart + duration

                newEvents[i + 1] = {
                  ...next,
                  startTime: fromMins(newNextStart),
                  endTime: fromMins(newNextEnd)
                }
              }
            }
          }

          return { timelineEvents: newEvents }
        }),
      deleteTimelineEvent: (id) =>
        set((state) => ({
          timelineEvents: state.timelineEvents.filter((event) => event.id !== id)
        })),
      shiftTimelineEvents: (id, minutes) =>
        set((state) => {
          const targetEvent = state.timelineEvents.find(e => e.id === id)
          if (!targetEvent) return state

          return {
            timelineEvents: state.timelineEvents.map(event => {
              if (event.startTime >= targetEvent.startTime) {
                const [h, m] = event.startTime.split(':').map(Number)
                const [eh, em] = event.endTime.split(':').map(Number)

                const formatTimeVal = (mins: number) => {
                  const hh = Math.floor(mins / 60).toString().padStart(2, '0')
                  const mm = (mins % 60).toString().padStart(2, '0')
                  return `${hh}:${mm}`
                }

                return {
                  ...event,
                  startTime: formatTimeVal(h * 60 + m + minutes),
                  endTime: formatTimeVal(eh * 60 + em + minutes)
                }
              }
              return event
            })
          }
        }),
      applyTimelineTemplate: () => {
        const state = get()
        const start = state.wedding.timelineStartTime || '08:00'
        const [baseH, baseM] = start.split(':').map(Number)

        const templateEvents = [
          { title: 'Hair & Makeup', startOffset: 0, duration: 180, color: '#d4a5a5' },
          { title: 'Photography - Getting Ready', startOffset: 120, duration: 120, color: '#c97f66' },
          { title: 'Ceremony', startOffset: 360, duration: 60, color: '#d4af37' },
          { title: 'Cocktail Hour', startOffset: 420, duration: 60, color: '#9dc183' },
          { title: 'Reception', startOffset: 480, duration: 60, color: '#f7e7ce' },
          { title: 'Dinner', startOffset: 540, duration: 120, color: '#c97f66' },
          { title: 'First Dance', startOffset: 660, duration: 15, color: '#d4af37' },
          { title: 'Dancing', startOffset: 675, duration: 165, color: '#9dc183' },
          { title: 'Send Off', startOffset: 840, duration: 30, color: '#d4a5a5' },
        ]

        const formatTimeVal = (mins: number) => {
          const hh = Math.floor(mins / 60).toString().padStart(2, '0')
          const mm = (mins % 60).toString().padStart(2, '0')
          return `${hh}:${mm}`
        }

        const newEvents = templateEvents.map(event => ({
          id: uuidv4(),
          title: event.title,
          startTime: formatTimeVal(baseH * 60 + baseM + event.startOffset),
          endTime: formatTimeVal(baseH * 60 + baseM + event.startOffset + event.duration),
          color: event.color,
          location: state.wedding.venue || '',
          description: '',
          vendors: []
        }))

        set({ timelineEvents: newEvents })
      },

      // Photos
      photos: [],
      setPhotos: (photos) => set({ photos }),
      addPhoto: async (photo) => {
        const id = uuidv4()
        const newPhoto = { ...photo, id }

        set((state) => ({
          photos: [...state.photos, newPhoto]
        }))

        const state = get()
        if (state.user) {
          const { error } = await supabase
            .from('photos')
            .insert({
              id,
              wedding_id: state.wedding.id,
              url: photo.url,
              caption: photo.caption,
              category: photo.tags[0] || 'general',
              is_favorite: false
            })
          if (error) console.error('Error adding photo to Supabase:', error)
        }
      },
      deletePhoto: async (id) => {
        set((state) => ({
          photos: state.photos.filter((photo) => photo.id !== id)
        }))

        const state = get()
        if (state.user) {
          const photo = state.photos.find(p => p.id === id)
          if (photo) {
            // If it's a Supabase storage URL, we might want to delete the file too
            // For now just delete the record
            const { error } = await supabase
              .from('photos')
              .delete()
              .eq('id', id)
            if (error) console.error('Error deleting photo from Supabase:', error)
          }
        }
      },
      likePhoto: async (id) => {
        set((state) => ({
          photos: state.photos.map((photo) =>
            photo.id === id ? { ...photo, likes: photo.likes + 1 } : photo
          )
        }))

        // Note: The schema doesn't have a likes count yet, we might need to add it
        // For now this stays local only if not in schema
      },

      // Website
      websiteSettings: defaultWebsiteSettings,
      updateWebsiteSettings: (updates) =>
        set((state) => ({
          websiteSettings: { ...state.websiteSettings, ...updates }
        })),

      // App Settings
      appSettings: defaultAppSettings,
      setDarkMode: (enabled) =>
        set((state) => {
          // Apply dark mode to document
          if (enabled) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
          return {
            appSettings: { ...state.appSettings, darkMode: enabled }
          }
        }),
      updateAppSettings: (updates) => {
        set((state) => {
          const newSettings = { ...state.appSettings, ...updates }

          // Sync to Supabase if user is logged in
          if (state.user) {
            supabase
              .from('profiles')
              .update({ app_settings: newSettings })
              .eq('id', state.user.id)
              .then(({ error }) => {
                if (error) console.error('Error syncing settings to Supabase:', error)
              })
          }

          return { appSettings: newSettings }
        })
      },

      // Notifications
      notifications: [],
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: uuidv4(),
              createdAt: new Date().toISOString(),
              read: false,
              dismissed: false
            },
            ...state.notifications
          ]
        })),
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          )
        })),
      dismissNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, dismissed: true } : n
          )
        })),
      clearAllNotifications: () =>
        set(() => ({
          notifications: []
        })),
      getActiveNotifications: () => {
        const state = get()
        return state.notifications.filter((n: Notification) => !n.dismissed)
      },

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
        })),

      // Storage
      uploadFile: async (bucket, file, path) => {
        const state = get()
        if (!state.user) return null

        let fileToUpload = file

        // Automatically compress if it's an image
        if (file.type.startsWith('image/')) {
          try {
            const compressedDataUrl = await fileToCompressedDataUrl(file, 1600, 1600, 0.8)
            fileToUpload = dataUrlToFile(compressedDataUrl, file.name)
          } catch (err) {
            console.error('Compression failed, uploading original:', err)
          }
        }

        const fileExt = fileToUpload.name.split('.').pop()
        const fileName = `${uuidv4()}.${fileExt}`
        const filePath = path ? `${path}/${fileName}` : fileName

        const { error } = await supabase.storage
          .from(bucket)
          .upload(filePath, fileToUpload)

        if (error) {
          console.error('Error uploading file:', error)
          return null
        }

        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath)

        return publicUrl
      },

      // Inspiration Boards
      inspirationBoards: [],
      setInspirationBoards: (inspirationBoards) => set({ inspirationBoards }),
      addInspirationBoard: async (board) => {
        const id = uuidv4()
        const now = new Date().toISOString()
        const newBoard = {
          ...board,
          id,
          images: [],
          createdAt: now,
          updatedAt: now
        }

        set((state) => ({
          inspirationBoards: [...state.inspirationBoards, newBoard]
        }))

        const state = get()
        if (state.user) {
          const { error } = await supabase
            .from('inspiration_boards')
            .insert({
              id,
              wedding_id: state.wedding.id,
              name: board.name,
              category: board.category,
              description: board.description
            })
          if (error) console.error('Error adding inspiration board to Supabase:', error)
        }
      },
      updateInspirationBoard: async (id, updates) => {
        const now = new Date().toISOString()
        set((state) => ({
          inspirationBoards: state.inspirationBoards.map((board) =>
            board.id === id
              ? { ...board, ...updates, updatedAt: now }
              : board
          )
        }))

        const state = get()
        if (state.user) {
          const { error } = await supabase
            .from('inspiration_boards')
            .update({
              name: updates.name,
              category: updates.category,
              description: updates.description,
              cover_image: updates.coverImage,
              updated_at: now
            })
            .eq('id', id)
          if (error) console.error('Error updating inspiration board in Supabase:', error)
        }
      },
      deleteInspirationBoard: async (id) => {
        set((state) => ({
          inspirationBoards: state.inspirationBoards.filter((board) => board.id !== id)
        }))

        const state = get()
        if (state.user) {
          const { error } = await supabase
            .from('inspiration_boards')
            .delete()
            .eq('id', id)
          if (error) console.error('Error deleting inspiration board from Supabase:', error)
        }
      },
      addImageToBoard: async (boardId, image) => {
        const id = uuidv4()
        const now = new Date().toISOString()
        const newImage = { ...image, id, addedAt: now }

        set((state) => ({
          inspirationBoards: state.inspirationBoards.map((board) =>
            board.id === boardId
              ? {
                ...board,
                images: [...board.images, newImage],
                coverImage: board.coverImage || image.url,
                updatedAt: now
              }
              : board
          )
        }))

        const state = get()
        if (state.user) {
          const { error } = await supabase
            .from('inspiration_images')
            .insert({
              id,
              board_id: boardId,
              url: image.url,
              source: image.source,
              notes: image.notes,
              tags: image.tags
            })
          if (error) console.error('Error adding inspiration image to Supabase:', error)

          // Update cover image if none exists
          const board = state.inspirationBoards.find(b => b.id === boardId)
          if (board && !board.coverImage) {
            await supabase
              .from('inspiration_boards')
              .update({ cover_image: image.url, updated_at: now })
              .eq('id', boardId)
          }
        }
      },
      updateBoardImage: async (boardId, imageId, updates) => {
        const now = new Date().toISOString()
        set((state) => ({
          inspirationBoards: state.inspirationBoards.map((board) =>
            board.id === boardId
              ? {
                ...board,
                images: board.images.map((img) =>
                  img.id === imageId ? { ...img, ...updates } : img
                ),
                updatedAt: now
              }
              : board
          )
        }))

        const state = get()
        if (state.user) {
          const { error } = await supabase
            .from('inspiration_images')
            .update({
              notes: updates.notes,
              source: updates.source,
              tags: updates.tags
            })
            .eq('id', imageId)
          if (error) console.error('Error updating inspiration image in Supabase:', error)
        }
      },
      removeImageFromBoard: async (boardId, imageId) => {
        const now = new Date().toISOString()
        let removedImageUrl = ''

        set((state) => {
          const board = state.inspirationBoards.find(b => b.id === boardId)
          if (!board) return state

          const imageToRemove = board.images.find(i => i.id === imageId)
          removedImageUrl = imageToRemove?.url || ''

          const newImages = board.images.filter((img) => img.id !== imageId)
          const newCoverImage = board.coverImage === removedImageUrl
            ? newImages[0]?.url || ''
            : board.coverImage

          return {
            inspirationBoards: state.inspirationBoards.map((b) =>
              b.id === boardId
                ? {
                  ...b,
                  images: newImages,
                  coverImage: newCoverImage,
                  updatedAt: now
                }
                : b
            )
          }
        })

        const state = get()
        if (state.user) {
          const { error } = await supabase
            .from('inspiration_images')
            .delete()
            .eq('id', imageId)
          if (error) console.error('Error removing inspiration image from Supabase:', error)

          // Update cover image if it was changed
          const board = state.inspirationBoards.find(b => b.id === boardId)
          if (board && board.coverImage !== removedImageUrl) {
            await supabase
              .from('inspiration_boards')
              .update({ cover_image: board.coverImage, updated_at: now })
              .eq('id', boardId)
          }
        }
      },
      reorderBoardImages: async (boardId, imageIds) => {
        const now = new Date().toISOString()

        set((state) => {
          const board = state.inspirationBoards.find(b => b.id === boardId)
          if (!board) return state

          // Create a map for quick lookup
          const imageMap = new Map(board.images.map(img => [img.id, img]))

          // Reorder images based on the new order
          const reorderedImages = imageIds
            .map(id => imageMap.get(id))
            .filter((img): img is InspirationImage => img !== undefined)

          return {
            inspirationBoards: state.inspirationBoards.map((b) =>
              b.id === boardId
                ? {
                  ...b,
                  images: reorderedImages,
                  updatedAt: now
                }
                : b
            )
          }
        })

        // Note: Supabase doesn't have an order column for inspiration_images currently
        // If ordering persistence is needed, the schema would need to be updated
      }
    }),
    {
      name: 'wedding-planner-storage'
    }
  )
)
