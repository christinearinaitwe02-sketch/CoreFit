# FitTrack Pro — Replit Project

## Overview
A mobile fitness app (Expo React Native) for women fitness clients. Includes a dashboard, workout timer, meal logging, AI calorie estimation, weekly progress charts, weight tracking, and a coach dashboard.

## Architecture

### Monorepo structure (pnpm workspaces)
- `artifacts/api-server/` — Express API server (port 8080, env `PORT`)
- `artifacts/mobile/` — Expo React Native app (web + mobile)
- `artifacts/mockup-sandbox/` — Vite mockup preview server

### Mobile App (`artifacts/mobile/`)
- **Router**: Expo Router with file-based routing
- **State**: React Context (`context/AppContext.tsx`) + AsyncStorage persistence
- **Design**: Soft peach (#FFF8F5) bg, purple (#9B5DE5) primary, pink (#FF8FAB) secondary; Inter font; 16-24px radius; subtle shadows
- **Tabs**: Dashboard, Workout, Log, Progress, Clients (coach only), Profile

#### Key screens
| File | Description |
|------|-------------|
| `app/(tabs)/index.tsx` | Dashboard with stat rings, goal bars, quick actions, today's workouts/meals |
| `app/(tabs)/workout.tsx` | Workout timer with exercise library and calorie calculation |
| `app/(tabs)/log.tsx` | Meals (with AI calorie estimation), water, sleep logging |
| `app/(tabs)/progress.tsx` | Weekly bar charts (calories/sleep/water), consistency tracker, weight tracker, goals |
| `app/(tabs)/coach.tsx` | Coach dashboard with client list |
| `app/(tabs)/profile.tsx` | User profile, role switching (client/coach) |

#### Key components
- `StatRing.tsx` — Circular progress ring (SVG)
- `BarChart.tsx` — SVG bar chart for weekly data
- `AnimatedProgressBar.tsx` — Spring-animated horizontal progress bar
- `PillButton.tsx` — Styled button component
- `SectionHeader.tsx` — Section title with optional action
- `WorkoutTypeChip.tsx` — Workout type badge with icon and color

#### Context / State
`context/AppContext.tsx` provides:
- `user` + role switching (client/coach)
- `workouts`, `meals`, `waterEntries`, `sleepEntries`, `weightEntries`
- CRUD operations, all persisted via AsyncStorage
- `getTodaySummary()`, `getWeekSummary()` for charts/dashboard

### API Server (`artifacts/api-server/`)
- `POST /api/estimate-calories` — AI calorie estimation using OpenAI gpt-5-nano
- `GET /api/health` — Health check

## Environment Variables
- `AI_INTEGRATIONS_OPENAI_BASE_URL` — Replit AI Integration proxy URL (set automatically)
- `AI_INTEGRATIONS_OPENAI_API_KEY` — Replit AI Integration API key (set automatically)
- `SESSION_SECRET` — Express session secret
- `EXPO_PUBLIC_DOMAIN` — Set automatically; used by Expo app to reach the API server

## Key Dependencies
- `expo`, `expo-router`, `expo-haptics`, `expo-blur`
- `react-native-svg` — For bar charts and stat rings
- `@react-native-async-storage/async-storage` — Local persistence
- `openai` — API server AI calls
- `express`, `cors`, `pino-http` — API server

## Design Tokens (constants/colors.ts)
```
primary: #9B5DE5 (purple)
secondary: #FF8FAB (pink)
peach: #FFB085
background: #FFF8F5 (warm cream)
card: #FFFFFF
muted: #F5F0FA
mutedForeground: #8B7AA8
```

## User Instructions
- No emojis in UI
- Use Inter font family throughout
- Haptic feedback on all significant interactions
- AI calorie estimation uses the API server (not directly from mobile)
