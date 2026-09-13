# ToyxonaHub

ToyxonaHub is a full-stack online wedding hall marketplace and booking platform for Tashkent, Uzbekistan. It provides transparent hall discovery, real-time availability calendar scheduling, ceremony service bundling (singers, cortege vehicles, banquet menus, karnay-surnay), automated concurrency double-booking protection, and a simulated 20% advance payment workflow.

---

## 🏛 Capabilities by Role

### Guest (Unauthenticated Visitor)
- **Browse Approved Venues**: Explore approved wedding halls with verified photography, venue capacity, and pricing.
- **Search & Multi-Filter**: Filter halls by Tashkent district, celebration date, guest capacity, and budget per seat.
- **Interactive Availability Calendar**: Inspect occupied and open dates on a real-time color-coded monthly calendar.
- **Service Bundling**: Choose optional live performers, luxury vehicles, banquet menu tiers, and national ensembles.
- **Resumable Booking Gate**: Save configured celebration dates, guest counts, and service selections in a session draft, prompting registration/login only at the final confirmation step.

### Customer (USER)
- **Account & Profile**: Manage contact details and personal settings.
- **Conflict-Free Booking**: Submit reservations with server-authoritative pricing calculations via `Decimal.js`.
- **20% Simulated Advance Payment**: Confirm reservations with an immediate, idempotent simulated 20% advance payment.
- **My Bookings Dashboard**: Track upcoming and past celebrations with real-time status badges (`ACTIVE`, `CANCELLED`, `COMPLETED`).
- **Self-Service Cancellation**: Cancel reservations, immediately releasing dates on the public availability calendar.

### Venue Owner (OWNER)
- **Dedicated Authentication**: Log in to an isolated management workspace; unverified accounts complete 6-digit email OTP verification.
- **Venue Management**: Create wedding halls with detailed capacity and pricing parameters (enters `PENDING` status for admin approval).
- **Photo Gallery (MinIO)**: Upload and manage up to 10 high-resolution venue photos with primary thumbnail assignment.
- **Custom Services**: Manage per-hall artist rosters, cortege vehicles, catering menus, and Karnay-Surnay ensembles.
- **Reservation Management**: Inspect incoming customer bookings, track customer phone numbers, and monitor paid advance deposits.

### Administrator (ADMIN)
- **Venue Governance**: Audit pending wedding hall submissions with one-click approval or rejection.
- **Owner Onboarding**: Create verified venue owner accounts and assign hall management permissions.
- **Platform Directory**: Oversee all venues, modify hall parameters, or perform permanent venue deletions.
- **Comprehensive Booking Audit**: Inspect all platform bookings across all halls with full customer contact logs.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React 18.3.1 + Vite 6.0.7
- **Routing**: React Router DOM 6.28.1 (Nested routes, layout shells, role guards)
- **Server State**: TanStack React Query 5.62.8
- **HTTP Client**: Axios 1.7.9 (Bearer token interceptor with 401 token refresh queue)
- **Styling**: Tailwind CSS 3.4.17 (Custom Warm Minimal design tokens)
- **Icons & Dates**: Lucide React 0.469.0, date-fns 4.1.0
- **Testing**: Vitest 2.1.8, React Testing Library 16.1.0, jsdom 25.0.1
- **E2E Automation**: Playwright 1.63.0
- **Web Server**: Nginx (Alpine multi-stage build)

### Backend
- **Runtime**: Node.js 20 (Native ES Modules)
- **Framework**: Express.js 4.21.2
- **ORM & Database**: Prisma 6.4.1, PostgreSQL 16
- **Cache & Rate Limiting**: Redis 7, `ioredis` 6.0.0, `rate-limit-redis` 4.3.1
- **Security & Auth**: JWT (`jsonwebtoken` 9.0.2), bcrypt 5.1.1 (12 rounds), Helmet 8.0.0, CORS 2.8.5
- **Validation**: Zod 3.24.2
- **Email & Uploads**: Nodemailer 6.10.0, Multer 1.4.5 (In-memory storage)
- **Object Storage**: AWS S3 SDK (`@aws-sdk/client-s3` 3.1131.0) for MinIO
- **API Documentation**: Swagger / OpenAPI 3.0 (`swagger-ui-express` 5.0.1)
- **Testing**: Jest 29.7.0, Supertest 7.0.0

### Infrastructure
- **Containerization**: Docker Compose
- **Services**: PostgreSQL 16 Alpine, Redis 7 Alpine, MinIO (S3 API + Console), Mailpit, Nginx, Express API

---

## 📦 Services & Port Mappings

