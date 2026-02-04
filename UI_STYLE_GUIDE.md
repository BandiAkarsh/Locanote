# Locanote UI/UX Style Guide 2024-2025

A comprehensive design system based on patterns from Notion, Linear, Vercel, Figma, Apple Design, and Supabase.

---

## 1. Color System

### Dark Mode Best Practices (Linear-inspired)

```css
/* Modern Dark Mode Palette */
--bg-primary: #0a0a0a; /* Deepest background */
--bg-secondary: #111111; /* Card/surface background */
--bg-tertiary: #1a1a1a; /* Elevated surfaces */
--bg-quaternary: #222222; /* Hover states */

/* Text Colors - High Contrast */
--text-primary: #ffffff; /* Primary text - 100% white */
--text-secondary: #a1a1aa; /* Muted text - zinc-400 */
--text-tertiary: #71717a; /* Subtle text - zinc-500 */
--text-disabled: #52525b; /* Disabled text - zinc-600 */

/* Semantic Colors */
--color-border: rgba(255, 255, 255, 0.08); /* Subtle borders */
--color-border-hover: rgba(255, 255, 255, 0.15); /* Hover borders */
--color-divider: rgba(255, 255, 255, 0.06); /* Dividers */

/* Accent Colors (Keep existing vibrant accents) */
--brand-primary: var(--brand-color);
--brand-secondary: var(--brand-color-hover);
--brand-glow: rgba(var(--brand-rgb), 0.3);
```

### Light Mode

```css
--bg-primary: #ffffff;
--bg-secondary: #fafafa;
--bg-tertiary: #f4f4f5;
--bg-quaternary: #e4e4e7;

--text-primary: #09090b;
--text-secondary: #52525b;
--text-tertiary: #71717a;
--text-disabled: #a1a1aa;

--color-border: rgba(0, 0, 0, 0.08);
--color-border-hover: rgba(0, 0, 0, 0.15);
```

---

## 2. Typography System

### Font Stack (Apple-inspired)

```css
--font-sans:
  -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
  Arial, sans-serif;
--font-mono:
  "SF Mono", SFMono-Regular, ui-monospace, "Cascadia Code", "Source Code Pro",
  Menlo, monospace;
```

### Type Scale

| Style   | Size             | Weight | Line Height | Letter Spacing | Usage             |
| ------- | ---------------- | ------ | ----------- | -------------- | ----------------- |
| Display | 2.5rem (40px)    | 800    | 1.1         | -0.02em        | Page titles       |
| H1      | 2rem (32px)      | 700    | 1.2         | -0.02em        | Section headers   |
| H2      | 1.5rem (24px)    | 600    | 1.3         | -0.01em        | Card titles       |
| H3      | 1.25rem (20px)   | 600    | 1.4         | 0              | Subsection        |
| Body    | 0.9375rem (15px) | 400    | 1.6         | 0              | Paragraphs        |
| Small   | 0.875rem (14px)  | 400    | 1.5         | 0              | Secondary text    |
| Caption | 0.75rem (12px)   | 500    | 1.4         | 0.05em         | Labels, uppercase |
| Tiny    | 0.6875rem (11px) | 500    | 1.4         | 0.05em         | Timestamps        |

### Typography Patterns

```css
/* Current Locanote has good patterns - refine them: */
.tracking-tight {
  letter-spacing: -0.02em;
}
.tracking-wide {
  letter-spacing: 0.05em;
}

/* Labels - All caps, wide tracking */
.label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-tertiary);
}
```

---

## 3. Spacing System (8pt Grid)

### Base Scale

| Token    | Value | Usage            |
| -------- | ----- | ---------------- |
| space-1  | 4px   | Tight gaps       |
| space-2  | 8px   | Icon gaps        |
| space-3  | 12px  | Small padding    |
| space-4  | 16px  | Standard padding |
| space-5  | 20px  | Card padding     |
| space-6  | 24px  | Section gaps     |
| space-8  | 32px  | Large gaps       |
| space-10 | 40px  | Page padding     |
| space-12 | 48px  | Section breaks   |

### Layout Spacing

