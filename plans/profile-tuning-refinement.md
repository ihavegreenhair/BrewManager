# Tasting Notes Refactoring Plan

## Objective
To overhaul the `generateOverallTastingNotes` function in `src/utils/tastingNotes.ts`. The current output suffers from mechanical phrasing (e.g., "A highly attenuative mash profile ensures...") and risks generating contradictory descriptions (e.g., indicating a "caramel sweetness" while also saying it "finishes bone-dry"). 

We will transition the engine to generate a holistic, sensory-first description of the *beer* itself, synthesizing the matrix scores into harmonious tasting notes.

## Execution Steps

### 1. Aroma & Entry (Sentence 1)
Instead of just stating the base malt, the first sentence will introduce the beer visually and describe the initial aromatic impression by synthesizing the Yeast Profile and Hop Aroma Index.
*   **High Hops + High Biotransformation:** "...opens with a saturated, yeast-driven wave of [tags]..."
*   **High Hops + Clean/Low Bio:** "...opens with a bright, aromatic punch of [tags] over a clean fermentation character."
*   **Low Hops + Phenolic Yeast:** "...opens with complex, spicy phenolic yeast notes."
*   **Low Hops + Clean Yeast:** "...presents a subtle, malt-forward aroma with a clean, restrained fermentation character."

### 2. Palate & Body (Sentence 2)
This sentence will synthesize the Body Index and the Malt Profile, ensuring the malt description never contradicts the body.
*   **Format:** "The mouthfeel is [Body Descriptor], anchored by [Malt Descriptor]."
*   **Body Descriptors:** "crisp and highly attenuated", "smooth and medium-bodied", or "thick, pillowy, and coating".
*   **Malt Descriptors:** Accurately reflects roast levels, heavy crystal additions (only if sweetness index allows it), heavy adjuncts (only if body index allows it), or defaults to the dominant base malt.

### 3. Finish & Structure (Sentence 3)
This sentence will perform a combined evaluation of Bitterness and Sweetness to avoid contradictions, then append the Water Chemistry impact.
*   **High Bitter + High Sweet:** "...a bold, bittersweet finish..."
*   **High Bitter + Low Sweet:** "...a bone-dry finish with a sharp, lingering hop bite..."
*   **Low Bitter + High Sweet:** "...a smooth, lingering malty sweetness on the finish..."
*   **Balanced:** "...a highly balanced, even finish..."
*   **Water Accents:** Appends phrases like "...accentuated by a crisp, sulfate-driven mineral bite" or "...rounded out by a soft, chloride-heavy water profile."

## Outcome
The final paragraph will read naturally like a professional sensory review, eliminating technical/mechanical recipe terms and focusing entirely on the liquid in the glass.