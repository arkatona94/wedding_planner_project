# EverAfter Wedding Planner - Test Plan

## Overview
This test plan covers all critical paths for the wedding planner application before production deployment. All tests must pass (green lights) before deployment is authorized.

**Last Updated:** 2026-02-01  
**Test Environment:** Development (localhost:3001)  
**Database:** Supabase Project `xcjelqmifskowxxdtqrh`

---

## Test Suite 1: Supabase Setup Verification

### Objective
Verify that all database tables, RLS policies, triggers, and storage buckets are properly configured in Supabase.

### Prerequisites
- Supabase project accessible at `https://xcjelqmifskowxxdtqrh.supabase.co`
- Service role key available in `.env`
- SQL Editor access

### Test Cases

#### TC-1.1: Verify Core Tables Exist
**Priority:** Critical  
**Script:** `execution/test_db_schema.py`

**Steps:**
1. Connect to Supabase using service role key
2. Query `information_schema.tables` for all expected tables
3. Verify each table exists with correct schema

**Expected Tables:**
- `profiles`
- `weddings`
- `checklist_items`
- `budget_items`
- `guests`
- `vendors`
- `timeline_events`
- `seating_tables`
- `room_elements`
- `photos`
- `inspiration_boards`
- `inspiration_images`
- `communication_logs`
- `public_rsvp_submissions`

**Pass Criteria:** All 14 tables exist

---

#### TC-1.2: Verify RLS Policies
**Priority:** Critical  
**Script:** `execution/test_rls_policies.py`

**Steps:**
1. Query `pg_policies` for all RLS policies
2. Verify policies exist for each table
3. Test that unauthenticated users cannot read/write
4. Test that authenticated users can only access their own data

**Expected Policies (minimum):**
- Profiles: SELECT, UPDATE, INSERT policies
- Weddings: SELECT, ALL policies
- All child tables: ALL policies with wedding_id checks

**Pass Criteria:** 
- Minimum 20 RLS policies exist
- Unauthorized access blocked
- Cross-user data access blocked

---

#### TC-1.3: Verify Database Triggers
**Priority:** High  
**Script:** `execution/test_db_triggers.py`

**Steps:**
1. Query `information_schema.triggers`
2. Verify `handle_new_user()` trigger exists on `auth.users`
3. Verify `update_updated_at_column()` triggers on all tables

**Expected Triggers:**
- `on_auth_user_created` (creates profile + wedding on signup)
- `update_*_updated_at` for 10+ tables

**Pass Criteria:** All triggers fire correctly

---

#### TC-1.4: Verify Storage Buckets
**Priority:** High  
**Script:** `execution/test_storage_buckets.py`

**Steps:**
1. Query `storage.buckets`
2. Verify `inspiration` bucket exists (public)
3. Verify `photos` bucket exists (public)
4. Test upload permissions for authenticated users
5. Test public read access

**Pass Criteria:** 
- Both buckets exist
- Public read works
- Authenticated upload works

---

#### TC-1.5: Verify Database Functions
**Priority:** Medium

**Steps:**
1. Verify `handle_new_user()` function exists
2. Verify `update_updated_at_column()` function exists
3. Test both functions execute without errors

**Pass Criteria:** All functions defined and working

---

## Test Suite 2: Authentication Testing

### Objective
Verify that user registration, login, logout, and password reset flows work correctly with Supabase Auth.

### Prerequisites
- App running on `localhost:3001`
- Supabase Auth enabled
- Email confirmations disabled (for testing) OR test email access

### Test Cases

#### TC-2.1: User Registration
**Priority:** Critical  
**Type:** Manual + Automated

**Steps:**
1. Navigate to `/register`
2. Fill in form:
   - Full Name: "Test User Alpha"
   - Email: `test-alpha-{timestamp}@example.com`
   - Password: "TestPass123!"
3. Submit registration
4. Verify user created in `auth.users`
5. Verify profile created in `profiles` table
6. Verify default wedding created in `weddings` table
7. Verify user is auto-logged in
8. Verify redirect to `/` (dashboard)

**Pass Criteria:**
- Registration succeeds
- Profile record created with correct name
- Wedding record created with default values
- User logged in automatically
- Dashboard accessible

**Automated Script:** `execution/test_registration.py`

---

