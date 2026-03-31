# Premium SaaS Dashboard Redesign Plan

This document outlines the architectural and design changes required to transform the Smart Study Planner into a premium, startup-grade SaaS application.

## Goal
Redesign the app with a professional sidebar-layout structure, dark mode, smooth micro-interactions, and a sophisticated single-page app (SPA) feel separated into distinct views: Dashboard, Study Plan, Progress, and Settings.

## User Review Required

> [!WARNING]
> This redesign is a major structural change. It will completely rewrite `index.html`, `style.css`, and `main.js`. 
> 
> *   **SPA Routing**: We will implement lightweight JavaScript routing to handle the Sidebar navigation (Dashboard, Study Plan, Settings) instead of showing everything on one long page.
> *   **Dark Mode**: We will introduce CSS custom variables tailored for light/dark themes and a toggle switch in the header.

## Proposed Changes

---

### Structure & Layout
#### [MODIFY] `index.html`
-   **Sidebar**: A fixed left-hand navigation menu with the Logo and navigation links (Dashboard, Study Plan, Progress, Settings).
-   **Header**: A top bar with a glassmorphism effect, showcasing a personalized greeting ("Good evening, User 👋") and a Dark Mode toggle switch.
-   **Main Content Area**: A container that swaps out the active "page" view dynamically.
-   **Skeleton Loaders**: Dedicated HTML elements styled to shimmer while the "AI" generates the study plan, replacing the standard spinner.

---

### Styling & Theming
#### [MODIFY] `style.css`
-   **CSS Variables (Theming)**: Implement a complete suite of Light and Dark Mode tokens (Backgrounds: `#0F172A`, Cards: `#1E293B`, Text: `#E2E8F0` for dark mode).
-   **Typography & Hierarchy**: Enforce balanced typography using fonts like *Inter* or *Poppins*.
-   **Layout Subsystem**: Convert from a centered container to a full-viewport Grid mapping (Sidebar + Header + Main).
-   **Premium Interactions**:
    -   Cards lifting up `transform: translateY(-4px)` with enhanced soft shadows on hover.
    -   Buttons utilizing subtle gradient highlights and scaling `transform: scale(1.02)`.
    -   Smooth checkbox pop animations for satisfying task completion.

---

### Application Logic & Routing
#### [MODIFY] `main.js`
-   **Dark Mode Logic**: A function that reads/writes to `localStorage` and toggles a `data-theme="dark"` attribute on the `<html>` or `<body>` tag.
-   **Tab Navigation System**: Event listeners attached to the Sidebar rendering specific DOM sections hidden or visible based on the active tab (e.g., hiding Dashboard to show the Settings/Setup form).
-   **Greeting Generator**: Time-based logic to evaluate whether to say "Good morning", "Good afternoon", or "Good evening".
-   **Unified State Management**: Ensuring that migrating tasks across tabs reflects true data dynamically.

## Verification Plan

### Automated Tests
-   Verify all custom CSS properties effectively flip colors without flashing when testing the App locally.

### Manual Verification
-   Clicking Sidebar items switches the visible section smoothly.
-   Hovering over cards/buttons triggers the appropriate premium micro-interactions.
-   Generating the plan uses the new Skeleton loaders instead of the old spinner.
-   Toggling Dark Mode modifies the theme instantly, and refreshes the page to verify it persists from `localStorage`.
