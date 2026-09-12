# ToyxonaHub — Online Wedding Hall Booking System

Production-grade fullstack architecture for **ToyxonaHub** (Online Wedding Hall Booking System in Tashkent, Uzbekistan), fully containerized with Docker Compose.

---

## 🏛 Architecture Overview

```text
                                +--------------------------------------+
                                |      Client Browser (Desktop/Mobile) |
                                +------------------+-------------------+
                                                   |
                         +-------------------------+-------------------------+
                         | :5173 (HTTP / UI / SPA)                           | :9000 (S3 Direct Images)
                         v                                                   v
          +-------------------------------+                   +-------------------------------+
          |       ToyxonaHub Frontend     |                   |          MinIO (S3)           |
          |  React 18 / Vite / Nginx      |                   |    Object Storage Bucket      |
          |  Tailwind CSS / TanStack Query|                   |    :9000 (API) / :9001 (Web)  |
          +---------------+---------------+                   +---------------+---------------+
                          |                                                   ^
                          | /api/ (Nginx Proxy) or Direct :5050               |
                          v                                                   |
          +-------------------------------+                                   |
          |       ToyxonaHub Backend      |-----------------------------------+
          |     Node.js 20 / Express      |  AWS S3 SDK (aws-sdk/client-s3)
          |   ES Modules / Prisma ORM     |
          +---+---------------+-------+---+
              |               |       |
              |               |       +------------------------------------+
              |               |                                            |
              |               | Redis Client (ioredis)                     | Dev Mailer (Nodemailer)
              v               v                                            v
    +-------------------+   +--------------------+               +-------------------+
    |   PostgreSQL 16   |   |      Redis 7       |               |      Mailpit      |
    | - Source of Truth |   | - Hashed OTP (TTL) |               | - Dev SMTP (:1025)|
    | - Raw Unique Index|   | - IP Rate Limiting |               | - Web UI (:8025)  |
    |   :5432           |   | - Read Query Cache |               +-------------------+
    +-------------------+   |   :6379            |
                            +--------------------+
```

---

## 📦 Services & Ports

| Service | Container Name | Host Port | Internal Port | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Web** | `toyxonahub_frontend` | `5173` | `80` | React SPA served with Nginx + API proxy |
| **Backend API** | `toyxonahub_backend` | `5050` | `5050` | Node.js Express REST API & Swagger UI |
| **PostgreSQL** | `toyxonahub_postgres` | `5432` | `5432` | Primary Database (PostgreSQL 16 Alpine) |
| **Redis** | `toyxonahub_redis` | `6379` | `6379` | Redis 7 for OTP, Rate Limiting, and Cache |
| **MinIO (S3 API)** | `toyxonahub_minio` | `9000` | `9000` | S3-Compatible Object Storage for Images |
| **MinIO Console** | `toyxonahub_minio` | `9001` | `9001` | MinIO Web Management Console |
| **Mailpit Web** | `toyxonahub_mailpit` | `8025` | `8025` | Email Web UI for viewing OTPs |
| **Mailpit SMTP** | `toyxonahub_mailpit` | `1025` | `1025` | Local SMTP Server |

---

## 🎨 Frontend Architecture & Design System

- **Design Philosophy**: Warm Minimal / Premium Modern wedding marketplace (`#FAFAF8` canvas, `#FFFFFF` surface, `#181817` ink, `#6D6A63` muted, `#9A6B3F` bronze accent).
- **Technology Stack**:
  - **Framework**: React 18 + Vite
  - **Styling**: Tailwind CSS with custom Warm Minimal color palette & typography
  - **Routing**: React Router v6 (Nested routes, Public, Owner, and Admin layouts, role guards)
  - **State & Caching**: TanStack React Query v5 for asynchronous server state
  - **HTTP Client**: Axios with automatic JWT bearer interceptor and 401 refresh token retry queue
  - **Forms & Validation**: Controlled forms with validation and feedback
  - **Icons & Typography**: Lucide React + Playfair Display / Plus Jakarta Sans

### Core User Journeys

