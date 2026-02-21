# Dashboard & Layout Walkthrough

This guide will help you verify the recent updates to the dashboard and layout.

## 1. Top Navigation Bar
- **Desktop**: You should see a fixed top navigation bar with the logo on the left and menu items (Checklist, Budget, Find Vendors, Guest List, Seating Chart, Settings) in the center.
- **Profile Dropdown**: Click the user avatar in the top right corner to access "Profile", "Settings", or "Logout".
- **Notifications**: Click the bell icon to see recent updates.
- **Mobile**: Resize your browser window to a mobile width (below 768px). The top menu should collapse into a hamburger menu icon. Click it to open the mobile navigation drawer.

## 2. Dashboard Features
The main dashboard page (`/`) has been completely redesigned.

- **Header Section**:
    - Displays a personalized welcome message (e.g., "Welcome, [Name]!").
    - Shows the wedding date and a countdown of "Days to go".
    - Includes an "Overall Progress" bar indicating completion percentage based on checklist tasks.

- **"Your Next Steps" Cards**:
    - **Virtual Dress Try-On**: Links to `/inspiration`.
    - **Set Your Budget**: Links to `/budget`.
    - **Find Vendors**: Links to `/vendors`.
    - *Note: Hover over these cards to see subtle lift and shadow effects.*

- **Upcoming Tasks**:
    - Lists up to 5 incomplete tasks sorted by due date.
    - Click the circle icon to mark a task as complete.
    - Click "View Full Checklist" to see all tasks.

- **Pro Tip of the Day**:
    - A rotating daily tip appears in a styled card to offer helpful advice.

## 3. General Cleanup
- **Budget Page**: Fixed layout issues and removed broken code.
- **Guests Page**: Cleaned up imports and resolved build errors.

## running the App
To start the development server and view these changes:

```bash
npm run dev
```

Visit `http://localhost:5173` (or the port shown in your terminal).
