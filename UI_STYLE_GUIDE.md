# Locanote UI/UX Style Guide 2024-2025

A comprehensive design system based on patterns from Notion, Linear, Vercel, Figma, Apple Design, and Supabase.

---

## 1. Color System

### Dark Mode Best Practices (Linear-inspired)

```css
/* Modern Dark Mode Palette */
--bg-primary: #0a0a0a;        /* Deepest background */
--bg-secondary: #111111;    /* Card/surface background */
--bg-tertiary: #1a1a1a;     /* Elevated surfaces */
--bg-quaternary: #222222;   /* Hover states */

/* Text Colors - High Contrast */
--text-primary: #ffffff;           /* Primary text - 100% white */
--text-secondary: #a1a1aa;         /* Muted text - zinc-400 */
--text-tertiary: #71717a;        /* Subtle text - zinc-500 */
--text-disabled: #52525b;        /* Disabled text - zinc-600 */

/* Semantic Colors */
--color-border: rgba(255, 255, 255, 0.08);      /* Subtle borders */
--color-border-hover: rgba(255, 255, 255, 0.15); /* Hover borders */
--color-divider: rgba(255, 255, 255, 0.06);     /* Dividers */

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
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
             "Helvetica Neue", Arial, sans-serif;
--font-mono: "SF Mono", SFMono-Regular, ui-monospace, 
             "Cascadia Code", "Source Code Pro", Menlo, monospace;
```

### Type Scale

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| Display | 2.5rem (40px) | 800 | 1.1 | -0.02em | Page titles |
| H1 | 2rem (32px) | 700 | 1.2 | -0.02em | Section headers |
| H2 | 1.5rem (24px) | 600 | 1.3 | -0.01em | Card titles |
| H3 | 1.25rem (20px) | 600 | 1.4 | 0 | Subsection |
| Body | 0.9375rem (15px) | 400 | 1.6 | 0 | Paragraphs |
| Small | 0.875rem (14px) | 400 | 1.5 | 0 | Secondary text |
| Caption | 0.75rem (12px) | 500 | 1.4 | 0.05em | Labels, uppercase |
| Tiny | 0.6875rem (11px) | 500 | 1.4 | 0.05em | Timestamps |

### Typography Patterns

```css
/* Current Locanote has good patterns - refine them: */
.tracking-tight { letter-spacing: -0.02em; }
.tracking-wide { letter-spacing: 0.05em; }

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

| Token | Value | Usage |
|-------|-------|-------|
| space-1 | 4px | Tight gaps |
| space-2 | 8px | Icon gaps |
| space-3 | 12px | Small padding |
| space-4 | 16px | Standard padding |
| space-5 | 20px | Card padding |
| space-6 | 24px | Section gaps |
| space-8 | 32px | Large gaps |
| space-10 | 40px | Page padding |
| space-12 | 48px | Section breaks |

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

### Glassmorphism (Vercel-inspired)

```css
.glass {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.15);
}
```

---

## 5. Border Radius System

```css
/* Refined radius scale */
--radius-sm: 6px;     /* Small elements: tags, badges */
--radius-md: 8px;     /* Buttons, inputs */
--radius-lg: 12px;    /* Cards, modals */
--radius-xl: 16px;    /* Large cards, containers */
--radius-2xl: 24px;   /* Hero sections */
--radius-full: 9999px;/* Pills, avatars */
```

---

## 6. Interactive Elements

### Buttons (Supabase-inspired)

```css
/* Base button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

/* Primary Button */
.btn-primary {
  background: var(--brand-color);
  color: white;
  padding: 10px 16px;
  font-size: 0.9375rem;
}

.btn-primary:hover {
  background: var(--brand-color-hover);
  transform: translateY(-1px);
  box-shadow: var(--glow-primary);
}

.btn-primary:active {
  transform: translateY(0);
}

/* Secondary Button */
.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border: 1px solid var(--color-border);
}

