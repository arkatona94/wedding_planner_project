/**
 * Location-Aware Vendor Data Generator
 * Generates realistic vendor placeholders based on user's city and state
 * Uses regional cost multipliers for pricing
 * Now includes REAL data for major hubs (NYC, LA, Chicago)
 */

import { getLocationMultiplier } from './budgetCalculator'
import type { Vendor, VendorCategory } from '../types'
import { v4 as uuidv4 } from 'uuid'

// --- REAL DATA DATASETS ---

const REAL_VENUES: Record<string, string[]> = {
    'NY': [
        'The Plaza Hotel', 'New York Public Library', 'The Rainbow Room', 'Cipriani Wall Street',
        'Cipriani 42nd Street', 'Lotte New York Palace', 'The Pierre', 'Gotham Hall',
        'The Metropolitan Club', 'Waldorf Astoria New York', 'The St. Regis New York',
        'Brooklyn Botanic Garden', '620 Loft & Garden', 'The Foundry', 'Tribeca Rooftop',
        'TWA Hotel', 'The Glasshouses', 'Mandarin Oriental New York', 'The Carlyle',
        'Gramercy Park Hotel', 'Blue Hill at Stone Barns', 'Oheka Castle', 'Wave Hill',
        'The River Café', 'Guastavino\'s', 'Pier Sixty', 'Current', 'The Lighthouse',
        'Central Park Boathouse', 'Tavern on the Green', 'Harold Pratt House',
        'Merchant\'s House Museum', 'Prospect Park Boathouse', 'Weylin', 'Liberty Warehouse',
        'Wythe Hotel', 'William Vale', 'Box House Hotel', 'Glasshouse Chelsea',
        'Midtown Loft & Terrace', 'Soho Grand Hotel', 'The Beekman', 'Public Hotel',
        '1 Hotel Brooklyn Bridge', 'The Bowery Hotel', 'Hotel Chelsea', 'Crosby Street Hotel',
        'The High Line Hotel', 'Angel Orensanz Foundation', 'Brooklyn Museum'
    ],
    'CA': [
        'The Beverly Hills Hotel', 'Hotel Bel-Air', 'The Langham Huntington, Pasadena',
        'Terranea Resort', 'Shutters on the Beach', 'Hotel Casa del Mar', 'Fairmont Miramar',
        'Vibiana', 'The Ebell of Los Angeles', 'Greystone Mansion', 'Descanso Gardens',
        'Huntington Library', 'Skirball Cultural Center', 'Getty Center', 'Los Angeles Arboretum',
        'Calamigos Ranch', 'Saddlerock Ranch', 'Malibu Rocky Oaks', 'Adamson House',
        'Bel-Air Bay Club', 'Jonathan Club', 'California Club', 'The Biltmore Los Angeles',
        'Union Station Los Angeles', 'Walt Disney Concert Hall', 'Natural History Museum of LA',
        'Academy Museum of Motion Pictures', 'The Hollywood Roosevelt', 'Chateau Marmont',
        'Sunset Tower Hotel', 'The London West Hollywood', 'Waldorf Astoria Beverly Hills',
        'Four Seasons Los Angeles at Beverly Hills', 'SLS Hotel Beverly Hills', 'Pendry West Hollywood',
        '1 Hotel West Hollywood', 'The Victorian Santa Monica', 'Lombardi House',
        'Carondelet House', 'Fig & Olive', 'Redbird', 'Grass Room', 'SmogShoppe',
        'Millwick', 'Valentine', 'Houdini Estate', 'Paramount Pictures Studios',
        'Warner Bros. Studios', 'Universal Studios Hollywood', 'Riviera Country Club'
    ],
    'IL': [
        'The Drake Hotel', 'The Palmer House Hilton', 'Chicago Cultural Center',
        'The Rookery Building', 'Chicago Botanic Garden', 'Adler Planetarium',
        'Shedd Aquarium', 'Field Museum', 'Museum of Science and Industry',
        'Art Institute of Chicago', 'Chicago History Museum', 'Café Brauer',
        'Lincoln Park Conservatory', 'Garfield Park Conservatory', 'The Crystal Gardens',
        'Navy Pier', 'Peninsula Chicago', 'The Langham Chicago', 'Waldorf Astoria Chicago',
        'Four Seasons Chicago', 'Ritz-Carlton Chicago', 'LondonHouse Chicago',
        'Trump International Hotel & Tower', 'Sofitel Chicago Magnificent Mile',
        'The Gwen', 'Virgin Hotels Chicago', 'Chicago Athletic Association',
        'University Club of Chicago', 'Union League Club', 'Standard Club',
        'Mid-America Club', 'Metropolitan Club', 'Bridgeport Art Center',
        'Morgan Manufacturing', 'Revel Motor Row', 'Revel Fulton Market',
        'Salvage One', 'Artifact Events', 'Greenhouse Loft', 'The Joinery',
        'Loft on Lake', 'City View Loft', 'Galleria Marchetti', 'River Roast',
        'Chicago Illuminating Company', 'Ivy Room', 'Sepia', 'Boka', 'Girl & the Goat',
        'Alinea'
    ]
}

