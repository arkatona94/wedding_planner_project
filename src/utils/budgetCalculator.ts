/**
 * Budget Calculator Utility
 * Provides industry-standard wedding budget allocation percentages
 * and smart budget breakdown functionality.
 */

import type { BudgetItem } from '../types'

/**
 * Regional cost-of-living multipliers by state
 * Based on wedding cost data from The Knot 2024 Real Weddings Study
 * Normalized to national average = 1.0
 */
export const STATE_COST_MULTIPLIERS: Record<string, number> = {
    // High cost states (1.3+)
    'NY': 1.65, 'NJ': 1.55, 'CA': 1.50, 'MA': 1.45, 'CT': 1.40,
    'HI': 1.40, 'DC': 1.50, 'MD': 1.30, 'RI': 1.30, 'WA': 1.25,
    // Above average (1.1-1.29)
    'IL': 1.20, 'CO': 1.20, 'VA': 1.15, 'OR': 1.15, 'NH': 1.15,
    'AK': 1.20, 'VT': 1.10, 'PA': 1.10, 'FL': 1.10, 'AZ': 1.10,
    // Average (0.9-1.09)
    'MN': 1.05, 'TX': 1.00, 'GA': 1.00, 'NC': 0.95, 'MI': 0.95,
    'WI': 0.95, 'NV': 1.00, 'UT': 0.95, 'DE': 1.00, 'ME': 0.95,
    // Below average (0.7-0.89)
    'OH': 0.90, 'IN': 0.85, 'MO': 0.85, 'TN': 0.85, 'KY': 0.80,
    'SC': 0.85, 'LA': 0.80, 'OK': 0.75, 'KS': 0.80, 'NE': 0.80,
    'IA': 0.80, 'NM': 0.80, 'ID': 0.80, 'ND': 0.75, 'SD': 0.75,
    'WV': 0.70, 'AR': 0.70, 'MS': 0.70, 'AL': 0.75, 'MT': 0.80, 'WY': 0.80
}

/**
 * Major metro area cost adjustments (additive to state multiplier)
 * For cities with especially high wedding costs
 */
export const CITY_ADJUSTMENTS: Record<string, number> = {
    // Super premium cities (+0.3 or more)
    'new york': 0.35, 'manhattan': 0.40, 'brooklyn': 0.25,
    'san francisco': 0.35, 'los angeles': 0.20, 'chicago': 0.15,
    'boston': 0.20, 'washington': 0.15, 'seattle': 0.15,
    'miami': 0.20, 'san diego': 0.15, 'denver': 0.10,
    // High (0.05-0.15)
    'austin': 0.10, 'portland': 0.10, 'philadelphia': 0.10,
    'atlanta': 0.10, 'dallas': 0.10, 'houston': 0.05,
    'phoenix': 0.05, 'las vegas': 0.15, 'nashville': 0.10,
    // Budget metros (negative adjustments)
    'cleveland': -0.05, 'detroit': -0.05, 'indianapolis': -0.05,
    'columbus': 0.00, 'cincinnati': 0.00
}

/**
 * Base costs per category at national average
 * These are median costs from wedding industry data
 */
export const BASE_CATEGORY_COSTS: Record<string, number> = {
    'Venue': 12000,
    'Catering': 8500,
    'Photography': 3500,
    'Attire': 2500,
    'Music/DJ': 1800,
    'Flowers': 2500,
    'Videography': 2000,
    'Hair & Makeup': 600,
    'Cake': 500,
    'Invitations': 600,
    'Transportation': 800,
    'Officiant': 300,
    'Favors': 400,
    'Decor': 1200,
    'Other': 1000
}

/**
 * Get cost multiplier for a location
 */
export function getLocationMultiplier(state?: string, city?: string): number {
    let multiplier = 1.0 // National average default

    if (state) {
        multiplier = STATE_COST_MULTIPLIERS[state.toUpperCase()] || 1.0
    }

    if (city) {
        const cityLower = city.toLowerCase().trim()
        const cityAdjustment = CITY_ADJUSTMENTS[cityLower] || 0
        multiplier += cityAdjustment
    }

    return multiplier
}

/**
 * Industry-standard wedding budget allocation percentages
 * Based on national averages from The Knot and WeddingWire research
 */
export const BUDGET_ALLOCATIONS: Record<string, number> = {
    'Venue': 0.38,           // 38% - Largest expense, includes ceremony & reception
    'Catering': 0.13,        // 13% - Food and beverage
    'Photography': 0.11,     // 11% - Photographer and prints
    'Attire': 0.09,          // 9% - Wedding dress, suit, accessories
    'Music/DJ': 0.08,        // 8% - DJ or live band
    'Flowers': 0.08,         // 8% - Bouquets, centerpieces, decorations
    'Videography': 0.05,     // 5% - Wedding video
    'Hair & Makeup': 0.03,   // 3% - Bride and bridal party
    'Cake': 0.02,            // 2% - Wedding cake or dessert
    'Invitations': 0.02,     // 2% - Save-the-dates, invites, programs
    'Transportation': 0.02,  // 2% - Limo, shuttle, parking
    'Officiant': 0.01,       // 1% - Ceremony officiant
    'Favors': 0.01,          // 1% - Guest favors
    'Decor': 0.02,           // 2% - Extra decorations, rentals
    'Other': 0.03            // 3% - Contingency/miscellaneous
}

/**
 * Budget allocation display info with descriptions
 */
