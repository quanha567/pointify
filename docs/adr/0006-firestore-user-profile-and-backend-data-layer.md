# 0006. Server-side Firestore User Profile Management and Data Architecture

## Context
Following the establishment of Firebase Authentication and HttpOnly session cookies (ADR-0005), Pointify requires a persistent storage layer to manage user accounts, room data, and estimation states. We needed to choose the data access pattern, storage engine, schema boundary, and guest lifecycle to maintain high performance, strict data security, and low operational overhead.

## Decision
1. **Single Source of Truth with Cloud Firestore (NoSQL)**:
   - Use Google Cloud Firestore as the primary database for Pointify.
   - Omit relational SQL ORMs (TypeORM/Prisma) at this stage to keep the Fastify backend lightweight, scalable, and fully aligned with the Firebase ecosystem.

2. **Server-Side Only Access via `firebase-admin`**:
   - All reads, writes, and mutations to the `users` collection are strictly performed on the backend using the Firebase Admin SDK (`firebase-admin/firestore`).
   - Firestore Security Rules will reject direct client-side read/write requests (`read, write: if false;`), routing all profile modifications through validated Fastify endpoints (`/api/auth/session`, `/api/users/me`).

3. **Lean Account Profile Schema**:
   - Only registered authenticated users (Email/Password or Google OAuth) are stored in Firestore under `users/{uid}`.
   - Client-side preferences (theme, language) remain local to avoid database bloat.
   - Schema structure:
     ```typescript
     interface UserDocument {
       uid: string;
       email: string | null;
       displayName: string;
       photoURL: string | null;
       providerId: 'google.com' | 'password';
       createdAt: number;
       updatedAt: number;
       lastLoginAt: number;
     }
     ```

4. **Zero-Database-Footprint for Guest Participants**:
   - Guest Participants do not generate documents in Firestore.
   - Guest identity lives strictly in-memory within active WebSocket estimation rooms and in browser `localStorage`.

5. **Automated Upsert on Session Exchange**:
   - During the `/api/auth/session` token exchange, the backend verifies the ID token, checks for existing `users/{uid}`, and automatically inserts or updates the record (`lastLoginAt`, profile details) in a single atomic operation.

## Consequences
- **Security**: Complete prevention of client-side profile tampering and data leakages.
- **Simplicity**: No SQL database provisioning or ORM migration maintenance required.
- **Cost & Performance**: Zero garbage records generated from transient guest voters.
