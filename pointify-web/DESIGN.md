# ONE Digital Design Guideline — Pointify Web

> Single source of truth for UI/UX designers, frontend engineers, and AI coding agents developing the Pointify Scrum Poker application under Ocean Network Express (ONE) brand identity.

---

## 1. Design Philosophy

**Grounded Precision & High-Impact Focus.** Agile estimation sessions demand clarity, speed, and zero ambiguity. The interface anchors participants in calm, neutral tones while deploying ONE's energetic Cherry Blossom Magenta exclusively as an intentional, high-contrast focal accent to guide actions and decisions.

### Brand & Visual Personality

- **Brand Personality**: Confident, forward-moving, resilient, unified, operationally rigorous.
- **Visual Identity**: High contrast between pristine light canvases, maritime deep navy foundations, and Cherry Blossom Magenta signals.
- **UI Personality**: Utilitarian, modular, razor-sharp, dense yet breathable, engineered for rapid data absorption.

### Visual DNA Keywords

Disciplined · Maritime · High-Contrast · Modular · Bold · Utilitarian · Kinetic

### Experiential Target

- **MUST feel like**: An enterprise-grade collaborative command console — reliable, ultra-responsive, structured, providing effortless visual scanning.
- **Must NOT feel like**: A playful lifestyle consumer app, a generic purple-hued SaaS template, an unstyled legacy terminal, or a chaotic pink promotional flyer.

---

## 2. Core Design Principles

### 01 — Controlled Brand Energy

Treat Cherry Blossom Magenta as a high-voltage operational signal, not a decorative surface wash. Use solely for primary CTA, active navigation indicators, and key visual anchors. **Never** flood backgrounds, modals, or large layout divisions with Magenta.

### 02 — Neutral Surface Primacy

Build 90% of visual space using clean white cards (`#FFFFFF`) against an ultra-subtle slate canvas (`#F8FAFC`), bound by delicate borders (`#E2E8F0`). **Avoid** saturated colorful card containers or heavy dark grey section blocks.

### 03 — Disciplined Data Density

Facilitators and Administrators manage many concurrent rooms and participants. Adopt compact 40–44px table row heights, tabular figure typography (`font-mono` / `tnum`), and truncated text with tooltip reveals.

### 04 — Agile Workflow Alignment

UI state machines must directly mirror Scrum Poker lifecycle: Room Created → Participants Joining → Round Active → Cards Revealed → Consensus Reached → Next Story. **Avoid** abstract statuses like "Processing" or "Shipped."

### 05 — Uncompromising Accessibility

Enforce WCAG 2.1 AA across all states. Use darkened Magenta (`#CC196C`) whenever magenta-tinted text appears on light backgrounds to secure 5.35:1 contrast ratio. **Never** place pure `#E31C79` text below 18px on light backgrounds (4.46:1 fails AA).

### 06 — ISO Container Modularity

Align UI components to strict 4px/8px rectangular blocks, restrained border radii (4px to 8px), and explicit compartmentalization. **Avoid** organic blob shapes, exaggerated pill-shaped containers, or loose asymmetrical grids.

### 07 — Sub-200ms Functional Motion

Constrain interactive feedback, dropdowns, and drawer openings to 150–200ms using sharp cubic-bezier easing. **Avoid** bouncy spring effects, slow fades (>300ms), or decorative hover rotations.

### 08 — Deterministic State Transparency

Use clear skeleton states matching exact structures, explicit loading bars, and clear error banners specifying corrective actions. **Avoid** vague full-screen spinners that obscure interface context.

### 09 — Critical Action Safeguards

Gate destructive actions (deleting rooms, resetting rounds, removing participants) behind two-step confirmation dialogs with clear semantic warning colors. **Avoid** single-click destructive triggers.

### 10 — Batch Utility

Provide multi-entry inputs where applicable. Admin search, room code entry, and story backlog should support rapid input patterns.

---

## 3. Color System

### 3.1. Brand Colors

| Token                   | HEX       | Usage                                                                | Classification               |
| :---------------------- | :-------- | :------------------------------------------------------------------- | :--------------------------- |
| `brand.primary`         | `#E31C79` | Primary CTA, active nav indicators, key accent                       | **OFFICIAL** (Pantone 213 C) |
| `brand.primary.hover`   | `#CC196C` | Hover state for primary magenta buttons, WCAG AA text links (5.35:1) | RECOMMENDED                  |
| `brand.primary.subtle`  | `#FDF2F7` | Active row background, selected nav pill, badge tint                 | RECOMMENDED                  |
| `brand.secondary`       | `#0B1B3D` | Sidebar background, utility bar, high-level headers                  | OBSERVED                     |
| `brand.secondary.hover` | `#162E61` | Hover state for dark navy elements                                   | RECOMMENDED                  |

