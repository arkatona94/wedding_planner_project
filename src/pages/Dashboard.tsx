import { useState } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { Link } from 'react-router-dom'
import { differenceInDays, format } from 'date-fns'
import { CheckCircle, DollarSign, Users, Briefcase, Calendar, Heart, Camera, Palette, Utensils } from 'lucide-react'


export default function Dashboard() {
  const { wedding, checklist, budgetItems, guests, vendors, setWedding, appSettings, photos, inspirationBoards, user } = useWeddingStore()

  const completedTasks = checklist.filter(item => item.completed).length
  const totalTasks = checklist.length
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalBudget = wedding.totalBudget
  const spent = budgetItems.reduce((sum, item) => sum + item.actualCost, 0)
  const remaining = totalBudget - spent
  const budgetProgress = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0

  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending').length
  const totalAttending = guests.reduce((acc, guest) =>
    acc + (guest.rsvpStatus === 'attending' ? 1 + guest.partyMembers.length : 0), 0)
  const pendingRSVPs = guests.filter(g => g.rsvpStatus === 'pending').length
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length

  const mealCounts = guests.reduce((acc, guest) => {
    if (guest.rsvpStatus === 'attending') {
      if (guest.mealChoice) {
        acc[guest.mealChoice] = (acc[guest.mealChoice] || 0) + 1;
      }
      guest.partyMembers.forEach(member => {
        if (member.mealChoice) {
          acc[member.mealChoice] = (acc[member.mealChoice] || 0) + 1;
        }
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const daysUntilWedding = wedding.weddingDate
    ? differenceInDays(new Date(wedding.weddingDate), new Date())
    : null


  const upcomingTasks = checklist
    .filter(item => !item.completed && item.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const [onboardingData, setOnboardingData] = useState({
    partner1Name: wedding.partner1Name,
    partner2Name: wedding.partner2Name,
    weddingDate: wedding.weddingDate,
    totalBudget: wedding.totalBudget,
    estimatedGuests: wedding.estimatedGuests
  })

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setWedding(onboardingData)
  }

  if (!wedding.partner1Name || !wedding.partner2Name || !wedding.weddingDate) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Welcome to Beginnings and Endings</h1>
          <p className="text-gray-600 mb-8">Let's get started planning your perfect day!</p>

          <form className="space-y-6" onSubmit={handleOnboardingSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partner 1 Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter name"
                  value={onboardingData.partner1Name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, partner1Name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partner 2 Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter name"
                  value={onboardingData.partner2Name}
                  onChange={(e) => setOnboardingData({ ...onboardingData, partner2Name: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Date</label>
              <input
                type="date"
                className="input-field"
                value={onboardingData.weddingDate}
                onChange={(e) => setOnboardingData({ ...onboardingData, weddingDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget ($)</label>
              <input
                type="number"
                className="input-field"
                placeholder="30000"
                value={onboardingData.totalBudget || ''}
                onChange={(e) => setOnboardingData({ ...onboardingData, totalBudget: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Guest Count</label>
              <input
                type="number"
                className="input-field"
                placeholder="100"
                value={onboardingData.estimatedGuests || ''}
                onChange={(e) => setOnboardingData({ ...onboardingData, estimatedGuests: Number(e.target.value) })}
              />
            </div>
            <button type="submit" className="btn-primary w-full py-3 text-lg">
              Start Planning
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Date Header Panel */}
      <div className="card bg-gradient-to-r from-primary-50 to-wedding-blush">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif text-gray-800">
              {wedding.partner1Name} & {wedding.partner2Name}
            </h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(wedding.weddingDate), 'EEEE, MMMM d, yyyy')}
            </p>
            {user && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-white/50 border border-white/60 shadow-sm">
                <span className="text-xs font-medium text-gray-500 mr-2">Logged in as:</span>
                <span className="text-sm font-semibold text-primary-800">{user.name || user.email}</span>
              </div>
            )}
          </div>
          {daysUntilWedding !== null && daysUntilWedding > 0 && (
            <div className="text-center">
              <p className="text-5xl font-serif text-primary-600">{daysUntilWedding}</p>
              <p className="text-gray-600">days to go</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Link to="/guests" className="card hover:shadow-lg transition-all group flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">👤</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Add Guest</span>
        </Link>
        <Link to="/checklist" className="card hover:shadow-lg transition-all group flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">📝</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">New Task</span>
        </Link>
        <Link to="/budget" className="card hover:shadow-lg transition-all group flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">💸</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Expense</span>
        </Link>
        <Link to="/seating" className="card hover:shadow-lg transition-all group flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">🪑</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Floor Plan</span>
        </Link>
        <Link to="/timeline" className="card hover:shadow-lg transition-all group flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">⏱️</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Schedule</span>
        </Link>
        <Link to="/communications" className="card hover:shadow-lg transition-all group flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl mb-1 group-hover:scale-125 transition-transform">📧</span>
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Communicate</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appSettings.enabledModules.includes('checklist') && (
          <div className="card border-t-4 border-primary-400">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-primary-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Planning Progress</h3>
            </div>
            <p className="text-3xl font-serif text-gray-800">{taskProgress}%</p>
            <p className="text-sm text-gray-500 mt-1">{completedTasks} of {totalTasks} tasks done</p>
            <div className="progress-bar mt-4">
              <div className="progress-bar-fill" style={{ width: `${taskProgress}%` }} />
            </div>
          </div>
        )}

        {appSettings.enabledModules.includes('budget') && (
          <div className="card border-t-4 border-wedding-blush">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Budget Spent</h3>
            </div>
            <p className="text-3xl font-serif text-gray-800">${spent.toLocaleString()}</p>
            <p className="text-sm text-gray-500 mt-1">${remaining.toLocaleString()} of ${totalBudget.toLocaleString()} left</p>
            <div className="progress-bar mt-4">
              <div
                className={`progress-bar-fill ${budgetProgress > 90 ? 'bg-red-400' : ''}`}
                style={{ width: `${Math.min(budgetProgress, 100)}%` }}
              />
            </div>
          </div>
        )}

        {appSettings.enabledModules.includes('guests') && (
          <div className="card border-t-4 border-green-200">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Guest List</h3>
            </div>
            <p className="text-3xl font-serif text-gray-800">{attendingGuests}</p>
            <p className="text-sm text-gray-500 mt-1">Confirmed attending</p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{pendingRSVPs} awaiting response</span>
            </div>
          </div>
        )}

        {appSettings.enabledModules.includes('vendors') && (
          <div className="card border-t-4 border-blue-200">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Vendors</h3>
            </div>
            <p className="text-3xl font-serif text-gray-800">{vendors.filter(v => v.contracted).length}</p>
            <p className="text-sm text-gray-500 mt-1">{vendors.length} total vendors tracked</p>
            <div className="mt-4 flex gap-2">
              <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{vendors.length - vendors.filter(v => v.contracted).length} still searching</span>
            </div>
          </div>
        )}

        <div className="card border-t-4 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Camera className="w-5 h-5 text-purple-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Photos</h3>
          </div>
          <p className="text-3xl font-serif text-gray-800">{photos.length}</p>
          <p className="text-sm text-gray-500 mt-1">Uploaded to gallery</p>
          <div className="mt-4 flex gap-2">
            <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {photos.reduce((sum, p) => sum + p.likes, 0)} total likes
            </span>
          </div>
        </div>

        <div className="card border-t-4 border-orange-200">
          <div className="flex items-center gap-3 mb-2">
            <Palette className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Inspiration</h3>
          </div>
          <p className="text-3xl font-serif text-gray-800">{inspirationBoards.length}</p>
          <p className="text-sm text-gray-500 mt-1">Boards created</p>
          <div className="mt-4 flex gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
            {inspirationBoards.slice(0, 3).map(board => (
              <span key={board.id} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {board.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Glance Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card bg-gray-50">
            <h3 className="font-serif text-xl text-gray-800 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary-500" />
              At a Glance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Wedding Date</span>
                <span className="text-sm font-medium text-gray-800">{wedding.weddingDate ? format(new Date(wedding.weddingDate), 'MMM d, yyyy') : 'TBD'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Venue</span>
                <span className="text-sm font-medium text-gray-800 truncate max-w-[150px]">{wedding.venue || 'Not Selected'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">Total Attending</span>
                <span className="text-sm font-medium text-gray-800">{totalAttending} people</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-200">
                <span className="text-sm text-gray-500">RSVP Rate</span>
                <span className="text-sm font-medium text-gray-800">
                  {guests.length > 0 ? Math.round(((attendingGuests + declinedGuests) / guests.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="card bg-white">
            <h3 className="font-serif text-xl text-gray-800 mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-primary-500" />
              Meal Choices
            </h3>
            <div className="space-y-2">
              {Object.keys(mealCounts).length > 0 ? (
                Object.entries(mealCounts).map(([meal, count]) => (
                  <div key={meal} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-600">{meal}</span>
                    <span className="text-sm font-bold text-gray-800">{count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 italic">No meals selected yet</p>
              )}
            </div>
          </div>

          <div className="card bg-primary-50 border border-primary-100">
            <h3 className="font-serif text-xl text-gray-800 mb-2 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Planning Tip
            </h3>
            <p className="text-sm text-gray-600 italic">
              "Remember to enjoy the process! Take a break from planning this weekend and just enjoy each other's company."
            </p>
          </div>
        </div>

        {/* Upcoming Tasks Column */}
        <div className="lg:col-span-2">

          {appSettings.enabledModules.includes('checklist') && (
            <div className="card mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-between">
                <span>Checklist Review</span>
                <Link to="/checklist" className="text-sm text-primary-600 hover:text-primary-700">View All</Link>
              </h3>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{taskProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${taskProgress}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{completedTasks} completed</span>
                  <span>{totalTasks - completedTasks} remaining</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-3">Priority Tasks</h4>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-primary-300">
                      <div>
                        <p className="font-medium text-gray-800">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.description}</p>
                      </div>
                      <div className="text-right">
                        <span className={`badge ${task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <p className="text-xs text-gray-500 mt-1">Due {format(new Date(task.dueDate), 'MMM d')}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No upcoming tasks due!</p>
                  <Link to="/checklist" className="text-sm text-primary-600 font-medium mt-1 inline-block">Add a task</Link>
                </div>
              )}
            </div>
          )}

          {appSettings.enabledModules.includes('budget') && (
            <div className="card">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-between">
                <span>Budget Review</span>
                <Link to="/budget" className="text-sm text-primary-600 hover:text-primary-700">View Details</Link>
              </h3>
              <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Total</p>
                  <p className="font-semibold text-gray-900">${totalBudget.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Spent</p>
                  <p className="font-semibold text-primary-600">${spent.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase">Remaining</p>
                  <p className={`font-semibold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>${remaining.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-orange-500 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-orange-800 text-sm">Financial Health</h4>
                  <p className="text-xs text-orange-700 mt-1">
                    You have spent <strong>{budgetProgress}%</strong> of your budget.
                    {budgetProgress > 100
                      ? " You are currently over budget. Consider revising some estimates."
                      : ` You have $${remaining.toLocaleString()} left to allocate.`}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-between">
              <span>Seating Plan</span>
              <Link to="/seating" className="text-sm text-primary-600 hover:text-primary-700">Open Designer</Link>
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Guests Seated</span>
                  <span className="font-medium text-gray-900">
                    {guests.filter(g => g.tableAssignment).length} of {attendingGuests} attending
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill bg-purple-500"
                    style={{ width: `${attendingGuests > 0 ? (guests.filter(g => g.tableAssignment).length / attendingGuests) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="text-center px-4 border-l border-gray-100">
                <span className="block text-2xl font-serif text-gray-800">{useWeddingStore.getState().tables.length}</span>
                <span className="text-xs text-gray-500 uppercase">Tables</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center justify-between">
              <span>Day-of Timeline</span>
              <Link to="/timeline" className="text-sm text-primary-600 hover:text-primary-700">Edit Schedule</Link>
            </h3>
            {useWeddingStore.getState().timelineEvents.length > 0 ? (
              <div className="relative pt-2 pb-4">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2" />
                <div className="relative flex justify-between gap-4 overflow-x-auto pb-4 scrollbar-hide">
                  {useWeddingStore.getState().timelineEvents
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .filter((_, i) => i % 2 === 0 || i === useWeddingStore.getState().timelineEvents.length - 1) // Show every other event to save space
                    .slice(0, 5)
                    .map(event => (
                      <div key={event.id} className="flex-shrink-0 flex flex-col items-center min-w-[80px]">
                        <div className="w-3 h-3 rounded-full bg-primary-400 mb-2 relative z-10 ring-4 ring-white" />
                        <span className="text-xs font-bold text-gray-800">{format(new Date(`2000-01-01T${event.startTime}`), 'h:mm a')}</span>
                        <span className="text-[10px] text-gray-500 truncate max-w-[100px] text-center">{event.title}</span>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-500">Timeline not created yet</p>
                <button
                  onClick={() => useWeddingStore.getState().applyTimelineTemplate()}
                  className="text-sm text-primary-600 font-medium mt-1 hover:underline"
                >
                  Load Template
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