1. **Cinematic Hero Showcase & Visual Polish**:
   - 4 WebP-optimized wedding hall slides (~240–300 KB each) with smooth crossfade (800ms) and subtle ambient zoom (`scale-100` to `scale-104`).
   - Decoupled 4-field search bar (**District + Date + Guests + Budget**) statically mounted to preserve user inputs and focus during transitions.
   - Autoplay (5000ms) with hover & focus pause, manual dot indicator controls, and previous/next chevron buttons.
   - Scroll-adaptive Navbar: translucent backdrop on hero (`scrollY <= 40`), smoothly transitioning to solid surface white on scroll.
   - Micro-interactions: `HallCard` hover lift (`-translate-y-1`) and subtle image zoom (`1.03`), `Button` active press scale (`0.98`), and responsive mobile bottom booking CTA with safe-area insets.
   - Full `@media (prefers-reduced-motion: reduce)` accessibility support.
2. **Public Discovery (No registration barrier)**:
   - Full catalog with filters (district, capacity, price per seat, sort order).
   - Hall detail with photo gallery, amenities, capacity facts, and pricing.
3. **Interactive Monthly Availability Calendar**:
   - Monthly calendar (`GET /wedding-halls/:id/availability?year=YYYY&month=M`).
   - Color-coded day states: **Available** (emerald), **Booked** (rose), **Past** (disabled), **Selected** (bronze).
   - Admin view: displays customer booking details directly on booked dates.
4. **Services Customization & Calculation**:
   - Optional wedding services: Singer/Band, Cortege cars, Menu category, Karnay-Surnay group.
   - Client-side estimated total + server-authoritative final price calculation.
5. **Resumable Booking Gate**:
   - Guests can configure date, guests, and services without logging in.
   - Clicking "Bron qilish" saves the draft in session storage, directs to Login/Register, and automatically restores the draft upon authentication.
6. **20% Advance Payment**:
   - Idempotent mock payment (`POST /bookings/:id/pay`) displays confirmation (`"Muvaffaqiyatli to'landi"`).
7. **Owner Workspace (`/owner/*`)**:
   - Owner dashboard with real metrics (halls count, bookings received, paid advance revenue).
   - My Halls management (Create/Edit hall, MinIO photo uploads, primary toggle, singer/car/menu services).
   - Hall bookings list with status & timeStatus filters.
8. **Homepage Enrichment & Modern Discovery Layout**:
   - **Hero Showcase**: 4 WebP-optimized slides with ambient zoom and mounted 4-field search bar.
   - **Quick Category Chips**: Fast filter bar with capacity and budget queries.
   - **Recommended Halls ("Tavsiya etilgan to'yxonalar")**: 4x2 responsive desktop grid of approved wedding halls.
   - **Curated Collections**: 3 visual editorial banners (Large celebrations 400+, Intimate 200, Affordable budget).
   - **Popular Districts**: 8 Tashkent district tiles with dynamic counts derived from approved halls.
   - **Wedding Services Overview**: Lucide-icon powered cards (`Mic2`, `Car`, `UtensilsCrossed`, `Music`).
   - **How It Works**: 4 numbered steps with Lucide icons explaining the end-to-end booking journey.
   - **Recently Added Halls**: Visually distinct horizontal snap-scroll row ordered strictly by `createdAt:desc`.
   - **Trust & Platform Capabilities**: Fact-based capability highlights (live monthly calendar, server calculation, 20% advance, admin-approved).
   - **Owner Partnership Banner**: Targeted banner with `/login?role=OWNER` passing owner intent.
9. **Unified AuthLayout & Role Intent Flow**:
   - Standardized layout for Login, Register, and OTP with step indicators (`1. Ro'yxatdan o'tish ─── 2. Tasdiqlash`).
   - Owner intent routing (`/login?role=OWNER`) showing welcoming guidance banner for venue partners.
10. **Global Motion & Micro-Interactions**:
   - Hall Detail: Date CTA smooth-scrolls and triggers a single 1200ms subtle bronze attention highlight (`ring-2 ring-bronze`) on the availability calendar when no date is picked.
   - My Bookings: Tab underline/pill transition (200ms) with animated fade-slide content updates.
11. **Admin Workspace (`/admin/*`)**:
   - Platform overview and real-time statistics.
   - Pending Approvals queue with one-click approve/reject.
   - All Halls management & deletion.
   - Owners management (create owner account, assign halls).
   - Full audit log of all bookings with customer personal info.

---

## 🚀 Quick Start (Docker Compose)

### 1. Start Full Environment
Start all containers in detached mode:
```bash
docker compose up -d --build
```

