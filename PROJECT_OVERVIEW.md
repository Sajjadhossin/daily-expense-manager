# Daily Expense Manager — Frontend Project Overview

> A mobile-first, local-first personal finance web application for tracking daily income and expenses across multiple cash books.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Features](#-features)
- [Data Models](#-data-models)
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
| **State**          | Zustand 5 (with `persist` middleware)            |
| **Animations**     | Framer Motion 12                                |
| **UI Primitives**  | Radix UI (Dialog, Popover, Tabs, Avatar, Slot)  |
| **Charts**         | Recharts 3                                      |
| **Icons**          | Lucide React                                    |
| **Date Utilities** | date-fns 4                                      |
| **PDF Export**     | jsPDF + jspdf-autotable                         |
| **Command Menu**   | cmdk 1                                          |
| **Data Fetching**  | TanStack React Query 5 (installed, for future)  |
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
│   │   ├── layout.tsx            # Auth layout wrapper
│   │   ├── page.tsx              # Welcome/landing page with email login CTA
│   │   └── login/
│   │       └── email/
│   │           └── page.tsx      # Email + password login form
│   │
│   └── (app)/                    # Authenticated route group (protected)
│       ├── layout.tsx            # App shell: sidebar (desktop), bottom nav (mobile), FAB
│       ├── dashboard/
│       │   └── page.tsx          # Main dashboard — balance, recent transactions, quick links
│       ├── transactions/
│       │   ├── page.tsx          # Transaction list with search/filter
│       │   └── add/
│       │       └── page.tsx      # Add/edit transaction form
│       ├── books/
│       │   └── page.tsx          # Cash book management (create, switch, delete)
│       ├── categories/
│       │   └── page.tsx          # Category CRUD with tabs (income/expense)
│       ├── reports/
│       │   └── page.tsx          # Tabular report with category filter + date range + PDF export
│       ├── summary/
│       │   └── page.tsx          # Visual analytics — pie charts, bar charts, breakdowns
│       ├── settings/
│       │   └── page.tsx          # App settings (theme, currency display, preferences)
│       └── profile/
│           └── page.tsx          # User profile — edit name, email, view avatar
│
├── components/
│   ├── auth/
│   │   └── auth-guard.tsx        # Client-side auth wrapper (redirects unauthenticated users)
│   ├── summary/
│   │   ├── CategoryBreakdown.tsx # Pie/donut chart for category-level spending
│   │   ├── DateFilter.tsx        # Date range picker (presets + custom range)
│   │   └── SummaryCards.tsx      # Income/Expense/Net summary stat cards
│   └── ui/                      # Reusable design system components
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── bottom-sheet.tsx      # Mobile slide-up modal
│       ├── button.tsx            # Variants: default, outline, ghost, destructive + loading
│       ├── card.tsx
│       ├── confirm-dialog.tsx    # Danger/confirm action dialog
│       ├── date-picker.tsx       # Calendar date picker (react-day-picker)
│       ├── empty-state.tsx       # Illustration + CTA for empty data views
│       ├── error-state.tsx       # Error display component
│       ├── input.tsx             # Text input with icon support
│       ├── loader.tsx            # Skeleton/spinner loader
│       ├── modal.tsx             # Full modal dialog (Radix Dialog)
│       ├── number-input.tsx      # Formatted currency/number input
│       ├── pagination.tsx        # Pagination controls
│       ├── select.tsx            # Searchable select dropdown (cmdk + Radix Popover)
│       ├── skeleton.tsx          # Loading skeleton placeholder
│       ├── tabs.tsx              # Tab navigation (Radix Tabs)
│       └── toast.tsx             # Toast notification hook
│
├── lib/
│   ├── providers.tsx             # Client provider tree (QueryClient, Toast, etc.)
│   ├── utils.ts                  # General utility (cn — clsx + tailwind-merge)
│   ├── store/
│   │   ├── auth.store.ts         # Auth state: user, token, login/logout/updateProfile
│   │   ├── book.store.ts         # Books + Categories state: CRUD, active book, filters
│   │   └── transaction.store.ts  # Transactions state: CRUD, date range queries, balance sync
│   └── utils/
│       ├── date.ts               # Date range presets (today, this week, custom, etc.)
│       └── pdf.ts                # PDF report generator (jsPDF + autoTable)
│
├── services/
│   └── mock/
│       ├── auth.mock.ts          # Mock email authentication service
│       └── book.mock.ts          # Default books and category seed data
│
├── types/
│   ├── auth.ts                   # User, AuthResponse interfaces
│   ├── book.ts                   # Book, Category, CategoryType interfaces
│   └── transaction.ts            # Transaction, TransactionType interfaces
│
└── middleware.ts                 # Route protection: redirects based on auth cookie
```

---

## ✨ Features

### 🔐 Authentication
- Email + password login (mock service, no backend needed)
- Cookie-based middleware route protection
- Client-side `AuthGuard` for hydration-safe redirects
- Persistent auth state via `localStorage`

### 📒 Multi-Book Ledger
- Create and manage multiple cash books
- Switch active book — all views filter by active book
- Real-time balance tracking (auto-syncs on add/edit/delete)
- Default book created on first use

### 💰 Transaction Management
- Add income or expense transactions
- Categorize with custom categories
- Date and optional time tracking
- Notes/description support
- Edit and delete transactions with balance auto-correction
- Sorted by most recent first

### 🏷 Category System
- Pre-seeded default categories (Food, Transport, Salary, etc.)
- Create, edit, and delete any category (including defaults)
- Separate tabs for income vs expense categories
- Icon and color theming per category

### 📊 Reports & Analytics
- **Reports Page**: Tabular data view with date range filter + category filter
- **Summary Page**: Visual charts (pie charts, bar graphs) with category breakdowns
- **PDF Export**: Client-side PDF generation with formatted tables, summaries, and branding
- **Date Presets**: Today, Yesterday, This Week, This Month, Last Month, Custom Range

### 👤 Profile
- View and edit user name and email
- Auto-generated avatar initial
- Persistent updates via Zustand store

### ⚙ Settings
- Theme preferences
- Currency display configuration
- Account management

### 🎨 Design System
- Mobile-first responsive design
- Dark mode support (system + manual toggle)
- Custom design tokens (CSS variables for colors, spacing, etc.)
- Smooth page transitions with Framer Motion
- Bottom sheets for mobile, modals for desktop
- Touch-optimized targets (48px minimum)

---

## 📦 Data Models

### User
```typescript
interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  createdAt: string;
}
```

### Book (Cash Book / Ledger)
```typescript
interface Book {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  balance: number;       // Auto-calculated from transactions
  currency: string;      // e.g. "BDT"
  createdAt: string;
  updatedAt: string;
}
```

### Category
```typescript
type CategoryType = 'income' | 'expense';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;          // Lucide icon name
  color: string;         // Tailwind color class
  isSystem: boolean;     // Default category flag
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
  date: string;          // ISO date string
  time?: string;         // e.g. "14:30"
  note?: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## 🗃 State Management

All application state is managed with **Zustand** stores using the `persist` middleware for `localStorage` persistence.

| Store                     | Key Responsibilities                                |
| ------------------------- | --------------------------------------------------- |
| `auth.store.ts`           | User session, login/logout, profile updates         |
| `book.store.ts`           | Books CRUD, active book selection, categories CRUD  |
| `transaction.store.ts`    | Transactions CRUD, date range queries, balance sync |

### Balance Synchronization
When a transaction is added, updated, or deleted, the `transaction.store` automatically reads and updates the corresponding book's `balance` field in `book.store` to keep the ledger balance accurate in real-time.

---

## 🧭 Routing & Navigation

### Route Groups
- `(auth)` — Public routes (login, welcome page). Redirects to `/dashboard` if already authenticated.
- `(app)` — Protected routes. Redirects to `/` (welcome) if not authenticated.

### Navigation UI
| Viewport  | Component          | Details                                              |
| --------- | ------------------ | ---------------------------------------------------- |
| Mobile    | Bottom Tab Bar     | 5 tabs: Home, Transactions, Add (FAB), Reports, Settings |
| Desktop   | Sidebar            | Full menu: Dashboard, Transactions, Books, Categories, Reports, Summary, Settings, Profile |

### Middleware
`middleware.ts` handles server-side route protection by checking for a `dem-token` cookie:
- Authenticated users visiting public paths → redirect to `/dashboard`
- Unauthenticated users visiting protected paths → redirect to `/`

---

## 🔑 Authentication

The app uses a **mock authentication system** designed for local-first development:

1. User submits email + password on `/login/email`
2. `auth.mock.ts` validates credentials (any email + password ≥ 6 chars)
3. On success: stores `User` + `token` in Zustand (persisted to `localStorage`) and sets a `dem-token` cookie for middleware
4. `AuthGuard` component wraps all `(app)` routes for client-side protection

> **Note**: Ready to be replaced with real API calls using TanStack React Query when a backend is connected.

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
- `generateReportPdf(options)` — Generates and downloads a formatted A4 PDF report with:
  - Header with book name, date range, and optional category filter
  - Income/Expense/Net summary block
  - Full transaction table with color-coded amounts

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v22+ (required for modern JS features)
- **npm** or **yarn**

### Installation
```bash
# Clone the repository
git clone https://github.com/Sajjadhossin/daily-expense-manager.git
cd daily-expense-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Demo Login
- **Email**: Any valid email (e.g. `demo@example.com`)
- **Password**: Any string with 6+ characters

---

## 📜 Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start development server           |
| `npm run build`   | Build production bundle            |
| `npm run start`   | Serve production build             |
| `npm run lint`    | Run ESLint                         |

---

## 🗺 Future Roadmap

- [ ] **Backend Integration** — Replace mock services with real API (TanStack Query is already installed)
- [ ] **PWA Support** — Service workers for true offline-first capability
- [ ] **Recurring Transactions** — Automated scheduled income/expenses
- [ ] **Multi-Currency** — Support for different currencies with exchange rates
- [ ] **Data Export/Import** — CSV/Excel export and backup/restore
- [ ] **Budget Goals** — Set spending limits per category with progress tracking
- [ ] **Cloud Sync** — Optional sync across devices

---

<p align="center">
  Built with ❤️ using Next.js, React, TailwindCSS & Zustand
</p>
