// Simplified Bru'n Water Style Chemistry Engine for MVP

import type { WaterProfile, Fermentable, BeerStyle } from '../types/brewing';

/**
 * Common Target Water Profiles (Regional / Style Based)
 * Based on historical data and modern brewing standards (e.g. Bru'n Water)
 */
export const targetWaterProfiles: WaterProfile[] = [
  // --- Modern Color/Flavor Matrix (Inspired by standard brewing practices) ---
  { 
    id: 'wp-yellow-dry', 
    name: 'Yellow Dry / Hoppy', 
    description: 'Enhances hop bitterness and crisp finish in pale beers. Great for Pale Ales, light IPAs, and crisp lagers.',
    calcium: 50, magnesium: 10, sodium: 15, sulfate: 105, chloride: 45, bicarbonate: 0 
  },
  { 
    id: 'wp-yellow-balanced', 
    name: 'Yellow Balanced', 
    description: 'Equal focus on malt and hops in pale beers. Good baseline for blondes, cream ales, and pale lagers.',
    calcium: 50, magnesium: 10, sodium: 15, sulfate: 75, chloride: 60, bicarbonate: 0 
  },
  { 
    id: 'wp-yellow-malty', 
    name: 'Yellow Malty', 
    description: 'Enhances malt sweetness and roundness in pale beers. Excellent for Helles, Kolsch, and rich blondes.',
    calcium: 50, magnesium: 10, sodium: 15, sulfate: 55, chloride: 80, bicarbonate: 0 
  },
  
  { 
    id: 'wp-amber-dry', 
    name: 'Amber Dry / Hoppy', 
    description: 'Enhances hop bite in amber beers while providing enough alkalinity to buffer light roasted malts. Great for Amber Ales and Red IPAs.',
    calcium: 50, magnesium: 15, sodium: 15, sulfate: 110, chloride: 50, bicarbonate: 65 
  },
  { 
    id: 'wp-amber-balanced', 
    name: 'Amber Balanced', 
    description: 'Balances malt and hops for mid-color beers. Perfect for Altbier, ESB, and standard Amber Ales.',
    calcium: 50, magnesium: 15, sodium: 15, sulfate: 75, chloride: 60, bicarbonate: 75 
  },
  { 
    id: 'wp-amber-malty', 
    name: 'Amber Malty', 
    description: 'Pushes malt focus in mid-color beers. Ideal for Scottish Ales, Bocks, and sweet Reds.',
    calcium: 50, magnesium: 15, sodium: 15, sulfate: 55, chloride: 80, bicarbonate: 85 
  },

  { 
    id: 'wp-brown-dry', 
    name: 'Brown Dry / Hoppy', 
    description: 'Supports hop bitterness against dark malts. Good for Brown IPAs and hoppy Porters.',
    calcium: 50, magnesium: 15, sodium: 25, sulfate: 110, chloride: 50, bicarbonate: 130 
  },
  { 
    id: 'wp-brown-balanced', 
    name: 'Brown Balanced', 
    description: 'Smooth balance for dark beers. The go-to for standard Porters, Brown Ales, and milds.',
    calcium: 50, magnesium: 15, sodium: 25, sulfate: 75, chloride: 60, bicarbonate: 140 
  },
  { 
    id: 'wp-brown-malty', 
    name: 'Brown Malty', 
    description: 'Rich, sweet focus for dark beers. Excellent for sweet stouts and rich brown ales.',
    calcium: 50, magnesium: 15, sodium: 25, sulfate: 55, chloride: 80, bicarbonate: 150 
  },

  { 
    id: 'wp-black-dry', 
    name: 'Black Dry / Hoppy', 
    description: 'High alkalinity to buffer heavily roasted grains, while maintaining a dry finish. Black IPAs and Dry Irish Stouts.',
    calcium: 50, magnesium: 15, sodium: 35, sulfate: 110, chloride: 50, bicarbonate: 200 
  },
  { 
    id: 'wp-black-balanced', 
    name: 'Black Balanced', 
    description: 'Balanced profile for very dark beers. Great for robust stouts and Baltic Porters.',
    calcium: 50, magnesium: 15, sodium: 35, sulfate: 75, chloride: 60, bicarbonate: 210 
  },
  { 
    id: 'wp-black-malty', 
    name: 'Black Malty', 
    description: 'Maximizes body and sweetness in heavily roasted beers. Perfect for Imperial Stouts and dessert stouts.',
    calcium: 50, magnesium: 15, sodium: 35, sulfate: 55, chloride: 80, bicarbonate: 220 
  },

  // --- Extreme & Specialized Profiles ---
  { 
    id: 'wp-wc-ipa', 
    name: 'West Coast IPA (Extreme Hoppy)', 
    description: 'Very high sulfate to chloride ratio (3:1+) to create the legendary sharp, crisp bitterness of West Coast IPAs.',
    calcium: 150, magnesium: 18, sodium: 16, sulfate: 300, chloride: 50, bicarbonate: 0 
  },
  { 
    id: 'wp-neipa', 
    name: 'NEIPA (Juicy/Soft)', 
    description: 'Very high chloride levels (2:1 ratio) to create a soft, pillowy mouthfeel and suppress sharp bitterness. For Hazy IPAs.',
    calcium: 100, magnesium: 15, sodium: 20, sulfate: 100, chloride: 200, bicarbonate: 0 
  },
  
  // --- Historical Cities ---
  { 
    id: 'wp-pilsen', 
    name: 'Plzeň, CZ (Bohemian Pilsner)', 
    description: 'The softest brewing water in the world. Essential for the delicate hop character of authentic Pilsners.',
    calcium: 7, magnesium: 2, sodium: 2, sulfate: 5, chloride: 5, bicarbonate: 15 
  },
  { 
    id: 'wp-munich', 
    name: 'Munich, DE (Dunkel/Bock)', 
    description: 'High alkalinity balances the acidity of dark roasted malts without adding harsh mineral flavors.',
    calcium: 75, magnesium: 18, sodium: 2, sulfate: 10, chloride: 2, bicarbonate: 150 
  },
  { 
    id: 'wp-burton', 
    name: 'Burton, UK (English Pale)', 
    description: 'Extreme sulfate levels "Burtonize" the water, creating the sharp bitterness of classic English IPAs and Pales.',
    calcium: 295, magnesium: 45, sodium: 55, sulfate: 725, chloride: 25, bicarbonate: 300 
  }
];