### 3.2. Surface & Border

| Token               | HEX       | Usage                                              |
| :------------------ | :-------- | :------------------------------------------------- |
| `background.canvas` | `#F8FAFC` | Global viewport background (Slate 50)              |
| `surface.card`      | `#FFFFFF` | Primary card, modal, and table row surface         |
| `surface.elevated`  | `#FFFFFF` | Popovers, dropdown menus, flyout filters           |
| `border.subtle`     | `#E2E8F0` | Structural card borders, grid dividers (Slate 200) |
| `border.strong`     | `#CBD5E1` | Input fields, active tab dividers (Slate 300)      |
| `divider`           | `#F1F5F9` | Inner table horizontal dividing lines (Slate 100)  |

### 3.3. Text

| Token               | HEX       | Usage                                                       |
| :------------------ | :-------- | :---------------------------------------------------------- |
| `text.primary`      | `#0F172A` | Page titles, table cell headers, primary values (Slate 900) |
| `text.secondary`    | `#475569` | Secondary copy, form helper text (Slate 600)                |
| `text.muted`        | `#64748B` | Column headers, timestamps, metadata (Slate 500)            |
| `text.disabled`     | `#94A3B8` | Inactive placeholders, disabled buttons (Slate 400)         |
| `text.link.magenta` | `#CC196C` | Text links on light backgrounds (WCAG AA 5.35:1)            |

### 3.4. Semantic Feedback (600-weight)

| Token              | HEX       | Background Tint | Scenario                                                  |
| :----------------- | :-------- | :-------------- | :-------------------------------------------------------- |
| `semantic.success` | `#059669` | `#D1FAE5`       | Round confirmed, consensus reached, estimation complete   |
| `semantic.warning` | `#D97706` | `#FEF3C7`       | Timer running out, estimate variance high, pending action |
| `semantic.error`   | `#DC2626` | `#FEE2E2`       | Room closed, connection lost, authentication error        |
| `semantic.info`    | `#0284C7` | `#E0F2FE`       | New participant joined, round update, system notification |

### 3.5. Color Usage Rules — 60 / 30 / 10

```
┌─────────────────────────────────────────────────────────────┐
│ 60% NEUTRAL CANVAS & SURFACES                               │
│ Light Slate (#F8FAFC) & Pure White (#FFFFFF)                │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 30% STRUCTURAL DEPTH & TEXT                             │ │
│ │ Deep Navy (#0B1B3D), Slate 900 (#0F172A), Borders       │ │
│ │                                                         │ │
│ │ ┌─────────────────────────────────────────────────────┐ │ │
│ │ │ 10% FOCAL ACCENT                                    │ │ │
│ │ │ Cherry Blossom Magenta (#E31C79)                    │ │ │
│ │ └─────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3.6. State Behaviors

- **Hover (Primary CTA)**: Transition from `#E31C79` to `#CC196C` over 150ms.
- **Active (Pressed)**: Maintain `#CC196C` with micro-compression (`scale-[0.98]`).
- **Focus Ring**: Dual-ring: 2px White offset + 2px `#E31C79` solid boundary.
- **Disabled**: Surface `#E2E8F0`, text `#94A3B8`, border `#CBD5E1`, `cursor-not-allowed`.

### 3.7. Do / Don't

- ✅ **DO**: Reserve Magenta for items requiring immediate action (Submit Estimate, Reveal Cards, Create Room).
- ✅ **DO**: Use `#CC196C` for text hyperlinks on white backgrounds.
- ❌ **DON'T**: Use Magenta as a section background across dashboard cards.
- ❌ **DON'T**: Mix Magenta with warm reds or orange accents in the same visual group.
- ❌ **DON'T**: Use `#E31C79` for 12px or 14px body text (4.46:1 fails WCAG AA).

---

## 4. Typography System

### 4.1. Typefaces

- **Primary**: `Inter Variable` (`@fontsource-variable/inter`) — Open aperture, geometric, optimized for English & Vietnamese.
- **Monospace**: `JetBrains Mono Variable` (`@fontsource-variable/jetbrains-mono`) — Room Codes (PT-8492), Story Points, Jira Issue Keys (JIRA-1234), container IDs.

### 4.2. Type Scale

