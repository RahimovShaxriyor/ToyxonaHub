# Troubleshooting Guide

## 1. Common Issues & Safe Resolutions

This guide provides practical resolutions for common issues encountered during local development.

> [!CAUTION]
> Avoid destructive commands like `docker system prune -a` or `docker volume prune` during routine debugging, as they will permanently erase your local database records, user accounts, and MinIO assets.

---

### Issue 1: Docker Socket / Daemon Not Running
**Symptoms:**
```text
Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
```
**Resolution:**
1. On macOS, ensure Docker Desktop is launched and running:
   ```bash
   open -a Docker
   ```
2. Check Docker context:
   ```bash
   docker context ls
   ```
3. If using Docker Desktop on Mac, verify `desktop-linux` context is active:
   ```bash
   docker context use desktop-linux
   ```

---

### Issue 2: Port Collision (Port Already in Use)
**Symptoms:**
```text
Error response from daemon: driver failed programming external connectivity on endpoint: Bind for 0.0.0.0:5432 failed: port is already allocated
```
**Common Conflicting Ports:**
- `5432`: Local PostgreSQL instance installed via Homebrew or apt.
- `6379`: Local Redis instance.
- `5050` or `5173`: Lingering Node/Nginx processes.

**Resolution:**
1. Find which process is holding the port:
   ```bash
   lsof -i :5432
   ```
2. Stop local services:
   ```bash
   brew services stop postgresql@16
   brew services stop redis
   ```
3. Alternatively, override the conflicting host port in `.env` without changing internal container ports:
   ```env
   POSTGRES_PORT=5433
   REDIS_PORT=6380
   ```

---

### Issue 3: Backend Container Reports `unhealthy`
**Symptoms:**
`docker compose ps` displays status `(unhealthy)` for `toyxonahub_backend`.

**Diagnosis & Resolution:**
1. Inspect backend container logs to find the exact startup error:
   ```bash
   docker compose logs backend --tail 100
   ```
2. Common causes:
   - **Database not ready**: Prisma migration deploy failed. Ensure `postgres` is healthy:
     ```bash
     docker compose exec postgres pg_isready -U toyxona_user -d toyxonahub
     ```
   - **Missing environment variables**: Verify `.env` matches `.env.example`.
3. Restart the backend service cleanly:
   ```bash
   docker compose restart backend
   ```

---

### Issue 4: MinIO Images Not Loading in Browser
**Symptoms:**
Hall cards show fallback placeholder icons or browser network tab shows `net::ERR_CONNECTION_REFUSED` on `http://localhost:9000/...`.

**Diagnosis & Resolution:**
1. Verify MinIO is running:
   ```bash
   docker compose ps minio
   ```
2. Ensure the bucket initialization container completed successfully:
   ```bash
   docker compose logs minio-init
   ```
3. If the bucket was not created, re-run initialization:
   ```bash
   docker compose up minio-init
   ```
4. Verify `S3_PUBLIC_URL` in `.env` is set to `http://localhost:9000` (browser-accessible address).

---

### Issue 5: Email Verification OTP Not Received
**Symptoms:**
Owner login or customer verification requests OTP, but no email arrives.

**Diagnosis & Resolution:**
1. Open Mailpit web interface in your browser:
   ```text
   http://localhost:8025
   ```
2. If Mailpit is empty, verify backend container can reach `mailpit:1025`:
   ```bash
   docker compose logs backend | grep -i mail
   ```
3. Ensure `SMTP_HOST=mailpit` and `SMTP_PORT=1025` are set in `.env`.

---

### Issue 6: Stale Frontend Code / Changes Not Showing
**Symptoms:**
Browser shows old UI despite editing React components.

**Resolution:**
1. Because the production frontend image bundles static files via Nginx, rebuild the container:
   ```bash
   docker compose build frontend && docker compose up -d frontend
   ```
2. Perform a hard refresh in the browser (`Cmd+Shift+R` or `Ctrl+F5`) to bypass browser asset caching.

---

### Issue 7: Test Database Synchronization (`toyxonahub_test`)
**Symptoms:**
Backend integration tests fail with `PrismaClientInitializationError: Table does not exist`.

**Resolution:**
Sync the test database schema using Prisma `db push`:
```bash
DATABASE_URL="postgresql://toyxona_user:toyxona_password@localhost:5432/toyxonahub_test?schema=public" npx prisma db push --schema=backend/prisma/schema.prisma
```
