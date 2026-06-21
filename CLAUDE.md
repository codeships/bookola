# Bookola

Premium AI-powered book reading and audiobook app built with Expo SDK 55 + React Native.

## Tech Stack
- **Framework**: Expo SDK 55 with Expo Router (file-based routing, typed routes)
- **Language**: TypeScript 5.9
- **Animations**: react-native-reanimated 4.2
- **Navigation**: @react-navigation/bottom-tabs + expo-router Stack
- **Styling**: StyleSheet + custom theme system (no CSS-in-JS library)

## Project Structure
- `src/app/` — Expo Router screens (file-based routing)
- `src/components/shared/` — Reusable UI components
- `src/components/cards/` — Book-specific card components
- `src/lib/theme/` — Theme system (colors, typography, spacing, shadows)
- `src/types/` — TypeScript type definitions
- `src/data/` — Mock data for prototyping
- `docs/` — App blueprint and documentation

## Conventions
- Path alias: `@/` maps to `src/`
- Theme: use `useAppTheme()` hook for colors, `isDark` boolean
- Glass effect: wrap content in `<GlassPanel>` for frosted card look
- Animations: use `<AnimatedFadeIn delay={ms}>` for entrance animations
- Layout: wrap screens in `<ScreenShell>` for SafeArea + scroll + decorative orbs
- Buttons: use `<AppButton variant="primary|secondary|ghost" />`
- Responsive: `ScreenShell` centers + caps content width on tablet/desktop and adapts horizontal padding (16/20/28/32px) automatically. For per-screen responsive logic use `useResponsive()` from `@/lib/theme/breakpoints` (`isPhone/isTablet/isDesktop`, `contentMaxWidth`, `pick({ phone, tablet, desktop })`)

## Commands
```bash
npm start         # Start Expo dev server
npm run android   # Run on Android
npm run ios       # Run on iOS
npm run web       # Run on web
```
