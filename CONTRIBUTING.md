# Contributing to Daily Expense Manager

## Prerequisites

- **Node.js** v22+
- **npm** v10+
- **Neon** account — [neon.tech](https://neon.tech) (free tier is sufficient)

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/Sajjadhossin/daily-expense-manager.git
cd daily-expense-manager

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local — fill in DATABASE_URL, AUTH_SECRET, AUTH_URL
# Generate AUTH_SECRET with: openssl rand -hex 32

# 4. Run database migrations
npx prisma migrate deploy

# 5. Seed demo data (optional)
npm run seed

# 6. Start the development server
npm run dev
```

App runs at `http://localhost:3000`.

## Project Structure

```
src/
  app/
    (auth)/         # Public routes: login, welcome
    (app)/          # Protected routes: dashboard, transactions, books, etc.
    api/            # API route handlers (NextAuth, books, transactions, etc.)
  components/
    ui/             # Reusable design-system components
    auth/           # Auth guard
    summary/        # Summary/analytics components
  lib/
    auth.ts         # NextAuth configuration
    db.ts           # Prisma client singleton
    hooks/          # TanStack Query hooks (use-books, use-transactions, etc.)
    store/          # Zustand stores (active book selection)
    utils/          # Date range helpers, PDF generator
  services/
    api/            # Typed API client functions
  types/            # TypeScript interfaces
prisma/
  schema.prisma     # Database schema
  seed.ts           # Demo data seeder
  migrations/       # Migration history
```

## Development Workflow

### Branch Naming

| Type      | Pattern                        | Example                        |
| --------- | ------------------------------ | ------------------------------ |
| Feature   | `dev/feature-<name>`           | `dev/feature-recurring-txns`   |
| Bug fix   | `fix/<short-description>`      | `fix/balance-calculation`      |
| Docs      | `docs/<short-description>`     | `docs/api-reference`           |
| Refactor  | `refactor/<short-description>` | `refactor/query-hooks`         |

Always branch off `dev/backend` (the integration branch) unless targeting a specific phase branch.

### Commit Conventions

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <short summary>

Types: feat | fix | docs | refactor | test | chore | style
```

Examples:
- `feat: add recurring transaction support`
- `fix: correct balance on transaction delete`
- `docs: update API route reference`
- `chore: upgrade prisma to 7.x`

## Available Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start development server (port 3000) |
| `npm run build` | Production build                     |
| `npm run start` | Serve production build               |
| `npm run lint`  | Run ESLint                           |
| `npm run seed`  | Seed database with demo data         |

## Tech Stack Summary

| Layer          | Technology                                   |
| -------------- | -------------------------------------------- |
| Framework      | Next.js 16 (App Router)                      |
| Language       | TypeScript 5+                                |
| Database       | Neon PostgreSQL (serverless)                 |
| ORM            | Prisma 7                                     |
| Auth           | NextAuth v5 (credentials + Google OAuth)     |
| UI             | React 19, TailwindCSS v4, Radix UI           |
| Server state   | TanStack React Query 5                       |
| Client state   | Zustand 5 (active book selection only)       |
| Charts         | Recharts 3                                   |
| PDF Export     | jsPDF + jspdf-autotable                      |
