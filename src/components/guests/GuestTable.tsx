import { Edit2, Trash2, CheckCircle, XCircle, HelpCircle, Gift } from 'lucide-react'
import type { Guest } from '../../types'

interface GuestTableProps {
    guests: Guest[]
    onEdit: (guest: Guest) => void
    onDelete: (id: string) => void
}

export default function GuestTable({ guests, onEdit, onDelete }: GuestTableProps) {
    const getRsvpBadge = (status: string) => {
        switch (status) {
            case 'attending': return <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs font-semibold"><CheckCircle size={14} /> Attending</span>
            case 'declined': return <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs font-semibold"><XCircle size={14} /> Declined</span>
            case 'maybe': return <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs font-semibold"><HelpCircle size={14} /> Maybe</span>
            default: return <span className="text-gray-400 bg-gray-50 px-2 py-1 rounded-full text-xs font-semibold">Pending</span>
        }
    }

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
            <table className="w-full text-left bg-white">
                <thead className="bg-gray-50 text-gray-500 font-medium text-sm uppercase tracking-wider">
                    <tr>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Contact</th>
                        <th className="px-6 py-4">RSVP Status</th>
                        <th className="px-6 py-4">Meal Choice</th>
                        <th className="px-6 py-4 text-center">Gift Sent</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {guests.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                                No guests found matching your filters.
                            </td>
                        </tr>
                    ) : (
                        guests.map((guest) => (
                            <tr key={guest.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900">{guest.firstName} {guest.lastName}</div>
                                    <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
                                        {guest.ageGroup !== 'Adult' && <span className="text-purple-600 font-medium">{guest.ageGroup}</span>}
                                        {guest.plusOne && <span>+1: {guest.plusOneName || 'Guest'}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-600">{guest.email}</div>
                                    <div className="text-xs text-gray-400">{guest.phone}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {getRsvpBadge(guest.rsvpStatus)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {guest.mealChoice || <span className="text-gray-300">-</span>}
                                    {guest.dietaryRestrictions && guest.dietaryRestrictions.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {guest.dietaryRestrictions.map(d =>
                                                <span key={d} className="text-[10px] px-1.5 py-0.5 bg-orange-50 text-orange-600 rounded">{d}</span>
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    {guest.giftSent ? (
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-green-50 text-green-600 rounded-full">
                                            <Gift size={16} />
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-50 text-gray-300 rounded-full">
                                            <Gift size={16} />
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEdit(guest)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors" title="Edit Guest">
                                            <Edit2 size={16} />
                                        </button>
                                        <button onClick={() => onDelete(guest.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Guest">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    )
}