export const BUDGET_CATEGORY_INFO: Record<string, { description: string; tips: string }> = {
    'Venue': {
        description: 'Ceremony and reception venue rental',
        tips: 'Book early for popular dates. Consider all-inclusive packages.'
    },
    'Catering': {
        description: 'Food, beverages, and bar service',
        tips: 'Price per head varies widely. Consider cocktail-style for savings.'
    },
    'Photography': {
        description: 'Professional photographer and prints',
        tips: 'Review portfolios carefully. Book engagement session too.'
    },
    'Attire': {
        description: 'Wedding dress, suit, alterations, accessories',
        tips: 'Start shopping 9-12 months ahead for custom orders.'
    },
    'Music/DJ': {
        description: 'DJ, live band, or musicians',
        tips: 'Live bands cost 2-3x more than DJs.'
    },
    'Flowers': {
        description: 'Bouquets, boutonnieres, centerpieces, ceremony decor',
        tips: 'Use in-season flowers to save money.'
    },
    'Videography': {
        description: 'Wedding video and highlight reel',
        tips: 'Often overlooked but highly valued after the wedding.'
    },
    'Hair & Makeup': {
        description: 'Bridal beauty services and trial runs',
        tips: 'Include trial sessions in your budget.'
    },
    'Cake': {
        description: 'Wedding cake or dessert display',
        tips: 'Smaller display cake + sheet cake can save money.'
    },
    'Invitations': {
        description: 'Save-the-dates, invitations, programs, menus',
        tips: 'Digital save-the-dates are budget-friendly.'
    },
    'Transportation': {
        description: 'Limo, shuttle service, parking',
        tips: 'Consider hiring a shuttle for guests.'
    },
    'Officiant': {
        description: 'Wedding officiant or celebrant',
        tips: 'Family/friend officiants can add personal touch.'
    },
    'Favors': {
        description: 'Guest favors and thank-you gifts',
        tips: 'Edible favors like cookies or candy are popular.'
    },
    'Decor': {
        description: 'Additional decorations and rentals',
        tips: 'DIY where possible, rent instead of buy.'
    },
    'Other': {
        description: 'Contingency fund and miscellaneous',
        tips: 'Always have 3-5% buffer for unexpected costs.'
    }
}

/**
 * Generate a smart budget breakdown based on total budget and location
 * Uses location-adjusted cost estimates when provided
 * @param totalBudget - The total wedding budget
 * @param state - Optional state code for regional pricing
 * @param city - Optional city name for metro adjustments
 */
export function generateSmartBudget(
    totalBudget: number,
    state?: string,
    city?: string
): Omit<BudgetItem, 'id'>[] {
    const budgetItems: Omit<BudgetItem, 'id'>[] = []
    const locationMultiplier = getLocationMultiplier(state, city)

    // Calculate location-adjusted costs for each category
    let totalEstimated = 0
    const adjustedCosts: Record<string, number> = {}

    for (const [category, baseCost] of Object.entries(BASE_CATEGORY_COSTS)) {
        adjustedCosts[category] = Math.round(baseCost * locationMultiplier)
        totalEstimated += adjustedCosts[category]
    }

    // Scale to fit within total budget while maintaining proportions
    const scaleFactor = totalBudget / totalEstimated

    for (const [category, adjustedCost] of Object.entries(adjustedCosts)) {
        const estimatedCost = Math.round(adjustedCost * scaleFactor)

        // Generate location-specific tips
        let notes = BUDGET_CATEGORY_INFO[category]?.tips || ''
        if (state && locationMultiplier !== 1.0) {
            const adjustment = locationMultiplier > 1 ? 'higher' : 'lower'
            notes += ` Prices tend to be ${adjustment} in ${state}.`
        }

        budgetItems.push({
            category,
            vendor: '',
            estimatedCost,
            actualCost: 0,
            paid: 0,
            dueDate: '',
            notes: notes.trim()
        })
    }

    return budgetItems
}

/**
 * Calculate the percentage of budget used by category
 */
export function calculateCategoryPercentage(
    categoryTotal: number,
    totalBudget: number
): number {
    if (totalBudget === 0) return 0
    return Math.round((categoryTotal / totalBudget) * 100)
}

/**
 * Get budget health status
 */
export function getBudgetHealth(
    actualSpent: number,
    totalBudget: number
): { status: 'healthy' | 'warning' | 'over'; message: string } {
    const percentUsed = (actualSpent / totalBudget) * 100

    if (percentUsed > 100) {
        return {
            status: 'over',
            message: `Over budget by $${(actualSpent - totalBudget).toLocaleString()}`
        }
    } else if (percentUsed >= 90) {
        return {
            status: 'warning',
            message: `${Math.round(percentUsed)}% of budget used`
        }
    } else {
        return {
            status: 'healthy',
            message: `$${(totalBudget - actualSpent).toLocaleString()} remaining`
        }
    }
}

/**
 * Compare actual spending to recommended allocation
 */
export function compareToRecommended(
    category: string,
    actualSpent: number,
    totalBudget: number
): { difference: number; status: 'under' | 'over' | 'on-target' } {
    const recommendedPercent = BUDGET_ALLOCATIONS[category] || 0
    const recommended = totalBudget * recommendedPercent
    const difference = actualSpent - recommended

    if (Math.abs(difference) <= recommended * 0.1) {
        return { difference, status: 'on-target' }
    } else if (difference > 0) {
        return { difference, status: 'over' }
    } else {
        return { difference, status: 'under' }
    }
}