/**
 * Recommends a water profile ID based on the selected beer style.
 * Uses intelligent keyword matching on the style name and category to find the best fit.
 */
export const recommendWaterProfile = (style: BeerStyle): string => {
  const name = style.name.toLowerCase();
  const cat = style.category.toLowerCase();
  const combined = `${name} ${cat}`;

  // 1. Specialized & Extreme Matches
  if (name.includes('neipa') || name.includes('hazy') || name.includes('juicy') || name.includes('new england')) return 'wp-neipa';
  if (name.includes('west coast') || (name.includes('american') && name.includes('ipa') && !name.includes('hazy'))) return 'wp-wc-ipa';
  if (name.includes('bohemian') && name.includes('pilsner')) return 'wp-pilsen';
  if (name.includes('dunkel') && !name.includes('weizen')) return 'wp-munich';
  if (combined.includes('english') && combined.includes('ipa')) return 'wp-burton';

  // 2. Black / Very Dark Beers
  if (name.includes('stout')) {
    if (name.includes('dry') || name.includes('irish')) return 'wp-black-dry';
    if (name.includes('sweet') || name.includes('imperial') || name.includes('pastry') || name.includes('tropical')) return 'wp-black-malty';
    return 'wp-black-balanced';
  }
  if (name.includes('schwarzbier') || name.includes('black ipa') || name.includes('cascadian dark')) return 'wp-black-dry';

  // 3. Brown Beers
  if (name.includes('porter')) {
    if (name.includes('robust') || name.includes('american')) return 'wp-brown-dry';
    if (name.includes('baltic') || name.includes('english')) return 'wp-brown-malty';
    return 'wp-brown-balanced';
  }
  if (name.includes('brown')) {
    if (name.includes('hoppy') || name.includes('american')) return 'wp-brown-dry';
    if (name.includes('sweet') || name.includes('english')) return 'wp-brown-malty';
    return 'wp-brown-balanced';
  }
  if (name.includes('mild') && combined.includes('dark')) return 'wp-brown-malty';

  // 4. Amber Beers
  if (name.includes('amber') || name.includes('red')) {
    if (name.includes('american') || name.includes('hoppy') || name.includes('ipa')) return 'wp-amber-dry';
    if (name.includes('irish') || name.includes('scottish') || name.includes('flanders')) return 'wp-amber-malty';
    return 'wp-amber-balanced';
  }
  if (name.includes('bock') || name.includes('doppelbock') || name.includes('märzen') || name.includes('marzen') || name.includes('scottish') || name.includes('wee heavy') || name.includes('bière de garde')) return 'wp-amber-malty';
  if (name.includes('altbier') || name.includes('esb') || name.includes('bitter')) return 'wp-amber-balanced';

  // 5. Yellow / Pale Beers
  if (name.includes('ipa') || name.includes('pale ale') || name.includes('apa')) {
    if (combined.includes('belgian') || combined.includes('english')) return 'wp-yellow-balanced';
    return 'wp-yellow-dry'; // Default pale ales to dry/hoppy
  }
  if (name.includes('pilsner') || name.includes('pilsener') || name.includes('pils')) {
    if (name.includes('german') || name.includes('american')) return 'wp-yellow-dry';
    return 'wp-pilsen'; // Default pils to super soft
  }
  if (name.includes('helles') || name.includes('kolsch') || name.includes('kölsch') || name.includes('blonde') || name.includes('golden') || name.includes('wheat') || name.includes('weissbier') || name.includes('witbier') || name.includes('saison')) return 'wp-yellow-malty';
  if (name.includes('lager')) {
    if (name.includes('light') || name.includes('american')) return 'wp-yellow-dry'; // Crisp
    if (name.includes('vienna')) return 'wp-amber-malty';
    return 'wp-yellow-balanced';
  }

  // 6. Catch-all fallback
  return 'wp-yellow-balanced';
};