// Extended templates for generating diverse names when real data isn't available
const VENDOR_NAME_TEMPLATES: Record<string, string[]> = {
    venue: [ // Fallbacks
        '{city} Grand Ballroom', 'The {city} Estate', '{city} Gardens', 'The Historic {city} Hotel'
    ],
    catering: [
        '{city} Premier Catering', 'Elegant Events by {city}', '{city} Gourmet Kitchen',
        'A Taste of {city}', '{city} Fine Dining', 'The {city} Chef Collective',
        'Savor {city}', 'Culinary Arts {city}', 'Farm to Fork {city}',
        '{city} Banquet Services', 'Deliciously {city}', 'The {state} Table',
        'Fusion Catering {city}', 'Classic Tastes {city}', 'Signature Dishes {city}',
        'Elite Catering {city}', 'Modern Palate {city}', 'Heirloom Catering',
        'Blue Ribbon {city}', 'Grand Occasions {city}', 'Prestige Catering',
        'Seasoned with Love', 'Urban Kitchen {city}', 'Rustic Roots Catering'
    ],
    photography: [
        '{city} Wedding Photography', 'Moments by {city} Studios', '{city} Lens',
        'Capture {city}', '{city} Portrait Studio', 'Love Stories {city}',
        'Focus on {city}', 'Timeless Images {city}', '{city} Visuals',
        'Through the Lens {city}', 'Light & Love {city}', 'Artistic Eye {city}',
        '{city} Photo Co.', 'Memories of {city}', 'The {city} Photographer',
        'Golden Hour {city}', 'Candid Moments {city}', 'Vivid Dreams Photography',
        'Eternal Shutters', 'Life in Focus {city}', 'Pure Emotion Photography',
        'Storybook Weddings {city}', 'Classic Frames', 'Modern Love Photography'
    ],
    videography: [
        '{city} Wedding Films', 'Cinematic {city}', '{city} Video Productions',
        'Forever Films {city}', '{city} Motion Pictures', 'Storyteller {city}',
        'Reel Love {city}', '{city} Cinema', 'Moving Pictures {city}',
        'Vivid {city} Films', 'The {city} Videographer', 'Epic Moments {city}',
        'Love on Film {city}', 'Wedding Highlights {city}', 'Timeless Cinema'
    ],
    florist: [
        '{city} Floral Design', 'Petals of {city}', '{city} Bloom Studio',
        'The {city} Flower Shop', '{city} Garden Florist', 'Blooms & Bouquets',
        'Floral Artistry {city}', 'Nature\'s Best {city}', 'The Posy Shop',
        '{city} Rose Garden', 'Wildflower {city}', 'Elegant Stems',
        'Botanical Beauty {city}', 'Fresh Flowers {city}', 'The Green Room',
        'Lush Petals', 'Gardenia Design', 'Orchid & Vine', 'Sunflower Studios'
    ],
    music: [
        '{city} DJ Entertainment', 'Party Rockers {city}', '{city} Live Music',
        'The {city} Sound', '{city} Wedding Band', 'Rhythm & Beats',
        'Melody Makers {city}', '{city} Strings', 'Harmony {city}',
        'Dance Floor Kings', 'Acoustic Soul {city}', 'The {city} Orchestra',
        'Soundwave {city}', 'Music Magic', 'Celebration Tunes',
        'Midnight Groove', 'The Wedding DJs', 'Classic Quartets'
    ],
    cake: [
        '{city} Cake Creations', 'Sweet {city} Bakery', 'The {city} Cake Studio',
        '{city} Custom Cakes', 'Dream Cakes of {city}', 'Sugar & Spice',
        'Confections by {city}', 'The Icing on Top', 'Tiered Perfection',
        'Baked with Love', 'Gourmet Sweets {city}', 'The Pastry Shop',
        'Cake Art {city}', 'Delightful Desserts', 'Sweet Dreams Bakery'
    ],
    'hair-makeup': [
        '{city} Bridal Beauty', 'Glamour by {city}', '{city} Beauty Team',
        'The {city} Makeup Artist', '{city} Hair & Beauty', 'Radiant {city}',
        'Blush & Glow', 'Style Studio {city}', 'Bella Beauty',
        'The Look {city}', 'Flawless {city}', 'Bridal Glow',
        'Beauty Bar {city}', 'Chic & Style', 'Lovely Looks'
    ],
    officiant: [
        '{city} Wedding Officiants', 'Ceremonies of {city}', '{city} Marriage Celebrant',
        'Love & Vows', 'United in {city}', 'Sacred Unions',
        'Forever Yours', 'The Vow Keeper', 'Tying the Knot',
        'Blessings {city}', 'Heartfelt Ceremonies', 'Modern Officiant'
    ],
    transportation: [
        '{city} Luxury Limos', 'Elite Transportation', '{city} Wedding Cars',
        'Classic Cars of {city}', 'Ride in Style', 'Royal Carriages',
        '{city} Shuttle Service', 'Vintage Rides', 'Premier Transport',
        'Black Car {city}', 'Limousine {city}', 'Executive Travel'
    ],
    rentals: [
        '{city} Party Rentals', 'Event Essentials', '{city} Wedding Rentals',
        'All Occasions {city}', 'Decor & More', 'Style Your Event',
        'Premium Rentals', 'Table & Chair {city}', 'The Rental Shop',
        'Event Design {city}', 'Celebration Rentals', 'Grand Events'
    ],
    other: [
        '{city} Wedding Planning', 'Perfect Day Planners', '{city} Invitations',
        'Paper & Ink', 'Design Studio {city}', 'Special Touches',
        'Gifts & Favors', 'The Wedding Shop', 'Bridal Boutique',
        'Tuxedo Rental {city}'
    ]
}