#### TC-2.2: User Login
**Priority:** Critical  
**Type:** Manual + Automated

**Steps:**
1. Create a test user (use TC-2.1 or pre-existing)
2. Log out if logged in
3. Navigate to `/login`
4. Enter credentials:
   - Email: test user email
   - Password: test user password
5. Submit login
6. Verify JWT token stored in browser
7. Verify user data loaded into Zustand store
8. Verify redirect to dashboard
9. Verify user data displayed (name, wedding details)

**Pass Criteria:**
- Login succeeds
- JWT token valid
- User data loaded
- Protected routes accessible

**Automated Script:** `execution/test_login.py`

---

#### TC-2.3: Session Persistence
**Priority:** High  
**Type:** Manual

**Steps:**
1. Log in with test user
2. Navigate to `/guests` page
3. Refresh browser (F5)
4. Verify still logged in
5. Verify user data persisted
6. Close browser tab
7. Reopen app in new tab
8. Verify still logged in (session cookie)

**Pass Criteria:**
- Session persists across refreshes
- Session persists across tab close/reopen
- User data reloads correctly

---

#### TC-2.4: User Logout
**Priority:** High  
**Type:** Manual

**Steps:**
1. Log in with test user
2. Navigate to Settings
3. Click "Logout" button
4. Verify JWT cleared from browser
5. Verify redirected to `/login`
6. Attempt to navigate to `/dashboard`
7. Verify redirected back to `/login`

**Pass Criteria:**
- Logout clears session
- Protected routes inaccessible
- Redirect to login works

---

#### TC-2.5: Password Reset Flow
**Priority:** Medium  
**Type:** Manual

**Steps:**
1. Navigate to `/forgot-password`
2. Enter test user email
3. Submit request
4. Check for reset email (Supabase Auth emails)
5. Click reset link
6. Enter new password
7. Verify password updated
8. Log in with new password

**Pass Criteria:**
- Reset email sent
- Reset link works
- Password updates successfully
- Can log in with new password

---

#### TC-2.6: RLS Data Isolation
**Priority:** Critical  
**Type:** Manual + Automated

**Steps:**
1. Register User A with test data:
   - Add 5 guests
   - Add 3 budget items
   - Add 2 vendors
2. Log out
3. Register User B with different test data:
   - Add 3 guests
   - Add 2 budget items
4. Verify User B cannot see User A's data
5. Query database directly to confirm both users' data exists
6. Log back in as User A
7. Verify User A's original data still accessible
8. Verify User A cannot see User B's data

**Pass Criteria:**
- Each user sees only their own data
- Data doesn't leak between users
- Database contains all records (visible via service role)

**Automated Script:** `execution/test_rls_isolation.py`

---

#### TC-2.7: Protected Route Guards
**Priority:** High  
**Type:** Manual

**Steps:**
1. Log out completely
2. Attempt to navigate directly to:
   - `/dashboard`
   - `/guests`
   - `/budget`
   - `/vendors`
   - `/timeline`
   - `/seating`
   - `/photos`
   - `/inspiration`
3. Verify each redirects to `/login`
4. Log in
5. Repeat navigation
6. Verify all routes accessible

**Pass Criteria:**
- All protected routes redirect when logged out
- All protected routes accessible when logged in

---

## Test Suite 3: Email & SMS Communication

### Objective
Verify that the communication system can send emails and SMS messages to guests with proper tracking and logging.

### Prerequisites
- Communication provider configured (Resend for email, Twilio for SMS)
- API keys stored in `.env`
- `execution/send_communication.py` script created
- `communication_logs` table ready

### Test Cases

#### TC-3.1: Email Provider Configuration
**Priority:** Critical  
**Type:** Automated

**Steps:**
1. Verify `RESEND_API_KEY` exists in `.env`
2. Test connection to Resend API
3. Verify sending domain configured
4. Send test email to known address
5. Verify delivery

**Pass Criteria:**
- API key valid
- Connection successful
- Test email delivered

**Script:** `execution/test_email_config.py`

---

#### TC-3.2: SMS Provider Configuration
**Priority:** Critical  
**Type:** Automated

**Steps:**
1. Verify `TWILIO_ACCOUNT_SID` exists in `.env`
2. Verify `TWILIO_AUTH_TOKEN` exists in `.env`
3. Verify `TWILIO_PHONE_NUMBER` exists in `.env`
4. Test connection to Twilio API
5. Send test SMS to verified number
6. Verify delivery