| Token          | Size             | Weight         | Line Height | Tracking | Usage                                    |
| :------------- | :--------------- | :------------- | :---------- | :------- | :--------------------------------------- |
| `display`      | 36px / 2.25rem   | Bold (700)     | 44px / 1.22 | -0.025em | Hero login title, marketing highlights   |
| `h1`           | 28px / 1.75rem   | SemiBold (600) | 36px / 1.28 | -0.020em | Dashboard and page titles                |
| `h2`           | 20px / 1.25rem   | SemiBold (600) | 28px / 1.40 | -0.015em | Panel headings, modal headers            |
| `h3`           | 16px / 1.00rem   | Medium (500)   | 24px / 1.50 | -0.010em | Card titles, group dividers              |
| `body`         | 14px / 0.875rem  | Regular (400)  | 20px / 1.43 | 0        | Standard data, descriptions, form inputs |
| `body.medium`  | 14px / 0.875rem  | Medium (500)   | 20px / 1.43 | 0        | Emphasized data, form labels             |
| `button`       | 14px / 0.875rem  | SemiBold (600) | 20px / 1.43 | +0.005em | Button labels, segmented controls        |
| `caption`      | 12px / 0.75rem   | Regular (400)  | 16px / 1.33 | +0.010em | Timestamps, metadata, helper text        |
| `table.header` | 12px / 0.75rem   | SemiBold (600) | 16px / 1.33 | +0.050em | Table column titles (**Uppercase**)      |
| `code.mono`    | 13px / 0.8125rem | Medium (500)   | 18px / 1.38 | +0.025em | Room Codes, Jira Keys, Story Points      |

### 4.3. Tailwind Mapping

| Level                  | Tailwind Classes                   | Usage                               |
| :--------------------- | :--------------------------------- | :---------------------------------- |
| Page Title             | `text-2xl sm:text-3xl font-bold`   | Top-level page headings             |
| Card/Modal Title       | `text-lg sm:text-xl font-semibold` | Panel and dialog headers            |
| Form Label / Buttons   | `text-sm font-medium`              | Interactive controls (minimum 14px) |
| Body                   | `text-sm sm:text-base`             | Standard content text               |
| Helper / Muted         | `text-xs sm:text-sm`               | Secondary descriptions              |
| Badges / Micro Caption | `text-[11px] sm:text-xs`           | Status badges only                  |

### 4.4. Rules

- **Uppercase enforced**: Table column headers, Room Codes, Jira Keys, status codes.
- **Tabular figures (`tnum`)**: Story Points, timer values, metrics, percentage values.
- **Line-length constraint**: Prose notes must not exceed 75 characters per line (`max-w-prose`).
- **Minimum 14px for form labels and buttons** — never use `text-xs` for interactive controls.
- **Icon-to-text size correlation**: 11-12px text → `size-3.5` icon; 14px → `size-4`; 16px → `size-4.5`/`size-5`.

---

## 5. Spacing System

8pt base with 4pt micro-step, aligned to Tailwind CSS:

| Token      | Value          | Application                                                     |
| :--------- | :------------- | :-------------------------------------------------------------- |
| `space-1`  | 4px / 0.25rem  | Icon-to-text gap, badge inner padding                           |
| `space-2`  | 8px / 0.50rem  | Label-to-input gap, compact table cell padding, button icon gap |
| `space-3`  | 12px / 0.75rem | Standard input horizontal padding, alert inner padding          |
| `space-4`  | 16px / 1.00rem | Standard table cell padding, card interior padding              |
| `space-6`  | 24px / 1.50rem | Card interior padding (spacious), grid gutter, form field gap   |
| `space-8`  | 32px / 2.00rem | Section vertical separation, dashboard widget gutters           |
| `space-10` | 40px / 2.50rem | Modal inner padding, header-to-content separation               |
| `space-12` | 48px / 3.00rem | Major workflow step separation, empty state breathing room      |

---

## 6. Layout & Grid

| Dimension                  | Value                                                                    |
| :------------------------- | :----------------------------------------------------------------------- |
| Max Application Width      | 1536px (`max-w-screen-2xl`) for admin; 1280px (`max-w-7xl`) for standard |
| Main Header Height         | 64px (`h-16`)                                                            |
| Top Utility Bar (Optional) | 36px (`h-9`) in Deep Navy                                                |
| Sidebar Width (Expanded)   | 260px (`w-64`)                                                           |
| Sidebar Width (Collapsed)  | 68px (`w-[68px]`)                                                        |
| Page Padding               | Mobile `px-4`, Tablet `px-6`, Desktop `px-8`                             |

### Responsive Breakpoints

| Breakpoint   | Media Query | Layout                                                   |
| :----------- | :---------- | :------------------------------------------------------- |
| Mobile (sm)  | < 640px     | Single column, drawer nav, sticky bottom actions         |
| Tablet (md)  | 640-1023px  | 2-column, icon-rail sidebar, horizontal scrolling tables |
| Desktop (lg) | 1024-1439px | 3-4 column, persistent sidebar, full data tables         |
| Large (2xl)  | ≥ 1440px    | Full 12-column grid (`gap-6`), max data density          |

