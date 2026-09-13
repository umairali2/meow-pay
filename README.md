# MeowPay — Ship a Slice

A real, end-to-end "send treats" fintech slice built with Next.js, Node.js/Express, and SQLite.

MeowPay is a fictional digital wallet for cats. One cat can transfer treats (the currency) to another cat through a web UI, with a real backend that persists data, enforces business rules, and records every transaction.

## What I Built

This project ships a single vertical slice: the **transfer flow**.

- **Frontend (Next.js + TypeScript + Tailwind CSS):**
  - View all cat accounts and their treat balances
  - Select sender, receiver, and amount
  - Validate a transfer before executing it
  - Execute the transfer and view a receipt with confirmation code
  - See transaction history in real time

- **Backend (Node.js + Express + SQLite3):**
  - REST API with real persistence
  - Atomic transfer operation (deduct sender, credit receiver, record transaction)
  - Input validation and business rule enforcement
  - Transaction history with filtering and statistics
  - Rate limiting, health checks, and API documentation

- **Database (SQLite):**
  - `cats` table with balances
  - `transactions` table with sender/receiver/amount/status
  - Atomic transfers, indexes, migration system, and seed data

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5, SQLite3, CORS, dotenv |
| Database | SQLite (local file) |
| Testing | Manual and integration test scripts |
| Deployment | GitHub public repo, runs locally |

## Project Structure

```
meow-pay/
├── backend/                 # Node.js/Express API
│   ├── server.js            # Main server
│   ├── database.js          # DB connection and init
│   ├── init-db.js           # Seed script
│   ├── db-utils.js          # DB operations and atomic transfer
│   ├── routes/              # API routes
│   ├── middleware/          # Validation and rate limiting
│   ├── migrations/          # Schema migrations
│   ├── test-api.js          # API smoke tests
│   ├── test-integration.js  # Integration tests
│   ├── manual-tests.js      # End-to-end transfer tests
│   ├── TESTING.md           # Testing guide
│   └── README.md            # Backend docs
├── frontend/                # Next.js app
│   ├── src/app/             # Pages and layout
│   ├── src/components/      # UI components
│   ├── src/lib/api.ts       # API utilities
│   ├── src/types/api.ts     # TypeScript types
│   └── src/contexts/        # Global refresh context
└── README.md                # This file
```

## Prerequisites

- Node.js (v18 or higher)
- npm
- Git

## How to Run from a Clean Clone

### 1. Clone the repository

```bash
git clone https://github.com/umairali2/meow-pay.git
cd meow-pay
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Initialize the database

```bash
npm run init-db
```

This creates `backend/meowpay.db` and seeds it with 6 cats.

### 4. Start the backend

```bash
npm run dev
```

The backend will start on `http://localhost:3001`.

### 5. Install frontend dependencies

In a new terminal:

```bash
cd meow-pay/frontend
npm install
```

### 6. Configure the frontend

```bash
cp .env.example .env.local
```

The default `NEXT_PUBLIC_API_URL=http://localhost:3001` is already correct for local development.

### 7. Start the frontend

```bash
npm run dev
```

The frontend will start on `http://localhost:3000` (or `http://localhost:3002` if 3000 is in use).

### 8. Open the app

Open your browser and go to `http://localhost:3000` (or whichever port Next.js reports).

You should see:
- 6 cat accounts with balances
- Recent transactions (initially empty)
- A transfer form

## How to Use the App

1. **View cats:** The left panel shows all cat accounts and their treat balances.
2. **Transfer treats:** In the "Send Treats" form:
   - Select a sender
   - Select a different receiver
   - Enter an amount
   - Click **Validate Transfer** to preview balance changes
   - Click **Send Treats** to execute
3. **View receipt:** After a successful transfer, a receipt appears with a confirmation code.
4. **View history:** The right panel shows the latest transactions and updates automatically.

## API Endpoints

