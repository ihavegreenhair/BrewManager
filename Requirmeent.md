# BrewManager MVP Requirements

## 1. Project Overview
**BrewManager** is a high-performance web application designed for homebrewers to manage recipes, track brew sessions, and calculate key metrics. The application focuses on a "Professional Lab" aesthetic, dark mode support, and mobile-first responsiveness for use at the kettle.

## 2. Core Functional Requirements (MVP)

### A. Recipe Management
- **Recipe List View**: 
  - Displays a searchable/filterable list of all saved recipes.
  - Shows key stats (OG, FG, IBU, ABV) at a glance.
- **Recipe Creation & Editing**:
  - **Meta Data**: Name, Style (BJCP Reference), Batch Size.
  - **Grains/Extracts**: List of fermentables with weights and potential extract.
  - **Hops**: List of additions with weight, alpha acid, and boil time.
  - **Yeast**: Name, attenuation, and fermentation temperature range.
  - **Water**: Target profile and mash-in temperature.
  - **Mash & Boil**: Step-by-step mash schedule and boil duration (typically 60-90m).
- **Auto-Calculations**: Real-time updates for OG (Original Gravity), FG (Final Gravity), IBU (International Bitterness Units), and SRM (Standard Reference Method/Color).

### B. Brew Session Tracking
- **Active Session Interface**:
  - Link a new session to an existing recipe.
  - Log actual measured values vs. targets.
  - Timer integration for mash steps and boil additions.
- **Session History**:
  - Archive completed sessions with notes on final outcomes.
  - Log specific gravity and pH throughout fermentation.
- **Equipment Profiles**:
  - Define kettle size, boil-off rate, and mash tun dead space to refine calculations.

### C. Brewing Calculators
- **ABV/Attenuation**: Calculate alcohol percentage from OG and FG.
- **Strike Water**: Determine water temperature needed for a specific mash-in temperature based on grain mass and grain temperature.
- **Refractometer Correction**: Adjust readings when alcohol is present.
- **Priming Sugar**: Calculate sugar weight for target CO2 volumes based on beer temperature and volume.

### D. Inventory Management (Basic)
- Track stock of grains, hops, and yeast.
- Automatically subtract ingredients when a brew session is started.

## 3. Non-Functional Requirements

### A. Performance & Tech Stack
- **Bundler**: Vite for sub-second HMR and optimized builds.
- **Framework**: React with TypeScript for rigorous type safety in brewing calculations.
- **Persistence**: Initial MVP uses `localStorage` for zero-setup persistence, with an architectural path to a REST/GraphQL API.
- **State**: React Context or Zustand for efficient, global data management.

### B. UI/UX
- **Aesthetic**: "Professional Lab" – clean lines, monospace fonts for data, high-contrast indicators.
- **Dark Mode**: Default dark theme to reduce eye strain in dimly lit brew areas.
- **Responsiveness**: Fully responsive, optimized for mobile (portrait/landscape) and tablet/desktop.
- **Interactivity**: Instant feedback on ingredient changes, keyboard shortcuts for fast entry.

## 4. Implementation Phasing

### Phase 1: Foundation
- Initialize Vite + React + TS project.
- Define core types (Recipe, Ingredient, Session).
- Implement basic layout and navigation.

### Phase 2: Recipe Engine
- CRUD operations for Recipes.
- Integration of brewing math utils (IBU, OG, SRM).

### Phase 3: Session Tracking
- Log sessions linked to recipes.
- Persistence and basic timer functionality.

### Phase 4: Calculators & Polish
- Standalone calculators.
- Refine styling and finalize MVP features.
