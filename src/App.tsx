import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Checklist from './pages/Checklist'
import Budget from './pages/Budget'
import Guests from './pages/Guests'
import Vendors from './pages/Vendors'
import Seating from './pages/Seating'
import Timeline from './pages/Timeline'
import Photos from './pages/Photos'
import Inspiration from './pages/Inspiration'
import Website from './pages/Website'
import Settings from './pages/Settings'
import MarriageLaws from './pages/MarriageLaws'
import DetailedBudget from './pages/DetailedBudget'
import Communication from './pages/Communication'
import Share from './pages/Share'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import RSVP from './pages/RSVP'
import GuestRegister from './pages/GuestRegister'
import GuestPortal from './pages/GuestPortal'
import { useWeddingStore } from './store/weddingStore'
import { Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'


function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useWeddingStore(state => state.user)
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function App() {
  const setUser = useWeddingStore(state => state.setUser)
  const updateAppSettings = useWeddingStore(state => state.updateAppSettings)

  const setWedding = useWeddingStore(state => state.setWedding)
  const setChecklist = useWeddingStore(state => state.setChecklist)
  const setBudgetItems = useWeddingStore(state => state.setBudgetItems)
  const setGuests = useWeddingStore(state => state.setGuests)
  const setVendors = useWeddingStore(state => state.setVendors)
  const setPhotos = useWeddingStore(state => state.setPhotos)
  const setInspirationBoards = useWeddingStore(state => state.setInspirationBoards)

  useEffect(() => {
    async function fetchProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, app_settings, city, state, zip_code')
        .eq('id', userId)
        .single()

      if (!error && data) {
        if (data.app_settings) {
          // Ensure env vars are picked up if missing in stored profile
          const envGeminiKey = import.meta.env.VITE_GEMINI_API_KEY
          const envFashnKey = import.meta.env.VITE_FASHN_API_KEY

          if (!data.app_settings.geminiApiKey && envGeminiKey) {
            data.app_settings.geminiApiKey = envGeminiKey
          }
          if (!data.app_settings.fashnApiKey && envFashnKey) {
            data.app_settings.fashnApiKey = envFashnKey
          }

          updateAppSettings(data.app_settings)
        }
        return {
          name: data.full_name,
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zip_code || ''
        }
      }
      return null
    }

    async function fetchFullWeddingData(userId: string) {
      try {
        // 1. Get the wedding
        const { data: weddingData, error: weddingError } = await supabase
          .from('weddings')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (weddingError) {
          if (weddingError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error fetching wedding:', weddingError)
          }
          return
        }

        if (!weddingData) return

        // Transform DB names to store names
        setWedding({
          id: weddingData.id,
          partner1Name: weddingData.partner1_name || '',
          partner2Name: weddingData.partner2_name || '',
          weddingDate: weddingData.wedding_date || '',
          venue: weddingData.venue_name || '',
          estimatedGuests: weddingData.estimated_guests || 100,
          totalBudget: Number(weddingData.total_budget || 30000)
        })

        const wId = weddingData.id

        // 2. Fetch related data
        const [checklist, budget, guests, vendors, photos, boards, boardImages] = await Promise.all([
          supabase.from('checklist_items').select('*').eq('wedding_id', wId),
          supabase.from('budget_items').select('*').eq('wedding_id', wId),
          supabase.from('guests').select('*').eq('wedding_id', wId),
          supabase.from('vendors').select('*').eq('wedding_id', wId),
          supabase.from('photos').select('*').eq('wedding_id', wId),
          supabase.from('inspiration_boards').select('*').eq('wedding_id', wId),
          supabase.from('inspiration_images').select('*'), // Join via JS or use specific query
        ])

        // Handle Checklist
        if (!checklist.error && checklist.data) {
          setChecklist(checklist.data.map(item => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            category: item.category || 'other',
            dueDate: item.due_date || '',
            completed: item.completed,
            priority: item.priority as any,
            notes: ''
          })))
        }

        // Handle Budget
        if (!budget.error && budget.data) {
          setBudgetItems(budget.data.map(item => ({
            id: item.id,
            category: item.category || 'Other',
            vendor: item.name,
            estimatedCost: Number(item.estimated_cost),
            actualCost: Number(item.actual_cost),
            paid: Number(item.paid_amount),
            dueDate: item.due_date || '',
            notes: item.notes || '',
            vendorId: item.vendor_id || undefined
          })))
        }

        // Handle Guests
        if (!guests.error && guests.data) {
          setGuests(guests.data.map(item => ({
            id: item.id,
            firstName: item.first_name,
            lastName: item.last_name,
            email: item.email || '',
            phone: item.phone || '',
            rsvpStatus: item.rsvp_status as any,
            mealChoice: item.meal_choice || '',
            dietaryRestrictions: item.dietary_restrictions || [],
            plusOne: item.plus_one,
            plusOneName: item.plus_one_name || '',
            tableAssignment: item.table_assignment,
            group: item.group || '',
            isBrideSide: item.is_bride_side,
            isGroomSide: item.is_groom_side,
            address: item.address as any,
            notes: item.notes || '',
            inviteCode: (item as any).invite_code || '',
            userId: (item as any).user_id || undefined,
            partyMembers: (item as any).party_members || []
          })))
        }

        // Handle Vendors
        if (!vendors.error && vendors.data) {
          setVendors(vendors.data.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category || 'other',
            contactName: item.contact_person || '',
            email: item.email || '',
            phone: item.phone || '',
            website: '',
            price: Number(item.price),
            depositPaid: item.deposit_paid,
            contracted: item.contracted,
            rating: item.rating,
            notes: item.notes || ''
          })))
        }

        // Handle Photos
        if (!photos.error && photos.data) {
          setPhotos(photos.data.map(item => ({
            id: item.id,
            url: item.url,
            uploadedBy: item.uploaded_by || 'Guest',
            uploadedAt: item.created_at,
            caption: item.caption || '',
            likes: item.likes || 0,
            tags: item.category ? [item.category] : []
          })))
        }

        // Handle Boards
        if (!boards.error && boards.data) {
          setInspirationBoards(boards.data.map(board => ({
            id: board.id,
            name: board.name,
            category: (board.category || 'other') as any,
            description: board.description || '',
            coverImage: board.cover_image,
            createdAt: board.created_at,
            updatedAt: board.updated_at,
            images: boardImages.data
              ?.filter(img => img.board_id === board.id)
              .map(img => ({
                id: img.id,
                url: img.url,
                source: img.source,
                notes: img.notes,
                tags: img.tags || [],
                addedAt: img.added_at
              })) || []
          })))
        }
      } catch (err) {
        console.error('Critical error in fetchFullWeddingData:', err)
      }
    }

    // Check active sessions and sets the user
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profile?.name || session.user.user_metadata?.full_name || '',
          city: profile?.city || '',
          state: profile?.state || '',
          zipCode: profile?.zipCode || ''
        })
        fetchFullWeddingData(session.user.id)
      }
    })

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: profile?.name || session.user.user_metadata?.full_name || '',
          city: profile?.city || '',
          state: profile?.state || '',
          zipCode: profile?.zipCode || ''
        })
        fetchFullWeddingData(session.user.id)
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, setWedding, setChecklist, setBudgetItems, setGuests, setVendors, setPhotos, setInspirationBoards, updateAppSettings])

  return (
    <Routes>
      {/* Public share page - outside Layout */}
      <Route path="/share" element={<Share />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/rsvp/:weddingId" element={<RSVP />} />
      <Route path="/guest/register" element={<GuestRegister />} />
      <Route path="/guest/register/:inviteCode" element={<GuestRegister />} />
      <Route path="/guest/portal" element={<GuestPortal />} />

      {/* Main app with Layout - Protected */}
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="checklist" element={<Checklist />} />
        <Route path="budget" element={<Budget />} />
        <Route path="budget/detailed" element={<DetailedBudget />} />
        <Route path="guests" element={<Guests />} />
        <Route path="vendors" element={<Vendors />} />
        <Route path="seating" element={<Seating />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="photos" element={<Photos />} />
        <Route path="inspiration" element={<Inspiration />} />
        <Route path="website" element={<Website />} />
        <Route path="settings" element={<Settings />} />
        <Route path="marriage-laws" element={<MarriageLaws />} />
        <Route path="communications" element={<Communication />} />
      </Route>
    </Routes>
  )
}

export default App