---

## 7. Border Radius

Industrial, compact geometry reflecting container modularity:

| Token         | Value          | Components                                                      |
| :------------ | :------------- | :-------------------------------------------------------------- |
| `radius-none` | 0px            | Full-width table headers, banner notifications, sticky toolbars |
| `radius-sm`   | 4px / 0.25rem  | Checkboxes, status badges, micro-tooltips, code chips           |
| `radius-md`   | 6px / 0.375rem | **Standard buttons, text inputs, dropdown triggers**            |
| `radius-lg`   | 8px / 0.50rem  | **Cards, content panels, modal dialog containers**              |
| `radius-xl`   | 12px / 0.75rem | Floating command palettes (Cmd+K), spotlight cards              |
| `radius-full` | 9999px         | Milestone tracking dots, avatars, status pill tags              |

**Rule**: Never apply `radius-full` (pill shape) to standard inputs or primary form buttons. Keep at `radius-md` (6px).

**CSS Implementation**: `--radius: 0.5rem` (8px base) with multipliers:

- `--radius-sm`: `calc(var(--radius) * 0.5)` → 4px
- `--radius-md`: `calc(var(--radius) * 0.75)` → 6px
- `--radius-lg`: `var(--radius)` → 8px
- `--radius-xl`: `calc(var(--radius) * 1.5)` → 12px

---

## 8. Shadows & Elevation

Crisp elevation delineating layers without soft consumer-style blur:

| Token         | CSS Value                                                                         | Usage                                                 |
| :------------ | :-------------------------------------------------------------------------------- | :---------------------------------------------------- |
| `shadow-none` | none                                                                              | Standard table rows, flat cards with borders          |
| `shadow-sm`   | `0 1px 2px 0 rgba(15, 23, 42, 0.05)`                                              | Default metric cards, interactive list cards on hover |
| `shadow-md`   | `0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`    | Dropdown menus, datepickers, floating suggestions     |
| `shadow-lg`   | `0 10px 15px -3px rgba(15, 23, 42, 0.10), 0 4px 6px -4px rgba(15, 23, 42, 0.05)`  | Side sheets, detail drawers                           |
| `shadow-xl`   | `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)` | Modal dialogs, urgent alerts                          |

---

## 9. Iconography

- **Library**: Lucide React (standard with shadcn/ui)
- **Stroke**: Monoline, geometric, non-filled outline, uniform 2.0px (1.5px at 16px scale)
- **Color**: Inherit `currentColor`; `text-slate-500` idle, `#E31C79` active

| Size Token | Pixels | Usage                                            |
| :--------- | :----- | :----------------------------------------------- |
| `icon-xs`  | 12px   | Inline status dots, table sorting carets         |
| `icon-sm`  | 16px   | Input prefix icons, badge icons, table actions   |
| `icon-md`  | 20px   | Standard button icons, form validation icons     |
| `icon-lg`  | 24px   | Sidebar navigation items, card header indicators |
| `icon-xl`  | 32px   | Empty state illustrations, metric card anchors   |

**Button icon rules**: Leading icons have 8px (`space-2`) gap from label. Icon-only buttons maintain 1:1 ratio (`h-9 w-9`) with `aria-label`.

---

## 10. Component Design System

### Navigation

- **Header Bar**: Fixed 64px height, White surface, 1px bottom border (`border-slate-200`). Houses ONE logo, global search, and user profile.
- **Sidebar**: Navy (`#0B1B3D`) or White canvas. Items: 40px height, 12px padding, 6px radius. Active = left 3px Magenta border + `#FDF2F7` background.
- **Breadcrumbs**: 12px Regular, separated by ChevronRight (14px). Terminal leaf bold in Slate 900.

### Actions

- **Primary Button**: Magenta background, White text, 6px radius, hover `#CC196C`.
- **Secondary Button**: White surface, 1px Slate 300 border, Slate 700 text, hover Slate 50.
- **Ghost Button**: Transparent surface, Slate 600 text, hover Slate 100.
- **Icon Button**: Square 36×36px, centered Lucide icon, subtle hover highlight.

### Form Controls

- **Text Input**: Height 38px, Slate 300 border, 6px radius, 14px text. Focus: border `#E31C79` + matching 1px ring.
- **Select Dropdown**: Native wrapper with chevron. Popover `shadow-md`, 6px radius.
- **Checkbox & Radio**: 16×16px boundary. Checked = `#E31C79` background + white checkmark.
- **Switch Toggle**: 36×20px container. Active = `#E31C79`.

### Content Panels

- **Card**: White, 1px Slate 200 border, 8px radius, `p-6`, `shadow-sm`.
- **Tabs**: Underline style for page tabs (2px Magenta active); pill style for table-level filtering.
- **Accordion**: Clean single-line header with right-aligned chevron. 150ms ease expand.

