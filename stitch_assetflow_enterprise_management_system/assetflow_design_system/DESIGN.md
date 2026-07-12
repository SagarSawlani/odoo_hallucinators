---
name: AssetFlow Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d9d9e5'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3fe'
  surface-container: '#ededf9'
  surface-container-high: '#e7e7f3'
  surface-container-highest: '#e1e2ed'
  on-surface: '#191b23'
  on-surface-variant: '#434655'
  inverse-surface: '#2e3039'
  inverse-on-surface: '#f0f0fb'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4648d4'
  on-secondary: '#ffffff'
  secondary-container: '#6063ee'
  on-secondary-container: '#fffbff'
  tertiary: '#943700'
  on-tertiary: '#ffffff'
  tertiary-container: '#bc4800'
  on-tertiary-container: '#ffede6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e1e0ff'
  secondary-fixed-dim: '#c0c1ff'
  on-secondary-fixed: '#07006c'
  on-secondary-fixed-variant: '#2f2ebe'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#ffb596'
  on-tertiary-fixed: '#360f00'
  on-tertiary-fixed-variant: '#7d2d00'
  background: '#faf8ff'
  on-background: '#191b23'
  surface-variant: '#e1e2ed'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.01em
  h2:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  h1-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  sidebar_width: 280px
  header_height: 64px
  container_max: 1440px
  gutter: 24px
  margin_mobile: 16px
  base_unit: 4px
---

## Brand & Style
The design system is engineered for high-stakes asset management, prioritizing clarity, speed, and trust. It adopts a **Corporate / Modern** aesthetic that blends the utility of developer-centric tools with the refinement of premium fintech interfaces. 

The style is characterized by extreme precision, generous negative space, and a high-fidelity finish inspired by industry leaders. It utilizes a layered interface approach where depth is communicated through subtle shadows and glassmorphism rather than heavy borders. The emotional response is one of absolute control and reliability, ensuring users feel empowered to manage complex data at scale.

## Colors
The palette is rooted in a professional "Slate" scale to maintain a neutral, systematic backdrop. 

- **Primary & Secondary:** The Blue and Indigo tones are used for high-intent actions and branding accents.
- **Semantic Colors:** Success, Warning, and Danger colors are calibrated for high legibility against both light and dark backgrounds.
- **Surface Strategy:** 
  - **Light Mode:** Uses #F8FAFC as the base, with pure white (#FFFFFF) for elevated cards and containers.
  - **Dark Mode:** Transitions to a deep #0F172A base with #1E293B for surface layers, ensuring a soft contrast that reduces eye strain during long work sessions.

## Typography
This design system uses **Inter** exclusively to achieve a systematic, utilitarian feel. The hierarchy is strictly enforced through weight and letter spacing. 

- **Headlines:** Use tighter letter spacing (-0.01em to -0.02em) to maintain a compact, "designed" appearance at larger scales.
- **Body:** Standard body text is set to 16px for optimal readability.
- **Labels:** Small labels and captions use a medium or semi-bold weight to ensure they remain legible even when secondary in the visual hierarchy.
- **Numerical Data:** For tables and asset counts, ensure the use of tabular num glyphs (`tnum`) for vertical alignment of digits.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy for the core navigation elements, with a fluid content area.

- **Sidebar:** A 280px fixed-width left sidebar contains primary navigation. It remains anchored to the viewport.
- **Top Navigation:** A 64px height sticky header provides contextual actions, breadcrumbs, and search.
- **Desktop Grid:** Content spans a 12-column grid with a 24px gutter.
- **Adaptive Strategy:** On tablet, the sidebar collapses into a hamburger menu or a slim icon-only rail. On mobile, the layout reflows to a single column with 16px horizontal margins.
- **Rhythm:** All spacing (padding, margins) must be a multiple of the 4px base unit to ensure mathematical harmony.

## Elevation & Depth
Depth is a critical differentiator in this design system, moving away from flat borders toward a multi-layered light-source model.

- **Glassmorphism:** The sticky top navigation and modal overlays use a backdrop blur (12px - 20px) with a semi-transparent background (80% opacity) to maintain context of the content underneath.
- **Shadows:** 
  - **Level 1 (Cards):** Small, soft shadow: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`.
  - **Level 2 (Dropdowns/Modals):** Larger, multi-layered shadow: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`.
- **Tonal Layers:** Surfaces are differentiated by slight color shifts. In dark mode, the "uppermost" layer is always the lightest shade of gray/slate.

## Shapes
The shape language is sophisticated and approachable. The system uses a **rounded-xl (12px)** standard for primary containers.

- **Primary Containers:** Cards, Modals, and Main Buttons use a 12px (0.75rem) corner radius.
- **Small Elements:** Input fields, chips, and small buttons use a 8px (0.5rem) radius to maintain internal proportion.
- **Interactive States:** On hover, focus states should maintain the same corner radius but may introduce a subtle 2px ring or offset to indicate focus.

## Components
- **Buttons:** Primary buttons use a solid #2563EB background with white text. High-fidelity buttons should include a very subtle top-inner-highlight (1px) to simulate a tactile edge.
- **Tables:** Enterprise-grade tables with fixed headers, zebra striping on hover, and 12px padding. Status badges within tables use "Soft" styling (e.g., Green text on a 10% opacity Green background).
- **Status Badges:** Rounded-full (pill) shape with a 12px height. Use high-contrast text for accessibility.
- **Inputs:** 12px padding with a subtle 1px border. Focus state uses a 2px Blue-500 ring with 4px offset.
- **Loading Skeletons:** Use a subtle pulse animation with a linear gradient moving from left to right.
- **Transitions:** All state changes (hover, active, page transitions) should use a `0.2s ease-out` or a "spring" physics model for a premium, snappy feel. Use Framer Motion style `layoutId` for smooth element transitions between views.
- **Sticky Nav:** The top navigation should feature a `border-b` with a 1px Slate-200/800 color and the aforementioned glassmorphism backdrop blur.