// Core Types for Wedding Planner Application

export interface WeddingDetails {
  id: string
  partner1Name: string
  partner2Name: string
  weddingDate: string
  venue: string
  theme: string
  estimatedGuests: number
  totalBudget: number
  // New ceremony & reception details
  ceremonyVenue?: string
  ceremonyAddress?: string
  ceremonyLink?: string
  ceremonyTime?: string
  receptionVenue?: string
  receptionAddress?: string
  receptionLink?: string
  receptionTime?: string
  sameLocation?: boolean
}

export interface ChecklistItem {
  id: string
  title: string
  description: string
  category: ChecklistCategory
  dueDate: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  notes: string
}

export type ChecklistCategory =
  | 'venue'
  | 'catering'
  | 'attire'
  | 'photography'
  | 'music'
  | 'flowers'
  | 'invitations'
  | 'transportation'
  | 'accommodations'
  | 'legal'
  | 'other'

export interface BudgetItem {
  id: string
  category: string
  vendor: string
  vendorId?: string
  estimatedCost: number
  actualCost: number
  paid: number
  dueDate: string
  notes: string
}

export interface Guest {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address: GuestAddress
  rsvpStatus: RSVPStatus
  mealChoice: string
  dietaryRestrictions: string[]
  plusOne: boolean
  plusOneName: string
  tableAssignment: string | null
  group: string
  isBrideSide: boolean
  isGroomSide: boolean
  notes: string
  // Communication tracking
  saveTheDateSent?: boolean
  reminderSent?: boolean
  lastCommunicationAt?: string
}

export interface GuestAddress {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export type RSVPStatus = 'pending' | 'attending' | 'declined' | 'maybe'

export interface Vendor {
  id: string
  name: string
  category: VendorCategory
  contactName: string
  email: string
  phone: string
  website: string
  price: number
  rating: number
  notes: string
  contracted: boolean
  depositPaid: boolean
  depositAmount?: number
  tags?: string[]
}

export type VendorCategory =
  | 'venue'
  | 'catering'
  | 'photography'
  | 'videography'
  | 'florist'
  | 'music'
  | 'officiant'
  | 'cake'
  | 'rentals'
  | 'transportation'
  | 'hair-makeup'
  | 'other'

export interface Table {
  id: string
  name: string
  capacity: number
  shape: 'round' | 'rectangular' | 'square'
  side?: 'bride' | 'groom' | 'general'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  guests: string[]
}

export interface RoomElement {
  id: string
  type: string
  label: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  color?: string
}

export interface TimelineEvent {
  id: string
  title: string
  startTime: string
  endTime: string
  location: string
  description: string
  vendors: string[]
  color: string
}

export interface Photo {
  id: string
  url: string
  uploadedBy: string
  uploadedAt: string
  caption: string
  likes: number
  tags: string[]
}


export interface WebsiteSettings {
  enabled: boolean
  url: string
  template: string
  primaryColor: string
  coverPhoto: string
  story: string
  showRegistry: boolean
  showPhotos: boolean
  showRsvp: boolean
  password: string
}

// App Settings & Preferences
export interface AppSettings {
  darkMode: boolean
  notifications: NotificationPreferences
  enabledModules: string[]
}

export interface AuthUser {
  id: string
  email: string
  name?: string
}

export interface NotificationPreferences {
  enableInApp: boolean
  paymentReminderDays: number[]
  taskReminderDays: number[]
  rsvpReminderEnabled: boolean
  budgetAlertThresholds: number[]
}

export interface Notification {
  id: string
  type: 'payment_due' | 'payment_overdue' | 'task_due' | 'task_overdue' | 'rsvp_reminder' | 'budget_alert'
  title: string
  message: string
  relatedId?: string
  relatedType?: 'budget' | 'checklist' | 'guest'
  createdAt: string
  read: boolean
  dismissed: boolean
}

// Inspiration Boards
export type BoardCategory =
  | 'colors'
  | 'florals'
  | 'fashion'
  | 'venue'
  | 'cake'
  | 'photography'
  | 'decor'
  | 'stationery'
  | 'other'

export interface InspirationImage {
  id: string
  url: string
  source?: string
  notes?: string
  tags: string[]
  addedAt: string
}

export interface InspirationBoard {
  id: string
  name: string
  category: BoardCategory
  description: string
  coverImage?: string
  images: InspirationImage[]
  createdAt: string
  updatedAt: string
}