### Feedback

- **Toast**: Bottom-right fixed. 4px left accent border matching semantic status. Auto-dismiss 4000ms.
- **Alert**: Full-width rounded card with subtle semantic background + leading icon.
- **Modal Dialog**: Centered, `max-w-[560px]`, 8px radius, `shadow-xl`, dimmed backdrop (`bg-slate-950/60`).

---

## 11. Button Guidelines

### Variants

| Variant     | Idle BG     | Idle Text | Border        | Hover                          | Focus (Keyboard)                |
| :---------- | :---------- | :-------- | :------------ | :----------------------------- | :------------------------------ |
| Primary     | `#E31C79`   | `#FFFFFF` | None          | BG `#CC196C`                   | Ring: 2px White + 2px `#E31C79` |
| Secondary   | `#FFFFFF`   | `#1E293B` | 1px `#CBD5E1` | BG `#F8FAFC`, border `#94A3B8` | Ring: 2px `#E2E8F0`             |
| Tertiary    | `#F1F5F9`   | `#0F172A` | None          | BG `#E2E8F0`                   | Ring: 2px `#CBD5E1`             |
| Ghost       | Transparent | `#475569` | None          | BG `#F1F5F9`, text `#0F172A`   | Ring: 2px `#CBD5E1`             |
| Destructive | `#DC2626`   | `#FFFFFF` | None          | BG `#B91C1C`                   | Ring: 2px `#DC2626`             |
| Icon Only   | Transparent | `#64748B` | None          | BG `#F1F5F9`, text `#0F172A`   | Ring: 2px `#CBD5E1`             |

### Sizing Scale

- **Small (sm)**: Height 32px (`h-8`), `px-3`, `text-xs`, `radius-md`.
- **Default**: Height 38px (`h-[38px]`), `px-4`, `text-sm`, `radius-md`.
- **Large (lg)**: Height 44px (`h-11`), `px-6`, `text-base`, `radius-md`.

---

## 12. Form Guidelines

```
┌─────────────────────────────────────────────────────────────┐
│ ROOM NAME *                                 [Optional Help] │ ← Label & Meta
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 🎯  Sprint Planning - Week 42                           │ │ ← 38px Input
│ └─────────────────────────────────────────────────────────┘ │
│ ℹ Name will be visible to all participants.                 │ ← Helper Text
└─────────────────────────────────────────────────────────────┘
```

- **Field height**: 38px fixed across all inputs, selects, and autocompletes.
- **Label**: 14px (`text-sm`), Medium, Slate 700 (`#334155`). Required fields show red asterisk.
- **Placeholder**: 14px Regular, Slate 400 (`#94A3B8`). **Never** substitute for visible labels.
- **Helper text**: 12px Regular, Slate 500, 4px top spacing.
- **Error state**: Border Red 600, focus ring Red 600, error message beneath with `AlertCircle` icon.
- **Success state**: 1px Emerald 600 border + trailing checkmark icon.

---

## 13. Table Guidelines (Virtual Data Table)

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│ [ Search rooms... ] [ Filter: All Decks ▼ ]                   [ Columns ] [ Export ]│
├──────────────┬───────────────┬──────────────┬──────────────┬─────────────┬───────────┤
│ ROOM CODE ↕  │ FACILITATOR   │ DECK         │ PARTICIPANTS │ STATUS      │ ACTIONS   │
├──────────────┼───────────────┼──────────────┼──────────────┼─────────────┼───────────┤
│ PT-8492      │ Hương Giang   │ Fibonacci    │ 8 members    │ ● ACTIVE    │ [Join]    │
│ PT-2201      │ Minh Tuấn     │ T-Shirt      │ 5 members    │ ● ESTIMATING│ [Join]    │
└──────────────┴───────────────┴──────────────┴──────────────┴─────────────┴───────────┘
```

- **Header row**: Height 36px, BG Slate 100 (`#F1F5F9`), `border-b` Slate 200. Text: 12px SemiBold, Uppercase, tracking `+0.05em`, Slate 600.
- **Body row**: Height 44px (`h-11`). Alternating White / Slate 50. Hover `#F8FAFC`. Selected `#FDF2F7` (magenta tint).
- **Sticky columns**: First column (Room Code) pinned on horizontal scroll (`sticky left-0 bg-inherit shadow-[1px_0_0_#E2E8F0]`).
- **Data alignment**: Left = IDs, names, descriptions. Center = flags, status badges, deck types. Right = participant counts, timestamps, metrics.
- **Empty state**: 240px centered block. Outline icon, clear "No Rooms Found" header, "Clear Filters" secondary button.