.btn-secondary:hover {
  background: var(--bg-quaternary);
  border-color: var(--color-border-hover);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

/* Danger Button */
.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn-danger:hover {
  background: rgba(239, 68, 68, 0.2);
}
```

### Form Inputs (Notion-inspired)

```css
.input {
  width: 100%;
  padding: 10px 12px;
  font-size: 0.9375rem;
  background: var(--bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.input:hover {
  border-color: var(--color-border-hover);
}

.input:focus {
  outline: none;
  border-color: var(--brand-color);
  box-shadow: 0 0 0 3px rgba(var(--brand-rgb), 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}

/* Labels */
.input-label {
  display: block;
  margin-bottom: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* Error state */
.input-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.input-error:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}
```

---

## 7. Card Design (Notion + Figma)

```css
/* Standard Card */
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: 20px;
  transition: all 0.2s ease;
}

.card:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Elevated Card (for featured items) */
.card-elevated {
  background: var(--bg-tertiary);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.card-elevated:hover {
  box-shadow: var(--shadow-lg);
}

/* Note Card (Locanote-specific) */
.note-card {
  position: relative;
  cursor: pointer;
  min-height: 140px;
  display: flex;
  flex-direction: column;
}

.note-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  pointer-events: none;
}

/* Current themed-card enhancement suggestions */
.themed-card-v2 {
  background-color: var(--ui-surface);
  border: 1px solid var(--ui-border);
  backdrop-filter: blur(var(--ui-blur));
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.themed-card-v2:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

---

## 8. Navigation Patterns

### App Header (Vercel-inspired)

```css
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(17, 17, 17, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

/* Logo styling */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--brand-color), var(--brand-color-hover));
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### Sidebar Navigation

```css
.sidebar {
  width: 240px;
  padding: 16px 12px;
  border-right: 1px solid var(--color-border);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.9375rem;
  transition: all 0.15s ease;
}

.nav-item:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--bg-quaternary);
  color: var(--text-primary);
}
```

---

## 9. Animation & Transitions

### Standard Durations

```css
--duration-instant: 100ms;   /* Hover states */
--duration-fast: 150ms;       /* Micro-interactions */
--duration-normal: 200ms;     /* Standard transitions */
--duration-slow: 300ms;       /* Page transitions */
--duration-slower: 500ms;     /* Complex animations */
```

### Easing Functions

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Key Animations

```css
/* Card hover lift */
@keyframes card-lift {
  from {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
  }
  to {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}

/* Fade in up (for lists) */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse (for loading) */
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Spin (for loading spinner) */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

---

## 10. Modal & Overlay Design

```css
/* Backdrop */
.modal-backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* Modal container */
.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  max-height: 90vh;
  overflow: hidden;
}

/* Modal animations */
.modal-enter {
  animation: modal-in 0.2s ease-out;
}

@keyframes modal-in {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

---

## 11. Specific Recommendations for Locanote

### Current Strengths to Keep:
1. CSS variable theming system
2. Multiple visual themes (glass, cyberpunk, inception)
3. Accent color customization
4. Responsive grid layouts
5. Mobile floating action buttons

### Areas for Enhancement:

#### A. Refine Color System
- Update dark mode backgrounds to use the 4-layer system
- Make borders more subtle (8% opacity vs current ~20%)
- Add text hierarchy with proper contrast ratios

#### B. Improve Card Design
```css
/* Replace current themed-card with: */
.card-modern {
  background: var(--bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: all 0.2s var(--ease-out);
}

.card-modern:hover {
  border-color: var(--color-border-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
```

#### C. Button Polish
- Add subtle scale transforms on hover
- Use consistent padding (10px 16px for standard)
- Add glow effect to primary buttons

#### D. Input Focus States
```css
.input-enhanced:focus {
  outline: none;
  border-color: var(--brand-color);
  box-shadow: 0 0 0 3px rgba(var(--brand-rgb), 0.15);
}
```

#### E. Typography Refinement
- Use tighter letter-spacing on headings (-0.02em)
- Add proper font-weight hierarchy (400, 500, 600, 700)
- Ensure sufficient contrast for all text levels

#### F. Loading States
- Use consistent spinner component
- Add skeleton screens for better perceived performance
- Implement staggered animations for list items

#### G. Empty States
- Use centered, calming illustrations
- Clear call-to-action buttons
- Reassuring microcopy about encryption

---

## 12. Implementation Priority

### High Priority (Immediate Impact):
1. Update dark mode color palette for better depth
2. Refine card hover effects with subtle lift
3. Add focus ring styles to all interactive elements
4. Standardize button sizes and padding

### Medium Priority (Polish):
1. Implement staggered list animations
2. Add skeleton loading states
3. Refine typography scale
4. Improve modal transitions

### Low Priority (Nice to Have):
1. Custom scrollbars matching theme
2. Advanced micro-interactions
3. Sound feedback (optional)
4. Advanced glassmorphism effects

---

## 13. Accessibility Guidelines

- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Focus visible on all interactive elements
- Reduced motion support: `@media (prefers-reduced-motion: reduce)`
- Keyboard navigation support
- Screen reader friendly labels and ARIA attributes

---

*This style guide synthesizes best practices from industry-leading applications while maintaining Locanote's unique visual identity and existing theming system.*