**Pass Criteria:**
- API credentials valid
- Connection successful
- Test SMS delivered

**Script:** `execution/test_sms_config.py`

---

#### TC-3.3: Send Single Email
**Priority:** High  
**Type:** Manual + Automated

**Steps:**
1. Log in to app
2. Navigate to `/communications`
3. Select "Email" as type
4. Select 1 guest from list
5. Compose message:
   - Subject: "Test Wedding Update"
   - Body: "This is a test message."
6. Click "Send"
7. Verify email sent successfully
8. Check recipient inbox
9. Verify entry created in `communication_logs` table

**Pass Criteria:**
- Email sends without errors
- Recipient receives email
- Log entry created with correct data

**Script:** `execution/test_send_email.py`

---

#### TC-3.4: Send Bulk Email
**Priority:** High  
**Type:** Manual + Automated

**Steps:**
1. Create 5 test guests in system
2. Navigate to `/communications`
3. Select "Email" as type
4. Select all 5 guests
5. Compose message
6. Click "Send to All"
7. Verify batch processing
8. Check all 5 inboxes
9. Verify 5 log entries created

**Pass Criteria:**
- All emails sent successfully
- No duplicates
- All recipients receive
- All logs created

**Script:** `execution/test_bulk_email.py`

---

#### TC-3.5: Send Single SMS
**Priority:** High  
**Type:** Manual + Automated

**Steps:**
1. Navigate to `/communications`
2. Select "SMS" as type
3. Select 1 guest with valid phone number
4. Compose message: "Test wedding update"
5. Click "Send"
6. Verify SMS sent
7. Check phone for message
8. Verify log entry created

**Pass Criteria:**
- SMS sends successfully
- Message received
- Log entry created

**Script:** `execution/test_send_sms.py`

---

#### TC-3.6: Send Bulk SMS
**Priority:** High  
**Type:** Manual + Automated

**Steps:**
1. Create 5 test guests with phone numbers
2. Navigate to `/communications`
3. Select "SMS" as type
4. Select all 5 guests
5. Compose short message
6. Click "Send to All"
7. Verify batch processing
8. Check all 5 phones
9. Verify 5 log entries

**Pass Criteria:**
- All SMS sent successfully
- All messages received
- All logs created

**Script:** `execution/test_bulk_sms.py`

---

#### TC-3.7: Communication Logging
**Priority:** High  
**Type:** Manual

**Steps:**
1. Send 2 emails and 2 SMS messages
2. Navigate to Communications history view
3. Verify all 4 entries appear
4. Verify each entry shows:
   - Type (email/sms)
   - Recipient
   - Timestamp
   - Status (sent/failed)
   - Message content
5. Query `communication_logs` table directly
6. Verify data matches UI

**Pass Criteria:**
- All communications logged
- Data accurate
- History view displays correctly

---

#### TC-3.8: Failed Communication Handling
**Priority:** Medium  
**Type:** Manual + Automated

**Steps:**
1. Attempt to send email to invalid address
2. Verify error handling
3. Verify log entry marked as "failed"
4. Verify user notified of failure
5. Attempt to send SMS to invalid number
6. Repeat verification

**Pass Criteria:**
- Failures handled gracefully
- Errors logged
- User notified
- App doesn't crash

**Script:** `execution/test_communication_errors.py`

---

#### TC-3.9: Template Variables
**Priority:** Medium  
**Type:** Manual

**Steps:**
1. Create message with variables:
   - `{{guest_name}}`
   - `{{wedding_date}}`
   - `{{venue}}`
2. Send to 3 guests
3. Verify each email personalized correctly
4. Verify variables replaced with actual data

**Pass Criteria:**
- Variables replaced correctly
- No variable syntax in sent messages
- Personalization works per recipient

---

#### TC-3.10: Rate Limiting & Quotas
**Priority:** Low  
**Type:** Manual

**Steps:**
1. Check provider rate limits
2. Attempt to send messages near limit
3. Verify rate limiting handled
4. Verify user notified if limit reached

**Pass Criteria:**
- Rate limits respected
- No API errors from exceeding limits

---

## Test Suite 4: Data Persistence & CRUD Operations

