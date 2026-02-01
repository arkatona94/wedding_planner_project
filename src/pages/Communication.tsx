import { useState, useMemo } from 'react'
import { useWeddingStore } from '../store/weddingStore'
import { QRCodeSVG } from 'qrcode.react'
import { format } from 'date-fns'

export default function Communication() {
    const wedding = useWeddingStore((state) => state.wedding)
    const setWedding = useWeddingStore((state) => state.setWedding)
    const guests = useWeddingStore((state) => state.guests)
    const updateGuestCommunication = useWeddingStore((state) => state.updateGuestCommunication)

    const [activeTab, setActiveTab] = useState<'details' | 'guests' | 'qr'>('details')
    const [selectedGuests, setSelectedGuests] = useState<string[]>([])
    const [sendingStatus, setSendingStatus] = useState<string | null>(null)

    // QR Code vCalendar generation
    const vCalendarString = useMemo(() => {
        const start = wedding.weddingDate?.replace(/-/g, '') || ''
        const summary = `${wedding.partner1Name} & ${wedding.partner2Name}'s Wedding`
        const description = `Ceremony at ${wedding.ceremonyVenue}. Reception at ${wedding.receptionVenue}.`
        const location = wedding.sameLocation
            ? wedding.ceremonyAddress
            : `${wedding.ceremonyAddress} (Ceremony) / ${wedding.receptionAddress} (Reception)`

        return [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `DTSTART:${start}T120000`,
            `DTEND:${start}T230000`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${description}`,
            `LOCATION:${location}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\n')
    }, [wedding])

    const handleSend = (type: 'saveTheDate' | 'reminder') => {
        setSendingStatus(`Sending ${type} to ${selectedGuests.length} guests...`)

        // Simulate API call and update store
        setTimeout(() => {
            selectedGuests.forEach(id => updateGuestCommunication(id, type))
            setSendingStatus(`Successfully sent ${type}!`)
            setSelectedGuests([])
            setTimeout(() => setSendingStatus(null), 3000)
        }, 1500)
    }

    const toggleGuest = (id: string) => {
        setSelectedGuests(prev =>
            prev.includes(id) ? prev.filter(gid => gid !== id) : [...prev, id]
        )
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-serif text-gray-800 dark:text-gray-100 mb-2">Communications</h1>
                <p className="text-gray-500 dark:text-gray-400">Manage guest outreach, event details, and digital reminders.</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                <button
                    onClick={() => setActiveTab('details')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'details'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Event Details
                </button>
                <button
                    onClick={() => setActiveTab('guests')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'guests'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Guest Outreach
                </button>
                <button
                    onClick={() => setActiveTab('qr')}
                    className={`px-6 py-3 font-medium transition-colors border-b-2 ${activeTab === 'qr'
                            ? 'border-primary-600 text-primary-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    QR Code
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {activeTab === 'details' && (
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-800 dark:text-gray-100">Location Details</h3>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={wedding.sameLocation}
                                        onChange={(e) => setWedding({ sameLocation: e.target.checked })}
                                        className="rounded text-primary-600"
                                    />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Same location for both</span>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ceremony */}
                                <div className="space-y-4">
                                    <h4 className="font-medium text-primary-600 border-b pb-1">Ceremony</h4>
                                    <div>
                                        <label className="label">Venue Name</label>
                                        <input
                                            type="text"
                                            value={wedding.ceremonyVenue}
                                            onChange={(e) => setWedding({ ceremonyVenue: e.target.value })}
                                            className="input w-full"
                                            placeholder="e.g. St. Patrick's Cathedral"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Address</label>
                                        <textarea
                                            value={wedding.ceremonyAddress}
                                            onChange={(e) => setWedding({ ceremonyAddress: e.target.value })}
                                            className="input w-full h-20"
                                            placeholder="Street, City, Zip"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Website / Marriage Link</label>
                                        <input
                                            type="url"
                                            value={wedding.ceremonyLink}
                                            onChange={(e) => setWedding({ ceremonyLink: e.target.value })}
                                            className="input w-full"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                {/* Reception */}
                                {!wedding.sameLocation && (
                                    <div className="space-y-4">
                                        <h4 className="font-medium text-secondary-600 border-b pb-1">Reception</h4>
                                        <div>
                                            <label className="label">Venue Name</label>
                                            <input
                                                type="text"
                                                value={wedding.receptionVenue}
                                                onChange={(e) => setWedding({ receptionVenue: e.target.value })}
                                                className="input w-full"
                                                placeholder="e.g. The Grand Ballroom"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Address</label>
                                            <textarea
                                                value={wedding.receptionAddress}
                                                onChange={(e) => setWedding({ receptionAddress: e.target.value })}
                                                className="input w-full h-20"
                                                placeholder="Street, City, Zip"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Reception Link</label>
                                            <input
                                                type="url"
                                                value={wedding.receptionLink}
                                                onChange={(e) => setWedding({ receptionLink: e.target.value })}
                                                className="input w-full"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'guests' && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-4 bg-gray-50 dark:bg-gray-700 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedGuests(guests.map(g => g.id))}
                                        className="text-sm text-primary-600 hover:underline"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        onClick={() => setSelectedGuests([])}
                                        className="text-sm text-gray-500 hover:underline"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleSend('saveTheDate')}
                                        disabled={selectedGuests.length === 0}
                                        className="btn-primary py-2 text-sm"
                                    >
                                        Send Save-the-Date
                                    </button>
                                    <button
                                        onClick={() => handleSend('reminder')}
                                        disabled={selectedGuests.length === 0}
                                        className="btn-secondary py-2 text-sm"
                                    >
                                        Send Text Reminder
                                    </button>
                                </div>
                            </div>

                            {sendingStatus && (
                                <div className="p-3 bg-blue-50 text-blue-700 text-sm text-center">
                                    {sendingStatus}
                                </div>
                            )}

                            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
                                {guests.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        No guests added yet. Go to the Guests page to add some!
                                    </div>
                                ) : (
                                    guests.map(guest => (
                                        <div
                                            key={guest.id}
                                            onClick={() => toggleGuest(guest.id)}
                                            className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedGuests.includes(guest.id) ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedGuests.includes(guest.id)}
                                                readOnly
                                                className="rounded text-primary-600 h-5 w-5"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-800 dark:text-gray-200">
                                                    {guest.firstName} {guest.lastName}
                                                </p>
                                                <div className="flex gap-4 text-xs text-gray-500">
                                                    <span className="truncate">{guest.email || 'No email'}</span>
                                                    <span>{guest.phone || 'No phone'}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                {guest.saveTheDateSent && (
                                                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] uppercase font-bold">
                                                        STD Sent
                                                    </span>
                                                )}
                                                {guest.reminderSent && (
                                                    <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] uppercase font-bold">
                                                        Reminder Sent
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'qr' && (
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center space-y-6">
                            <div className="text-center space-y-2">
                                <h3 className="text-xl font-serif text-gray-800 dark:text-gray-100">Guest Calendar Sync</h3>
                                <p className="text-sm text-gray-500 max-w-md">
                                    Guests can scan this QR code to automatically add your wedding events to their phone's calendar.
                                </p>
                            </div>

                            <div className="p-6 bg-white rounded-2xl shadow-lg">
                                <QRCodeSVG
                                    value={vCalendarString}
                                    size={256}
                                    level="H"
                                    includeMargin={true}
                                />
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg w-full max-w-lg">
                                <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Encoded Details:</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-gray-500">
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Event:</span>
                                    <span>{wedding.partner1Name} & {wedding.partner2Name}'s Wedding</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Date:</span>
                                    <span>{wedding.weddingDate || 'Not set'}</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Ceremony:</span>
                                    <span className="truncate">{wedding.ceremonyVenue || 'Not set'}</span>
                                    <span className="font-medium text-gray-600 dark:text-gray-400">Reception:</span>
                                    <span className="truncate">{wedding.receptionVenue || 'Not set'}</span>
                                </div>
                            </div>

                            <button className="btn-secondary text-sm">
                                Download QR Code
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-wedding-blush p-6 rounded-xl space-y-4">
                        <h3 className="font-serif text-lg text-primary-700">Communication Tips</h3>
                        <ul className="text-sm text-gray-700 space-y-3">
                            <li className="flex gap-2">
                                <span className="text-primary-600">💌</span>
                                Save-the-dates should ideally be sent 6-8 months before.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary-600">📱</span>
                                SMS reminders are perfect for 1 week before the big day.
                            </li>
                            <li className="flex gap-2">
                                <span className="text-primary-600">🗓️</span>
                                Add the QR code to your printed invitations for ease of use.
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-xl text-white space-y-4">
                        <h3 className="font-serif text-lg">Send History</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Total Guests</span>
                                <span>{guests.length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">STDs Sent</span>
                                <span>{guests.filter(g => g.saveTheDateSent).length}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Reminders Sent</span>
                                <span>{guests.filter(g => g.reminderSent).length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
