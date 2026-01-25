import { Link } from 'react-router-dom'
import { useWeddingStore } from '../store/weddingStore'
import { differenceInDays, format } from 'date-fns'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

export default function Dashboard() {
  const { wedding, checklist, budgetItems, guests, vendors, setWedding } = useWeddingStore()

  const completedTasks = checklist.filter(item => item.completed).length
  const totalTasks = checklist.length
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalBudget = wedding.totalBudget
  const spent = budgetItems.reduce((sum, item) => sum + item.actualCost, 0)
  const remaining = totalBudget - spent
  const budgetProgress = totalBudget > 0 ? Math.round((spent / totalBudget) * 100) : 0

  const attendingGuests = guests.filter(g => g.rsvpStatus === 'attending').length
  const pendingRSVPs = guests.filter(g => g.rsvpStatus === 'pending').length
  const declinedGuests = guests.filter(g => g.rsvpStatus === 'declined').length

  const daysUntilWedding = wedding.weddingDate
    ? differenceInDays(new Date(wedding.weddingDate), new Date())
    : null

  const rsvpData = [
    { name: 'Attending', value: attendingGuests, color: '#9dc183' },
    { name: 'Pending', value: pendingRSVPs, color: '#f7e7ce' },
    { name: 'Declined', value: declinedGuests, color: '#d4a5a5' },
  ]

  const budgetByCategory = budgetItems.reduce((acc, item) => {
    const existing = acc.find(i => i.category === item.category)
    if (existing) {
      existing.amount += item.actualCost
    } else {
      acc.push({ category: item.category, amount: item.actualCost })
    }
    return acc
  }, [] as { category: string; amount: number }[])

  const upcomingTasks = checklist
    .filter(item => !item.completed && item.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  if (!wedding.partner1Name || !wedding.partner2Name || !wedding.weddingDate) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card">
          <h1 className="text-3xl font-serif text-gray-800 mb-2">Welcome to EverAfter</h1>
          <p className="text-gray-600 mb-8">Let's get started planning your perfect day!</p>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partner 1 Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter name"
                  value={wedding.partner1Name}
                  onChange={(e) => setWedding({ partner1Name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Partner 2 Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter name"
                  value={wedding.partner2Name}
                  onChange={(e) => setWedding({ partner2Name: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Date</label>
              <input
                type="date"
                className="input-field"
                value={wedding.weddingDate}
                onChange={(e) => setWedding({ weddingDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Budget ($)</label>
              <input
                type="number"
                className="input-field"
                placeholder="30000"
                value={wedding.totalBudget || ''}
                onChange={(e) => setWedding({ totalBudget: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Guest Count</label>
              <input
                type="number"
                className="input-field"
                placeholder="100"
                value={wedding.estimatedGuests || ''}
                onChange={(e) => setWedding({ estimatedGuests: Number(e.target.value) })}
              />
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Quick Navigation Panel */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
        <Link to="/checklist" className="btn-secondary h-full flex flex-col items-center justify-center p-4 hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <span className="text-2xl mb-2">✓</span>
          <span className="font-medium text-gray-700">Checklist</span>
        </Link>
        <Link to="/budget" className="btn-secondary h-full flex flex-col items-center justify-center p-4 hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <span className="text-2xl mb-2">💰</span>
          <span className="font-medium text-gray-700">Budget</span>
        </Link>
        <div className="flex flex-col gap-2">
          <Link to="/guests" className="btn-secondary flex-1 flex flex-col items-center justify-center p-2 hover:bg-primary-50 hover:border-primary-200 transition-colors">
            <span className="text-xl">👥</span>
            <span className="text-sm font-medium text-gray-700">Guests</span>
          </Link>
          <Link to="/seating" className="btn-secondary flex-1 flex flex-col items-center justify-center p-2 hover:bg-primary-50 hover:border-primary-200 transition-colors">
            <span className="text-xl">🪑</span>
            <span className="text-sm font-medium text-gray-700">Seating</span>
          </Link>
        </div>
        <Link to="/timeline" className="btn-secondary h-full flex flex-col items-center justify-center p-4 hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <span className="text-2xl mb-2">📅</span>
          <span className="font-medium text-gray-700">Timeline</span>
        </Link>
        <Link to="/photos" className="btn-secondary h-full flex flex-col items-center justify-center p-4 hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <span className="text-2xl mb-2">📸</span>
          <span className="font-medium text-gray-700">Photos</span>
        </Link>
        <Link to="/website" className="btn-secondary h-full flex flex-col items-center justify-center p-4 hover:bg-primary-50 hover:border-primary-200 transition-colors">
          <span className="text-2xl mb-2">🌐</span>
          <span className="font-medium text-gray-700">Website</span>
        </Link>
      </div>
      <div className="card bg-gradient-to-r from-primary-50 to-wedding-blush">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif text-gray-800">
              {wedding.partner1Name} & {wedding.partner2Name}
            </h1>
            <p className="text-gray-600 mt-1">
              {format(new Date(wedding.weddingDate), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          {daysUntilWedding !== null && daysUntilWedding > 0 && (
            <div className="text-center">
              <p className="text-5xl font-serif text-primary-600">{daysUntilWedding}</p>
              <p className="text-gray-600">days to go</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tasks</h3>
          <p className="text-3xl font-serif text-gray-800 mt-2">{completedTasks}/{totalTasks}</p>
          <div className="progress-bar mt-3">
            <div className="progress-bar-fill" style={{ width: `${taskProgress}%` }} />
          </div>
          <p className="text-sm text-gray-500 mt-2">{taskProgress}% complete</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Budget</h3>
          <p className="text-3xl font-serif text-gray-800 mt-2">${spent.toLocaleString()}</p>
          <div className="progress-bar mt-3">
            <div
              className={`progress-bar-fill ${budgetProgress > 90 ? 'bg-red-500' : budgetProgress > 75 ? 'bg-yellow-500' : ''}`}
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            />
          </div>
          <p className="text-sm text-gray-500 mt-2">${remaining.toLocaleString()} remaining</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Guests</h3>
          <p className="text-3xl font-serif text-gray-800 mt-2">{attendingGuests}</p>
          <p className="text-sm text-gray-500 mt-2">{pendingRSVPs} pending | {guests.length} invited</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Vendors</h3>
          <p className="text-3xl font-serif text-gray-800 mt-2">{vendors.filter(v => v.contracted).length}/{vendors.length}</p>
          <p className="text-sm text-gray-500 mt-2">booked</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-4">RSVP Status</h3>
          {guests.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={rsvpData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                    {rsvpData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                {rsvpData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Add guests to see RSVP status</p>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Spending by Category</h3>
          {budgetByCategory.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetByCategory} layout="vertical">
                  <XAxis type="number" tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <YAxis type="category" dataKey="category" width={100} />
                  <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#c97f66" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Add budget items to see spending</p>
          )}
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Upcoming Tasks</h3>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{task.title}</p>
                  <p className="text-sm text-gray-500">{task.description}</p>
                </div>
                <div className="text-right">
                  <span className={`badge ${task.priority === 'high' ? 'badge-danger' : task.priority === 'medium' ? 'badge-warning' : 'badge-success'}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <p className="text-sm text-gray-500 mt-1">{format(new Date(task.dueDate), 'MMM d')}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No upcoming tasks with due dates</p>
        )}
      </div>
    </div>
  )
}
