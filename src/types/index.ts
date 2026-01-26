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
  x: number
  y: number
  guests: string[]
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
