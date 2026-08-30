# 0007. Backend Domain-Driven Design (DDD) and Clean Architecture

## Context
As Pointify transitions from simple authentication and user profile CRUD to complex real-time collaborative Scrum Poker estimation workflows (room management, participant roles, custom decks, live rounds, vote secrecy, and facilitator recovery), we need a modular, testable, and maintainable backend architecture. We needed to define bounded contexts, layering rules, aggregate boundaries, error handling patterns, and persistence strategies.

## Decision
1. **Modular Monolith with Two Bounded Contexts**:
   - `Identity`: Handles Accounts, Profiles, and Firebase Auth sessions.
   - `Room`: Handles Rooms, Participants, Decks, Rounds, Estimates, and real-time collaboration.
   - Core shared kernel lives in `src/shared/` (`Entity`, `AggregateRoot`, `ValueObject`, `Result<T, E>`, `DomainEvent`).

2. **Clean Architecture 4-Layer Separation**:
   - `domain/`: Pure TypeScript Entities, Value Objects, Domain Events, and Repository interfaces (zero framework/external dependencies).
   - `application/`: Use Cases (Commands/Queries), Application Services, and DTOs.
   - `infrastructure/`: Firestore Repositories, Firebase Admin integrations, and external services.
   - `presentation/`: Fastify Controllers, WebSocket Gateways, and Guards.

3. **Rich Domain Aggregate for Room & State Machine**:
   - `Room` is the Aggregate Root enforcing all estimation invariants (`submitEstimate`, `revealCards`, `nextRound`, `claimFacilitator`).
   - Round values are strictly masked in projection until the round status is `revealed`.
   - Result Pattern (`Result<T, DomainError>`) is used for explicit error propagation across Domain and Application layers.

4. **Firestore Persistence with Optimistic Concurrency Control**:
   - Room state is stored per document in `rooms/{roomId}` with an atomic `version` field checked inside Firestore transactions.
   - Facilitator access is secured with a `FacilitatorKey`, with a 15-minute inactivity grace period before any active participant can invoke `Claim Facilitator`.

## Consequences
- **High Testability**: Domain rules and state transitions can be 100% unit-tested with pure TypeScript, completely isolated from NestJS or Firestore.
- **Strict Invariant Protection**: Card hiding, facilitator authority, and deck constraints are enforced at the domain core.
- **Maintainability**: Clear separation between identity management and real-time game loops prevents cross-module tight coupling.