---

## 14. Status System

Status badges: 22px height, 4px border radius, leading 6px circular indicator dot.

| Status     | Badge BG  | Badge Text | Dot Color | Icon          | Scenario                                 |
| :--------- | :-------- | :--------- | :-------- | :------------ | :--------------------------------------- |
| Active     | `#D1FAE5` | `#065F46`  | `#059669` | CheckCircle2  | Room open, accepting participants        |
| Estimating | `#E0F2FE` | `#075985`  | `#0284C7` | Navigation    | Round in progress, cards being played    |
| Warning    | `#FEF3C7` | `#92400E`  | `#D97706` | AlertTriangle | Timer low, high variance, pending action |
| Error      | `#FEE2E2` | `#991B1B`  | `#DC2626` | XCircle       | Connection lost, room expired, error     |
| Pending    | `#F1F5F9` | `#475569`  | `#64748B` | Clock         | Waiting for facilitator action           |
| Completed  | `#ECFDF5` | `#047857`  | `#10B981` | PackageCheck  | Round complete, consensus reached        |
| Cancelled  | `#F3F4F6` | `#374151`  | `#9CA3AF` | Slash         | Room closed or cancelled                 |

---

## 15. Card Guidelines

- **Standard Content Card**: White, 1px Slate 200 border, 8px radius, 24px padding (`p-6`), `shadow-sm`.
- **Metric / KPI Card**: White, 16px padding (`p-4`), 6px radius. 12px uppercase label, 28px bold tabular value, 2px top accent line (Navy, Magenta, Emerald, or Amber).
- **Interactive List Card**: White, 1px Slate 200 border. Hover: `border-slate-400` + `shadow-md` within 150ms.
- **The Container Frame**: Cards with `.card-container-frame` (3px Magenta top border) for important data sections.
- **Constraint**: Do **not** nest cards inside other cards. Use `border-t border-slate-100` dividers within a single card.

---

## 16. Motion & Animation

### Timing Scale

| Speed    | Duration | Easing                          | Usage                                            |
| :------- | :------- | :------------------------------ | :----------------------------------------------- |
| Fast     | 100ms    | `ease-out`                      | Micro-interactions, checkbox ticks, button press |
| Normal   | 150ms    | `cubic-bezier(0.16, 1, 0.3, 1)` | Dropdowns, hover transitions, tab slides         |
| Standard | 200ms    | `cubic-bezier(0.16, 1, 0.3, 1)` | Modals, drawer expansions                        |
| Page     | 150ms    | opacity crossfade               | Route transitions (no lateral movement)          |

### Framer Motion Config

```ts
export const transitionFast = { duration: 0.15, ease: [0.16, 1, 0.3, 1] };

export const modalMotion = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.98 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const tableRowStagger = {
  animate: { transition: { staggerChildren: 0.02 } },
};
```

---

## 17. Responsive Design

### Table Transformation (Mobile < 640px)

Complex tables collapse into vertical summary cards. Top row: Room Code + status badge. Body: Facilitator, Deck, participant count. Footer: expand toggle for full details.

### Touch Optimization

All interactive targets expand to minimum 44×44px on < 640px, using invisible padding (`p-2 -m-2`).

### Sticky Bottom Sheets

Room action triggers (Reveal Cards, Next Story) move to fixed bottom bars on mobile.

---

## 18. Accessibility — WCAG 2.1 AA

### Contrast Compliance

| Pairing            | Ratio   | Requirement                              |
| :----------------- | :------ | :--------------------------------------- |
| `#CC196C` on White | 5.35:1  | ✅ AA normal text                        |
| `#E31C79` on White | 4.46:1  | ✅ AA large text (≥18px/bold ≥14px) only |
| `#0B1B3D` on White | 16.94:1 | ✅ AAA                                   |

### Focus Indicators

Every interactive element: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E31C79] focus-visible:ring-offset-2 focus-visible:ring-offset-white`.

### Screen Reader

- Status dots: `<span className="sr-only">Status: Estimating</span>`
- Room codes: `aria-label="Room Code: PT-8492"`

---

## 19. Dark Mode Palette

| Token               | Light Value | Dark Value | Notes                                |
| :------------------ | :---------- | :--------- | :----------------------------------- |
| `background.canvas` | `#F8FAFC`   | `#090D16`  | Obsidian — eliminates blinding light |
| `surface.card`      | `#FFFFFF`   | `#111827`  | Slate 900                            |
| `surface.elevated`  | `#FFFFFF`   | `#1F2937`  | Slate 800 for modals/dropdowns       |
| `border.subtle`     | `#E2E8F0`   | `#1F2937`  | Low-contrast boundaries              |
| `text.primary`      | `#0F172A`   | `#F8FAFC`  | High contrast on dark                |
| `text.secondary`    | `#475569`   | `#94A3B8`  | Slate 400 descriptions               |
| `brand.primary`     | `#E31C79`   | `#E31C79`  | Maintained (4.71:1 on dark)          |
| `text.link.magenta` | `#CC196C`   | `#F472B6`  | Pink 400 — 6.8:1 on `#111827`        |

