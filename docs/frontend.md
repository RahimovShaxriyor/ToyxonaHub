# Frontend Architecture & Component Catalog

## 1. Technology Overview

The frontend is a Single-Page Application (SPA) built with modern web technologies:

- **Core Framework**: React 18.3.1
- **Build Tool**: Vite 6.0.7
- **Routing**: React Router DOM 6.28.1 (Nested routes, lazy loading, layout shells)
- **Server State & Caching**: TanStack React Query 5.62.8
- **HTTP Client**: Axios 1.7.9 (Configured with bearer interceptor and token refresh mutex queue)
- **Styling**: Tailwind CSS 3.4.17 with custom Warm Minimal design tokens
- **Icons**: Lucide React 0.469.0
- **Dates**: date-fns 4.1.0 (Calendar math, month formatting)
- **Unit Testing**: Vitest 2.1.8 + React Testing Library 16.1.0 + jsdom 25.0.1
- **End-to-End Testing**: Playwright 1.63.0

---

## 2. Directory Structure

```text
frontend/src/
├── api/                   # Typed Axios API clients (auth, bookings, halls, owners, services)
├── components/
│   ├── common/            # Domain-specific shared widgets (Calendar, Hero, Search, HallCard)
│   ├── home/              # Homepage sectional widgets (Curated, HowItWorks, Districts, etc.)
│   ├── layout/            # Layout shells (PublicLayout, AuthLayout, OwnerLayout, AdminLayout)
│   └── ui/                # Core atomic UI primitives (Button, Input, OtpInput, Modal, etc.)
├── config/                # Environment variables and API URLs
├── constants/             # Enums, Tashkent districts list, status mappings
├── context/               # React Context providers (AuthContext, ToastContext)
├── pages/
│   ├── admin/             # Administrator management pages
│   ├── auth/              # Login, Register, and OTP verification pages
│   ├── owner/             # Venue owner workspace pages
│   ├── public/            # Public discovery pages (Home, Catalog, HallDetail)
│   └── user/              # Customer pages (MyBookings, Profile)
├── routes/                # AppRoutes definition, ProtectedRoute, RoleRoute
├── styles/                # index.css with motion tokens and animations
└── utils/                 # Error normalization, formatting, phone normalization
```

---

## 3. Layout Architecture & Route Hierarchy

The application organizes routes into dedicated layout shells using React Router v6 `<Outlet />` patterns:

### A. `PublicLayout` (`src/components/layout/PublicLayout.jsx`)
- Wraps all public and customer-facing pages.
- Mounts the persistent global `Navbar` with scroll-adaptive background transition (`scrollY > 40`) and the global `Footer`.

### B. `AuthLayout` (`src/components/layout/AuthLayout.jsx`)
- Shared 2-column shell hosting nested auth routes: `/login`, `/register`, and `/verify-otp`.
- **Desktop ( $\ge 1024\text{ px}$)**: Displays a dedicated high-resolution WebP brand asset (`/images/auth/auth-wedding-hall.webp`) on the left with dark gradient overlay, gold brand badge, and trust indicators.
- **Mobile ( $< 1024\text{ px}$)**: Automatically hides the brand image column to prevent horizontal overflow and maximize form readability.
- **Zero Shell Remount**: Transitioning between Login, Register, and OTP swaps only the form container within the `<Outlet />` without re-rendering the layout shell.
- **Pending Booking Context Banner**: Renders a reassuring summary banner above the form if the user was redirected from `HallDetailPage` with an active booking draft.

### C. `OwnerLayout` (`src/components/layout/OwnerLayout.jsx`)
- Dedicated workspace shell for authenticated users with role `OWNER`.
- Sidebar navigation: Dashboard, My Halls (`/owner/halls`), Add Hall (`/owner/halls/new`), and Bookings (`/owner/bookings`).
- Header with current owner profile and sign-out trigger.

### D. `AdminLayout` (`src/components/layout/AdminLayout.jsx`)
- Management console shell for authenticated users with role `ADMIN`.
- Sidebar navigation: Dashboard, Pending Approvals (`/admin/approvals`), Halls Directory (`/admin/halls`), Owners Governance (`/admin/owners`), and All Bookings (`/admin/bookings`).

### Route Guards:
- `ProtectedRoute`: Verifies `isAuthenticated` from `AuthContext`. Redirects unauthenticated visitors to `/login` with location return state.
- `RoleRoute`: Verifies that `user.role` matches `allowedRoles`. Unauthorized access redirects to `/`.

---

## 4. Shared UI Component Catalog

All components in `src/components/ui/` are built without heavy third-party UI libraries, ensuring maximum performance and full accessibility:

