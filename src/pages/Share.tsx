import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import { parseShareableLink } from '../utils/exports'
import type { TimelineEvent } from '../types'

interface SharedData {
  type: 'rsvp' | 'timeline' | 'info'
  weddingDetails?: {
    coupleNames: string
    weddingDate: string
    venue: string
  }
  timeline?: TimelineEvent[]
  generated?: string
}

export default function Share() {
  const location = useLocation()
  const [data, setData] = useState<SharedData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const hash = location.hash
    if (hash) {
      const parsed = parseShareableLink(hash)
      if (parsed) {
        setData(parsed)
      } else {
        setError(true)
      }
    } else {
      setError(true)
    }
  }, [location.hash])

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 max-w-md text-center shadow-lg">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-serif text-gray-800 mb-2">Invalid Link</h1>
          <p className="text-gray-500">This share link is invalid or has expired. Please request a new link from the couple.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="animate-pulse text-primary-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-serif text-primary-600">
            {data.weddingDetails?.coupleNames || 'Wedding'}
          </h1>
          {data.weddingDetails?.weddingDate && (
            <p className="text-gray-500 mt-2">
              {format(new Date(data.weddingDetails.weddingDate), 'EEEE, MMMM d, yyyy')}
            </p>
          )}
          {data.weddingDetails?.venue && (
            <p className="text-gray-500">{data.weddingDetails.venue}</p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {data.type === 'timeline' && data.timeline && (
          <div className="space-y-6">
            <h2 className="text-2xl font-serif text-gray-800 text-center mb-8">
              Wedding Day Timeline
            </h2>
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
              <div className="space-y-4">
                {[...data.timeline]
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((event, index) => (
                    <div key={index} className="relative flex gap-6">
                      <div className="w-16 text-right flex-shrink-0 pt-1">
                        <p className="text-sm font-medium text-gray-600">
                          {formatTime(event.startTime)}
                        </p>
                      </div>
                      <div
                        className="w-4 h-4 rounded-full border-4 border-white flex-shrink-0 mt-1.5 z-10"
                        style={{ backgroundColor: event.color }}
                      />
                      <div
                        className="flex-1 bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                        style={{ borderLeft: `4px solid ${event.color}` }}
                      >
                        <h3 className="font-medium text-gray-800">{event.title}</h3>
                        <p className="text-sm text-gray-500">
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-500 mt-1">@ {event.location}</p>
                        )}
                        {event.description && (
                          <p className="text-sm text-gray-600 mt-2">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {data.type === 'info' && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-serif text-gray-800 mb-4">Wedding Information</h2>
            {data.weddingDetails?.weddingDate && (
              <div className="mb-4">
                <p className="text-sm text-gray-500 uppercase tracking-wide">Date</p>
                <p className="text-lg text-gray-800">
                  {format(new Date(data.weddingDetails.weddingDate), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            )}
            {data.weddingDetails?.venue && (
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Venue</p>
                <p className="text-lg text-gray-800">{data.weddingDetails.venue}</p>
              </div>
            )}
          </div>
        )}

        {data.type === 'rsvp' && (
          <div className="bg-white rounded-xl p-8 shadow-sm text-center">
            <h2 className="text-2xl font-serif text-gray-800 mb-4">RSVP</h2>
            <p className="text-gray-500 mb-6">
              Please respond to let us know if you'll be attending.
            </p>
            <p className="text-sm text-gray-400">
              (Full RSVP form would be implemented here with backend support)
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-gray-400 text-sm">
        <p>Powered by Beginnings and Endings Wedding Planner</p>
      </div>
    </div>
  )
}
