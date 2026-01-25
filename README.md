# EverAfter - Wedding Planner Application

A comprehensive wedding planning "Command Center" that combines the best features from top wedding apps (The Knot, Zola, Joy, Bridebook, Prismm) into a single, privacy-first application.

## Features

### Planning Hub
- **Adaptive Checklists** - Dynamic to-do lists with categories, priorities, and due dates
- **Budget Tracker** - Track expenses, payments, and get overspending warnings
- **Dashboard** - Visual overview with charts and countdown

### Guest Management
- **RSVP Tracking** - Manage responses, meal choices, dietary restrictions
- **CSV Import/Export** - Easily import guest lists
- **QR Code RSVP** - Guests can RSVP by scanning a code

### Visual Tools
- **Seating Charts** - Drag-and-drop table assignments
- **Timeline Builder** - Plan your wedding day schedule
- **Wedding Website** - Create a customizable wedding website

### Vendor Management
- Track contacts, contracts, and pricing
- Rate and compare vendors
- Monitor deposits and payments

### Photo Gallery
- **Zero-App Photo Sharing** - Guests upload via QR code
- No app download required for guests

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- Recharts (charts)
- React Router v6

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:3000`

## Architecture

This project follows a 3-layer architecture:

1. **Directives** (`/directives`) - SOPs and instructions
2. **Orchestration** - React frontend (decision making)
3. **Execution** (`/execution`) - Python scripts for data operations

## Privacy-First Design

- All data stored locally in your browser
- No data sold to third parties
- Export or delete your data anytime
- No account required

## Inspired By

| App | Best Feature Adopted |
|-----|---------------------|
| The Knot | Comprehensive checklists |
| Zola | AI-powered features, predictive budgeting |
| Joy | Free tools, photo sharing |
| Bridebook | Smart budget calculator |
| Prismm | Visual seating charts |

## Project Structure

```
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── store/         # Zustand state store
│   ├── types/         # TypeScript types
│   └── App.tsx        # Main app
├── execution/         # Python scripts
├── directives/        # SOPs and docs
└── public/            # Static assets
```

## License

MIT
