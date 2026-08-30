# 0004. Brand Identity, Monogram Iconography, and Logo System

## Context
Pointify is a real-time collaborative Scrum Poker application. Previously, the application utilized temporary generic placeholder icons (e.g., Lucide `Layers`) and lacked an authoritative, memorable brand visual identity and dedicated high-resolution favicon for browser tabs and web application discovery.

## Decision
1. **Monogram 'P' with Agile Poker Metaphor**:
   - The logo mark is designed around the letter **'P'** composed of **Dual Overlapping Cards** (Lá bài xếp lớp) representing Scrum estimation decks.
   - The vertical stem represents a standing Agile Poker card.
   - The curved loop represents an overlapping card layer.
   - In the focal center of the loop sits a glowing **Estimation Point** (Điểm ước lượng), symbolizing consensus, story points, and precision.

2. **Cyan-to-Royal-Indigo Dynamic Gradient Palette**:
   - Primary stem: `#06B6D4` (Cyan) ➔ `#3B82F6` (Royal Blue) ➔ `#6366F1` (Indigo).
   - Card loop: `#38BDF8` ➔ `#6366F1` ➔ `#8B5CF6` (Violet).
   - Glow accent: High-luminance `#38BDF8` with white specular highlight.
   - Conveys high-tech reliability, modern glassmorphic depth, and seamless harmony with both Light and Dark modes.

3. **Multi-tier Vector Architecture (`<Logo />` Component)**:
   - **`favicon.svg`**: Standalone, lightweight vector graphic optimized for crisp rendering at all screen densities (16x16 up to 512x512).
   - **`src/components/Logo.tsx`**: Modular React component supporting:
     - Variants: `full` (Icon + Wordmark + Subtitle Badge), `icon` (standalone monogram mark), `wordmark` (pure typography).
     - Preset sizes: `sm`, `md`, `lg`, `xl` and custom pixel dimensions.
     - Micro-interactions: Subtle scale & glow animations on hover.
   - Replaces all placeholder branding across Root Layout Header, Footer, and web metadata.

## Consequences
- Establishes a cohesive, unique brand recognition for Pointify across web tabs, headers, and UI components.
- Retains pure vector SVG rendering with zero external image requests, zero pixelation, and minimal bundle impact.
- Complies with domain modeling guidelines and Agile Scrum Poker vocabulary.