| Service | Container Name | Host Port | Internal Port | URL / Interface |
| :--- | :--- | :---: | :---: | :--- |
| **Frontend Web** | `toyxonahub_frontend` | `5173` | `80` | `http://localhost:5173` |
| **Backend REST API** | `toyxonahub_backend` | `5050` | `5050` | `http://localhost:5050` |
| **Swagger API Docs** | `toyxonahub_backend` | `5050` | `5050` | `http://localhost:5050/api-docs` |
| **PostgreSQL Database**| `toyxonahub_postgres` | `5432` | `5432` | `localhost:5432` (db: `toyxonahub`) |
| **Redis Cache / Store**| `toyxonahub_redis` | `6379` | `6379` | `localhost:6379` |
| **MinIO S3 API** | `toyxonahub_minio` | `9000` | `9000` | `http://localhost:9000` |
| **MinIO Web Console** | `toyxonahub_minio` | `9001` | `9001` | `http://localhost:9001` |
| **Mailpit Web UI** | `toyxonahub_mailpit` | `8025` | `8025` | `http://localhost:8025` |
| **Mailpit SMTP** | `toyxonahub_mailpit` | `1025` | `1025` | `localhost:1025` |

---

## 🚀 Running with Docker

### 1. Configure Environment
Copy the default environment configuration:
```bash
cp .env.example .env
```

### 2. Start Full Container Environment
```bash
docker compose up -d --build
```
This automatically starts PostgreSQL, Redis, MinIO, Mailpit, applies database migrations, and boots the backend and frontend services.

### 3. Seed Development Database
Populate the database with verified Tashkent wedding halls, photos, services, and demo user accounts:
```bash
docker compose exec backend npm run prisma:seed
```

---

## 👥 Demo Accounts (Local Development Only)

> [!IMPORTANT]
> The following credentials are provided **for local development and evaluation only**. Never use default credentials in production environments.

| Role | Email / Login | Username | Password | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@toyxonahub.uz` | `admin` | `AdminPassword123!` | Moderate halls, manage owners, audit bookings |
| **OWNER (Verified)** | `owner1@toyxonahub.uz` | `owner_versal` | `OwnerPassword123!` | Pre-verified owner with assigned wedding halls |
| **OWNER (Unverified)**| `owner2@toyxonahub.uz` | `owner_yulduz` | `OwnerPassword123!` | Tests first-login email OTP verification flow |
| **USER 1 (Customer)** | `user1@example.com` | `jasur_k` | `UserPassword123!` | Customer account with booking history |
| **USER 2 (Customer)** | `user2@example.com` | `madina_a` | `UserPassword123!` | Fresh customer account for booking flow tests |

---

## 🧪 Testing Suite & Quality Verification

Verified full-stack test suite status (as of **2026-09-13**):

```text
Test Layer                  Framework                Tests     Status
-----------------------------------------------------------------------
Frontend Unit & UI          Vitest + RTL              70       100% Passed
Backend Integration         Jest + Supertest          48       100% Passed
End-to-End Browser          Playwright (4 viewports)  14       100% Passed
-----------------------------------------------------------------------
Total Passing Tests                                  132       100% Passed
```

### Running Test Suites Locally:
```bash
# Frontend Unit Tests
cd frontend && npm test

# Backend Integration Tests (runs against isolated test DB)
cd backend && npm test

# Playwright End-to-End Tests
cd frontend && npx playwright test
```

---

## 📖 Technical Documentation

Complete architectural documentation is maintained in the [`docs/`](docs/) directory:

- **[System Architecture](docs/architecture.md)**: Infrastructure topology, component boundaries, and Mermaid architecture diagram.
- **[Frontend Architecture](docs/frontend.md)**: React 18 SPA structure, route layouts, TanStack Query, and UI component catalog.
- **[Backend Architecture](docs/backend.md)**: Clean layered pattern, module breakdown, middleware, and error taxonomy.
- **[Database Architecture](docs/database.md)**: PostgreSQL models, constraints, raw partial unique index, and Mermaid ER diagram.
- **[Authentication & RBAC](docs/authentication.md)**: Role permissions matrix, JWT lifecycle, and Owner email OTP flow.
- **[Booking Lifecycle](docs/booking-flow.md)**: Step-by-step booking journey, price calculation, and Mermaid sequence diagram.
- **[REST API Reference](docs/api.md)**: Endpoint catalog by module, response envelopes, and error codes.
- **[Environment Configuration](docs/configuration.md)**: Complete environment variables table with safe examples.
- **[Docker Infrastructure](docs/docker.md)**: Container setup, persistent volumes, and operational commands.
- **[Testing & Quality Assurance](docs/testing.md)**: Test suites, execution guides, and verified metrics.
- **[Security Safeguards](docs/security.md)**: Implemented security controls and documented development limitations.
- **[Design System & Motion](docs/design-system.md)**: Warm Minimal color palette, typography hierarchy, motion tokens, and accessibility.
- **[Troubleshooting Guide](docs/troubleshooting.md)**: Diagnostic steps for common local setup hurdles.
- **[Development Workflow](docs/development.md)**: Daily developer loop, linting standards, and pre-commit checks.
