# Locanote Design System - 2026 Neo-Minimalist

> **Version**: 1.0  
> **Last Updated**: February 2026  
> **Philosophy**: Warm, inviting minimalism with purposeful motion

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing](#spacing)
5. [Components](#components)
6. [Animations](#animations)
7. [Accessibility](#accessibility)
8. [Responsive Design](#responsive-design)

---

## Design Philosophy

Locanote embraces **neo-minimalism** - a design approach that values:

- **Warmth over cold sterility**: Off-whites (#FAFAF8) instead of gray
- **Breathing room**: Generous whitespace and 720px max content width
- **Subtle depth**: Shadows for elevation, not borders
- **Purposeful motion**: Micro-interactions at 200-300ms
- **Semantic dark mode**: Thoughtful dark palette (#0F0F0F), not just inversion

### Key Principles

1. **Distraction-free writing**: Interface gets out of the way
2. **Progressive disclosure**: Show only what's needed
3. **Consistent feedback**: Every action has a visual response
4. **Accessible by default**: WCAG 2.1 AA compliance

---

## Color System

### Light Mode

| Token                 | Value                    | Usage                    |
| --------------------- | ------------------------ | ------------------------ |
| `--nm-bg-primary`     | `#FAFAF8`                | Main background          |
| `--nm-bg-secondary`   | `#F5F5F3`                | Sidebar, secondary areas |
| `--nm-bg-tertiary`    | `#EFEFED`                | Hover states, dividers   |
| `--nm-bg-elevated`    | `#FFFFFF`                | Cards, modals, inputs    |
| `--nm-text-primary`   | `#1A1A1A`                | Headings, primary text   |
| `--nm-text-secondary` | `#6B6B6B`                | Body text                |
| `--nm-text-tertiary`  | `#9CA3AF`                | Placeholders, hints      |
| `--nm-text-muted`     | `#A1A1A1`                | Disabled, captions       |
| `--nm-accent`         | `#2563EB`                | Primary actions, links   |
| `--nm-accent-hover`   | `#1D4ED8`                | Hover state              |
| `--nm-accent-subtle`  | `rgba(37, 99, 235, 0.1)` | Subtle backgrounds       |
| `--nm-border`         | `#E5E5E5`                | Borders, dividers        |
| `--nm-success`        | `#10B981`                | Success states           |
| `--nm-error`          | `#EF4444`                | Error states             |
| `--nm-warning`        | `#F59E0B`                | Warning states           |

### Dark Mode

| Token                 | Value     | Usage                      |
| --------------------- | --------- | -------------------------- |
| `--nm-bg-primary`     | `#0F0F0F` | Main background            |
| `--nm-bg-secondary`   | `#1A1A1A` | Sidebar, secondary areas   |
| `--nm-bg-tertiary`    | `#242424` | Hover states, dividers     |
| `--nm-bg-elevated`    | `#2A2A2A` | Cards, modals, inputs      |
| `--nm-text-primary`   | `#E5E5E5` | Headings, primary text     |
| `--nm-text-secondary` | `#A1A1A1` | Body text                  |
| `--nm-text-tertiary`  | `#737373` | Placeholders, hints        |
| `--nm-accent`         | `#3B82F6` | Primary actions (brighter) |

### Color Usage Rules

1. **Backgrounds**: Use primary for main areas, secondary for sidebars
2. **Text**: Always use secondary for body text, never pure black
3. **Accents**: Use sparingly - buttons, active states, links
4. **Borders**: Keep subtle, use for structure not decoration

---

## Typography

### Font Stack

```css
--nm-font-sans:
  "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
--nm-font-mono: "JetBrains Mono", "SF Mono", Monaco, monospace;
```

### Type Scale

| Element | Size             | Line Height | Weight | Letter Spacing |
| ------- | ---------------- | ----------- | ------ | -------------- |
| H1      | 2rem (32px)      | 1.25        | 600    | -0.02em        |
| H2      | 1.5rem (24px)    | 1.25        | 600    | -0.02em        |
| H3      | 1.25rem (20px)   | 1.25        | 600    | -0.02em        |
| H4      | 1.125rem (18px)  | 1.25        | 600    | -0.02em        |
| Body    | 1rem (16px)      | 1.6         | 400    | 0              |
| Small   | 0.875rem (14px)  | 1.5         | 400    | 0              |
| Caption | 0.75rem (12px)   | 1.5         | 500    | 0              |
| Label   | 0.8125rem (13px) | 1.5         | 500    | 0              |

### Typography Rules

1. **Line height**: 1.6 for body text (readability)
2. **Headings**: Tight line-height (1.25) with negative letter-spacing
3. **Max width**: 720px for optimal reading
4. **Contrast**: Maintain 4.5:1 minimum ratio

---

## Spacing

### 8px Grid System

| Token           | Value | Common Usage               |
| --------------- | ----- | -------------------------- |
| `--nm-space-1`  | 4px   | Inline spacing, tiny gaps  |
| `--nm-space-2`  | 8px   | Tight gaps, icon gaps      |
| `--nm-space-3`  | 12px  | Button padding, small gaps |
| `--nm-space-4`  | 16px  | Card padding, section gaps |
| `--nm-space-5`  | 20px  | Modal padding              |
| `--nm-space-6`  | 24px  | Large gaps, page padding   |
| `--nm-space-8`  | 32px  | Section margins            |
| `--nm-space-10` | 40px  | Large section spacing      |
| `--nm-space-12` | 48px  | Page sections              |
| `--nm-space-16` | 64px  | Hero spacing               |

### Layout Constants

| Token                    | Value | Usage         |
| ------------------------ | ----- | ------------- |
| `--nm-sidebar-width`     | 280px | Sidebar width |
| `--nm-header-height`     | 64px  | Header height |
| `--nm-content-max-width` | 720px | Reading width |
| `--nm-form-max-width`    | 420px | Form width    |

---

## Components

### Button

**Variants**: `primary`, `secondary`, `ghost`, `text`, `danger`

**Sizes**: `sm`, `md`, `lg`

**Usage**:

```svelte
<Button variant="primary" size="md">Save</Button>
<Button variant="secondary" fullWidth>Cancel</Button>
<Button variant="ghost" loading={isLoading}>Loading</Button>
```

**States**:

- Hover: `translateY(-1px)` + shadow increase
- Active: `translateY(0)` + shadow decrease
- Disabled: `opacity: 0.5` + `cursor: not-allowed`
- Focus: `outline: 2px solid var(--nm-accent)` + `outline-offset: 2px`

### Input

**Features**:

- Label support with required indicator
- Error and hint text
- Icon support
- Full accessibility

**Usage**:

```svelte
<Input
  label="Username"
  type="text"
  bind:value={username}
  error={errors.username}
  hint="Choose a unique username"
  required
/>
```

**States**:

- Focus: Border color change + box-shadow ring
- Error: Red border + red focus ring
- Disabled: Reduced opacity

### Card

**Variants**: `default`, `flat`, `elevated`, `outlined`

**Usage**:

```svelte
<Card variant="default" padding="md" hover>
  {#snippet header()}
    <h3>Card Title</h3>
  {/snippet}
  Card content here
</Card>
```

**Hover Effect**: `translateY(-2px)` + shadow increase + `scale(1.02)`

### Modal

**Features**:

- Backdrop blur
- Scale-in animation
- Focus trap
- ESC to close
- Backdrop click to close

**Usage**:

```svelte
<Modal bind:open={isOpen} title="Confirm Action">
  Modal content here
  {#snippet footer()}
    <Button variant="secondary">Cancel</Button>
    <Button variant="primary">Confirm</Button>
  {/snippet}
</Modal>
```

### Sidebar

**Features**:

- Collapsible sections
- Active state indicators
- Submenu support
- Badge support

### NoteList

**Features**:

- Staggered animations
- Hover scale effect
- Empty state
- Delete action

---

## Animations

### Easing Functions

| Token                    | Value                                     | Usage            |
| ------------------------ | ----------------------------------------- | ---------------- |
| `--nm-easing-smooth`     | `cubic-bezier(0.4, 0, 0.2, 1)`            | Most transitions |
| `--nm-easing-bounce`     | `cubic-bezier(0.34, 1.56, 0.64, 1)`       | Scale animations |
| `--nm-easing-spring`     | `cubic-bezier(0.175, 0.885, 0.32, 1.275)` | Emphasis         |
| `--nm-easing-decelerate` | `cubic-bezier(0, 0, 0.2, 1)`              | Entering         |
| `--nm-easing-accelerate` | `cubic-bezier(0.4, 0, 1, 1)`              | Exiting          |

### Duration Tokens

| Token                  | Value | Usage              |
| ---------------------- | ----- | ------------------ |
| `--nm-duration-fast`   | 150ms | Hover states       |
| `--nm-duration-normal` | 250ms | Transitions        |
| `--nm-duration-slow`   | 350ms | Page transitions   |
| `--nm-duration-slower` | 500ms | Complex animations |

### Keyframe Animations

```css
/* Fade in */
@keyframes nm-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Fade up */
@keyframes nm-fade-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scale in */
@keyframes nm-scale-in {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Shake (error) */
@keyframes nm-shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-4px);
  }
  75% {
    transform: translateX(4px);
  }
}
```

### Animation Classes

| Class                  | Animation | Duration    |
| ---------------------- | --------- | ----------- |
| `.nm-animate-fade-in`  | Fade in   | 250ms       |
| `.nm-animate-fade-up`  | Fade up   | 250ms       |
| `.nm-animate-scale-in` | Scale in  | 250ms       |
| `.nm-animate-shake`    | Shake     | 400ms       |
| `.nm-animate-spin`     | Spin      | 1s infinite |

### Stagger Animation

```css
.nm-stagger > * {
  opacity: 0;
  animation: nm-fade-up var(--nm-duration-normal) var(--nm-easing-decelerate)
    forwards;
}

.nm-stagger > *:nth-child(1) {
  animation-delay: 0ms;
}
.nm-stagger > *:nth-child(2) {
  animation-delay: 50ms;
}
.nm-stagger > *:nth-child(3) {
  animation-delay: 100ms;
}
/* ... up to 6 children */
```

---

## Accessibility

### Focus States

All interactive elements have visible focus indicators:

```css
:focus-visible {
  outline: 2px solid var(--nm-accent);
  outline-offset: 2px;
}

/* Remove default focus for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}
```

### Reduced Motion

Respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  html {
    scroll-behavior: auto;
  }
}
```

### Screen Reader Support

- Proper heading hierarchy (h1 > h2 > h3)
- ARIA labels on icon-only buttons
- `aria-current` for active navigation items
- `aria-expanded` for collapsible sections
- `role="alert"` for error messages

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Tab order follows visual order
- Escape closes modals and dropdowns
- Enter/Space activates buttons

### Contrast Ratios

- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

---

## Responsive Design

### Breakpoints

| Breakpoint | Min Width | Usage              |
| ---------- | --------- | ------------------ |
| Mobile     | 0px       | Default styles     |
| Tablet     | 768px     | Medium adjustments |
| Desktop    | 1024px    | Full layout        |
| Large      | 1440px    | Max widths apply   |

### Responsive Patterns

**Mobile First Approach**:

```css
/* Mobile styles (default) */
.nm-sidebar {
  position: fixed;
  transform: translateX(-100%);
}

/* Desktop */
@media (min-width: 768px) {
  .nm-sidebar {
    position: relative;
    transform: none;
  }
}
```

**Typography Scaling**:

```css
/* Mobile */
html {
  font-size: 16px;
}

/* Desktop */
@media (min-width: 1200px) {
  html {
    font-size: 17px;
  }
}

/* Large screens */
@media (min-width: 1600px) {
  html {
    font-size: 18px;
  }
}
```

### Mobile Considerations

1. **Touch targets**: Minimum 44x44px
2. **Spacing**: Increase on mobile for easier tapping
3. **Modals**: Full-screen on mobile
4. **Sidebars**: Slide-in from left
5. **Font sizes**: Never below 16px for inputs (prevents zoom)

---

## Component Library Summary

### New Components Created

1. **AuthCard.svelte** - Authentication card with passkey/password tabs
2. **RegisterCard.svelte** - Registration with password strength indicator
3. **Card.svelte** - Versatile card with variants and hover effects
4. **Sidebar.svelte** - Navigation sidebar with sections and submenus
5. **NoteList.svelte** - Note list with staggered animations

### Updated Components

1. **Modal.svelte** - Updated to use nm- classes
2. **Toggle.svelte** - Updated to use nm- color tokens
3. **ShareModal.svelte** - Fixed Input size prop

### CSS Files Updated

1. **app.css** - Comprehensive design system with:
   - Color tokens (light & dark)
   - Typography scale
   - Spacing grid
   - Shadow tokens
   - Border radius tokens
   - Animation keyframes
   - Utility classes
   - Component base styles

---

## Migration Notes

### From Old to New

| Old Class     | New Class     |
| ------------- | ------------- |
| `.np-btn`     | `.nm-btn`     |
| `.np-input`   | `.nm-input`   |
| `.np-card`    | `.nm-card`    |
| `.np-modal`   | `.nm-modal`   |
| `.np-sidebar` | `.nm-sidebar` |

### Token Changes

| Old Token      | New Token           |
| -------------- | ------------------- |
| `--ui-text`    | `--nm-text-primary` |
| `--ui-bg`      | `--nm-bg-primary`   |
| `--ui-surface` | `--nm-bg-elevated`  |
| `--ui-border`  | `--nm-border`       |
| `--ui-primary` | `--nm-accent`       |

---

## File Structure

```
apps/web/src/
├── app.css                    # Design system tokens & base styles
├── lib/
│   ├── components/
│   │   ├── index.ts          # Component exports
│   │   ├── AuthCard.svelte   # Authentication card
│   │   ├── RegisterCard.svelte # Registration card
│   │   ├── Button.svelte     # Button component
│   │   ├── Card.svelte       # Card component
│   │   ├── Input.svelte      # Input component
│   │   ├── Modal.svelte      # Modal component
│   │   ├── NoteList.svelte   # Note list component
│   │   ├── Sidebar.svelte    # Sidebar component
│   │   ├── Toggle.svelte     # Toggle switch
│   │   └── ...               # Other components
│   ├── auth/
│   │   └── types.ts          # Auth type definitions
│   ├── crypto/
│   │   └── e2e.ts            # Encryption utilities
│   └── utils/
│       └── date.ts           # Date formatting utilities
└── routes/
    ├── +page.svelte          # Landing page (Auth)
    ├── app/
    │   ├── +page.svelte      # Dashboard
    │   ├── settings/
    │   │   └── +page.svelte  # Settings page
    │   └── note/[id]/
    │       └── +page.svelte  # Editor page
```

---

## Design System Checklist

### Visual Design

- [x] Color palette with OKLCH values
- [x] Light and dark mode
- [x] Typography scale with Inter
- [x] 8px spacing grid
- [x] Shadow system
- [x] Border radius tokens

### Components

- [x] Button (5 variants, 3 sizes)
- [x] Input (with label, error, hint)
- [x] Card (4 variants)
- [x] Modal (with animations)
- [x] Sidebar (with navigation)
- [x] NoteList (with stagger animations)
- [x] AuthCard (passkey/password)
- [x] RegisterCard (with strength meter)
- [x] Toggle (updated)

### Interactions

- [x] Micro-interactions (200-300ms)
- [x] Hover states (scale(1.02))
- [x] Focus rings with offset
- [x] Loading states
- [x] Error states

### Accessibility

- [x] WCAG 2.1 AA compliance
- [x] Keyboard navigation
- [x] Screen reader support
- [x] Focus indicators
- [x] Reduced motion support
- [x] Color contrast (4.5:1)

### Responsive

- [x] Mobile-first approach
- [x] Breakpoint system
- [x] Touch-friendly targets
- [x] Responsive typography

---

## Future Enhancements

1. **Theme Customization**: Allow users to customize accent colors
2. **Font Scaling**: Implement dynamic font scaling preference
3. **Density Modes**: Compact and comfortable spacing options
4. **Animation Speed**: User-controlled animation speeds
5. **High Contrast Mode**: Enhanced contrast option

---

## Credits

- **Design Philosophy**: Inspired by Notion, Linear, and Subnote
- **Typography**: Inter by Rasmus Andersson
- **Color Theory**: OKLCH color space for perceptually uniform colors
- **Accessibility**: WCAG 2.1 Guidelines

---

## Changelog

### v1.0 (February 2026)

- Initial design system release
- Neo-minimalist theme implementation
- Complete component library
- Accessibility compliance
- Dark mode support

---

_End of Design System Documentation_
