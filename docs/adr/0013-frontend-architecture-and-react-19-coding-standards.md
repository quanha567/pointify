# 13. Frontend Architecture, React 19 Patterns, and Coding Standards

Date: 2026-08-31

## Status

Accepted

## Context

As the `pointify-web` application expands from initial prototype to an enterprise-grade collaborative Scrum Poker and administrative platform:
1. Architectural consistency across components, state layers, and routing is vital to maintain velocity and eliminate regressions.
2. React 19 and modern toolchains (Vite+, TypeScript 7, Tailwind v4, TanStack Router/Query/Table/Form) introduce powerful primitives (e.g. Ref-as-a-Prop, standard Transitions, Action hooks) that simplify previous boilerplate (such as `forwardRef` and manual loading state tracking).
3. Clear boundaries are required between URL State, Server/Query State, Global Client State (Zustand), and Local Form State.
4. UI component purity (Shadcn primitives + semantic Tailwind tokens), domain vocabulary strictness (`CONTEXT.md`), and automated verification (`tsc`, `vp check`) must be codified.

## Decision

1. **Feature-Based Colocation & Architecture**:
   - Organize domain logic under `src/features/<feature_name>/` (containing components, hooks, api queries, types).
   - Maintain `src/routes/` as thin orchestrators.
   - Keep `src/components/ui/` pure for Shadcn / Radix primitives.

2. **4-Tier State Separation**:
   - URL State: TanStack Router search params validated with Zod.
   - Server State: `@tanstack/react-query` managing backend/Firestore async lifecycle.
   - Global Client State: Zustand stores for authentication and user preferences.
   - Local UI State: React 19 local state / encapsulated handles.

3. **React 19 Native Patterns & Encapsulated Modals**:
   - Use React 19 Ref-as-a-Prop combined with `useImperativeHandle` for Dialogs/Sheets/Drawers to keep parent components lean.
   - Leverage `useTransition` for async state transitions and `useOptimistic` for instant estimation feedback.
   - Eliminate unnecessary `useEffect` calls in favor of derived state or dedicated subscriptions with cleanups.

4. **Design Tokens & i18n Domain Strictness**:
   - 100% semantic token usage in Tailwind v4; zero raw hardcoded hex values.
   - 100% string localization via `i18next` strictly aligning with `CONTEXT.md` terms.

5. **Route Boundaries & Feedback**:
   - Implement dedicated 404 (`notFoundComponent`), `pendingComponent` (Skeletons), and `errorComponent` across all route levels.
   - Provide toast notifications via `sonner` for all mutations.

## Consequences

- **Positive**: Clean, maintainable codebase with zero duplicate state bugs and predictable render behavior.
- **Positive**: Developers and AI Agents adhere to a single unified standard.
- **Positive**: Full type safety and runtime validation powered by TypeScript 7 and Zod.
- **Positive**: Seamless light/dark mode support and instantaneous responsive UI.
