# Backend Architecture & Implementation

## 1. Architectural Layers

The backend follows a strict **Clean Layered Architecture** pattern with unidirectional flow and clear separation of concerns.

```text
HTTP Client Request
       ↓
[Route Definition]          src/modules/*/*.routes.js
       ↓
[Validation Middleware]     src/middleware/validate.js (Zod schemas)
       ↓
[Controller Layer]          src/modules/*/*.controller.js (Thin HTTP handler)
       ↓
[Service Layer]             src/modules/*/*.service.js (Pure domain logic & transactions)
       ↓
[Data Access / ORM]         src/config/database.js (@prisma/client)
       ↓
PostgreSQL Database         (PostgreSQL 16)
```

### Layer Principles:
1. **Routes**: Define URL paths, HTTP verbs, rate limiters, upload configurations, and chain middleware.
2. **Validation**: Validate request parameters, query strings, and body payloads with Zod before invoking controllers. Invalid payloads immediately return `422 Unprocessable Entity` or `400 Bad Request`.
3. **Controllers**: Purely responsible for parsing incoming HTTP requests, determining appropriate status codes, and formatting JSON output envelopes. Controllers never execute raw database queries or complex domain logic.
4. **Services**: Contain all domain business logic, pricing computations via `Decimal.js`, double-booking verification, cache invalidation, and orchestration of multi-table database transactions.
5. **Data Access**: Prisma Client executes parameterized queries and transactions, maintaining referential integrity and concurrency constraints.

---

## 2. Core Modules Breakdown

The backend domain is structured into 6 feature modules under `src/modules/`:

### 1. `auth` Module (`src/modules/auth/`)
- **Responsibilities**:
  - Customer registration (`POST /api/v1/auth/register`) with bcrypt password hashing (12 rounds) and automatic login token issuance.
  - User and Owner authentication (`POST /api/v1/auth/login`). For Owner accounts with unverified email (`emailVerified: false`), triggers an OTP email and returns `{ requiresEmailVerification: true }`.
  - Token refresh and rotation (`POST /api/v1/auth/refresh`). Exchanges a valid refresh token for a new access token and a newly rotated refresh token, revoking the previous token hash.
  - Logout (`POST /api/v1/auth/logout`) which marks the database refresh token record as `revoked: true`.
  - Email OTP delivery and verification (`POST /api/v1/auth/send-otp`, `POST /api/v1/auth/verify-otp`) using Redis for attempt throttling and SHA-256 code hashing with a 10-minute TTL.

### 2. `users` Module (`src/modules/users/`)
- **Responsibilities**:
  - Inspecting the currently authenticated user's profile (`GET /api/v1/users/me`).
  - Updating customer contact details (`PATCH /api/v1/users/me`) for `firstName`, `lastName`, and phone number.

### 3. `owners` Module (`src/modules/owners/`)
- **Responsibilities**:
  - Administrator management of venue owners.
  - Creating new owner accounts with assigned credentials (`POST /api/v1/owners`).
  - Listing all registered venue owners with pagination (`GET /api/v1/owners`).
  - Inspecting single owner details and their currently assigned wedding halls (`GET /api/v1/owners/:id`).
- **Access Boundary**: Strictly protected by `authenticate` and `authorize(ROLES.ADMIN)`.

### 4. `wedding-halls` Module (`src/modules/wedding-halls/`)
- **Responsibilities**:
  - Public search and filtering (`GET /api/v1/wedding-halls`) with support for keyword search, Tashkent district enum filter, capacity ranges, and price-per-seat ranges.
  - Public hall detail retrieval (`GET /api/v1/wedding-halls/:id`) including gallery images and available service packages.
  - Monthly availability calendar (`GET /api/v1/wedding-halls/:id/availability?year=YYYY&month=M`).
  - Venue owner creation of halls (`POST /api/v1/wedding-halls`), automatically assigned `status: PENDING`.
  - Admin moderation (`PATCH /api/v1/wedding-halls/:id/status`) to `APPROVED` or `REJECTED`.
  - Admin reassignment of hall ownership (`PATCH /api/v1/wedding-halls/:id/assign-owner`).
  - Hall deletion (`DELETE /api/v1/wedding-halls/:id`), cascading safely to associated images and services.
  - Image gallery upload and management (`POST /:id/images`, `DELETE /:id/images/:imageId`, `PATCH /:id/images/:imageId/primary`).