The startup sequence automatically:
1. Starts PostgreSQL and waits for health check (`pg_isready`).
2. Starts Redis and waits for health check (`redis-cli ping`).
3. Starts MinIO and initializes the public bucket (`toyxonahub-images`) via `minio-init`.
4. Starts Mailpit SMTP server.
5. Runs Prisma migrations (`npx prisma migrate deploy`) and starts the Backend server.
6. Builds and starts the Frontend Nginx SPA container.

### 2. Seed Database with Realistic Tashkent Data
Populate users (Admin, Owners, Users), wedding halls, singers, cars, and bookings:
```bash
docker compose exec backend npm run prisma:seed
```

### 3. Access Applications
- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend Health Check**: [http://localhost:5050/health](http://localhost:5050/health)
- **Interactive Swagger Docs**: [http://localhost:5050/api-docs](http://localhost:5050/api-docs)
- **Mailpit Webmail (View OTPs)**: [http://localhost:8025](http://localhost:8025)
- **MinIO Console**: [http://localhost:9001](http://localhost:9001) (`minioadmin` / `minioadmin`)

---

### Seed Credentials for Quick Testing
- **Admin**: `admin@toyxonahub.uz` / `AdminPassword123!` (Role: `ADMIN`)
- **Owner (Verified)**: `owner1@toyxonahub.uz` / `OwnerPassword123!` (Role: `OWNER`)
- **Owner (Unverified OTP)**: `owner2@toyxonahub.uz` / `OwnerPassword123!` (Role: `OWNER`, triggers OTP via Mailpit)
- **Customer User**: `user1@example.com` / `UserPassword123!` (Role: `USER`)

---

## 🧪 Testing & Quality Assurance

### Backend Test Suite (48/48 Passing)
```bash
cd backend
npm test
npm run lint
```
Covers: Auth, RBAC, Services, Wedding Halls, Bookings, Concurrency, File Upload, Redis OTP, Rate Limiting, Caching, MinIO S3 storage.

### Frontend Unit & Integration Suite (39/39 Passing across 10 Suites)
```bash
cd frontend
npm test
npm run lint
npm run build
```
Covers: `HeroCarousel` (transitions, controls, timer, pause on hover), `ProtectedRoute`, `RoleRoute`, `AuthContext`, `apiClient` Axios token refresh & queue retry, `SearchFilterBar`, `AvailabilityCalendar`, `formatters`, `BookingFlow` with 409 double-booking conflict handling.

### Playwright E2E Test Suite (8/8 Passing across 5 Suites)
```bash
cd frontend
npm run test:e2e
```
Explicitly verified scenarios:
1. **Critical Guest Booking Flow** (`guest-booking-flow.spec.js`): Unauthenticated discovery → Hall detail → Pick available date on calendar → Auth gate → Login → Restore booking draft → Server calculation → Create booking → Pay 20% advance → Verification in `/my-bookings`.
2. **Hero Showcase Carousel Interactions & Motion** (`hero-carousel.spec.js`): Carousel renders 4 slides with WebP images, responds to chevron and indicator dot navigation, pauses autoplay on hover/focus, and retains search bar input state across slide transitions.
3. **Owner Management Flow** (`owner-flow.spec.js`): Owner login → Real-time metrics → Hall management → View bookings with filter tabs.
4. **Admin Governance Flow** (`admin-flow.spec.js`): Admin login → Platform statistics → Pending approvals queue → All halls directory → Owners management.
5. **Responsive Visual & Layout Audit** (`responsive-audit.spec.js`): Audits 390px (mobile), 768px (tablet), 1024px (laptop), 1440px (desktop) ensuring 0 horizontal overflow, responsive navigation, and layout integrity across all viewports. Screenshots saved in `frontend/e2e-screenshots/`.

---

## 🔒 Security & Reliability Guarantees
- **Concurrency Safety**: Double-booking prevented by PostgreSQL raw partial unique index `UNIQUE(weddingHallId, bookingDate) WHERE status = 'ACTIVE'`.
- **Stateless Auth**: JWT Access tokens (15m) + SHA-256 hashed refresh tokens with rotation and reuse detection.
- **Secure OTP**: 6-digit numeric codes stored exclusively as SHA-256 hashes in Redis with 5-minute TTL, single-use deletion, and 5-attempt brute-force protection.
- **Rate Limiting**: Distributed Redis-backed rate limiting per IP on sensitive authentication routes (`TOO_MANY_REQUESTS` / HTTP 429).
- **Object Storage**: S3/MinIO bucket isolation with automated public download policy and zero local disk dependency.
# ToyxonaHub
