# ToyxonaHub Technical Documentation

Welcome to the comprehensive technical documentation for **ToyxonaHub — Online Wedding Hall Booking System in Tashkent**.

This documentation accurately reflects the current production architecture, verified data models, API endpoints, testing frameworks, and Docker infrastructure.

---

## 📚 Documentation Index

| Document | Topic & Scope |
| :--- | :--- |
| **[Architecture Overview](architecture.md)** | High-level system topology, component responsibilities, Mermaid architecture diagram, and network communication paths. |
| **[Frontend Architecture](frontend.md)** | React 18 SPA structure, React Router v6 layouts, React Query caching, Axios token refresh queue, and shared UI component catalog. |
| **[Backend Architecture](backend.md)** | Clean layered architecture (`Route -> Validation -> Controller -> Service -> Prisma`), 6 feature modules, and centralized error handling. |
| **[Database Architecture](database.md)** | PostgreSQL 16 schema, Prisma models, constraints, raw partial unique index, and complete Mermaid ER diagram. |
| **[Authentication & Authorization](authentication.md)** | RBAC permissions matrix (`GUEST`, `USER`, `OWNER`, `ADMIN`), bcrypt hashing, JWT access/refresh rotation, and Owner email OTP verification. |
| **[Booking Lifecycle](booking-flow.md)** | End-to-end booking journey, guest draft restoration, server-authoritative pricing via `Decimal.js`, conflict handling, and Mermaid sequence diagram. |
| **[REST API Reference](api.md)** | OpenAPI / Swagger interactive reference (`:5050/api-docs`), endpoint directory by module, and standardized error response examples. |
| **[Environment Configuration](configuration.md)** | Complete environment variables matrix with required flags, service mappings, and safe development examples. |
| **[Docker Infrastructure](docker.md)** | 6 Compose container services, port mappings, volume persistence (`postgres_data`, `redis_data`, `minio_data`), and safe operational hygiene. |
| **[Quality Assurance & Testing](testing.md)** | Verified test metrics (132 passed tests on 2026-09-13) covering Vitest unit tests, Jest integration tests, and Playwright E2E suites. |
| **[Security Safeguards](security.md)** | Defense-in-depth measures (bcrypt, JWT rotation, Zod, Redis rate limiting, Helmet, in-memory file filtering) and documented development limitations. |
| **[Design System & Motion](design-system.md)** | Warm Minimal color palette, typography hierarchy (Playfair Display / Plus Jakarta Sans), unified motion tokens, and accessibility standards. |
| **[Troubleshooting Guide](troubleshooting.md)** | Practical diagnostic steps and safe commands for resolving port collisions, Docker daemon issues, database sync, and stale builds. |
| **[Development Workflow](development.md)** | Local environment setup, daily development loop, code formatting, linting checks, and pre-commit verification checklist. |

---

## 🧭 Recommended Reading Paths

### For New Developers
1. [Architecture Overview](architecture.md)
2. [Development Workflow](development.md)
3. [Environment Configuration](configuration.md)
4. [Docker Infrastructure](docker.md)

### For Frontend Engineers
1. [Frontend Architecture](frontend.md)
2. [Design System & Motion](design-system.md)
3. [Booking Lifecycle](booking-flow.md)
4. [Quality Assurance & Testing](testing.md)

### For Backend Engineers
1. [Backend Architecture](backend.md)
2. [Database Architecture](database.md)
3. [Authentication & Authorization](authentication.md)
4. [REST API Reference](api.md)

### For DevOps & QA Engineers
1. [Docker Infrastructure](docker.md)
2. [Security Safeguards](security.md)
3. [Quality Assurance & Testing](testing.md)
4. [Troubleshooting Guide](troubleshooting.md)