const REVIEWS_TEMPLATES = [
    "Absolutely amazing! {name} made our day perfect.",
    "Highly recommend! Professional, timely, and great quality.",
    "The best decision we made for our wedding was hiring {name}.",
    "Incredible service and attention to detail. 5 stars!",
    "Guests are still talking about how great {name} was!",
    "Exceeded our expectations in every way.",
    "Wonderful to work with, very responsive and helpful.",
    "Truly talented and passionate about their work.",
    "Made the planning process so much easier.",
    "A dream come true! Thank you {name}!",
    "Professionalism at its finest. Highly recommended.",
    "Couldn't asked for better service. They went above and beyond.",
    "Top notch quality and service. Worth every penny.",
    "Simply the best in {city}! Don't hesitate to book.",
    "Beautiful work, we were blown away.",
    "So happy we chose {name} for our big day.",
    "Fantastic experience from start to finish.",
    "Friendly, professional, and amazing results.",
    "The team at {name} is incredible!",
    "Made our wedding day stress-free and beautiful."
]

/**
 * Base pricing by category (national average)
 */
const BASE_PRICING: Record<string, { min: number; max: number }> = {
    venue: { min: 8000, max: 25000 },
    catering: { min: 5000, max: 18000 },
    photography: { min: 2500, max: 7000 },
    videography: { min: 2000, max: 5000 },
    florist: { min: 1500, max: 6000 },
    music: { min: 1000, max: 4000 },
    cake: { min: 500, max: 1500 },
    'hair-makeup': { min: 400, max: 1200 },
    officiant: { min: 300, max: 800 },
    transportation: { min: 600, max: 2000 },
    rentals: { min: 1000, max: 5000 },
    other: { min: 500, max: 3000 }
}

/**
 * Generate a realistic phone number based on state
 */
