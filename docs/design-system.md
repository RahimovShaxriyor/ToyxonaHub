# Design System & Motion Specification

## 1. Design Philosophy: Warm Minimal

ToyxonaHub avoids generic stark-white SaaS styling in favor of a **Warm Minimal / Premium Modern** aesthetic tailored for the wedding and celebration industry in Uzbekistan.

The design emphasizes high-quality venue photography, warm natural paper-like tones, sophisticated typography pairing, and calm, purposeful micro-interactions.

---

## 2. Color Palette & Design Tokens

| Token Name | Hex Code | Role & Usage |
| :--- | :---: | :--- |
| **Canvas** | `#FAFAF8` | Warm off-white background for pages and section backdrops. |
| **Surface** | `#FFFFFF` | Pure white background for elevated cards, dialogs, and form containers. |
| **Ink** | `#181817` | Deep neutral charcoal used for primary headings, high-contrast text, and dark badges. |
| **Muted** | `#6D6A63` | Balanced warm gray for secondary text, descriptions, icons, and placeholder strings. |
| **Bronze (Accent)** | `#9A6B3F` | Refined metallic bronze used for primary CTAs, active focus rings, and price highlights. |
| **Bronze Hover** | `#805632` | Darker bronze state for button hover and active selections. |
| **Border** | `#E8E5E0` | Subtle warm boundary line separating cards, table rows, and inputs. |
| **Border Dark** | `#D4D0C8` | Elevated border color on hover or subtle dividers. |
| **Success** | `#2F7D5B` | Deep forest emerald for available dates, confirmed bookings, and advance payments. |
| **Danger** | `#C84A4A` | Muted crimson for booked dates, error toasts, and destructive actions. |

---

## 3. Typography Hierarchy

ToyxonaHub pairs a classic editorial serif font with a modern geometric sans-serif:

- **Editorial Serif (`Playfair Display`, `serif`)**:
  - Used for large hero statements, venue titles on detail pages, section headings, and auth modal titles.
  - Conveys luxury, elegance, and celebration.
- **Interface Sans (`Plus Jakarta Sans`, `sans-serif`)**:
  - Used for buttons, form inputs, calendar numbers, table data, navigation links, and body text.
  - Provides optimal legibility across small mobile screens and high-density data tables.

---

## 4. Radii & Surface Elevation

- **Buttons & Form Inputs**: `rounded-xl` (`12px`) with subtle border transitions.
- **Standard Cards**: `rounded-2xl` (`16px`) with `border border-border shadow-card`.
- **Hero Containers & Modals**: `rounded-3xl` (`24px`) with soft ambient shadows.
- **Pills & Badges**: `rounded-full` for compact status indicators.

---

## 5. Unified Motion Tokens System

All animations and transitions follow strict duration tokens defined in `src/styles/index.css` using the standard ease-out curve `cubic-bezier(0.16, 1, 0.3, 1)`:

```css
:root {
  --motion-fast: 150ms;     /* Checkmarks, icons, tooltips */
  --motion-ui: 200ms;       /* Button hover, tab underline, card focus */
  --motion-form: 240ms;     /* Input focus rings, directional auth slides */
  --motion-drawer: 280ms;   /* Modals, mobile sheets */
  --motion-section: 400ms;  /* Page enter, tab panel switches */
  --motion-hero: 800ms;     /* Hero background crossfades */
  --motion-ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Signature Micro-Interactions:
1. **Hero Carousel Crossfade (800ms)**: Smooth crossfade between slides accompanied by a gentle ambient zoom (`scale-100` to `scale-104`).
2. **Card Hover Lift**: Wedding hall cards elevate subtly on hover (`-translate-y-1`) with a soft image zoom (`scale-[1.03]`).
3. **Button Active Scale**: Buttons physically depress when clicked (`active:scale-[0.98]`).
4. **Directional Auth Transitions**:
   - Navigating Login $\rightarrow$ Register triggers `auth-slide-from-right` (240ms).
   - Navigating Register $\rightarrow$ Login triggers `auth-slide-from-left` (240ms).
   - Direct page load uses neutral fade `auth-enter-neutral`.
5. **Segmented OTP Digit Pop**: Entering a number in `OtpInput` plays a subtle spring pop (`otp-digit-pop`).
6. **Task Success Pop**: Successful actions trigger an animated green checkmark (`check-success-pop`).

---

## 6. Accessibility & Reduced Motion

- **Keyboard Tab Order**: All interactive controls are fully navigable via `Tab` and `Shift+Tab`.
- **Focus Rings**: Custom non-disruptive focus indicators using `focus-visible:ring-2 focus-visible:ring-bronze`.
- **W3C/WCAG Contrast**: All text against background meets or exceeds WCAG AA 4.5:1 contrast ratio.
- **Reduced Motion Support**: For users with `prefers-reduced-motion: reduce`, all transitions and transforms instantly collapse to calm opacity fades:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
