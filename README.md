# Shipyard

A deployment platform that builds and serves static sites from GitHub repositories. Push a repo URL, Shipyard clones it, runs the build inside a sandboxed Docker container, uploads the output to S3, and serves it on a unique subdomain.

## Demo

https://github.com/user-attachments/assets/5b20001c-f6ad-4d80-a62c-4e4a69d7a80a

## Architecture

```
┌──────────┐   (1) HTTP   ┌─────────────┐   (2) enqueue   ┌──────────────────┐
│  Client  │<────────────>│ API Service │────────────────>│  Redis (BullMQ)  │
└──────────┘              └─────────────┘                 └────────┬─────────┘
     ^                                                             │ (3) dequeue
     │                                                             v
     │  (4) real-time logs                              ┌─────────────────────┐
     │<──────────────────────────────────────────────── │   Build Service     │
     │         (Redis pub/sub)                          │  ┌───────────────┐  │
     │                                                  │  │    Docker     │  │
     │                                                  │  └───────────────┘  │
     │                                                  └──────────┬──────────┘
     │                                                             │ (5) upload artifacts
     │                                                             v
     │                                                        ┌────────┐
     │                                                        │   S3   │
     │                                                        └────┬───┘
     │                                                             │ (6) read
     │                                                             v
     │  (7) serve content                             ┌─────────────────────────┐
     └───────────────────────────────────────────────>│ Request Handler Service │
                                                      └─────────────────────────┘
```

- **API Service** — Express REST API handling auth (JWT + cookies) and deployment CRUD. Enqueues build jobs via BullMQ.
- **Build Service** — BullMQ worker that clones the repo, runs the build inside a Docker container with resource limits, and uploads the output to S3 (Supabase Storage).
- **Request Handler Service** — Reverse proxy that resolves a subdomain to a deployment ID and streams the corresponding static assets from S3.
- **Web** — Frontend app for managing deployments, viewing build logs, and accessing live deployment URLs.

## Tech Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Language**: TypeScript (all packages)
- **API**: Express 5, Zod, JWT, bcrypt
- **Queue**: BullMQ (Redis)
- **Database**: PostgreSQL via Drizzle ORM
- **Storage**: S3-compatible (Supabase Storage)
- **Builds**: Docker (sandboxed containers with resource limits)
- **Frontend**: Next.js, TailwindCSS

## Project Structure

```
apps/
  api-service/             # REST API (auth, deployments)
  build-service/           # BullMQ worker (clone → build → upload)
  request-handler-service/ # Serves deployed sites from S3
  web/                     # Frontend (deployment dashboard, logs, visit deployment)
docker/
  build-runner/            # Dockerfile for the sandboxed build container
packages/
  db/                      # Drizzle schema, migrations, client
  types/                   # Shared TypeScript types
  eslint-config/           # Shared ESLint config
  typescript-config/       # Shared tsconfig bases
```

## Key Features

- **Unique Deployment URLs** — Each deployment is served at `{deploymentId}.localhost:{PORT}` in dev. The frontend exposes a **Visit Deployment** button when the build is successful.

- **Real-Time Logs Streaming** — Build logs are streamed to the frontend via a WebSocket-like API. Logs container scrolls automatically, even if logs arrive in batches with delays.

- **Error Handling & Notifications** — Toast notifications (via Sonner) are used for success, info, warning, and error messages. Improved readability for all themes.

- **Sandboxed Builds** — Docker containers run builds with strict resource limits to avoid server overload.

- **Static Site Serving** — Request Handler streams static assets directly from S3. Handles projects with custom base paths automatically.

## Prerequisites

- Node.js ≥ 18
- pnpm 9
- Docker
- PostgreSQL
- Redis
- S3-compatible storage (e.g. Supabase Storage)

## Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Configure environment variables

Each service has its own `.env` file. Copy the examples and fill in the values:

**`apps/api-service/.env`**

```
PORT=8000
NODE_ENV=development
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
JWT_SECRET=<your-jwt-secret>
INTERNAL_SECRET=<your-internal-secret>
DATABASE_URL=<your-postgres-url>
```

**`apps/build-service/.env`**

```
REDIS_URL=redis://localhost:6379
API_URL=http://localhost:8000
INTERNAL_SECRET=<your-internal-secret>
SUPABASE_S3_REGION=<region>
SUPABASE_S3_ENDPOINT=<endpoint>
SUPABASE_S3_ACCESS_KEY_ID=<access-key>
SUPABASE_S3_SECRET_ACCESS_KEY=<secret-key>
```

**`apps/request-handler-service/.env`**

```
PORT=8001
SUPABASE_S3_REGION=<region>
SUPABASE_S3_ENDPOINT=<endpoint>
SUPABASE_S3_ACCESS_KEY_ID=<access-key>
SUPABASE_S3_SECRET_ACCESS_KEY=<secret-key>
```

### 3. Build the Docker build-runner image

```sh
docker build -t shipyard-build-runner:1.0 docker/build-runner
```

### 4. Run database migrations

```sh
pnpm db:generate
pnpm db:migrate
```

### 5. Start development

```sh
pnpm dev
```

Or run a specific service:

```sh
pnpm dev --filter=@shipyard/api-service
```

## Scripts

| Command            | Description                     |
| ------------------ | ------------------------------- |
| `pnpm dev`         | Start all services in dev mode  |
| `pnpm build`       | Build all packages and services |
| `pnpm start`       | Start all built services        |
| `pnpm lint`        | Lint all packages               |
| `pnpm check-types` | Type-check all packages         |
| `pnpm db:generate` | Generate Drizzle migrations     |
| `pnpm db:migrate`  | Run Drizzle migrations          |
| `pnpm format`      | Format code with Prettier       |