**Rule**: Never invert automatically. Dark surfaces use cool obsidian-navy tones, never pure black (`#000000`).

---

## 20. Page Composition Blueprints

### 1. Enterprise Auth Portal (ONE Enterprise Auth Portal)

50/50 split screen. Left: Full-bleed ONE container vessel photo under Deep Navy gradient with official wordmark + "AS ONE, WE CAN". Right: White canvas, centered form (max-w 420px), email/password fields, primary Magenta login button. Bottom: Seigaiha wave band.

### 2. Admin Dashboard (ONE Admin Portal)

Persistent 260px sidebar, 64px top bar, scrollable body. 4-card metric strip, hero greeting banner, activity charts, high-density account/room data table.

### 3. Scrum Poker Room (Room Canvas Shell)

Fullscreen canvas (`@xyflow/react`). Central Table Arena Node with topic and round status. Participant Nodes positioned around the table. Bottom Unified Deck Dock for card selection + facilitator controls.

---

## 21. Graphic Signatures

### Container Frame

Cards using `.card-container-frame` class: 3px Magenta top border, subtle hover shadow. Applied to important metric cards and data sections.

### Seigaiha Wave Pattern

`.bg-seigaiha`: Traditional Japanese concentric wave SVG at 3-5% opacity. Used on headers, loading states, auth page decorations.

### ISO Corrugated Texture

`.bg-corrugated`: Subtle vertical parallel lines (8px apart, 4% opacity) reminiscent of container walls. Used on summary panels, empty states.

### Forbidden Graphic Styles

- ❌ NO cartoonish mascots or 3D renderings (except approved Thinking Mascots in rooms)
- ❌ NO skewed neon gradients across UI components
- ❌ NO realistic cherry blossom illustrations on functional B2B screens
- ❌ NO multi-color gradient buttons

---

## 22. Do / Don't Matrix

| #   | Category       | ✅ DO                                                      | ❌ DON'T                                     |
| :-- | :------------- | :--------------------------------------------------------- | :------------------------------------------- |
| 01  | Brand Magenta  | Use as accent for actions, badges, active nav              | Use as background for pages, cards, alerts   |
| 02  | Text Contrast  | Use `#CC196C` for text links on white (5.35:1)             | Use `#E31C79` for 12-14px body text (4.46:1) |
| 03  | Surfaces       | Build on White + Slate 50 neutral backgrounds              | Use saturated colorful card surfaces         |
| 04  | Typography     | Inter + Tabular Figures for data, JetBrains Mono for codes | Serif, cursive, or playful typefaces         |
| 05  | Room Codes     | Format in Monospace Uppercase (PT-8492)                    | Proportional lowercase codes                 |
| 06  | Button Styling | Magenta primary, white text, 6px radius                    | Rounded pill buttons, multi-color gradients  |
| 07  | Table Rows     | 40-44px compact rows                                       | 60px+ tall consumer-style rows               |
| 08  | Sticky Columns | Pin first identification column                            | Let key identifiers scroll away              |
| 09  | Status Badges  | Pair color with text label + Lucide icon                   | Rely on color dots alone                     |
| 10  | Motion         | 100-200ms functional transitions                           | Bouncy spring or >300ms fades                |
| 11  | Modals         | Reserve for critical confirmations                         | Stack modals on modals                       |
| 12  | Form Labels    | Keep visible above inputs with helper text                 | Use placeholder as only label                |
| 13  | Elevation      | Flat borders + subtle `shadow-sm`                          | Heavy blurred drop shadows                   |
| 14  | Focus Rings    | 2px Magenta ring with offset                               | Strip default focus outlines                 |
| 15  | Iconography    | Monoline 2.0px Lucide icons consistently                   | Mix solid + outline icons                    |
| 16  | Mobile Layout  | Adapt tables into summary cards                            | Shrink tables to unreadable                  |
| 17  | Imagery        | Sharp maritime photos of real ONE assets                   | Generic corporate stock photos               |
| 18  | Floral Decor   | Abstract Seigaiha wave patterns                            | Realistic cherry blossom illustrations       |

---

## 23. AI Agent Instructions