```
GET  /health              # Health check
GET  /api/info            # API overview
GET  /api/cats            # List all cats
GET  /api/cats/:id        # Get one cat
POST /api/cats            # Create a cat
GET  /api/transactions    # List transactions
GET  /api/transactions/statistics
GET  /api/transactions/cat/:catId
GET  /api/transactions/:id
POST /api/transfer        # Execute a transfer
POST /api/transfer/validate
```

Full backend API documentation is in `backend/API_DOCUMENTATION.md`.

## Testing

### Backend smoke tests

```bash
cd backend
npm test
```

### Integration tests

```bash
npm run test:integration
```

### Manual end-to-end transfer tests

```bash
npm run test:manual
```

See `backend/TESTING.md` for more details.

## Decisions and Trade-Offs

### 1. SQLite for the database
- **Why:** SQLite requires zero setup, is file-based, and is perfect for a small take-home slice. It lets the app run from a clean clone without installing a database server.
- **Trade-off:** SQLite is not ideal for high concurrency or horizontal scaling. In production, I would switch to PostgreSQL.

### 2. Monorepo with separate frontend/backend folders
- **Why:** Keeps the frontend and backend independent. They can be started and deployed separately.
- **Trade-off:** Slightly more setup than a single-folder project, but cleaner architecture.

### 3. Atomic transfer in a single DB transaction
- **Why:** Ensures data integrity. If deducting from the sender or crediting the receiver fails, the whole operation is rolled back. No partial transfers.
- **Trade-off:** More complex error handling, but essential for correctness.

### 4. Rate limiting
- **Why:** Prevents abuse and duplicate transfer submissions. The transfer endpoint is limited to 10 requests per minute per IP.
- **Trade-off:** Can block rapid legitimate testing, so `SKIP_RATE_LIMIT=true` can be set for manual test runs.

### 5. Validation-only endpoint (`POST /api/transfer/validate`)
- **Why:** Lets the user preview balance changes and confirm feasibility before executing. This is common in real payment flows.
- **Trade-off:** Two API calls instead of one, but improves UX.

### 6. Transfer receipts with confirmation codes
- **Why:** Provides users with a reference they can use for support or verification, similar to real payment confirmations.
- **Trade-off:** Slightly more data returned in the response.

## What I Skipped and Why

The assignment asked for a **thin slice**, so I intentionally focused on the core transfer flow and avoided scope creep:

- **Authentication/authorization:** Not required for a single-user demo slice. Added to the "what I would improve" list.
- **User accounts for humans:** Out of scope. The app works directly with cat accounts.
- **Real-time WebSocket updates:** Polling and a global refresh context are sufficient for this slice.
- **Deployment/Vercel/Render config:** The app runs locally. Deployment would be a next step.
- **Comprehensive test suite with Jest/Vitest:** I used simple Node.js test scripts to keep the setup minimal and fast.

## What I Would Improve With More Time

1. **Add authentication:** JWT or session-based auth for users/humans.
2. **Switch to PostgreSQL:** For production concurrency and reliability.
3. **Add WebSocket/Socket.io:** Real-time balance and transaction updates.
4. **Add unit tests:** Jest/Vitest for components and API handlers.
5. **Deploy the app:** Vercel for frontend, Render/Railway/ECS for backend.
6. **Add optimistic UI updates:** Update balances immediately on the frontend before the API confirms.
7. **Add more robust duplicate prevention:** Use idempotency keys instead of time-window checks.
8. **Add input masks and better form validation:** Improve the transfer form UX.

## How I Used AI

I built this project using the Devin coding agent. I used AI to:
- Plan the architecture and task breakdown
- Scaffold the Next.js and Express projects
- Implement the database schema and seed data
- Build the API endpoints and validation
- Create the frontend components and state management
- Write tests and documentation
- Debug CORS and JSX syntax issues

I reviewed every change, made architectural decisions, and directed the implementation to keep it aligned with the assignment's goal: a small, correct, well-reasoned slice.

## License

ISC
