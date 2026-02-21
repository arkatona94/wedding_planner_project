import { Edit2, Trash2, Mail, Phone, Gift, Users } from 'lucide-react'
import type { Guest } from '../../types'

interface GuestCardProps {
    guest: Guest
    onEdit: (guest: Guest) => void
    onDelete: (id: string) => void
}

export default function GuestCard({ guest, onEdit, onDelete }: GuestCardProps) {
    const getRsvpBadge = (status: string) => {
        switch (status) {
            case 'attending': return 'bg-green-100 text-green-800'
            case 'declined': return 'bg-red-100 text-red-800'
            case 'maybe': return 'bg-yellow-100 text-yellow-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-medium text-gray-900 text-lg">
                        {guest.firstName} {guest.lastName}
                    </h3>
                    <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getRsvpBadge(guest.rsvpStatus)}`}>
                            {guest.rsvpStatus}
                        </span>
                        {guest.ageGroup && guest.ageGroup !== 'Adult' && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                {guest.ageGroup}
                            </span>
                        )}
                        {guest.group && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                {guest.group}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-1">
                    <button
                        onClick={() => onEdit(guest)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        onClick={() => onDelete(guest.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600">
                {guest.email && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400" />
                        <span>{guest.email}</span>
                    </div>
                )}
                {guest.phone && (
                    <div className="flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{guest.phone}</span>
                    </div>
                )}
            </div>

            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-sm">
                <div className="flex flex-col gap-1">
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold">Meal</span>
                    <span className="font-medium text-gray-700">{guest.mealChoice || 'Not selected'}</span>
                </div>

                {guest.plusOne && (
                    <div className="flex flex-col gap-1 items-end">
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1">
                            <Users size={12} /> Plus One
                        </span>
                        <span className="font-medium text-gray-700">{guest.plusOneName || 'Yes'}</span>
                    </div>
                )}
            </div>

            {guest.giftSent && (
                <div className="mt-2 text-xs text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded w-fit">
                    <Gift size={12} />
                    Gift Sent
                </div>
            )}
        </div>
    )
}