function generatePhone(state: string): string {
    const areaCodes: Record<string, string[]> = {
        'AL': ['205', '251', '256', '334', '938'],
        'AK': ['907'],
        'AZ': ['480', '520', '602', '623', '928'],
        'AR': ['479', '501', '870'],
        'CA': ['209', '213', '310', '323', '408', '415', '510', '530', '559', '562', '619', '626', '650', '661', '707', '714', '760', '805', '818', '831', '858', '909', '916', '925', '949', '951'],
        'CO': ['303', '719', '970', '720'],
        'CT': ['203', '860', '475', '959'],
        'DE': ['302'],
        'DC': ['202'],
        'FL': ['239', '305', '321', '352', '386', '407', '561', '727', '754', '772', '786', '813', '850', '863', '904', '941', '954'],
        'GA': ['229', '404', '470', '478', '678', '706', '770', '912'],
        'HI': ['808'],
        'ID': ['208', '986'],
        'IL': ['217', '224', '309', '312', '331', '618', '630', '708', '773', '815', '847'],
        'IN': ['219', '260', '317', '463', '574', '765', '812', '930'],
        'IA': ['319', '515', '563', '641', '712'],
        'KS': ['316', '620', '785', '913'],
        'KY': ['270', '364', '502', '606', '859'],
        'LA': ['225', '318', '337', '504', '985'],
        'ME': ['207'],
        'MD': ['240', '301', '410', '443', '667'],
        'MA': ['339', '351', '413', '508', '617', '774', '781', '857', '978'],
        'MI': ['231', '248', '269', '313', '517', '586', '616', '734', '810', '906', '947', '989'],
        'MN': ['218', '320', '507', '612', '651', '763', '952'],
        'MS': ['228', '601', '662', '769'],
        'MO': ['314', '417', '573', '636', '660', '816'],
        'MT': ['406'],
        'NE': ['308', '402', '531'],
        'NV': ['702', '725', '775'],
        'NH': ['603'],
        'NJ': ['201', '551', '609', '732', '848', '856', '862', '908', '973'],
        'NM': ['505', '575'],
        'NY': ['212', '315', '332', '347', '516', '518', '585', '607', '631', '646', '716', '718', '845', '914', '917', '929', '934'],
        'NC': ['252', '336', '704', '743', '828', '910', '919', '980', '984'],
        'ND': ['701'],
        'OH': ['216', '234', '330', '419', '440', '513', '567', '614', '740', '937'],
        'OK': ['405', '539', '580', '918'],
        'OR': ['458', '503', '541', '971'],
        'PA': ['215', '267', '272', '412', '445', '484', '570', '610', '717', '724', '814', '878'],
        'RI': ['401'],
        'SC': ['803', '843', '854', '864'],
        'SD': ['605'],
        'TN': ['423', '615', '629', '731', '865', '901', '931'],
        'TX': ['210', '214', '254', '281', '325', '346', '361', '409', '430', '432', '469', '512', '682', '713', '737', '806', '817', '830', '832', '903', '915', '936', '940', '956', '972', '979'],
        'UT': ['385', '435', '801'],
        'VT': ['802'],
        'VA': ['276', '434', '540', '571', '703', '757', '804'],
        'WA': ['206', '253', '360', '425', '509', '564'],
        'WV': ['304', '681'],
        'WI': ['262', '414', '534', '608', '715', '920'],
        'WY': ['307']
    }

    const st = state.toUpperCase().substring(0, 2);
    const codes = areaCodes[st] || ['555'];
    const areaCode = codes[Math.floor(Math.random() * codes.length)];
    const prefix = String(Math.floor(Math.random() * 900) + 100);
    const line = String(Math.floor(Math.random() * 9000) + 1000);

    return `(${areaCode}) ${prefix}-${line}`;
}

/**
 * Generate a realistic website URL
 */
