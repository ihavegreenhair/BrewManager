# Core Profile Section - Requirements Document

## 1. Executive Summary
The **Core Profile** section is the starting point of any brew day planning. It acts as the metadata and physical constraints hub for the entire recipe. A deep review of the brewing workflow reveals that users do not just input a name and select a style; they establish the fundamental physical parameters of the brew session (like batch size and brew method) which in turn dictate the mathematics for all subsequent ingredient additions. 

---

## 2. User Persona & Workflow Analysis
**The User:** A homebrewer (ranging from novice to advanced) sitting down to design a recipe.
**The Workflow:**
1. **Identity:** The user gives the recipe a name and associates themselves as the brewer.
2. **Methodology:** The user decides *how* they are brewing today (All-Grain vs. Extract). This is critical because an Extract brewer does not care about "Mash Efficiency".
3. **Target Selection:** The user picks a BJCP style. They want to instantly see the "bounds" they need to hit.
4. **Physical Constraints:** The user selects their equipment profile (e.g., "My 5-Gallon Cooler Setup"). 
5. **On-the-Fly Adjustments:** *Crucial Step.* Even though they selected their standard 5-gallon profile, today they want to brew a small 2.5-gallon experimental batch. They need to adjust the `Batch Volume` and `Boil Time` for *this specific recipe* without permanently modifying their global equipment profile.

---

## 3. User Stories
- **US1 (Identity):** As a brewer, I want to add an Author Name and Version number to my recipe so I can track how my personal "House IPA" evolves over time.
- **US2 (Methodology):** As a novice brewer, I want to select "Extract" as my brew method so the software stops warning me about mash efficiency and calculates my gravity strictly based on 100% extract yield.
- **US3 (Flexibility):** As an advanced brewer, I want to select my standard "10 Gallon System" equipment profile, but manually override the `Batch Volume` to 5 gallons just for this specific experimental batch without altering my global equipment settings.
- **US4 (Speed):** As a brewer actively formulating a recipe, I want changes made to the `Batch Volume` or `Efficiency` to immediately and visibly recalculate my Estimated OG and IBUs.

---

## 4. Features & Solution Requirements

### Feature 1: Expanded Metadata Tracking
- **Solution Requirement 1.1:** Add `author` (string) and `version` (string, e.g., "1.0") properties to the root `Recipe` type.
- **Solution Requirement 1.2:** Implement UI text inputs for Author and Version within the Core Profile card. The Author field should default to a placeholder like "BrewManager User" if empty.

### Feature 2: Brew Method Selector & Math Branching
- **Solution Requirement 2.1:** Add `type` (enum: 'All Grain', 'Extract', 'Partial Mash') to the root `Recipe` type.
- **Solution Requirement 2.2:** Add a UI dropdown for Brew Method.
- **Solution Requirement 2.3:** Update `calculateOG` in `brewingMath.ts`. If the recipe type is 'Extract', the formula must ignore the equipment's `efficiency` parameter and treat all fermentables as having 100% conversion efficiency.

### Feature 3: Decoupled Equipment Overrides
- **Solution Requirement 3.1:** Add `batchVolume`, `boilVolume`, `boilTime`, and `efficiency` directly to the root `Recipe` type.
- **Solution Requirement 3.2:** When a user selects an Equipment Profile from the dropdown, the system must *copy* the profile's values into these root-level recipe properties.
- **Solution Requirement 3.3:** The UI inputs for Volume and Efficiency must bind to the *recipe-level* state, not the underlying equipment profile state.
- **Solution Requirement 3.4:** The `brewingMath.ts` calculators must use these recipe-level overrides rather than passing the whole equipment object.

---

## 5. Implementation Steps
1. **Type Definition Update:** Modify `src/types/brewing.ts` to include `author`, `version`, `type` (Brew Method), and the top-level override parameters (`batchVolume`, `efficiency`, `boilTime`).
2. **State Management Update:** Modify `src/pages/RecipeBuilder.tsx` to include state hooks for the new metadata and overrides.
3. **Equipment Selection Logic:** Update `handleEquipmentChange` in the UI to push the equipment's default values into the recipe-level override state.
4. **Math Updates:** Adjust `calculateSharedTargets` and `calculateOG` to accept the new overriding parameters and implement the 'Extract' logic branch.
5. **UI Rendering:** Re-layout the "Core Profile" section to cleanly display Name, Author, Version, Brew Method side-by-side, followed by the Style and Equipment selectors, followed by the specific override inputs (Volume, Efficiency, Boil Time).
