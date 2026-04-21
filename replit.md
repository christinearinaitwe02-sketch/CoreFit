# FitTrack Pro

## Overview

FitTrack Pro is a mobile fitness app built with Expo React Native. It targets women fitness clients with a clean, modern design using soft peach and purple branding.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Mobile**: Expo (React Native) with Expo Router
- **State**: React Context + AsyncStorage (no backend required for first build)
- **API framework**: Express 5 (shared API server, not used by mobile app yet)
- **Database**: PostgreSQL + Drizzle ORM (API server)
- **Fonts**: Inter (400/500/600/700)

## Mobile App Features

- **Dashboard**: Daily summary with stat rings for calories, water, sleep, meals
- **Workout Tracker**: Timer, type selection, automatic calorie estimation, history
- **Meal Log**: Breakfast/lunch/dinner/snack categorization, calorie tracking
- **Water Tracker**: Glass-by-glass tracking with visual grid
- **Sleep Tracker**: Hours + quality logging
- **Coach Dashboard**: View clients, progress, add notes (role: coach)
- **Client Detail**: Weekly progress, consistency score, coach notes
- **Profile**: User switching (client/coach roles), stats overview, subscription upsell

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/mobile run dev` — run mobile app
- `pnpm --filter @workspace/api-server run dev` — run API server

## Design

- Colors: Soft peach (#FFF8F5 bg), Purple (#9B5DE5 primary), Pink (#FF8FAB secondary)
- Rounded corners (16-24px radius)
- Cards with subtle shadows
- Stat rings using react-native-svg
- Inter font family

## Artifacts

- `artifacts/mobile` — Expo mobile app (preview path: `/`)
- `artifacts/api-server` — Express API server (preview path: `/api`)
