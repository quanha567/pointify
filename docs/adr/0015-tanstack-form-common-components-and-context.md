# 15. Standardized TanStack Form Context & Common Form Components Architecture

Date: 2026-08-31

## Status

Accepted

## Context

Forms across `pointify-web` (e.g., room creation modal, user profile management, admin editing sheets) previously relied on scattered React local state (`useState` per field), manual form submit handlers, manual error checking, and boilerplate field layouts with repetitive labels, icons, and error text.

Key challenges identified:
1. **Boilerplate & Layout Duplication**: Every input field required manual wiring of `Label`, `Input`/`Select`/`Switch`, prefix icons, description text, and error styling (`aria-invalid`, conditional error message rendering).
2. **Re-render Performance**: As forms grow larger or contain complex modal animations, updating parent form state on every keystroke causes unnecessary full-tree re-renders.
3. **Lack of Standardized Validation**: Mixing ad-hoc client-side checks with inconsistent error alerts instead of a single type-safe Zod schema validation layer.
4. **Tight Coupling vs Reusability**: UI primitives in `src/components/ui/` need to remain decoupled and pure (following Shadcn/Radix conventions), while forms require high-level automated wiring.

## Decision

1. **Core Form Engine: `@tanstack/react-form` + `@tanstack/zod-form-adapter`**:
   - Adopt `@tanstack/react-form` as the standardized form management engine across the web application.
   - Use `zodValidator` and Zod schemas for runtime schema-first validation.
   - Benefit from TanStack Form's fine-grained reactive subscriptions (only the active input field re-renders on keystroke).

2. **Strict Separation: UI Primitives vs Form-Connected Components**:
   - Keep `src/components/ui/` primitives (`input.tsx`, `select.tsx`, `switch.tsx`, `textarea.tsx`, `field.tsx`, `input-group.tsx`) pure, headless/styled, and free of form context dependencies.
   - Implement form-connected components inside `src/components/form/`:
     - `Form` & `useAppForm`: Top-level form provider and wrapper hook with imperative handle support (`reset`, `setFieldValue`).
     - `FormInput`: High-level text/password/email input with label, prefix/suffix icons, required marks, description, and auto-attached validation error.
     - `FormTextarea`: Multiline input with automatic field composition.
     - `FormSelect` / `FormNativeSelect`: Dropdown selectors with automatic field context wiring.
     - `FormSwitch` & `FormCheckbox`: Boolean toggle controls with integrated horizontal/vertical labels.
     - `FormField`: Generic composable wrapper for custom UI selectors (e.g., Poker Deck card selection).
     - `FormSubmitButton`: Submit button auto-subscribed to `form.state.isSubmitting` and `form.state.canSubmit` with built-in loading spinner.

3. **Developer Experience (DX) & Type-Safety**:
   - Standardize on type-safe field paths via the `name` prop matching the Zod schema keys.
   - Automatic integration with `Field`, `FieldLabel`, `FieldDescription`, and `FieldError` from `src/components/ui/field.tsx`.
   - 100% compliance with i18n translation keys and React 19 forward-ref/ref-as-prop standards.

## Consequences

- **Positive**: Reduces form JSX boilerplate by up to 70% while keeping complete type safety from Zod schemas.
- **Positive**: Prevents parent component re-renders during text input via TanStack Form's reactive field subscriptions.
- **Positive**: Maintains clean architecture by preserving the purity of Shadcn UI primitives.
- **Positive**: Provides consistent UI validation feedback, accessibility attributes (`aria-invalid`, `aria-describedby`), and submit loading states across the entire application.
