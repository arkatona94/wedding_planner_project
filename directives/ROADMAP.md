# EverAfter Wedding Planner - Product Roadmap

## Current State (v1.0)

### Completed Features
- [x] PWA Support (installable, offline-capable)
- [x] Dark Mode Toggle
- [x] In-App Notification Center
- [x] PDF Exports (Guest List, Timeline, Seating Chart, Budget, Checklist)
- [x] Calendar Export (ICS) for Timeline Events
- [x] Shareable Read-Only Links
- [x] Dashboard with Analytics
- [x] Guest Management with CSV Import/Export
- [x] Budget Tracker with Vendor Sync
- [x] Vendor Management with Local Data
- [x] Seating Chart with Drag-and-Drop
- [x] Wedding Day Timeline
- [x] Photo Gallery with QR Sharing
- [x] Wedding Website Builder
- [x] Marriage Laws Database (50 US States + DC)

---

## Priority Action Steps

### Phase 1: Core Infrastructure (High Priority)

| Priority | Feature | Status | Complexity | Description |
|----------|---------|--------|------------|-------------|
| 1.1 | User Authentication | Pending | High | Add Firebase/Supabase auth for secure login |
| 1.2 | Cloud Data Sync | Pending | High | Replace localStorage with cloud database |
| 1.3 | Partner Collaboration | Pending | Medium | Invite partner to co-edit wedding plans |
| 1.4 | Email Notifications | Pending | Medium | SendGrid/Resend integration for reminders |
| 1.5 | Push Notifications | Pending | Medium | Service worker push notifications |

### Phase 2: Competitive Features (Medium Priority)

| Priority | Feature | Status | Complexity | Description |
|----------|---------|--------|------------|-------------|
| 2.1 | Gift Registry | Pending | High | Native registry or Amazon/Target API integration |
| 2.2 | AI Assistant | Pending | High | Thank-you note writer, vendor suggestions, schedule optimizer |
| 2.3 | Live Vendor Marketplace | Pending | High | Real vendor search, reviews, booking, messaging |
| 2.4 | Visual Floor Plan Designer | Pending | Medium | Drag-and-drop floor plan with venue dimensions |
| 2.5 | Digital Invitations | Pending | Medium | Full invite suite with RSVP, meal selection |
| 2.6 | Inspiration/Mood Boards | Pending | Medium | Pinterest-style boards, style quizzes |

### Phase 3: Differentiation (Lower Priority)

| Priority | Feature | Status | Complexity | Description |
|----------|---------|--------|------------|-------------|
| 3.1 | International Marriage Laws | Pending | Low | Expand beyond US to international markets |
| 3.2 | Live Streaming Integration | Pending | Medium | Virtual attendance for destination weddings |
| 3.3 | Vendor Portal | Pending | High | Let vendors claim and update listings |
| 3.4 | Wedding Day Mode | Pending | Low | Simplified view for day-of coordination |
| 3.5 | Expense Splitting | Pending | Medium | Track who paid what, Venmo/PayPal integration |
| 3.6 | Thank-You Note Tracker | Pending | Low | Track gifts and thank-you note status |

---

## Technical Debt & Improvements

### Performance
- [ ] Image optimization and lazy loading
- [ ] Code splitting for faster initial load
- [ ] Service worker caching optimization
- [ ] Bundle size reduction

### Code Quality
- [ ] Add unit tests (Jest/Vitest)
- [ ] Add E2E tests (Playwright/Cypress)
- [ ] TypeScript strict mode
- [ ] ESLint/Prettier configuration

### Accessibility
- [ ] ARIA labels and roles
- [ ] Keyboard navigation
- [ ] Screen reader compatibility
- [ ] Color contrast compliance

---

## Monetization Options

1. **Freemium Model**
   - Free: Basic planning tools
   - Premium ($9.99/mo): Advanced features (AI, seating chart, vendor marketplace)

2. **Vendor Marketplace Commission**
   - Take percentage of bookings made through the platform

3. **Digital Invitations**
   - Free: Basic templates
   - Premium: Custom designs, animations

4. **Gift Registry Affiliate**
   - Earn commission on registry purchases

---

## Competitive Comparison

| Feature | EverAfter | The Knot | Zola | WeddingWire | Joy |
|---------|-----------|----------|------|-------------|-----|
| Free Core Tools | Yes | Yes | Yes | Yes | Yes |
| Offline Support | Yes | No | No | No | No |
| Privacy-First | Yes | No | No | No | No |
| AI Features | Pending | Yes | Yes | No | No |
| Gift Registry | Pending | Yes | Yes | Yes | Yes |
| Live Marketplace | Pending | Yes | Yes | Yes | No |
| Marriage Laws DB | Yes | No | No | No | No |
| Photo Unlimited | Yes | No | Paid | No | Yes |

---

## Implementation Order (Recommended)

### Sprint 1 (Weeks 1-2): Authentication & Cloud
1. Set up Firebase/Supabase project
2. Implement user authentication (email/password, Google)
3. Migrate data from localStorage to cloud database
4. Add data encryption for privacy

### Sprint 2 (Weeks 3-4): Collaboration
1. Add partner invitation system
2. Implement real-time sync (Firestore/Supabase Realtime)
3. Add permission levels (owner, partner, viewer)
4. Create vendor sharing links

### Sprint 3 (Weeks 5-6): Notifications
1. Set up email service (SendGrid/Resend)
2. Create email templates for reminders
3. Implement notification preferences
4. Add push notification support

### Sprint 4 (Weeks 7-8): Registry & AI
1. Research registry API integrations
2. Implement gift registry feature
3. Add OpenAI/Claude API for AI assistant
4. Create thank-you note generator

### Sprint 5 (Weeks 9-10): Marketplace
1. Design vendor marketplace architecture
2. Create vendor profile pages
3. Implement vendor search and filters
4. Add review and rating system

---

## Success Metrics

- **User Acquisition**: 1,000 active users in first 3 months
- **Retention**: 60% weekly active users
- **Feature Adoption**: 80% use at least 3 features
- **NPS Score**: Target 50+
- **Conversion**: 5% free to premium

---

## Resources Needed

- **Backend Developer**: For auth, database, APIs
- **Mobile Developer**: For native iOS/Android apps (optional)
- **Designer**: For premium templates and UI polish
- **DevOps**: For deployment, scaling, monitoring

---

*Last Updated: January 2026*
*Version: 1.0.0*