### 5. `services` Module (`src/modules/services/`)
- **Responsibilities**:
  - Nested router mounted at `/api/v1/wedding-halls/:hallId/services`.
  - Singer/band management (`POST /singers`, `PATCH /singers/:singerId`, `DELETE /singers/:singerId`).
  - Cortege vehicle management (`POST /cars`, `PATCH /cars/:carId`, `DELETE /cars/:carId`).
  - Banquet menu tiers (`POST /menu`, `PATCH /menu/:menuId`, `DELETE /menu/:menuId`).
  - National Karnay-Surnay ensemble configuration (`PUT /karnay-surnay`).
- **Access Boundary**: Venue owners can modify services only for halls they own. Admins have platform-wide access.

### 6. `bookings` Module (`src/modules/bookings/`)
- **Responsibilities**:
  - Atomic booking creation (`POST /api/v1/bookings`) available strictly to users with `USER` role.
  - Enforces date availability, guest count $\le$ hall capacity, and verified service ownership.
  - Computes authoritative prices using `Decimal.js` and creates immutable snapshots (`BookingSelectedService`).
  - Customer booking inspection (`GET /api/v1/bookings/my`).
  - Venue owner booking inspection (`GET /api/v1/bookings/owner`) restricted to their owned halls.
  - Admin platform-wide booking audit (`GET /api/v1/bookings/admin`).
  - Booking cancellation (`PATCH /api/v1/bookings/:id/cancel`).
  - Simulated 20% advance payment (`POST /api/v1/bookings/:id/pay`) updating `paymentStatus: PAID`.

---

## 3. Middleware Architecture

| Middleware | File Path | Purpose |
| :--- | :--- | :--- |
| `authenticate` | `src/middleware/authenticate.js` | Extracts Bearer JWT token from `Authorization` header, verifies signature via `JWT_ACCESS_SECRET`, checks database active user, and attaches `req.user`. Returns `401 Unauthorized` if invalid. |
| `optionalAuthenticate` | `src/middleware/authenticate.js` | Non-blocking version of authenticate. Attaches `req.user` if valid token exists, but permits unauthenticated requests to proceed. |
| `authorize(...roles)` | `src/middleware/authorize.js` | Role-based access control (RBAC). Validates that `req.user.role` matches at least one permitted role. Returns `403 Forbidden` if unauthorized. |
| `validate(schema)` | `src/middleware/validate.js` | Generic Zod validator executing `schema.parseAsync()` against `req.body`, `req.query`, or `req.params`. Converts schema violations into normalized field error arrays. |
| `upload` | `src/middleware/upload.js` | Multer instance configured with `memoryStorage()`, limiting uploads to 5 MB per file and strictly verifying JPEG, PNG, or WebP MIME types. |
| Rate Limiters | `src/middleware/rate-limiter.js` | Express rate limiters backed by Redis (`rate-limit-redis`) protecting auth endpoints: `loginLimiter`, `registerLimiter`, `otpSendLimiter`, and `otpVerifyLimiter`. |
| `errorHandler` | `src/middleware/error-handler.js` | Centralized catch-all error handling middleware that captures operational and unexpected errors, outputting a predictable JSON error structure. |

---

## 4. Centralized Error Handling

All custom exceptions inherit from `AppError` located in `src/shared/errors/index.js`:

| Error Class | HTTP Status | Error Code | Description |
| :--- | :---: | :--- | :--- |
| `BadRequestError` | 400 | `BAD_REQUEST` | Generic client request error or malformed input. |
| `ValidationError` | 422 | `VALIDATION_ERROR` | Schema validation failures; includes `details` field array. |
| `UnauthorizedError` | 401 | `UNAUTHORIZED` | Missing, expired, or invalid JWT token. |
| `ForbiddenError` | 403 | `FORBIDDEN` | Authenticated user lacks permission for the resource. |
| `NotFoundError` | 404 | `NOT_FOUND` | Requested database record or route does not exist. |
| `ConflictError` | 409 | `CONFLICT` | Unique constraint conflict (e.g. duplicate email, taken username). |
| `ServiceUnavailableError`| 503 | `STORAGE_SERVICE_UNAVAILABLE` | External infrastructure failure (e.g. MinIO connection refused). |

### Prisma Error Mapping in Error Handler:
- `P2002` on `(weddingHallId, bookingDate)` $\rightarrow$ HTTP 409 with code `BOOKING_DATE_UNAVAILABLE`.
- `P2002` on other unique fields (e.g. `email`, `username`) $\rightarrow$ HTTP 409 with code `DUPLICATE_ENTRY`.
- `P2025` (record not found on delete/update) $\rightarrow$ HTTP 404 with code `NOT_FOUND`.
- `MulterError` (file size exceeded) $\rightarrow$ HTTP 400 with code `UPLOAD_ERROR`.
