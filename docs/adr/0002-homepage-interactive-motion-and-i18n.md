# 0002. Homepage Interactive Motion Experience & Zustand-Persisted i18n

## Context
Pointify requires a fast, friction-free app-first dashboard for Agile teams while delivering a high-end, responsive visual experience. A static form layout lacks engagement, while a standard heavy marketing landing page causes unnecessary friction. Additionally, Pointify supports global and Vietnamese development teams, necessitating a seamless bilingual experience (English & Vietnamese) with persisted state.

## Decision
1. **Interactive App-First Dashboard with Spring Physics**:
   - Maintain the instant Create/Join split cards and recent rooms list from ADR 0001.
   - Introduce an **Interactive 3D Card Stage** using `motion` with spring physics (interactive 3D fan, 3D card flipping, hover elevation, and dynamic shuffle interaction).
   - Add ambient mouse-tracking radial lighting and subtle background mesh matrix.
   - Optimize visual hierarchy for pristine Light Theme first (clean shadows, indigo/violet gradients, glassmorphism borders) while supporting dark mode transitions.

2. **Zustand-Persisted i18n Architecture**:
   - Integrate `i18next` and `react-i18next` backed by a `zustand` store with `persist` middleware (`pointify_app_settings`).
   - Store language selection (`vi` / `en`) and synchronize with `i18next.changeLanguage()`.
   - Provide a persistent flag-based language switcher (`🇻🇳 Tiếng Việt` / `🇬🇧 English`) in the global navigation header.
   - Enforce canonical domain terminology defined in `CONTEXT.md` across both locales.

## Consequences
- Highly responsive micro-interactions and interactive card showcase without slowing down instant room creation.
- Type-safe, centralized localization state shared across components and persisted in local storage.
