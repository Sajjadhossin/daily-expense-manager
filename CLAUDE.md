@AGENTS.md

# Daily Expense Manager

A personal expense tracking web app built with Next.js 16, React 19, and TypeScript.

## Tech Stack

- **Framework:** Next.js 16.2.1 (App Router)
- **UI:** TailwindCSS 4, Radix UI, Framer Motion, Lucide icons
- **State:** Zustand (local state), TanStack React Query (server state)
- **Charts:** Recharts
- **PDF:** jspdf + jspdf-autotable
- **Utilities:** date-fns, clsx, tailwind-merge, class-variance-authority

## Project Structure

```
src/
  app/
    (app)/        # Main app routes (dashboard, transactions, books, categories, reports, etc.)
    (auth)/       # Auth routes (login via email/mobile)
  components/
    auth/         # Auth guard
    summary/      # Summary-related components
    ui/           # Reusable UI components (button, card, modal, etc.)
  lib/
    store/        # Zustand stores (auth, book, transaction)
    utils/        # Utility functions (date, pdf)
    providers.tsx # App providers
  services/
    mock/         # Mock data services
  types/          # TypeScript type definitions
  middleware.ts   # Next.js middleware
```

## Commands

```bash
npm run dev     # Start dev server
npm run build   # Production build
npm run lint    # Run ESLint
npm start       # Start production server
```

## Conventions

- Path alias: `@/*` maps to `./src/*`
- Use TypeScript strict mode
- UI components live in `src/components/ui/` and follow Radix UI + CVA patterns
- State stores use Zustand in `src/lib/store/`
- Type definitions go in `src/types/`
- Currently using mock services in `src/services/mock/` (no backend yet)
