# Wedding Planner Application Directive

## Overview
Beginnings and Endings is a comprehensive wedding planning application that serves as a "Command Center" for couples planning their wedding. It synthesizes the best features from top wedding planning apps (The Knot, Zola, Joy, Bridebook, Prismm) while solving common pain points.

## Architecture
This application follows the 3-layer architecture:

### Layer 1: Directives
- `directives/WEDDING.md` - Feature requirements and pain points
- `directives/wedding_planner_app.md` - This file, application SOP

### Layer 2: Orchestration
- React frontend with Zustand state management
- Component-based UI architecture
- Local storage persistence

### Layer 3: Execution
- `execution/wedding_data_export.py` - Data export operations
- `execution/guest_import.py` - Guest list import
- `execution/budget_calculator.py` - Budget calculations

## Features Implemented

### 1. Planning Hub
- **Adaptive Checklists**: Dynamic to-do list with categories, priorities, due dates
- **Budget Tracker**: Comprehensive financial tracking with category breakdown, warnings for overspending
- **Dashboard**: Real-time progress visualization with charts

### 2. Guest & Event Management
- **Guest Management**: Full RSVP tracking, meal choices, dietary restrictions, plus-ones
- **Smart Contact Collector**: CSV import/export, QR code for guest self-service
- **Zero-App Photo Sharing**: QR code for guests to upload photos without downloading apps

### 3. Visual & Technical Tools
- **Drag-and-Drop Seating**: Visual seating arrangement with table management
- **Timeline Builder**: Wedding day schedule with vendor assignments
- **Wedding Website**: Customizable website with templates and themes

### 4. Vendor Management
- **Overview**: Card-based grid layout grouped by category for easy visualization.
- **Vendor Categories (Drop-down Options)**:
  - Venue
  - Catering
  - Photography
  - Videography
  - Flowers (Florist)
  - Music/DJ
  - Officiant
  - Cake
  - Decor/Rentals
  - Transportation
  - Hair & Makeup
  - Attire
  - Other
- **Key Features & Capabilities**:
  - **CRUD Operations**: Complete ability to Add, Edit, and Delete vendors with inline editing for quick updates.
  - **Financial Integration**: Fields for Estimated Cost, Actual Cost, Deposit Paid, and Balance Due (syncs with Budget Tracker).
  - **Status Tracking**: Drop-down to track status: *Researching, Contacted, Hired, Declined*.
  - **Contract Management**: Upload and link PDF contracts to specific vendors.
  - **Rating System**: 5-star rating system for evaluating potential vendors.

## Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: Zustand with persistence
- **Charts**: Recharts
- **Routing**: React Router v6

## Running the Application

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Key Design Principles

### Privacy-First
- Data stored locally in browser (localStorage)
- No data sold to third parties
- User can export/delete all data

### Editorial Minimalism
- Clean, uncluttered interface
- Planning tools separate from marketplace
- No aggressive vendor ads

### Offline-First Resilience
- Local storage for all data
- Works without internet connection
- Export/import for backup

### Transparent Pricing
- All features clearly marked as free
- No hidden paywalls
- No "pay-to-play" rankings

## File Structure

```
Wedding_Planner_Project/
├── directives/          # Layer 1: SOPs and instructions
├── execution/           # Layer 3: Python scripts
├── src/
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── store/           # Zustand store
│   ├── types/           # TypeScript types
│   ├── App.tsx          # Main app component
│   └── main.tsx         # Entry point
├── public/              # Static assets
└── package.json         # Dependencies
```

## Future Enhancements
1. AI-powered vendor recommendations
2. 360° virtual venue tours
3. Real-time collaboration for wedding party
4. Integration with registry services
5. Mobile app (React Native)
