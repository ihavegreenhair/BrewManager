# Tasting Notes Engine: Refining Sensory Accuracy

## Objective
To refine the `generateOverallTastingNotes` engine and the "Overall Balance" sliders to accurately reflect the sensory profile of styles like a Japanese Rice Lager. The current logic is misinterpreting "medium body" and "fruit-forward" characteristics due to generic tag parsing and rigid body calculations.

## The Issues to Fix
1.  **Over-Sensitivity to Yeast Tags:** The engine sees a yeast with a `fruity` tag (which might just be a subtle lager ester) and forces the narrative to declare "opens with expressive, fruit-forward yeast esters." This contradicts the actual radar chart which correctly shows a low/subtle fruity score for clean yeasts.
2.  **Mouthfeel Calculation:** A Japanese Rice Lager should be crisp and highly attenuated. The current `bodyIndex` logic is leaning "medium" because it is treating rice (an adjunct) as a body-*building* ingredient (like oats or wheat), rather than a body-*lightening* ingredient.
3.  **Overall Balance Sliders:** The UI sliders (Flavor Balance, Mouthfeel) need to perfectly mirror the internal 0-10 matrix scores to ensure the text and the visuals never contradict each other.

## Execution Steps

### Step 1: Fix the Body Index (Adjunct Logic)
The `bodyIndex` calculation currently adds `+10` to the index based purely on `adjunctPercent`.
*   **The Fix:** We must differentiate between *protein-rich* adjuncts (Flaked Oats, Wheat, Rye) which increase body, and *highly fermentable/thinning* adjuncts (Rice, Corn, Sugar) which decrease body.
*   **Logic:**
    *   If `adjunct` is `Rice`, `Corn`, `Sugar`, or `Dextrose` -> `bodyIndex -= (pct * 15)`
    *   If `adjunct` is `Oat`, `Wheat`, or `Rye` -> `bodyIndex += (pct * 15)`

### Step 2: Tie Narrative to Matrix Scores, NOT Tags
The narrative sentences must strictly follow the 0-10 matrix scores (which the radar chart already uses) rather than blindly triggering off raw string tags in the yeast object.
*   **The Fix:** Generate a `yeastEsterIndex` and `yeastPhenolIndex` in the matrix based on the yeast's `characteristicScores` or styles.
*   **Sentence Assembly:**
    *   Only use "expressive, fruit-forward esters" if `yeastEsterIndex` > 6.
    *   For a clean lager yeast (low ester, low hop), the sentence should correctly state "presents a crisp, clean profile."

### Step 3: Calibrate the UI Sliders
Ensure `StyleMatchSidebar.tsx` maps the 0-10 matrix perfectly to the 0.0-1.0 slider inputs.
*   `bitterness: tastingOutput.matrix.bitternessIndex / 10`
*   `body: tastingOutput.matrix.bodyIndex / 10`

### Expected Outcome (Japanese Rice Lager Scenario)
*   **Inputs:** High rice adjunct, clean lager yeast, low/moderate noble hops.
*   **Body Index:** Drops down into the 1-3 range due to high attenuation and rice.
*   **Aroma:** Yeast ester index remains low. Hop aroma index remains low/moderate.
*   **Final Text:** "Pouring a brilliant pale straw, this sessionable 4.8% ABV beer presents a subtle, floral aroma over a clean, restrained fermentation character. The mouthfeel is crisp and highly attenuated, anchored by a light, rice-driven foundation. It concludes with a highly balanced, even finish."