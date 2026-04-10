# Daily Expense Manager — Full-Stack Project Overview

> A mobile-first personal finance PWA for tracking daily income and expenses across multiple cash books, backed by a real PostgreSQL database and Google OAuth authentication.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Data Models](#data-models)
- [API Routes](#api-routes)
- [State Management](#state-management)
- [Routing & Navigation](#routing--navigation)
- [Authentication](#authentication)
- [UI Component Library](#ui-component-library)
- [Utilities](#utilities)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Future Roadmap](#future-roadmap)

---

## Tech Stack

| Layer              | Technology                                      |
| ------------------ | ----------------------------------------------- |
| **Framework**      | Next.js 16 (App Router, Turbopack)              |
| **Language**       | TypeScript 5+                                   |
| **UI Library**     | React 19                                        |
| **Styling**        | TailwindCSS v4 (CSS-first config)               |
| **Database**       | Neon PostgreSQL (serverless)                     |
| **ORM**            | Prisma 7                                        |
| **Auth**           | NextAuth v5 (Google OAuth)                      |
| **Server State**   | TanStack React Query 5                          |
| **Client State**   | Zustand 5 (active book selection)               |
| **Animations**     | Framer Motion 12                                |
| **UI Primitives**  | Radix UI (Dialog, Popover, Tabs, Avatar, Slot)  |
| **Charts**         | Recharts 3                                      |
| **Icons**          | Lucide React, react-icons                       |
| **Date Utilities** | date-fns 4                                      |
| **PDF Export**     | jsPDF + jspdf-autotable                         |
| **Command Menu**   | cmdk 1                                          |
| **Toasts**         | react-hot-toast 2                               |
| **Fonts**          | Inter (Google Fonts via `next/font`)             |
| **PWA**            | Web App Manifest + Service Worker               |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                # Root layout (html/body, Providers, PWA manifest, SW registration)
│   ├── globals.css               # Global styles, TailwindCSS v4, design tokens
│   │
│   ├── (auth)/                   # Auth route group (public, unauthenticated)
│   │   ├── layout.tsx
│   │   └── page.tsx              # Welcome page — Google OAuth login
│   │
│   ├── (legal)/                  # Legal pages (public)
│   │   ├── layout.tsx            # Shared legal layout with back navigation
│   │   ├── terms/page.tsx        # Terms of Service
│   │   └── privacy/page.tsx      # Privacy Policy
│   │
│   ├── (app)/                    # Authenticated route group (protected)
│   │   ├── layout.tsx            # App shell: sidebar (desktop), bottom nav (mobile)
│   │   ├── dashboard/page.tsx
│   │   ├── transactions/
│   │   │   ├── page.tsx          # Transaction list with book selector
│   │   │   └── add/page.tsx      # Add/edit transaction with book selector
│   │   ├── books/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── summary/page.tsx
│   │   ├── settings/page.tsx     # Settings hub (theme, quick access, about link)
│   │   ├── profile/page.tsx      # Profile with account deletion (danger zone)
│   │   └── about/page.tsx        # Credits, developer info, tech stack
│   │
│   └── api/                      # Next.js API route handlers
│       ├── auth/
│       │   └── [...nextauth]/    # NextAuth handler (GET + POST)
│       ├── books/
│       │   ├── route.ts          # GET (list), POST (create)
│       │   └── [id]/route.ts     # GET, PATCH, DELETE by ID
│       ├── categories/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       ├── transactions/
│       │   ├── route.ts
│       │   └── [id]/route.ts
│       └── profile/route.ts      # GET, PATCH, DELETE user profile & account
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
│   ├── auth.ts                   # NextAuth configuration (Google OAuth, callbacks, session)
│   ├── db.ts                     # Prisma client singleton (Neon adapter, IPv4 WebSocket)
│   ├── providers.tsx             # Client provider tree (Session, QueryClient, Theme, Toast)
│   ├── utils.ts                  # cn — clsx + tailwind-merge
│   ├── hooks/                    # TanStack Query hooks
│   │   ├── use-books.ts
│   │   ├── use-categories.ts
│   │   ├── use-transactions.ts
│   │   └── use-profile.ts       # Includes useDeleteAccount hook
│   ├── store/
│   │   └── book.store.ts         # Active book ID (Zustand, persisted to localStorage)
│   └── utils/
│       ├── date.ts               # Date range presets
│       └── pdf.ts                # PDF report generator
│
├── services/
│   └── api/                      # Typed fetch wrappers for each resource
│       ├── books.ts
│       ├── categories.ts
│       ├── transactions.ts
│       ├── profile.ts            # Includes account deletion
│       └── client.ts             # Base fetch client (GET, POST, PATCH, DELETE)
│
├── types/                        # TypeScript interfaces
│   ├── auth.ts
│   ├── book.ts
│   └── transaction.ts
│
├── generated/
│   └── client/                   # Prisma-generated client types
│
└── middleware.ts                  # Route protection via NextAuth session cookie

public/
├── manifest.json                 # PWA web app manifest
├── sw.js                         # Service worker (network-first caching)
├── developer.jpg                 # Developer profile image
└── icons/                        # PWA icons (72px–512px, maskable, apple-touch)

prisma/
├── schema.prisma                 # Database schema (User, Account, Book, Category, Transaction)
└── migrations/                   # Migration history
```

---

## Features

### Authentication
- Google OAuth sign-in (single click)
- NextAuth v5 JWT session with middleware route protection
- Client-side `AuthGuard` for hydration-safe redirects
- Auto-creation of default categories and "Personal Wallet" book on first login

### Multi-Book Ledger
- Create and manage multiple cash books
- **Inline book selector** on transactions page and add transaction form
- Real-time balance tracking (calculated from transactions)
- Default book created on first login

### Transaction Management
- Add income or expense transactions
- Categorize with custom categories
- Date and time tracking
- Notes/description support
- Edit and delete transactions with confirmation
- Search/filter transactions by notes, categories, or amount
- Calculator component for quick amount entry

### Category System
- Pre-seeded default categories (Food, Transport, Salary, etc.)
- Create, edit, and delete custom categories
- Separate tabs for income vs expense categories
- Icon and color theming per category

### Reports & Analytics
- **Reports Page**: Tabular data with date range + category filters
- **Summary Page**: Pie charts and bar graphs with category breakdowns
- **PDF Export**: Client-side PDF generation with formatted tables and summaries
- **Date Presets**: Today, Yesterday, This Week, This Month, Last Month, Custom Range

### Profile & Account
- View and edit user name
- **Google profile picture** displayed (with initial letter fallback)
- **Account deletion** with confirmation (type "DELETE" to confirm)
- Cascading deletion of all user data (books, transactions, categories)

### Settings
- Dark mode toggle
- **Quick access links** to Books, Categories, Summary (mobile)
- Tappable profile card linking to profile page
- About & Credits link
- Logout with confirmation dialog

### Legal Pages
- Terms of Service (`/terms`)
- Privacy Policy (`/privacy`)
- Branded design with gradient hero, card-based sections, and animations

### About & Credits
- App info and version
- Developer profile with photo, role, portfolio, GitHub, and email links
- Tech stack display
- Branded gradient hero design

### PWA (Progressive Web App)
- **Installable** on mobile and desktop (home screen / taskbar)
- Web App Manifest with multiple icon sizes and maskable icons
- Service worker with network-first caching strategy
- Standalone display (no browser bar)
- Portrait orientation optimized

### Design System
- Mobile-first responsive design
- Dark mode support with CSS custom properties
- Brand colors: Emerald/Teal gradient primary
- Smooth page transitions with Framer Motion
- Bottom sheets for mobile, modals for desktop
- Glass morphism effects, touch-friendly targets (44px minimum)

---

## Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  image?: string;        // Google profile picture
  avatarUrl?: string;
  hashedPassword?: string;
  createdAt: Date;
  updatedAt: Date;
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
  balance: number;
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
  type: TransactionType;
  amount: number;
  date: Date;
  time?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Routes

| Method | Route                         | Description                        |
| ------ | ----------------------------- | ---------------------------------- |
| GET    | `/api/auth/[...nextauth]`     | NextAuth session handler           |
| POST   | `/api/auth/[...nextauth]`     | Sign in / sign out                 |
| GET    | `/api/books`                  | List authenticated user's books    |
| POST   | `/api/books`                  | Create a new book                  |
| GET    | `/api/books/:id`              | Get a single book                  |
| PATCH  | `/api/books/:id`              | Update a book                      |
| DELETE | `/api/books/:id`              | Delete a book                      |
| GET    | `/api/categories`             | List categories for user           |
| POST   | `/api/categories`             | Create a category                  |
| PATCH  | `/api/categories/:id`         | Update a category                  |
| DELETE | `/api/categories/:id`         | Delete a category                  |
| GET    | `/api/transactions`           | List transactions (filterable)     |
| POST   | `/api/transactions`           | Create a transaction               |
| PATCH  | `/api/transactions/:id`       | Update a transaction               |
| DELETE | `/api/transactions/:id`       | Delete a transaction               |
| GET    | `/api/profile`                | Get current user profile           |
| PATCH  | `/api/profile`                | Update user name/email             |
| DELETE | `/api/profile`                | Delete account and all user data   |

---

## State Management

Server state is managed by **TanStack React Query** through typed hooks in `lib/hooks/`. Local UI state is handled by a minimal **Zustand** store.

| Layer          | Tool                  | Scope                                        |
| -------------- | --------------------- | -------------------------------------------- |
| Server state   | TanStack React Query  | All API data: books, transactions, categories, profile |
| Active book    | Zustand (`book.store`)| Which book is currently selected (persisted to `localStorage`) |

### Query Hooks

| Hook                    | Responsibilities                                       |
| ----------------------- | ------------------------------------------------------ |
| `use-books.ts`          | Fetch/create/update/delete books, invalidate on mutation |
| `use-categories.ts`     | Fetch/mutate categories per user                       |
| `use-transactions.ts`   | Fetch/mutate transactions with date + category filters |
| `use-profile.ts`        | Fetch/update profile, delete account (signs out on success) |

---

## Routing & Navigation

### Route Groups
- `(auth)` — Public routes (Google OAuth login). Redirects to `/dashboard` if session exists.
- `(legal)` — Public routes (Terms of Service, Privacy Policy). Accessible without login.
- `(app)` — Protected routes. Redirects to `/` if no session.

### Navigation UI
| Viewport  | Component      | Details                                                        |
| --------- | -------------- | -------------------------------------------------------------- |
| Mobile    | Bottom Tab Bar | 5 tabs: Home, Transactions, Add (FAB), Reports, Settings       |
| Mobile    | Settings Page  | Quick access to Books, Categories, Summary, Profile, About     |
| Desktop   | Sidebar        | Dashboard, Transactions, Books, Categories, Reports, Summary, Settings, Profile |

### Middleware
`middleware.ts` uses the NextAuth session cookie to protect routes server-side:
- Authenticated users on auth paths → redirect to `/dashboard`
- Unauthenticated users on protected paths → redirect to `/`
- Static PWA files (`manifest.json`, `sw.js`, `icons/`) are excluded from middleware

---

## Authentication

The app uses **NextAuth v5** with **Google OAuth** as the sole authentication provider.

Flow:
1. User clicks "Continue with Google" on the welcome page
2. Google OAuth flow handles authentication
3. On first login: default categories and "Personal Wallet" book are auto-created
4. JWT session cookie is set, user redirected to `/dashboard`
5. `AuthGuard` wraps all `(app)` routes for client-side protection
6. Profile images from Google are displayed throughout the app

---

## UI Component Library

All reusable components live in `src/components/ui/`. Built with:
- **Radix UI** primitives for accessibility (Dialog, Popover, Tabs)
- **CVA** (class-variance-authority) for variant-based styling
- **tailwind-merge** + **clsx** for class name composition

| Component          | Purpose                                        |
| ------------------ | ---------------------------------------------- |
| `Button`           | Primary CTA with variants, sizes, loading state|
| `Input`            | Text input with optional leading icon          |
| `NumberInput`      | Currency-formatted number input (scroll-safe)  |
| `Calculator`       | Inline calculator for amount entry             |
| `Select`           | Searchable dropdown (cmdk + Radix Popover)     |
| `DatePicker`       | Calendar picker (react-day-picker)             |
| `Card`             | Content container with border/shadow           |
| `Badge`            | Status/label pill                              |
| `Modal`            | Full-screen dialog (Radix Dialog)              |
| `BottomSheet`      | Mobile slide-up panel (Framer Motion)          |
| `ConfirmDialog`    | Destructive action confirmation                |
| `Tabs`             | Tab navigation (Radix Tabs)                    |
| `EmptyState`       | Icon + action for empty views                  |
| `Loader`           | Loading spinner/skeleton                       |
| `Pagination`       | Page navigation controls                       |
| `Toast`            | Notification hook (react-hot-toast)            |

---

## Utilities

### `lib/utils.ts`
- `cn(...inputs)` — Merges class names using `clsx` + `tailwind-merge`

### `lib/utils/date.ts`
- `getDateRange(type, customStart?, customEnd?)` — Returns `{ startDate, endDate, label }` for presets like `today`, `this_week`, `this_month`, `last_month`, or `custom`

### `lib/utils/pdf.ts`
- `generateReportPdf(options)` — Generates and downloads a formatted A4 PDF report with header, income/expense summary, and full transaction table

---

## Getting Started

### Prerequisites
- **Node.js** v22+
- **npm** v10+
- **Neon** account — [neon.tech](https://neon.tech)
- **Google Cloud** project with OAuth credentials

### Installation
```bash
# Clone the repository
git clone https://github.com/Sajjadhossin/daily-expense-manager.git
cd daily-expense-manager

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in:
#   DATABASE_URL     — Neon PostgreSQL connection string
#   AUTH_SECRET      — Generate with: openssl rand -hex 32
#   AUTH_URL         — http://localhost:3000
#   GOOGLE_CLIENT_ID — From Google Cloud Console
#   GOOGLE_CLIENT_SECRET — From Google Cloud Console

# Run database migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

To test on mobile (same Wi-Fi):
```bash
npm run dev -- -H 0.0.0.0
# Open http://<your-local-ip>:3000 on your phone
```

---

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start development server           |
| `npm run build`   | Build production bundle            |
| `npm run start`   | Serve production build             |
| `npm run lint`    | Run ESLint                         |

---

## Future Roadmap

- [x] **PWA Support** — Service worker, manifest, installable on mobile & desktop
- [x] **Google OAuth** — Single-click authentication
- [x] **Account Deletion** — Full data wipe with confirmation
- [x] **Legal Pages** — Terms of Service & Privacy Policy
- [x] **About & Credits** — Developer info and tech stack
- [ ] **Recurring Transactions** — Automated scheduled income/expenses
- [ ] **Multi-Currency** — Support for different currencies with exchange rates
- [ ] **Data Export/Import** — CSV/Excel export and backup/restore
- [ ] **Budget Goals** — Set spending limits per category with progress tracking
- [ ] **Notifications** — Bill reminders and spending alerts

---

<p align="center">
  Built with care by <a href="https://sajjadhossin.github.io/">Sajjad Hossin</a>
</p>