### 1. `Button` (`src/components/ui/Button.jsx`)
- **Variants**: `primary` (bronze), `secondary` (white/border), `outline`, `ghost`, `danger`, `dangerOutline`, `success`.
- **Sizes**: `sm`, `md`, `lg`, `icon`.
- **States**:
  - `isLoading`: Disables button, renders spinning `Loader2` icon, and displays optional `loadingText` (e.g. *"Kirilmoqda..."*).
  - `isSuccess`: Displays animated checkmark pop (`check-success-pop`) for calm task confirmation.
  - `aria-busy`: Configured automatically during loading state.
  - Active state: Subtle scale micro-interaction (`active:scale-[0.98]`).

### 2. `Input` (`src/components/ui/Input.jsx`)
- **Features**: Semantic `<label>`, optional `LeftIcon` and `RightIcon`, clean border transitions.
- **Password Visibility**: Opt-in `allowPasswordToggle` prop displaying an eye toggle button with clear accessibility labels (`aria-label="Ko'rsatish"` / `"Yashirish"`).
- **Accessibility**: Explicit `aria-invalid` and `aria-describedby` referencing error messages.

### 3. `OtpInput` (`src/components/ui/OtpInput.jsx`)
- **Segmented 6-Digit Control**: Interactive six-box segmented code entry.
- **Behaviors**:
  - Auto-advances focus to next digit upon entry.
  - Backspace navigation to previous box when current is empty.
  - Full 6-digit clipboard paste support (`onPaste`).
  - Native numeric mobile keypad trigger (`inputMode="numeric"`, `pattern="[0-9]*"`).
  - Active box highlighted with warm bronze border ring.
  - Semantic `<fieldset role="group">` with accessible screen-reader group label.

### 4. `TopProgressBar` (`src/components/ui/TopProgressBar.jsx`)
- 2.5px bronze top progress line mounted at the top of the viewport.
- **Real-Time Binding**: Activates when React Query has active foreground fetching queries (`useIsFetching() > 0`) or when React Router lazy chunks are loading in `<Suspense>`.
- **Zero Fake Timers**: Uses an indeterminate shimmer bar during actual pending states; no artificial percentage intervals.

### 5. `InitialAppLoader` (`src/components/ui/InitialAppLoader.jsx`)
- Branded cold-launch screen displaying the ToyxonaHub building mark and shimmering bronze loading indicator.
- Prevents flash of unauthenticated or partially rendered UI while `AuthContext` validates stored JWT tokens.

### 6. `Skeleton` (`src/components/ui/Skeleton.jsx`)
- Layout-matched pulse shimmer placeholders:
  - `HallDetailSkeleton`: Hero gallery grid, facts bar, calendar, and sticky sidebar card.
  - `DashboardSkeleton`: Metric cards, activity list, and summary charts.
  - `BookingsListSkeleton`: Tab switcher and stacked booking card placeholders.

### 7. `Modal` (`src/components/ui/Modal.jsx`)
- Accessible dialog with dark backdrop blur (`backdrop-blur-xs`).
- Traps keyboard `Tab` focus within the modal boundaries, supports `Escape` key dismissal, and restores focus to the invoking trigger upon close.

### 8. `AvailabilityCalendar` (`src/components/common/AvailabilityCalendar.jsx`)
- Interactive monthly calendar showing real-time day states fetched from `GET /wedding-halls/:id/availability`.
- **States**:
  - `AVAILABLE` (Emerald green): Selectable by user.
  - `BOOKED` (Rose pink): Occupied; disables booking selection.
  - `PAST` (Gray): Disabled past dates.
  - `SELECTED` (Bronze): Currently selected date.

### 9. `SearchFilterBar` (`src/components/common/SearchFilterBar.jsx`)
- Static 4-field search widget: **Tashkent District + Celebration Date + Guest Count + Budget Range**.
- Navigates seamlessly to `/catalog` with query parameter synchronization.

---

## 5. State Management & API Communication

### TanStack React Query (`v5`)
- Server-state is managed via React Query hooks with automatic cache invalidation:
  - `['wedding-halls']`: Catalog search results.
  - `['wedding-hall', id]`: Single hall profile.
  - `['hall-availability', id, year, month]`: Availability calendar state.
  - `['my-bookings']`: Customer booking list.
  - `['owner-halls']` & `['owner-bookings']`: Venue manager records.

### Axios Interceptor & Refresh Token Queue (`src/api/axios.js`)
- Injects `Authorization: Bearer <accessToken>` into all outgoing API calls.
- On HTTP `401 Unauthorized` responses:
  1. Enqueues failed requests into a promise queue.
  2. Issues a single `POST /api/v1/auth/refresh` request using the stored refresh token.
  3. Upon receiving new tokens, updates `localStorage` and retries all queued requests.
  4. If refresh fails, triggers `logout()` and redirects the user to `/login`.

---

## 6. Client-Side Error Handling & Normalization

The frontend implements a unified error normalizer (`src/utils/error.js`):

- `normalizeApiError(err, fallbackMessage)`: Parses Axios error objects, extracts backend error codes and messages, and transforms validation detail arrays into field-keyed error maps.
- **Toast Deduplication** (`src/context/ToastContext.jsx`): Prevents rapid duplicate error toasts from stacking on screen when an action fails.
