/**
 * Location-Aware Vendor Data Generator
 * Generates realistic vendor placeholders based on user's city and state
 * Uses regional cost multipliers for pricing
 */

import { getLocationMultiplier } from './budgetCalculator'

export interface GeneratedVendor {
    name: string
    address: string
    city: string
    state: string
    phone: string
    website: string
    price_range: string
    venue_type?: string
    category: string
    rating: number
    reviews_count: number
    estimated_cost: number
    amenities: string[]
    source: string
}

/**
 * Vendor name templates by category
 */
const VENDOR_NAME_TEMPLATES: Record<string, string[]> = {
    venue: [
        '{city} Grand Ballroom',
        'The {city} Estate',
        '{city} Gardens & Event Center',
        'The Historic {city} Hotel',
        '{city} Country Club',
        'Lakeside Manor at {city}',
        'The Barn at {city}',
        '{city} Wedding Pavilion',
        'Crystal Gardens of {city}',
        '{city} Botanical Events'
    ],
    catering: [
        '{city} Premier Catering',
        'Elegant Events by {city}',
        '{city} Gourmet Kitchen',
        'A Taste of {city}',
        '{city} Fine Dining Catering',
        'The {city} Chef Collective'
    ],
    photography: [
        '{city} Wedding Photography',
        'Moments by {city} Studios',
        '{city} Lens Photography',
        'Capture {city}',
        '{city} Portrait Studio',
        'Love Stories {city}'
    ],
    videography: [
        '{city} Wedding Films',
        'Cinematic {city}',
        '{city} Video Productions',
        'Forever Films {city}',
        '{city} Motion Pictures'
    ],
    florist: [
        '{city} Floral Design',
        'Petals of {city}',
        '{city} Bloom Studio',
        'The {city} Flower Shop',
        '{city} Garden Florist'
    ],
    music: [
        '{city} DJ Entertainment',
        'Party Rockers {city}',
        '{city} Live Music',
        'The {city} Sound',
        '{city} Wedding Band'
    ],
    cake: [
        '{city} Cake Creations',
        'Sweet {city} Bakery',
        'The {city} Cake Studio',
        '{city} Custom Cakes',
        'Dream Cakes of {city}'
    ],
    'hair-makeup': [
        '{city} Bridal Beauty',
        'Glamour by {city}',
        '{city} Beauty Team',
        'The {city} Makeup Artist',
        '{city} Hair & Beauty'
    ],
    officiant: [
        '{city} Wedding Officiants',
        'Ceremonies of {city}',
        '{city} Marriage Celebrant',
        'Love & Vows {city}'
    ],
    transportation: [
        '{city} Luxury Limos',
        'Elite Transportation {city}',
        '{city} Wedding Cars',
        'Classic Cars of {city}'
    ],
    rentals: [
        '{city} Party Rentals',
        'Event Essentials {city}',
        '{city} Wedding Rentals',
        'All Occasions {city}'
    ]
}

/**
 * Base pricing by category (national average)
 */
const BASE_PRICING: Record<string, { min: number; max: number }> = {
    venue: { min: 8000, max: 20000 },
    catering: { min: 5000, max: 15000 },
    photography: { min: 2500, max: 6000 },
    videography: { min: 1500, max: 4000 },
    florist: { min: 1500, max: 5000 },
    music: { min: 1000, max: 3000 },
    cake: { min: 400, max: 1200 },
    'hair-makeup': { min: 300, max: 800 },
    officiant: { min: 200, max: 500 },
    transportation: { min: 500, max: 1500 },
    rentals: { min: 800, max: 2500 }
}

/**
 * Amenities by category
 */
const CATEGORY_AMENITIES: Record<string, string[][]> = {
    venue: [
        ['Indoor Ceremony', 'Outdoor Reception', 'On-site Catering'],
        ['Gardens', 'Ballroom', 'Parking Included'],
        ['Historic Building', 'Full Service', 'AV Equipment'],
        ['Waterfront', 'Scenic Views', 'Bridal Suite'],
        ['Modern Design', 'Climate Controlled', 'Accessibility']
    ],
    catering: [
        ['Custom Menus', 'Dietary Accommodations', 'Waitstaff'],
        ['Farm-to-Table', 'Bar Service', 'Tastings Included'],
        ['International Cuisine', 'Full Setup', 'Service Included']
    ],
    photography: [
        ['Engagement Session', 'Second Shooter', 'Online Gallery'],
        ['Full Day Coverage', 'Prints Included', 'Editing Included'],
        ['Drone Photography', 'Albums', 'Rush Delivery']
    ]
}