```
INSTRUCTION SET: Generate modern enterprise B2B web application UI for Pointify Scrum Poker
under the Ocean Network Express (ONE) brand identity.

- PALETTE: 85% neutral canvas (White #FFFFFF + Slate 50 #F8FAFC), subtle borders #E2E8F0
- STRUCTURE: Deep Navy #0B1B3D for sidebar, headers, structural anchors
- ACCENT: ONE Cherry Blossom Magenta #E31C79 strictly for primary CTA, active nav, status pulses
  Use #CC196C for text links on light surfaces (WCAG AA)
- TYPOGRAPHY: Inter (sans-serif) for all UI. JetBrains Mono uppercase for Room Codes, Story Points
- GEOMETRY: 6px radius (inputs/buttons), 8px (cards/modals), 4px (badges). Never pill buttons
- DATA: 44px table rows, 36px headers. Compact, scannable, with clear status badges
- MOTION: 100ms micro / 150ms dropdowns / 200ms modals / cubic-bezier(0.16, 1, 0.3, 1)
- AVOID: Purple SaaS accents, bouncy animations, floating shapes, realistic cherry blossoms,
  full-bleed magenta backgrounds
```

---

## 24. Machine-Readable Design Tokens

```yaml
color:
  brand:
    primary: { value: '#E31C79', type: 'color', description: 'Official Pantone 213 C' }
    primary_hover: { value: '#CC196C', type: 'color', description: 'WCAG AA 5.35:1 on white' }
    primary_subtle: { value: '#FDF2F7', type: 'color' }
    secondary: { value: '#0B1B3D', type: 'color', description: 'Deep Navy structural anchor' }
    secondary_hover: { value: '#162E61', type: 'color' }
  neutral:
    canvas: { value: '#F8FAFC', type: 'color' }
    surface: { value: '#FFFFFF', type: 'color' }
    border_subtle: { value: '#E2E8F0', type: 'color' }
    border_strong: { value: '#CBD5E1', type: 'color' }
    divider: { value: '#F1F5F9', type: 'color' }
  text:
    primary: { value: '#0F172A', type: 'color' }
    secondary: { value: '#475569', type: 'color' }
    muted: { value: '#64748B', type: 'color' }
    disabled: { value: '#94A3B8', type: 'color' }
    link_magenta: { value: '#CC196C', type: 'color' }
  semantic:
    success: { value: '#059669', type: 'color' }
    success_bg: { value: '#D1FAE5', type: 'color' }
    warning: { value: '#D97706', type: 'color' }
    warning_bg: { value: '#FEF3C7', type: 'color' }
    error: { value: '#DC2626', type: 'color' }
    error_bg: { value: '#FEE2E2', type: 'color' }
    info: { value: '#0284C7', type: 'color' }
    info_bg: { value: '#E0F2FE', type: 'color' }

typography:
  fontFamily:
    sans: { value: "'Inter Variable', sans-serif", type: 'fontFamilies' }
    mono: { value: "'JetBrains Mono Variable', monospace", type: 'fontFamilies' }
  fontSize:
    display: { value: '36px', type: 'fontSizes' }
    h1: { value: '28px', type: 'fontSizes' }
    h2: { value: '20px', type: 'fontSizes' }
    h3: { value: '16px', type: 'fontSizes' }
    body: { value: '14px', type: 'fontSizes' }
    caption: { value: '12px', type: 'fontSizes' }
    code: { value: '13px', type: 'fontSizes' }

spacing:
  1: { value: '4px', type: 'spacing' }
  2: { value: '8px', type: 'spacing' }
  3: { value: '12px', type: 'spacing' }
  4: { value: '16px', type: 'spacing' }
  6: { value: '24px', type: 'spacing' }
  8: { value: '32px', type: 'spacing' }
  12: { value: '48px', type: 'spacing' }

borderRadius:
  sm: { value: '4px', type: 'borderRadius' }
  md: { value: '6px', type: 'borderRadius' }
  lg: { value: '8px', type: 'borderRadius' }
  xl: { value: '12px', type: 'borderRadius' }
  full: { value: '9999px', type: 'borderRadius' }

shadow:
  sm: { value: '0 1px 2px 0 rgba(15, 23, 42, 0.05)', type: 'boxShadow' }
  md: { value: '0 4px 6px -1px rgba(15, 23, 42, 0.08)', type: 'boxShadow' }
  lg: { value: '0 10px 15px -3px rgba(15, 23, 42, 0.10)', type: 'boxShadow' }
  xl: { value: '0 20px 25px -5px rgba(15, 23, 42, 0.12)', type: 'boxShadow' }

motion:
  duration_fast: { value: '100ms', type: 'time' }
  duration_normal: { value: '150ms', type: 'time' }
  duration_slow: { value: '200ms', type: 'time' }
  easing_standard: { value: 'cubic-bezier(0.16, 1, 0.3, 1)', type: 'cubicBezier' }
```