### Objective
Verify that all data operations (Create, Read, Update, Delete) work correctly with Supabase sync.

### Test Cases

#### TC-4.1: Guest CRUD Operations
**Priority:** Critical  
**Type:** Manual + Automated

**Create:**
1. Navigate to `/guests`
2. Click "Add Guest"
3. Fill in all fields
4. Save
5. Verify appears in UI
6. Verify record in `guests` table

**Read:**
7. Refresh page
8. Verify guest still appears

**Update:**
9. Click guest to edit
10. Change RSVP status to "Attending"
11. Save
12. Verify UI updates
13. Verify database updated

**Delete:**
14. Delete guest
15. Verify removed from UI
16. Verify removed from database

**Pass Criteria:** All operations succeed with DB sync

---

#### TC-4.2: Budget Item CRUD
**Priority:** Critical  
**Type:** Manual + Automated

(Similar structure to TC-4.1 for budget items)

---

#### TC-4.3: Vendor CRUD
**Priority:** High  
**Type:** Manual + Automated

(Similar structure to TC-4.1 for vendors)

---

#### TC-4.4: Checklist Item CRUD
**Priority:** High  
**Type:** Manual + Automated

(Similar structure to TC-4.1 for checklist items)

---

## Test Execution Summary

### Test Runs
Each test run should be logged with:
- Date/Time
- Tester name
- Environment
- Pass/Fail status
- Notes/Issues

### Report Template

```
TEST RUN REPORT
================
Date: [YYYY-MM-DD]
Time: [HH:MM]
Tester: [Name]
Environment: [Dev/Staging/Prod]

Suite 1: Supabase Setup
- TC-1.1: [PASS/FAIL] [Notes]
- TC-1.2: [PASS/FAIL] [Notes]
- TC-1.3: [PASS/FAIL] [Notes]
- TC-1.4: [PASS/FAIL] [Notes]
- TC-1.5: [PASS/FAIL] [Notes]

Suite 2: Authentication
- TC-2.1: [PASS/FAIL] [Notes]
- TC-2.2: [PASS/FAIL] [Notes]
- TC-2.3: [PASS/FAIL] [Notes]
- TC-2.4: [PASS/FAIL] [Notes]
- TC-2.5: [PASS/FAIL] [Notes]
- TC-2.6: [PASS/FAIL] [Notes]
- TC-2.7: [PASS/FAIL] [Notes]

Suite 3: Communication
- TC-3.1: [PASS/FAIL] [Notes]
- TC-3.2: [PASS/FAIL] [Notes]
- TC-3.3: [PASS/FAIL] [Notes]
- TC-3.4: [PASS/FAIL] [Notes]
- TC-3.5: [PASS/FAIL] [Notes]
- TC-3.6: [PASS/FAIL] [Notes]
- TC-3.7: [PASS/FAIL] [Notes]
- TC-3.8: [PASS/FAIL] [Notes]
- TC-3.9: [PASS/FAIL] [Notes]
- TC-3.10: [PASS/FAIL] [Notes]

Suite 4: Data Operations
- TC-4.1: [PASS/FAIL] [Notes]
- TC-4.2: [PASS/FAIL] [Notes]
- TC-4.3: [PASS/FAIL] [Notes]
- TC-4.4: [PASS/FAIL] [Notes]

OVERALL STATUS: [ALL GREEN / ISSUES FOUND]
Issues Requiring Fix: [List]
Blockers: [List]
```

---

## Deployment Readiness Checklist

Before deployment is authorized, verify:

- [ ] All Suite 1 tests PASS (Database setup)
- [ ] All Suite 2 tests PASS (Authentication)
- [ ] All Suite 3 tests PASS (Communication)
- [ ] All Suite 4 tests PASS (Data operations)
- [ ] No critical or high priority bugs
- [ ] Performance acceptable (page load < 3s)
- [ ] Mobile responsive design verified
- [ ] Browser compatibility tested (Chrome, Firefox, Safari)
- [ ] Environment variables documented
- [ ] Backup/restore procedure documented
- [ ] Monitoring/logging configured

**STATUS: 🔴 NOT READY FOR DEPLOYMENT**
**Reason:** Test execution not started

Once all tests pass: **🟢 READY FOR DEPLOYMENT**
