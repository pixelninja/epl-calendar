# EPL Calendar PWA - Claude Development Guide

## Project Overview
This is a React + Vite + TypeScript PWA for EPL fixtures with timezone support, notifications, real-time scores, and league table. The app uses Tailwind CSS with shadcn/ui components and deploys on Vercel.

## Technology Stack
- **Framework**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS v4 (CSS-based config) + shadcn/ui components
- **State Management**: React Query for server state
- **Routing**: React Router DOM
- **PWA**: Vite PWA plugin with Workbox
- **APIs**: Fantasy Premier League public endpoints
- **Notifications**: Web Notifications API
- **Storage**: IndexedDB for offline data
- **Deployment**: Vercel with Edge Functions
- **Testing**: Vitest + React Testing Library + Playwright

## Key Commands
```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview

# Test
npm test

# Lint
npm run lint

# Type check
npm run type-check
```

## Project Structure
```
app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript type definitions
│   ├── lib/           # Configuration and setup
│   └── pages/         # Route components
├── public/            # Static assets
└── dist/              # Build output
```

## Key Features
- Fixtures grouped by matchweek with active/completed states
- Score hiding/showing toggle with smooth animations
- Timezone selection and real-time conversion
- Smart match notifications
- Live league table view
- PWA with offline support and install prompt
- Multi-language support framework
- Real-time score updates via smart polling

## shadcn/ui Components Used
- **Card** - Fixture cards, matchweek containers
- **Select** - Timezone and language selectors
- **Dialog** - PWA install prompt, settings modal
- **Table** - League standings table
- **Badge** - Match status, team positions
- **Switch** - Score visibility toggle
- **Tabs** - Navigation between fixtures/table
- **Button** - All interactive elements
- **Skeleton** - Loading states

## API Integration
- **Development**: Uses real FPL data from local JSON files (`src/lib/data-*.json`)
- **Production**: Tries Fantasy Premier League API endpoints, falls back to local data
- `/api/fixtures/` for fixture data (with Vercel proxy in production)
- `/api/bootstrap-static/` for teams and league data (with Vercel proxy in production)
- Real team data includes all teams from FPL API (including Burnley, Leeds, Sunderland)

## Development Notes
- Uses Tailwind CSS v4 with CSS-based configuration (no tailwind.config.js file)
- EPL color scheme: purple/pink/white theme configured in CSS
- Responsive design with mobile-first approach
- PWA manifest configured for home screen installation
- Service worker handles offline functionality
- Real-time timezone conversion throughout app
- Comprehensive error handling and retry logic

## Legal Attribution
Footer: "All Premier League branding, logos, and trademarks are property of The Football Association Premier League Limited. This is an unofficial app not affiliated with the Premier League."

## Progress Tracking
See PROJECT_PLAN.md for detailed phase-by-phase implementation checklist.