/**
 * Calculates required additions in grams to hit the target profile from the source profile.
 */
export const calculateWaterAdditions = (
  source: WaterProfile,
  target: WaterProfile,
  volumeLiters: number
) => {
  // Conversions for ppm (mg/L) contributed by 1g of salt in 1L of water
  const GYPSUM_CA = 232.8;
  const GYPSUM_SO4 = 558.2;
  
  const CACL2_CA = 272.6;
  const CACL2_CL = 482.3;
  
  const EPSOM_MG = 98.6;
  const EPSOM_SO4 = 390.4;
  
  const BAKING_SODA_NA = 273.8;
  const BAKING_SODA_HCO3 = 726.2;

  const additions = { gypsumGrams: 0, cacl2Grams: 0, epsomGrams: 0, bakingSodaGrams: 0 };
  const current = { ...source };

  // 0. Calculate Baking Soda if alkalinity needs raising (for dark beers in soft water)
  const hco3Deficit = Math.max(0, target.bicarbonate - current.bicarbonate);
  if (hco3Deficit > 0) {
    additions.bakingSodaGrams = (hco3Deficit * volumeLiters) / BAKING_SODA_HCO3;
    current.bicarbonate += hco3Deficit;
    current.sodium += (additions.bakingSodaGrams * BAKING_SODA_NA) / volumeLiters;
  }

  // 1. Calculate Epsom Salt for Magnesium deficit
  const mgDeficit = Math.max(0, target.magnesium - current.magnesium);
  if (mgDeficit > 0) {
    additions.epsomGrams = (mgDeficit * volumeLiters) / EPSOM_MG;
    current.magnesium += mgDeficit;
    current.sulfate += (additions.epsomGrams * EPSOM_SO4) / volumeLiters;
  }

  // 2. Calculate Calcium Chloride for Chloride deficit
  const clDeficit = Math.max(0, target.chloride - current.chloride);
  if (clDeficit > 0) {
    additions.cacl2Grams = (clDeficit * volumeLiters) / CACL2_CL;
    current.chloride += clDeficit;
    current.calcium += (additions.cacl2Grams * CACL2_CA) / volumeLiters;
  }

  // 3. Calculate Gypsum for remaining Sulfate deficit
  const so4Deficit = Math.max(0, target.sulfate - current.sulfate);
  if (so4Deficit > 0) {
    additions.gypsumGrams = (so4Deficit * volumeLiters) / GYPSUM_SO4;
    current.sulfate += so4Deficit;
    current.calcium += (additions.gypsumGrams * GYPSUM_CA) / volumeLiters;
  }

  return {
    additions: {
      gypsum: Number(additions.gypsumGrams.toFixed(2)),
      cacl2: Number(additions.cacl2Grams.toFixed(2)),
      epsom: Number(additions.epsomGrams.toFixed(2)),
      bakingSoda: Number(additions.bakingSodaGrams.toFixed(2))
    },
    resultingProfile: {
      calcium: Number(current.calcium.toFixed(0)),
      magnesium: Number(current.magnesium.toFixed(0)),
      sulfate: Number(current.sulfate.toFixed(0)),
      chloride: Number(current.chloride.toFixed(0)),
      sodium: Number(current.sodium.toFixed(0)),
      bicarbonate: Number(current.bicarbonate.toFixed(0))
    }
  };
};

