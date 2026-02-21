import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'
import type { Guest, GuestGroup, AgeGroup, RSVPStatus, PartyMember } from '../../types'

interface AddGuestModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (data: Partial<Guest>) => void
    guestToEdit: Guest | null
}

const mealOptions = ['Chicken', 'Beef', 'Fish', 'Vegetarian', 'Vegan', 'Kids Meal']
const dietaryOptions = ['Gluten-Free', 'Dairy-Free', 'Nut Allergy', 'Shellfish Allergy', 'Kosher', 'Halal']
const mainGroups: GuestGroup[] = ['Family', 'Friends', 'Work', 'Other']

export default function AddGuestModal({ isOpen, onClose, onSubmit, guestToEdit }: AddGuestModalProps) {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
        rsvpStatus: 'pending' as RSVPStatus,
        mealChoice: '',
        dietaryRestrictions: [] as string[],
        plusOne: false,
        plusOneName: '',
        tableAssignment: null as string | null,
        relationship: 'Other' as GuestGroup, // Mapping 'group' from user request to our 'group' field which we treat as relationship category
        group: 'Other' as GuestGroup,
        isBrideSide: false,
        isGroomSide: false,
        notes: '',
        partyMembers: [] as PartyMember[],
        ageGroup: 'Adult' as AgeGroup,
        giftSent: false
    })

    useEffect(() => {
        if (guestToEdit) {
            setFormData({
                firstName: guestToEdit.firstName,
                lastName: guestToEdit.lastName,
                email: guestToEdit.email,
                phone: guestToEdit.phone,
                address: guestToEdit.address,
                rsvpStatus: guestToEdit.rsvpStatus,
                mealChoice: guestToEdit.mealChoice,
                dietaryRestrictions: guestToEdit.dietaryRestrictions,
                plusOne: guestToEdit.plusOne,
                plusOneName: guestToEdit.plusOneName,
                tableAssignment: guestToEdit.tableAssignment,
                relationship: guestToEdit.group as GuestGroup,
                group: guestToEdit.group as GuestGroup,
                isBrideSide: guestToEdit.isBrideSide,
                isGroomSide: guestToEdit.isGroomSide,
                notes: guestToEdit.notes,
                partyMembers: guestToEdit.partyMembers || [],
                ageGroup: guestToEdit.ageGroup || 'Adult',
                giftSent: guestToEdit.giftSent || false
            })
        } else {
            setFormData({
                firstName: '', lastName: '', email: '', phone: '',
                address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
                rsvpStatus: 'pending', mealChoice: '', dietaryRestrictions: [],
                plusOne: false, plusOneName: '', tableAssignment: null, relationship: 'Other', group: 'Other',
                isBrideSide: false, isGroomSide: false, notes: '', partyMembers: [],
                ageGroup: 'Adult', giftSent: false
            })
        }
    }, [guestToEdit, isOpen])

    if (!isOpen) return null

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Map 'relationship' back to 'group' if we decided to use that
        const submissionData = {
            ...formData,
            group: formData.relationship // Using relationship dropdown to populate group
        }
        onSubmit(submissionData)
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8 text-left">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 shadow-xl animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-serif text-gray-800">
                        {guestToEdit ? 'Edit Guest' : 'Add Guest'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input type="text" required className="input-field w-full" value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input type="text" required className="input-field w-full" value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" className="input-field w-full" value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" className="input-field w-full" value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>

                    {/* Address Section */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                        <h3 className="text-sm font-medium text-gray-900">Address</h3>
                        <div className="grid grid-cols-1 gap-3">
                            <input type="text" placeholder="Street Address" className="input-field w-full"
                                value={formData.address.street}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <input type="text" placeholder="City" className="input-field"
                                value={formData.address.city}
                                onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="text" placeholder="State" className="input-field"
                                    value={formData.address.state}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} />
                                <input type="text" placeholder="Zip" className="input-field"
                                    value={formData.address.zipCode}
                                    onChange={(e) => setFormData({ ...formData, address: { ...formData.address, zipCode: e.target.value } })} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Category & Side</label>
                            <div className="space-y-3">
                                <select className="input-field w-full" value={formData.relationship} onChange={(e) => setFormData({ ...formData, relationship: e.target.value as GuestGroup })}>
                                    {mainGroups.map(group => <option key={group} value={group}>{group}</option>)}
                                </select>

                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded text-primary-600 focus:ring-primary-500"
                                            checked={formData.isBrideSide} onChange={(e) => setFormData({ ...formData, isBrideSide: e.target.checked })} />
                                        <span className="text-sm text-gray-600">Bride Side</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500"
                                            checked={formData.isGroomSide} onChange={(e) => setFormData({ ...formData, isGroomSide: e.target.checked })} />
                                        <span className="text-sm text-gray-600">Groom Side</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
                            <div className="space-y-3">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <select className="input-field w-full" value={formData.ageGroup} onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as AgeGroup })}>
                                            <option value="Adult">Adult</option>
                                            <option value="Child">Child</option>
                                            <option value="Infant">Infant</option>
                                        </select>
                                    </div>
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer mt-2">
                                    <input type="checkbox" className="rounded text-green-600 focus:ring-green-500"
                                        checked={formData.giftSent} onChange={(e) => setFormData({ ...formData, giftSent: e.target.checked })} />
                                    <span className="text-sm font-medium text-gray-700">Gift Sent?</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Choice</label>
                            <select className="input-field w-full" value={formData.mealChoice} onChange={(e) => setFormData({ ...formData, mealChoice: e.target.value })}>
                                <option value="">Select meal</option>
                                {mealOptions.map(meal => <option key={meal} value={meal}>{meal}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                            <input type="checkbox" id="plusOne" className="rounded text-primary-600 focus:ring-primary-500"
                                checked={formData.plusOne} onChange={(e) => setFormData({ ...formData, plusOne: e.target.checked })} />
                            <label htmlFor="plusOne" className="text-sm font-medium text-gray-700 cursor-pointer">Plus One Allowed</label>
                        </div>
                    </div>

                    {formData.plusOne && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-200">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plus One Name</label>
                            <input type="text" className="input-field w-full" placeholder="Name of guest" value={formData.plusOneName}
                                onChange={(e) => setFormData({ ...formData, plusOneName: e.target.value })} />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Restrictions</label>
                        <div className="flex flex-wrap gap-2">
                            {dietaryOptions.map(diet => (
                                <label key={diet} className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-colors border ${formData.dietaryRestrictions.includes(diet)
                                    ? 'bg-primary-50 text-primary-700 border-primary-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary-200'
                                    }`}>
                                    <input type="checkbox" className="hidden" checked={formData.dietaryRestrictions.includes(diet)}
                                        onChange={(e) => {
                                            const newDietary = e.target.checked
                                                ? [...formData.dietaryRestrictions, diet]
                                                : formData.dietaryRestrictions.filter(d => d !== diet)
                                            setFormData({ ...formData, dietaryRestrictions: newDietary })
                                        }} />
                                    {diet}
                                    {formData.dietaryRestrictions.includes(diet) && <Check size={12} className="inline ml-1" />}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">Cancel</button>
                        <button type="submit" className="btn-primary px-6 py-2">
                            {guestToEdit ? 'Save Changes' : 'Add Guest'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
