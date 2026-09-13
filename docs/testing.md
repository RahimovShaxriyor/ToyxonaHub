# Quality Assurance & Testing Suite

## 1. Testing Pyramid Overview

ToyxonaHub enforces a comprehensive, three-layer test automation strategy:

```text
       ▲
      / \
     /E2E\         End-to-End Browser Tests (Playwright)
    /-----\        14 Scenarios across 4 Viewports
   /       \
  / Backend \      Integration & Concurrency Tests (Jest + Supertest)
 /-----------\     8 Suites, 48 Tests against isolated PostgreSQL DB
/  Frontend   \    Unit & Component Tests (Vitest + React Testing Library)
/---------------\  18 Test Files, 70 Tests
```

---

## 2. Verified Metrics (as of 2026-09-13)

| Test Layer | Framework | Scope / Coverage | Test Files | Total Tests | Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **Frontend Unit & UI** | Vitest 2.1.8 + RTL | Components, hooks, utils, routes, contexts | 18 | 70 | **Passed (100%)** |
| **Backend Integration** | Jest 29.7.0 + Supertest | API routes, RBAC, DB transactions, Redis, S3 | 8 | 48 | **Passed (100%)** |
| **End-to-End (E2E)** | Playwright 1.63.0 | Critical user journeys & responsive viewports | 7 | 14 | **Passed (100%)** |
| **Total Test Suite** | Multi-layer | Full-stack platform verification | **33** | **132** | **Passed (100%)** |

---

## 3. Frontend Unit & Component Tests (Vitest)

### Executing Frontend Tests:
```bash
cd frontend
npm test
```

### Verified Test Suites:
1. `src/components/ui/Button.test.jsx` (5 tests): Variant styling, disabled state, `loadingText`, `isSuccess` checkmark, `aria-busy`.
2. `src/components/ui/Input.test.jsx` (4 tests): Label association, error messages, `aria-invalid`, `allowPasswordToggle` show/hide.
3. `src/components/ui/OtpInput.test.jsx` (5 tests): 6 segmented inputs, typing auto-advance, backspace navigation, paste handling, numeric filtering.
4. `src/components/layout/AuthLayout.test.jsx` (3 tests): 2-column layout, brand showcase, pending booking banner restoration.
5. `src/routes/ProtectedRoute.test.jsx` (3 tests): Authenticated vs unauthenticated redirection with location state.
6. `src/routes/RoleRoute.test.jsx` (3 tests): Role validation and unauthorized redirection.
7. `src/components/common/AvailabilityCalendar.test.jsx` (3 tests): Monthly navigation, available/booked/past day styling, date selection callback.
8. `src/components/common/HeroCarousel.test.jsx` (7 tests): Slide transitions, chevron buttons, dot indicators, hover pause, autoplay.
9. `src/components/common/SearchFilterBar.test.jsx` (2 tests): 4 search fields (district, date, guests, budget) and query dispatch.
10. `src/pages/auth/RegisterPage.test.jsx` (3 tests): Spaced phone input normalization, inline validation, backend error mapping.
11. `src/pages/owner/OwnerHallFormPage.test.jsx` (2 tests): Form validation, uppercase district enum coercion, phone cleaning.
12. `src/pages/public/BookingFlow.test.jsx` (3 tests): Pricing calculation, service addition, conflict handling.
13. `src/context/AuthContext.test.jsx` (3 tests): Stored tokens, login/logout dispatch.
14. `src/context/ToastContext.test.jsx` (2 tests): Toast deduplication and auto-dismissal.
15. `src/api/axios.test.js` (3 tests): Bearer token attachment, 401 refresh interceptor queue.
16. `src/utils/formatters.test.js` (8 tests): Uzbek currency formatting, dates.
17. `src/utils/phone.test.js` (6 tests): Phone formatting and cleaning (+998XXXXXXXXX).
18. `src/utils/error.test.js` (3 tests): Error object normalization.

---

## 4. Backend Integration Tests (Jest + Supertest)

### Executing Backend Tests:
```bash
cd backend
npm test
```

