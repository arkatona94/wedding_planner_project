# Test Execution Guide

## Quick Start

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run All Tests

```bash
python execution/run_all_tests.py
```

This will run all automated tests and generate a report.

---

## Individual Test Suites

### Suite 1: Database Setup

**Test 1.1: Database Schema**
```bash
python execution/test_db_schema.py
```
Verifies all 14 tables exist in Supabase.

**Test 1.2: RLS Policies**
```bash
python execution/test_rls_policies.py
```
Verifies Row Level Security is configured correctly.

**Test 1.4: Storage Buckets**
```bash
python execution/test_storage_buckets.py
```
Verifies `inspiration` and `photos` buckets exist and are configured.

---

### Suite 3: Communication

**Test 3.1 & 3.2: Email/SMS Configuration**
```bash
python execution/test_communication_config.py
```
Verifies Resend (email) and Twilio (SMS) are configured.

**Send Test Email**
```bash
python execution/send_communication.py email your-email@example.com "Test message"
```

**Send Test SMS**
```bash
python execution/send_communication.py sms +1234567890 "Test SMS"
```

---

## Manual Tests Required

### Authentication Tests (Suite 2)

These require manual interaction with the web app:

1. **User Registration (TC-2.1)**
   - Open http://localhost:3001/register
   - Create account
   - Verify auto-login and redirect

2. **User Login (TC-2.2)**
   - Log out
   - Open /login
   - Log in
   - Verify session persists

3. **RLS Isolation (TC-2.6)**
   - Create User A with test data
   - Create User B with different data
   - Verify users can't see each other's data

4. **Protected Routes (TC-2.7)**
   - Log out
   - Try accessing /dashboard, /guests, /budget
   - Verify redirect to /login

---

## Communication Setup

### Email (Resend)

1. Sign up at https://resend.com
2. Get API key
3. Add to `.env`:
   ```
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

### SMS (Twilio)

1. Sign up at https://www.twilio.com
2. Get Account SID, Auth Token, and Phone Number
3. Add to `.env`:
   ```
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

---

## Test Report

After running tests, check the generated report:
```
test_report_YYYYMMDD_HHMMSS.txt
```

---

## Deployment Checklist

Before deployment, ensure:

- [ ] All Suite 1 tests PASS (Database)
- [ ] All Suite 2 tests PASS (Authentication - manual)
- [ ] All Suite 3 tests PASS (Communication)
- [ ] Test report shows 100% pass rate
- [ ] No critical bugs
- [ ] Environment variables documented

**Current Status:** 🔴 NOT READY (tests not run)

Once all green: 🟢 READY FOR DEPLOYMENT
