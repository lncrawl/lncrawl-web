# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start

**Install & Run:**
```bash
yarn install
yarn dev              # Run dev server (http://localhost:5173)
yarn build            # Type-check and build for production
yarn lint             # Run ESLint
```

**Dev API Configuration:**
- Default: `http://localhost:8181` (set in `src/config.ts`)
- Override: Create/edit `.env.development.local` with `VITE_API_BASE_URL=http://localhost:8080`
- The backend must be running for the web app to function

**Build Output:** `dist/` (with chunked vendor files for React, Ant Design, Redux)

---

## Architecture Overview

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 19 with TypeScript |
| **Build** | Vite 6 with SWC (faster than Babel) |
| **UI Components** | Ant Design 6 |
| **State Management** | Redux Toolkit with Redux Persist (localStorage) |
| **Routing** | React Router 7 with lazy loading |
| **HTTP Client** | Axios with auto-logout on 401 |
| **PWA** | vite-plugin-pwa (auto-update, offline support, installable) |
| **Styling** | SCSS, custom Ant Design dark theme |

### High-Level Structure

```
src/
├── pages/                 # Route-level page components
│   ├── router.tsx         # Route definitions (AUTH_ROUTES, USER_ROUTES, ADMIN_ROUTES)
│   └── */index.tsx        # Feature pages (NovelList, JobDetails, etc.)
├── components/            # Reusable UI and layout components
│   ├── Layout/            # Three layout types: Auth, Main (desktop/mobile), Reader
│   ├── Tags/              # Status/type indicator tags
│   ├── Library/           # Library-related shared components
│   └── */                 # Feature-specific components
├── store/                 # Redux store configuration and slices
│   ├── index.ts           # Store setup, persistor config, onBeforeLift hook
│   ├── _auth.ts           # Auth state: login, logout, switch user, token management
│   ├── _reader.ts         # Reader state: theme, font, voice, layout preferences
│   ├── _view.ts           # UI state: sidebar collapse, mobile menu, modals
│   └── _config.ts         # App config: pagination sizes, polling intervals
├── types/                 # TypeScript types and enums
│   ├── index.ts           # Core domain models (User, Job, Novel, Library, etc.)
│   └── enums.ts           # Enums (UserRole, JobStatus, JobType, UserTier, etc.)
├── utils/                 # Helper functions and utilities
│   ├── setupAxios.ts      # Axios config with auth headers and error interception
│   ├── theme.ts           # Ant Design theme customization
│   ├── jwt.ts             # JWT token parsing
│   ├── jobSocket.ts       # WebSocket handler for job status updates
│   └── */                 # Other helpers (time, size, gradients, errors, etc.)
├── config.ts              # API_BASE_URL setting
└── main.tsx               # Entry point with Redux, PWA, theme setup
```

---

## Key Architectural Patterns

### 1. Redux Store & Selectors
Redux state is divided into 4 slices, all persisted to localStorage:

**Auth Slice** (`src/store/_auth.ts`):
- Stores current user, JWT token, expiration time, and historical logins
- Exports selectors: `Auth.select.loggedIn`, `Auth.select.user`, `Auth.select.isAdmin`
- Exports actions: `Auth.action.login()`, `Auth.action.logout()`, `Auth.action.switchUser()`
- Token expiry is checked on every selector evaluation

**Reader Slice** (`src/store/_reader.ts`):
- Persists reader preferences: font size, theme, layout (vertical/horizontal), voice settings
- Used by `NovelReader` component for immersive reading experience

**View Slice**:
- Ephemeral UI state: sidebar collapse, mobile menu, modal visibility
- Not typically persisted (but can be configured)

**Config Slice** (`src/store/_config.ts`):
- App-wide settings: pagination sizes (per layout breakpoint), polling intervals
- Allows runtime tuning without code changes

### 2. Route-Based Access Control
Routes are defined in `src/pages/router.tsx` with three hierarchies:

- **AUTH_ROUTES**: Login, signup, password reset (unauthenticated users)
- **USER_ROUTES**: Main app features (authenticated users)
- **ADMIN_ROUTES**: Extends USER_ROUTES with admin pages (/admin/users, /admin/announcements)

Route selection happens in `App` component based on `Auth.select.loggedIn` and `Auth.select.isAdmin`.
All routes use lazy loading with React.lazy() and Suspense for code splitting.

