# ToyxonaHub - Online Wedding Hall Booking System Backend

Production-ready backend for **ToyxonaHub** — a modern platform for discovering, filtering, and booking wedding halls in Tashkent, Uzbekistan. Built with Node.js, Express.js (ES Modules), PostgreSQL, Prisma ORM, JWT, and Clean Layered Architecture.

---

## 1. Project Overview

ToyxonaHub provides an end-to-end wedding hall management and booking system with multi-role access (Admin, Owner, User). It guarantees concurrency protection against double-booking, verifies owner emails via one-time passwords (OTP), computes transparent price breakdowns with a mandatory 20% advance payment, and enforces strict authorization boundaries.

---

## 2. Architecture & Design Principles

The codebase strictly adheres to **Clean Code**, **SOLID**, and **Separation of Concerns**:

- **Layered Flow**: `HTTP Request → Validation (Zod) → Controller → Service → Repository → Prisma/Database`.
- **Thin Controllers**: Controllers handle only HTTP requests, status codes, and JSON response formatting. No direct database or business logic.
- **Pure Domain Business Logic**: Pricing calculations (`calculateBookingPrices`), calendar status generation, and business validations are testable without mocking Express objects.
- **Dependency Inversion**: Services depend on repository abstractions rather than direct ORM calls.
- **Centralized Error Handling**: Custom error hierarchy (`AppError`, `NotFoundError`, `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `ConflictError`) delivering consistent error responses.
- **Double-Booking Concurrency Guarantee**:
  Enforced via a PostgreSQL raw partial unique index:
  ```sql
  CREATE UNIQUE INDEX unique_active_booking_per_hall_date
  ON "Booking" ("weddingHallId", "bookingDate")
  WHERE status = 'ACTIVE';
  ```
  Any concurrent booking collision immediately triggers a `409 Conflict` with code `BOOKING_DATE_UNAVAILABLE`.
- **Historical Snapshots**: Selected services (Singers, Cars, Menus, Karnay-Surnay) are stored with immutable historical price snapshots (`priceSnapshot`, `nameSnapshot`), preventing future price changes from mutating existing bookings.
- **Graceful Shutdown**: Handles `SIGTERM` and `SIGINT`, shutting down the HTTP listener and safely disconnecting the Prisma client.

---

## 3. Technology Stack

- **Runtime**: Node.js (v20+ / v22+)
- **Framework**: Express.js (ES Modules: `"type": "module"`)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: JWT (`accessToken` + `refreshToken` rotation) with SHA-256 token hashing
- **Password Security**: bcrypt (12 salt rounds)
- **Validation**: Zod
- **Email / OTP**: Nodemailer
- **File Upload**: Multer (strict mime checks, UUID file generation)
- **Security**: Helmet, CORS, Express Rate Limit
- **API Documentation**: Swagger / OpenAPI 3.0 (`swagger-ui-express`)
- **Testing**: Jest + Supertest (Native Node.js VM Modules)
- **Code Quality**: ESLint 9 (Flat Config), Prettier

---

## 4. Project Directory Structure

```text
ToyxonaHub/
├── src/
│   ├── app.js                         # Express application setup
│   ├── server.js                      # Server startup & graceful shutdown
│   ├── config/
│   │   ├── env.js                     # Zod-validated environment config
│   │   ├── database.js                # Prisma client singleton
│   │   └── swagger.js                 # OpenAPI 3.0 specification & Swagger UI
│   ├── middleware/
│   │   ├── authenticate.js            # JWT Bearer token authentication
│   │   ├── authorize.js               # Role-based access control (RBAC)
│   │   ├── error-handler.js           # Centralized error handler
│   │   ├── rate-limiter.js            # Auth & OTP rate limiters
│   │   ├── upload.js                  # Multer image upload handler
│   │   └── validate.js                # Generic Zod validation middleware
│   ├── modules/
│   │   ├── auth/                      # Authentication & Refresh Token rotation
│   │   ├── users/                     # User profile management
│   │   ├── owners/                    # Owner creation & listing (Admin)
│   │   ├── wedding-halls/             # Wedding hall CRUD, search, filter, calendar
│   │   ├── services/                  # Additional services (Singers, Cars, Menu, Karnay)
│   │   └── bookings/                  # Booking creation, concurrency, cancellation, mock payment
│   ├── routes/
│   │   └── index.js                   # Master API router (/api/v1)
│   └── shared/
│       ├── constants/                 # Roles, Districts, Statuses, Service Types
│       ├── errors/                    # AppError, NotFoundError, ConflictError, etc.
│       └── utils/                     # Password hashing, token, business date, Decimal price
├── prisma/
│   ├── schema.prisma                  # PostgreSQL models & relations
│   ├── migrations/                    # Prisma migration SQL files
│   └── seed.js                        # Database seeder (Admin, Owners, Halls, Services)
├── tests/
│   ├── auth.test.js                   # Auth endpoints & token refresh
│   ├── authorization.test.js          # RBAC & boundary permissions
│   ├── booking.test.js                # Booking business rules, pricing, race conditions
│   ├── otp.test.js                    # Email OTP verification
│   ├── wedding-halls.test.js          # Search, filter, availability calendar
│   ├── setup-env.js                   # Test environment loader
│   └── test-helper.js                 # Test DB cleaner & mock fixtures
├── uploads/                           # Static uploaded images
├── docker-compose.yml                 # Turnkey PostgreSQL container setup
├── eslint.config.js                   # ESLint flat config
├── .prettierrc                        # Prettier configuration
├── .env.example                       # Environment variables template
├── package.json                       # Scripts and dependencies
└── README.md                          # Documentation
```

---

## 5. Requirements & Installation

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL server (local or via Docker)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd ToyxonaHub
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=5050
NODE_ENV=development
DATABASE_URL="postgresql://username:password@localhost:5432/toyxonahub?schema=public"

JWT_ACCESS_SECRET="toyxonahub_jwt_access_secret_production_ready_dev_key_2026"
JWT_REFRESH_SECRET="toyxonahub_jwt_refresh_secret_production_ready_dev_key_2026"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

FRONTEND_URL="http://localhost:3000"
OTP_EXPIRES_MINUTES=5
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE_MB=5
```

### 3. Database Setup with Docker (Optional)
If you prefer running PostgreSQL in Docker:
```bash
docker compose up -d
```

### 4. Run Migrations & Seed Database
```bash
# Run Prisma migrations
npm run prisma:migrate

# Seed development database
npm run prisma:seed
```

---

## 6. Default Credentials (Seed Data)

| Role | Email / Login | Username | Password |
|---|---|---|---|
| **ADMIN** | `admin@toyxonahub.uz` | `admin` | `AdminPassword123!` |
| **OWNER (Verified)** | `owner1@toyxonahub.uz` | `owner_versal` | `OwnerPassword123!` |
| **OWNER (Requires OTP)** | `owner2@toyxonahub.uz` | `owner_yulduz` | `OwnerPassword123!` |
| **USER 1** | `user1@example.com` | `jasur_k` | `UserPassword123!` |
| **USER 2** | `user2@example.com` | `madina_a` | `UserPassword123!` |

---

## 7. Running the Application

### Development Mode (auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

Server will start on `http://localhost:5050`.

---

## 8. API Documentation (Swagger UI)

Interactive OpenAPI / Swagger documentation is available at:
```text
http://localhost:5050/api-docs
```
Raw OpenAPI JSON schema:
```text
http://localhost:5050/api-docs.json
```

---

## 9. Running Tests & Code Quality

### Automated Tests
Tests use an **isolated test database** (`toyxonahub_test`) to guarantee that your development database is never mutated.

```bash
# Run complete test suite (Jest + Supertest with native ES Modules)
npm test

# Run tests with code coverage
npm run test:coverage
```

### Linter & Formatter
```bash
# Check ESLint
npm run lint

# Automatically fix lint issues
npm run lint:fix

# Format with Prettier
npm run format
```

---

## 10. API Endpoints Reference

### Authentication (`/api/v1/auth`)
- `POST /register` — Register a standard USER account.
- `POST /login` — Authenticate. For OWNER with unverified email, sends OTP and returns `requiresEmailVerification: true`.
- `POST /refresh` — Exchange refresh token for new access and rotated refresh tokens.
- `POST /logout` — Revoke refresh token.
- `POST /send-otp` — Request 6-digit email OTP (rate-limited).
- `POST /verify-otp` — Verify OTP, set `emailVerified: true`, return authentication tokens.

### Profile (`/api/v1/users`)
- `GET /me` — Get current authenticated user profile (`[USER, OWNER, ADMIN]`).
- `PATCH /me` — Update current user profile.

### Owners Management (`/api/v1/owners`)
- `POST /` — Create a new OWNER account (`[ADMIN only]`).
- `GET /` — List owners with pagination (`[ADMIN only]`).
- `GET /:id` — Get owner details and assigned halls (`[ADMIN only]`).

### Wedding Halls (`/api/v1/wedding-halls`)
- `GET /` — Search & filter wedding halls (`search`, `district`, `minCapacity`, `maxCapacity`, `minPrice`, `maxPrice`, `sortBy`, `order`, `page`, `limit`).
  *USER sees only `APPROVED` halls. ADMIN can filter by any status.*
- `GET /:id` — Detailed wedding hall profile with images and services.
- `GET /:id/availability?year=YYYY&month=M` — Calendar availability (`AVAILABLE`, `BOOKED`, `PAST`).
- `POST /` — Create wedding hall (`[OWNER]` creates with `PENDING` status; `[ADMIN]` can specify owner and status).
- `PATCH /:id` — Update hall (`[OWNER]` can only update their own hall; `[ADMIN]` can update any).
- `PATCH /:id/status` — Approve or reject hall (`[ADMIN only]`).
- `PATCH /:id/assign-owner` — Assign hall to an OWNER (`[ADMIN only]`).
- `DELETE /:id` — Delete wedding hall (`[ADMIN only]`).

### Additional Services (`/api/v1/wedding-halls/:hallId/services`)
- `POST /singers`, `DELETE /singers/:singerId` — Manage singers.
- `POST /cars`, `DELETE /cars/:carId` — Manage luxury cars.
- `POST /menu`, `DELETE /menu/:menuId` — Manage menu options.
- `PUT /karnay-surnay` — Set Karnay-Surnay availability and price.

### Bookings (`/api/v1/bookings`)
- `POST /` — Create a booking (`[USER only]`). Atomic transaction with strict date availability check and server-side price calculation.
- `GET /my` — List bookings of authenticated USER.
- `GET /owner` — List bookings for halls owned by authenticated OWNER.
- `GET /admin` — List all bookings on platform (`[ADMIN only]`).
- `GET /:id` — Booking details with snapshot services.
- `PATCH /:id/cancel` — Cancel booking (`USER` cancels own, `OWNER` cancels own hall, `ADMIN` cancels any).
- `POST /:id/pay` — Idempotent mock payment (`Muvaffaqiyatli to'landi`).

---

## 11. Core Business Rules

1. **Double-Booking Protection**:
   - Application level: Transaction checks for existing ACTIVE booking on `(weddingHallId, bookingDate)`.
   - Database level: PostgreSQL raw partial unique index `UNIQUE (weddingHallId, bookingDate) WHERE status = 'ACTIVE'`.
   - Result: HTTP `409 Conflict` with body `{ "success": false, "error": { "code": "BOOKING_DATE_UNAVAILABLE", "message": "Wedding hall is already booked for this date" } }`.
2. **Date Boundaries**:
   - Booking date must be in `YYYY-MM-DD` format.
   - Dates in the past (based on `Asia/Tashkent` calendar time) are rejected (`400 Bad Request`).
3. **Capacity Constraints**:
   - `guestCount` must be `> 0` and `<= hall.capacity`. Exceeding capacity returns `400 Bad Request`.
4. **Server-Side Price Calculation**:
   - `hallPrice = pricePerSeat * guestCount`.
   - `servicesPrice = sum(verified prices from database)`.
   - `totalPrice = hallPrice + servicesPrice`.
   - `advanceAmount = totalPrice * 0.20` (exact 20% calculated by backend using `Decimal.js`).
5. **Idempotent Payment**:
   - Cancelled bookings cannot be paid.
   - Already paid bookings cannot be paid a second time.
6. **Owner Hall Lifecycle**:
   - When an OWNER creates a wedding hall, its status is automatically `PENDING`.
   - An OWNER cannot approve their own wedding hall. Approval must be granted by an ADMIN.
   - An OWNER cannot edit or cancel bookings of another OWNER's hall.

---

## 12. Tashkent Districts

The system strictly validates against the 12 administrative districts of Tashkent:
`BEKTEMIR`, `CHILONZOR`, `YASHNOBOD`, `MIROBOD`, `MIRZO_ULUGBEK`, `SERGELI`, `SHAYXONTOHUR`, `OLMAZOR`, `UCHTEPA`, `YAKKASAROY`, `YUNUSOBOD`, `YANGIHAYOT`.
