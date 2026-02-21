import { useState, useEffect } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { Link } from 'react-router-dom'
import { differenceInDays, format } from 'date-fns'
import { CheckCircle, Circle, ArrowRight, Shirt, DollarSign, MapPin, Calendar, Lightbulb } from 'lucide-react'

const PRO_TIPS = [
  "Remember to enjoy the process! Take a break from planning this weekend.",
  "Create a separate email address for all your wedding correspondence.",
  "Break in your wedding shoes a few weeks before the big day.",
  "Send thank you notes within 3 months of the wedding.",
  "Keep a printed copy of your vendor contracts in a binder.",
  "Hydrate! It's the secret to glowing skin on your wedding day.",
  "Schedule a final dress fitting 2-3 weeks before the wedding."
]

export default function Dashboard() {
  const { wedding, checklist, toggleChecklistItem, user } = useWeddingStore()
  const [tipOfTheDay, setTipOfTheDay] = useState("")

  useEffect(() => {
    // Pick a tip based on the day of the year so it rotates daily
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
    setTipOfTheDay(PRO_TIPS[dayOfYear % PRO_TIPS.length])
  }, [])

  // Calculate Progress
  const completedTasks = checklist.filter(item => item.completed).length
  const totalTasks = checklist.length
  const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate Days Remaining
  const daysUntilWedding = wedding.weddingDate
    ? differenceInDays(new Date(wedding.weddingDate), new Date())
    : null

  // Get Upcoming Tasks
  const upcomingTasks = checklist
    .filter(item => !item.completed && item.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const coupleName = user?.name || wedding.partner1Name || "Planner"

  return (
    <div className="space-y-8 max-w-6xl mx-auto">

      {/* 1. Header Section */}
      <section className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-serif text-gray-900 dark:text-white mb-2">
              Welcome, {coupleName}!
            </h1>
            {wedding.weddingDate ? (
              <p className="text-gray-600 dark:text-gray-400">
                Your Big Day: <span className="font-semibold text-gray-800 dark:text-gray-200">{format(new Date(wedding.weddingDate), 'MMMM d, yyyy')}</span>
                {daysUntilWedding !== null && daysUntilWedding > 0 && (
                  <span className="ml-2 text-primary-600 font-medium">({daysUntilWedding} days to go!)</span>
                )}
              </p>
            ) : (
              <p className="text-gray-600 dark:text-gray-400">Let's set a date for your big day!</p>
            )}
          </div>

          <div className="w-full md:w-1/3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
              <span className="text-sm font-bold text-primary-600">{taskProgress}% complete</span>
            </div>
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${taskProgress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Your Next Steps */}
      <section>
        <h2 className="text-xl font-serif text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          Your Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Card 1: Virtual Dress Try-On */}
          <div className="card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-sm">
              New
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
              <Shirt className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-gray-900 dark:text-white mb-2">Virtual Dress Try-On</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-grow">
              See yourself in your dream dress with our AI stylist!
            </p>
            <Link to="/inspiration" className="inline-flex items-center text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              Try It Now <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Card 2: Set Your Budget */}
          <div className="card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-gray-900 dark:text-white mb-2">Set Your Budget</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-grow">
              We'll help you allocate your ${wedding.totalBudget?.toLocaleString() || '0'} budget efficiently.
            </p>
            <Link to="/budget" className="inline-flex items-center text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
              Start Budget <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Card 3: Find Vendors */}
          <div className="card group hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-lg text-gray-900 dark:text-white mb-2">Find Vendors</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 flex-grow">
              Browse top-rated vendors in your area to build your dream team.
            </p>
            <Link to="/vendors" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Explore Vendors <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 3. Upcoming Tasks */}
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-serif text-gray-800 dark:text-white">Upcoming Tasks</h2>
            <Link to="/checklist" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
              View Full Checklist →
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {upcomingTasks.length > 0 ? (
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors group">
                    <button
                      onClick={() => toggleChecklistItem(task.id)}
                      className="mt-1 flex-shrink-0 text-gray-300 hover:text-primary-500 transition-colors"
                    >
                      <Circle className="w-5 h-5" />
                    </button>

                    <div className="flex-grow">
                      <h4 className="text-gray-900 dark:text-gray-100 font-medium group-hover:text-primary-600 transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-4 mt-1">
                        {task.dueDate && (
                          <div className={`flex items-center text-xs ${differenceInDays(new Date(task.dueDate), new Date()) < 0
                            ? 'text-red-500 font-medium'
                            : 'text-gray-500'
                            }`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(task.dueDate), 'MMM d')}
                          </div>
                        )}
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 dark:bg-gray-900/50">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">All caught up!</h3>
                <p className="text-gray-500 text-sm mt-1">You have no upcoming tasks requiring immediate attention.</p>
                <Link to="/checklist" className="btn-secondary text-sm mt-4 inline-block">
                  Add New Task
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* 4. Pro Tip of the Day */}
        <section>
          <h2 className="text-xl font-serif text-gray-800 dark:text-white mb-4">Pro Tip of the Day</h2>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl p-6 border border-yellow-100 dark:border-yellow-900/30">
            <div className="bg-yellow-100 dark:bg-yellow-900/40 w-10 h-10 rounded-full flex items-center justify-center mb-4 text-yellow-600 dark:text-yellow-400">
              <Lightbulb className="w-5 h-5" />
            </div>
            <p className="text-gray-800 dark:text-gray-100 font-medium italic leading-relaxed">
              "{tipOfTheDay}"
            </p>
            <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800/30 text-xs text-yellow-700 dark:text-yellow-500 font-medium uppercase tracking-widest">
              Daily Wedding Wisdom
            </div>
          </div>

          {/* Optional: Add Quick Action or Promo below tip */}
          <div className="mt-6 bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 border border-primary-100 dark:border-primary-900/30 text-center">
            <h3 className="font-serif text-lg text-primary-800 dark:text-primary-200 mb-2">Need Inspiration?</h3>
            <p className="text-sm text-primary-600 dark:text-primary-300 mb-4">
              Browse our curated gallery of wedding styles tailored for you.
            </p>
            <Link to="/inspiration" className="text-sm font-semibold text-primary-700 hover:text-primary-800 hover:underline">
              View Inspiration Board →
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