### 3. Data Flow & API Integration
**Pattern:**
- Pages/components import custom hooks (e.g., `useNovelList()`) from a `hooks.ts` file
- Hooks manage data fetching, pagination, filtering, and error handling
- Components receive data, loading, error states from hooks and render accordingly

**Error Handling:**
- Axios interceptor at `src/utils/setupAxios.ts` auto-logs out on 401 (token expired)
- Pages show `<ErrorState />` component with optional retry button
- `LoadingState` shows spinner during data fetch

**Example page flow:**
1. `NovelListPage` calls `useNovelList()` hook
2. Hook fetches from `/api/novels`, manages pagination & filtering via URL search params
3. Page renders `NovelFilterBox` (filter form), `NovelListItemCard` (grid items), `Pagination`
4. Filter changes trigger `updateParams()`, which re-fetches via hook

### 4. Authentication & Token Management
**Login Flow:**
1. User logs in → API returns `{ user, token }`
2. `Auth.action.login()` stores user, parses JWT to extract scopes/expiry, sets axios default header
3. Token is persisted to localStorage via redux-persist

**Auto-Login on Reload:**
- `onBeforeLift()` hook (called before UI renders) checks URL query params and localStorage
- Validates token against `/api/auth/me` endpoint
- Falls back to login page if token is invalid

**Token Expiry Check:**
- Selectors check `tokenExpiresAt > Date.now()` in real-time
- Axios interceptor logs out on 401 from API

### 5. Responsive Layout
Layouts use Ant Design's `Grid.useBreakpoint()` to conditionally render:
- **Desktop** (`md` breakpoint and up): Sidebar + main content
- **Mobile** (below `md`): Header + mobile navbar with bottom sticky nav

Custom breakpoints can be set via theme config (Ant Design defaults: xs, sm, md, lg, xl, xxl).

### 6. PWA & Offline Support
Configured via `vite-plugin-pwa` in `vite.config.ts`:
- Service Worker auto-updates when new deployment detected (`registerType: 'autoUpdate'`)
- Offline: Cached assets allow repeat visits to work
- Denylist: `/api/`, `/^\/ws/`, `/static/`, `/docs/` routes always fetched fresh (never cached)

---

## Common Development Tasks

### Adding a New Page
1. Create `src/pages/NewPageName/index.tsx` with a default export component
2. Create `src/pages/NewPageName/hooks.ts` for data fetching logic (if needed)
3. Add lazy import to `src/pages/router.tsx`
4. Define route in appropriate route array (AUTH_ROUTES, USER_ROUTES, or ADMIN_ROUTES)
5. Wrap component with `withSuspense()` in route definition

### Adding a Reusable Component
- Place in `src/components/` with a descriptive folder name
- Export as default or named export in `index.tsx`
- Keep styling local (component-scoped SCSS) or import from theme utils

### Modifying Redux State
1. Edit the relevant slice file (`src/store/_*.ts`)
2. Add reducer or selector as needed
3. Export via the slice's `action` and `select` objects
4. Use `useSelector()` to read state, `useDispatch()` and action to update

### Styling & Theme
- Global styles in `src/main.scss` (typography, defaults)
- Component styles: import `*.scss` files alongside components
- Theme customization in `src/utils/theme.ts`: primary color (#1d6a3c), dark bg (#1c1c1c)
- Ant Design components accept `style` or `className` props; avoid overriding token defaults unless necessary

### Working with Axios & API
- Base URL from `src/config.ts` (dev: `http://localhost:8181`, prod: same origin)
- Auth header auto-added by setupAxios (Bearer token)
- Make requests: `axios.get('/api/path')`
- Type responses: `axios.get<MyType>('/api/path')`
- Interceptor handles 401 (logout) automatically

---

## Important Notes

- **TypeScript strict mode**: `noUnusedLocals`, `noUnusedParameters`, strict null checks
- **ESLint**: React Hooks exhaustive deps enforced; `react-refresh` plugin for fast refresh
- **Prettier**: 2-space tabs, single quotes, trailing commas (es5), LF line endings
- **Build chunking**: Vendor chunks separated (React, Ant Design, Redux) for better caching
- **No test framework configured** — no existing tests; Jest or Vitest can be added
- **PWA manifest**: App name "Lightnovel Crawler", installable on supported browsers, auto-updates
- **localStorage**: Persisted Redux state lives under `persist:*` keys — inspect these in DevTools when debugging stale state
- **Service Worker**: Unregister in DevTools > Application if PWA cache causes stale UI after a deploy