> [!NOTE]
> Backend tests execute against an **isolated test database** (`toyxonahub_test`), ensuring that development database records are never modified.

### Verified Test Suites:
1. `tests/booking.test.js` (10 tests):
   - Server-side price computation and exact 20% advance calculation.
   - Capacity constraint enforcement (`guestCount > capacity` returns 400).
   - Past date rejection (400).
   - Double-booking prevention with HTTP 409 `BOOKING_DATE_UNAVAILABLE`.
   - Concurrency race test (simultaneous requests on same hall/date result in 1 success and 1 conflict).
   - Cancellation and immediate date re-availability.
   - Idempotent mock payment (cannot pay twice or pay cancelled booking).
   - Strict owner booking data isolation.
2. `tests/authorization.test.js` (6 tests): Unauthenticated access (401), cross-role boundary violations (403), pending hall visibility rules.
3. `tests/wedding-halls.test.js` (6 tests): Hall creation (`PENDING`), search & filtering, availability calendar, image upload/primary/delete.
4. `tests/otp.test.js` (4 tests): First-login email OTP for owners, verification token issuance, expired/invalid code rejection.
5. `tests/auth.test.js` (10 tests): Customer registration, duplicate email/username (409), password hashing, login, token refresh rotation, logout.
6. `tests/infrastructure.test.js` (6 tests):
   - Redis OTP generation, SHA-256 hash storage with TTL, and attempt limit lockout.
   - Redis rate limiting headers on HTTP 429.
   - Redis wedding hall query caching and automatic invalidation on updates.
   - MinIO S3 upload, existence check, and cleanup.
7. `tests/services.test.js` (3 tests): Singer, car, and menu updates with owner authorization boundaries.
8. `tests/upload.test.js` (3 tests): JPEG/PNG/WebP validation, invalid file rejection (400), 5 MB limit enforcement.

---

## 5. End-to-End Browser Tests (Playwright)

### Executing Playwright Tests:
```bash
cd frontend
npx playwright test
```

### Verified E2E Scenarios:
1. `e2e/guest-booking-flow.spec.js`:
   - Guest visits Homepage $\rightarrow$ navigates to Catalog $\rightarrow$ opens Hall Detail $\rightarrow$ picks date in Calendar $\rightarrow$ clicks Booking $\rightarrow$ redirects to Login $\rightarrow$ logs in $\rightarrow$ draft restored automatically $\rightarrow$ submits booking $\rightarrow$ pays 20% advance $\rightarrow$ verifies active booking in My Bookings.
2. `e2e/register-flow.spec.js`:
   - Register with spaced phone (+998 90 123 45 67) $\rightarrow$ exactly 1 POST $\rightarrow$ redirect with success toast.
   - Duplicate email validation $\rightarrow$ single error toast and inline error.
   - Double-submission lock prevents multiple POST requests on rapid clicks.
3. `e2e/owner-flow.spec.js`:
   - Owner login $\rightarrow$ dashboard metrics $\rightarrow$ hall management $\rightarrow$ bookings inspection.
4. `e2e/owner-hall-flow.spec.js`:
   - Client-side validation on empty form (0 POST calls, single error toast).
   - Create hall with formatted phone and uppercase district enum $\rightarrow$ 1 POST $\rightarrow$ appears in halls directory.
   - Double-submission lock on hall creation.
5. `e2e/admin-flow.spec.js`:
   - Admin login $\rightarrow$ dashboard metrics $\rightarrow$ pending approvals $\rightarrow$ halls directory $\rightarrow$ owners governance.
6. `e2e/hero-carousel.spec.js`:
   - Hero carousel renders 4 slides, responds to chevron navigation, and pauses autoplay on hover.
7. `e2e/responsive-audit.spec.js`:
   - Responsive layout audit across 4 viewports:
     - **Mobile (390x844)**: Zero horizontal overflow (`scrollWidth === clientWidth`), mobile bottom booking CTA.
     - **Tablet (768x1024)**: Proper grid wrapping.
     - **Laptop (1024x768)**: Sticky sidebar activation.
     - **Desktop (1440x900)**: Full 2-column layout and editorial photography grids.
