# Development Workflow & Guidelines

## 1. Prerequisites

Before starting local development on ToyxonaHub, ensure the following tools are installed:

- **Docker & Docker Compose**: Docker Desktop 4.x+
- **Node.js**: v20.x or v22.x LTS
- **npm**: v10.x+
- **Git**: v2.40+

---

## 2. Initial Setup (Step-by-Step)

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd ToyxonaHub
```

### Step 2: Configure Environment
Copy the environment template:
```bash
cp .env.example .env
```

### Step 3: Build & Start All Services
```bash
docker compose up -d --build
```
This automatically boots:
- PostgreSQL 16 on `:5432`
- Redis 7 on `:6379`
- MinIO Object Storage on `:9000` (Console on `:9001`)
- Mailpit on `:1025` (Web UI on `:8025`)
- Backend API on `:5050`
- Frontend Web on `:5173`

### Step 4: Seed Database with Demo Records
```bash
docker compose exec backend npm run prisma:seed
```

---

## 3. Daily Development Loop

```text
Edit Source Code
      ↓
Run Unit / Integration Tests (npm test)
      ↓
Run Code Linter (npm run lint)
      ↓
Rebuild Service Container (docker compose build <service>)
      ↓
Verify in Browser / Run E2E (npx playwright test)
```

### A. Working on Frontend
1. Make changes in `frontend/src/`.
2. Run frontend unit tests to verify logic:
   ```bash
   cd frontend
   npm test
   ```
3. Rebuild and restart the frontend container:
   ```bash
   docker compose build frontend && docker compose up -d frontend
   ```
4. Verify changes in browser at `http://localhost:5173`.

### B. Working on Backend
1. Make changes in `backend/src/`.
2. Run backend integration tests:
   ```bash
   cd backend
   npm test
   ```
3. If database models changed:
   ```bash
   cd backend
   npx prisma migrate dev --name <migration_name>
   ```
4. Rebuild and restart backend container:
   ```bash
   docker compose build backend && docker compose up -d backend
   ```

---

## 4. Code Quality & Linting Standards

Both frontend and backend repositories enforce strict ESLint flat configurations:

### Backend Quality Checks:
```bash
cd backend
npm run lint          # Check ESLint
npm run lint:fix      # Auto-fix linting issues
npm run format:check  # Verify Prettier formatting
npm run format        # Auto-format with Prettier
```

### Frontend Quality Checks:
```bash
cd frontend
npm run lint          # Check ESLint
npm run build         # Test production bundle compilation
```

---

## 5. Testing Checklist Before Commit

Before pushing any feature or fix, verify that the complete test suite passes:

```bash
# 1. Frontend Unit Tests (70 tests)
cd frontend && npm test

# 2. Backend Integration Tests (48 tests)
cd backend && npm test

# 3. Playwright End-to-End Tests (14 scenarios)
cd frontend && npx playwright test
```
