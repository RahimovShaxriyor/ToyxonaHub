# Docker Infrastructure & Container Topology

## 1. Overview

ToyxonaHub is configured for turnkey multi-container deployment via Docker Compose. All six core services run on a private Docker bridge network (`toyxonahub-network`) with health dependencies and named volume persistence.

---

## 2. Container Services Reference

| Service Name | Container Name | Base Image | Host Port | Internal Port | Health Check |
| :--- | :--- | :--- | :---: | :---: | :--- |
| `frontend` | `toyxonahub_frontend` | `nginx:alpine` (multi-stage) | `5173` | `80` | `wget -qO- http://127.0.0.1:80/` |
| `backend` | `toyxonahub_backend` | `node:20-alpine` | `5050` | `5050` | `wget -qO- http://127.0.0.1:5050/health` |
| `postgres` | `toyxonahub_postgres` | `postgres:16-alpine` | `5432` | `5432` | `pg_isready -U toyxona_user -d toyxonahub` |
| `redis` | `toyxonahub_redis` | `redis:7-alpine` | `6379` | `6379` | `redis-cli ping` |
| `minio` | `toyxonahub_minio` | `quay.io/minio/minio` | `9000`, `9001` | `9000`, `9001` | Started listener |
| `minio-init`| `toyxonahub_minio_init` | `quay.io/minio/mc` | None | None | Ephemeral init container (exits 0) |
| `mailpit` | `toyxonahub_mailpit` | `axllent/mailpit` | `1025`, `8025` | `1025`, `8025` | Started listener |

---

## 3. Service Details & Lifecycle

### 1. `postgres` (Database)
- Runs PostgreSQL 16 Alpine.
- Automatically creates database `toyxonahub` owned by `toyxona_user`.
- Data is stored in persistent named volume `postgres_data` (`/var/lib/postgresql/data`).

### 2. `redis` (Cache & Rate Limiting)
- Runs Redis 7 Alpine with Append-Only File (AOF) persistence enabled (`redis-server --appendonly yes`).
- Data is stored in persistent named volume `redis_data` (`/data`).

### 3. `minio` & `minio-init` (Object Storage)
- MinIO server starts and listens on `:9000` (API) and `:9001` (Web Console).
- `minio-init` waits for MinIO to become reachable, registers the local alias, creates the public bucket `toyxonahub-images`, sets anonymous download permissions, and exits cleanly (`exit 0`).
- Binary assets are persisted in named volume `minio_data` (`/data`).

### 4. `mailpit` (Development Mailer)
- Captures all transactional email and OTP traffic emitted by the backend via SMTP port `1025`.
- Web management interface accessible at `http://localhost:8025`.

### 5. `backend` (Application API)
- Depends on `postgres` (healthy), `redis` (healthy), `minio` (started), `minio-init` (completed successfully), and `mailpit` (started).
- Automatically executes pending Prisma migrations (`npx prisma migrate deploy`) before binding to port `5050`.

### 6. `frontend` (Web Presentation & Nginx Proxy)
- Depends on `backend` (healthy).
- Built with multi-stage Docker build:
  1. `builder`: Node.js 20 builds production assets via `npm run build` into `/app/dist`.
  2. `stage-1`: Nginx Alpine serves static files and reverse proxies `/api/*` to `http://backend:5050`.

---

## 4. Volume Persistence & Safety Rules

ToyxonaHub defines three persistent Docker volumes:

```yaml
volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### Safe Stop & Restart (Data Preserved):
```bash
docker compose down
```
Stopping containers with `docker compose down` retains all database records, registered accounts, wedding hall listings, and uploaded images.

### Destructive Teardown (Data Erased):
```bash
docker compose down -v
```
> [!WARNING]
> The `-v` flag deletes all named volumes (`postgres_data`, `redis_data`, `minio_data`). This permanently destroys all user accounts, wedding halls, bookings, and uploaded photos. Only use this when performing a complete environment reset.

---

## 5. Common Operational Commands

### View Live Container Logs:
```bash
# All containers
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

### Check Health & Status:
```bash
docker compose ps
```

### Rebuild Single Service:
```bash
# Rebuild and restart frontend
docker compose build frontend && docker compose up -d frontend

# Rebuild and restart backend
docker compose build backend && docker compose up -d backend
```

### Run Database Migrations or Seed inside Docker:
```bash
# Run migrations
docker compose exec backend npx prisma migrate deploy

# Run seed
docker compose exec backend npm run prisma:seed
```
