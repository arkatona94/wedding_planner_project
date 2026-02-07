/**
 * Generate Application Documentation Word Document
 * Creates a comprehensive Word document outlining the EverAfter Wedding Planner application.
 */

const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, PageBreak, AlignmentType, BorderStyle } = require('docx');
const fs = require('fs');

async function generateDocumentation() {
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Title
                new Paragraph({
                    text: "EverAfter Wedding Planner",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                    text: "Application Documentation",
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 }
                }),

                // Table of Contents
                new Paragraph({
                    text: "Table of Contents",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({ text: "1. Application Overview", bullet: { level: 0 } }),
                new Paragraph({ text: "2. Technology Stack", bullet: { level: 0 } }),
                new Paragraph({ text: "3. Database Architecture (Supabase)", bullet: { level: 0 } }),
                new Paragraph({ text: "4. Vendor Management System", bullet: { level: 0 } }),
                new Paragraph({ text: "5. API Keys & Integrations", bullet: { level: 0 } }),
                new Paragraph({ text: "6. Key Features", bullet: { level: 0 } }),
                new Paragraph({ text: "7. File Structure", bullet: { level: 0 } }),
                new Paragraph({ children: [new PageBreak()] }),

                // 1. Application Overview
                new Paragraph({
                    text: "1. Application Overview",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "EverAfter is a comprehensive wedding planning \"Command Center\" that combines the best features from top wedding apps (The Knot, Zola, Joy, Bridebook, Prismm) into a single, privacy-first application. The application provides couples with all the tools they need to plan their perfect wedding day.",
                    spacing: { after: 200 }
                }),

                new Paragraph({
                    text: "Key Capabilities",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "• Planning Hub: Adaptive checklists, budget tracker, visual dashboard with charts and countdown" }),
                new Paragraph({ text: "• Guest Management: RSVP tracking, CSV import/export, QR code RSVP functionality" }),
                new Paragraph({ text: "• Visual Tools: Drag-and-drop seating charts, timeline builder, customizable wedding website" }),
                new Paragraph({ text: "• Vendor Management: Track contacts, contracts, pricing, ratings, deposits and payments" }),
                new Paragraph({ text: "• Photo Gallery: Zero-app photo sharing via QR code - no app download required for guests" }),
                new Paragraph({ text: "• AI Features: Virtual dress try-on via Replicate, AI-powered recommendations via Gemini" }),
                new Paragraph({ text: "• Communications: Email and SMS notifications to guests via Resend and Twilio", spacing: { after: 200 } }),
                new Paragraph({ children: [new PageBreak()] }),

                // 2. Technology Stack
                new Paragraph({
                    text: "2. Technology Stack",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "Frontend",
                    heading: HeadingLevel.HEADING_2,
                }),
                createTable([
                    ["Technology", "Purpose"],
                    ["React 18", "Core UI framework with TypeScript for type safety"],
                    ["Vite", "Build tool for fast development and optimized production builds"],
                    ["Tailwind CSS", "Utility-first CSS framework for styling"],
                    ["Zustand", "Lightweight state management"],
                    ["Recharts", "Chart library for budget visualizations"],
                    ["React Router v6", "Client-side routing"]
                ]),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Backend",
                    heading: HeadingLevel.HEADING_2,
                }),
                createTable([
                    ["Technology", "Purpose"],
                    ["Supabase", "PostgreSQL database, authentication, storage, and edge functions"],
                    ["Python Scripts", "Data processing, web scraping, communication utilities"],
                    ["Deno", "Runtime for Supabase Edge Functions"]
                ]),
                new Paragraph({ children: [new PageBreak()] }),

                // 3. Database Architecture
                new Paragraph({
                    text: "3. Database Architecture (Supabase)",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "Database Details",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "• Provider: Supabase (PostgreSQL)" }),
                new Paragraph({ text: "• Project ID: xcjelqmifskowxxdtqrh" }),
                new Paragraph({ text: "• URL: https://xcjelqmifskowxxdtqrh.supabase.co" }),
                new Paragraph({ text: "• Security: Row Level Security (RLS) enabled on all tables", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Database Tables",
                    heading: HeadingLevel.HEADING_2,
                }),
                createTable([
                    ["Table Name", "Description"],
                    ["profiles", "User profile information including email, name, avatar, and app settings"],
                    ["weddings", "Wedding event details - partner names, date, budget, guest count, venue"],
                    ["checklist_items", "Task management - title, description, category, due date, priority, status"],
                    ["budget_items", "Budget tracking - category, estimated vs actual costs, payments, due dates"],
                    ["guests", "Guest list - contact info, RSVP status, meal choice, dietary restrictions, seating"],
                    ["vendors", "Vendor management - name, category, contact info, price, rating, contract status"],
                    ["timeline_events", "Wedding day schedule - time, title, description, location"],
                    ["seating_tables", "Table layout - name, capacity, shape, position, rotation"],
                    ["room_elements", "Venue decor elements - type, position, dimensions, rotation"],
                    ["photos", "Photo gallery - URL, caption, category, favorite status"],
                    ["communication_logs", "Email/SMS history - recipient, channel, status, timestamps"]
                ]),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Database Triggers",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "• handle_new_user: Creates profile and initial wedding record on user signup" }),
                new Paragraph({ text: "• update_updated_at_column: Automatically updates timestamps on record changes", spacing: { after: 200 } }),
                new Paragraph({ children: [new PageBreak()] }),

                // 4. Vendor Management System
                new Paragraph({
                    text: "4. Vendor Management System",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "The application includes a comprehensive vendor management system with location-aware pricing and pre-populated vendor data for the Cincinnati, OH area.",
                    spacing: { after: 200 }
                }),
                new Paragraph({
                    text: "Vendor Categories",
                    heading: HeadingLevel.HEADING_2,
                }),
                createTable([
                    ["Category", "Description"],
                    ["Venue", "Ceremony and reception locations"],
                    ["Catering", "Food and beverage services"],
                    ["Photography", "Professional photographers"],
                    ["Videography", "Wedding video production"],
                    ["Florist", "Flowers and floral arrangements"],
                    ["Music/DJ", "DJs, live bands, musicians"],
                    ["Officiant", "Wedding ceremony officiants"],
                    ["Cake", "Wedding cakes and desserts"],
                    ["Rentals", "Equipment and furniture rentals"],
                    ["Transportation", "Limos, shuttles, classic cars"],
                    ["Hair & Makeup", "Bridal beauty services"]
                ]),
                new Paragraph({ text: "", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Location-Aware Features",
                    heading: HeadingLevel.HEADING_2,
                }),
                new Paragraph({ text: "The vendor generator and budget calculator use regional cost multipliers based on:" }),
                new Paragraph({ text: "• State-level cost-of-living data (50 states covered)" }),
                new Paragraph({ text: "• City-specific adjustments for major metros" }),
                new Paragraph({ text: "• Data sourced from The Knot 2024 Real Weddings Study", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Sample Regional Multipliers",
                    heading: HeadingLevel.HEADING_3,
                }),
                createTable([
                    ["Location", "Cost Multiplier"],
                    ["New York, NY", "2.00x (Highest)"],
                    ["San Francisco, CA", "1.85x"],
                    ["Los Angeles, CA", "1.70x"],
                    ["Chicago, IL", "1.35x"],
                    ["Cincinnati, OH", "0.90x (Baseline data)"],
                    ["Indianapolis, IN", "0.80x"],
                    ["Mississippi", "0.70x (Lowest)"]
                ]),
                new Paragraph({ children: [new PageBreak()] }),

                // 5. API Keys & Integrations
                new Paragraph({
                    text: "5. API Keys & Integrations",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    text: "The application integrates with several third-party services. All API keys are stored in the .env file at the project root and should never be committed to version control.",
                    spacing: { after: 200 }
                }),

                new Paragraph({
                    text: "Supabase (Database & Authentication)",
                    heading: HeadingLevel.HEADING_3,
                }),
                new Paragraph({ text: "Purpose: PostgreSQL database, user authentication, file storage, edge functions" }),
                new Paragraph({ text: "Environment Variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Google Gemini AI (AI Features)",
                    heading: HeadingLevel.HEADING_3,
                }),
                new Paragraph({ text: "Purpose: AI-powered recommendations, content generation, smart suggestions" }),
                new Paragraph({ text: "Environment Variables: VITE_GEMINI_API_KEY", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Replicate (Virtual Try-On)",
                    heading: HeadingLevel.HEADING_3,
                }),
                new Paragraph({ text: "Purpose: IDM-VTON model for virtual wedding dress try-on feature" }),
                new Paragraph({ text: "Environment Variables: VITE_REPLICATE_API_TOKEN", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Twilio (SMS Notifications)",
                    heading: HeadingLevel.HEADING_3,
                }),
                new Paragraph({ text: "Purpose: Send SMS messages to guests for RSVP reminders and updates" }),
                new Paragraph({ text: "Environment Variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER", spacing: { after: 200 } }),

                new Paragraph({
                    text: "Resend (Email Notifications)",
                    heading: HeadingLevel.HEADING_3,
                }),
                new Paragraph({ text: "Purpose: Send transactional emails for RSVP, reminders, updates" }),
                new Paragraph({ text: "Environment Variables: RESEND_API_KEY, RESEND_FROM_EMAIL", spacing: { after: 200 } }),

                new Paragraph({
                    text: "GitHub (Version Control)",
                    heading: HeadingLevel.HEADING_3,
                }),
                new Paragraph({ text: "Purpose: Repository management and collaboration" }),
                new Paragraph({ text: "Environment Variables: GITHUB_PERSONAL_ACCESS_TOKEN", spacing: { after: 200 } }),

                new Paragraph({
                    text: "API Key Status",
                    heading: HeadingLevel.HEADING_2,
                }),
                createTable([
                    ["Service", "Status", "Notes"],
                    ["Supabase", "Configured", "Project: xcjelqmifskowxxdtqrh"],
                    ["Google Gemini", "Configured", "Active API key"],
                    ["Replicate", "Configured", "IDM-VTON v1.5 model"],
                    ["Twilio", "Configured", "Account SID and Auth Token set"],
                    ["Resend", "Placeholder", "Needs real API key for production"]
                ]),
                new Paragraph({ children: [new PageBreak()] }),

                // 6. Key Features
                new Paragraph({
                    text: "6. Key Features",
                    heading: HeadingLevel.HEADING_1,
                }),

                new Paragraph({ text: "Budget Calculator", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Location-aware budget allocation based on industry standards. Uses The Knot 2024 data with regional cost adjustments. Provides recommended budget breakdowns across 15 categories.", spacing: { after: 200 } }),

                new Paragraph({ text: "Guest Management", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Full RSVP tracking with meal choices, dietary restrictions, plus-ones, and table assignments. Supports CSV import/export and QR code RSVP.", spacing: { after: 200 } }),

                new Paragraph({ text: "Seating Charts", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Drag-and-drop interface for creating table layouts. Supports round, rectangular, and custom tables. Includes room elements like dance floor, stage, bar, etc.", spacing: { after: 200 } }),

                new Paragraph({ text: "Timeline Builder", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Create detailed day-of schedules with auto-adjustment when event times change. Supports multiple day types (rehearsal dinner, wedding day, etc.)", spacing: { after: 200 } }),

                new Paragraph({ text: "Vendor Tracking", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Track vendor contacts, contracts, pricing, deposits, and ratings. Location-aware vendor suggestions with pricing estimates.", spacing: { after: 200 } }),

                new Paragraph({ text: "Virtual Dress Try-On", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "AI-powered virtual try-on using Replicate IDM-VTON model. Upload bride photo and dress image to see virtual combination.", spacing: { after: 200 } }),

                new Paragraph({ text: "Communication Center", heading: HeadingLevel.HEADING_2 }),
                new Paragraph({ text: "Send email and SMS notifications to guests directly from the app. Logs all communications for tracking.", spacing: { after: 200 } }),
                new Paragraph({ children: [new PageBreak()] }),

                // 7. File Structure
                new Paragraph({
                    text: "7. File Structure",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({
                    children: [
                        new TextRun({
                            text: `Project Root
├── src/                    # React frontend source
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components (20 pages)
│   ├── store/              # Zustand state management
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   │   ├── budgetCalculator.ts    # Budget allocation logic
│   │   └── vendorGenerator.ts     # Location-aware vendor generation
│   ├── data/               # Static JSON data (vendor lists)
│   └── lib/                # External library configs
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge functions (Deno)
│   │   └── send-notification/  # Email/SMS sending
│   └── migrations/         # Database migrations
├── execution/              # Python scripts
│   ├── venue_scraper.py    # Web scraping for venues
│   ├── send_communication.py  # Communication utilities
│   └── test_*.py           # Test scripts
├── directives/             # SOPs and documentation
├── backend/                # Backend utilities
├── .env                    # Environment variables (not in git)
├── package.json            # Node.js dependencies
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation`,
                            font: "Consolas",
                            size: 18
                        })
                    ],
                    spacing: { after: 400 }
                }),
                new Paragraph({ children: [new PageBreak()] }),

                // Document Information
                new Paragraph({
                    text: "Document Information",
                    heading: HeadingLevel.HEADING_1,
                }),
                new Paragraph({ text: `Generated: ${new Date().toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}` }),
                new Paragraph({ text: "Application: EverAfter Wedding Planner" }),
                new Paragraph({ text: "Version: 1.0" }),
                new Paragraph({ text: "Author: AI Assistant (Antigravity)" }),
            ]
        }]
    });

    const buffer = await Packer.toBuffer(doc);
    const outputPath = 'EverAfter_Application_Documentation.docx';
    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Documentation saved to: ${outputPath}`);
}

function createTable(data) {
    const rows = data.map((rowData, rowIndex) => {
        return new TableRow({
            children: rowData.map(cellText => {
                return new TableCell({
                    children: [new Paragraph({
                        children: [new TextRun({
                            text: cellText,
                            bold: rowIndex === 0
                        })]
                    })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                });
            })
        });
    });

    return new Table({
        rows: rows,
        width: { size: 100, type: WidthType.PERCENTAGE }
    });
}

generateDocumentation().catch(console.error);
