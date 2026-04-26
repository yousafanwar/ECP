# ECP Monorepo

ECP is split into two services:

- `backend_service` - NestJS API (auth, products, cart, orders, payment flows).
- `frontend_service` - Next.js storefront UI that consumes the backend API.

## Tech Stack

- Backend: NestJS, TypeScript, PostgreSQL (`pg`)
- Frontend: Next.js (App Router), React, TypeScript, Tailwind CSS

## Project Structure

```text
ECP/
|- backend_service/
|- frontend_service/
|- test_refresh_tokens.ps1
`- test_refresh_tokens.sh
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL database (or a hosted PostgreSQL connection string)

## 1) Backend Setup (`backend_service`)

From the `backend_service` directory:

```bash
npm install
```

Create `backend_service/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000

DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
DB_NAME=<database_name>
DB_USER=<database_user>
DB_PASSWORD=<database_password>
DB_PORT=5432

JWT_SECRET=<strong-random-secret>
NODE_ENV=dev
```

Run backend in development:

```bash
npm run start:dev
```

Backend default URL: [http://localhost:5000](http://localhost:5000)

## 2) Frontend Setup (`frontend_service`)

From the `frontend_service` directory:

```bash
npm install
```

Create `frontend_service/.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<cloud-name>
NEXT_PUBLIC_CLOUDINARY_API_KEY=<api-key>
CLOUDINARY_API_SECRET=<api-secret>
NEXT_PUBLIC_CLOUDINARY_SECURE_DISTRIBUTION=
NEXT_PUBLIC_CLOUDINARY_PRIVATE_CDN=false
```

Run frontend in development:

```bash
npm run dev
```

Frontend default URL: [http://localhost:3000](http://localhost:3000)

## Running Full Stack Locally

Start both services in separate terminals:

Terminal 1:

```bash
cd backend_service
npm run start:dev
```

Terminal 2:

```bash
cd frontend_service
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to use the app.

## Useful Commands

Backend (`backend_service`):

- `npm run start:dev` - run API with watch mode.
- `npm run build` - compile backend.
- `npm run test` - run unit tests.
- `npm run test:e2e` - run e2e tests.

Frontend (`frontend_service`):

- `npm run dev` - run Next.js dev server (Turbopack).
- `npm run build` - production build.
- `npm run start` - run production server.