/**
 * Generate a random phone number for a state
 */
function generatePhone(state: string): string {
    const areaCodes: Record<string, string[]> = {
        'MI': ['313', '248', '586', '734'],
        'OH': ['513', '614', '216', '440'],
        'NY': ['212', '718', '516', '914'],
        'CA': ['310', '415', '619', '408'],
        'TX': ['713', '214', '512', '817'],
        'FL': ['305', '407', '813', '954'],
        'IL': ['312', '773', '847', '630']
    }

    const codes = areaCodes[state] || ['555']
    const areaCode = codes[Math.floor(Math.random() * codes.length)]
    const prefix = String(Math.floor(Math.random() * 900) + 100)
    const line = String(Math.floor(Math.random() * 9000) + 1000)

    return `(${areaCode}) ${prefix}-${line}`
}

/**
 * Convert price to price range indicator
 */
function getPriceRange(price: number, category: string): string {
    const base = BASE_PRICING[category] || { min: 1000, max: 5000 }
    const range = base.max - base.min
    const quarter = range / 4

    if (price <= base.min + quarter) return '$'
    if (price <= base.min + quarter * 2) return '$$'
    if (price <= base.min + quarter * 3) return '$$$'
    return '$$$$'
}

/**
 * Generate vendors for a specific category and location
 */
export function generateVendorsForLocation(
    category: string,
    city: string,
    state: string,
    count: number = 5
): GeneratedVendor[] {
    const vendors: GeneratedVendor[] = []
    const templates = VENDOR_NAME_TEMPLATES[category] || VENDOR_NAME_TEMPLATES.venue
    const pricing = BASE_PRICING[category] || { min: 1000, max: 5000 }
    const multiplier = getLocationMultiplier(state, city)
    const amenitiesList = CATEGORY_AMENITIES[category] || CATEGORY_AMENITIES.venue

    // Use city name with first letter capitalized
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()

    for (let i = 0; i < Math.min(count, templates.length); i++) {
        // Generate a price within range, adjusted for location
        const basePrice = pricing.min + Math.random() * (pricing.max - pricing.min)
        const adjustedPrice = Math.round(basePrice * multiplier)

        // Generate rating between 4.0 and 5.0
        const rating = Math.round((4.0 + Math.random()) * 10) / 10
        const reviewsCount = Math.floor(Math.random() * 200) + 20

        // Get random amenities
        const amenities = amenitiesList[Math.floor(Math.random() * amenitiesList.length)] || []

        vendors.push({
            name: templates[i].replace(/{city}/g, formattedCity),
            address: `${Math.floor(Math.random() * 9000) + 1000} Main Street`,
            city: formattedCity,
            state: state.toUpperCase(),
            phone: generatePhone(state.toUpperCase()),
            website: `https://www.example.com`,
            price_range: getPriceRange(adjustedPrice, category),
            category,
            venue_type: category === 'venue' ? 'Event Center' : undefined,
            rating: Math.min(rating, 5.0),
            reviews_count: reviewsCount,
            estimated_cost: adjustedPrice,
            amenities,
            source: 'Generated for your location'
        })
    }

    return vendors.sort((a, b) => b.rating - a.rating)
}

/**
 * Get all vendor categories with generated data for a location
 */
export function getAllVendorsForLocation(
    city: string,
    state: string
): Record<string, GeneratedVendor[]> {
    const categories = Object.keys(VENDOR_NAME_TEMPLATES)
    const result: Record<string, GeneratedVendor[]> = {}

    for (const category of categories) {
        result[category] = generateVendorsForLocation(category, city, state, 5)
    }

    return result
}

/**
 * Check if we have real vendor data for a location
 * Currently returns false - would check against actual data sources
 */
export function hasRealVendorData(state: string, city?: string): boolean {
    // Currently only have real data for Ohio/Cincinnati area
    if (state.toUpperCase() === 'OH') {
        const ohioCities = ['cincinnati', 'hamilton', 'west chester', 'loveland', 'liberty township']
        if (!city || ohioCities.includes(city.toLowerCase())) {
            return true
        }
    }
    return false
}

/**
 * Get location-aware pricing estimate for a category
 */
export function getLocationPriceEstimate(
    category: string,
    state: string,
    city?: string
): { min: number; max: number; average: number } {
    const base = BASE_PRICING[category] || { min: 1000, max: 5000 }
    const multiplier = getLocationMultiplier(state, city)

    return {
        min: Math.round(base.min * multiplier),
        max: Math.round(base.max * multiplier),
        average: Math.round(((base.min + base.max) / 2) * multiplier)
    }
}
