# Environment Configuration

## 1. Overview

ToyxonaHub uses environment variables to configure ports, database connections, security keys, storage parameters, and external mail hosts. A canonical template is maintained in [`.env.example`](../.env.example).

> [!CAUTION]
> Never commit actual production secrets, API credentials, or private encryption keys to version control. The `.env` file is excluded in `.gitignore`.

---

## 2. Configuration Variables Matrix

### A. Application & Web Server

| Variable | Service | Purpose | Required | Safe Development Example |
| :--- | :--- | :--- | :---: | :--- |
| `NODE_ENV` | Backend | Runtime mode (`development`, `production`, `test`) | Yes | `production` |
| `PORT` | Backend | Express HTTP server listener port inside container | Yes | `5050` |
| `FRONTEND_PORT` | Frontend | Host port mapped to Nginx web server | Yes | `5173` |
| `FRONTEND_URL` | Backend | Allowed CORS origin (can be `*` or specific host) | Yes | `http://localhost:5173` |

### B. PostgreSQL Relational Database

| Variable | Service | Purpose | Required | Safe Development Example |
| :--- | :--- | :--- | :---: | :--- |
| `POSTGRES_USER` | Postgres | PostgreSQL database master user | Yes | `toyxona_user` |
| `POSTGRES_PASSWORD` | Postgres | PostgreSQL database master password | Yes | `toyxona_password` |
| `POSTGRES_DB` | Postgres | Primary database name | Yes | `toyxonahub` |
| `POSTGRES_PORT` | Postgres | Host port mapped to PostgreSQL container | Yes | `5432` |
| `DATABASE_URL` | Backend | Full Prisma connection string | Yes | `postgresql://toyxona_user:toyxona_password@postgres:5432/toyxonahub?schema=public` |

*Note for local host development:* When running Node outside Docker against the PostgreSQL container on the host, use `localhost:5432` instead of `postgres:5432`.

### C. Redis Cache & Rate Limiting

| Variable | Service | Purpose | Required | Safe Development Example |
| :--- | :--- | :--- | :---: | :--- |
| `REDIS_PORT` | Redis | Host port mapped to Redis container | Yes | `6379` |
| `REDIS_URL` | Backend | Redis connection string for `ioredis` | Yes | `redis://redis:6379` |
| `CACHE_TTL_SECONDS` | Backend | Time-to-live for wedding hall query cache | No | `300` |
| `OTP_EXPIRES_SECONDS` | Backend | Time-to-live for email verification OTP codes | No | `600` |
| `OTP_MAX_ATTEMPTS` | Backend | Max verification attempts before OTP eviction | No | `5` |

### D. MinIO / S3 Object Storage

| Variable | Service | Purpose | Required | Safe Development Example |
| :--- | :--- | :--- | :---: | :--- |
| `S3_PORT` | MinIO | Host port for MinIO S3 REST API | Yes | `9000` |
| `MINIO_CONSOLE_PORT`| MinIO | Host port for MinIO Web Management Console | Yes | `9001` |
| `S3_BUCKET` | MinIO / Backend | Bucket name for hall photos and service assets | Yes | `toyxonahub-images` |
| `S3_REGION` | Backend | AWS S3 region identifier | Yes | `us-east-1` |
| `S3_ACCESS_KEY` | MinIO / Backend | S3 root user access key | Yes | `minioadmin` |
| `S3_SECRET_KEY` | MinIO / Backend | S3 root user secret key | Yes | `minioadmin` |
| `S3_FORCE_PATH_STYLE`| Backend | Forces path-style addressing (`http://endpoint/bucket`) | Yes | `true` |
| `S3_ENDPOINT` | Backend | MinIO endpoint for server-side S3 commands | Yes | `http://minio:9000` |
| `S3_PUBLIC_URL` | Backend | Browser-accessible base URL for public image URLs | Yes | `http://localhost:9000` |

### E. Mailpit / SMTP Mailer

| Variable | Service | Purpose | Required | Safe Development Example |
| :--- | :--- | :--- | :---: | :--- |
| `SMTP_PORT` | Mailpit | Host port for local SMTP server | Yes | `1025` |
| `MAILPIT_WEB_PORT` | Mailpit | Host port for Mailpit email inbox UI | Yes | `8025` |
| `SMTP_HOST` | Backend | SMTP host hostname | Yes | `mailpit` |
| `SMTP_SECURE` | Backend | TLS connection flag (`true` or `false`) | Yes | `false` |
| `SMTP_USER` | Backend | SMTP authentication user (empty for Mailpit) | No | `""` |
| `SMTP_PASS` | Backend | SMTP authentication password (empty for Mailpit) | No | `""` |
| `EMAIL_FROM` | Backend | From email address for OTP messages | Yes | `noreply@toyxonahub.uz` |

### F. JWT Authentication Secrets

| Variable | Service | Purpose | Required | Safe Development Example |
| :--- | :--- | :--- | :---: | :--- |
| `JWT_ACCESS_SECRET` | Backend | Secret string used to sign access tokens | Yes | `toyxonahub_super_secret_access_jwt_key_2026` |
| `JWT_REFRESH_SECRET`| Backend | Secret string used to sign refresh tokens | Yes | `toyxonahub_super_secret_refresh_jwt_key_2026` |
| `JWT_ACCESS_EXPIRES_IN`| Backend | Lifetime of access tokens | Yes | `15m` |
| `JWT_REFRESH_EXPIRES_IN`| Backend | Lifetime of refresh tokens | Yes | `7d` |

### G. Upload Configuration

| Variable | Service | Purpose | Required | Safe Development Example |
| :--- | :--- | :--- | :---: | :--- |
| `UPLOAD_DIR` | Backend | Fallback disk path for uploaded assets | No | `./uploads` |
| `MAX_FILE_SIZE_MB` | Backend | Maximum permissible file size per image | Yes | `5` |
