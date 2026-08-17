# Day 4 Consolidated Bug Log & Close-Out Report

This report consolidates and prioritizes all findings from the Day 4 Patient Screen Verification (Developer 1) and Full Signup-to-Booking Regression (Developer 2) QA tasks.

---

## 🐞 Consolidated Prioritized Bug & QA Findings List

### [QA-D4-01] Initial Vite `/login` Direct-Navigation Crash
* **Area**: Routing & Compilation
* **Severity**: P1 (High functional issue)
* **Type**: Product Bug
* **Reproduction/Condition**: Navigating directly to `http://localhost:5173/login` (or other SPA routes) on first load.
* **Actual Observed Behavior**: Vite falls back to the default `/index.html` at the root folder, which imports `src/App.jsx`. `src/App.jsx` imports `src/pages/PhoneLogin.jsx`, which does not exist in the repository. This triggers a compilation/import-analysis 500 error in the browser.
* **Expected Behavior**: The root router page compiles cleanly, or developers are guided to use the dedicated entrypoint `/index-user.html`.
* **Evidence**: Dev server terminal output: `Failed to resolve import "./pages/PhoneLogin" from "src/App.jsx". Does the file exist?`
* **Recommended Next Action**: Clean up `src/App.jsx` and `/index.html` to align with the split patient/guide configurations.
* **Fix Target**: Fix on Day 5.

---

### [QA-D4-02] Live Cloud Function Invocations Blocked by App Check
* **Area**: Firebase Backend / Security
* **Severity**: P1 (High functional issue)
* **Type**: Environment/QA Blocker
* **Reproduction/Condition**: Invoking any Firebase Callable Function (`getAvailableSlots`, `createBooking`, `checkIn`) from a local development environment.
* **Actual Observed Behavior**: Live App Check configuration rejects incoming HTTP requests with `403 Forbidden` responses.
* **Expected Behavior**: Development environments should bypass App Check validation or have a registered App Check debug token in the Firebase console.
* **Evidence**: Browser console log: `Error while retrieving App Check token: FirebaseError: AppCheck: Fetch server returned an HTTP error status. HTTP status: 403.`
* **Recommended Next Action**: Register local debug tokens (`256c5b5d-9a62-427c-b438-f0d75557db99`) in the App Check settings of the Firebase Console.
* **Fix Target**: Defer (requires live Firebase console access).

---

### [QA-D4-03] Missing Test Guide Availability Configuration
* **Area**: Booking Database
* **Severity**: P1 (High functional issue)
* **Type**: Environment/QA Blocker
* **Reproduction/Condition**: Opening the booking calendar for expert `1TnCDFNl7YeVk3jt74VVWcHE2632` (Rupesh Ojha) without mocks.
* **Actual Observed Behavior**: No slot buttons render because `getAvailableSlots` returns an empty array, and the backend service reports availability is not configured.
* **Expected Behavior**: The test database should contain default working hour mappings in the `provider_availability` collection for the test guide.
* **Evidence**: `No time slots available for booking!` error shown on the calendar screen.
* **Recommended Next Action**: Insert a mock availability record in the `provider_availability` collection under the ID `1TnCDFNl7YeVk3jt74VVWcHE2632`.
* **Fix Target**: Fix on Day 5.

---

### [QA-D4-04] Real Booking Creation
* **Area**: Booking Flow
* **Severity**: P1 (High functional issue)
* **Type**: Unverified
* **Reproduction/Condition**: Clicking "Pay" to submit details to Firestore.
* **Actual Observed Behavior**: Unverified due to App Check `403` blocks.
* **Expected Behavior**: The backend should register a booking document in the `bookings` collection.
* **Evidence**: Bypassed in local testing using mock Playwright routes.
* **Recommended Next Action**: Verify booking persistence once App Check is configured/disabled.
* **Fix Target**: Defer.

---

### [QA-D4-05] Mock Payment Checkout Mode
* **Area**: Payments
* **Severity**: P2 (Medium/non-blocking issue)
* **Type**: Environment/QA Blocker
* **Reproduction/Condition**: Initiating checkout payment.
* **Actual Observed Behavior**: The client executes a local timeout mock checkout instead of a real Cashfree gateway redirect.
* **Expected Behavior**: Production should route to the gateway; development mocks this by design.
* **Evidence**: `BookingSuccess.jsx` text: *"Test Mode — no real payment charged"*.
* **Recommended Next Action**: Keep as is (mock payment is correct design for current phase).
* **Fix Target**: Defer.