/**
 * Calculates the resulting water profile from a specific set of manual salt additions.
 */
export const calculateProfileFromSalts = (
  source: WaterProfile,
  additions: { gypsum: number; cacl2: number; epsom: number; bakingSoda: number },
  volumeLiters: number
) => {
  if (volumeLiters <= 0) return { additions, resultingProfile: source };

  const GYPSUM_CA = 232.8;
  const GYPSUM_SO4 = 558.2;
  const CACL2_CA = 272.6;
  const CACL2_CL = 482.3;
  const EPSOM_MG = 98.6;
  const EPSOM_SO4 = 390.4;
  const BAKING_SODA_NA = 273.8;
  const BAKING_SODA_HCO3 = 726.2;

  const current = { ...source };

  current.calcium += (additions.gypsum * GYPSUM_CA) / volumeLiters;
  current.sulfate += (additions.gypsum * GYPSUM_SO4) / volumeLiters;

  current.calcium += (additions.cacl2 * CACL2_CA) / volumeLiters;
  current.chloride += (additions.cacl2 * CACL2_CL) / volumeLiters;

  current.magnesium += (additions.epsom * EPSOM_MG) / volumeLiters;
  current.sulfate += (additions.epsom * EPSOM_SO4) / volumeLiters;

  current.sodium += (additions.bakingSoda * BAKING_SODA_NA) / volumeLiters;
  current.bicarbonate += (additions.bakingSoda * BAKING_SODA_HCO3) / volumeLiters;

  return {
    additions,
    resultingProfile: {
      calcium: Number(current.calcium.toFixed(0)),
      magnesium: Number(current.magnesium.toFixed(0)),
      sulfate: Number(current.sulfate.toFixed(0)),
      chloride: Number(current.chloride.toFixed(0)),
      sodium: Number(current.sodium.toFixed(0)),
      bicarbonate: Number(current.bicarbonate.toFixed(0))
    }
  };
};