```css
/* Page layout */
.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
}

@media (min-width: 640px) {
  .page-container {
    padding: 32px 24px;
  }
}

/* Card spacing */
.card {
  padding: 20px; /* 16px on mobile */
}

/* Grid gaps */
.grid-standard {
  gap: 16px; /* 12px mobile, 24px desktop */
}
```

---

## 4. Shadows & Depth

### Elevation System (Linear-inspired)

```css
/* Layered shadows for depth */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);

/* Dark mode enhanced shadows */
.dark {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6);
}

/* Colored glow for primary actions */
--glow-primary: 0 0 20px -5px var(--brand-color);
--glow-subtle: 0 0 15px -3px rgba(255, 255, 255, 0.1);
```

### Glassmorphism 2.0 (Vercel + Linear-inspired)

```css
/* Standard Glass */
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* High-Fidelity Glass (2026 standard) */
.glass-2 {
  background: rgba(var(--accent-liquid-rgb), 0.05);
  backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
}
```

---

## 5. Border Radius System

```css
/* Refined radius scale for ultra-modern "round" aesthetics */
--radius-sm: 8px; /* Small elements: tags, badges */
--radius-md: 12px; /* Buttons, inputs */
--radius-lg: 16px; /* Cards */
--radius-xl: 24px; /* Modals, search bars */
--radius-2xl: 3.5rem; /* Hero sections, large portals */
--radius-full: 9999px; /* Pills, avatars */
```

---

## 6. Generative UI (GenUI) Components

GenUI components (Atoms) are designed to be "snapped" into the interface based on user intent.

### GenUI Principles:

1. **Contextual Presence**: Only appear when matched intent (e.g., Recipe, Code) is detected.
2. **Atmospheric Coherence**: Must match the current performance tier (avoiding blurs on Low tier).
3. **Immersive Feedback**: Use micro-animations (`ease-spring`) when morphing into existence.

### Example: Intent Snap-in

```svelte
<div in:fly={{ x: 30, duration: 800 }} class="intent-atom">
  <CustomTool {editor} />
</div>
```

---

## 7. Interactive Elements

### Buttons (Supabase + Apple-inspired)

```css
/* Success Variant (New) */
.btn-success {
  background: #10b981;
  color: white;
  box-shadow: 0 0 20px -5px rgba(16, 185, 129, 0.4);
}

.btn-success:hover {
  background: #059669;
  transform: scale(1.05);
}
```

### Form Inputs (Security-Hardened)

All inputs must be wrapped in a `<form>` element to ensure browser autocomplete and password manager compatibility.

```html
<form onsubmit="{(e)" ="">
  e.preventDefault()}>
  <input type="password" autocomplete="current-password" />
</form>
```

---

## 8. Atmospheric Engines (Visual Tiering)

Visual fidelity is dynamic, powered by **PerformanceScout**.

| Tier       | Effects Enabled                         | Description                               |
| ---------- | --------------------------------------- | ----------------------------------------- |
| **High**   | Nebula Canvas, Blur (40px), Transitions | Full-fidelity liquid experience.          |
| **Medium** | Aura SVG, Blur (20px), Transitions      | Balanced experience for standard laptops. |
| **Low**    | Static Colors, No Blur, No Transitions  | Maximum speed for budget/mobile hardware. |

---

## 9. Animation & Transitions

### Shared Element Transitions

We use `view-transition-name` to physically link elements across routes.

```css
/* Card to Editor Title Transition */
h1 {
  view-transition-name: note-title-abc-123;
}
```

---

## 10. Specific Recommendations for Locanote

### Current Strengths to Keep:

1. Svelte 5 Runes for ultra-low overhead reactivity.
2. 100% strict TypeScript coverage for note IDs and user sessions.
3. Accessible `autofocus` patterns using `svelte-ignore` with clear UX justification.

### Areas for Enhancement:

- **Skeleton States**: Add SVG-based shimmering skeletons for initial IndexedDB load.
- **Micro-haptics**: Add device vibration feedback on successful "Portal Lock" (Mobile).

---

## 11. Quality Verification Policy

Every UI change must pass:

1. **`svelte-check`**: 0 errors/warnings.
2. **Deep Scan**: Full Playwright interaction suite.
3. **Accessibility Audit**: ARIA labels on all custom buttons.

---

_This style guide reflects the Locanote 2026 Production Standard._
