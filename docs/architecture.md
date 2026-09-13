# System Architecture

## 1. High-Level Topology

ToyxonaHub is architected as a modular, containerized full-stack web application designed for high-concurrency hall discovery and conflict-free booking reservations in Tashkent, Uzbekistan.

The runtime topology consists of six distinct services running within an isolated Docker bridge network (`toyxonahub-network`), exposing only the required application ports to the host:

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer"]
        Browser["User Browser (Desktop / Mobile)"]
    end

    subgraph EdgeLayer ["Edge / Presentation Layer"]
        Nginx["Frontend Web Server (Nginx)<br/>Port: 5173 (Host) -> 80 (Internal)"]
        SPA["React 18 SPA Build<br/>Static Assets & Routes"]
        Nginx --> SPA
    end

    subgraph ApplicationLayer ["Application & Domain Layer"]
        Backend["Express.js REST API (Node.js 20)<br/>Port: 5050<br/>Clean Layered Architecture"]
    end

    subgraph DataAndStorageLayer ["Persistence & Infrastructure Layer"]
        Postgres[("PostgreSQL 16 Database<br/>Port: 5432<br/>Source of Truth")]
        Redis[("Redis 7 In-Memory Store<br/>Port: 6379<br/>Rate Limiting, Cache, OTP TTL")]
        MinIO[("MinIO S3 Object Storage<br/>API: 9000 | Console: 9001<br/>Hall Images")]
        Mailpit["Mailpit Local SMTP<br/>SMTP: 1025 | Web UI: 8025<br/>Dev Email Delivery"]
    end

    Browser -->|"HTTP / UI Navigation (:5173)"| Nginx
    Browser -->|"Direct S3 Asset Fetch (:9000)"| MinIO
    Nginx -->|"/api/* Proxy Pass"| Backend

    Backend -->|"Prisma ORM (TCP 5432)"| Postgres
    Backend -->|"ioredis Client (TCP 6379)"| Redis
    Backend -->|"AWS S3 SDK (HTTP 9000)"| MinIO
    Backend -->|"Nodemailer SMTP (TCP 1025)"| Mailpit
```

---

## 2. Component Responsibilities

| Component | Technology | Primary Responsibilities |
| :--- | :--- | :--- |
| **Frontend Web** | React 18, Vite, Tailwind CSS, Nginx | Presentation layer, client-side routing (`react-router-dom`), asynchronous state management (`@tanstack/react-query`), form control, and reverse proxying API traffic to the backend. |
| **Backend API** | Node.js 20 (ESM), Express.js, Prisma ORM | Business logic orchestration, request validation (`Zod`), authorization & role guards, transaction management, server-side pricing calculation, and error normalization. |
| **Relational Database** | PostgreSQL 16 (Alpine) | Authoritative source of truth for all business records (users, halls, images metadata, services, bookings, payment records, and refresh tokens). Enforces concurrency guarantees via partial unique indexes. |
| **In-Memory Store** | Redis 7 (Alpine) | Key-value storage for rate limiting counters (`rate-limit-redis`), SHA-256 hashed OTP codes with 10-minute TTL, and query caching for wedding hall listings with automated cache invalidation. |
| **Object Storage** | MinIO (S3-compatible) | Binary storage for venue photography and service thumbnails. Accessible via public bucket policy (`toyxonahub-images`) directly by browsers. |
| **Development Mailer** | Mailpit | Local SMTP test server capturing generated email OTP messages without transmitting to live mail servers. Inspectable via built-in Web UI at `:8025`. |

---

## 3. Communication Paths & Protocols

### A. Client to Frontend (`:5173`)
- Standard HTTP/1.1 traffic.
- Static HTML, bundled JavaScript chunks, and stylesheets are served directly by Nginx with gzip compression.
- Single-page application (SPA) routing is handled via Nginx `try_files $uri $uri/ /index.html;`.

### B. Frontend to Backend API Proxy (`/api/*`)
- Nginx intercepts all requests starting with `/api/` and proxies them to `http://backend:5050` inside the Docker bridge network.
- Passes original headers: `Host`, `X-Real-IP`, and `X-Forwarded-For` to ensure accurate rate-limiting based on client IP.

### C. Backend to PostgreSQL (`:5432`)
- Communicates via Prisma Client connection pooling over standard PostgreSQL protocol.
- Connection string: `postgresql://toyxona_user:toyxona_password@postgres:5432/toyxonahub?schema=public`.

### D. Backend to Redis (`:6379`)
- Uses `ioredis` with automatic reconnection strategy and offline command queuing.
- Handles atomic increments for rate limiting and key expiration for OTPs.

### E. Image Upload Pipeline
- Client sends a multipart form data request (`POST /wedding-halls/:id/images`) containing up to 10 files.
- Multer processes the upload in-memory (`multer.memoryStorage()`) without touching backend disk.
- Backend validates MIME type (`image/jpeg`, `image/png`, `image/webp`) and file size ($\le 5\text{ MB}$).
- Streams the buffer to MinIO using `@aws-sdk/client-s3` (`PutObjectCommand`).
- Stores the resulting public URL and metadata record in PostgreSQL via Prisma.