/**
 * Predicts Room Temperature Mash pH based on water chemistry and grain bill color.
 * Uses a simplified model of Kolbach / Residual Alkalinity.
 */
export const predictMashPH = (
  waterProfile: WaterProfile,
  fermentables: Fermentable[],
  mashVolumeLiters: number,
  acidAddition?: { type: 'lactic' | 'phosphoric'; concentration: number; volumeMl: number }
): number => {
  if (fermentables.length === 0 || mashVolumeLiters === 0) return 5.8;

  // Residual Alkalinity (RA) = Alkalinity - ((Calcium / 1.4) + (Magnesium / 1.7))
  // Alkalinity is roughly Bicarbonate * 0.82
  const alkalinity = waterProfile.bicarbonate * 0.82;
  let ra = alkalinity - ((waterProfile.calcium / 1.4) + (waterProfile.magnesium / 1.7));

  // Determine total grain weight (kg) and average color (Lovibond)
  const totalWeightKg = fermentables.reduce((acc, f) => acc + f.weight, 0);
  if (totalWeightKg === 0) return 5.8;

  // Apply Acid Addition to reduce Residual Alkalinity before pH calc
  if (acidAddition && acidAddition.volumeMl > 0) {
    // Highly simplified buffering factor for MVP:
    // x mL of 88% lactic acid destroys ~ 11.8 mEq of alkalinity.
    // We convert this roughly to an RA reduction per liter.
    const acidFactor = acidAddition.type === 'lactic' ? 11.8 : 5.0; // Phosphoric is weaker per mL at typical 10% concentration
    const strengthMultiplier = acidAddition.concentration / 100;
    
    const mEqDestroyed = acidAddition.volumeMl * acidFactor * strengthMultiplier;
    const raReduction = (mEqDestroyed * 50) / mashVolumeLiters; // roughly convert back to ppm as CaCO3 equivalent
    
    ra -= raReduction;
  }

  // Weighted average color
  const avgColor = fermentables.reduce((acc, f) => acc + (f.color * f.weight), 0) / totalWeightKg;

  // const thickness = mashVolumeLiters / totalWeightKg;
  
  // Standard Model: Base pH of pale malt is roughly 5.6 - 5.7 at room temp.
  // We use 5.6 as a conservative baseline.
  // RA shift: 100 ppm RA ~ 0.1 pH shift.
  // ra is in ppm as CaCO3.
  const raShift = (ra / 100) * 0.1;
  
  // Color shift: Each Lovibond adds acidity. 
  // ~0.005 per unit is a common approximation for base/mid malts.
  const colorShift = (avgColor * 0.005);
  
  const estimatedPH = 5.6 + raShift - colorShift;

  // console.log(`pH Debug: RA=${ra.toFixed(1)}, AvgColor=${avgColor.toFixed(1)}, raShift=${raShift.toFixed(3)}, colorShift=${colorShift.toFixed(3)}, result=${estimatedPH.toFixed(2)}`);

  return Number(Math.max(4.2, Math.min(6.5, estimatedPH)).toFixed(2));
};

/**
 * Generates an expert-level, ratio-driven narrative for the water profile.
 * Heavily weighted on mineral interplay (Ca:SO4, SO4:Cl, Na:Cl, RA).
 */