function generateWebsite(name: string): string {
    const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domains = ['.com', '.net', '.org', '.wedding'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `https://www.${cleanName}${domain}`;
}

/**
 * Convert price to price range indicator
 */
function getPriceRange(price: number, category?: string): string {
    const base = category ? (BASE_PRICING[category] || { min: 1000, max: 5000 }) : { min: 3000, max: 15000 };
    if (price < base.min * 1.5) return '$';
    if (price < base.max * 0.8) return '$$';
    if (price < base.max * 1.2) return '$$$';
    return '$$$$';
}

/**
 * Generate vendors for a specific category and location
 */
export function generateVendorsForLocation(
    category: VendorCategory,
    city: string,
    state: string,
    count: number = 8
): Vendor[] {
    const vendors: Vendor[] = [];
    const templates = VENDOR_NAME_TEMPLATES[category] || VENDOR_NAME_TEMPLATES.venue;
    const pricing = BASE_PRICING[category] || { min: 1000, max: 5000 };
    const multiplier = getLocationMultiplier(state, city);

    // Check for REAL data first
    let realNames: string[] = [];
    const stateCode = state.toUpperCase().substring(0, 2);

    // Only use real venues if the state matches (simple mapping for now)
    if (category === 'venue' && REAL_VENUES[stateCode]) {
        realNames = REAL_VENUES[stateCode];
    }

    // Case-insensitive, properly formatted city
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    // Determine how many to generate
    const numToGenerate = count;

    for (let i = 0; i < numToGenerate; i++) {
        let name = "";
        let isReal = false;

        // Try to pick a real name first
        if (i < realNames.length) {
            name = realNames[i];
            isReal = true;
        } else {
            // Pick a random template if run out of real names or no real data
            const template = templates[i % templates.length];
            name = template.replace(/{city}/g, formattedCity).replace(/{state}/g, state.toUpperCase());
            // Add variety if converting templates
            if (i >= templates.length) {
                const suffixes = [" Studio", " Group", " & Co.", " Collective", " Designs", " Events"];
                name += suffixes[i % suffixes.length];
            }
        }

        // Generate a price within range, adjusted for location
        const basePrice = pricing.min + Math.random() * (pricing.max - pricing.min);
        const adjustedPrice = Math.round(basePrice * multiplier);

        // Generate rating - Real venues get a boost
        const minRating = isReal ? 4.5 : 3.8;
        const rating = Math.round((minRating + Math.random() * (5.0 - minRating)) * 10) / 10;
        const reviewCount = isReal ? Math.floor(Math.random() * 500) + 100 : Math.floor(Math.random() * 300) + 10;

        // Generate review text
        const reviewTemplate = REVIEWS_TEMPLATES[Math.floor(Math.random() * REVIEWS_TEMPLATES.length)];
        const review = reviewTemplate.replace(/{name}/g, name).replace(/{city}/g, formattedCity);

        // Generate address
        const streetNum = Math.floor(Math.random() * 9000) + 100;
        const streetNames = ['Main St', 'Broad St', 'Washington Ave', 'Park Blvd', 'Market St', 'Oak Ln', 'Maple Dr', '1st Ave', 'Highland Dr', 'River Rd', 'Madison Ave', '5th Ave', 'Sunset Blvd'];
        const street = streetNames[Math.floor(Math.random() * streetNames.length)];
        const zip = Math.floor(Math.random() * 89999) + 10000;
        const address = `${streetNum} ${street}, ${formattedCity}, ${state.toUpperCase()} ${zip}`;

        // Generate quality score
        const qualityScore = Math.floor(85 + Math.random() * 14);

        const images = Array.from({ length: 20 }, (_, index) =>
            `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 1000000000)}?q=80&w=800&auto=format&fit=crop&sig=${category}-${i}-${index}`
        );

        const vendor: Vendor = {
            id: uuidv4(),
            name,
            category,
            contactName: `${['Sarah', 'Michael', 'Jennifer', 'David', 'Jessica', 'James', 'Emily', 'Robert'][Math.floor(Math.random() * 8)]} ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia'][Math.floor(Math.random() * 8)]}`,
            email: `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
            phone: generatePhone(state.toUpperCase()),
            website: generateWebsite(name),
            price: adjustedPrice,
            rating: Math.min(rating, 5.0),
            notes: isReal ? `Top Rated Venue in ${city}. ${review}` : `Generated Suggestion. ${review}`,
            contracted: false,
            depositPaid: false,
            depositAmount: 0,
            tags: isReal ? ['Top Rated', 'Luxury', 'Verified', 'Popular'] : ['Local', 'Recommended'],
            costRange: getPriceRange(adjustedPrice),
            reviewCount,
            address,
            description: `${category === 'venue' ? 'Premier event space' : 'Professional wedding services'} located in ${formattedCity}. Known for exceptional quality and service.`,
            isGenerated: true,
            qualityScore,
            verified: isReal || Math.random() > 0.7,
            sampleReview: review,
            images
        };

        vendors.push(vendor);
    }

    // Sort by rating descending
    return vendors.sort((a, b) => b.rating - a.rating);
}

/**
 * Generate a complete list of ~50 vendors per category for a location
 */
export function generateAllVendors(city: string, state: string): Vendor[] {
    if (!city || !state) return [];

    let allVendors: Vendor[] = [];
    const categories: VendorCategory[] = [
        'venue', 'catering', 'photography', 'videography', 'florist',
        'music', 'officiant', 'cake', 'rentals', 'transportation',
        'hair-makeup', 'other'
    ];

    // Generate 50 vendors per category as requested
    categories.forEach(category => {
        const categoryVendors = generateVendorsForLocation(category, city, state, 50);
        allVendors = [...allVendors, ...categoryVendors];
    });

    return allVendors;
}

/**
 * Check if real data exists (legacy function)
 */
export function hasRealVendorData(_state: string, _city?: string): boolean {
    return false; // Always use generator
}

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



