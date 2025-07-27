# EPL Calendar PWA - Comprehensive Implementation Plan

## Project Overview
Create a React + Vite + Tailwind + shadcn/ui PWA for EPL fixtures with timezone support, notifications, real-time scores, and league table. Deployed on Vercel.

## Phase 1: Project Setup & Core Architecture
- [x] Initialize Vite React project with TypeScript
- [x] Configure Tailwind CSS v4 with custom EPL color scheme (purple/pink/white) - uses CSS-based config, no JS config file
- [x] Install and configure shadcn/ui CLI
- [x] Initialize core shadcn/ui components (Button, Card, Select, Dialog, Table, Badge, Switch, Tabs)
- [x] Set up PWA manifest and service worker with Vite PWA plugin
- [x] Configure ESLint, Prettier, and basic project structure
- [x] Set up routing with React Router DOM
- [x] Create folder structure (components, hooks, utils, types, lib)
- [x] Configure Vercel deployment settings

## Phase 2: Design System & Components
- [x] Create custom EPL color palette in Tailwind CSS file (v4 uses CSS-based configuration)
- [x] Set up CSS variables for light/dark theme support
- [x] Build base layout with shadcn/ui components
- [x] Create custom EPL-themed shadcn/ui variants
- [x] Implement responsive navigation with Tabs component
- [x] Set up typography scale matching EPL branding
- [x] Create reusable icon system

## Phase 3: API Integration & Data Management
- [x] Create API service for Fantasy Premier League endpoints
- [x] Implement fixtures data fetching (`/api/fixtures/`)
- [x] Implement teams data fetching (`/api/bootstrap-static/`)
- [x] Create TypeScript interfaces for API responses
- [x] Set up React Query for data caching and synchronization
- [x] Implement smart polling mechanism (faster during match times)
- [x] Create utility functions for timezone conversion
- [x] Add error handling and retry logic

## Phase 4: Core Components Development
- [x] Build FixtureCard component using shadcn/ui Card
- [x] Implement score toggle with shadcn/ui Switch
- [x] Create MatchWeek component with active/completed states
- [x] Build timezone selector with shadcn/ui Select
- [x] Create notification system using Web Notifications API
- [x] Build league table with shadcn/ui Table component
- [x] Implement language selector with shadcn/ui Select
- [x] Create PWA install prompt with shadcn/ui Dialog

## Phase 5: Main Features Implementation
- [ ] Build main fixtures view grouped by matchweek
- [ ] Implement score hiding/showing functionality
- [ ] Add matchweek completion detection and greyed-out styling
- [ ] Create league table page with current standings
- [ ] Implement timezone conversion throughout app
- [ ] Add fixture notifications with permission handling
- [ ] Create settings page using shadcn/ui components
- [ ] Add loading states with shadcn/ui Skeleton components

## Phase 6: PWA & UX Features
- [ ] Configure PWA manifest with EPL-themed icons
- [ ] Implement service worker for offline functionality
- [ ] Create "Add to Home Screen" tutorial popup
- [ ] Add pull-to-refresh functionality
- [ ] Implement comprehensive error boundaries
- [ ] Add haptic feedback for mobile interactions
- [ ] Optimize for iOS Safari and Chrome mobile
- [ ] Test PWA installation across devices

## Phase 7: Internationalization
- [ ] Set up i18next for internationalization
- [ ] Create translation files structure (en, es, fr, de, it)
- [ ] Implement language detection and switching
- [ ] Add English as default with framework for contributions
- [ ] Translate all UI text and labels
- [ ] Handle RTL languages support structure
- [ ] Document translation contribution process

## Phase 8: Real-time Updates & Performance
- [ ] Implement smart polling (every 30s during matches, 5min otherwise)
- [ ] Add background sync for offline score updates
- [ ] Optimize bundle size with Vercel edge functions
- [ ] Implement code splitting by route
- [ ] Add performance monitoring and Web Vitals tracking
- [ ] Implement data persistence with IndexedDB
- [ ] Set up Vercel Edge Config for feature flags

## Phase 9: Vercel Deployment & Optimization
- [ ] Configure Vercel project settings
- [ ] Set up environment variables for API endpoints
- [ ] Configure custom domain (if applicable)
- [ ] Set up Vercel Analytics
- [ ] Configure caching headers for static assets
- [ ] Set up preview deployments for branches
- [ ] Configure security headers
- [ ] Test deployment and domain propagation

## Phase 10: Legal, Testing & Final Touches
- [ ] Add proper attribution footer for Premier League branding
- [ ] Include disclaimer about unofficial status and data accuracy
- [ ] Create privacy policy and terms of use pages
- [ ] Implement comprehensive testing (unit, integration, e2e)
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Mobile device testing (iOS, Android)
- [ ] Performance audit with Lighthouse
- [ ] Final accessibility audit (WCAG compliance)

## Technical Specifications
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

## Key shadcn/ui Components Used
- [ ] **Card** - Fixture cards, matchweek containers
- [ ] **Select** - Timezone and language selectors
- [ ] **Dialog** - PWA install prompt, settings modal
- [ ] **Table** - League standings table
- [ ] **Badge** - Match status, team positions
- [ ] **Switch** - Score visibility toggle
- [ ] **Tabs** - Navigation between fixtures/table
- [ ] **Button** - All interactive elements
- [ ] **Skeleton** - Loading states

## Key Features Summary
- ✅ Fixtures grouped by matchweek with active/completed states
- ✅ Score hiding/showing toggle with smooth animations
- ✅ Timezone selection and real-time conversion
- ✅ Smart match notifications
- ✅ Live league table view
- ✅ PWA with offline support and install prompt
- ✅ Multi-language support with contribution framework
- ✅ Real-time score updates via smart polling
- ✅ Vercel edge deployment with optimal performance

## Legal Attribution
Footer text: "All Premier League branding, logos, and trademarks are property of The Football Association Premier League Limited. This is an unofficial app not affiliated with the Premier League."

## Progress Tracking
This file serves as the master checklist for the EPL Calendar PWA project. Check off items as they are completed to track progress through each phase.