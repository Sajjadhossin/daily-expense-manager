# Daily Expense Manager — Full-Stack Project Overview

> A mobile-first personal finance web application for tracking daily income and expenses across multiple cash books, backed by a real PostgreSQL database and NextAuth authentication.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Data Models](#-data-models)
- [API Routes](#-api-routes)
- [State Management](#-state-management)
- [Routing & Navigation](#-routing--navigation)
- [Authentication](#-authentication)
- [UI Component Library](#-ui-component-library)
- [Utilities](#-utilities)
- [Getting Started](#-getting-started)
- [Scripts](#-scripts)
- [Future Roadmap](#-future-roadmap)

---

## 🛠 Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| **Framework**      | Next.js 16 (App Router)                         |
| **Language**       | TypeScript 5+                                   |
| **UI Library**     | React 19                                        |
| **Styling**        | TailwindCSS v4 (CSS-first config)               |
| **Database**       | Neon PostgreSQL (serverless)                    |
| **ORM**            | Prisma 7                                        |
| **Auth**           | NextAuth v5 (credentials + Google OAuth)        |
| **Password Hash**  | bcryptjs                                        |
| **Server State**   | TanStack React Query 5 (active, all routes)     |
| **Client State**   | Zustand 5 (active book selection only)          |
| **Animations**     | Framer Motion 12                                |
| **UI Primitives**  | Radix UI (Dialog, Popover, Tabs, Avatar, Slot)  |
| **Charts**         | Recharts 3                                      |
| **Icons**          | Lucide React                                    |
| **Date Utilities** | date-fns 4                                      |
| **PDF Export**     | jsPDF + jspdf-autotable                         |
| **Command Menu**   | cmdk 1                                          |
| **Toasts**         | react-hot-toast 2                               |
| **Fonts**          | Inter (Google Fonts via `next/font`)             |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout (html/body, Providers, Inter font, meta)
│   ├── globals.css               # Global styles, TailwindCSS v4, design tokens
│   │
│   ├── (auth)/                   # Auth route group (public, unauthenticated)
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Welcome/landing page
│   │   └── login/email/page.tsx  # Email + password login form
│   │
│   ├── (app)/                    # Authenticated route group (protected)
│   │   ├── layout.tsx            # App shell: sidebar (desktop), bottom nav (mobile)
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx
│   │   │   └── add/page.tsx
│   │   ├── books/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── summary/page.tsx
│   │   ├── settings/page.tsx
│   │   └── profile/page.tsx
│   │
│   └── api/                      # Next.js API route handlers
│       ├── auth/
│       │   ├── [...nextauth]/    # NextAuth handler (GET + POST)
│       │   └── register/         # User registration endpoint
│       ├── books/
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [id]/route.ts     # GET, PATCH, DELETE by ID
│       ├── categories/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── transactions/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── profile/route.ts      # GET + PATCH user profile
│
├── components/
│   ├── auth/auth-guard.tsx        # Client-side auth wrapper
│   ├── summary/
│   │   ├── CategoryBreakdown.tsx
│   │   ├── DateFilter.tsx
│   │   └── SummaryCards.tsx
│   └── ui/                       # Reusable design system components
│
├── lib/
│   ├── auth.ts                   # NextAuth configuration (providers, callbacks, session)
│   ├── db.ts                     # Prisma client singleton
│   ├── providers.tsx             # Client provider tree (QueryClient, Toast, etc.)
│   ├── utils.ts                  # cn — clsx + tailwind-merge
│   ├── hooks/                    # TanStack Query hooks
│   │   ├── use-books.ts
│   │   ├── use-categories.ts
│   │   ├── use-transactions.ts
│   │   └── use-profile.ts
│   ├── store/
│   │   └── book.store.ts         # Active book ID (Zustand, persisted)
│   └── utils/
│       ├── date.ts               # Date range presets
│       └── pdf.ts                # PDF report generator
│
├── services/
│   └── api/                      # Typed fetch wrappers for each resource
│       ├── books.ts
│       ├── categories.ts
│       ├── transactions.ts
│       ├── profile.ts
│       └── client.ts             # Base fetch client
│
├── types/                        # TypeScript interfaces
│   ├── auth.ts
│   ├── book.ts
│   └── transaction.ts
│
├── generated/
│   └── client/                   # Prisma-generated client types
│
└── middleware.ts                 # Route protection via NextAuth session cookie

prisma/
├── schema.prisma                 # Database schema (User, Book, Category, Transaction)
├── seed.ts                       # Demo data seeder
└── migrations/                   # Migration history
```

---

## ✨ Features

### 🔐 Authentication
- Email + password login with bcryptjs hashing
- Google OAuth (optional)
- NextAuth v5 session cookies for middleware route protection
- Client-side `AuthGuard` for hydration-safe redirects
- User registration endpoint (`/api/auth/register`)

### 📒 Multi-Book Ledger
- Create and manage multiple cash books
- Switch active book — all views filter by active book
- Real-time balance tracking (calculated from transactions)
- Default book created on first login

### 💰 Transaction Management
- Add income or expense transactions
- Categorize with custom categories
- Date and optional time tracking
- Notes/description support
- Edit and delete transactions

### 🏷 Category System
- Pre-seeded default categories (Food, Transport, Salary, etc.)
- Create, edit, and delete categories
- Separate tabs for income vs expense categories
- Icon and color theming per category

### 📊 Reports & Analytics
- **Reports Page**: Tabular data with date range + category filters
- **Summary Page**: Pie charts and bar graphs with category breakdowns
- **PDF Export**: Client-side PDF generation with formatted tables and summaries
- **Date Presets**: Today, Yesterday, This Week, This Month, Last Month, Custom Range

### 👤 Profile
- View and edit user name and email
- Auto-generated avatar initial
- Updates persisted to database

### 🎨 Design System
- Mobile-first responsive design
- Dark mode support
- Custom design tokens (CSS variables)
- Smooth page transitions with Framer Motion
- Bottom sheets for mobile, modals for desktop

---

## 📦 Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  createdAt: Date;
}
```

### Book (Cash Book / Ledger)
```typescript
interface Book {
  id: string;
  userId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  currency: string;      // e.g. "BDT"
  createdAt: Date;
  updatedAt: Date;
}
```

### Category
```typescript
type CategoryType = 'income' | 'expense';

interface Category {
  id: string;
  userId: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  isSystem: boolean;
  order: number;
}
```

### Transaction
```typescript
type TransactionType = 'income' | 'expense';

interface Transaction {
  id: string;
  bookId: string;
  categoryId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: Date;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🌐 API Routes

| Method | Route                         | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| POST   | `/api/auth/register`          | Create a new user account          |
| GET    | `/api/auth/[...nextauth]`     | NextAuth session handler           |
| POST   | `/api/auth/[...nextauth]`     | Sign in / sign out                 |
| GET    | `/api/books`                  | List authenticated user's books    |
| POST   | `/api/books`                  | Create a new book                  |
| GET    | `/api/books/:id`              | Get a single book                  |
| PATCH  | `/api/books/:id`              | Update a book                      |
| DELETE | `/api/books/:id`              | Delete a book                      |
| GET    | `/api/categories`             | List categories for active book    |
| POST   | `/api/categories`             | Create a category                  |
| PATCH  | `/api/categories/:id`         | Update a category                  |
| DELETE | `/api/categories/:id`         | Delete a category                  |
| GET    | `/api/transactions`           | List transactions (filterable)     |
| POST   | `/api/transactions`           | Create a transaction               |
| PATCH  | `/api/transactions/:id`       | Update a transaction               |
| DELETE | `/api/transactions/:id`       | Delete a transaction               |
| GET    | `/api/profile`                | Get current user profile           |
| PATCH  | `/api/profile`                | Update user name/email             |

---

## 🗃 State Management

Server state is managed by **TanStack React Query** through typed hooks in `lib/hooks/`. Local UI state is handled by a minimal **Zustand** store.

| Layer          | Tool                  | Scope                                        |
| -------------- | --------------------- | -------------------------------------------- |
| Server state   | TanStack React Query  | All API data: books, transactions, categories, profile |
| Active book    | Zustand (`book.store`)| Which book is currently selected (persisted to `localStorage`) |

### Query Hooks

| Hook                    | Responsibilities                                      |
| ----------------------- | ----------------------------------------------------- |
| `use-books.ts`          | Fetch/create/update/delete books, invalidate on mutation |
| `use-categories.ts`     | Fetch/mutate categories per active book               |
| `use-transactions.ts`   | Fetch/mutate transactions with date + category filters|
| `use-profile.ts`        | Fetch and update user profile                         |

---

## 🧭 Routing & Navigation

### Route Groups
- `(auth)` — Public routes (login, welcome). Redirects to `/dashboard` if session exists.
- `(app)` — Protected routes. Redirects to `/` if no session.

### Navigation UI
| Viewport  | Component      | Details                                                        |
| --------- | -------------- | -------------------------------------------------------------- |
| Mobile    | Bottom Tab Bar | 5 tabs: Home, Transactions, Add (FAB), Reports, Settings       |
| Desktop   | Sidebar        | Dashboard, Transactions, Books, Categories, Reports, Summary, Settings, Profile |

### Middleware
`middleware.ts` uses the NextAuth session cookie to protect routes server-side:
- Authenticated users on public paths → redirect to `/dashboard`
- Unauthenticated users on protected paths → redirect to `/`

---

## 🔑 Authentication

The app uses **NextAuth v5** with two providers:

1. **Credentials** — email + password, hashed with `bcryptjs`, stored in Neon PostgreSQL
2. **Google OAuth** — optional, configured via `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

Flow:
1. User submits credentials on `/login/email`
2. NextAuth verifies password hash via Prisma
3. On success: JWT session cookie set, user redirected to `/dashboard`
4. `AuthGuard` wraps all `(app)` routes for client-side protection

---

## 🧩 UI Component Library

All reusable components live in `src/components/ui/`. Built with:
- **Radix UI** primitives for accessibility (Dialog, Popover, Tabs)
- **CVA** (class-variance-authority) for variant-based styling
- **tailwind-merge** + **clsx** for class name composition

| Component          | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `Button`           | Primary CTA with variants, sizes, loading state|
| `Input`            | Text input with optional leading icon          |
| `NumberInput`      | Currency-formatted number input                |
| `Select`           | Searchable dropdown (cmdk + Radix Popover)     |
| `DatePicker`       | Calendar picker (react-day-picker)             |
| `Card`             | Content container with border/shadow           |
| `Badge`            | Status/label pill                              |
| `Modal`            | Full-screen dialog (Radix Dialog)              |
| `BottomSheet`      | Mobile slide-up panel (Framer Motion)          |
| `ConfirmDialog`    | Destructive action confirmation                |
| `Tabs`             | Tab navigation (Radix Tabs)                    |
| `EmptyState`       | Illustration + action for empty views          |
| `Loader`           | Loading spinner/skeleton                       |
| `Pagination`       | Page navigation controls                       |
| `Toast`            | Notification hook (react-hot-toast)            |

---

## 🔧 Utilities

### `lib/utils.ts`
- `cn(...inputs)` — Merges class names using `clsx` + `tailwind-merge`

### `lib/utils/date.ts`
- `getDateRange(type, customStart?, customEnd?)` — Returns `{ startDate, endDate, label }` for presets like `today`, `this_week`, `this_month`, `last_month`, or `custom`

### `lib/utils/pdf.ts`
- `generateReportPdf(options)` — Generates and downloads a formatted A4 PDF report with header, income/expense summary, and full transaction table

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v22+
- **npm** v10+
- **Neon** account — [neon.tech](https://neon.tech)

### Installation
```bash
# Clone the repository
git clone https://github.com/Sajjadhossin/daily-expense-manager.git
cd daily-expense-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, AUTH_URL
# Generate AUTH_SECRET: openssl rand -hex 32

# Run database migrations
npx prisma migrate deploy

# Seed demo data (optional)
npm run seed

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📜 Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start development server           |
| `npm run build`   | Build production bundle            |
| `npm run start`   | Serve production build             |
| `npm run lint`    | Run ESLint                         |
| `npm run seed`    | Seed database with demo data       |

---

## 🗺 Future Roadmap

- [ ] **PWA Support** — Service workers for true offline-first capability
- [ ] **Recurring Transactions** — Automated scheduled income/expenses
- [ ] **Multi-Currency** — Support for different currencies with exchange rates
- [ ] **Data Export/Import** — CSV/Excel export and backup/restore
- [ ] **Budget Goals** — Set spending limits per category with progress tracking
- [ ] **Cloud Sync** — Optional sync across devices

---

<p align="center">
  Built with ❤️ using Next.js, React, TailwindCSS, Prisma & Neon
</p>
