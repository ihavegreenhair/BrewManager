# Recipe Builder Requirements Document

## Executive Summary
The Recipe Builder is the mathematical and creative core of BrewManager. Based on comprehensive market analysis, it must move beyond simple arithmetic to act as a robust, resilient (offline-first), and highly precise formulation engine. It must natively support the BeerJSON standard, feature dynamic equipment scaling, and provide advanced water chemistry tracking—all while addressing the usability flaws present in current cloud-native and legacy desktop applications.

---

## 1. Data Architecture & Interoperability
**Requirement:** The Recipe Builder must store data in a manner that ensures 100% offline functionality and universal interoperability.
- **Offline-First:** All modifications to a recipe must be instantly saved to local storage (IndexedDB/SQLite).
- **Conflict Resolution:** Utilizing CRDTs (Conflict-free Replicated Data Types) or strict timestamp versioning to handle simultaneous multi-device edits.
- **BeerJSON Native:** The internal data model will strictly map to the [BeerJSON](https://github.com/beerjson/beerjson) standard.
- **Legacy Support:** Must provide a parser to import legacy BeerXML files, converting them directly to BeerJSON objects upon import.

**✅ Architectural Decision:** Users MUST be able to import and export BeerJSON directly from the UI within the MVP phase to ensure immediate interoperability.

---

## 2. Dynamic Equipment Profiling & Scaling
**Requirement:** A recipe is inherently tied to the physical constraints of the brewing hardware. The builder must dynamically adjust ingredient quantities when hardware profiles change.
- **Profile Parameters:** Must capture Mash Tun volume, false bottom deadspace, thermal mass, Kettle geometry (boil-off rate), and systemic fluid losses (trub, chiller shrinkage, yeast cake).
- **Non-Linear Scaling:** Changing equipment must accurately scale the grain bill based on the new system's mash efficiency and recalculate hop utilization based on different boil gravities and cooling times.

**✅ Architectural Decision:** The system will default to **Metric units** globally, with a toggle available for Imperial. The builder will include a library of common "pre-built" equipment profiles (e.g., Grainfather G30, Speidel Braumeister) while fully supporting entirely manual custom equipment configuration.

---

## 3. Ingredient Management & Calculations
**Requirement:** The builder must support a massive, highly detailed array of ingredients and execute deterministic industry-standard calculations.
- **Core Calculators:** OG (Original Gravity), FG (Final Gravity), IBU, SRM/EBC, and ABV.
- **Fermentables:** Must track Yield/Potential, Color (Lovibond/EBC), and Moisture Content.
- **Hops:** Must track Alpha Acids, Beta Acids, Cohumulone, and specific addition types (Boil, Whirlpool, Dry Hop, Biotransformation during active krausen).
- **Yeast & Pitch Rates:** Must calculate target cell counts based on Original Gravity, volume, and target pitch rate (e.g., 0.75 M cells / ml / °P for ales), including viability decay for liquid yeast and starter volume requirements.
- **Multi-Beverage Support:** Logic branches bypassing standard mash math for Mead/Cider (Staggered Nutrient Additions, potential extract purely from honey/sugar) and extract brewing.

**✅ Architectural Decision:** The system will globally default to the most common industry-standard formulas: **Tinseth** for IBUs and **Morey** for Color (SRM/EBC).

---

## 4. Advanced Water Chemistry & pH Engine
**Requirement:** Integration of a "Bru'n Water" style chemistry engine directly within the recipe flow.
- **Ion Tracking:** Track and balance Calcium, Magnesium, Sodium, Sulfate, Chloride, and Bicarbonate.
- **Target Profiles:** Allow users to select water profiles based on style (e.g., "West Coast IPA", "Pilsen").
- **Auto-Calculated Additions:** Determine the exact milligram additions of Gypsum, Calcium Chloride, Epsom Salt, and Baking Soda required to hit target ranges.
- **Mash pH Prediction:** Calculate residual alkalinity and predict room-temperature mash pH based on the specific grain bill (accounting for highly roasted malts), recommending specific Lactic/Phosphoric acid additions.

**✅ Architectural Decision:** Water chemistry and pH calculations will be prominently integrated directly into the primary Recipe Builder UI flow, rather than being hidden in a secondary tab.

---

## 5. Mash, Fermentation, & Packaging Profiles (Missing Details Addressed)
**Requirement:** Granular control over the physical steps of the brewing process.
- **Mash Profiles:** A step-builder allowing users to define specific temperature rests (e.g., Protein Rest, Saccharification, Mash Out) and times. Must calculate required infusion water volumes and temperatures for step mashing.
- **Fermentation Profiles:** A step-builder to dictate temperature over time (e.g., Primary at 18°C for 7 days, Diacetyl Rest at 21°C for 3 days, Cold Crash at 2°C for 2 days).
- **Carbonation & Packaging:** Embedded calculators for determining priming sugar weight based on target CO2 volumes and current beer temperature, or keg regulator pressure settings.

---

## 6. Style Validation & Warnings (Missing Details Addressed)
**Requirement:** Real-time visual feedback comparing the recipe's metrics against established style guidelines.
- **BJCP Integration:** The builder must contain a localized database of the latest Beer Judge Certification Program (BJCP) style guidelines.
- **Visual Progress Bars:** As ingredients are adjusted, visual sliders for OG, FG, IBU, SRM, and ABV must dynamically update against the min/max bounds of the selected BJCP style (e.g., turning green when within bounds, red when exceeding).
- **Formulation Warnings:** Systemic warnings for critical errors (e.g., "Estimated ABV exceeds yeast alcohol tolerance", or "Mash pH prediction is critically low").

---

## 7. Relational "Split Batch" Architecture
**Requirement:** A single boil must be able to branch into multiple distinct fermentation vessels within the same recipe structure.
- **Parent Entity (The Boil):** Dictates OG, base grain bill, kettle hops, and baseline IBUs.
- **Child Entities (The Fermenters):** Track distinct volumes, distinct yeast pitches, unique dry-hop additions, and ultimate unique FG and ABV.

**✅ Architectural Decision:** The underlying database and state architecture will be built to fully support relational "Split Batches" in Phase 1 (MVP). However, the complex User Interface to expose this feature will be hidden/deferred until Phase 2 to accelerate MVP deployment.

---

## 8. Accessibility & UI Considerations
**Requirement:** The interface must be optimized for both meticulous desktop planning and active brewhouse environments.
- **WCAG 2.1 AA:** Strict adherence to color contrast and ARIA tags.
- **Dynamic Collaboration:** Visual indicators showing if another user/device is actively editing the recipe.
- **Flavor Spider-Graphs:** A visual output representing the predicted balance of flavor notes based on the hop and malt combination.

**✅ Architectural Decision:** The MVP will feature a static, UI-based Flavor Prediction Spider-Graph driven by hard-coded hop oil mappings. This component will be structurally designed so that it can easily be swapped out for a dynamic AI-driven prediction model in later phases.

---

## Implementation Steps (Recipe Builder Specific)

### Step 1: Data Model Expansion & Global State
- **Refactor TS Types:** Update the `brewing.ts` types to perfectly align with the complex BeerJSON schema (Equipment, Water, Mash steps, Fermentation steps).
- **Zustand Adjustments:** Ensure the store supports nested object updates (e.g., updating a specific step within a Mash Profile).
- **Unit Management:** Implement a global toggle in the state for Metric/Imperial, and build a localized conversion utility function to intercept all UI inputs/outputs.

### Step 2: Equipment & Base Recipe Setup
- **Equipment Profiles:** Build a dropdown UI pre-populated with standard systems (Grainfather, etc.).
- **Dynamic Scaling Math:** Implement the specific algorithms that alter total gravity points based on the selected equipment's efficiency and batch volume.

### Step 3: Core Ingredients & Style Validation
- **BJCP Database:** Import a static JSON of BJCP styles.
- **Live Stats Component:** Build the UI component that maps current calculated stats (OG, IBU) against the BJCP style constraints using visual progress bars.
- **Ingredient Panels:** Flesh out the Fermentables, Hops, and Yeast UI panels, ensuring fields exist for moisture, alpha acids, and attenuation.

### Step 4: Mash & Fermentation Step Builders
- **Dynamic List UI:** Create a drag-and-drop or simple sequential list builder for Mash Temperature steps and Fermentation Temperature steps.
- **Infusion Math:** Build the utility function to calculate boiling water infusions needed to raise mash temperatures (for cooler-based setups).

### Step 5: Integrated Water Chemistry
- **Water UI:** Build the panel to input Source Water ions and select Target Style profiles.
- **Chemistry Math:** Implement the Bru'n Water algorithms to calculate required salt additions and predict mash pH based on the current grain bill's color and acidity.

### Step 6: I/O, Polish & Static Spider Graph
- **BeerJSON I/O:** Write the parsing functions to export the current recipe state to a `.json` file and parse an uploaded file back into state.
- **Spider Graph:** Implement `Recharts` or `Chart.js` to render a static radar chart estimating flavor (Citrus, Pine, Floral, etc.) based on simple hard-coded hop thresholds.
- **Split-Batch Prep:** Verify the data architecture stores "Fermenters" as an array (even if the UI currently only allows editing the first index).
