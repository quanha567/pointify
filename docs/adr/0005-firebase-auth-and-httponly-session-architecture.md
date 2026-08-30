# 0005. Firebase Auth, Fastify HttpOnly Session Cookies, and Dual Identity Architecture

## Context
Pointify requires a secure, friction-free authentication system for agile teams. In Scrum Poker estimation sessions, some participants need immediate, zero-friction access to vote (Guests), while facilitators and regular users require persistent accounts to manage custom decks, room histories, and administrative settings. Furthermore, session management between the TanStack Router SPA and Fastify backend must protect against XSS and support secure WebSocket handshake authentication.

## Decision
1. **Dual Identity Model (Guest Participant & Registered Account)**:
   - **Guest Participant**: Zero-barrier entry. Participants can join and estimate in rooms with only a temporary display name without mandatory authentication.
   - **Registered Account**: Full persistence via Firebase Authentication (Email/Password and Google OAuth).

2. **Frontend Authentication Store (`useAuthStore`)**:
   - Built with Zustand, synchronizing real-time auth states via Firebase Client SDK `onAuthStateChanged`.
   - Manages user profiles (`uid`, `email`, `displayName`, `photoURL`), guest flags, and auth actions (`loginWithEmail`, `registerWithEmail`, `loginWithGoogle`, `logout`, `continueAsGuest`).

3. **Backend Session Management (Firebase Admin & HttpOnly Cookie)**:
   - Fastify backend validates Firebase ID tokens via `/api/auth/session` exchange endpoint.
   - Issues secure `Set-Cookie: __session=...; HttpOnly; Secure; SameSite=Lax; Path=/` session cookies for stateful API calls and future WebSocket handshakes, mitigating token leakage and XSS vulnerabilities.

4. **Dedicated Glassmorphic Auth Route (`/auth`)**:
   - Single unified route (`/auth` with `?mode=login|register` and `?redirect=...`) built in TanStack Router.
   - Desktop split-screen layout with an interactive brand showcase on the left and a glassmorphic card on the right (Google OAuth button, divider, animated tab switching between Login & Register, password visibility toggles, and Guest quick-action).
   - Full bilingual support (EN/VI) and dark/light theme fidelity.

## Consequences
- Guarantees seamless onboarding for team members while securing persistent account capabilities.
- Prevents XSS token exposure through HttpOnly session cookies.
- Provides a consistent visual identity matching Pointify's modern glassmorphic design system.