export const getWaterNarrative = (profile: WaterProfile) => {
  if (!profile) return { summary: '', description: '', words: { balance: '', intensity: '', body: '', alkalinity: '' } };
  const { calcium, magnesium, sodium, sulfate, chloride, bicarbonate } = profile;
  
  // 0. BLANK CANVAS TRAP
  if (calcium < 5 && sulfate < 5 && chloride < 5) {
    return { 
      summary: 'Blank Canvas', 
      description: 'Pure RO or distilled water lacks the essential minerals required for yeast health and flavor expression. Begin adding minerals to build a profile.',
      words: { balance: 'Neutral', intensity: 'Zero', body: 'None', alkalinity: 'Zero' }
    };
  }

  // 1. ADVANCED RATIO ANALYSIS
  const so4ClRatio = chloride > 0 ? sulfate / chloride : sulfate > 0 ? 10 : 1;
  // const caSo4Ratio = sulfate > 0 ? calcium / sulfate : 2;
  const totalSeasoning = sulfate + chloride;
  const ra = (bicarbonate * 0.82) - ((calcium / 1.4) + (magnesium / 1.7));

  // 2. CONVERT RATIOS TO 10% BLOCKS (0-9 indices)
  const balIdx = Math.min(9, Math.floor(Math.min(so4ClRatio, 4) * 2.5));
  const intIdx = Math.min(9, Math.floor(totalSeasoning / 60)); 
  const strIdx = Math.min(9, Math.floor(calcium / 15)); 
  const acdIdx = Math.min(9, Math.floor(Math.max(0, Math.min(ra + 100, 300)) / 30));

  // 3. SEED MATH CATEGORIES (Stable structural changes)
  const colorCat = ra < 0 ? 0 : ra <= 60 ? 1 : 2; // 0: Pale, 1: Amber, 2: Dark
  const balCat = balIdx <= 2 ? 0 : balIdx <= 4 ? 1 : balIdx <= 7 ? 2 : 3;
  const seed = (balCat * 7) + (colorCat * 3);

  // 4. RATIO-DRIVEN SUMMARY WORDS (Corrected for Brewing Chemistry)
  const summaryWords = {
    flavor: ['Rich', 'Malty', 'Full', 'Smooth', 'Balanced', 'Crisp', 'Dry', 'Hoppy', 'Bitter', 'Assertive'],
    season: ['Very Soft', 'Soft', 'Delicate', 'Mild', 'Moderate', 'Seasoned', 'Firm', 'Pronounced', 'Bold', 'Aggressive'],
    polish: ['Very Thin', 'Thin', 'Light', 'Soft', 'Medium-Light', 'Round', 'Medium-Full', 'Full', 'Heavy', 'Chewy'],
    acidity: ['Very Bright', 'Bright', 'Lively', 'Crisp', 'Balanced', 'Mellow', 'Smooth', 'Buffered', 'Highly Buffered', 'Chalky']
  };

  const words = {
    balance: summaryWords.flavor[balIdx],
    intensity: summaryWords.season[intIdx],
    body: summaryWords.polish[strIdx],
    alkalinity: summaryWords.acidity[acdIdx]
  };
  const summary = `${words.balance} • ${words.intensity} • ${words.body} • ${words.alkalinity}`;

  // 5. COMBINATORIAL DICTIONARY (Grammatically strictly Gerunds and Adjectives)
  const flavorPhrases = [
    ['pushing malt sweetness to the absolute limit', 'saturating the palate with rich maltiness', 'favoring deep malt roundness over any hop bite'],
    ['emphasizing rich malt notes', 'tilting heavily toward a sweet finish', 'prioritizing malt texture over bitterness'],
    ['nudging the malt forward with a gentle touch', 'supporting toasted and caramel grain characters', 'leaning comfortably into malt sweetness'],
    ['providing a subtle, malty foundation', 'softening the edges of the hop character', 'allowing malt roundness to lead the finish'],
    ['striking a perfect equilibrium between grain and hop', 'balancing sweetness and bitterness with precision', 'offering a harmonic split for all-purpose brewing'],
    ['providing a clean, dual-focus backdrop', 'holding malt and hops in perfect equilibrium', 'ensuring both malt and hops have an equal voice'],
    ['sharpening the hops for a refreshing snap', 'lifting hop aromatics just above the malt', 'providing a crisp, dry edge to the finish'],
    ['driving a pronounced and clear hop bitterness', 'elevating hop resins to the forefront', 'centering the experience on hop impact'],
    ['amplifying sharp, lingering bitterness', 'drying out the malt to allow for hop dominance', 'creating a high-definition hop platform'],
    ['pushing extreme bitterness into a sharp attack', 'delivering an unapologetic hop bite', 'maximizing hop sharpness at the expense of malt body']
  ];

  const structurePhrases = [
    ['silky and almost heavy', 'thick and pillowy', 'dense and coating'],
    ['soft and pillowy', 'plush and rounded', 'smooth and approachable'],
    ['softly structured', 'gentle and supportive', 'steady and balanced'],
    ['clean and well-rounded', 'predictable and smooth', 'balanced and medium-bodied'],
    ['structured and even', 'standard and supportive', 'present but controlled'],
    ['capable and high-fidelity', 'crisp and optimized', 'highly transparent'],
    ['distinctly firm', 'snappy and intentional', 'intentional and firm'],
    ['vividly crisp', 'highly structured', 'exceptionally snappy'],
    ['biting and highly crisp', 'sharp and dry', 'piercing and flawless'],
    ['highly astringent', 'aggressive and ultra-dry', 'piercing and clinical']
  ];

  // 6. INTELLIGENT STYLE MATRIX (RA-Based Mapping)
  const styleMatrix = [
    // Pale (RA < 0)
    [intIdx >= 4 ? 'juicy NEIPAs and hazy pales' : 'delicate helles lagers', 'bright golden ales and pales', 'crisp pilsners and West Coast IPAs'],
    // Amber (RA 0-60)
    ['rich Irish reds and bocks', 'classic copper ambers', 'vibrant bitters and red IPAs'],
    // Dark (RA > 60)
    ['sweet imperial stouts', 'robust dark porters', 'shadowy dark ales']
  ];
  const s = styleMatrix[colorCat][Math.min(2, Math.floor(balIdx / 3.5))];

  // 7. NARRATIVE ARCHETYPES
  const f = flavorPhrases[balIdx][(seed + 1) % 3];
  const p = structurePhrases[strIdx][(seed + 2) % 3];
  const inten = words.intensity.toLowerCase();

  let description = '';
  switch (seed % 8) {
    case 0: description = `By ${f}, this profile creates a unique canvas for ${s}—it is ${p} through its ${inten} mineral levels.`; break;
    case 1: description = `A ${inten} setup designed for ${s}, this water acts by ${f}, remaining ${p} on the palate.`; break;
    case 2: description = `When brewing ${s}, this water provides a ${words.body.toLowerCase()} backbone by ${f}, resulting in a ${p} finish.`; break;
    case 3: description = `This is a ${words.body.toLowerCase()} foundation where ${inten} minerals lead, excelling at ${f} while staying ${p}.`; break;
    case 4: description = `${p.charAt(0).toUpperCase() + p.slice(1)}, this ${inten} profile is tuned for ${s} by ${f}.`; break;
    case 5: description = `Defined by its ${words.body.toLowerCase()} nature, this ${inten} setup works by ${f}, keeping the mouthfeel ${p}.`; break;
    case 6: description = `Aimed at ${s}, you'll find this water ${p} through its ${inten} seasoning, while directly ${f}.`; break;
    case 7: description = `Ideally suited for ${s}, this setup uses ${inten} mineral levels to ${f}, ensuring the glass is ${p}.`; break;
  }

  // 8. CHEMICAL ACCURACY FOOTERS
  const footers: string[] = [];
  if (ra > 50 && sulfate > 100) footers.push("Warning: High sulfate combined with a profile suited for dark malts often creates a harsh, astringent bitterness.");
  if (magnesium > 40) footers.push("Caution: Magnesium above 40ppm can introduce a harsh, sour bitterness.");
  if (sodium > 100) footers.push("Caution: Sodium above 100ppm can taste perceptibly salty or harsh.");
  if (calcium > 5 && calcium < 40) footers.push("Note: Calcium below 40ppm may cause sluggish fermentation and poor yeast flocculation.");

  if (footers.length > 0) {
    description += " " + footers.join(" ");
  }

  return { summary, description, words };
};