---

### [QA-D4-06] Real Jitsi Session Video Call Check-In
* **Area**: Video Sessions
* **Severity**: P1 (High functional issue)
* **Type**: Unverified
* **Reproduction/Condition**: Accessing Jitsi iframe within `/sessions`.
* **Actual Observed Behavior**: Unverified because no active/live slot is scheduled, and local check-in is blocked by App Check.
* **Expected Behavior**: When check-in is successful, it should render Jitsi iframe `https://meet.jit.si/`.
* **Evidence**: Connection failure alerts returned when function interception is bypassed.
* **Recommended Next Action**: Defer verification until the backend function calls are reachable.
* **Fix Target**: Defer.

---

### [QA-D4-07] Real Receipt Generation
* **Area**: Receipts
* **Severity**: P2 (Medium/non-blocking issue)
* **Type**: Unverified
* **Reproduction/Condition**: Downloading receipt on booking success.
* **Actual Observed Behavior**: The client compiles and downloads a plain-text `.txt` document stating: *"This is a test-mode receipt. No real payment was processed."*
* **Expected Behavior**: A real PDF / gateway invoice should be downloaded.
* **Evidence**: Plain-text blob construction in `BookingSuccess.jsx`.
* **Recommended Next Action**: Defer (local plain text receipt is the current design).
* **Fix Target**: Defer.

---

### [QA-D4-08] Browser Console Errors / Connection Failures
* **Area**: Developer Environment
* **Severity**: P3 (Cosmetic/low priority)
* **Type**: Product Bug
* **Reproduction/Condition**: Running the user application on localhost.
* **Actual Observed Behavior**: 13–14 console errors/warnings per session due to failing HMR Websockets and CSP violations on reCAPTCHA iframes.
* **Expected Behavior**: Clean console output on load.
* **Evidence**: Playwright browser console logs.
* **Recommended Next Action**: Adjust development CSP headers and local connection endpoints.
* **Fix Target**: Defer.

---

## 📊 Summary Categorizations

### A. CRITICAL/P0-P1 PRODUCT BUGS
* **[QA-D4-01] Initial Vite `/login` Direct-Navigation Crash (P1)**: Vite falls back to dead `index.html` loading `src/App.jsx` with missing `PhoneLogin` import.

### B. MEDIUM/LOW PRODUCT BUGS
* **[QA-D4-08] Browser Console Errors / Connection Failures (P3)**: Unnecessary console connection and CSP warning noise.

### C. ENVIRONMENT / QA BLOCKERS
* **[QA-D4-02] Live Cloud Function Invocations Blocked by App Check (P1)**: Local host origin requests blocked by App Check `403` status.
* **[QA-D4-03] Missing Test Guide Availability Configuration (P1)**: Lack of availability documentation for tested guide in Firestore database.
* **[QA-D4-05] Mock Payment Checkout Mode (P2)**: Real payments are bypassed in favor of mock checkout by design.

### D. UNVERIFIED REQUIREMENTS
* **[QA-D4-04] Real Booking Creation (P1)**: Document persistence on the database remains unverified due to backend blocks.
* **[QA-D4-06] Real Jitsi Session Video Call Check-In (P1)**: Unverified because no live slot is active and check-in fails locally.
* **[QA-D4-07] Real Receipt Generation (P2)**: Generating a real receipt is unverified as it only produces plain-text test files.

---

## 📋 Day 5 Recommendations
1. **Clean Up App.jsx & index.html**: Resolve the non-existent `PhoneLogin` import block in the default Vite entrypoints.
2. **App Check Debug Registration**: Register the developer AVD/emulator and localhost debug tokens in the Firebase console to enable end-to-end backend verification.
3. **Firestore Mock Availability Data**: Insert proper default working hours configuration in the `provider_availability` collection for Rupesh Ojha (`1TnCDFNl7YeVk3jt74VVWcHE2632`) to enable un-mocked timeslot fetches.

---

## 🏆 Final Day 4 Verdict

"Day 4 UI/functional QA: PASS with documented blockers."
