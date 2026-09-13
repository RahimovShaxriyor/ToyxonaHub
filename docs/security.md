# Security Architecture & Implemented Safeguards

## 1. Overview

ToyxonaHub applies defense-in-depth principles across transport, application logic, caching, and persistence layers. This document outlines the real security controls implemented in the repository, along with known development limitations.

---

## 2. Implemented Security Controls

### A. Password Security
- Passwords are encrypted before database insertion using **bcrypt** with a work factor of **12 salt rounds** (`bcrypt.hash(password, 12)`).
- Plaintext passwords are never logged, cached, or returned in API responses (Prisma queries explicitly exclude `passwordHash`).

### B. JWT & Session Security
- **Short-Lived Access Tokens**: Signed with `JWT_ACCESS_SECRET` using `HS256`, expiring after **15 minutes**.
- **Hashed Refresh Token Rotation**: Refresh tokens are stored in the database `RefreshToken` table **strictly as SHA-256 hashes**. On every token refresh (`POST /auth/refresh`), the old token is marked `revoked: true` and an entirely new token pair is issued.
- **Revocation on Logout**: Explicit sign-out (`POST /auth/logout`) revokes the refresh token hash immediately in the database.

### C. Input Validation & Type Safety
- All incoming requests are validated against strict **Zod schemas** before reaching controller logic.
- Unknown or unexpected properties are stripped.
- String fields (such as phone numbers and names) undergo sanitization and format verification (e.g. `+998XXXXXXXXX`).

### D. Rate Limiting & Brute Force Prevention
- Sensitive authentication routes are protected by Express Rate Limiters backed by Redis (`rate-limit-redis`):
  - `loginLimiter`: 5 login attempts per 15 minutes per IP.
  - `registerLimiter`: 3 registrations per hour per IP.
  - `otpSendLimiter`: 3 OTP generation requests per 10 minutes per IP.
  - `otpVerifyLimiter`: 5 verification attempts per 10 minutes per IP.
- Responses on rate limit exceedance return standard HTTP `429 Too Many Requests` with `Retry-After` headers.

### E. HTTP Security Headers & CORS
- **Helmet**: Configures secure HTTP headers:
  - Cross-Origin Resource Policy (`policy: 'cross-origin'`).
  - Content Security Policy (CSP) defining trusted scripts, styles, and image origins (`'self'`, S3 endpoints).
- **CORS**: Enforces origin restrictions (`FRONTEND_URL`), explicitly rejecting unapproved cross-origin requests while permitting credentials (`credentials: true`).

### F. File Upload Sanitization
- File processing uses `multer.memoryStorage()` so uploaded data is held in-memory and never written to temporary server disk locations.
- Restricts file types strictly to `image/jpeg`, `image/png`, and `image/webp` via extension and MIME checks.
- Enforces an upper limit of **5 MB per file** and a maximum of 10 images per batch upload.

### G. Database Protection
- **SQL Injection**: All database operations execute through Prisma ORM parameterized queries, completely neutralizing SQL injection vectors.
- **Race Condition Prevention**: Enforced at the PostgreSQL engine level via raw partial unique index `UNIQUE ("weddingHallId", "bookingDate") WHERE status = 'ACTIVE'`.

---

## 3. Known Development Limitations

The following items are intentionally simplified for local development and academic evaluation:

1. **Local Object Storage Credentials**: MinIO root credentials default to `minioadmin:minioadmin` in `docker-compose.yml`. Production deployments must provision individual IAM service users with scoped S3 policies.
2. **Local SMTP Mailer**: Mailpit acts as a local interceptor without TLS. Production environments require a verified transactional provider (e.g. Amazon SES, Postmark, SendGrid).
3. **Simulated Payment Gateway**: The 20% advance payment flow (`POST /bookings/:id/pay`) is simulated. It executes idempotent status updates on the internal database without communicating with banking APIs (e.g. Click, Payme, Uzum).
4. **Development Seed Accounts**: Seed accounts are published for local testing. Production databases must generate unique random administrative credentials during initial deployment.
