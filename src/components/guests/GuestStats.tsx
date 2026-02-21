import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, RadarChart, PolarGrid, PolarAngleAxis, Radar } from 'recharts'
import type { Guest } from '../../types'

interface GuestStatsProps {
    guests: Guest[]
}

const CHART_COLORS = ['#c97f66', '#9dc183', '#d4af37', '#d4a5a5', '#b5644d', '#7d4336', '#dba08b', '#f3d9d0']
const mealOptions = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal']
const dietaryOptions = ['Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Kosher', 'Halal']
const mainGroups = ['Family', 'Friends', 'Work', 'Other']

export default function GuestStats({ guests }: GuestStatsProps) {
    const stats = {
        totalInvitations: guests.length,
        totalGuests: guests.length + guests.filter(g => g.plusOne).length,
        attending: guests.filter(g => g.rsvpStatus === 'attending').length + guests.filter(g => g.plusOne && g.rsvpStatus === 'attending').length,
        declined: guests.filter(g => g.rsvpStatus === 'declined').length,
        pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    }

    const uniqueGroups = [...new Set(guests.map(g => g.group as string).filter(Boolean))]
    const groupData = [...new Set([...mainGroups, ...uniqueGroups])]
        .map(group => {
            const groupGuests = guests.filter(g => g.group === group)
            const total = groupGuests.length + groupGuests.filter(g => g.plusOne).length
            return { name: group, value: total }
        })
        .filter(d => d.value > 0)

    const mealData = mealOptions
        .map(meal => {
            const count = guests.filter(g => g.rsvpStatus === 'attending' && g.mealChoice === meal).length
            return { name: meal, value: count }
        })
        .filter(d => d.value > 0)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-gradient-to-br from-primary-50 to-white p-8 rounded-[2rem] border border-primary-100 shadow-sm">
                <h2 className="text-3xl font-serif text-gray-800 mb-2">Guest List Insights</h2>
                <p className="text-gray-500">A premium visual summary of your wedding attendance</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Radial RSVP Progress */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
                    <h3 className="text-lg font-serif text-gray-700 mb-2">RSVP Achievement</h3>
                    <p className="text-sm text-gray-400 mb-6 uppercase tracking-widest">Confirmed Attendance Ratio</p>
                    <div className="relative w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Attending', value: stats.attending },
                                        { name: 'Remaining', value: Math.max(0, stats.totalGuests - stats.attending) }
                                    ]}
                                    innerRadius={80}
                                    outerRadius={110}
                                    startAngle={90}
                                    endAngle={450}
                                    dataKey="value"
                                >
                                    <Cell fill="#9dc183" />
                                    <Cell fill="#f3f4f6" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-5xl font-serif text-gray-800">
                                {stats.totalGuests > 0 ? Math.round((stats.attending / stats.totalGuests) * 100) : 0}%
                            </span>
                            <span className="text-xs text-green-600 font-bold uppercase mt-1 tracking-widest">Attending Confirmed</span>
                        </div>
                    </div>
                </div>

                {/* Premium Info Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Headcount</span>
                        <div>
                            <h4 className="text-5xl font-serif text-gray-800">{stats.totalGuests}</h4>
                            <p className="text-sm text-gray-500 mt-1">Expected guests including +1s</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-yellow-400 hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Awaiting RSVP</span>
                        <div>
                            <h4 className="text-5xl font-serif text-yellow-600">{stats.pending}</h4>
                            <p className="text-sm text-gray-500 mt-1">Invitations still pending response</p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between border-l-4 border-l-red-400 hover:shadow-md transition-shadow">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Regrets Received</span>
                        <div>
                            <h4 className="text-5xl font-serif text-red-600">{stats.declined}</h4>
                            <p className="text-sm text-gray-500 mt-1">Declined invitations</p>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-6 rounded-2xl shadow-lg text-white hover:scale-[1.02] transition-transform">
                        <span className="text-xs font-bold text-primary-100 uppercase tracking-widest">Invitations Active</span>
                        <div className="mt-4">
                            <h4 className="text-5xl font-serif">{stats.totalInvitations}</h4>
                            <p className="text-sm text-primary-100 mt-1">Unique households/invites</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Social Circle Breakdown */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
                    <h3 className="text-xl font-serif text-gray-800 mb-6 font-medium">Group Distribution</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={groupData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {groupData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Radar Dynamics */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[450px] flex flex-col">
                    <h3 className="text-xl font-serif text-gray-800 mb-6 font-medium">Guest Mix Dynamics</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                                { subject: 'Bride Side', A: guests.filter(g => g.isBrideSide).length },
                                { subject: 'Groom Side', A: guests.filter(g => g.isGroomSide).length },
                                { subject: 'Family', A: guests.filter(g => g.group?.toLowerCase().includes('family')).length },
                                { subject: 'Friends', A: guests.filter(g => g.group?.toLowerCase().includes('friend')).length },
                                { subject: 'Work', A: guests.filter(g => g.group?.toLowerCase().includes('work') || g.group?.toLowerCase().includes('colleague')).length },
                            ]}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} />
                                <Radar name="Count" dataKey="A" stroke="#c97f66" fill="#c97f66" fillOpacity={0.6} />
                                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-[250px] flex flex-col">
                    <h3 className="text-lg font-serif text-gray-800 mb-4 font-medium">Meal Selection Summary</h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mealData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={100} axisLine={false} tickLine={false} fontSize={12} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="value" fill="#c97f66" radius={[0, 10, 10, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 min-h-[250px]">
                    <h3 className="text-lg font-serif text-gray-800 mb-6 font-medium">Critical Dietary Alerts</h3>
                    <div className="flex flex-wrap gap-4">
                        {dietaryOptions.map(diet => {
                            const count = guests.filter(g => g.rsvpStatus === 'attending' && g.dietaryRestrictions.includes(diet)).length
                            if (count === 0) return null
                            return (
                                <div key={diet} className="flex flex-col p-5 bg-orange-50 rounded-2xl border border-orange-100 min-w-[140px] shadow-sm transform hover:-translate-y-1 transition-transform">
                                    <span className="text-3xl font-serif text-orange-700">{count}</span>
                                    <span className="text-xs font-bold text-orange-900 uppercase tracking-wider mt-1">{diet}</span>
                                </div>
                            )
                        })}
                        {!dietaryOptions.some(diet => guests.some(g => g.rsvpStatus === 'attending' && g.dietaryRestrictions.includes(diet))) && (
                            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-100 rounded-2xl">
                                <p className="text-sm text-gray-400 italic">No dietary restrictions reported yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
